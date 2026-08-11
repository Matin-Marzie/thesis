import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';
import type { Reel } from '@/types/dialogue';

interface ReelOptionsBottomSheetModalProps {
  reel: Reel | null;
  onSheetChange?: (index: number) => void;
  onDelete: (reel: Reel) => void;
  onEditTitle: (reel: Reel) => void;
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

// Bottom sheet with reel-management actions (edit / delete), opened from the
// "More options" button in the profile reel viewer.
export const ReelOptionsBottomSheetModal = forwardRef<BottomSheetModal, ReelOptionsBottomSheetModalProps>(
  ({ reel, onSheetChange, onDelete, onEditTitle }, ref) => {
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

    const handleEditTitle = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      if (reel) onEditTitle(reel);
    }, [ref, reel, onEditTitle]);

    const handleDelete = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      if (reel) onDelete(reel);
    }, [ref, reel, onDelete]);

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
            <TouchableOpacity style={styles.row} onPress={handleEditTitle}>
              <Ionicons name="create-outline" size={22} color={isDark ? DARK_COLORS.text : '#333'} />
              <Text style={[styles.rowText, isDark && { color: DARK_COLORS.text }]}>Edit title</Text>
            </TouchableOpacity>

            <View style={[styles.divider, isDark && { backgroundColor: DARK_COLORS.border }]} />

            <TouchableOpacity style={styles.row} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#ff3b30" />
              <Text style={[styles.rowText, styles.destructiveText]}>Delete reel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ReelOptionsBottomSheetModal.displayName = 'ReelOptionsBottomSheetModal';

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
