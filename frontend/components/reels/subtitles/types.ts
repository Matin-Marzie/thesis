import type { VideoPlayer } from 'expo-video';
import type { SharedValue } from 'react-native-reanimated';
import type { Reel, Word } from '../../../types/dialogue';

export interface DialogueBottomSheetModalProps {
    reelId: number;
    visible: boolean;
    onClose: () => void;
    reel?: Reel;
    player?: VideoPlayer;
    onWordPress: (word: Word) => void;
    // Drives the phantom spacer in ReelItem that pushes the video upward via flex
    sheetHeight: SharedValue<number>;
}
