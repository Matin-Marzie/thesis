import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';
import TouchableOpacity from '@/components/TouchableOpacity';

interface ProfilePictureOptionsSheetProps {
  onChoosePhoto: () => void;
  onRemovePhoto: () => void;
}

// Bottom sheet with profile-picture actions (choose / remove), opened from
// the pencil badge on the profile screen's avatar.
export const ProfilePictureOptionsSheet = forwardRef<BottomSheetModal, ProfilePictureOptionsSheetProps>(
  ({ onChoosePhoto, onRemovePhoto }, ref) => {
    const isDark = useColorScheme() === 'dark';
    const snapPoints = useMemo(() => ['30%'], []);
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
    }, []);

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

    const handleChoosePhoto = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      onChoosePhoto();
    }, [ref, onChoosePhoto]);

    const handleRemovePhoto = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
      onRemovePhoto();
    }, [ref, onRemovePhoto]);

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
            <Text style={[styles.title, isDark && { color: DARK_COLORS.textSecondary }]}>Profile picture</Text>

            <TouchableOpacity style={styles.row} onPress={handleChoosePhoto}>
              <Ionicons name="image-outline" size={22} color={isDark ? DARK_COLORS.text : '#333'} />
              <Text style={[styles.rowText, isDark && { color: DARK_COLORS.text }]}>Choose new photo</Text>
            </TouchableOpacity>

            <View style={[styles.divider, isDark && { backgroundColor: DARK_COLORS.border }]} />

            <TouchableOpacity style={styles.row} onPress={handleRemovePhoto}>
              <Ionicons name="trash-outline" size={22} color="#ff3b30" />
              <Text style={[styles.rowText, styles.destructiveText]}>Remove current photo</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ProfilePictureOptionsSheet.displayName = 'ProfilePictureOptionsSheet';

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  destructiveText: {
    color: '#ff3b30',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
});
