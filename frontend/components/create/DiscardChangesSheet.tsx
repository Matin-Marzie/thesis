import React, { forwardRef, useCallback } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';

interface DiscardChangesSheetProps {
  title?: string;
  message?: string;
  onDiscard: () => void;
  onKeepEditing?: () => void;
}

const SNAP_POINTS = ['32%'];

export const DiscardChangesSheet = forwardRef<BottomSheetModal, DiscardChangesSheetProps>(
  ({ title = 'Discard changes?', message = "You'll lose what you've entered so far.", onDiscard, onKeepEditing }, ref) => {
    const isDark = useColorScheme() === 'dark';

    const handleKeepEditing = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      onKeepEditing?.();
    }, [ref, onKeepEditing]);

    const handleDiscard = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      onDiscard();
    }, [ref, onDiscard]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={1} // keep it 1, gorhom/bottom-sheets create snapPoint 0 automatically (see FilterBottomSheetModal)
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
        handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
      >
        <SafeAreaView edges={['bottom']} style={styles.content}>
          <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>{title}</Text>
          <Text style={[styles.message, isDark && { color: DARK_COLORS.textSecondary }]}>{message}</Text>
          <Pressable style={styles.discardButton} onPress={handleDiscard}>
            <Text style={styles.discardButtonText}>Discard Changes</Text>
          </Pressable>
          <Pressable style={styles.keepEditingButton} onPress={handleKeepEditing}>
            <Text style={[styles.keepEditingButtonText, isDark && { color: DARK_COLORS.text }]}>Keep Editing</Text>
          </Pressable>
        </SafeAreaView>
      </BottomSheetModal>
    );
  }
);

DiscardChangesSheet.displayName = 'DiscardChangesSheet';

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', marginBottom: 24 },
  discardButton: {
    backgroundColor: '#c0392b',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  discardButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  keepEditingButton: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  keepEditingButtonText: { color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 16 },
});
