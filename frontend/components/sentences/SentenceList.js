import React, { useCallback } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import SentenceListItem from '@/components/sentences/SentenceListItem';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS } from '@/constants/App';

export default function SentenceList({ sentences }) {
    const isDark = useColorScheme() === 'dark';

    const renderSentenceItem = useCallback(
        ({ item }) => <SentenceListItem sentenceId={item.id} entry={item.entry} />,
        []
    );

    return (
        <Animated.FlatList
            data={sentences}
            keyExtractor={(item) => `sentence-${item.id}`}
            renderItem={renderSentenceItem}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, isDark && { color: DARK_COLORS.textSecondary }]}>
                        Sentences you save from reels will show up here.
                    </Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        paddingTop: 48,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});
