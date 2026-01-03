// ================== Crossword Generator ==================

/* Utils */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Globals */
const BOARD_SIZE = 8;
const MAX_LETTERS_LENGTH = 8;
const MAX_WORDS = 12;

let board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
);

let placedWords = [];
let usedLetters = {};

// ================== Letter Limit ==================
function wouldExceedLetterLimit(newWord) {
    const currentLetters = {};

    for (const ch of newWord) {
        currentLetters[ch] = (currentLetters[ch] || 0) + 1;
    }

    const allKeys = new Set([
        ...Object.keys(usedLetters),
        ...Object.keys(currentLetters),
    ]);

    let total = 0;
    for (const k of allKeys) {
        total += Math.max(usedLetters[k] || 0, currentLetters[k] || 0);
    }

    return total > MAX_LETTERS_LENGTH;
}

// ================== Placement Checks ==================
function canPlaceWord(board, word, row, col, dir) {
    const rows = board.length;
    const cols = board[0].length;

    if (row < 0 || col < 0) return false;

    if (dir === "H") {
        if (row >= rows || col + word.length > cols) return false;

        if (col > 0 && board[row][col - 1] !== 0) return false;
        if (col + word.length < cols && board[row][col + word.length] !== 0)
            return false;

        for (let i = 0; i < word.length; i++) {
            const r = row;
            const c = col + i;
            const cell = board[r][c];

            if (cell !== 0 && cell !== word[i]) return false;

            if (cell === 0) {
                if (r > 0 && board[r - 1][c] !== 0) return false;
                if (r < rows - 1 && board[r + 1][c] !== 0) return false;
            } else {
                if (
                    !(
                        (r > 0 && board[r - 1][c] !== 0) ||
                        (r < rows - 1 && board[r + 1][c] !== 0)
                    )
                )
                    return false;
            }
        }
    } else {
        if (col >= cols || row + word.length > rows) return false;

        if (row > 0 && board[row - 1][col] !== 0) return false;
        if (row + word.length < rows && board[row + word.length][col] !== 0)
            return false;

        for (let i = 0; i < word.length; i++) {
            const r = row + i;
            const c = col;
            const cell = board[r][c];

            if (cell !== 0 && cell !== word[i]) return false;

            if (cell === 0) {
                if (c > 0 && board[r][c - 1] !== 0) return false;
                if (c < cols - 1 && board[r][c + 1] !== 0) return false;
            } else {
                if (
                    !(
                        (c > 0 && board[r][c - 1] !== 0) ||
                        (c < cols - 1 && board[r][c + 1] !== 0)
                    )
                )
                    return false;
            }
        }
    }

    return true;
}

// ================== Place Word ==================
function placeWord(board, word, row, col, dir) {
    if (dir === "H") {
        for (let i = 0; i < word.length; i++) {
            board[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            board[row + i][col] = word[i];
        }
    }

    placedWords.push({ row, col, word, dir });

    const currentWord = {};
    for (const ch of word) {
        currentWord[ch] = (currentWord[ch] || 0) + 1;
    }

    const allKeys = new Set([
        ...Object.keys(usedLetters),
        ...Object.keys(currentWord),
    ]);

    for (const k of allKeys) {
        usedLetters[k] = Math.max(usedLetters[k] || 0, currentWord[k] || 0);
    }
}

// ================== Intersections ==================
function findIntersections(board, placed, newWord) {
    const res = [];
    const rows = board.length;
    const cols = board[0].length;

    for (let i = 0; i < placed.word.length; i++) {
        for (let j = 0; j < newWord.length; j++) {
            if (placed.word[i] !== newWord[j]) continue;

            let row, col, dir;
            if (placed.dir === "H") {
                row = placed.row - j;
                col = placed.col + i;
                dir = "V";
            } else {
                row = placed.row + i;
                col = placed.col - j;
                dir = "H";
            }

            if (row < 0 || col < 0 || row >= rows || col >= cols) continue;
            res.push({ row, col, dir });
        }
    }

    return res;
}

// ================== Try Place ==================
function tryPlaceWord(board, word) {
    if (wouldExceedLetterLimit(word)) return false;

    for (const placed of placedWords) {
        const intersections = findIntersections(board, placed, word);

        for (const inter of intersections) {
            if (canPlaceWord(board, word, inter.row, inter.col, inter.dir)) {
                placeWord(board, word, inter.row, inter.col, inter.dir);
                return true;
            }
        }
    }
    return false;
}

// ================== Priority ==================
function wordPriority(word) {
    const newWord = {};
    for (const ch of word) {
        newWord[ch] = (newWord[ch] || 0) + 1;
    }

    let shared = 0;
    let added = 0;

    const allKeys = new Set([
        ...Object.keys(newWord),
        ...Object.keys(usedLetters),
    ]);

    for (const k of allKeys) {
        const before = usedLetters[k] || 0;
        const after = Math.max(before, newWord[k] || 0);
        if (after > before) added += after - before;
        else shared += before;
    }

    return [shared, -added];
}


// ================== RUN ==================
export default function GenerateWordOfWonderLevel(dictionary) {
    // Reset global variables to prevent accumulation across multiple calls
    board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(0)
    );
    placedWords = [];
    usedLetters = {};

    // Extract written_form from word objects
    let wordList = dictionary
        .map((w) => w.written_form.trim().toUpperCase())
        .filter((w) => w.length > 2 && w.length <= 8 && /^[A-Z]+$/.test(w));

    // Pick a random practice word (already uppercase from wordList)
    const practiceWord = wordList[Math.floor(Math.random() * wordList.length)];

    const startRow = randomInt(2, 5);
    const startCol = randomInt(0, BOARD_SIZE - practiceWord.length);

    placeWord(board, practiceWord, startRow, startCol, "H");

    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    shuffled.sort(
        (a, b) =>
            wordPriority(b)[0] - wordPriority(a)[0] ||
            wordPriority(b)[1] - wordPriority(a)[1]
    );

    for (const word of shuffled) {
        if (placedWords.length >= MAX_WORDS) break;
        if (word === practiceWord) continue; // Skip the practice word
        if (placedWords.some(pw => pw.word === word)) continue; // Skip if already in placedWords, dictionary may have duplicate for now.To Do: remove duplicate in dicrionary
        tryPlaceWord(board, word)
    }

    board = board.map(row => row.map(cell => (cell === 0 ? 0 : 1)));


    const gridWords = placedWords.reduce((acc, { row, col, word, dir }, index) => {
        const key = word.toLowerCase(); // using word as key
        acc[key] = {
            id: index + 1,
            written_form: word.toLowerCase(),
            direction: dir,
            pos: [row, col],
            isFound: false
        };
        return acc;
    }, {});

    const letters = Object.entries(usedLetters).flatMap(
        ([char, count]) => Array(count).fill(char)
    );

    // reduce board columns, rows - trim empty edges
    let minRow = board.length;
    let maxRow = -1;
    let minCol = board[0].length;
    let maxCol = -1;

    // Find bounds of non-zero cells
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if (board[r][c] === 1) {
                minRow = Math.min(minRow, r);
                maxRow = Math.max(maxRow, r);
                minCol = Math.min(minCol, c);
                maxCol = Math.max(maxCol, c);
            }
        }
    }

    // Trim board to actual used area
    const trimmedBoard = [];
    for (let r = minRow; r <= maxRow; r++) {
        const row = [];
        for (let c = minCol; c <= maxCol; c++) {
            row.push(board[r][c]);
        }
        trimmedBoard.push(row);
    }

    // Update gridWords positions to match trimmed board
    Object.values(gridWords).forEach(word => {
        word.pos[0] -= minRow;
        word.pos[1] -= minCol;
    });
    

    return [trimmedBoard, gridWords, letters];
}

// Execution example
// const [my_board, gridWords, letters] = GenerateWordOfWOnderLevel(dictionary);