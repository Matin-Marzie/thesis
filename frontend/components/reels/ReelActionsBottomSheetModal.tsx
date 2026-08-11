import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import type { Reel } from '@/types/dialogue';

interface ReelActionsBottomSheetModalProps {
  reel: Reel | null;
  isSaved: boolean;
  onSheetChange?: (index: number) => void;
  onToggleSave: (reel: Reel) => void;
  onReport: (reel: Reel) => void;
}

const CustomBackdrop = ({ style }: any) => (
  <View
    style={[
      style,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    ]}
  />
);

// Bottom sheet with actions for a reel in the main feed (save / report),
// opened from the "More options" button — distinct from the reel-management
// sheet used on the profile owner's own reels.
export const ReelActionsBottomSheetModal = forwardRef<BottomSheetModal, ReelActionsBottomSheetModalProps>(
  ({ reel, isSaved, onSheetChange, onToggleSave, onReport }, ref) => {
    const isDark = useColorScheme() === 'dark';
    const snapPoints = useMemo(() => ['30%'], []);
    const [isOpen, setIsOpen] = useState(false);

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

    const handleToggleSave = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      if (reel) onToggleSave(reel);
    }, [ref, reel, onToggleSave]);

    const handleReport = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      if (reel) onReport(reel);
    }, [ref, reel, onReport]);

    return (
      <BottomSheetModal
        index={0}
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backdropComponent={CustomBackdrop}
        backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
        handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
      >
        <BottomSheetView style={styles.contentContainer}>
          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity style={styles.row} onPress={handleToggleSave}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isDark ? DARK_COLORS.text : '#333'}
              />
              <Text style={[styles.rowText, isDark && { color: DARK_COLORS.text }]}>
                {isSaved ? 'Saved' : 'Save reel'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, isDark && { backgroundColor: DARK_COLORS.border }]} />

            <TouchableOpacity style={styles.row} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color="#ff3b30" />
              <Text style={[styles.rowText, styles.destructiveText]}>Report reel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ReelActionsBottomSheetModal.displayName = 'ReelActionsBottomSheetModal';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
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
  destructiveText: {
    color: '#ff3b30',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
});
