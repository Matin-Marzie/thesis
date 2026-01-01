// Game data constants
// maximum of 8 letters supported
import { Dimensions } from 'react-native';


// TO Do: add max height to boxData

export const boxData = [
  [1, 1, 1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0],
  [1, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 1],
];

export const letters = ['D', 'I', 'A', 'M', 'O', 'N', 'D', 'D'];
export const columns = boxData[0].length;
export const rows = boxData.length;
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


export const gridWords = {
  diamond: { id: 1, written_form: "diamond", translation: "Διαμάντι", direction: 'V', pos: [0, 0], isFound: false },
  domain: { id: 2, written_form: "domain", translation: "Πεδίο Ορισμού, κτήση, κυριότητα, κτήματα", direction: 'H', pos: [0, 0], isFound: false },
  nomad: { id: 3, written_form: "nomad", translation: "", direction: 'V', pos: [0, 5], isFound: false },
  maid: { id: 4, written_form: "maid", translation: "", direction: 'H', pos: [3, 0], isFound: false },
  mind: { id: 5, written_form: "mind", translation: "", direction: 'V', pos: [2, 2], isFound: false },
  nod: { id: 6, written_form: "nod", translation: "", direction: 'H', pos: [5, 0], isFound: false },
  add: { id: 7, written_form: "add", translation: "", direction: 'H', pos: [4, 4], isFound: false },
  dad: { id: 8, written_form: "dad", translation: "", direction: 'V', pos: [4, 6], isFound: false },
  did: { id: 9, written_form: "did", translation: "", direction: 'H', pos: [6, 4], isFound: false },
  aid: { id: 10, written_form: "aid", translation: "", direction: 'V', pos: [4, 4], isFound: false },
};



const gridWords2 = {

}

export const dictionary = {
  language: 'English',
  translated_language: 'Greek',
  words: {
    add: { id: 7, written_form: "ADD", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    admin: { id: 11, written_form: "ADMIN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    aid: { id: 10, written_form: "AID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    amid: { id: 20, written_form: "AMID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    amino: { id: 21, written_form: "AMINO", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    and: { id: 19, written_form: "AND", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    dam: { id: 17, written_form: "DAM", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    damn: { id: 18, written_form: "DAMN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    dad: { id: 8, written_form: "DAD", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    diamond: { id: 1, written_form: "DIAMOND", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    did: { id: 9, written_form: "DID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    do: { id: 16, written_form: "DO", translation: "κάνω", transliteration: "", category: "", image_url: null, audio_url: null },
    domain: { id: 2, written_form: "DOMAIN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    id: { id: 24, written_form: "ID", translation: "ταυτότητα", transliteration: "", category: "", image_url: null, audio_url: null },
    maid: { id: 4, written_form: "MAID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    main: { id: 12, written_form: "MAIN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    man: { id: 15, written_form: "MAN", translation: "ο άνδρας", transliteration: "", category: "", image_url: null, audio_url: null },
    mid: { id: 14, written_form: "MID", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    mind: { id: 5, written_form: "MIND", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    moan: { id: 22, written_form: "MOAN", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    nomad: { id: 3, written_form: "NOMAD", translation: "νομάδας", transliteration: "", category: "", image_url: null, audio_url: null },
    nod: { id: 6, written_form: "NOD", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    odd: { id: 13, written_form: "ODD", translation: "", transliteration: "", category: "", image_url: null, audio_url: null },
    omni: { id: 23, written_form: "OMNI", translation: "", transliteration: "", category: "", image_url: null, audio_url: null }
  }
};


let user = {
  current_language: 'English',
  learning_language: 'Greek',
  words: {},
  coins: 412,
}
const updateUser = (newData) => {
  user = { ...user, ...newData };
};
export { user, updateUser };
