import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import TouchableOpacity from '@/components/TouchableOpacity';
import { useColorScheme } from '@/components/useColorScheme';
import { DARK_COLORS, PRIMARY_COLOR } from '@/constants/App';
import { LANGUAGES_META } from '@/constants/SupportedLanguages';
import { PROFICIENCY_LEVELS } from '@/constants/Vocabulary';
import { useProgress } from '@/context/ProgressContext';
import { useNetwork } from '@/context/NetworkContext';
import { useAuth } from '@/context/AuthContext';
import { useVocabularyContext } from '@/context/VocabularyContext';
import { VOCABULARY_ACTIONS, DEFAULT_VOCABULARY_CHANGES } from '@/hooks/useVocabulary';
import { switchCurrentLanguage } from '@/api/user';

const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
    />
);

const getLanguageMeta = (languageId) =>
    Object.values(LANGUAGES_META).find((l) => l.id === Number(languageId));

// One segment per proficiency level, filled up to (and including) the
// language's current level.
const ProficiencyBar = ({ level, isDark }) => {
    const levelIndex = Math.max(0, PROFICIENCY_LEVELS.indexOf(level));

    return (
        <View style={styles.progressBar}>
            {PROFICIENCY_LEVELS.map((l, index) => (
                <View
                    key={l}
                    style={[
                        styles.progressSegment,
                        index <= levelIndex
                            ? { backgroundColor: PRIMARY_COLOR }
                            : isDark && { backgroundColor: DARK_COLORS.border },
                    ]}
                />
            ))}
        </View>
    );
};

const LanguageSwitchSheet = forwardRef<BottomSheetModal>((_props, ref) => {
    const isDark = useColorScheme() === 'dark';
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['50%' ], []);

    const { userProgress, setUserProgress } = useProgress();
    const { isOnline } = useNetwork();
    const { isAuthenticated, forceSync } = useAuth();
    const { vocabularyDispatch, setVocabularyChanges } = useVocabularyContext();

    const [switchingId, setSwitchingId] = useState<number | string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Newest-added language first
    const languages = useMemo(() => {
        const list = userProgress?.languages || [];
        return [...list].sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    }, [userProgress?.languages]);

    const handleSelect = useCallback(async (language) => {
        if (language.is_current_language || switchingId !== null) return;
        if (!isOnline) return;

        setErrorMessage(null);
        setSwitchingId(language.id);

        try {
            if (isAuthenticated) {
                // Flush any pending vocabulary changes while they're still
                // attributed to the OLD current language - once we switch,
                // any changes left un-synced would get wrongly attributed
                // to the new language on the next background sync.
                const syncedOk = await forceSync();
                if (!syncedOk) {
                    setErrorMessage('Could not sync your progress. Please try again.');
                    setSwitchingId(null);
                    return;
                }

                const response = await switchCurrentLanguage(Number(language.id));

                await setUserProgress((prev) => ({
                    ...prev,
                    languages: response.user_progress.languages,
                }));
                vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: response.user_vocabulary });
                // Defensive: the flush above should have already cleared this,
                // but the new vocabulary just replaced local state wholesale,
                // so any leftover entries here can no longer apply to anything.
                await setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);
            } else {
                // Guest accounts never accumulate more than one language today,
                // but handle it locally just in case - no server state to touch.
                await setUserProgress((prev) => ({
                    ...prev,
                    languages: (prev.languages || []).map((l) => ({
                        ...l,
                        is_current_language: l.id === language.id,
                    })),
                }));
            }

            // Dictionary and Reels both react to the userProgress update above
            // on their own (DictionaryContext and ReelsContext each watch the
            // current language codes internally and refetch themselves) -
            // no need to trigger those fetches from here.

            if (ref && 'current' in ref) {
                ref.current?.dismiss();
            }
        } catch (err) {
            setErrorMessage(err.message || 'Could not switch language. Please try again.');
        } finally {
            setSwitchingId(null);
        }
    }, [switchingId, isOnline, isAuthenticated, forceSync, setUserProgress, vocabularyDispatch, setVocabularyChanges, ref]);

    return (
        <BottomSheetModal
            index={0}
            ref={ref}
            snapPoints={snapPoints}
            enablePanDownToClose
            topInset={insets.top}
            backdropComponent={renderBackdrop}
            backgroundStyle={isDark ? { backgroundColor: DARK_COLORS.surface } : undefined}
            handleIndicatorStyle={isDark ? { backgroundColor: DARK_COLORS.border } : undefined}
        >
            <BottomSheetScrollView
                contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
            >
                <Text style={[styles.title, isDark && { color: DARK_COLORS.text }]}>Your Languages</Text>

                {languages.map((language) => {
                    const meta = getLanguageMeta(language.learning_language?.id);
                    const nativeMeta = getLanguageMeta(language.native_language?.id);
                    const isCurrent = language.is_current_language;
                    const isSwitchingThis = switchingId === language.id;
                    const disabled = switchingId !== null || (!isOnline && !isCurrent);

                    return (
                        <TouchableOpacity
                            key={language.id ?? `${language.learning_language?.id}-${language.native_language?.id}`}
                            style={[
                                styles.row,
                                isDark && { backgroundColor: DARK_COLORS.background, borderColor: DARK_COLORS.border },
                                isCurrent && styles.rowSelected,
                                disabled && !isCurrent && styles.rowDisabled,
                            ]}
                            disabled={disabled}
                            onPress={() => handleSelect(language)}
                        >
                            <Text style={styles.flag}>{meta?.flag || '🏳️'}</Text>

                            <View style={styles.rowText}>
                                <Text style={[styles.languageName, isDark && { color: DARK_COLORS.text }]}>
                                    {meta?.name || language.learning_language?.name}
                                </Text>
                                <Text style={[styles.languageSub, isDark && { color: DARK_COLORS.textSecondary }]}>
                                    from {nativeMeta?.name || language.native_language?.name} · {language.proficiency_level || 'N'}
                                </Text>
                                <ProficiencyBar level={language.proficiency_level} isDark={isDark} />
                            </View>

                            {isSwitchingThis ? (
                                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                            ) : isCurrent ? (
                                <FontAwesome name="check-circle" size={22} color={PRIMARY_COLOR} />
                            ) : null}
                        </TouchableOpacity>
                    );
                })}

                {!isOnline && (
                    <Text style={[styles.note, isDark && { color: DARK_COLORS.textMuted }]}>
                        Connect to the internet to switch languages.
                    </Text>
                )}

                {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

LanguageSwitchSheet.displayName = 'LanguageSwitchSheet';

export default LanguageSwitchSheet;

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
        paddingBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    rowSelected: {
        borderColor: PRIMARY_COLOR,
    },
    rowDisabled: {
        opacity: 0.5,
    },
    flag: {
        fontSize: 28,
    },
    rowText: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    languageSub: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    progressBar: {
        flexDirection: 'row',
        gap: 3,
        marginTop: 8,
        width: '100%',
    },
    progressSegment: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#e0e0e0',
    },
    note: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    error: {
        fontSize: 13,
        color: '#d32f2f',
        textAlign: 'center',
        marginTop: 8,
    },
});
