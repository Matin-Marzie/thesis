--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.languages (id, name, code) VALUES (1, 'English', 'en');
INSERT INTO public.languages (id, name, code) VALUES (3, 'Farsi', 'fa');
INSERT INTO public.languages (id, name, code) VALUES (2, 'Greek', 'el');


--
-- Data for Name: dialogues; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.dialogues (id, language_id, created_at) VALUES (60, 3, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (61, 1, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (62, 3, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (63, 3, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (64, 3, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (65, 3, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (67, 3, '2026-08-19 15:56:27.967999+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (68, 3, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (69, 3, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (70, 3, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (71, 3, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (72, 3, '2026-08-19 22:07:00.89806+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (73, 3, '2026-08-19 22:08:54.101576+03');
INSERT INTO public.dialogues (id, language_id, created_at) VALUES (74, 3, '2026-08-19 22:17:31.486025+03');


--
-- Data for Name: sentences; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (1, 3, 'سَلام', 'سلام', NULL, '2026-03-11 14:27:55.553779+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (2, 3, 'اِسمِ مَن مَریَم اَست', 'اسم من مریم است', NULL, '2026-03-11 14:28:53.622159+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (3, 3, 'اِسمِ تو چست؟', 'اسم تو چیست؟', NULL, '2026-03-11 14:30:27.229394+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (4, 3, 'اِسمِ مَن سیما اَست', 'اسم من سیما است', NULL, '2026-03-11 14:30:27.27026+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (5, 1, 'Hello', NULL, NULL, '2026-03-11 14:31:56.965979+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (6, 1, 'My name is Marry', NULL, NULL, '2026-03-11 14:32:11.368111+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (7, 1, 'What is your name?', NULL, NULL, '2026-03-11 14:32:24.183743+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (8, 1, 'My name is Sima.', NULL, NULL, '2026-03-11 14:32:43.439247+02');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (10, 3, 'من ایرانی هستم.', 'من ایرانی هستم', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (11, 3, 'تو اهل کجایی؟', 'تو اهل کجایی', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (12, 3, 'من توماس هستم.', 'من توماس هستم', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (13, 3, 'من اهل آلمان هستم.', 'من اهل آلمان هستم', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (15, 1, 'I am Iranian.', 'i am iranian', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (16, 1, 'Where are you from?', 'where are you from', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (17, 1, 'I am Thomas.', 'i am thomas', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (18, 1, 'I am from Germany.', 'i am from germany', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (9, 3, ' من پدرام هستم', 'سلام من پدرام هستم', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (19, 3, 'مَن فَرهاد هَستَم', 'من فرهاد هستم', NULL, '2026-04-07 16:59:09.937185+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (20, 1, 'I am Farhad.', 'i am farhad', NULL, '2026-04-07 16:59:10.015589+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (21, 3, 'مَن اُستادِ زَبانِ فارسى هَستَم', 'من استاد زبان فارسی هستم', NULL, '2026-04-07 16:59:10.199415+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (23, 3, 'مَن مَت هَستَم', 'من مت هستم', NULL, '2026-04-07 16:59:10.336116+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (24, 1, 'I am Matt.', 'i am matt', NULL, '2026-04-07 16:59:10.476373+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (25, 3, 'مَن هَم اُستادِ ایران‌شِناسى هَستَم', 'من هم استاد ایران شناسی هستم', NULL, '2026-04-07 16:59:10.600352+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (26, 1, 'I am also an Iranian studies professor.', 'i am also an iranian studies professor', NULL, '2026-04-07 16:59:10.687276+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (27, 3, 'سَلام رابِرت', 'سلام رابرت', NULL, '2026-04-07 17:22:46.814035+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (28, 3, 'این دوستِ مَن رَحمان اَست', 'این دوست من رحمان است', NULL, '2026-04-07 17:22:46.874268+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (29, 3, 'او اَهلِ مِصر اَست', 'او اهل مصر است', NULL, '2026-04-07 17:22:46.973473+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (30, 3, 'خوش‌وَقتَم', 'خوش وقتم', NULL, '2026-04-07 17:22:47.082711+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (31, 3, 'سَلام دُریس', 'سلام دریس', NULL, '2026-04-07 17:22:47.146992+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (32, 3, 'خوب هَستی؟', 'خوب هستی؟', NULL, '2026-04-07 17:22:47.210992+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (33, 3, 'خوب هَستَم مَمنون', 'خوب هستم ممنون', NULL, '2026-04-07 17:22:47.338068+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (34, 3, 'تو خوب هَستی؟', 'تو خوب هستی؟', NULL, '2026-04-07 17:22:47.425485+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (35, 3, 'مَن هَم خوب هَستَم', 'من هم خوب هستم', NULL, '2026-04-07 17:22:47.485135+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (36, 3, 'مَمنون', 'ممنون', NULL, '2026-04-07 17:22:47.542419+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (37, 3, 'سَلام دُرسا', 'سلام درسا', NULL, '2026-04-07 17:22:47.597218+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (38, 3, 'خُداحافِظ', 'خداحافظ', NULL, '2026-04-07 17:22:47.65241+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (39, 1, 'Hello Robert', 'hello robert', NULL, '2026-04-07 17:22:47.708239+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (40, 1, 'This is my friend Rahman', 'this is my friend rahman', NULL, '2026-04-07 17:22:47.762775+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (41, 1, 'He is from Egypt', 'he is from egypt', NULL, '2026-04-07 17:22:47.817975+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (42, 1, 'Nice to meet you', 'nice to meet you', NULL, '2026-04-07 17:22:47.876312+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (43, 1, 'Hello Doris', 'hello doris', NULL, '2026-04-07 17:22:47.991699+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (44, 1, 'Are you well?', 'are you well', NULL, '2026-04-07 17:22:48.068801+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (45, 1, 'I am well, thanks', 'i am well thanks', NULL, '2026-04-07 17:22:48.13037+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (46, 1, 'Are you doing well?', 'are you doing well', NULL, '2026-04-07 17:22:48.18961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (47, 1, 'I am also well', 'i am also well', NULL, '2026-04-07 17:22:48.245385+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (48, 1, 'Thanks', 'thanks', NULL, '2026-04-07 17:22:48.299917+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (49, 1, 'Hello Dorsa', 'hello dorsa', NULL, '2026-04-07 17:22:48.354688+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (50, 1, 'Goodbye', 'goodbye', NULL, '2026-04-07 17:22:48.413064+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (51, 3, 'سَلام خوش‌وَقتَم', 'سلام خوش‌وقتم', NULL, '2026-04-08 11:11:47.820201+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (14, 1, 'I am Pedram.', 'hello i am pedram', NULL, '2026-04-07 11:15:52.26547+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (22, 1, 'I am a Farsi language professor.', 'i am a persian language professor', NULL, '2026-04-07 16:59:10.292718+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (52, 1, 'Hello, nice to meet you', 'hello nice to meet you', NULL, '2026-04-08 11:37:11.567546+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (53, 3, 'هَمِه یِه تیم هَستیم', 'همه یه تیم هستیم', NULL, '2026-04-08 11:41:48.359172+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (54, 1, 'We are all one team.', 'we are all one team', NULL, '2026-04-08 11:41:48.420237+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (55, 3, 'چایی بیارَم یا قَهوه؟', 'چایی بیارم یا قهوه؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (56, 1, 'Should I bring tea or coffee?', 'should i bring tea or coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (57, 3, 'قَهوه', 'قهوه', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (58, 1, 'Coffee', 'coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (59, 3, 'چیه؟ قَهوه قَهوه؟', 'چیه؟ قهوه قهوه؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (60, 1, 'What? Coffee, coffee?', 'what coffee coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (61, 3, 'اونَم با مِعده‌یِ خالی؟', 'اونم با معده‌ی خالی', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (62, 1, 'And that on an empty stomach?', 'and that on an empty stomach', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (63, 3, 'مَن عاشِقِ قَهوه و کِتابَم', 'من عاشق قهوه و کتابم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (64, 1, 'I love coffee and books', 'i love coffee and books', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (65, 3, 'بِدونِ شِکَر', 'بدون شکر', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (66, 1, 'Without sugar', 'without sugar', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (67, 3, 'اکسپرِسو', 'اکسپرسو', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (69, 3, 'کِیک بَراتون بِگیرَم', 'کیک براتون بگیرم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (70, 1, 'Should I get some cake for you?', 'should i get some cake for you', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (71, 3, 'با قَهوَتوون بُخورین؟', 'با قهوتون بخورین؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (72, 1, 'To eat with your coffee?', 'to eat with your coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (73, 3, 'پَس شُما قَهوه بِگیرین', 'پس شما قهوه بگیرین', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (74, 1, 'So you get the coffee', 'so you get the coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (75, 3, 'ما با کِیکمون بُخوریم', 'ما با کیکمون بخوریم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (68, 1, 'Ekspresso', 'espresso', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (76, 1, 'We will eat it with our cake', 'we will eat it with our cake', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (77, 3, 'مَن یه قَهوه', 'من یه قهوه', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (78, 1, 'One coffee for me', 'one coffee for me', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (79, 3, 'مَنَم یه قَهوه', 'منم یه قهوه', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (80, 1, 'Me too, one coffee', 'me too one coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (81, 3, 'قَهوه رو هَستی؟', 'قهوه رو هستی؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (82, 1, 'Are you up for coffee?', 'are you up for coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (83, 3, 'هَستَم', 'هستم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (84, 1, 'I am in', 'i am in', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (85, 3, 'بَه بَه چه قَهوه‌ای دُرُست کَردَم', 'به به چه قهوه‌ای درست کردم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (86, 1, 'Wow, what a coffee I made!', 'wow what a coffee i made', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (87, 3, 'مَن عاشِقِ قَهوه‌اَم', 'من عاشق قهوه‌ام', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (88, 1, 'I am in love with coffee', 'i am in love with coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (89, 3, 'بَه بَه', 'به به', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (90, 1, 'Wonderful / Delightful', 'wonderful delightful', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (91, 3, 'مَن که هَلاکِ قَهوه‌اَم', 'من که هلاک قهوه‌ام', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (92, 1, 'I am dying for coffee', 'i am dying for coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (93, 3, 'قَهوه‌یِ تَلخ می‌خواهَم', 'قهوه‌ی تلخ می‌خواهم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (94, 1, 'I want bitter coffee', 'i want bitter coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (95, 3, 'که مَرد اَفکَن بُوَد زورَش', 'که مرد افکن بود زورش', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (96, 1, 'So strong it could fell a man', 'so strong it could fell a man', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (97, 3, 'تَلخه', 'تلخه', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (98, 1, 'It is bitter', 'it is bitter', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (99, 3, 'از گَلو پاییین نَرَفته خواب رو دَست به سَر می‌کُنه', 'از گلو پایین نرفته خواب رو دست به سر می‌کنه', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (100, 1, 'Before it even goes down the throat, it drives sleep away', 'before it even goes down the throat it drives sleep away', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (101, 3, 'شُما تاحالا قَهوه خوردین اصلاً؟', 'شما تاحالا قهوه خوردین اصلا؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (102, 1, 'Have you ever even had coffee?', 'have you ever even had coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (103, 3, 'مَن هَمیشه قَهوه می‌خورَم', 'من همیشه قهوه می‌خورم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (104, 1, 'I always drink coffee', 'i always drink coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (105, 3, 'تو هَمیشه قَهوه می‌خوردی؟', 'تو همیشه قهوه می‌خوردی؟', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (106, 1, 'Did you always use to drink coffee?', 'did you always use to drink coffee', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (107, 3, 'بَله', 'بله', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (108, 1, 'Yes', 'yes', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (109, 3, 'بُخور بِبینَم', 'بخور ببینم', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (110, 1, 'Drink it, let me see', 'drink it let me see', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (111, 3, 'بیا', 'بیا', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (112, 1, 'Here / Come', 'here come', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (113, 3, 'خیلی خوش‌مَزِه است', 'خیلی خوش‌مزه است', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (114, 1, 'It is very delicious', 'it is very delicious', NULL, '2026-04-08 19:11:17.993159+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (116, 1, 'N', NULL, NULL, '2026-04-09 00:02:10.884085+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (148, 1, 'Love', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (115, 3, '(noon) نـ  ـنـ  ـن  ن', NULL, NULL, '2026-04-09 00:01:27.922208+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (117, 3, '(vav) و', NULL, NULL, '2026-04-09 00:06:48.024139+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (118, 1, 'V, O', NULL, NULL, '2026-04-09 00:07:39.076548+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (119, 3, '(meem) م', NULL, NULL, '2026-04-09 00:20:00.411811+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (120, 1, 'M', NULL, NULL, '2026-04-09 00:20:18.987726+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (121, 3, 'یـ  ـیـ  ـی  ی', NULL, NULL, '2026-04-09 00:23:37.856037+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (122, 1, 'i', NULL, NULL, '2026-04-09 00:23:46.449896+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (124, 3, '.', NULL, NULL, '2026-04-10 08:45:32.098165+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (125, 3, 'بابا چرا مرده؟', NULL, NULL, '2026-08-09 15:37:32.615125+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (126, 1, 'Why has daddy died?', NULL, NULL, '2026-08-09 15:37:32.615125+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (127, 1, 'I''m Anna de Armas.', NULL, NULL, '2026-08-09 15:50:01.099899+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (128, 3, 'من آنا د آرماس هستم!', NULL, NULL, '2026-08-09 15:50:01.099899+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (129, 1, 'What''s your name?', NULL, NULL, '2026-08-09 15:50:01.099899+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (130, 3, 'اسم تو چیه؟', NULL, NULL, '2026-08-09 15:50:01.099899+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (131, 3, 'بابا چرا مرده', NULL, NULL, '2026-08-09 18:14:20.297552+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (132, 3, 'نمرده رفته پیش خدا', NULL, NULL, '2026-08-09 18:14:20.297552+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (133, 1, 'He hasn''t died he has gone close to god', NULL, NULL, '2026-08-09 18:14:20.297552+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (134, 3, 'خب حالش چیه؟ چی‌کار می‌کنه', NULL, NULL, '2026-08-09 18:14:20.297552+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (135, 1, 'I''m Anna', NULL, NULL, '2026-08-09 23:15:44.416508+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (136, 2, 'من آنا هستم', NULL, NULL, '2026-08-09 23:15:44.416508+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (137, 3, 'کتاب خانه دانشگاه زوریخ', NULL, NULL, '2026-08-11 14:44:26.635843+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (138, 1, 'Library of Zürich university', NULL, NULL, '2026-08-11 14:44:26.635843+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (139, 3, 'من یه دخترم', NULL, NULL, '2026-08-11 18:01:01.468802+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (140, 1, 'I''m a girl', NULL, NULL, '2026-08-11 18:01:01.468802+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (141, 3, 'اما هنوزم بعضی وقت‌ها مانیکور و پدیکور رو با هم قاطی می‌کنم', NULL, NULL, '2026-08-11 18:01:01.468802+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (142, 3, 'روتین پوستیم در حد یه پوست خیاره', NULL, NULL, '2026-08-11 18:01:01.468802+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (143, 3, 'رنج', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (144, 1, 'Pain', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (145, 3, 'خاکستر', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (146, 1, 'Ashes', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (147, 3, 'عشق', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (149, 3, 'احساسات', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (150, 1, 'Emotions', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (151, 3, 'فداکاری', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (152, 1, 'Sacrifice', NULL, NULL, '2026-08-11 18:14:40.480461+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (153, 3, 'بر پا', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (154, 1, 'Stand up', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (155, 3, '... خوب قر میدی‌ها', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (156, 3, 'ببخشید، من دبیر شیمی‌اَم', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (157, 1, 'Excuse me، I''m chemistry teacher.', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (158, 3, 'آقا اجازه', NULL, NULL, '2026-08-11 18:20:44.910961+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (159, 3, 'به احترام ایران همه با هم ورزشگاه خبردار', NULL, NULL, '2026-08-11 18:30:33.251569+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (160, 3, 'به احترام ایران همه با هم', NULL, NULL, '2026-08-11 23:20:01.004918+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (161, 3, 'ورزشگاه خبردا', NULL, NULL, '2026-08-11 23:20:01.004918+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (162, 3, 'اگه گفتی الان وقت چیه؟', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (163, 3, 'چای', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (164, 1, 'Tee', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (165, 3, 'یه چایی', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (166, 1, 'a tee', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (167, 3, 'چایی که می‌خوری؟', NULL, NULL, '2026-08-11 23:25:00.719465+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (168, 3, 'آقا ببندین اون آب رو', NULL, NULL, '2026-08-11 23:27:17.479402+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (169, 3, 'ببندین', NULL, NULL, '2026-08-11 23:27:17.479402+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (170, 3, 'چایی بیارم یا قهوه؟', NULL, NULL, '2026-08-11 23:37:04.528329+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (171, 3, 'قهوه', NULL, NULL, '2026-08-11 23:37:04.528329+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (172, 3, 'چیه قهوه قهوه اونم با معده‌ی خالی؟', NULL, NULL, '2026-08-11 23:37:04.528329+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (173, 3, 'شما اصلاً می‌دونین من کی‌اَم؟', NULL, NULL, '2026-08-12 00:06:11.464589+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (174, 3, 'نه نمی‌دونم', NULL, NULL, '2026-08-12 00:06:11.464589+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (175, 3, 'دکتر صدام می‌کنن', NULL, NULL, '2026-08-12 00:06:11.464589+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (176, 1, 'They call me Doctor', NULL, NULL, '2026-08-12 00:06:11.464589+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (177, 3, 'شنیدم عاشق عکاسی و عکس', NULL, NULL, '2026-08-12 00:07:44.021664+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (178, 3, 'تاحالا اِصفِهان رَفتی؟', NULL, NULL, '2026-08-12 03:16:33.091326+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (179, 3, 'نه نرفتم تاحالا', NULL, NULL, '2026-08-12 03:16:33.091326+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (180, 1, 'No', NULL, NULL, '2026-08-12 03:16:33.091326+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (181, 3, 'جَنگِ جَنگِ ساز می‌آد', NULL, NULL, '2026-08-12 03:19:20.717786+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (182, 3, 'جنگ جنگ', NULL, NULL, '2026-08-12 03:23:14.248743+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (183, 3, 'انگشتت رو با ریتم تکون بده', NULL, NULL, '2026-08-12 11:57:37.256571+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (184, 3, 'من آنا د ارمیس هستم', NULL, NULL, '2026-08-12 20:05:55.862425+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (185, 3, 'من یه کتاب باز‌اَم', NULL, NULL, '2026-08-13 17:03:40.786246+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (186, 1, 'استخر', NULL, NULL, '2026-08-13 17:57:21.236918+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (187, 1, 'من یه کتاب باز‌اَم', NULL, NULL, '2026-08-13 17:58:51.54727+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (190, 3, 'الله اکبر', NULL, NULL, '2026-08-16 23:04:04.481171+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (191, 1, 'The god is Great', NULL, NULL, '2026-08-16 23:04:04.481171+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (192, 2, 'Τι θα κάνει?', NULL, NULL, '2026-08-17 18:07:44.066057+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (193, 3, 'C', NULL, NULL, '2026-08-17 18:11:47.832803+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (194, 2, 'S', NULL, NULL, '2026-08-17 18:12:53.949204+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (195, 1, 'S', NULL, NULL, '2026-08-17 18:12:53.949204+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (196, 1, 'War war', NULL, NULL, '2026-08-17 19:00:06.588106+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (201, 2, 'Πόνος', NULL, NULL, '2026-08-17 19:22:20.571742+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (202, 1, 'I think baklava is Greek', NULL, NULL, '2026-08-17 19:28:14.000535+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (203, 2, 'Ο μπακλαβάς είναι Ελληνικός', NULL, NULL, '2026-08-17 19:28:14.000535+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (204, 3, 'باقلوا یونانی است', NULL, NULL, '2026-08-17 19:28:14.000535+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (205, 1, 'Oh yes I''m Iranian, I''m from Iran', NULL, NULL, '2026-08-17 19:36:39.231201+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (206, 3, 'بله من ایرانی‌ام، من اهل ایرانم.', NULL, NULL, '2026-08-17 19:36:39.231201+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (207, 2, 'Ναι είμαι Ιρανός', NULL, NULL, '2026-08-17 19:36:39.231201+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (208, 1, 'Am I good', NULL, NULL, '2026-08-17 19:46:00.810399+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (209, 3, 'برم', NULL, NULL, '2026-08-17 19:46:00.810399+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (210, 2, 'Να πάω στο', NULL, NULL, '2026-08-17 19:46:00.810399+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (213, 3, 'رَنج', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (214, 3, 'خاکِستَر‌ها', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (215, 3, 'عِشق', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (216, 3, 'فداکاری ها', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (217, 1, 'Toughness', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (218, 3, 'استواری', NULL, NULL, '2026-08-17 22:13:45.795483+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (219, 1, 'P', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (220, 3, 'پ', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (221, 1, 'A', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (222, 3, 'اa', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (223, 1, 'L', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (224, 3, 'ل', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (225, 1, 'E', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (226, 3, 'Ε', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (227, 2, 'Ε', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (228, 3, 'Σ', NULL, NULL, '2026-08-17 22:36:08.856558+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (229, 3, 'مَن یه دُختَرَم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (230, 1, 'I am a girl', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (231, 2, 'Είμαι ένα κορίτσι', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (232, 3, 'امّا هَنوزَم بَعضی وَقت‌ها، مانیکور و پِدیکور رو با هَم قاطی می‌کُنَم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (233, 1, 'But still sometimes, i confuse the manicure and pedicure', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (234, 2, 'Όμως ακόμα μερικές φορές, Μπερδεύω το μανικούρ με το πεντικούρ', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (235, 3, 'روتینِ پوستیم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (236, 1, 'My skincare routine', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (237, 2, 'Η ρουτίνα περιποίησης του δέρματός μου', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (238, 3, 'دَر حَد یه پوستِ خیاره', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (239, 1, 'is literally just a cucumber peel', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (240, 2, 'Είναι απλώς μια φλούδα αγγουριού', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (241, 3, 'تَتو نَدارَم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (242, 1, 'I don’t have tattoos', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (243, 2, 'Δεν έχω τατουάζ', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (244, 3, 'پیرسینگ هَم نَدارَم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (245, 1, 'I don’t have piercing too', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (246, 2, 'Δεν έχω ούτε πίρσινγκ', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (247, 3, 'لِباس‌هام مارک نیستَند', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (248, 1, 'My clothes aren’t designer', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (249, 2, 'Τα ρούχα μου δεν είναι μάρκα', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (250, 3, 'امّا هَمیشه شیک و مُرَتَّبَم', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (251, 1, 'But I’m always stylish and neat', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (252, 2, 'Αλλά είμαι πάντα κομψή και περιποιημένη', NULL, NULL, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (253, 2, 'Π', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (254, 3, 'اَلِف', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (255, 2, 'Α', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (256, 2, 'Λ', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (257, 3, 'اِ', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (258, 3, 'س', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (259, 2, 'Σ', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (260, 1, 'T', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (261, 3, 'ت', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (262, 2, 'Τ', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (263, 1, 'I', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (264, 3, 'ی', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (265, 2, 'ι', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (266, 3, 'ن', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (267, 2, 'Ν', NULL, NULL, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (268, 3, 'بَرپا', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (269, 1, 'On your feet', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (270, 2, 'Προσοχή', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (271, 3, 'بِبَخشید، من دَبیر شیمی‌اَم', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (272, 1, 'Excuse me, i am a chemistry teacher', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (273, 2, 'Συγγνώμη, είμαι καθηγητής Χημείας', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (274, 3, 'آقا اِجازه، ما می‌تَوانیم بِریم دَستشویی؟', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (275, 1, 'Sir, can I go to the bathroom please?', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (276, 2, 'Κύριε, μπορούμε να πάμε στην τουαλέτα παρακαλώ;', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (277, 3, 'بُرو جانَم زود‌تَر بُرو', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (278, 1, 'Go ahead my dear go, go quickly', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (279, 2, 'Πήγαινε αγάπη μου, πήγαινε γρήγορα', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (280, 3, '-', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (281, 1, 'I’m your teacher and you are my student', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (282, 3, 'میام بَرگَتو پاره می‌کُنَم ها', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (283, 1, 'I’ll come over and tear up your paper, you hear me?', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (284, 2, 'Θα έρθω εκεί και θα σου σκίσω την κόλλα, ε;', NULL, NULL, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (285, 3, 'به اِحتِرامِ ایران هَمه با هَم', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (286, 1, 'In honor of Iran all together', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (287, 2, 'Προς τιμήν του Ιράν όλοι μαζί', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (288, 3, 'وَرزِشگاه خَبَردار', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (289, 1, 'Stadium stand at attention', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (290, 2, 'Στάδιο προσοχή', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (291, 3, 'هَمه یه تیم هَستیم', NULL, NULL, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (292, 3, 'اَگه گُفتی اَلان وَقتِ چیه؟', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (293, 1, 'Guess what it’s time for?', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (294, 2, 'Για μάντεψε για τι είναι η ώρα τώρα;', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (295, 3, 'چایی', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (296, 1, 'Tea', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (297, 2, 'Τσάι', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (298, 1, 'You’ll have some tea, right?', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (299, 2, 'Θα πιεις τσάι;', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (300, 3, 'یه چایی بُخوریم', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (301, 1, 'Let’s have some tea', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (302, 2, 'Ας πιούμε ένα τσάι', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (303, 3, 'بُخوریم', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (304, 1, 'Let’s drink', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (305, 2, 'Ας πιούμε', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (306, 3, 'بُخورین', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (307, 1, 'Drink', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (308, 2, 'Πιείτε', NULL, NULL, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (309, 3, 'آقا بِبَندین اون آب رو بِبَندین', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (310, 1, 'Sir turn off that water turn it off', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (311, 2, 'Κύριε κλείστε εκείνο το νερό κλείστε', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (312, 3, 'شیرِ آب رو بِبَند', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (313, 1, 'Shut off the faucet', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (314, 2, 'Κλείσε τη βρύση', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (315, 3, 'مَگه نِمی‌دونی آب کَمه', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (316, 1, 'Don’t you know water is scarce', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (317, 2, 'Δεν ξέρεις ότι το νερό είναι λίγο', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (318, 3, 'شُما هَم لُطفاً اون شیرِ آب رو بِبَند', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (319, 1, 'You too please turn off the laptop', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (320, 2, 'Κι εσείς παρακαλώ κλείστε εκείνη τη βρύση', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (321, 3, 'چَشم چَشم', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (322, 1, 'Yes, right away', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (323, 2, 'Εντάξει εντάξει', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (324, 3, 'آقا بِبَند آب رو', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (325, 1, 'Sir turn off the water', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (326, 2, 'Κύριε κλείσε το νερό', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (327, 3, 'آقایِ مُدیری بِبَند آب رو', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (328, 1, 'Mr. Modiri turn off the water', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (329, 2, 'Κύριε Μοντιρί κλείσε το νερό', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (330, 3, 'بِبَند', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (331, 1, 'Shut it off', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (332, 2, 'Κλείσε', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (333, 3, 'آب هارت هارت می‌ره', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (334, 1, 'The water is just gushing away', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (335, 2, 'Το νερό τρέχει ποτάμι', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (336, 3, 'اِسرافه آقا', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (337, 1, 'It’s wasteful sir', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (338, 2, 'Είναι σπατάλη κύριε', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (339, 3, 'بِبَند لُطفاً', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (340, 1, 'Turn it off please', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (341, 2, 'Κλείσε παρακαλώ', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (342, 3, 'بِبَند دیگه', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (343, 1, 'Come on just turn it off', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (344, 2, 'Κλείσε επιτέλους', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (345, 3, 'لُطفاً بِبَند باشه؟', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (346, 1, 'Please turn off okay?', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (347, 2, 'Σε παρακαλώ κλείσε εντάξει;', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (348, 3, 'متأسفانه آب کَمه', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (349, 1, 'Unfortunately water is scarce', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (350, 2, 'Δυστυχώς το νερό είναι λίγο', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (351, 3, 'بایَد صَرفه‌جویی بِشه', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (352, 1, 'We have to save', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (353, 2, 'Πρέπει να γίνει εξοικονόμηση', NULL, NULL, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (354, 3, 'چایی یا قهوه؟', NULL, NULL, '2026-08-19 15:54:25.387327+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (356, 3, 'شُما اَصلاً می‌دونین مَن کی‌اَم؟', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (357, 1, 'Do you even know who I am?', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (358, 2, 'Ξέρεις καν ποιος είμαι;', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (359, 3, 'نه نِمی‌دونَم', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (360, 1, 'No, I don’t know', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (361, 2, 'Όχι δεν ξέρω', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (362, 3, 'دُکتُر صِدام می‌کُنَن', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (363, 1, 'They call me doctor', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (364, 2, 'Με φωνάζουν γιατρέ', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (365, 3, 'دُکتُر', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (366, 1, 'Doctor', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (367, 2, '￼ γιατρέ', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (368, 3, 'جونِ دُکتُر', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (369, 1, 'Yes, my dear', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (370, 2, 'Ορίστε μάτια μου;', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (371, 3, 'لُطف کُنین داخِلِ بیمارِستان مَن رو دُکتُر صدا کُنین', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (372, 1, 'Please call me doctor inside the hospital', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (373, 2, 'Παρακαλώ μέσα στο νοσοκομείο να με φωνάζετε γιατρό', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (374, 3, 'خودِت رو مُعَرِّفی کَردی؟', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (375, 1, 'Did you introduce yourself?', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (376, 2, 'Συστήθηκες;', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (377, 3, 'گُفتی کی هَستی؟', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (378, 1, 'Did you say who you are?', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (379, 2, 'Είπες ποιος είσαι', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (380, 3, 'مَن دُکتُرَم', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (381, 1, 'I’m doctor', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (382, 2, 'Είμαι γιατρός', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (383, 3, 'دُکتُرَم', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (384, 3, 'مَن یه دُکتُرَم', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (385, 1, 'I’m a doctor ￼', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (386, 2, 'Είμαι ένας γιατρός', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (387, 3, 'گُفتی شُغلِت چیه شُما؟', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (388, 1, 'You said what is your job?', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (389, 2, 'Είπατε τι δουλειά κάνετε;', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (390, 3, 'هَمه‌یِ بَچّه‌ها هَم می‌دونَن', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (391, 1, 'All the guys know it too', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (392, 2, 'Και όλα τα παιδιά το ξέρουν', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (393, 3, 'بَچّه‌ها مَن چی‌اَم', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (394, 1, 'Guys, what am I?', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (395, 2, 'Παιδιά τι είμαι εγώ;', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (396, 2, 'Γιατρός', NULL, NULL, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (397, 3, 'عَکّاسی دوست دارَم', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (398, 1, 'I like photography', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (399, 2, 'Μου αρέσει η φωτογραφία￼', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (400, 3, 'هَمه با هَم بِگین خیار', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (401, 1, '￼ Everybody together say cucumber', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (402, 2, 'Όλοι μαζί πείτε αγγούρι', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (403, 3, 'هَمه با هَم بِگین هلو', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (404, 1, 'Everybody together say peach', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (405, 2, 'Όλοι μαζί πείτε ροδάκινο', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (406, 3, 'سه دو یِک', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (407, 1, 'Three two one', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (408, 2, 'Τρία δύο ένα', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (409, 3, 'عَکس', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (410, 1, 'Photo', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (411, 2, 'Φωτογραφία', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (412, 3, 'آماده', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (413, 1, 'Ready', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (414, 2, 'Έτοιμοι', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (415, 3, 'عَکس بِگیریم', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (416, 1, 'Let’s take photo', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (417, 2, 'Ας βγάλουμε φωτογραφία', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (418, 3, 'به مَن نِگاه کُن', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (419, 1, 'Look at me', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (420, 2, 'Κοίταξε με', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (421, 3, 'لَبخَند بِزَنید', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (422, 1, 'Smile', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (423, 2, 'Χαμογελάστε', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (424, 3, 'عاشِقِ عَکاسیه', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (425, 1, 'He/she loves photography', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (426, 2, 'Λατρεύει τη φωτογραφία', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (427, 3, 'یه دوربینِ بُزُرگ و حِرفِه‌ای هَم داره', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (428, 1, 'He/she also has a big professional camera', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (429, 2, 'Έχει και μία μεγάλη επαγγελματική κάμερα', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (430, 3, 'آخه می‌دونی مَن عاشِقِ عَکّاسی‌َم', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (431, 1, '￼ well you know I’m in love with photography', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (432, 2, 'Ξέρεις λατρεύω τη φωτογραφία', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (433, 3, 'عَکّاسی خِیلی دوست دارَم', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (434, 1, 'I like photography very much', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (435, 2, 'Μου αρέσει πάρα πολύ η φωτογραφία', NULL, NULL, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (436, 1, 'Have you ever been to Isfahan?', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (437, 2, 'Έχεις πάει ποτέ στο Ισπαχάν;', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (438, 3, 'نه نَرَفتَم تاحالا', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (439, 1, '￼ no I’ve never been', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (440, 2, 'Όχι δεν έχω πάει ποτέ', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (441, 3, 'اِصفَهان شَهرِ قَشَنگیه', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (442, 1, 'Isfahan is a beautiful city', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (443, 2, 'Το Ισφαχάν είναι μία όμορφη πόλη', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (444, 3, 'بَچّه کُجایی؟', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (445, 2, 'Από που είσαι;', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (446, 3, 'دادا', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (447, 1, 'Bro', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (448, 2, 'Αδερφέ', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (449, 3, 'مَن بَچّه اِصفِهانَم', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (450, 1, 'I’m from Isfahan', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (451, 2, 'Είμαι από το Ισφαχάν', NULL, NULL, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (452, 3, 'شُما شیرازی هَستی؟', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (453, 1, 'Are you from Shiraz?', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (454, 2, 'Είσαι από το Σιράζ;', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (455, 3, 'بَنده اَهلِ شیرازَم', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (456, 2, 'Εγώ(ταπεινά) είμαι από το Σιράζ', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (457, 1, 'I(humble) am from Shiraz', NULL, NULL, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (458, 3, 'بابا', NULL, NULL, '2026-08-19 22:07:00.89806+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (459, 1, 'Dad', NULL, NULL, '2026-08-19 22:07:00.89806+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (460, 2, 'Μπαμπά', NULL, NULL, '2026-08-19 22:07:00.89806+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (461, 3, 'مامان', NULL, NULL, '2026-08-19 22:08:54.101576+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (462, 2, 'Μαμά', NULL, NULL, '2026-08-19 22:08:54.101576+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (463, 1, 'Mom/mum', NULL, NULL, '2026-08-19 22:08:54.101576+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (464, 3, 'وَطَن عِشقِ مَن', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (465, 1, 'Homeland, my love', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (466, 2, 'Πατρίδα αγάπη μου', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (467, 3, 'هَم‌وَطَن جانِ مَن', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (468, 1, 'Compatriot my soul', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (469, 2, 'Συμπατριώτη ψυχή μου', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (470, 3, 'وَطَن روحِ مَن', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (471, 1, 'Homeland ￼ my spirit', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (472, 2, 'Πατρίδα πνεύμα μου', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (473, 3, 'عزّ و ایمانِ مَن', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (474, 1, 'My honor in my faith', NULL, NULL, '2026-08-19 22:17:31.486025+03');
INSERT INTO public.sentences (id, language_id, text, normalized_text, audio_url, created_at) VALUES (475, 2, 'Η τιμή και η πίστη μου', NULL, NULL, '2026-08-19 22:17:31.486025+03');


--
-- Data for Name: dialogue_sentences; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (160, 60, 229, 1, 627, 2139);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (161, 60, 232, 2, 2373, 6691);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (162, 60, 235, 3, 6577, 7976);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (163, 60, 238, 4, 7904, 9930);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (164, 60, 241, 5, 31361, 32689);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (165, 60, 244, 6, 32603, 34254);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (166, 60, 247, 7, 33998, 35527);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (167, 60, 250, 8, 35503, 37646);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (168, 61, 219, 1, 4091, 6392);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (169, 61, 221, 2, 6403, 8626);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (170, 61, 223, 3, 8603, 10832);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (171, 61, 225, 4, 10803, 13125);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (172, 61, 195, 5, 13103, 15261);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (173, 61, 260, 6, 15303, 16411);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (174, 61, 263, 7, 16503, 17032);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (175, 61, 116, 8, 17103, 17637);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (176, 61, 225, 9, 17703, 18430);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (177, 62, 268, 1, 4790, 5832);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (178, 62, 271, 2, 8403, 10492);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (179, 62, 274, 3, 10503, 13532);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (180, 62, 277, 4, 13604, 15650);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (181, 62, 280, 5, 17403, 19928);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (182, 62, 282, 6, 26334, 28146);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (183, 63, 285, 1, 0, 1871);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (184, 63, 288, 2, 1903, 4151);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (185, 63, 291, 3, 4008, 20187);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (186, 64, 292, 1, 0, 2559);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (187, 64, 295, 2, 2603, 6323);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (188, 64, 167, 3, 6124, 6925);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (189, 64, 300, 4, 6865, 7725);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (190, 64, 303, 5, 7803, 8688);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (191, 64, 306, 6, 8929, 9575);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (192, 65, 309, 1, 0, 3147);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (193, 65, 312, 2, 3203, 4032);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (194, 65, 315, 3, 5327, 6556);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (195, 65, 318, 4, 7367, 9180);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (196, 65, 321, 5, 9203, 10327);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (197, 65, 324, 6, 10603, 12027);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (198, 65, 327, 7, 12501, 14641);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (199, 65, 330, 8, 15040, 31935);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (200, 65, 333, 9, 31981, 33644);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (201, 65, 336, 10, 33803, 35334);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (202, 65, 339, 11, 35304, 36359);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (203, 65, 342, 12, 36303, 37174);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (204, 65, 345, 13, 37103, 38496);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (205, 65, 348, 14, 38404, 39872);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (206, 65, 351, 15, 39901, 42532);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (209, 67, 55, 1, NULL, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (210, 67, 57, 2, 1450, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (211, 67, 69, 9, 14300, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (212, 67, 59, 3, 4000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (213, 67, 61, 4, 5300, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (214, 67, 63, 5, 7000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (215, 67, 65, 7, 11200, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (216, 67, 67, 8, 11650, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (217, 67, 57, 6, 8800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (218, 67, 71, 10, 15300, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (219, 67, 73, 11, 16800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (220, 67, 75, 12, 18000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (221, 67, 77, 13, 19200, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (222, 67, 79, 14, 20400, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (223, 67, 81, 15, 21650, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (224, 67, 124, 32, 45800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (225, 67, 124, 33, 47090, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (226, 67, 124, 34, 48370, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (227, 67, 124, 35, 49570, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (228, 67, 83, 16, 23000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (229, 67, 85, 17, 24100, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (230, 67, 87, 18, 26800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (231, 67, 89, 19, 28400, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (232, 67, 93, 22, 32000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (233, 67, 95, 23, 34550, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (234, 67, 97, 24, 36800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (235, 67, 99, 25, 37900, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (236, 67, 101, 26, 39800, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (237, 67, 103, 27, 41900, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (238, 67, 105, 28, 43000, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (239, 67, 107, 29, 43900, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (240, 67, 109, 30, 44300, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (241, 67, 111, 31, 44950, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (242, 67, 91, 20, 29100, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (243, 67, 89, 21, 30900, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (244, 67, 113, 36, 50400, NULL);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (245, 68, 356, 1, 0, 1427);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (246, 68, 359, 2, 1503, 2374);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (247, 68, 362, 3, 2403, 3730);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (248, 68, 365, 4, 3803, 4799);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (249, 68, 368, 5, 4803, 5830);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (250, 68, 365, 6, 8469, 14625);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (251, 68, 371, 7, 14703, 17303);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (252, 68, 374, 8, 17303, 18336);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (253, 68, 377, 9, 18303, 19248);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (254, 68, 380, 10, 19304, 20029);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (255, 68, 383, 11, 20089, 21322);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (256, 68, 384, 12, 21403, 22325);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (257, 68, 387, 13, 25500, 26928);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (258, 68, 390, 14, 27703, 28798);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (259, 68, 393, 15, 28703, 29794);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (260, 68, 365, 16, 29804, 30838);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (261, 69, 397, 1, 3041, 4527);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (262, 69, 400, 2, 7779, 9232);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (263, 69, 403, 3, 9303, 11222);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (264, 69, 406, 4, 11403, 13595);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (265, 69, 409, 5, 13603, 18859);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (266, 69, 412, 6, 18889, 19343);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (267, 69, 415, 7, 19880, 20528);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (268, 69, 418, 8, 24839, 25881);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (269, 69, 421, 9, 33415, 34495);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (270, 69, 424, 10, 34503, 35940);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (271, 69, 427, 11, 36003, 38200);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (272, 69, 430, 12, 40812, 42488);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (273, 69, 433, 13, 42489, 44045);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (274, 70, 178, 1, 0, 865);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (275, 70, 438, 2, 1103, 2183);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (276, 70, 441, 3, 2203, 3776);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (277, 70, 444, 4, 5893, 6861);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (278, 70, 446, 5, 6903, 7642);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (279, 70, 449, 6, 7603, 8836);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (280, 71, 452, 1, 7192, 8614);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (281, 71, 455, 2, 9233, 10758);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (282, 72, 458, 1, 0, 12579);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (283, 73, 461, 1, 0, 23530);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (284, 74, 464, 1, 0, 1459);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (285, 74, 467, 2, 1503, 3758);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (286, 74, 470, 3, 4003, 5695);
INSERT INTO public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) VALUES (287, 74, 473, 4, 5795, 7971);


--
-- Data for Name: email_verification_codes; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.email_verification_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('lilsbib5149@gmail.com', '83309a83d29812ee879e74c5fd3d1d4f4218a7cf6a123ba8276e8ade26c54a59', '2026-08-13 17:54:09.533+03', 0, '2026-08-13 17:44:10.334683+03');
INSERT INTO public.email_verification_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('lilsbib5150@gmail.com', '976a7a2d2a1e876dfb24620fa0376acc128a77c5ec1d27bad88b39ac250b4b7f', '2026-08-13 17:54:16.259+03', 0, '2026-08-13 17:44:17.067305+03');
INSERT INTO public.email_verification_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('lilsbib@gmail.com', '863ef7ed761feb3c12955cabdd0407ec6a8a6552ca12d10714479ab38f8b2a71', '2026-08-13 17:54:32.884+03', 0, '2026-08-13 17:44:33.708738+03');
INSERT INTO public.email_verification_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('inf2022001@ionio.gr', '05b9353a95ec44d324c22c7f1e39bfe300f80718db271dd0bf5a69a1900c0d29', '2026-08-13 17:57:03.122+03', 0, '2026-08-13 17:47:04.017084+03');
INSERT INTO public.email_verification_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('lilsbib5148@gmail.com', 'ee85a9de78085143251a1a1df36080c17e3ca7fd882f68524716afd5b06ccd7a', '2026-08-13 17:57:13.317+03', 0, '2026-08-13 17:47:14.142453+03');


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.feedback (id, category, message, email, user_agent, ip_address, created_at) VALUES (1, 'bug', 'You are a bug', 'matin.marzie5148@gmail.com', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '::ffff:192.168.1.3', '2026-08-14 02:29:52.92309+03');


--
-- Data for Name: letters; Type: TABLE DATA; Schema: public; Owner: root
--



--
-- Data for Name: password_reset_codes; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.password_reset_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('matin.marzie5148@gmail.com', '4eb53a7d546ec12bb2d9d616e2e5b0bab606db5b208605f9d4bd36fee4f6fac4', '2026-08-13 17:58:25.331+03', 0, '2026-08-13 17:48:25.332536+03');
INSERT INTO public.password_reset_codes (email, code_hash, expires_at, attempts, created_at) VALUES ('glosy.gr@gmail.com', '8a91941bfa0ee440569344f48e02c8c7be584fd32d83ef2258e34b3d87049f18', '2026-08-13 17:58:34.444+03', 0, '2026-08-13 17:48:34.44497+03');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.users (id, google_id, first_name, last_name, username, password_hash, email, profile_picture, joined_date, last_login, energy, coins, age, preferences, notifications, email_verified, coins_updated_at, energy_updated_at) VALUES (226, NULL, 'Sedkhareji', NULL, 'sedkhareji', '$2b$10$132FHfopkKF9bxi.VGuSL.mfElKsiFLS14GUIWnFfGdwj4hTBvd/.', 'sedkhareji@glosy.gr', '/profile_pictures/226/1787014375672-10ac6482-6f44-45ce-b7bb-98e36dad88d0.jpg', '2026-08-18 02:55:57.89093+03', '2026-08-19 22:00:07.30003+03', 100, 20, 21, 'Politics', true, true, '2026-08-18 02:55:57.89093+03', '2026-08-18 02:55:57.89093+03');
INSERT INTO public.users (id, google_id, first_name, last_name, username, password_hash, email, profile_picture, joined_date, last_login, energy, coins, age, preferences, notifications, email_verified, coins_updated_at, energy_updated_at) VALUES (227, NULL, 'nillmaart', NULL, 'nillma_art', '$2b$10$UcaD8aH7cVPA.DveZIs7Q.ZhxMLReJ23SNxUg.MgGtRqXmGPC78NS', 'nillma_art@glosy.gr', '/profile_pictures/227/1787165506349-5323e11d-4bb3-4c5c-b451-721c904b7027.jpeg', '2026-08-19 21:51:02.862382+03', '2026-08-19 22:03:45.842719+03', 100, 20, 25, 'News,Movies', true, true, '2026-08-19 21:51:02.862382+03', '2026-08-19 21:51:02.862382+03');
INSERT INTO public.users (id, google_id, first_name, last_name, username, password_hash, email, profile_picture, joined_date, last_login, energy, coins, age, preferences, notifications, email_verified, coins_updated_at, energy_updated_at) VALUES (208, NULL, 'Matin', NULL, 'matin', '$2b$10$MTHXYnjQ.ryp4paPG5XC2u1ELzz7gmNTcMCPJYaV0GCqXc9J3I9DC', 'matin.marzie5148@gmail.com', '/profile_pictures/208/1786893349890-66050ab2-7995-476b-96f1-ad119f6af483.jpeg', '2026-08-13 16:31:26.953923+03', '2026-08-17 22:58:57.258659+03', 100, 492556, 25, 'News,Politics,Movies', true, true, '2026-08-16 16:22:08.763598+03', '2026-08-16 16:22:08.763598+03');
INSERT INTO public.users (id, google_id, first_name, last_name, username, password_hash, email, profile_picture, joined_date, last_login, energy, coins, age, preferences, notifications, email_verified, coins_updated_at, energy_updated_at) VALUES (228, NULL, 'Abduzs', NULL, 'abdu_z1s', '$2b$10$r1BMw0xPzktOYFYt0mw9uuncdnCVQwVJ3cAaziul9LOjWn7VD3n0S', 'abdu_z1s@glosy.gr', NULL, '2026-08-19 22:36:10.720068+03', '2026-08-19 22:36:10.727908+03', 100, 20, 25, 'Movies', true, true, '2026-08-19 22:36:10.720068+03', '2026-08-19 22:36:10.720068+03');


--
-- Data for Name: reels; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (58, 3, 60, 226, '/reels/226/1787012855195-c54ac478-22c7-487c-9194-74ac7e2a246d.mp4', '/reels/226/1787012855756-ec4e8199-a734-4506-a506-80415a1a8344.jpg', NULL, 58, '2026-08-18 03:27:35.842704+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (59, 1, 61, 226, '/reels/226/1787013679616-5c83a958-1de5-463a-bb11-3c7ebc685afc.mp4', '/reels/226/1787013681328-e1a1c96f-19b3-4747-aefa-849a5e2826de.jpg', NULL, 43, '2026-08-18 03:41:21.391945+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (60, 3, 62, 226, '/reels/226/1787015439194-d0a8ac7e-d0ad-48ed-bed3-0346fe76abf2.mp4', '/reels/226/1787015442029-8b7a4f46-f8b9-49c7-9e7e-9fa5098cb0b4.jpg', 'روزِ مُعَلِّم مُبارَک', 45, '2026-08-18 04:10:42.121291+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (61, 3, 63, 226, '/reels/226/1787090056153-c0e092ab-014b-414c-8b87-15c9c7407e36.mp4', '/reels/226/1787090056508-a8b5c262-85ca-4184-8d84-333ab5d82c45.jpg', NULL, 21, '2026-08-19 00:54:16.732353+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (62, 3, 64, 226, '/reels/226/1787091091437-023a045c-235a-4a65-8415-473775ecc16c.mp4', '/reels/226/1787091093666-d218ab30-07c2-4873-ade5-6dc10a18036b.jpg', NULL, 58, '2026-08-19 01:11:33.756842+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (63, 3, 65, 226, '/reels/226/1787143885878-79eeb31a-fa14-4dab-88e2-2d4502b19381.mp4', '/reels/226/1787143887344-c41b8d8a-2603-41c6-bb44-8b2d62d05b50.jpg', NULL, 43, '2026-08-19 15:51:27.558348+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (65, 3, 67, 226, '/reels/226/1787144185821-860aac8b-b4d2-4655-8a98-d6610bb1bf49.mp4', '/reels/226/1787144187891-495f8d1c-dbfb-4100-adfe-7dcb07783cad.jpg', 'چایی یا قَهوه؟', 53, '2026-08-19 15:56:27.967999+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (66, 3, 68, 226, '/reels/226/1787147824711-65c367f1-8337-4dea-a7fb-020736b7a856.mp4', '/reels/226/1787147826078-a52cc15e-e597-4757-bd00-6a090a55c0e4.jpg', NULL, 31, '2026-08-19 16:57:06.145284+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (67, 3, 69, 226, '/reels/226/1787154003456-02b48469-c8ff-4502-9c14-cf2e78221dd4.mp4', '/reels/226/1787154005926-83b93434-37de-44ef-9727-44ff3b66f839.jpg', NULL, 44, '2026-08-19 18:40:06.020067+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (68, 3, 70, 226, '/reels/226/1787156164587-b891f8f6-ff45-4e3f-bd59-fdc770524f40.mp4', '/reels/226/1787156167353-6d6f9fd5-abe7-4365-a05b-37efc0345af2.jpg', NULL, 48, '2026-08-19 19:16:07.424643+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (69, 3, 71, 226, '/reels/226/1787156703725-7d417b21-2776-4f29-a975-c10ab0ac3d6e.mp4', '/reels/226/1787156706271-69b636ca-64d2-4713-9e89-a7fa7c74ee2a.jpg', NULL, 60, '2026-08-19 19:25:06.34652+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (70, 3, 72, 227, '/reels/227/1787166419366-38b13507-542a-420e-828c-7962433293a7.mp4', '/reels/227/1787166420668-27cbb180-f403-4131-9494-fc5342910e2e.jpg', NULL, 16, '2026-08-19 22:07:00.89806+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (71, 3, 73, 227, '/reels/227/1787166532346-84e92a56-6726-4a82-8149-ec87ce5c4cf0.mp4', '/reels/227/1787166534011-22a4246a-5e89-4a89-846a-58d17248e133.jpg', 'مامان', 27, '2026-08-19 22:08:54.101576+03');
INSERT INTO public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, duration, created_at) VALUES (72, 3, 74, 227, '/reels/227/1787167049472-0212dbd7-2b01-4104-89ef-2dacce629267.mp4', '/reels/227/1787167051420-e5002a11-9cbd-450f-9ea7-ee02524681b5.jpg', 'وَطَن', 17, '2026-08-19 22:17:31.486025+03');


--
-- Data for Name: reel_interactions; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (11, 58, 208, '2026-08-18 03:41:38.250839+03', true, true, NULL, NULL, false);
INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (31, 60, 208, '2026-08-18 05:03:42.897549+03', true, false, NULL, NULL, false);
INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (10, 58, 226, '2026-08-18 03:27:42.285434+03', true, false, NULL, NULL, false);
INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (16, 59, 208, '2026-08-18 03:43:37.873522+03', true, false, NULL, NULL, false);
INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (14, 59, 226, '2026-08-18 03:42:35.512083+03', false, false, NULL, NULL, false);
INSERT INTO public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared) VALUES (35, 60, 226, '2026-08-18 05:05:55.152356+03', false, false, NULL, NULL, false);


--
-- Data for Name: reel_reports; Type: TABLE DATA; Schema: public; Owner: root
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (116, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '713c377b0f86f36537a96d1619ca50f731c8516fb122de5e5471a9ffe2f0814c', '2026-08-13 18:07:49.055992+03', '2026-11-11 16:56:57.917+02', '2026-08-13 18:08:46.333943+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 18:07:49.055992+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (208, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'e864e118f08751429168b96c8eae09ccb75cfc65c53ddacc9b2cc943a84a7fce', '2026-08-17 17:46:34.257245+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:11:13.996945+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:46:34.257245+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (209, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '26c6746ce02d6aa28c13c0e9364cf329054c93112960ecd606490b81e73f10e9', '2026-08-17 18:11:13.996945+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:12:14.457362+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:11:13.996945+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (210, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '1ed7cbebe3fa97f8a954b1e7b109929b680a220391d79bfbadbabc5e1024e180', '2026-08-17 18:12:14.457362+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:13:17.282694+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:12:14.457362+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (34, 208, 'e72ae5a9-f2d5-4302-8459-c6ba40efae48', 'b3e145045c2cc76d6ccfc5b6ad085ba17a129b861f9345c5b55d9984f2ef6d1e', '2026-08-13 16:31:26.9603+03', '2026-08-13 16:36:26.959+03', '2026-08-13 16:33:10.438951+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:31:26.9603+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (35, 208, 'e72ae5a9-f2d5-4302-8459-c6ba40efae48', 'e905aee062809cfe39aabb758f5b30c68b3fbdb8ac2da2e00ad97ecc5d1bacb7', '2026-08-13 16:33:10.438951+03', '2026-08-13 16:36:26.959+03', '2026-08-13 16:34:20.098568+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:33:10.438951+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (212, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'f1318201252c55b6a9f70cf45a89be9c63320d597e383b9efd911798a718abd3', '2026-08-17 18:13:56.09918+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:16:18.756413+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:13:56.09918+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (36, 208, 'e72ae5a9-f2d5-4302-8459-c6ba40efae48', 'c13001a9e13566c53564d35be4b9f0b3d08ef7592980a21f04cc43852a1ba210', '2026-08-13 16:34:20.098568+03', '2026-08-13 16:36:26.959+03', '2026-08-13 16:34:54.778108+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:34:20.098568+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (37, 208, 'e72ae5a9-f2d5-4302-8459-c6ba40efae48', 'fa3b1495456d68c6b5539a5ece76061cc668d9b8bb5b76a8a134a7aefd0398d3', '2026-08-13 16:34:54.778108+03', '2026-08-13 16:36:26.959+03', '2026-08-13 16:35:37.729338+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:34:54.778108+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (38, 208, 'e72ae5a9-f2d5-4302-8459-c6ba40efae48', '8e2d932003807f113b75e2dcda3482e707e27474d45d8daa04c370ce9d8a6798', '2026-08-13 16:35:37.729338+03', '2026-08-13 16:36:26.959+03', '2026-08-13 16:36:38.619142+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:35:37.729338+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (39, 208, '5b290ea8-2285-41de-99ab-023b283c531f', '1630abb031f7d7b963f0e2d0e6530b7f65e0b88b53fee97021cb6066defcda2e', '2026-08-13 16:38:23.938729+03', '2026-08-13 16:43:23.938+03', '2026-08-13 16:39:27.226057+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:38:23.938729+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (40, 208, 'c34b68e4-dac2-4b88-baf6-6e166ecfbe47', '3b7218cd2ef296533dbbc62424946b03e8efdec5b97e6b4e0d2085344dcbc734', '2026-08-13 16:59:14.024387+03', '2026-08-13 17:04:14.024+03', '2026-08-13 16:59:22.76781+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 16:59:14.024387+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (45, 208, '227c4041-cbf2-4cda-a71c-dd2c24575d9c', '0d056f9a37ace13c240704c6bee8c06f6681d299451def068c1d21004345641a', '2026-08-13 17:09:02.824196+03', '2026-08-13 17:14:02.823+03', '2026-08-13 17:18:56.805855+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:09:02.824196+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (46, 208, '6ffec977-fc58-4337-8f21-5f9a9e3ee136', '182cdbb4a62ffb61394e25aa3c5bb770c5e9bd743ccac155c4b5c902db35d0ee', '2026-08-13 17:19:11.219613+03', '2026-11-11 16:19:11.218+02', '2026-08-13 17:19:19.397952+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:19:11.219613+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (47, 208, 'b02d64f2-bd2c-4b08-b01c-49bd4d23464e', '5aff685742c391c587c6fc4795d4d2d88925f377b27114a435a6a1e9d8a70f42', '2026-08-13 17:19:35.443095+03', '2026-11-11 16:19:35.442+02', '2026-08-13 17:19:47.317264+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:19:35.443095+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (48, 208, 'cc57506f-93d1-4650-8a1b-2ec2d2afac57', 'c426bd8407e45669052dcaddafec8ebc74a2f9c691fe36a7ab26c0789ce6b8c0', '2026-08-13 17:20:36.122882+03', '2026-11-11 16:20:36.122+02', '2026-08-13 17:20:45.686924+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:20:36.122882+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (49, 208, '84e2713d-e0b3-40e6-8f74-dfcb17c64d1d', '3b2266b4870a14c01fb3cbf930335b8b68cb3e01642045ae6485259f1d7da55b', '2026-08-13 17:22:57.110888+03', '2026-11-11 16:22:57.11+02', '2026-08-13 17:26:08.852365+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:22:57.110888+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (50, 208, '84e2713d-e0b3-40e6-8f74-dfcb17c64d1d', '55c5149a32f5472512a269ae595fc1755b1bf810cca6b294865c0bdf0398670c', '2026-08-13 17:26:08.852365+03', '2026-11-11 16:22:57.11+02', '2026-08-13 17:26:19.733848+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:26:08.852365+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (51, 208, '84e2713d-e0b3-40e6-8f74-dfcb17c64d1d', '993e227612c480ab030935516426ad64392f1f0fd803043b616f6e0793b1d9e1', '2026-08-13 17:26:19.733848+03', '2026-11-11 16:22:57.11+02', '2026-08-13 17:26:31.850292+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:26:19.733848+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (117, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '9437cd3ac59d86bda70756063d614468166d6ff09b390893e5f5eeb5872cddf2', '2026-08-13 18:08:46.333943+03', '2026-11-11 16:56:57.917+02', '2026-08-13 21:56:10.277468+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 18:08:46.333943+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (133, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '31c668c70b0c3884a4baff312194bb9729f8506c283aabfa7fde3bf2131bfcbe', '2026-08-13 21:56:10.277468+03', '2026-11-11 16:56:57.917+02', '2026-08-13 22:00:07.011901+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 21:56:10.277468+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (134, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '39b63fe4349dab4470b5cb17fcdf9b6d9c9c0582e5bab045eedb8773b1ffc079', '2026-08-13 22:00:07.011901+03', '2026-11-11 16:56:57.917+02', '2026-08-14 01:48:09.964713+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 22:00:07.011901+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (135, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', 'fab34c3f6a25741bba0509a840f76e1496986ec716081fcc803181047a6f283d', '2026-08-14 01:48:09.964713+03', '2026-11-11 16:56:57.917+02', '2026-08-14 02:17:12.542723+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 01:48:09.964713+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (136, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '9ab584f5cac27cd98bc616c3002b77ae482d4ab89acd032730a0eaba46bf2b65', '2026-08-14 02:17:12.542723+03', '2026-11-11 16:56:57.917+02', '2026-08-14 02:47:49.115601+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 02:17:12.542723+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (137, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '9df2bd9a555b8d9c7a73a09cb69d440406ba981a40d04f7757e26d4fdec2c8b4', '2026-08-14 02:47:49.115601+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:01:19.055354+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 02:47:49.115601+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (138, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '9ea67dbf72626d73587a109298e84dd643cbf9b4f5b6523fe0cf959890da94b7', '2026-08-14 03:01:19.055354+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:11:23.27036+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:01:19.055354+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (139, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', 'b6a3e0f5aa42db0f32814ed2d146ca9989e9304481df19ad4676d0154d9ffd45', '2026-08-14 03:11:23.27036+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:11:24.00474+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:11:23.27036+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (140, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '2734e16248c4700321b9ed898e2bf769ada1f13d13f70aa3a1f2bce347730bc4', '2026-08-14 03:11:24.00474+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:12:21.471492+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:11:24.00474+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (141, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '8536d6d38d650f98d5b3aa9495d9e6ad23636714e75b470907edecbb5d6c2724', '2026-08-14 03:12:21.471492+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:13:12.364311+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:12:21.471492+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (142, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', 'a559fcb633622a73cbee484a197d8d25b5079a42933b12909b2c6f9f52dd50d4', '2026-08-14 03:13:12.364311+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:31:59.863821+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:13:12.364311+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (52, 208, '5c994869-2cbb-48f5-9ba9-042c8f600f27', 'fb926d13c3b5964c2fee156a699a5147deb494f77245561001ab325623937fa2', '2026-08-13 17:35:33.998452+03', '2026-11-11 16:35:33.997+02', '2026-08-13 17:43:24.678066+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:35:33.998452+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (143, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '2b11c05eaf4cdd047aadc0aeff5315697e4db493f7f943ee1620480dcdc7a36b', '2026-08-14 03:31:59.863821+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:33:35.020731+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:31:59.863821+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (145, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '1d5afb12148d5c15a0198acdb133dad21e2f70c2b42ad04e9a7d80856ba1febc', '2026-08-14 03:36:39.978456+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:45:58.940547+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:36:39.978456+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (98, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '72c2e375acaec0b3b3f86f21cf89109bdab82cc9c53d56e5249f96677aee3bc1', '2026-08-13 17:56:57.918488+03', '2026-11-11 16:56:57.917+02', '2026-08-13 18:07:08.930294+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 17:56:57.918488+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (114, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '1cf46e348d76689e362fe8d1a4429f6b58752abaf120c4c79dd898ea774a5a81', '2026-08-13 18:07:08.930294+03', '2026-11-11 16:56:57.917+02', '2026-08-13 18:07:32.47927+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 18:07:08.930294+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (115, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '07415d3c0c3118027c848799a169d75d36d152bc8e0d27abbd5fe3f16aebfd2c', '2026-08-13 18:07:32.47927+03', '2026-11-11 16:56:57.917+02', '2026-08-13 18:07:49.055992+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-13 18:07:32.47927+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (144, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '7ba413fa82df776da8fbbc5443a1e5998da8cabbf6502aab3fd62fabfb3f66b8', '2026-08-14 03:33:35.020731+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:36:39.978456+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:33:35.020731+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (207, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '22d875ce8e532e42ccc320214e7e59e8d8a494b5ce5f96b54c0d4ef3b2aa238b', '2026-08-17 17:45:04.972015+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:46:34.257245+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:45:04.972015+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (147, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '363afc9e21451ff00f3af35000749db7c834060e7ba90a5f0b59a6b6c7d4fd2c', '2026-08-14 03:46:00.32377+03', '2026-11-11 16:56:57.917+02', NULL, NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:46:00.32377+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (146, 208, 'bc708836-e16e-4e64-804e-f7a010ab2819', '7b220924ff6fd9e8afc121f31a6ed36bd9194d2e3c85a8eb3a9a8bf50d6f15cc', '2026-08-14 03:45:58.940547+03', '2026-11-11 16:56:57.917+02', '2026-08-14 03:46:00.32377+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-14 03:45:58.940547+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (211, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '00ecc5757544504c82db79e773e759eb78199a34e5d22f6ee995381562ce9f0d', '2026-08-17 18:13:17.282694+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:13:56.09918+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:13:17.282694+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (171, 208, '6f5902e6-a8e7-4595-8581-2185c3a550b2', 'c120bea732ad37024b4ba83035c1d7f001d4c2105d54ddce564644c1acb046d8', '2026-08-16 18:14:33.833882+03', '2026-11-14 17:14:33.833+02', '2026-08-16 18:16:03.627867+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 18:14:33.833882+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (213, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'd9625f57ac3655ee0a3bbc7737d0a481fa6522514fbcb422955637480d4f29bb', '2026-08-17 18:16:18.756413+03', '2026-11-15 13:05:13.632+02', '2026-08-17 18:29:38.75491+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:16:18.756413+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (214, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '6c176c73336dfe7e48d129f29034a3ec16e5302685a2915d09d3ebd971968059', '2026-08-17 18:29:38.75491+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:00:23.075197+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 18:29:38.75491+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (215, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'c5235c5f38df72acfa371539ed0f89a884a30ef060db211988d8c2cc6c81bb74', '2026-08-17 19:00:23.075197+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:02:29.181523+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:00:23.075197+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (216, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'a00d54fd648481d28ad685adfb42f76f524178eba99615aa8a08cfa0d5409a51', '2026-08-17 19:02:29.181523+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:04:21.890026+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:02:29.181523+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (218, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', '13a1d6af9163c096c412a172994735248cc96b78f1e5b1fe704773a69482b1e2', '2026-08-17 19:07:48.162259+03', '2026-11-15 18:07:48.161+02', '2026-08-17 19:09:37.566877+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:07:48.162259+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (176, 208, '40a1dc75-9cfd-4954-b09a-fe7c805cc058', '767e0ad5123d9f027478c6dc5b1af7883cc9904ad160bea4112af3bf17bdf61f', '2026-08-16 22:54:27.19939+03', '2026-11-14 21:54:27.199+02', '2026-08-16 22:56:35.117762+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 22:54:27.19939+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (177, 208, '40a1dc75-9cfd-4954-b09a-fe7c805cc058', 'd18f2c3dc1a759018737f6b9fac85ca9cf65c2c398e0cf9e2d1c8bf5e10c4fc7', '2026-08-16 22:56:35.117762+03', '2026-11-14 21:54:27.199+02', '2026-08-16 22:58:20.779892+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 22:56:35.117762+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (220, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', '3ea56a80340516e61bc2f75d56c3e412c03e75457106248db651e683559a8c52', '2026-08-17 19:10:02.589666+03', '2026-11-15 18:07:48.161+02', '2026-08-17 19:16:15.510436+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:10:02.589666+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (178, 208, '40a1dc75-9cfd-4954-b09a-fe7c805cc058', 'cd804d780057c94b8590a32069be4e9cdbbb7c8cc9dbaab05da4ffcf823d1061', '2026-08-16 22:58:20.779892+03', '2026-11-14 21:54:27.199+02', '2026-08-16 23:02:45.227487+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 22:58:20.779892+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (179, 208, '40a1dc75-9cfd-4954-b09a-fe7c805cc058', '8d80dc569ba1d1cb5e0181aa4e905c1344c490c1c1772a1aed063f890f97961f', '2026-08-16 23:02:45.227487+03', '2026-11-14 21:54:27.199+02', '2026-08-16 23:02:53.776838+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 23:02:45.227487+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (217, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '6c23994e5067aa7f7d331b2110f5f933076d4545fcc33193c5f6f54340e7b11a', '2026-08-17 19:04:21.890026+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:18:55.59786+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:04:21.890026+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (180, 208, '91fa08d6-0bc8-4e89-8ae8-30716b70a767', '8134841e20073f3a197e8ff258de145d29f843d96054487e5866c5c2f4986a3d', '2026-08-16 23:03:00.855681+03', '2026-11-14 22:03:00.855+02', '2026-08-16 23:10:34.688224+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 23:03:00.855681+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (181, 208, '91fa08d6-0bc8-4e89-8ae8-30716b70a767', '937e66c94d62e26861c02a05b2e327a44ab82ebd71774f4a3bc13be7746e1275', '2026-08-16 23:10:34.688224+03', '2026-11-14 22:03:00.855+02', '2026-08-16 23:10:41.533743+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 23:10:34.688224+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (182, 208, '91fa08d6-0bc8-4e89-8ae8-30716b70a767', '553e380972869e0116dc4b4c4c427614d782549196ab33a36c362f53ce625d6c', '2026-08-16 23:10:41.533743+03', '2026-11-14 22:03:00.855+02', '2026-08-16 23:16:46.315529+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-16 23:10:41.533743+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (191, 208, '6f63fab2-ae7b-4433-8ec5-7c548b588a09', '229b5aecd4b1dbb09553b8d7c627a19f553a7d82a4a51a4551828017b9c326a9', '2026-08-17 00:08:11.997776+03', '2026-11-14 23:08:11.997+02', '2026-08-17 14:00:43.307538+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 00:08:11.997776+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (192, 208, '6f63fab2-ae7b-4433-8ec5-7c548b588a09', 'c5f2e95f2fdc965786d1279a7962fe30603d148f344a4ebe84e1213921ff43ee', '2026-08-17 14:00:43.307538+03', '2026-11-14 23:08:11.997+02', '2026-08-17 14:03:15.367699+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:00:43.307538+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (193, 208, '6f63fab2-ae7b-4433-8ec5-7c548b588a09', '1f1c0bfee39dbbc144fac138bfdfc58a8b5f1686317a1171755f5f312fb69ae0', '2026-08-17 14:03:15.367699+03', '2026-11-14 23:08:11.997+02', '2026-08-17 14:05:04.724334+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:03:15.367699+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (194, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '99dcbb1410799bd865d6ba5ab2ed6d7f6eac8c6331aea0e7328dd9ede6df0f4f', '2026-08-17 14:05:13.633253+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:07:57.488617+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:05:13.633253+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (195, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '33b7d379af9ac2fb8af8011aad0a8ba175a4b77a1ac61803ca900c7fae9d393f', '2026-08-17 14:07:57.488617+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:11:23.35354+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:07:57.488617+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (196, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '92d66616a31a587a883424d88b136fa5104f29b35b70ee3392b16beae2e0f302', '2026-08-17 14:11:23.35354+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:14:02.354058+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:11:23.35354+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (197, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'fdb24042d9a5eb1b3893b1816048562c1142279882d18782012841d89c16bf60', '2026-08-17 14:14:02.354058+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:48:55.408941+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:14:02.354058+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (198, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'c08306e7f9afd295744aa193fd0d297785eff05c5ae7cd6da788a2146a8ec783', '2026-08-17 14:48:55.408941+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:49:50.62638+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:48:55.408941+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (199, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '4982533d1774b172f237b2a25f3b07ffcd8fbcc0928f8a6ebf844c9b5163dcf6', '2026-08-17 14:49:50.62638+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:54:03.724128+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:49:50.62638+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (200, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '42c3d55b6913b92b99226d12aa29c73d00452ba0d940ce4df2cbfa685588992e', '2026-08-17 14:54:03.724128+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:55:15.797614+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:54:03.724128+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (201, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'f5bb8edc7f609dd31d3e2d0a9d2c14d71a0cfa00672cc79c498f7940263084d4', '2026-08-17 14:55:15.797614+03', '2026-11-15 13:05:13.632+02', '2026-08-17 14:57:28.903422+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:55:15.797614+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (202, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'e486dcc35b6625f2de9014dd34460bbd464104273fbc89110e72979e112f47a7', '2026-08-17 14:57:28.903422+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:31:46.65486+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 14:57:28.903422+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (203, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'e61c4577d589e2e3b8ee578fe43a63467e37a60d07cea145a4c3bf43455ea648', '2026-08-17 17:31:46.65486+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:40:53.380151+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:31:46.65486+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (204, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '7377ef8feb5b61799a2976fdc7acba81b763cf0aa3c5bfc39198c51aa016c3b5', '2026-08-17 17:40:53.380151+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:42:55.314356+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:40:53.380151+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (205, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '14222479beeeef44ad552674d95cee66568b6901a6da52b3227f705e6ea00e3b', '2026-08-17 17:42:55.314356+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:43:41.796769+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:42:55.314356+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (206, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'f2693d0f35893dafaf377de3007d34b7daa96ade4ffc90822b2c2dbfab56a8f8', '2026-08-17 17:43:41.796769+03', '2026-11-15 13:05:13.632+02', '2026-08-17 17:45:04.972015+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 17:43:41.796769+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (219, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', '07a491292c31e6d064300b13a1a5f58bb659a462fd7c07ae7713d80f1036b718', '2026-08-17 19:09:37.566877+03', '2026-11-15 18:07:48.161+02', '2026-08-17 19:10:02.589666+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:09:37.566877+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (221, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', '9083807ba5ea1ee37a80e07c069dad5462d010a43baaff4a644d4670daae4191', '2026-08-17 19:16:15.510436+03', '2026-11-15 18:07:48.161+02', '2026-08-17 19:16:25.739814+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:16:15.510436+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (223, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', 'aba84090ac1659028f3cdef27d5c8e9736c54c723c87f5b08c3c42164a18501f', '2026-08-17 19:17:35.753304+03', '2026-11-15 18:07:48.161+02', NULL, NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:17:35.753304+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (222, 208, 'e5eb042c-c0d2-477c-bc99-91a9e1285463', 'cc4b4b9d16fff0f26390d751c1408e31b36010d223478e9a039f4374a9f453ce', '2026-08-17 19:16:25.739814+03', '2026-11-15 18:07:48.161+02', '2026-08-17 19:17:35.753304+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:16:25.739814+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (224, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'f74717b6b3b3e4a80efa878cddd6ae79e788619043c0f876d92b00800044f818', '2026-08-17 19:18:55.59786+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:20:38.815332+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:18:55.59786+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (225, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', 'bdf6746368e2a5898d99861729103fb4e0d34a49391cdf56fc8b093f4c1d3e6f', '2026-08-17 19:20:38.815332+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:23:44.714606+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:20:38.815332+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (226, 208, 'dc0bb8ca-f523-4242-b200-b9d25f55c928', '3f4cc6513e8e54a36a8705ac97087e99dfc8c3d2bebb7b59a1791b2c345aeadd', '2026-08-17 19:23:44.714606+03', '2026-11-15 13:05:13.632+02', '2026-08-17 19:24:30.24128+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:23:44.714606+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (227, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '64e9b08c1d3cce891f458bba7e827c717cfb60ee5221ec9d6a727d5bdde65e59', '2026-08-17 19:24:38.245424+03', '2026-11-15 18:24:38.245+02', '2026-08-17 19:35:35.965775+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:24:38.245424+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (228, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'e93af8e9d6ed652e29be729a35dbe013bdff8fedca362bb1cd876295a663c6f3', '2026-08-17 19:35:35.965775+03', '2026-11-15 18:24:38.245+02', '2026-08-17 19:37:07.666282+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:35:35.965775+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (229, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '127500635081e53a1872e52ad09a5d3dea70a8eeb96f0a78bfb7c626b9cfacd5', '2026-08-17 19:37:07.666282+03', '2026-11-15 18:24:38.245+02', '2026-08-17 19:51:23.972142+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:37:07.666282+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (231, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '6fe93e0fc7a4bd0d5e7fe6957bdcc27a009fe9a0ac085b12e73b855dd0e28950', '2026-08-17 19:51:23.972142+03', '2026-11-15 18:24:38.245+02', '2026-08-17 19:56:30.516119+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:51:23.972142+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (232, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'b179964459b65d0926465b4aeb61fc8e8144ef89a6b12c9ed70d523cfd7ab361', '2026-08-17 19:56:30.516119+03', '2026-11-15 18:24:38.245+02', '2026-08-17 19:58:24.238015+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:56:30.516119+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (233, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '9b2369cabebaee0cf5946d92747d244f599acd6a6d24725495a652cfa3030815', '2026-08-17 19:58:24.238015+03', '2026-11-15 18:24:38.245+02', '2026-08-17 20:13:59.294644+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 19:58:24.238015+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (234, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '2cc44ad3ee978a8ccbdfbdb2b2a96126f604f1cdf00cd1fa53d44fbe3b4ba912', '2026-08-17 20:13:59.294644+03', '2026-11-15 18:24:38.245+02', '2026-08-17 20:15:01.487512+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 20:13:59.294644+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (235, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '05e40f28ea03ce6d2811cd8567fe76d1859ade0528f90ff5d228b4c1547f198a', '2026-08-17 20:15:01.487512+03', '2026-11-15 18:24:38.245+02', '2026-08-17 20:17:47.145159+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 20:15:01.487512+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (230, 208, '9107cab1-d9fd-477b-a23f-f68db683049a', 'f5a16fc8e59b5b66df4ac32431ec30f891be5f34d6c804fbbe7954369128dedd', '2026-08-17 19:43:46.302626+03', '2026-11-15 18:43:46.302+02', '2026-08-17 20:19:09.827581+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 19:43:46.302626+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (237, 208, '9107cab1-d9fd-477b-a23f-f68db683049a', '22c7cf7da771cdb788f849cafc5d21003cf8bbfee8cb652fb73a3c05575d0e5c', '2026-08-17 20:19:09.827581+03', '2026-11-15 18:43:46.302+02', '2026-08-17 20:27:48.136953+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 20:19:09.827581+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (236, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'a0671d3d336ff451eff7f74c615855343af7bf13f0b5b19e4a99e28c59783636', '2026-08-17 20:17:47.145159+03', '2026-11-15 18:24:38.245+02', '2026-08-17 20:30:57.43342+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 20:17:47.145159+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (239, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '629451b1ddab5ab0f9235ef49492ff4900b80af628c46450d9c11cac1f6261cd', '2026-08-17 20:30:57.43342+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:05:45.339379+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 20:30:57.43342+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (240, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '4a820b2eb289055b649c8bfc1ad8a610cbd8bdf2d2669d0f9cec979aa94d7dce', '2026-08-17 21:05:45.339379+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:06:21.443152+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:05:45.339379+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (241, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '56613ac28d1476cde0813713902b2c758439f644f504b62ebf848ba9dc34847e', '2026-08-17 21:06:21.443152+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:18:16.469209+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:06:21.443152+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (242, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'fd7ba7700d1a2b86ca258d7dcd23e1dcf2b25f6f1206bae7741b825391af5f78', '2026-08-17 21:18:16.469209+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:26:52.738075+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:18:16.469209+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (243, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '9ce66b0371e02b94b02afd6c8fb80cb7760b44098ce3c03da090b2a6eb6c2e7b', '2026-08-17 21:26:52.738075+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:27:07.030171+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:26:52.738075+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (244, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '150557c7117dd50d88ecf959bc54431c9488cd564019a1a590a85aee3597db2c', '2026-08-17 21:27:07.030171+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:29:26.599173+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:27:07.030171+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (245, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'c540ec9067698ea2f84b0bd8a0c74d5a7dec38e4017e323cf8fddac2338a7dcd', '2026-08-17 21:29:26.599173+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:39:35.228454+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:29:26.599173+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (238, 208, '9107cab1-d9fd-477b-a23f-f68db683049a', 'f4d802ad00935d6121e74ba491a2400ade58a126f10b38311c79d1afa576132c', '2026-08-17 20:27:48.136953+03', '2026-11-15 18:43:46.302+02', '2026-08-17 21:42:18.427265+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 20:27:48.136953+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (247, 208, '9107cab1-d9fd-477b-a23f-f68db683049a', 'c5dd11c5c2cd41138df191ef220b8f3ff628aba1afc5d90d8146abe713e7983c', '2026-08-17 21:42:18.427265+03', '2026-11-15 18:43:46.302+02', '2026-08-17 21:42:42.246222+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 21:42:18.427265+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (246, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '0f2f660e34422e71dd5e293c116b96ef1b25fce977d69c7e486ad53e74480ad9', '2026-08-17 21:39:35.228454+03', '2026-11-15 18:24:38.245+02', '2026-08-17 21:43:43.584704+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:39:35.228454+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (248, 208, '48c9a583-c5b6-4072-b736-8c7f0afe1830', '022b8d5b3c60ba7725ac5875bae75f6fb279712c3bb6bf128a4eaed3c362fc8d', '2026-08-17 21:42:56.163431+03', '2026-11-15 20:42:56.163+02', '2026-08-17 22:01:46.722411+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 21:42:56.163431+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (250, 208, '48c9a583-c5b6-4072-b736-8c7f0afe1830', '07bf3efe891a7e605f0883b3835b7c2ed4485b0d1506e0f69d9ecb07d7cebc5d', '2026-08-17 22:01:46.722411+03', '2026-11-15 20:42:56.163+02', '2026-08-17 22:16:42.250312+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:01:46.722411+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (251, 208, '48c9a583-c5b6-4072-b736-8c7f0afe1830', 'e196a9f662529f1afed0ca6b9ab02d824b8130e457988ab3322b4167b343d86b', '2026-08-17 22:16:42.250312+03', '2026-11-15 20:42:56.163+02', '2026-08-17 22:18:50.183073+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:16:42.250312+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (252, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '98bc9e75ccc1d6419276530f150e087bd57800b8261505c6d9ec2f2298a0ec81', '2026-08-17 22:19:00.297968+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:25:24.065106+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:19:00.297968+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (253, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '8a110f28b426afca3bbff9bb22b6744e16d46ff6bbd3345bcc97b599c596be8a', '2026-08-17 22:25:24.065106+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:33:32.854436+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:25:24.065106+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (255, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '6bd893fd2c6a67062a28a0e1c775655e0c7f47548c67abe5f2599f514a436ba6', '2026-08-17 22:38:55.182405+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:49:07.105506+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:38:55.182405+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (259, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '46710299294410225ac4f7bd8053c4cb9602f0cfdc5fb7d9e3cb987f025e72fd', '2026-08-17 22:54:56.033662+03', '2026-11-15 18:24:38.245+02', '2026-08-17 22:58:30.640943+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 22:54:56.033662+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (254, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', 'ef049d67162ea2c6ec8fe8f9e9a4df50e98737c5bf8e6f2f69a51b4820477431', '2026-08-17 22:33:32.854436+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:38:55.182405+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:33:32.854436+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (288, 227, '7c25e3f5-bf1f-4cd0-a6d8-001efdf780ed', 'f4a535e173e267ecd851d2e389b01d001849b32981ac74931ec6fdf73a5dac49', '2026-08-19 21:51:02.872091+03', '2026-11-17 20:51:02.871+02', '2026-08-19 21:52:36.443128+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 21:51:02.872091+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (256, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '6f4a736ffd73bab4578f4dbe85d1d40f32325f9149e59a376f5f04311d56355f', '2026-08-17 22:49:07.105506+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:51:31.281929+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:49:07.105506+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (289, 227, '7c25e3f5-bf1f-4cd0-a6d8-001efdf780ed', '9595c075b48db8760054a6c186f07060764f310698fd8e88997900c8a13e7fcd', '2026-08-19 21:52:36.443128+03', '2026-11-17 20:51:02.871+02', '2026-08-19 21:54:49.523631+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 21:52:36.443128+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (257, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '47842e93069caee5d78aa38c60f32026d3cc0e6973612747fee504967f3d95bb', '2026-08-17 22:51:31.281929+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:53:50.825837+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:51:31.281929+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (258, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', 'f39b2894995325871127673bb9843189c22584606ef6474dc8375669ac993532', '2026-08-17 22:53:50.825837+03', '2026-11-15 21:19:00.297+02', '2026-08-17 22:54:56.252326+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:53:50.825837+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (287, 226, 'd218bd09-2ebe-4e63-bcd4-85d4219bc8c5', '0bf473712d58d43c8949f43f839c9fa8e4b5c36d090032d9ad6f22b3f98f626c', '2026-08-19 19:16:04.530253+03', '2026-11-17 17:06:45.905+02', '2026-08-19 21:56:28.779423+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 19:16:04.530253+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (291, 226, 'd218bd09-2ebe-4e63-bcd4-85d4219bc8c5', '98525ad17f79ab1bae3f0eea7362c7bfd598c08d014713934027044c46a0350d', '2026-08-19 21:56:28.779423+03', '2026-11-17 17:06:45.905+02', '2026-08-19 21:56:44.188438+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 21:56:28.779423+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (290, 227, '7c25e3f5-bf1f-4cd0-a6d8-001efdf780ed', 'efb6942d8f19d18a7275d11df9d502fa8e9834c45e925466d9415ec44bc32358', '2026-08-19 21:54:49.523631+03', '2026-11-17 20:51:02.871+02', '2026-08-19 21:57:12.78967+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 21:54:49.523631+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (292, 226, 'd218bd09-2ebe-4e63-bcd4-85d4219bc8c5', '1169832e8fa495e57b644b8e834b2d8c282e796b07047287e08c9ee1d61564ec', '2026-08-19 21:56:44.188438+03', '2026-11-17 17:06:45.905+02', '2026-08-19 21:58:08.124291+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 21:56:44.188438+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (249, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', 'bf77eecdf53acedad8bd2d52ae2fb68fc6cca54b16bce049c966489d3e20f686', '2026-08-17 21:43:43.584704+03', '2026-11-15 18:24:38.245+02', '2026-08-17 22:54:56.033662+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 21:43:43.584704+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (286, 226, 'd218bd09-2ebe-4e63-bcd4-85d4219bc8c5', 'a1f43e7cbc7fee0a3522ec434330c65cdb45df6b1fcddabbf132f90e84ef1628', '2026-08-19 18:06:45.905854+03', '2026-11-17 17:06:45.905+02', '2026-08-19 19:16:04.530253+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 18:06:45.905854+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (285, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', 'e531fdcdd29992a9f2d551bb863ea2eca7c91e13dec8e1c3be6efe8685230533', '2026-08-19 18:06:07.460258+03', '2026-11-15 21:58:57.217+02', '2026-08-19 21:47:08.510647+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 18:06:07.460258+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (261, 208, 'e91ad139-047f-4d41-a613-f169b0cda51b', '2261787f9966cded50d1884a5d8eea33aa8ad94d9e9c47ee90c6c9a349efe049', '2026-08-17 22:58:30.640943+03', '2026-11-15 18:24:38.245+02', '2026-08-17 22:58:48.153547+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 22:58:30.640943+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (293, 227, '7c25e3f5-bf1f-4cd0-a6d8-001efdf780ed', '847e4e8e8964e6c877aa66d1df4f742dba7fc17f2ff929cb1faae472a5cb23dc', '2026-08-19 21:57:12.78967+03', '2026-11-17 20:51:02.871+02', NULL, NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 21:57:12.78967+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (262, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '844e37b469d8a4219e99d1a833ea491a02f05f2977b3460d9ce767783738e61b', '2026-08-17 22:58:57.218152+03', '2026-11-15 21:58:57.217+02', '2026-08-18 02:51:29.802964+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-17 22:58:57.218152+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (294, 226, '6a6cbc49-b537-401b-9be9-3f5c0d24ed91', '3aff2b67d05cc812c9cd140806f6e0cd2a437d9d6ae0d740569ad7f4fb6c1041', '2026-08-19 21:58:30.135361+03', '2026-11-17 20:58:30.134+02', '2026-08-19 21:59:13.447802+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 21:58:30.135361+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (260, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', 'cc50bda236bf912086af1cea4315292c7579991d0773db4689eb1840852f6ee0', '2026-08-17 22:54:56.252326+03', '2026-11-15 21:19:00.297+02', '2026-08-18 02:52:22.481517+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-17 22:54:56.252326+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (264, 208, '3148691f-3503-4da9-8266-4dd6aedf0240', '8a723bf37d75557bb23e6094943b4b23d75eae12ad606e0cdb5d8499a338b968', '2026-08-18 02:52:22.481517+03', '2026-11-15 21:19:00.297+02', '2026-08-18 02:52:33.797709+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 02:52:22.481517+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (295, 226, '9a0600d2-78ae-4513-adc8-54ff4d5c9b17', 'b99c98f2cc315451338230c9b2be0e936a16af6db8ce04423bedb789a56d44d7', '2026-08-19 22:00:07.260352+03', '2026-11-17 21:00:07.26+02', '2026-08-19 22:01:13.076037+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 22:00:07.260352+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (263, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '7cf3e7554fdc171e3322c1f88e488223e0b1ce9460d37a7dd28872413b64e71f', '2026-08-18 02:51:29.802964+03', '2026-11-15 21:58:57.217+02', '2026-08-18 03:28:31.879606+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 02:51:29.802964+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (266, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '921a88ffa18a247b066ab88f564f45984a9a8c801aac3b66c33e99d47952e30b', '2026-08-18 03:28:31.879606+03', '2026-11-15 21:58:57.217+02', '2026-08-18 03:43:14.93937+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 03:28:31.879606+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (296, 227, '847619ae-18c2-439d-99ef-ab7c8bfdb1f0', '00dd1c6de14c047e2fe4db4380bf40ed0ed7e9693392535f7aa0c1feddc557d8', '2026-08-19 22:03:45.839195+03', '2026-11-17 21:03:45.838+02', '2026-08-19 22:17:45.057491+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 22:03:45.839195+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (265, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', 'c878f82ff4bbdd497750954ea81e31a6326c9b703312c7e1791e637ddff8de70', '2026-08-18 02:55:57.899203+03', '2026-11-16 01:55:57.898+02', '2026-08-18 04:10:39.114932+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 02:55:57.899203+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (297, 228, '34bf4731-14e1-4263-bbe4-009cd82e15e3', '772a0a6bbc76e80c4a0369edff1174fd2490e79d7d3e6c1418e788f0e4614efb', '2026-08-19 22:36:10.724701+03', '2026-11-17 21:36:10.724+02', NULL, NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 22:36:10.724701+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (268, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '9451374e03fc8397b9ac17a59ec18ef5f34e082ebf0b51bea0a1e8a029b88aeb', '2026-08-18 04:10:39.114932+03', '2026-11-16 01:55:57.898+02', '2026-08-18 04:27:41.950931+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 04:10:39.114932+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (267, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', 'a1b00c5d62efc3318d8a3d25dc9224d1b8ff6b231396bda5e141adae6025ec6b', '2026-08-18 03:43:14.93937+03', '2026-11-15 21:58:57.217+02', '2026-08-18 04:27:47.501843+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 03:43:14.93937+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (270, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '40a28e0df3fa1967efac96bf32a22bf0031705550b0087a051bc77bff1d26e96', '2026-08-18 04:27:47.501843+03', '2026-11-15 21:58:57.217+02', '2026-08-18 04:58:53.125652+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 04:27:47.501843+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (271, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '2f9b980fd618a57f6dfd19223e43858bcb83726b137f2960377bab1c7eb30154', '2026-08-18 04:58:53.125652+03', '2026-11-15 21:58:57.217+02', '2026-08-18 04:59:13.424255+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 04:58:53.125652+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (269, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', 'c2cb51a94952279a28d75e7d5c10d1037f0feb4d4af7800e2a4d0e83b62911e5', '2026-08-18 04:27:41.950931+03', '2026-11-16 01:55:57.898+02', '2026-08-18 05:01:06.802045+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 04:27:41.950931+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (272, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', 'a2977d74a45230268707f686fa41436cbdca15d4e75f3bf5ab3ea07064863864', '2026-08-18 04:59:13.424255+03', '2026-11-15 21:58:57.217+02', '2026-08-18 05:01:21.370269+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 04:59:13.424255+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (273, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', 'e9315f14bad4dbee759e78d4fbb7e4d104e3d433ed62a1e9f33d35f6c0887e62', '2026-08-18 05:01:06.802045+03', '2026-11-16 01:55:57.898+02', '2026-08-18 05:02:02.784759+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 05:01:06.802045+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (274, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', 'c7eff4f6b47f3b19506aa0da7a210f6f0cc12fd5625c3376e23e19528ee2b530', '2026-08-18 05:01:21.370269+03', '2026-11-15 21:58:57.217+02', '2026-08-18 05:02:52.376738+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 05:01:21.370269+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (276, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', 'e4e695043eda4a57f6d7402383efb74260ab7536b1584e8bd8dba3a432b0d26d', '2026-08-18 05:02:52.376738+03', '2026-11-15 21:58:57.217+02', '2026-08-18 05:03:08.656472+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 05:02:52.376738+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (277, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '47d5c2b5e831687358b0790ed90751b543914341e8f1f1f2bf68fc5c2f87193b', '2026-08-18 05:03:08.656472+03', '2026-11-15 21:58:57.217+02', '2026-08-19 00:40:23.026244+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-18 05:03:08.656472+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (275, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '6e334e60f60d13cbded3465281b3992834d7f7ffab8da68920b66c1a2fa5b40d', '2026-08-18 05:02:02.784759+03', '2026-11-16 01:55:57.898+02', '2026-08-19 00:42:58.393604+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-18 05:02:02.784759+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (279, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '5d7f08d6fb98d1c062dc8c8834a9438e5707b07a371da71497f96cfcc608bf7d', '2026-08-19 00:42:58.393604+03', '2026-11-16 01:55:57.898+02', '2026-08-19 02:02:21.522546+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 00:42:58.393604+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (280, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '924b4352e9b84ed0b76dbbe0e9eb770b1c8b4f85da3d6ee0ce76eb82694631a0', '2026-08-19 02:02:21.522546+03', '2026-11-16 01:55:57.898+02', '2026-08-19 15:01:57.106686+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 02:02:21.522546+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (278, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '77898c1ac9d4e8af5dace5f090b8c9a453cbc8e819629b90fa09bcb02fee35df', '2026-08-19 00:40:23.026244+03', '2026-11-15 21:58:57.217+02', '2026-08-19 15:06:27.681035+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 00:40:23.026244+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (281, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '59ede9c7391a344299f70b6bddb5bae2bd56e3be8870cd1ffa392636757a7f27', '2026-08-19 15:01:57.106686+03', '2026-11-16 01:55:57.898+02', '2026-08-19 16:06:43.284366+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 15:01:57.106686+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (283, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '06396253e9b3d9eb13983b4390ed190241e9493c8148a7b49c01ac6c9dc7bcf5', '2026-08-19 16:06:43.284366+03', '2026-11-16 01:55:57.898+02', '2026-08-19 18:05:53.268858+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 16:06:43.284366+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (282, 208, '28e5e573-835b-405c-b187-6b9d7188f0ad', '3eeff5f6b0838482b36d1eb71c6e8376e55f8da7ab3f4e973b2325ac5d037fd5', '2026-08-19 15:06:27.681035+03', '2026-11-15 21:58:57.217+02', '2026-08-19 18:06:07.460258+03', NULL, 'okhttp/4.12.0', '::ffff:192.168.1.3', '2026-08-19 15:06:27.681035+03');
INSERT INTO public.refresh_tokens (id, user_id, family_id, token_hash, created_at, expires_at, revoked_at, replaced_by_id, user_agent, ip_address, last_used_at) VALUES (284, 226, '18daa7b8-467c-4199-a78d-e295e5ea7259', '6cf09ca8fda93d7e501b69635846079649882736c2357df7d5b415ab4ae97637', '2026-08-19 18:05:53.268858+03', '2026-11-16 01:55:57.898+02', '2026-08-19 18:06:31.037595+03', NULL, 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '::ffff:192.168.1.4', '2026-08-19 18:05:53.268858+03');

-- Fix circular FK: set replaced_by_id after all rows exist
UPDATE public.refresh_tokens SET replaced_by_id = 117 WHERE id = 116;
UPDATE public.refresh_tokens SET replaced_by_id = 209 WHERE id = 208;
UPDATE public.refresh_tokens SET replaced_by_id = 210 WHERE id = 209;
UPDATE public.refresh_tokens SET replaced_by_id = 211 WHERE id = 210;
UPDATE public.refresh_tokens SET replaced_by_id = 35 WHERE id = 34;
UPDATE public.refresh_tokens SET replaced_by_id = 36 WHERE id = 35;
UPDATE public.refresh_tokens SET replaced_by_id = 213 WHERE id = 212;
UPDATE public.refresh_tokens SET replaced_by_id = 37 WHERE id = 36;
UPDATE public.refresh_tokens SET replaced_by_id = 38 WHERE id = 37;
UPDATE public.refresh_tokens SET replaced_by_id = 50 WHERE id = 49;
UPDATE public.refresh_tokens SET replaced_by_id = 51 WHERE id = 50;
UPDATE public.refresh_tokens SET replaced_by_id = 133 WHERE id = 117;
UPDATE public.refresh_tokens SET replaced_by_id = 134 WHERE id = 133;
UPDATE public.refresh_tokens SET replaced_by_id = 135 WHERE id = 134;
UPDATE public.refresh_tokens SET replaced_by_id = 136 WHERE id = 135;
UPDATE public.refresh_tokens SET replaced_by_id = 137 WHERE id = 136;
UPDATE public.refresh_tokens SET replaced_by_id = 138 WHERE id = 137;
UPDATE public.refresh_tokens SET replaced_by_id = 139 WHERE id = 138;
UPDATE public.refresh_tokens SET replaced_by_id = 140 WHERE id = 139;
UPDATE public.refresh_tokens SET replaced_by_id = 141 WHERE id = 140;
UPDATE public.refresh_tokens SET replaced_by_id = 142 WHERE id = 141;
UPDATE public.refresh_tokens SET replaced_by_id = 143 WHERE id = 142;
UPDATE public.refresh_tokens SET replaced_by_id = 144 WHERE id = 143;
UPDATE public.refresh_tokens SET replaced_by_id = 146 WHERE id = 145;
UPDATE public.refresh_tokens SET replaced_by_id = 114 WHERE id = 98;
UPDATE public.refresh_tokens SET replaced_by_id = 115 WHERE id = 114;
UPDATE public.refresh_tokens SET replaced_by_id = 116 WHERE id = 115;
UPDATE public.refresh_tokens SET replaced_by_id = 145 WHERE id = 144;
UPDATE public.refresh_tokens SET replaced_by_id = 208 WHERE id = 207;
UPDATE public.refresh_tokens SET replaced_by_id = 147 WHERE id = 146;
UPDATE public.refresh_tokens SET replaced_by_id = 212 WHERE id = 211;
UPDATE public.refresh_tokens SET replaced_by_id = 214 WHERE id = 213;
UPDATE public.refresh_tokens SET replaced_by_id = 215 WHERE id = 214;
UPDATE public.refresh_tokens SET replaced_by_id = 216 WHERE id = 215;
UPDATE public.refresh_tokens SET replaced_by_id = 217 WHERE id = 216;
UPDATE public.refresh_tokens SET replaced_by_id = 219 WHERE id = 218;
UPDATE public.refresh_tokens SET replaced_by_id = 177 WHERE id = 176;
UPDATE public.refresh_tokens SET replaced_by_id = 178 WHERE id = 177;
UPDATE public.refresh_tokens SET replaced_by_id = 221 WHERE id = 220;
UPDATE public.refresh_tokens SET replaced_by_id = 179 WHERE id = 178;
UPDATE public.refresh_tokens SET replaced_by_id = 224 WHERE id = 217;
UPDATE public.refresh_tokens SET replaced_by_id = 181 WHERE id = 180;
UPDATE public.refresh_tokens SET replaced_by_id = 182 WHERE id = 181;
UPDATE public.refresh_tokens SET replaced_by_id = 192 WHERE id = 191;
UPDATE public.refresh_tokens SET replaced_by_id = 193 WHERE id = 192;
UPDATE public.refresh_tokens SET replaced_by_id = 195 WHERE id = 194;
UPDATE public.refresh_tokens SET replaced_by_id = 196 WHERE id = 195;
UPDATE public.refresh_tokens SET replaced_by_id = 197 WHERE id = 196;
UPDATE public.refresh_tokens SET replaced_by_id = 198 WHERE id = 197;
UPDATE public.refresh_tokens SET replaced_by_id = 199 WHERE id = 198;
UPDATE public.refresh_tokens SET replaced_by_id = 200 WHERE id = 199;
UPDATE public.refresh_tokens SET replaced_by_id = 201 WHERE id = 200;
UPDATE public.refresh_tokens SET replaced_by_id = 202 WHERE id = 201;
UPDATE public.refresh_tokens SET replaced_by_id = 203 WHERE id = 202;
UPDATE public.refresh_tokens SET replaced_by_id = 204 WHERE id = 203;
UPDATE public.refresh_tokens SET replaced_by_id = 205 WHERE id = 204;
UPDATE public.refresh_tokens SET replaced_by_id = 206 WHERE id = 205;
UPDATE public.refresh_tokens SET replaced_by_id = 207 WHERE id = 206;
UPDATE public.refresh_tokens SET replaced_by_id = 220 WHERE id = 219;
UPDATE public.refresh_tokens SET replaced_by_id = 222 WHERE id = 221;
UPDATE public.refresh_tokens SET replaced_by_id = 223 WHERE id = 222;
UPDATE public.refresh_tokens SET replaced_by_id = 225 WHERE id = 224;
UPDATE public.refresh_tokens SET replaced_by_id = 226 WHERE id = 225;
UPDATE public.refresh_tokens SET replaced_by_id = 228 WHERE id = 227;
UPDATE public.refresh_tokens SET replaced_by_id = 229 WHERE id = 228;
UPDATE public.refresh_tokens SET replaced_by_id = 231 WHERE id = 229;
UPDATE public.refresh_tokens SET replaced_by_id = 232 WHERE id = 231;
UPDATE public.refresh_tokens SET replaced_by_id = 233 WHERE id = 232;
UPDATE public.refresh_tokens SET replaced_by_id = 234 WHERE id = 233;
UPDATE public.refresh_tokens SET replaced_by_id = 235 WHERE id = 234;
UPDATE public.refresh_tokens SET replaced_by_id = 236 WHERE id = 235;
UPDATE public.refresh_tokens SET replaced_by_id = 237 WHERE id = 230;
UPDATE public.refresh_tokens SET replaced_by_id = 238 WHERE id = 237;
UPDATE public.refresh_tokens SET replaced_by_id = 239 WHERE id = 236;
UPDATE public.refresh_tokens SET replaced_by_id = 240 WHERE id = 239;
UPDATE public.refresh_tokens SET replaced_by_id = 241 WHERE id = 240;
UPDATE public.refresh_tokens SET replaced_by_id = 242 WHERE id = 241;
UPDATE public.refresh_tokens SET replaced_by_id = 243 WHERE id = 242;
UPDATE public.refresh_tokens SET replaced_by_id = 244 WHERE id = 243;
UPDATE public.refresh_tokens SET replaced_by_id = 245 WHERE id = 244;
UPDATE public.refresh_tokens SET replaced_by_id = 246 WHERE id = 245;
UPDATE public.refresh_tokens SET replaced_by_id = 247 WHERE id = 238;
UPDATE public.refresh_tokens SET replaced_by_id = 249 WHERE id = 246;
UPDATE public.refresh_tokens SET replaced_by_id = 250 WHERE id = 248;
UPDATE public.refresh_tokens SET replaced_by_id = 251 WHERE id = 250;
UPDATE public.refresh_tokens SET replaced_by_id = 253 WHERE id = 252;
UPDATE public.refresh_tokens SET replaced_by_id = 254 WHERE id = 253;
UPDATE public.refresh_tokens SET replaced_by_id = 256 WHERE id = 255;
UPDATE public.refresh_tokens SET replaced_by_id = 261 WHERE id = 259;
UPDATE public.refresh_tokens SET replaced_by_id = 255 WHERE id = 254;
UPDATE public.refresh_tokens SET replaced_by_id = 289 WHERE id = 288;
UPDATE public.refresh_tokens SET replaced_by_id = 257 WHERE id = 256;
UPDATE public.refresh_tokens SET replaced_by_id = 290 WHERE id = 289;
UPDATE public.refresh_tokens SET replaced_by_id = 258 WHERE id = 257;
UPDATE public.refresh_tokens SET replaced_by_id = 260 WHERE id = 258;
UPDATE public.refresh_tokens SET replaced_by_id = 291 WHERE id = 287;
UPDATE public.refresh_tokens SET replaced_by_id = 292 WHERE id = 291;
UPDATE public.refresh_tokens SET replaced_by_id = 293 WHERE id = 290;
UPDATE public.refresh_tokens SET replaced_by_id = 259 WHERE id = 249;
UPDATE public.refresh_tokens SET replaced_by_id = 287 WHERE id = 286;
UPDATE public.refresh_tokens SET replaced_by_id = 263 WHERE id = 262;
UPDATE public.refresh_tokens SET replaced_by_id = 264 WHERE id = 260;
UPDATE public.refresh_tokens SET replaced_by_id = 266 WHERE id = 263;
UPDATE public.refresh_tokens SET replaced_by_id = 267 WHERE id = 266;
UPDATE public.refresh_tokens SET replaced_by_id = 268 WHERE id = 265;
UPDATE public.refresh_tokens SET replaced_by_id = 269 WHERE id = 268;
UPDATE public.refresh_tokens SET replaced_by_id = 270 WHERE id = 267;
UPDATE public.refresh_tokens SET replaced_by_id = 271 WHERE id = 270;
UPDATE public.refresh_tokens SET replaced_by_id = 272 WHERE id = 271;
UPDATE public.refresh_tokens SET replaced_by_id = 273 WHERE id = 269;
UPDATE public.refresh_tokens SET replaced_by_id = 274 WHERE id = 272;
UPDATE public.refresh_tokens SET replaced_by_id = 275 WHERE id = 273;
UPDATE public.refresh_tokens SET replaced_by_id = 276 WHERE id = 274;
UPDATE public.refresh_tokens SET replaced_by_id = 277 WHERE id = 276;
UPDATE public.refresh_tokens SET replaced_by_id = 278 WHERE id = 277;
UPDATE public.refresh_tokens SET replaced_by_id = 279 WHERE id = 275;
UPDATE public.refresh_tokens SET replaced_by_id = 280 WHERE id = 279;
UPDATE public.refresh_tokens SET replaced_by_id = 281 WHERE id = 280;
UPDATE public.refresh_tokens SET replaced_by_id = 282 WHERE id = 278;
UPDATE public.refresh_tokens SET replaced_by_id = 283 WHERE id = 281;
UPDATE public.refresh_tokens SET replaced_by_id = 284 WHERE id = 283;
UPDATE public.refresh_tokens SET replaced_by_id = 285 WHERE id = 282;


--
-- Data for Name: sentence_tokens; Type: TABLE DATA; Schema: public; Owner: root
--



--
-- Data for Name: sentence_translations; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (1, 1, 5);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (2, 2, 6);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (3, 3, 7);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (4, 4, 8);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (5, 9, 14);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (6, 10, 15);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (7, 11, 16);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (8, 12, 17);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (9, 13, 18);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (10, 19, 20);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (11, 21, 22);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (12, 23, 24);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (13, 25, 26);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (14, 27, 39);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (15, 28, 40);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (16, 29, 41);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (17, 30, 42);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (18, 31, 43);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (19, 32, 44);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (20, 33, 45);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (21, 34, 46);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (22, 35, 47);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (23, 36, 48);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (24, 37, 49);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (25, 38, 50);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (27, 51, 52);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (28, 53, 54);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (29, 115, 116);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (30, 117, 118);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (31, 119, 120);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (32, 121, 122);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (33, 55, 56);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (34, 57, 58);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (35, 59, 60);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (36, 61, 62);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (37, 63, 64);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (38, 65, 66);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (39, 67, 68);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (40, 69, 70);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (41, 71, 72);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (42, 73, 74);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (43, 75, 76);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (44, 77, 78);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (45, 79, 80);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (46, 81, 82);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (47, 83, 84);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (48, 85, 86);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (49, 87, 88);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (50, 89, 90);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (51, 91, 92);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (52, 93, 94);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (53, 95, 96);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (54, 97, 98);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (55, 99, 100);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (56, 101, 102);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (57, 103, 104);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (58, 105, 106);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (59, 107, 108);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (60, 109, 110);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (61, 111, 112);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (62, 113, 114);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (63, 125, 126);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (64, 127, 128);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (65, 129, 130);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (66, 131, 126);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (67, 132, 133);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (68, 135, 136);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (69, 137, 138);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (70, 139, 140);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (71, 143, 144);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (72, 145, 146);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (73, 147, 148);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (74, 149, 150);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (75, 151, 152);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (76, 153, 154);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (77, 156, 157);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (78, 163, 164);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (79, 165, 166);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (80, 175, 176);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (81, 179, 180);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (82, 190, 191);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (83, 194, 195);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (84, 182, 196);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (88, 144, 143);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (89, 144, 201);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (90, 202, 203);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (91, 202, 204);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (92, 205, 206);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (93, 205, 207);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (94, 208, 209);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (95, 208, 210);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (100, 144, 213);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (102, 146, 214);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (103, 148, 215);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (104, 150, 149);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (105, 195, 216);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (106, 217, 218);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (107, 219, 220);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (108, 221, 222);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (109, 223, 224);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (110, 225, 226);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (111, 225, 227);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (112, 195, 228);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (113, 229, 230);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (114, 229, 231);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (115, 232, 233);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (116, 232, 234);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (117, 235, 236);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (118, 235, 237);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (119, 238, 239);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (120, 238, 240);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (121, 241, 242);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (122, 241, 243);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (123, 244, 245);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (124, 244, 246);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (125, 247, 248);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (126, 247, 249);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (127, 250, 251);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (128, 250, 252);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (130, 219, 253);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (131, 221, 254);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (132, 221, 255);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (134, 223, 256);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (135, 225, 257);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (137, 195, 258);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (138, 195, 259);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (139, 260, 261);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (140, 260, 262);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (141, 263, 264);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (142, 263, 265);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (143, 116, 266);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (144, 116, 267);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (147, 268, 269);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (148, 268, 270);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (149, 271, 272);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (150, 271, 273);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (151, 274, 275);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (152, 274, 276);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (153, 277, 278);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (154, 277, 279);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (155, 280, 281);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (156, 282, 283);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (157, 282, 284);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (158, 285, 286);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (159, 285, 287);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (160, 288, 289);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (161, 288, 290);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (162, 292, 293);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (163, 292, 294);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (164, 295, 296);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (165, 295, 297);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (166, 167, 298);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (167, 167, 299);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (168, 300, 301);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (169, 300, 302);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (170, 303, 304);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (171, 303, 305);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (172, 306, 307);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (173, 306, 308);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (174, 309, 310);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (175, 309, 311);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (176, 312, 313);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (177, 312, 314);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (178, 315, 316);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (179, 315, 317);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (180, 318, 319);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (181, 318, 320);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (182, 321, 322);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (183, 321, 323);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (184, 324, 325);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (185, 324, 326);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (186, 327, 328);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (187, 327, 329);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (188, 330, 331);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (189, 330, 332);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (190, 333, 334);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (191, 333, 335);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (192, 336, 337);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (193, 336, 338);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (194, 339, 340);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (195, 339, 341);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (196, 342, 343);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (197, 342, 344);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (198, 345, 346);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (199, 345, 347);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (200, 348, 349);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (201, 348, 350);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (202, 351, 352);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (203, 351, 353);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (204, 356, 357);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (205, 356, 358);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (206, 359, 360);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (207, 359, 361);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (208, 362, 363);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (209, 362, 364);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (210, 365, 366);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (211, 365, 367);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (212, 368, 369);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (213, 368, 370);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (214, 371, 372);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (215, 371, 373);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (216, 374, 375);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (217, 374, 376);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (218, 377, 378);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (219, 377, 379);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (220, 380, 381);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (221, 380, 382);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (222, 383, 381);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (223, 383, 382);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (224, 384, 385);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (225, 384, 386);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (226, 387, 388);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (227, 387, 389);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (228, 390, 391);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (229, 390, 392);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (230, 393, 394);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (231, 393, 395);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (233, 365, 396);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (234, 397, 398);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (235, 397, 399);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (236, 400, 401);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (237, 400, 402);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (238, 403, 404);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (239, 403, 405);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (240, 406, 407);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (241, 406, 408);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (242, 409, 410);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (243, 409, 411);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (244, 412, 413);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (245, 412, 414);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (246, 415, 416);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (247, 415, 417);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (248, 418, 419);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (249, 418, 420);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (250, 421, 422);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (251, 421, 423);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (252, 424, 425);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (253, 424, 426);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (254, 427, 428);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (255, 427, 429);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (256, 430, 431);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (257, 430, 432);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (258, 433, 434);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (259, 433, 435);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (260, 178, 436);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (261, 178, 437);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (262, 438, 439);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (263, 438, 440);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (264, 441, 442);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (265, 441, 443);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (266, 444, 16);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (267, 444, 445);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (268, 446, 447);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (269, 446, 448);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (270, 449, 450);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (271, 449, 451);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (272, 452, 453);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (273, 452, 454);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (274, 455, 456);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (275, 455, 457);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (276, 458, 459);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (277, 458, 460);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (278, 461, 462);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (279, 461, 463);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (280, 464, 465);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (281, 464, 466);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (282, 467, 468);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (283, 467, 469);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (284, 470, 471);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (285, 470, 472);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (286, 473, 474);
INSERT INTO public.sentence_translations (id, sentence_id, translation_sentence_id) VALUES (287, 473, 475);


--
-- Data for Name: user_languages; Type: TABLE DATA; Schema: public; Owner: root
--

INSERT INTO public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) VALUES (220, 208, 1, 3, '2026-08-18 02:51:29.946+03', 'B2', 0, true);
INSERT INTO public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) VALUES (222, 208, 3, 1, '2026-08-18 03:43:32.353+03', 'B1', 0, false);
INSERT INTO public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) VALUES (224, 227, 3, 1, '2026-08-19 21:47:39.643+03', 'N', 0, true);
INSERT INTO public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) VALUES (226, 226, 3, 1, '2026-08-19 22:00:32.45+03', 'N', 0, true);
INSERT INTO public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) VALUES (227, 228, 1, 3, '2026-08-19 22:34:45.005+03', 'N', 0, true);


--
-- Data for Name: user_sentences; Type: TABLE DATA; Schema: public; Owner: root
--



--
-- Data for Name: user_vocabulary; Type: TABLE DATA; Schema: public; Owner: root
--



--
-- Name: dialogue_sentences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.dialogue_sentences_id_seq', 287, true);


--
-- Name: dialogues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.dialogues_id_seq', 74, true);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.feedback_id_seq', 1, true);


--
-- Name: languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.languages_id_seq', 1, false);


--
-- Name: letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.letters_id_seq', 1, false);


--
-- Name: reel_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.reel_interactions_id_seq', 82, true);


--
-- Name: reel_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.reel_reports_id_seq', 3, true);


--
-- Name: reels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.reels_id_seq', 72, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 327, true);


--
-- Name: sentence_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentence_tokens_id_seq', 1, false);


--
-- Name: sentence_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentence_translations_id_seq', 287, true);


--
-- Name: sentences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentences_id_seq', 475, true);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.translations_id_seq', 12887, true);


--
-- Name: user_languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_languages_id_seq', 227, true);


--
-- Name: user_sentences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_sentences_id_seq', 15, true);


--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_vocabulary_id_seq', 122103, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.users_id_seq', 232, true);


--
-- Name: words_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.words_id_seq', 60, true);


--
-- PostgreSQL database dump complete
--


