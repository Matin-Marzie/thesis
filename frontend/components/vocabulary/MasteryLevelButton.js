import React, { useState, useRef, useMemo } from 'react';
import { Text, StyleSheet, View, Modal, PanResponder, Vibration, Platform } from 'react-native';
import { MASTERY_LEVELS } from '@/constants/Vocabulary';
import { VOCABULARY_ACTIONS } from '@/hooks/useVocabulary';
import { PRIMARY_COLOR } from '@/constants/App';

// While trying to change the mastery_level:
// We show mastery_level(s) with gradient colors from "white" to "PRIMARY_COLOR".
// "New" having white background, "Mastered" having PRIMARY_COLOR background,
// and the rest levels having interpolated colors in between.
// Interpolate between white and PRIMARY_COLOR based on level
function lerpColor(level, maxLevel) {
     // 0 for level 1, 1 for level 5
    const t = (level - 1) / (maxLevel - 1);
    // white
    const r1 = 255;
    const g1 = 255;
    const b1 = 255;
    // PRIMARY_COLOR
    const r2 = parseInt(PRIMARY_COLOR.slice(1, 3), 16);
    const g2 = parseInt(PRIMARY_COLOR.slice(3, 5), 16);
    const b2 = parseInt(PRIMARY_COLOR.slice(5, 7), 16);

    // https://www.youtube.com/watch?v=YJB1QnEmlTs
    // 1/2 A + 1/2 B
    // t B + (1 - t) A    <=>   tB + A - tA   <=>   A + (B - A)t
    const new_r = Math.round(r1 + (r2 - r1) * t);
    const new_g = Math.round(g1 + (g2 - g1) * t);
    const new_b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${new_r}, ${new_g}, ${new_b})`;
}

const LEVELS = Object.entries(MASTERY_LEVELS).map(([key, label]) => {
    const level = Number(key);
    return {
        level,
        label,
        bgColor: lerpColor(level, Object.keys(MASTERY_LEVELS).length),
    };
}).reverse();

const ITEM_HEIGHT = 40;
const PICKER_WIDTH = 130;

export default function MasteryLevelButton({ masteryLevel, wordId, vocabularyDispatch, onPress }) {
    const [showPicker, setShowPicker] = useState(false);
    const [hoveredLevel, setHoveredLevel] = useState(null);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

    const buttonRef = useRef(null);
    const isLongPress = useRef(false);
    const hoveredLevelRef = useRef(null);
    const pickerAbsoluteY = useRef(0);
    const pickerAbsoluteX = useRef(0);
    const timeoutId = useRef(null);

    // Refs for stable access inside PanResponder (avoids stale closures)
    const wordIdRef = useRef(wordId);
    wordIdRef.current = wordId;
    const dispatchRef = useRef(vocabularyDispatch);
    dispatchRef.current = vocabularyDispatch;
    const onPressRef = useRef(onPress);
    onPressRef.current = onPress;
    const masteryLevelRef = useRef(masteryLevel);
    masteryLevelRef.current = masteryLevel;

    // PanResponder for handling long press and drag to select mastery level
    const panResponder = useMemo(() => {
        const cleanup = () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
                timeoutId.current = null;
            }
            setShowPicker(false);
            setHoveredLevel(null);
            hoveredLevelRef.current = null;
            isLongPress.current = false;
        };

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onShouldBlockNativeResponder: () => true,

            onPanResponderGrant: (evt) => {
                isLongPress.current = false;
                hoveredLevelRef.current = null;
                    isLongPress.current = true;
                    Vibration.vibrate(20);
                    
                    timeoutId.current = setTimeout(() => {
                        buttonRef.current?.measureInWindow((x, y, width, height) => {
                            // min: Don't let the picker go below 575 (where the bottom tab bar starts)
                            // max: Don't let the picker go above 153 (where the header ends)
                            let top = Math.min(575, y + (height - ITEM_HEIGHT) / 2 * ITEM_HEIGHT - 10); // Center picker vertically on button, with a slight upward 10 offset
                            top = Math.max(153, top); // Don't go too high
                            const left = x - PICKER_WIDTH - 2; // 2px gap between button and picker
                            pickerAbsoluteY.current = top;
                            pickerAbsoluteX.current = left;
                            setPickerPosition({ top, left });
                            setShowPicker(true);
                        });
                    }, 500);
            },

            onPanResponderMove: (evt) => {
                if (!isLongPress.current) return;

                const { pageY } = evt.nativeEvent;
                const relativeY = pageY - pickerAbsoluteY.current;
                const index = Math.floor(relativeY / ITEM_HEIGHT);

                if (index >= 0 && index < LEVELS.length) {
                    if (hoveredLevelRef.current !== LEVELS[index].level) {
                        hoveredLevelRef.current = LEVELS[index].level;
                        setHoveredLevel(LEVELS[index].level);
                    }
                } else {
                    if (hoveredLevelRef.current !== null) {
                        hoveredLevelRef.current = null;
                        setHoveredLevel(null);
                    }
                }
            },

            onPanResponderRelease: () => {
                if (isLongPress.current && hoveredLevelRef.current !== null) {
                    dispatchRef.current({
                        type: VOCABULARY_ACTIONS.UPDATE,
                        payload: {
                            wordId: wordIdRef.current,
                            mastery_level: hoveredLevelRef.current,
                        },
                    });
                } else if (!isLongPress.current && onPressRef.current) {
                    onPressRef.current();
                }
                cleanup();
            },

            onPanResponderTerminate: () => {
                cleanup();
            },
        });
    }, []);

    return (
        <View ref={buttonRef} {...panResponder.panHandlers} style={styles.container}>
            <View style={[
                styles.masterLevelChangeButton,
                showPicker && styles.masterLevelChangeButtonActive,
            ]}>
                <Text style={styles.masterLevelChangeButtonText}>
                    {MASTERY_LEVELS[masteryLevel]}
                </Text>
            </View>

            <Modal
                visible={showPicker}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay} pointerEvents="box-none">
                    <View
                        style={[
                            styles.pickerContainer,
                            { top: pickerPosition.top, left: pickerPosition.left },
                        ]}
                        pointerEvents="none"
                    >
                        {LEVELS.map((item) => (
                            <View
                                key={item.level}
                                style={[
                                    styles.pickerItem,
                                    { backgroundColor: item.bgColor },
                                    hoveredLevel === item.level && styles.pickerItemHovered,
                                    masteryLevel === item.level && hoveredLevel !== item.level && styles.pickerItemCurrent,
                                ]}
                            >
                                <Text style={[
                                    styles.pickerItemText,
                                    hoveredLevel === item.level && styles.pickerItemTextHovered,
                                ]}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // No overflow/zIndex needed — picker is in a Modal
    },
    masterLevelChangeButton: {
        width: 68,
        height: 38,
        borderRadius: 16,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    masterLevelChangeButtonActive: {
        backgroundColor: '#0056b3',
    },
    masterLevelChangeButtonText: {
        color: '#fff',
        fontSize: 10,
    },
    modalOverlay: {
        flex: 1,
    },
    pickerContainer: {
        position: 'absolute',
        width: PICKER_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    pickerItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    pickerItemHovered: {
        backgroundColor: '#007bff',
    },
    pickerItemCurrent: {
        
    },
    pickerItemText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    pickerItemTextHovered: {
        color: '#fff',
        fontWeight: '700',
    },
});
