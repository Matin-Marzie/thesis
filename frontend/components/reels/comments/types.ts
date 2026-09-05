import type { SharedValue } from 'react-native-reanimated';

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

export interface CommentBottomSheetModalProps {
  reelId: number;
  onClose: () => void;
  // Drives the phantom spacer in ReelItem that pushes the video upward via flex
  sheetHeight: SharedValue<number>;
}
