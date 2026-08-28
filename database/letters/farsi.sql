-- Farsi alphabet (32 letters). Only ا (Alef), و (Vav) and ی (Ye) mark long vowels in
-- written Farsi - short vowels aren't written, so everything else is a consonant.
INSERT INTO letters (letter_sign, type, language_id) VALUES
('الف', 'vowel', 3),   -- Alef
('ب', 'consonant', 3),   -- Be
('پ', 'consonant', 3),   -- Pe
('ت', 'consonant', 3),   -- Te
('ث', 'consonant', 3),   -- Se
('ج', 'consonant', 3),   -- Jim
('چ', 'consonant', 3),   -- Che
('ح', 'consonant', 3),   -- He
('خ', 'consonant', 3),   -- Khe
('د', 'consonant', 3),   -- Dal
('ذ', 'consonant', 3),   -- Zal
('ر', 'consonant', 3),   -- Re
('ز', 'consonant', 3),   -- Ze
('ژ', 'consonant', 3),   -- Zhe
('س', 'consonant', 3),   -- Sin
('ش', 'consonant', 3),   -- Shin
('ص', 'consonant', 3),   -- Sad
('ض', 'consonant', 3),   -- Zad
('ط', 'consonant', 3),   -- Ta
('ظ', 'consonant', 3),   -- Za
('ع', 'consonant', 3),   -- Ayn
('غ', 'consonant', 3),   -- Ghayn
('ف', 'consonant', 3),   -- Fe
('ق', 'consonant', 3),   -- Qaf
('ک', 'consonant', 3),   -- Kaf
('گ', 'consonant', 3),   -- Gaf
('ل', 'consonant', 3),   -- Lam
('م', 'consonant', 3),   -- Mim
('ن', 'consonant', 3),   -- Nun
('و', 'vowel', 3),   -- Vav
('ه', 'consonant', 3),   -- He
('ی', 'vowel', 3);   -- Ye
