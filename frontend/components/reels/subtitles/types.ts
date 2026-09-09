import type { VideoPlayer } from 'expo-video';
import type { SharedValue } from 'react-native-reanimated';
import type { Reel, Word } from '../../../types/dialogue';

export interface DialogueBottomSheetModalProps {
    reelId: number;
    onClose: () => void;
    reel?: Reel;
    // True while this reel's dialogue is being lazily fetched (see
    // ReelItem's handleDialogueOpen) - shows a spinner in place of content.
    isLoading?: boolean;
    player?: VideoPlayer;
    onWordPress: (word: Word, expanded: string | null) => void;
    // Drives the phantom spacer in ReelItem that pushes the video upward via flex
    sheetHeight: SharedValue<number>;
}
