import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import type { Reel } from '@/types/dialogue';

// Kept in sync with backend/validation/ReportReelSchema.js's REPORT_REASONS.
export const REPORT_REASONS: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'spam', label: 'Spam', icon: 'megaphone-outline' },
  { value: 'nudity_or_sexual_content', label: 'Nudity or sexual content', icon: 'eye-off-outline' },
  { value: 'violence_or_dangerous_content', label: 'Violence or dangerous content', icon: 'warning-outline' },
  { value: 'hate_speech_or_symbols', label: 'Hate speech or symbols', icon: 'flag-outline' },
  { value: 'harassment_or_bullying', label: 'Harassment or bullying', icon: 'sad-outline' },
  { value: 'false_information', label: 'False information', icon: 'alert-circle-outline' },
  { value: 'other', label: 'Something else', icon: 'ellipsis-horizontal-outline' },
];

interface ReportReelBottomSheetModalProps {
  reel: Reel | null;
  onSheetChange?: (index: number) => void;
  onSelectReason: (reel: Reel, reason: string) => void;
}


// Bottom sheet listing report reasons for a reel — opened from
// ReelActionsBottomSheetModal's "Report reel" row once that sheet dismisses.
// Tapping a reason submits it immediately (no separate confirm step), same
// one-tap-per-action convention as the other reel bottom sheets.
export const ReportReelBottomSheetModal = forwardRef<BottomSheetModal, ReportReelBottomSheetModalProps>(
  ({ reel, onSheetChange, onSelectReason }, ref) => {
    const isDark = useColorScheme() === 'dark';
    const snapPoints = useMemo(() => ['60%'], []);
    const [isOpen, setIsOpen] = useState(false);

    const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

    const handleSheetChanges = useCallback((index: number) => {
      setIsOpen(index >= 0);
      onSheetChange?.(index);
    }, [onSheetChange]);

    // Close on the Android hardware/gesture back button instead of
    // navigating away while the sheet is open.
    useEffect(() => {
      if (!isOpen) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
        return true;
      });
      return () => sub.remove();
    }, [isOpen, ref]);

    const handleSelectReason = useCallback((reason: string) => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      if (reel) onSelectReason(reel, reason);
    }, [ref, reel, onSelectReason]);

    return (
      <BottomSheetModal
        index={0}
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
        handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
      >
        <BottomSheetView style={styles.contentContainer}>
          <SafeAreaView edges={['bottom']}>
            <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>Report reel</Text>
            <Text style={[styles.subtitle, isDark && { color: DARK_COLORS.textSecondary }]}>
              Why are you reporting this reel?
            </Text>

            {REPORT_REASONS.map((reason, index) => (
              <React.Fragment key={reason.value}>
                {index > 0 && <View style={[styles.divider, isDark && { backgroundColor: DARK_COLORS.border }]} />}
                <TouchableOpacity style={styles.row} onPress={() => handleSelectReason(reason.value)}>
                  <Ionicons name={reason.icon} size={22} color={isDark ? DARK_COLORS.text : '#333'} />
                  <Text style={[styles.rowText, isDark && { color: DARK_COLORS.text }]}>{reason.label}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ReportReelBottomSheetModal.displayName = 'ReportReelBottomSheetModal';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 14,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
});
