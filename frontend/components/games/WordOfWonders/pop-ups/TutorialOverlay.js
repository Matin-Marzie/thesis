/**
 * TutorialOverlay.js
 *
 * Full-screen onboarding overlay shown the first time a user plays Word of Wonders.
 * It demonstrates the core swipe gesture by animating a virtual finger that:
 *   1. Presses down on the first letter (scale shrink + green highlight).
 *   2. Slides across three more letters, drawing a connecting line between each.
 *   3. Releases (finger springs up and fades out, highlights and lines vanish).
 *   4. Pauses briefly, then loops indefinitely until the user dismisses it.
 *
 * Props:
 *   letterCenters  – Array of { x, y } objects in screen coordinates, one per
 *                    letter in the LettersCycle.  Supplied by the parent after
 *                    LettersCycle's first render via the onLetterCentersReady
 *                    callback.  The overlay uses the first DEMO_COUNT entries.
 *   onDismiss      – Called when the user taps "Got it!".  The parent is
 *                    responsible for persisting the "seen" flag to AsyncStorage.
 *   langCode       – The user's native language code ('en' | 'el' | 'fa').
 *                    Controls the instruction text and dismiss-button label,
 *                    and enables RTL text direction for Farsi.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { GREEN, width, height } from '../gameConstants';

// ---------------------------------------------------------------------------
// Localised UI strings
// Keys match the language codes returned by the backend ('en', 'el', 'fa').
// Any unknown code falls back to English at the usage site.
// ---------------------------------------------------------------------------
const STRINGS = {
  en: { instruction: 'Swipe letters to form words', dismiss: 'Got it!' },
  el: { instruction: 'Σύρε γράμματα για να φτιάξεις λέξεις', dismiss: 'Κατάλαβα!' },
  fa: { instruction: 'حروف را بکشید تا کلمه بسازید', dismiss: 'متوجه شدم!' },
};

// ---------------------------------------------------------------------------
// SVG line support
// react-native-svg is a native module and unavailable in the web build.
// We lazy-require it only on native and wrap the Line primitive in
// Animated.createAnimatedComponent so its `opacity` prop can be driven by
// an Animated.Value without dropping off the native thread.
// ---------------------------------------------------------------------------
let Svg = null;
let AnimatedLine = null;
if (Platform.OS !== 'web') {
  const SvgModule = require('react-native-svg');
  Svg = SvgModule.default || SvgModule.Svg;
  const Line = SvgModule.Line;
  // Wrapping Line here (module scope) avoids recreating the animated component
  // on every render, which would break the animation driver registration.
  AnimatedLine = Animated.createAnimatedComponent(Line);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Diameter in pixels of the fingertip circle. */
const FINGER_SIZE = 44;

/** Number of letters visited in one demonstration gesture. */
const DEMO_COUNT = 4;

/**
 * Selects four non-sequential letter positions spread across the semicircle,
 * producing a realistic cross-circle swipe rather than a dull left-to-right
 * slide through consecutive positions.
 *
 * The indices are sampled at roughly 0 %, 55 %, 25 %, and 75 % of the total
 * letter count, so the pattern adapts to any level (4–8 letters) and always
 * creates a visually interesting zig-zag path across the arc.
 *
 * Example paths:
 *   4 letters  → indices [0, 2, 1, 3]
 *   6 letters  → indices [0, 3, 1, 4]
 *   8 letters  → indices [0, 4, 2, 6]
 *
 * Returns null if the centers array has fewer than DEMO_COUNT entries.
 */
const getDemoPoints = (centers) => {
  const n = centers.length;
  if (n < DEMO_COUNT) return null;

  const indices = [
    0,
    Math.min(Math.floor(n * 0.55), n - 1),
    Math.min(Math.floor(n * 0.25), n - 1),
    Math.min(Math.floor(n * 0.75), n - 1),
  ];

  return indices.map(i => centers[i]);
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TutorialOverlay({ letterCenters, onDismiss, langCode = 'en' }) {
  // Resolve localised strings; fall back to English for any unsupported code.
  const strings = STRINGS[langCode] ?? STRINGS.en;

  // Farsi is the only RTL language in the supported set.
  const isRTL = langCode === 'fa';

  // -------------------------------------------------------------------------
  // Animated values — all driven on the native thread (useNativeDriver: true)
  // to keep the animation smooth even when the JS thread is busy.
  // -------------------------------------------------------------------------

  /**
   * 2-D position of the fingertip in absolute screen coordinates.
   * Used as translateX / translateY in the finger view's transform.
   * The view itself is anchored at (left: -FINGER_SIZE/2, top: -FINGER_SIZE/2)
   * so that adding the letter's { x, y } centres the circle exactly on the
   * letter.
   */
  const fingerPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  /**
   * Opacity of the entire finger view.
   * 0 = invisible (between loop iterations), 1 = fully visible.
   */
  const fingerOpacity = useRef(new Animated.Value(0)).current;

  /**
   * Uniform scale of the finger view.
   * Starts at 1.  Shrinks to 0.80 on press (tactile "pressed" feedback),
   * springs to 1.15 on release, then the view fades out.
   */
  const fingerScale = useRef(new Animated.Value(1)).current;

  /**
   * One Animated.Value per demonstrated letter (DEMO_COUNT total).
   * 0 = letter unhighlighted, 1 = green highlight circle fully visible and
   * scaled up.  Each value also drives a scale interpolation (0.7 → 1.3)
   * to give the highlight a pop-in feel.
   */
  const highlightAnims = useRef(
    Array.from({ length: DEMO_COUNT }, () => new Animated.Value(0))
  ).current;

  /**
   * One Animated.Value per connecting line (DEMO_COUNT - 1 = 3 total).
   * Controls the SVG line opacity: 0 = invisible, 1 = fully drawn.
   * Lines appear progressively as the finger slides from letter to letter.
   */
  const lineAnims = useRef(
    Array.from({ length: DEMO_COUNT - 1 }, () => new Animated.Value(0))
  ).current;

  /**
   * Ref holding the currently running Animated.CompositeAnimation.
   * Stored so the cleanup function can call .stop() and prevent the loop
   * callback from firing after the component unmounts.
   */
  const animRef = useRef(null);

  // -------------------------------------------------------------------------
  // Animation loop
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Guard: we need at least DEMO_COUNT valid letter positions before starting.
    const pts = letterCenters ? getDemoPoints(letterCenters) : null;
    if (!pts) return;

    /**
     * `cancelled` is a closure-captured flag that prevents the loop from
     * scheduling another iteration after the component has unmounted or
     * letterCenters has changed.  Using a plain boolean instead of a ref
     * is safe here because the cleanup function is always synchronous.
     */
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;

      // -----------------------------------------------------------------
      // Phase 0 – Reset all animated values to their initial state so
      // each loop iteration starts from a clean slate.
      // -----------------------------------------------------------------
      fingerPos.setValue({ x: pts[0].x, y: pts[0].y });
      fingerOpacity.setValue(0);
      fingerScale.setValue(1);
      highlightAnims.forEach(a => a.setValue(0));
      lineAnims.forEach(a => a.setValue(0));

      const seq = Animated.sequence([

        // -----------------------------------------------------------------
        // Phase 1 – Press letter 0.
        // The finger fades in, scales down slightly (simulating the physical
        // depression of a key), and the first highlight circle pops in.
        // All three run in parallel so the press feels instantaneous.
        // -----------------------------------------------------------------
        Animated.parallel([
          Animated.timing(fingerOpacity,     { toValue: 1,    duration: 200, useNativeDriver: true }),
          Animated.timing(fingerScale,       { toValue: 0.80, duration: 220, useNativeDriver: true }),
          Animated.timing(highlightAnims[0], { toValue: 1,    duration: 200, useNativeDriver: true }),
        ]),

        // Brief hold so the user can register that the finger is pressed.
        Animated.delay(300),

        // -----------------------------------------------------------------
        // Phase 2 – Slide to letter 1.
        // The finger translates to the second letter's position while:
        //   • the connecting line between letters 0 and 1 fades in, and
        //   • the highlight circle on letter 1 pops in.
        // The scale stays at 0.80 throughout all slides, conveying that
        // the finger remains pressed as it moves.
        // -----------------------------------------------------------------
        Animated.parallel([
          Animated.timing(fingerPos,         { toValue: { x: pts[1].x, y: pts[1].y }, duration: 380, useNativeDriver: true }),
          Animated.timing(lineAnims[0],      { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(highlightAnims[1], { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),

        // -----------------------------------------------------------------
        // Phase 3 – Slide to letter 2 (same pattern as phase 2).
        // -----------------------------------------------------------------
        Animated.parallel([
          Animated.timing(fingerPos,         { toValue: { x: pts[2].x, y: pts[2].y }, duration: 380, useNativeDriver: true }),
          Animated.timing(lineAnims[1],      { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(highlightAnims[2], { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),

        // -----------------------------------------------------------------
        // Phase 4 – Slide to letter 3 (final letter).
        // -----------------------------------------------------------------
        Animated.parallel([
          Animated.timing(fingerPos,         { toValue: { x: pts[3].x, y: pts[3].y }, duration: 380, useNativeDriver: true }),
          Animated.timing(lineAnims[2],      { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(highlightAnims[3], { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),

        // Hold on the last letter so the completed word path is visible.
        Animated.delay(450),

        // -----------------------------------------------------------------
        // Phase 5 – Release.
        // The finger springs up (scale 0.80 → 1.15) and simultaneously fades
        // out together with every highlight circle and connecting line.
        // The spread operator flattens the per-element timing arrays into the
        // single Animated.parallel call.
        // -----------------------------------------------------------------
        Animated.parallel([
          Animated.timing(fingerScale,   { toValue: 1.15, duration: 160, useNativeDriver: true }),
          Animated.timing(fingerOpacity, { toValue: 0,    duration: 300, useNativeDriver: true }),
          ...highlightAnims.map(a => Animated.timing(a, { toValue: 0, duration: 260, useNativeDriver: true })),
          ...lineAnims.map(a    => Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true })),
        ]),

        // Pause before the next loop iteration begins.
        Animated.delay(650),
      ]);

      // Store the composite animation so it can be stopped on cleanup.
      animRef.current = seq;

      // The `finished` flag is false when the animation is interrupted by
      // .stop(), which happens in the cleanup return below.  We only restart
      // the loop when the sequence completed naturally.
      seq.start(({ finished }) => {
        if (finished && !cancelled) loop();
      });
    };

    loop();

    // Cleanup: mark the loop as cancelled and stop any in-progress animation.
    // This runs when letterCenters changes or the component unmounts.
    return () => {
      cancelled = true;
      animRef.current?.stop();
    };
  }, [letterCenters]); // Re-initialise only if the letter positions change.

  // Do not render anything until we have enough letter positions.
  const pts = letterCenters ? getDemoPoints(letterCenters) : null;
  if (!pts) return null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <View style={styles.root}>

      {/* Semi-transparent backdrop that dims the game behind the overlay,
          drawing the user's attention to the animated demonstration. */}
      <View style={styles.backdrop} />

      {/* SVG connecting lines between consecutive selected letters.
          Rendered only on native (react-native-svg is unavailable on web).
          Each line's opacity is driven by its corresponding lineAnims value
          so it fades in as the finger slides to the next letter. */}
      {Platform.OS !== 'web' && Svg && AnimatedLine && (
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          {pts.slice(0, DEMO_COUNT - 1).map((p, i) => (
            <AnimatedLine
              key={i}
              x1={p.x}
              y1={p.y}
              x2={pts[i + 1].x}
              y2={pts[i + 1].y}
              stroke={GREEN}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={lineAnims[i]}
            />
          ))}
        </Svg>
      )}

      {/* Green highlight circles overlaid on each letter.
          Positioned using the letter's absolute screen coordinates (minus
          half the circle's diameter to centre it on the letter).
          pointerEvents="none" ensures these views do not intercept touch
          events that should reach the dismiss button below. */}
      {pts.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              // Centre the 54 px circle on the letter's screen coordinate.
              left: p.x - 27,
              top:  p.y - 27,
              opacity: highlightAnims[i],
              transform: [{
                // Pop-in effect: the circle scales from 70 % to 130 % as it
                // fades in, giving the selection a tactile "snap" feel.
                scale: highlightAnims[i].interpolate({
                  inputRange:  [0, 1],
                  outputRange: [0.7, 1.3],
                }),
              }],
            },
          ]}
        />
      ))}

      {/* Animated finger (fingertip circle).
          The view is anchored at (left: -FINGER_SIZE/2, top: -FINGER_SIZE/2)
          so that translating it to a letter's { x, y } centres the circle
          exactly over that letter without requiring non-native left/top
          animation.  pointerEvents="none" keeps it non-interactive. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -(FINGER_SIZE / 2),
          top:  -(FINGER_SIZE / 2),
          width:  FINGER_SIZE,
          height: FINGER_SIZE,
          opacity: fingerOpacity,
          transform: [
            { translateX: fingerPos.x },
            { translateY: fingerPos.y },
            // Scale applied last so it expands/contracts around the centre
            // of the already-translated position.
            { scale: fingerScale },
          ],
        }}
      >
        {/* Two-layer design: a translucent outer ring (press halo) wraps
            a solid inner dot (the fingertip itself). */}
        <View style={styles.fingerOuter}>
          <View style={styles.fingerInner} />
        </View>
      </Animated.View>

      {/* Instruction label and dismiss button.
          Positioned in the vertical gap between the crossword grid and the
          letter cycle so they are always visible and never overlap the
          animated elements. */}
      <View style={styles.footer}>
        {/* writingDirection: 'rtl' is applied for Farsi so the text flows
            correctly without needing a separate RTL layout pass. */}
        <Text style={[styles.instruction, isRTL && styles.rtlText]}>
          {strings.instruction}
        </Text>

        {/* Tapping this button calls onDismiss in the parent, which persists
            the "tutorial seen" flag to AsyncStorage and unmounts this overlay. */}
        <TouchableOpacity style={styles.gotItBtn} onPress={onDismiss} activeOpacity={0.85}>
          <Text style={styles.gotItText}>{strings.dismiss}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  /**
   * Root container fills the entire screen and sits above all game UI
   * (zIndex 200 exceeds the highest game element at zIndex 10).
   */
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },

  /** Darkens the game content behind the overlay without hiding it entirely. */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  /**
   * Green circle that appears on a letter when the animated finger reaches it.
   * Sized at 54 px (slightly larger than the 50 px letter circles) so it
   * visually "wraps" the letter.
   */
  highlight: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: GREEN,
  },

  /** Translucent halo ring around the fingertip — simulates the press glow
   *  that appears when a physical finger contacts a touchscreen. */
  fingerOuter: {
    width: FINGER_SIZE,
    height: FINGER_SIZE,
    borderRadius: FINGER_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Solid inner dot representing the fingertip contact point. */
  fingerInner: {
    width:  FINGER_SIZE * 0.6,
    height: FINGER_SIZE * 0.6,
    borderRadius: (FINGER_SIZE * 0.6) / 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 8,
  },

  /**
   * Footer container placed at 50 % of the screen height — in the gap
   * between the crossword grid (top ~5 %–40 %) and the letter cycle
   * (bottom ~67 %–95 %).  This ensures the text and button are always
   * visible regardless of grid size.
   */
  footer: {
    position: 'absolute',
    top: height * 0.50,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },

  /** Instruction text — white with a drop shadow for legibility over the
   *  semi-transparent game background. */
  instruction: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 28,
  },

  /** Applied on top of `instruction` when the user's native language is
   *  Farsi, enabling right-to-left text rendering. */
  rtlText: {
    writingDirection: 'rtl',
  },

  gotItBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 40,
    paddingVertical: 13,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },

  gotItText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
