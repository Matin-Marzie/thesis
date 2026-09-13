-- Farsi letters were originally inserted in plain Arabic dictionary order,
-- with the four Farsi-specific letters (پ, چ, ژ, گ) appended near the end
-- instead of sitting in their normal teaching position. lettersModel.js
-- displays letters via `ORDER BY l.id`, so the ids need to reflect the
-- standard Farsi alphabet order:
--   ا ب پ ت ث ج چ ح خ د ذ ر ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ه ی
-- Only letter_sign 'پ' at the language's first mapped id is checked as the
-- idempotency guard - if it's already there, the reorder already ran.
DO $$
DECLARE
  fa_id bigint;
  first_target_id bigint;
BEGIN
  SELECT id INTO fa_id FROM languages WHERE code = 'fa';

  SELECT MIN(id) + 2 INTO first_target_id FROM letters WHERE language_id = fa_id;

  IF EXISTS (
    SELECT 1 FROM letters
    WHERE language_id = fa_id AND id = first_target_id AND letter_sign = 'پ'
  ) THEN
    RETURN;
  END IF;

  -- Step 1: move every letter but the first two (ا, ب) and the last one (ی),
  -- which are already correctly placed, out of the way to avoid PK collisions.
  UPDATE letters
  SET id = id + 100000
  WHERE language_id = fa_id
    AND id NOT IN (
      SELECT id FROM letters WHERE language_id = fa_id ORDER BY id LIMIT 2
    )
    AND id <> (SELECT MAX(id) FROM letters WHERE language_id = fa_id);

  -- Step 2: assign each shifted row its correct final id.
  UPDATE letters
  SET id = CASE id
    WHEN 100053 THEN 54 -- ت
    WHEN 100054 THEN 55 -- ث
    WHEN 100055 THEN 56 -- ج
    WHEN 100056 THEN 58 -- ح
    WHEN 100057 THEN 59 -- خ
    WHEN 100058 THEN 60 -- د
    WHEN 100059 THEN 61 -- ذ
    WHEN 100060 THEN 62 -- ر
    WHEN 100061 THEN 63 -- ز
    WHEN 100062 THEN 65 -- س
    WHEN 100063 THEN 66 -- ش
    WHEN 100064 THEN 67 -- ص
    WHEN 100065 THEN 68 -- ض
    WHEN 100066 THEN 69 -- ط
    WHEN 100067 THEN 70 -- ظ
    
    WHEN 100068 THEN 71 -- ع
    WHEN 100069 THEN 72 -- غ
    WHEN 100070 THEN 73 -- ف
    WHEN 100071 THEN 74 -- ق
    WHEN 100072 THEN 77 -- ل
    WHEN 100073 THEN 78 -- م
    WHEN 100074 THEN 79 -- ن
    WHEN 100075 THEN 81 -- ه
    WHEN 100076 THEN 80 -- و
    WHEN 100077 THEN 53 -- پ
    WHEN 100078 THEN 57 -- چ
    WHEN 100079 THEN 64 -- ژ
    WHEN 100080 THEN 75 -- ک
    WHEN 100081 THEN 76 -- گ
  END
  WHERE language_id = fa_id AND id BETWEEN 100053 AND 100081;
END $$;
