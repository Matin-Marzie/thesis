import React, { useRef, useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '@/constants/App';
import VocabularyListItem from '@/components/vocabulary/VocabularyListItem.js';

const COLORS = {
    correct: '#6aaa64',
};

const COIN_COUNT = 6;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PATHS = [
    { midX: -90, midY:  -30, p1: 0.35 },
    { midX: -45, midY:   35, p1: 0.30 },
    { midX: -10, midY:  -70, p1: 0.45 },
    {  midX: 10, midY:  -70, p1: 0.45 },
    {  midX: 45, midY:   35, p1: 0.30 },
    {  midX: 90, midY:  -30, p1: 0.35 },
];

export default function GameOverModal({
    visible,
    won,
    secretWordItem,
    guessCount,
    maxAttempts,
    onPlayAgain,
    onClose,
    isRTL = false,
    coinTarget,
}) {
    const reward = won ? 5 : 1;
    const rtlText = isRTL ? { writingDirection: 'rtl', textAlign: 'center' } : {};

    const badgeScale   = useRef(new Animated.Value(0)).current;
    const badgeOpacity = useRef(new Animated.Value(1)).current;
    const cardScale    = useRef(new Animated.Value(1)).current;
    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const [collecting, setCollecting] = useState(false);

    const badgeRef  = useRef(null);
    const originRef = useRef({ x: screenWidth / 2, y: screenHeight * 0.8 });
    const [coinsPos, setCoinsPos] = useState(originRef.current);

    const onBadgeLayout = () => {
        badgeRef.current?.measureInWindow((x, y, w, h) => {
            const pos = { x: x + w / 2, y: y + h / 2 };
            originRef.current = pos;
            setCoinsPos(pos);
        });
    };

    const coinAnims = useRef(
        Array.from({ length: COIN_COUNT }, () => ({
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity:    new Animated.Value(0),
        }))
    ).current;

    useEffect(() => {
        if (!visible) return;
        setCollecting(false);
        coinAnims.forEach(c => {
            c.translateX.setValue(0);
            c.translateY.setValue(0);
            c.opacity.setValue(0);
        });
        badgeOpacity.setValue(1);
        badgeScale.setValue(0);
        cardScale.setValue(1);
        overlayOpacity.setValue(1);
        Animated.spring(badgeScale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const handleCollect = () => {
        if (collecting) return;
        setCollecting(true);

        Animated.timing(badgeOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        const { x: ox, y: oy } = originRef.current;

        // Match WordOfWonders approach: measure true center, then tweak the final landing point.
        const targetX = (coinTarget ? coinTarget.x - ox : screenWidth * 0.5 - ox) - 50;
        const targetY = (coinTarget ? coinTarget.y - oy : -(screenHeight * 0.8)) - 12;

        const DURATION = 950;

        const anims = coinAnims.map((coin, i) => {
            const { midX, midY, p1 } = PATHS[i];
            const t1 = DURATION * p1;
            const t2 = DURATION * (1 - p1);

            return Animated.sequence([
                Animated.delay(i * 55),
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(coin.translateX, { toValue: midX,   duration: t1, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.timing(coin.translateX, { toValue: targetX, duration: t2, easing: Easing.in(Easing.cubic),  useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(coin.translateY, { toValue: midY,   duration: t1, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                        Animated.timing(coin.translateY, { toValue: targetY, duration: t2, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(coin.opacity, { toValue: 1, duration: 120,             useNativeDriver: true }),
                        Animated.timing(coin.opacity, { toValue: 1, duration: DURATION - 220,  useNativeDriver: true }),
                        Animated.timing(coin.opacity, { toValue: 0, duration: 100,             useNativeDriver: true }),
                    ]),
                ]),
            ]);
        });

        let finishedCoins = 0;
        const totalCoins = anims.length;

        const closeAfterAllCoins = () => {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(cardScale, { toValue: 1.08, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                    Animated.timing(cardScale, { toValue: 0,    duration: 200, easing: Easing.in(Easing.cubic),  useNativeDriver: true }),
                ]),
                Animated.timing(overlayOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
            ]).start(() => onPlayAgain?.(reward));
        };

        anims.forEach((anim) => {
            anim.start(({ finished }) => {
                if (!finished) return;
                Vibration.vibrate(20);
                finishedCoins += 1;
                if (finishedCoins === totalCoins) closeAfterAllCoins();
            });
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            hardwareAccelerated={false}
        >
            <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
                <Animated.View style={[styles.modalContent, { transform: [{ scale: cardScale }] }]}>
                    <View style={styles.header}>
                        {won ? (
                            <Ionicons name="checkmark-circle" size={60} color={COLORS.correct} />
                        ) : (
                            <Ionicons name="close-circle" size={60} color="#c9b458" />
                        )}
                    </View>

                    <Text style={[styles.title, rtlText]}>
                        {won ? '🎉 You Won!' : '😔 Game Over'}
                    </Text>

                    {won ? (
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsLabel}>Guesses used:</Text>
                            <Text style={styles.statsValue}>{guessCount} / {maxAttempts}</Text>
                        </View>
                    ) : (
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsLabel}>The word was:</Text>
                            <Text style={[styles.secretWord, rtlText]}>{secretWordItem?.written_form}</Text>
                        </View>
                    )}

                    {secretWordItem && (
                        <View style={{ width: '100%', marginBottom: 20 }}>
                            <VocabularyListItem item={secretWordItem} />
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Reward + Collect row */}
                    <View style={styles.rewardRow}>
                        <View ref={badgeRef} onLayout={onBadgeLayout}>
                            <Animated.View style={[styles.rewardBadge, { transform: [{ scale: badgeScale }], opacity: badgeOpacity }]}>
                                <FontAwesome5 name="coins" size={22} color="#FFD700" />
                                <Text style={styles.rewardText}>+{reward}</Text>
                            </Animated.View>
                        </View>

                        <TouchableOpacity
                            style={[styles.playAgainButton, collecting && { opacity: 0.6 }]}
                            onPress={handleCollect}
                            disabled={collecting}
                        >
                            <Text style={styles.buttonText}>Collect</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Coins fly from badge toward coinTarget */}
                <View style={[styles.coinsOrigin, { left: coinsPos.x, top: coinsPos.y }]} pointerEvents="none">
                    {coinAnims.map((coin, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.flyingCoin, {
                                opacity: coin.opacity,
                                transform: [{ translateX: coin.translateX }, { translateY: coin.translateY }],
                            }]}
                        >
                            <FontAwesome5 name="coins" size={18} color="#FFD700" />
                        </Animated.View>
                    ))}
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    statsLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.correct,
    },
    secretWord: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 2,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 4,
    },
    rewardRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 12,
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF8E1',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#FFD700',
    },
    rewardText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E6A800',
    },
    playAgainButton: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 28,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    coinsOrigin: {
        position: 'absolute',
    },
    flyingCoin: {
        position: 'absolute',
    },
});
