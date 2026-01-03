// Game data constants
// maximum of 8 letters supported
import { Dimensions } from 'react-native';


// TO Do: add max height to boxData

export const GREEN = '#0f8690';
export const MAX_WIDTH = 768; // Limit width to tablet/mobile size (iPad Pro is ~1024px)
export const MAX_CIRCLE_RADIUS = 140; // Maximum radius for the letter cycle on large screens
export const MAX_GRID_WIDTH = 500; // Maximum width for the game grid on large screens

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export const width = screenWidth > MAX_WIDTH ? MAX_WIDTH : screenWidth;
export const height = screenHeight;
export const horizontalOffset = (screenWidth - width) / 2; // Center offset for large screens

// Background settings
// export const BACKGROUND_IMAGE_URI = 'https://talktravelapp.com/wp-content/uploads/Nasir-al-Mulk-Mosque-Iran.jpg';
// export const BACKGROUND_IMAGE_URI = 'https://www.robertharding.com/watermark.php?type=preview&im=RM/RH/VERTICAL/832-383388';
export const BACKGROUND_IMAGE_URI = 'https://i.pinimg.com/736x/6b/b1/94/6bb194fc8d9fd46b172e0855b8cd6d4d.jpg';
export const BACKGROUND_OVERLAY_OPACITY = 0.4;




let user = {
  current_language: 'English',
  learning_language: 'Greek',
  words: {},
  coins: 1000,
}
const updateUser = (newData) => {
  user = { ...user, ...newData };
};
export { user, updateUser };
