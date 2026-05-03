import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { popupStyles } from '../../WordOfWonders/pop-ups/popupStyles';

const TILE_COLORS = {
    green: '#6aaa64',
    yellow: '#c9b458',
    gray: '#787c7e',
};

const TRANSLATIONS = {
    en: {
        title: 'How to Play',
        gameRules: 'Game Rules',
        rules: [
            'Guess the word in 6 attempts.',
            'Each guess must be a valid word.',
            'After each guess, the tile colors will change to show how close your guess was.',
        ],
        colorGuide: 'Color Guide',
        isRTL: false,
        examples: [
            {
                word: ['H', 'E', 'L', 'L', 'O'],
                highlightIndex: 0,
                color: 'green',
                colorName: 'Green',
                desc: 'H is in the word and in the correct spot.',
            },
            {
                word: ['W', 'O', 'R', 'L', 'D'],
                highlightIndex: 1,
                color: 'yellow',
                colorName: 'Yellow',
                desc: 'O is in the word but in the wrong spot.',
            },
            {
                word: ['C', 'R', 'A', 'N', 'E'],
                highlightIndex: 4,
                color: 'gray',
                colorName: 'Gray',
                desc: 'E is not in the word in any spot.',
            },
        ],
    },
    el: {
        title: 'Πώς να Παίξετε',
        gameRules: 'Κανόνες του Παιχνιδιού',
        rules: [
            'Μαντέψτε τη λέξη σε 6 προσπάθειες.',
            'Κάθε προσπάθεια πρέπει να είναι έγκυρη λέξη.',
            'Μετά από κάθε προσπάθεια, τα χρώματα των πλακιδίων θα αλλάξουν για να δείξουν πόσο κοντά ήταν η απάντησή σας.',
        ],
        colorGuide: 'Οδηγός Χρωμάτων',
        isRTL: false,
        examples: [
            {
                word: ['Α', 'Ρ', 'Χ', 'Η', 'Σ'],
                highlightIndex: 0,
                color: 'green',
                colorName: 'Πράσινο',
                desc: 'Το γράμμα Α είναι στη λέξη και στη σωστή θέση.',
            },
            {
                word: ['Β', 'Α', 'Θ', 'Ο', 'Σ'],
                highlightIndex: 1,
                color: 'yellow',
                colorName: 'Κίτρινο',
                desc: 'Το γράμμα Α είναι στη λέξη αλλά σε λάθος θέση.',
            },
            {
                word: ['Γ', 'Λ', 'Υ', 'Κ', 'Ο'],
                highlightIndex: 2,
                color: 'gray',
                colorName: 'Γκρι',
                desc: 'Το γράμμα Υ δεν υπάρχει πουθενά στη λέξη.',
            },
        ],
    },
    fa: {
        title: 'چگونه بازی کنیم',
        gameRules: 'قوانین بازی',
        rules: [
            'کلمه را در ۶ تلاش حدس بزنید.',
            'هر حدس باید یک کلمه معتبر باشد.',
            'پس از هر حدس، رنگ کاشی‌ها تغییر می‌کند تا نشان دهد حدس شما چقدر نزدیک بوده است.',
        ],
        colorGuide: 'راهنمای رنگ',
        isRTL: true,
        examples: [
            {
                word: ['ب', 'ا', 'ز', 'ا', 'ر'],
                highlightIndex: 0,
                color: 'green',
                colorName: 'سبز',
                desc: 'حرف ب در کلمه و در جای درست قرار دارد.',
            },
            {
                word: ['خ', 'و', 'ر', 'د', 'ن'],
                highlightIndex: 2,
                color: 'yellow',
                colorName: 'زرد',
                desc: 'حرف ر در کلمه وجود دارد اما در جای اشتباه است.',
            },
            {
                word: ['ا', 'ی', 'ر', 'ا', 'ن'],
                highlightIndex: 4,
                color: 'gray',
                colorName: 'خاکستری',
                desc: 'حرف ن در هیچ جای کلمه وجود ندارد.',
            },
        ],
    },
};

function TileRow({ letters, highlightIndex, color, isRTL }) {
    const displayed = isRTL ? [...letters].reverse() : letters;
    const adjustedIndex = isRTL ? letters.length - 1 - highlightIndex : highlightIndex;

    return (
        <View style={styles.tileRow}>
            {displayed.map((letter, i) => {
                const highlighted = i === adjustedIndex;
                return (
                    <View
                        key={i}
                        style={[
                            styles.tile,
                            highlighted
                                ? { backgroundColor: TILE_COLORS[color], borderColor: TILE_COLORS[color] }
                                : styles.tileEmpty,
                        ]}
                    >
                        <Text style={[styles.tileLetter, highlighted && styles.tileLetterLight]}>
                            {letter}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

export default function WordleInfoPopup({ visible, onClose, nativeLanguage = 'en' }) {
    const t = TRANSLATIONS[nativeLanguage] || TRANSLATIONS.en;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View style={popupStyles.overlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <Animated.View style={popupStyles.popup}>
                        <View style={popupStyles.popupHeader}>
                            <View style={popupStyles.placeholder} />
                            <Text style={popupStyles.headerText}>{t.title}</Text>
                            <TouchableOpacity style={popupStyles.closeButton} onPress={onClose}>
                                <FontAwesome5
                                    name="times"
                                    size={popupStyles.closeButton.size}
                                    style={popupStyles.closeButton}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ flex: 1 }}
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={[styles.sectionTitle, t.isRTL && styles.rtl]}>
                                {t.gameRules}
                            </Text>
                            {t.rules.map((rule, i) => (
                                <View key={i} style={[styles.ruleRow, t.isRTL && styles.ruleRowRTL]}>
                                    <Text style={styles.ruleBullet}>{'•'}</Text>
                                    <Text style={[styles.ruleItem, t.isRTL && styles.rtl]}>{rule}</Text>
                                </View>
                            ))}

                            <View style={styles.divider} />

                            <Text style={[styles.sectionTitle, t.isRTL && styles.rtl]}>
                                {t.colorGuide}
                            </Text>

                            {t.examples.map((ex, i) => (
                                <View key={i} style={[styles.exampleBlock, t.isRTL && styles.exampleBlockRTL]}>
                                    <TileRow
                                        letters={ex.word}
                                        highlightIndex={ex.highlightIndex}
                                        color={ex.color}
                                        isRTL={t.isRTL}
                                    />
                                    <Text style={[styles.colorLabel, t.isRTL && styles.rtl]}>
                                        <Text style={{ color: TILE_COLORS[ex.color], fontWeight: '700' }}>
                                            {ex.colorName}
                                        </Text>
                                        {'  '}{ex.desc}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        marginHorizontal: 15,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 15,
        marginBottom: 4,
    },
    ruleRowRTL: {
        flexDirection: 'row-reverse',
    },
    ruleBullet: {
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
        marginHorizontal: 5,
    },
    ruleItem: {
        flex: 1,
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
    },
    rtl: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 15,
        marginVertical: 12,
    },
    exampleBlock: {
        marginHorizontal: 15,
        marginBottom: 18,
    },
    exampleBlockRTL: {
        alignItems: 'flex-end',
    },
    tileRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 6,
    },
    tile: {
        width: 38,
        height: 38,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tileEmpty: {
        backgroundColor: '#fff',
        borderColor: '#d3d6da',
    },
    tileLetter: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    tileLetterLight: {
        color: '#fff',
    },
    colorLabel: {
        fontSize: 13,
        color: '#555',
        lineHeight: 19,
        marginHorizontal: 2,
    },
});
