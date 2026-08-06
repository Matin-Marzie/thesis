import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
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
import { switchCurrentLanguage, addLanguage as addLanguageApi } from '@/api/user';
import LanguageSelectionSlide from '@/app/onboarding/components/LanguageSelectionSlide';
import ProficiencySlide from '@/app/onboarding/components/ProficiencySlide';

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
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const { userProgress, setUserProgress } = useProgress();
    const { isOnline } = useNetwork();
    const { isAuthenticated, forceSync } = useAuth();
    const { vocabularyDispatch, setVocabularyChanges } = useVocabularyContext();

    const [switchingId, setSwitchingId] = useState<number | string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 'list' shows the account's languages; 'select'/'level' are the two
    // steps of the add-language flow, reusing the onboarding slides.
    const [mode, setMode] = useState<'list' | 'select' | 'level'>('list');
    const [addNative, setAddNative] = useState<{ id: number; name: string; code: string } | null>(null);
    const [addTarget, setAddTarget] = useState<{ id: number; name: string; code: string } | null>(null);
    const [addLevel, setAddLevel] = useState<string | null>('N');
    const [isAddingLanguage, setIsAddingLanguage] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Newest-added language first
    const languages = useMemo(() => {
        const list = userProgress?.languages || [];
        return [...list].sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    }, [userProgress?.languages]);

    const excludePairs = useMemo(
        () => languages.map((l) => ({
            nativeId: Number(l.native_language?.id),
            targetId: Number(l.learning_language?.id),
        })),
        [languages]
    );

    const canAddLanguage = isAuthenticated && isOnline;

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

    const handleOpenAddLanguage = useCallback(() => {
        if (!canAddLanguage) return;
        setAddError(null);
        setAddNative(null);
        setAddTarget(null);
        setAddLevel('N');
        setMode('select');
        if (ref && 'current' in ref) {
            ref.current?.snapToIndex(1);
        }
    }, [canAddLanguage, ref]);

    const handleBackFromAdd = useCallback(() => {
        if (mode === 'level') {
            setMode('select');
            return;
        }
        setMode('list');
        if (ref && 'current' in ref) {
            ref.current?.snapToIndex(0);
        }
    }, [mode, ref]);

    const handleSubmitAddLanguage = useCallback(async () => {
        if (!addNative || !addTarget || !addLevel || isAddingLanguage) return;

        setAddError(null);
        setIsAddingLanguage(true);

        try {
            // Flush pending changes for the CURRENT language before adding a
            // new one - same reasoning as switching: once the new language
            // becomes current, un-synced changes would be wrongly attributed.
            const syncedOk = await forceSync();
            if (!syncedOk) {
                setAddError('Could not sync your progress. Please try again.');
                return;
            }

            const response = await addLanguageApi({
                native_language_id: addNative.id,
                learning_language_id: addTarget.id,
                proficiency_level: addLevel,
            });

            await setUserProgress((prev) => ({
                ...prev,
                languages: response.user_progress.languages,
            }));
            vocabularyDispatch({ type: VOCABULARY_ACTIONS.SET, payload: response.user_vocabulary });
            await setVocabularyChanges(DEFAULT_VOCABULARY_CHANGES);

            setMode('list');
            if (ref && 'current' in ref) {
                ref.current?.snapToIndex(0);
            }
        } catch (err) {
            setAddError(err.message || 'Could not add language. Please try again.');
        } finally {
            setIsAddingLanguage(false);
        }
    }, [addNative, addTarget, addLevel, isAddingLanguage, forceSync, setUserProgress, vocabularyDispatch, setVocabularyChanges, ref]);

    const handleDismiss = useCallback(() => {
        setMode('list');
        setAddNative(null);
        setAddTarget(null);
        setAddLevel('N');
        setAddError(null);
        setIsAddingLanguage(false);
    }, []);

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
            onDismiss={handleDismiss}
        >
            {mode === 'list' ? (
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

                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            isDark && { borderColor: DARK_COLORS.border },
                            !canAddLanguage && styles.rowDisabled,
                        ]}
                        disabled={!canAddLanguage}
                        onPress={handleOpenAddLanguage}
                    >
                        <FontAwesome name="plus" size={16} color={PRIMARY_COLOR} />
                        <Text style={[styles.addButtonText, isDark && { color: DARK_COLORS.text }]}>Add a language</Text>
                    </TouchableOpacity>

                    {!isAuthenticated ? (
                        <Text style={[styles.note, isDark && { color: DARK_COLORS.textMuted }]}>
                            Sign in to add another language.
                        </Text>
                    ) : !isOnline ? (
                        <Text style={[styles.note, isDark && { color: DARK_COLORS.textMuted }]}>
                            Connect to the internet to add a language.
                        </Text>
                    ) : null}

                    {!isOnline && (
                        <Text style={[styles.note, isDark && { color: DARK_COLORS.textMuted }]}>
                            Connect to the internet to switch languages.
                        </Text>
                    )}

                    {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                </BottomSheetScrollView>
            ) : (
                <BottomSheetView style={[styles.addFlowContainer, { paddingBottom: insets.bottom }]}>
                    <View style={styles.addFlowHeader}>
                        <TouchableOpacity onPress={handleBackFromAdd} style={styles.backButton}>
                            <FontAwesome name="chevron-left" size={20} color={isDark ? DARK_COLORS.text : '#333'} />
                        </TouchableOpacity>
                    </View>

                    {addError && <Text style={styles.error}>{addError}</Text>}

                    {mode === 'select' && (
                        <LanguageSelectionSlide
                            onNext={() => setMode('level')}
                            selectedNative={addNative}
                            selectedTarget={addTarget}
                            setSelectedNative={setAddNative}
                            setSelectedTarget={setAddTarget}
                            excludePairs={excludePairs}
                        />
                    )}

                    {mode === 'level' && (
                        <View style={styles.addFlowStep}>
                            <ProficiencySlide
                                onNext={handleSubmitAddLanguage}
                                selectedLevel={addLevel}
                                setSelectedLevel={setAddLevel}
                                selectedLearningLanguage={addTarget}
                            />
                            {isAddingLanguage && (
                                <View style={[styles.addOverlay, isDark && { backgroundColor: 'rgba(18, 18, 18, 0.7)' }]}>
                                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                                </View>
                            )}
                        </View>
                    )}
                </BottomSheetView>
            )}
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#c9c9c9',
        marginBottom: 4,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
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
    addFlowContainer: {
        flex: 1,
    },
    addFlowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addFlowStep: {
        flex: 1,
    },
    addOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
});
