import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

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
        const snapPoints = useMemo(() => ['50%'], []);

        const handleSheetChanges = useCallback((index) => {
            // Do nothing
        }, [onSheetChange]);

        return (
            <BottomSheetModal
                index={1} // keep it 1, gorhom/bottom-sheets create snapPoint 0 automatically
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                onChange={handleSheetChanges}
                backdropComponent={CustomBackdrop}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text style={styles.title}>Filter Words</Text>
                    <Text style={styles.text}>Filter options coming soon...</Text>
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
