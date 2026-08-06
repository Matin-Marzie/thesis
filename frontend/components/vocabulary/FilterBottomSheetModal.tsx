import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';

interface FilterBottomSheetModalProps {
    onSheetChange?: (index: number) => void;
}

const CustomBackdrop = ({ style }) => (
    <View
        style={[
            style,
            {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
        ]}
    />
);

const FilterBottomSheetModal = forwardRef<BottomSheetModal, FilterBottomSheetModalProps>(
    ({ onSheetChange }, ref) => {
        const isDark = useColorScheme() === 'dark';
        const snapPoints = useMemo(() => ['50%'], []);
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

        return (
            <BottomSheetModal
                index={1} // keep it 1, gorhom/bottom-sheets create snapPoint 0 automatically
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                onChange={handleSheetChanges}
                backdropComponent={CustomBackdrop}
                backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
                handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>Filter Words</Text>
                    <Text style={[styles.text, isDark && { color: DARK_COLORS.textSecondary }]}>Filter options coming soon...</Text>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

FilterBottomSheetModal.displayName = 'FilterBottomSheetModal';

export default FilterBottomSheetModal;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    text: {
        fontSize: 16,
        color: '#666',
    },
});
