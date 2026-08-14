import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    Easing,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView, FlatList } from 'react-native-gesture-handler';
import { GREEN, height as screenHeight } from '../gameConstants';
import { popupStyles } from './popupStyles';
import VocabularyListItem from '../../../vocabulary/VocabularyListItem';
import { useVibration } from '@/hooks/useVibration';
import TouchableOpacity from '@/components/TouchableOpacity';

const COIN_COUNT = 6;

// Same paths as FinishScreen's coin-collect animation, for a consistent feel.
// Each entry: midX (px right of origin), midY (px down from origin), p1
// (fraction of DURATION spent reaching midpoint). Negative midY = upward.
const PATHS = [
    { midX: -90, midY:  -30, p1: 0.35 },
    { midX: -45, midY:   35, p1: 0.30 },
    { midX: -10, midY:  -70, p1: 0.45 },
    {  midX: 10, midY:  -70, p1: 0.45 },
    {  midX: 45, midY:   35, p1: 0.30 },
    {  midX: 90, midY:  -30, p1: 0.35 },
];

export default function ExtraWordsPopup({
    visible,
    onClose,
    extraWords = [],
    dictionarySet = {},
    score = 0,
    progress = 0,
    batchSize = 10,
    reward = 10,
    coinTarget,
    onCollect,
}) {
    const vibrate = useVibration();
    const [collecting, setCollecting] = useState(false);

    const chipRef = useRef(null);
    const originRef = useRef({ x: screenHeight * 0.8, y: screenHeight * 0.8 });
    const [coinsPos, setCoinsPos] = useState(originRef.current);

    const onChipLayout = () => {
        chipRef.current?.measureInWindow((x, y, w, h) => {
            const pos = { x: x + w / 2, y: y + h / 2 };
            originRef.current = pos;
            setCoinsPos(pos);
        });
    };

    const coinAnims = useRef(
        Array.from({ length: COIN_COUNT }, () => ({
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }))
    ).current;

    const extraWordItems = useMemo(() => {
        if (!extraWords.length) return [];
        // extraWords arrives in the order words were found (oldest first) -
        // reverse so the most recently found word shows at the top of the list.
        return [...extraWords].reverse().flatMap((word) => dictionarySet[word] ?? []);
    }, [extraWords, dictionarySet]);

    const canCollect = progress >= batchSize && !collecting;
    const fillPercent = Math.min(100, (progress / batchSize) * 100);

    const handleCollectPress = () => {
        if (!canCollect) return;
        setCollecting(true);

        // Unlike FinishScreen (which resets these in a useEffect keyed off
        // the modal re-opening), this popup can stay mounted across several
        // collects in a row - reset each coin back to the origin before
        // every flight, or a repeat collect would animate from wherever the
        // previous flight left off instead of from the reward chip again.
        coinAnims.forEach((coin) => {
            coin.translateX.setValue(0);
            coin.translateY.setValue(0);
            coin.opacity.setValue(0);
        });

        // Coins fly from the reward chip toward the header coin counter -
        // same animation shape as FinishScreen's level-complete Collect.
        const { x: ox, y: oy } = originRef.current;
        const targetX = (coinTarget ? coinTarget.x - ox : 0) - 50;
        const targetY = (coinTarget ? coinTarget.y - oy : -(screenHeight * 0.38)) - 12;

        const DURATION = 950;

        const anims = coinAnims.map((coin, i) => {
            const { midX, midY, p1 } = PATHS[i];
            const t1 = DURATION * p1;
            const t2 = DURATION * (1 - p1);

            return Animated.sequence([
                Animated.delay(i * 55),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(coin.translateX, {
                            toValue: midX,
                            duration: t1,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                        Animated.timing(coin.translateX, {
                            toValue: targetX,
                            duration: t2,
                            easing: Easing.in(Easing.cubic),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(coin.translateY, {
                            toValue: midY,
                            duration: t1,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(coin.translateY, {
                            toValue: targetY,
                            duration: t2,
                            easing: Easing.in(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(coin.opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
                        Animated.timing(coin.opacity, { toValue: 1, duration: DURATION - 220, useNativeDriver: true }),
                        Animated.timing(coin.opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
                    ]),
                ]),
            ]);
        });

        let finishedCoins = 0;
        const totalCoins = anims.length;

        anims.forEach((anim) => {
            anim.start(({ finished }) => {
                if (!finished) return;
                vibrate(20, { type: 'animation', game: 'wordOfWonders' });
                finishedCoins += 1;
                if (finishedCoins === totalCoins) {
                    onCollect?.();
                    setCollecting(false);
                }
            });
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <TouchableOpacity
                    style={popupStyles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                    game="wordOfWonders"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        noVibrate
                    >
                        <View style={popupStyles.popup}>
                            {/* Header */}
                            <View style={popupStyles.popupHeader}>
                                <View style={popupStyles.placeholder} />
                                <Text style={popupStyles.headerText}>EXTRA WORDS</Text>
                                <TouchableOpacity
                                    style={popupStyles.closeButton}
                                    onPress={onClose}
                                    game="wordOfWonders"
                                >
                                    <FontAwesome5 name="times" size={popupStyles.closeButton.size} style={popupStyles.closeButton} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View style={popupStyles.content}>
                                <Text style={styles.scoreText}>
                                    You found {score} {score === 1 ? 'word' : 'words'} outside the grid!
                                </Text>

                                <FlatList
                                    style={{ flex: 1 }}
                                    data={extraWordItems}
                                    keyExtractor={(item, index) => String(item?.id ?? item?.written_form ?? index)}
                                    renderItem={({ item }) => (
                                        <VocabularyListItem item={item} />
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No extra words yet.</Text>}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                />

                                {/* Collect-every-N-words progress bar */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeaderRow}>
                                        <Text style={styles.progressLabel}>{progress}/{batchSize} to collect</Text>
                                        <View ref={chipRef} onLayout={onChipLayout} style={styles.rewardChip}>
                                            <FontAwesome5 name="coins" size={13} color="#FFD700" />
                                            <Text style={styles.rewardChipText}>+{reward}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${fillPercent}%` }]} />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.collectButton, !canCollect && styles.collectButtonDisabled]}
                                        onPress={handleCollectPress}
                                        disabled={!canCollect}
                                        accessibilityRole="button"
                                        accessibilityLabel="Collect extra words reward"
                                        game="wordOfWonders"
                                    >
                                        <Text style={[styles.collectButtonText, !canCollect && styles.collectButtonTextDisabled]}>
                                            Collect
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Coins fly from the reward chip toward the header coins */}
                <View style={[styles.coinsOrigin, { left: coinsPos.x, top: coinsPos.y }]} pointerEvents="none">
                    {coinAnims.map((coin, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.flyingCoin,
                                {
                                    opacity: coin.opacity,
                                    transform: [
                                        { translateX: coin.translateX },
                                        { translateY: coin.translateY },
                                    ],
                                },
                            ]}
                        >
                            <FontAwesome5 name="coins" size={18} color="#FFD700" />
                        </Animated.View>
                    ))}
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: GREEN,
        padding: 5,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
    progressSection: {
        paddingHorizontal: 5,
        paddingTop: 12,
        paddingBottom: 4,
    },
    progressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    rewardChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF8E1',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    rewardChipText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E6A800',
    },
    progressTrack: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e6e6e6',
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: GREEN,
    },
    collectButton: {
        alignSelf: 'stretch',
        backgroundColor: '#1E9FFC',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    collectButtonDisabled: {
        backgroundColor: '#dcdcdc',
    },
    collectButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    collectButtonTextDisabled: {
        color: '#999',
    },
    coinsOrigin: {
        position: 'absolute',
    },
    flyingCoin: {
        position: 'absolute',
    },
});
