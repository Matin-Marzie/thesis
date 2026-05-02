import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, Dimensions, SectionList, Vibration } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { popupStyles } from './popupStyles';
import { GREEN } from '../gameConstants';
import VocabularyListItem from '../../../vocabulary/VocabularyListItem';

const COIN_COUNT = 6;
const REWARD = 10;
const { height: screenHeight } = Dimensions.get('window');

// Each entry: midX (px right of origin), midY (px down from origin), p1 (fraction of DURATION spent reaching midpoint)
// Negative midY = upward, positive = downward dip
const PATHS = [
    { midX: -90, midY:  -30, p1: 0.35 }, // hard left, slight rise
    { midX: -45, midY:   35, p1: 0.30 }, // medium left, dip down first
    { midX: -10, midY:  -70, p1: 0.45 }, // slight left, shoots up early
    {  midX: 10, midY:  -70, p1: 0.45 }, // slight right, shoots up early
    {  midX: 45, midY:   35, p1: 0.30 }, // medium right, dip down first
    {  midX: 90, midY:  -30, p1: 0.35 }, // hard right, slight rise
];

export default function FinishScreen({ visible = false, onCollect, coinTarget, gridWords = {}, dictionarySet = {} }) {
    const badgeScale = useRef(new Animated.Value(0)).current;
    const badgeOpacity = useRef(new Animated.Value(1)).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const [collecting, setCollecting] = useState(false);

    const badgeRef = useRef(null);
    const originRef = useRef({ x: screenHeight * 0.8, y: screenHeight * 0.8 });
    const [coinsPos, setCoinsPos] = useState(originRef.current);

    const onBadgeLayout = () => {
        badgeRef.current?.measureInWindow((x, y, width, height) => {
            const pos = { x: x + width / 2, y: y + height / 2 };
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

    const foundWords = Object.keys(gridWords).filter(w => gridWords[w].isFound);
    const foundWordItems = foundWords
        .map((word) => {
            const items = dictionarySet[word] ?? [];
            if (!items.length) return null;

            const dictionaryId = gridWords[word]?.DictionaryId;
            if (dictionaryId != null) {
                const match = items.find((item) => item?.id === dictionaryId);
                if (match) return match;
            }

            return items[0];
        })
        .filter(Boolean);

    const sections = [
        { title: `Found  ${foundWords.length}/${Object.keys(gridWords).length}`, data: foundWordItems },
    ];

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

        // Target offset relative to coinsOrigin (measured badge center)
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
                    // X: each coin arcs to its own midX, then converges on target
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
                    // Y: each coin has unique vertical detour, then converges on target
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
                    // Opacity: fade in → hold → snap out on arrival
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

        const closeAfterAllCoins = () => {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(cardScale, {
                        toValue: 1.08,
                        duration: 120,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(cardScale, {
                        toValue: 0,
                        duration: 200,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]).start(() => onCollect?.());
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

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={() => { }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
            <Animated.View style={[popupStyles.overlay, { opacity: overlayOpacity }]}>
                <Animated.View style={[popupStyles.popup, styles.popup, { transform: [{ scale: cardScale }] }]}>

                    {/* Header */}
                    <View style={popupStyles.popupHeader}>
                        <View style={popupStyles.placeholder} />
                        <Text style={popupStyles.headerText}>LEVEL COMPLETE</Text>
                        <View style={popupStyles.placeholder} />
                    </View>

                    {/* Word list */}
                    <SectionList
                        style={styles.list}
                        sections={sections}
                        keyExtractor={(item, index) => String(item?.id ?? item?.written_form ?? index)}
                        renderSectionHeader={({ section }) => (
                            <View style={[styles.sectionHeader, section.missed && styles.sectionHeaderMissed]}>
                                <Text style={[styles.sectionHeaderText, section.missed && styles.sectionHeaderTextMissed]}>
                                    {section.title}
                                </Text>
                            </View>
                        )}
                        renderItem={({ item, section }) => (
                            <View style={section.missed ? styles.missedRow : undefined}>
                                <VocabularyListItem item={item} />
                            </View>
                        )}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.divider} />

                    {/* Reward + Collect row */}
                    <View style={styles.rewardRow}>
                        <View ref={badgeRef} onLayout={onBadgeLayout}>
                            <Animated.View
                                style={[
                                    styles.rewardBadge,
                                    { transform: [{ scale: badgeScale }], opacity: badgeOpacity },
                                ]}
                            >
                                <FontAwesome5 name="coins" size={22} color="#FFD700" />
                                <Text style={styles.rewardText}>+{REWARD}</Text>
                            </Animated.View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, collecting && { opacity: 0.6 }]}
                            onPress={handleCollect}
                            disabled={collecting}
                            accessibilityRole="button"
                        >
                            <Text style={styles.actionText}>Collect</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Coins fly from badge center toward the header coins */}
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
            </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    popup: {
        height: screenHeight * 0.70,
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
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
    actionButton: {
        backgroundColor: '#1E9FFC',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 28,
    },
    actionText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 0,
    },
    list: {
        flex: 1,
    },
    sectionHeader: {
        backgroundColor: '#f0faf0',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#d4ecd4',
    },
    sectionHeaderMissed: {
        backgroundColor: '#fafafa',
        borderBottomColor: '#e0e0e0',
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: GREEN,
        letterSpacing: 0.3,
    },
    sectionHeaderTextMissed: {
        color: '#999',
    },
    missedRow: {
        opacity: 0.5,
    },
    coinsOrigin: {
        position: 'absolute',
    },
    flyingCoin: {
        position: 'absolute',
    },
});
