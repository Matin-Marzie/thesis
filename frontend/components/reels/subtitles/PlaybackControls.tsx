import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DARK_COLORS } from '@/constants/App';

interface PlaybackControlsProps {
    isPlaying: boolean;
    isDark: boolean;
    onTogglePlayPause: () => void;
}

export function PlaybackControls({ isPlaying, isDark, onTogglePlayPause }: PlaybackControlsProps) {
    return (
        <View style={styles.controlsRow}>
            <Pressable onPress={onTogglePlayPause} style={[styles.playPauseButton, isDark && { backgroundColor: DARK_COLORS.surface }]}>
                <FontAwesome
                    name={isPlaying ? 'pause' : 'play'}
                    size={16}
                    color={isDark ? DARK_COLORS.text : '#1f2937'}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    controlsRow: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
        alignItems: 'flex-end',
    },
    playPauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#e5e7eb',
        alignSelf: 'flex-end',
    },
});
