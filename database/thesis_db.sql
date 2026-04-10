--
-- PostgreSQL database dump
--

\restrict GHMBG3hv2JhNAty2jJdjRFmPGvTrApXNuDmCfCPYIv5jduAwXr7lQ2Rqyh59wES

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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
-- Name: update_last_login_on_refresh_token(); Type: FUNCTION; Schema: public; Owner: root
--

CREATE FUNCTION public.update_last_login_on_refresh_token() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only update last_login if refresh_token is actually changing
  IF NEW.refresh_token IS DISTINCT FROM OLD.refresh_token AND NEW.refresh_token IS NOT NULL THEN
    NEW.last_login = NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_last_login_on_refresh_token() OWNER TO root;

--
-- Name: FUNCTION update_last_login_on_refresh_token(); Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON FUNCTION public.update_last_login_on_refresh_token() IS 'Automatically updates last_login timestamp when refresh_token is updated';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dialogue_sentences; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.dialogue_sentences (
    id bigint NOT NULL,
    dialogue_id bigint NOT NULL,
    sentence_id bigint NOT NULL,
    "position" smallint NOT NULL,
    start_time_ms integer,
    end_time_ms integer,
    CONSTRAINT valid_time CHECK ((((start_time_ms IS NULL) AND (end_time_ms IS NULL)) OR (end_time_ms > start_time_ms)))
);


ALTER TABLE public.dialogue_sentences OWNER TO root;

--
-- Name: dialogue_sentences_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.dialogue_sentences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dialogue_sentences_id_seq OWNER TO root;

--
-- Name: dialogue_sentences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.dialogue_sentences_id_seq OWNED BY public.dialogue_sentences.id;


--
-- Name: dialogues; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.dialogues (
    id bigint NOT NULL,
    language_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dialogues OWNER TO root;

--
-- Name: dialogues_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.dialogues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dialogues_id_seq OWNER TO root;

--
-- Name: dialogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.dialogues_id_seq OWNED BY public.dialogues.id;


--
-- Name: languages; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.languages (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(10) NOT NULL
);


ALTER TABLE public.languages OWNER TO root;

--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.languages_id_seq OWNER TO root;

--
-- Name: languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.languages_id_seq OWNED BY public.languages.id;


--
-- Name: letters; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.letters (
    id bigint NOT NULL,
    writing_style character varying(100),
    letter_sign character varying(10) NOT NULL,
    type character varying(9) NOT NULL,
    audio_url text,
    image_url text,
    language_id bigint NOT NULL
);


ALTER TABLE public.letters OWNER TO root;

--
-- Name: letters_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.letters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letters_id_seq OWNER TO root;

--
-- Name: letters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.letters_id_seq OWNED BY public.letters.id;


--
-- Name: reel_interactions; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.reel_interactions (
    id bigint NOT NULL,
    reel_id bigint NOT NULL,
    user_id bigint NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    is_liked boolean DEFAULT false NOT NULL,
    is_saved boolean DEFAULT false NOT NULL,
    comment text,
    commented_at timestamp with time zone,
    is_shared boolean DEFAULT false NOT NULL,
    is_reported boolean DEFAULT false NOT NULL,
    report_reason text,
    reported_at timestamp with time zone
);


ALTER TABLE public.reel_interactions OWNER TO root;

--
-- Name: reel_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.reel_interactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reel_interactions_id_seq OWNER TO root;

--
-- Name: reel_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.reel_interactions_id_seq OWNED BY public.reel_interactions.id;


--
-- Name: reels; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.reels (
    id bigint NOT NULL,
    language_id integer,
    dialogue_id bigint,
    created_by bigint,
    url text NOT NULL,
    thumbnail_url text,
    title text,
    description text,
    duration smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reels OWNER TO root;

--
-- Name: reels_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.reels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reels_id_seq OWNER TO root;

--
-- Name: reels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.reels_id_seq OWNED BY public.reels.id;


--
-- Name: sentence_tokens; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sentence_tokens (
    id bigint NOT NULL,
    sentence_id bigint NOT NULL,
    word_id integer NOT NULL,
    "position" smallint NOT NULL,
    part_of_speech character varying(10),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sentence_tokens OWNER TO root;

--
-- Name: sentence_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sentence_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sentence_tokens_id_seq OWNER TO root;

--
-- Name: sentence_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sentence_tokens_id_seq OWNED BY public.sentence_tokens.id;


--
-- Name: sentence_translations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sentence_translations (
    id bigint NOT NULL,
    sentence_id bigint NOT NULL,
    translation_sentence_id bigint NOT NULL
);


ALTER TABLE public.sentence_translations OWNER TO root;

--
-- Name: sentence_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sentence_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sentence_translations_id_seq OWNER TO root;

--
-- Name: sentence_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sentence_translations_id_seq OWNED BY public.sentence_translations.id;


--
-- Name: sentences; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sentences (
    id bigint NOT NULL,
    language_id integer NOT NULL,
    text text NOT NULL,
    normalized_text text,
    audio_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sentences OWNER TO root;

--
-- Name: sentences_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sentences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sentences_id_seq OWNER TO root;

--
-- Name: sentences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sentences_id_seq OWNED BY public.sentences.id;


--
-- Name: word_translations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.word_translations (
    id bigint NOT NULL,
    word_id bigint NOT NULL,
    translation_word_id bigint NOT NULL,
    level character varying(2),
    CONSTRAINT translations_check CHECK ((word_id <> translation_word_id))
);


ALTER TABLE public.word_translations OWNER TO root;

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_id_seq OWNER TO root;

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.word_translations.id;


--
-- Name: user_languages; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_languages (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    native_language_id bigint NOT NULL,
    learning_language_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    proficiency_level character varying(50) DEFAULT 'A1'::character varying NOT NULL,
    experience integer DEFAULT 0 NOT NULL,
    is_current_language boolean DEFAULT false
);


ALTER TABLE public.user_languages OWNER TO root;

--
-- Name: user_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_languages_id_seq OWNER TO root;

--
-- Name: user_languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_languages_id_seq OWNED BY public.user_languages.id;


--
-- Name: user_vocabulary; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_vocabulary (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    word_id bigint NOT NULL,
    mastery_level smallint DEFAULT 1 NOT NULL,
    last_review timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_languages_id bigint NOT NULL,
    CONSTRAINT user_vocabulary_mastery_level_check CHECK (((mastery_level >= 1) AND (mastery_level <= 6)))
);


ALTER TABLE public.user_vocabulary OWNER TO root;

--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_vocabulary_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_vocabulary_id_seq OWNER TO root;

--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_vocabulary_id_seq OWNED BY public.user_vocabulary.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    google_id text,
    first_name character varying(100),
    last_name character varying(100),
    username character varying(50) NOT NULL,
    password_hash text,
    refresh_token text,
    email character varying(255),
    profile_picture text,
    joined_date timestamp with time zone DEFAULT now() NOT NULL,
    last_login timestamp with time zone,
    energy integer DEFAULT 100 NOT NULL,
    coins integer DEFAULT 0 NOT NULL,
    age integer,
    preferences character varying(100),
    notifications boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    CONSTRAINT users_age_check CHECK (((age >= 0) AND (age <= 100))),
    CONSTRAINT users_coins_check CHECK ((coins >= 0)),
    CONSTRAINT users_energy_check CHECK ((energy >= 0))
);


ALTER TABLE public.users OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: words; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.words (
    id bigint NOT NULL,
    written_form character varying(255) NOT NULL,
    part_of_speech character varying(50),
    image_url text,
    audio_url text,
    language_id bigint NOT NULL,
    level character varying(2),
    article character varying(10),
    CONSTRAINT words_level_check CHECK (((level)::text = ANY (ARRAY['N'::text, 'A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'AB'::text, 'C1'::text, 'C2'::text])))
);


ALTER TABLE public.words OWNER TO root;

--
-- Name: words_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.words_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.words_id_seq OWNER TO root;

--
-- Name: words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.words_id_seq OWNED BY public.words.id;


--
-- Name: dialogue_sentences id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogue_sentences ALTER COLUMN id SET DEFAULT nextval('public.dialogue_sentences_id_seq'::regclass);


--
-- Name: dialogues id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogues ALTER COLUMN id SET DEFAULT nextval('public.dialogues_id_seq'::regclass);


--
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- Name: letters id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.letters ALTER COLUMN id SET DEFAULT nextval('public.letters_id_seq'::regclass);


--
-- Name: reel_interactions id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reel_interactions ALTER COLUMN id SET DEFAULT nextval('public.reel_interactions_id_seq'::regclass);


--
-- Name: reels id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reels ALTER COLUMN id SET DEFAULT nextval('public.reels_id_seq'::regclass);


--
-- Name: sentence_tokens id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_tokens ALTER COLUMN id SET DEFAULT nextval('public.sentence_tokens_id_seq'::regclass);


--
-- Name: sentence_translations id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_translations ALTER COLUMN id SET DEFAULT nextval('public.sentence_translations_id_seq'::regclass);


--
-- Name: sentences id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentences ALTER COLUMN id SET DEFAULT nextval('public.sentences_id_seq'::regclass);


--
-- Name: user_languages id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_languages ALTER COLUMN id SET DEFAULT nextval('public.user_languages_id_seq'::regclass);


--
-- Name: user_vocabulary id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary ALTER COLUMN id SET DEFAULT nextval('public.user_vocabulary_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: word_translations id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.word_translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: words id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.words ALTER COLUMN id SET DEFAULT nextval('public.words_id_seq'::regclass);


--
-- Data for Name: dialogue_sentences; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.dialogue_sentences (id, dialogue_id, sentence_id, "position", start_time_ms, end_time_ms) FROM stdin;
1	1	1	1	1	1000
2	1	1	2	1000	1900
3	1	2	3	1900	3100
4	1	3	4	3100	4500
5	1	4	5	4500	6000
43	8	55	1	0	\N
33	6	37	1	0	900
34	6	1	2	900	1500
35	6	32	3	1500	2600
36	6	33	4	2600	3400
9	2	10	4	3100	4500
22	4	51	4	3700	5200
44	8	57	2	1450	\N
51	8	69	9	14300	\N
45	8	59	3	4000	\N
46	8	61	4	5300	\N
47	8	63	5	7000	\N
6	2	1	1	0	750
23	4	30	5	5000	6500
8	2	9	3	1300	3100
29	5	34	5	4100	5000
30	5	35	6	5000	5900
31	5	36	7	5800	8000
19	4	27	1	0	1000
49	8	65	7	11200	\N
50	8	67	8	11650	\N
25	5	31	1	0	1000
26	5	1	2	1000	2000
48	8	57	6	8800	\N
80	13	115	1	0	\N
81	14	117	1	0	\N
82	15	119	1	0	\N
83	16	121	1	0	\N
20	4	28	2	1000	2700
21	4	29	3	2700	3900
52	8	71	10	15300	\N
53	8	73	11	16800	\N
7	2	1	2	750	1400
28	5	33	4	3000	4200
13	3	1	1	0	550
14	3	19	2	550	1800
15	3	21	3	1800	4000
16	3	1	4	4000	4700
37	6	34	5	3700	4600
18	3	25	6	5650	8000
17	3	23	5	4700	5650
54	8	75	12	18000	\N
38	6	35	6	4600	5600
12	2	13	7	6400	8200
11	2	12	6	5200	6600
10	2	11	5	4250	5300
27	5	32	3	2000	2800
55	8	77	13	19200	\N
56	8	79	14	20400	\N
57	8	81	15	21650	\N
39	6	36	7	5600	6100
40	6	38	8	6000	7000
41	6	38	9	7000	8900
42	7	53	1	0	\N
74	8	124	32	45800	\N
75	8	124	33	47090	\N
76	8	124	34	48370	\N
77	8	124	35	49570	\N
58	8	83	16	23000	\N
59	8	85	17	24100	\N
60	8	87	18	26800	\N
61	8	89	19	28400	\N
64	8	93	22	32000	\N
65	8	95	23	34550	\N
66	8	97	24	36800	\N
67	8	99	25	37900	\N
68	8	101	26	39800	\N
69	8	103	27	41900	\N
70	8	105	28	43000	\N
71	8	107	29	43900	\N
72	8	109	30	44300	\N
73	8	111	31	44950	\N
62	8	91	20	29100	\N
63	8	89	21	30900	\N
78	8	113	36	50400	\N
\.


--
-- Data for Name: dialogues; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.dialogues (id, language_id, created_at) FROM stdin;
1	3	2026-03-11 12:42:55.871655+02
2	3	2026-03-11 12:57:54.369572+02
3	3	2026-04-07 17:04:45.756367+03
4	3	2026-04-07 17:26:32.299544+03
5	3	2026-04-07 17:26:32.340122+03
6	3	2026-04-07 17:26:32.366482+03
7	3	2026-04-08 11:39:28.348625+03
8	3	2026-04-08 11:55:09.116788+03
13	3	2026-04-08 23:59:38.493414+03
14	3	2026-04-09 00:10:11.74987+03
15	3	2026-04-09 00:20:53.42107+03
16	3	2026-04-09 00:21:36.271375+03
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.languages (id, name, code) FROM stdin;
1	English	en
3	Farsi	fa
2	Greek	el
\.


--
-- Data for Name: letters; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.letters (id, writing_style, letter_sign, type, audio_url, image_url, language_id) FROM stdin;
\.


--
-- Data for Name: reel_interactions; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.reel_interactions (id, reel_id, user_id, viewed_at, is_liked, is_saved, comment, commented_at, is_shared, is_reported, report_reason, reported_at) FROM stdin;
1	1	1	2026-04-03 21:43:05.402411+03	t	f	\N	\N	f	f	\N	\N
2	1	2	2026-04-03 21:43:22.200042+03	t	f	Salaaaam	2026-04-03 21:43:46.56887+03	t	f	\N	\N
\.


--
-- Data for Name: reels; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.reels (id, language_id, dialogue_id, created_by, url, thumbnail_url, title, description, duration, created_at) FROM stdin;
7	3	7	3	http://localhost:3500/static/3-sedkhareji/iran.mp4	\N	\N	\N	\N	2026-04-07 09:32:26.697735+03
8	3	8	3	http://localhost:3500/static/3-sedkhareji/ghahve.mp4	\N	\N	\N	\N	2026-04-07 10:24:41.191203+03
13	3	13	4	http://localhost:3500/static/4-calligraphy_ghasemian/nun.mp4	\N	\N	\N	\N	2026-04-07 10:42:35.47637+03
14	3	14	4	http://localhost:3500/static/4-calligraphy_ghasemian/vav.mp4	\N	\N	\N	\N	2026-04-07 10:42:35.481575+03
15	3	15	4	http://localhost:3500/static/4-calligraphy_ghasemian/mim.mp4	\N	\N	\N	\N	2026-04-07 10:44:16.411016+03
16	3	16	4	http://localhost:3500/static/4-calligraphy_ghasemian/i.mp4	\N	\N	\N	\N	2026-04-07 10:44:16.451804+03
1	3	1	1	http://localhost:3500/static/1-admin/dialogue-1.mp4	\N	\N	\N	\N	2026-03-11 13:05:27.864154+02
2	3	2	1	http://localhost:3500/static/1-admin/2-pedram-thomas.mp4	\N	\N	\N	\N	2026-03-11 14:20:13.552634+02
3	3	3	1	http://localhost:3500/static/1-admin/dialogue-3.mp4	\N	\N	\N	\N	2026-03-11 14:23:42.356641+02
4	3	4	1	http://localhost:3500/static/1-admin/dialogue-4.mp4	\N	\N	\N	\N	2026-03-11 14:23:42.360455+02
5	3	5	1	http://localhost:3500/static/1-admin/dialogue-5.mp4	\N	\N	\N	\N	2026-03-11 14:23:42.36396+02
6	3	6	1	http://localhost:3500/static/1-admin/dialogue-6.mp4	\N	\N	\N	\N	2026-03-11 14:23:59.252445+02
9	3	\N	3	http://localhost:3500/static/3-sedkhareji/chayi.mp4	\N	\N	\N	\N	2026-04-07 10:25:05.775204+03
10	3	\N	3	http://localhost:3500/static/3-sedkhareji/akasi.mp4	\N	\N	\N	\N	2026-04-07 10:25:47.411894+03
11	3	\N	3	http://localhost:3500/static/3-sedkhareji/doktor.mp4	\N	\N	\N	\N	2026-04-07 10:27:59.82117+03
12	3	\N	3	http://localhost:3500/static/3-sedkhareji/esfehan.mp4	\N	\N	\N	\N	2026-04-07 10:28:20.622291+03
\.


--
-- Data for Name: sentence_tokens; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sentence_tokens (id, sentence_id, word_id, "position", part_of_speech, created_at) FROM stdin;
\.


--
-- Data for Name: sentence_translations; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sentence_translations (id, sentence_id, translation_sentence_id) FROM stdin;
1	1	5
2	2	6
3	3	7
4	4	8
5	9	14
6	10	15
7	11	16
8	12	17
9	13	18
10	19	20
11	21	22
12	23	24
13	25	26
14	27	39
15	28	40
16	29	41
17	30	42
18	31	43
19	32	44
20	33	45
21	34	46
22	35	47
23	36	48
24	37	49
25	38	50
27	51	52
28	53	54
29	115	116
30	117	118
31	119	120
32	121	122
33	55	56
34	57	58
35	59	60
36	61	62
37	63	64
38	65	66
39	67	68
40	69	70
41	71	72
42	73	74
43	75	76
44	77	78
45	79	80
46	81	82
47	83	84
48	85	86
49	87	88
50	89	90
51	91	92
52	93	94
53	95	96
54	97	98
55	99	100
56	101	102
57	103	104
58	105	106
59	107	108
60	109	110
61	111	112
62	113	114
\.


--
-- Data for Name: sentences; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sentences (id, language_id, text, normalized_text, audio_url, created_at) FROM stdin;
1	3	سَلام	سلام	\N	2026-03-11 14:27:55.553779+02
2	3	اِسمِ مَن مَریَم اَست	اسم من مریم است	\N	2026-03-11 14:28:53.622159+02
3	3	اِسمِ تو چست؟	اسم تو چیست؟	\N	2026-03-11 14:30:27.229394+02
4	3	اِسمِ مَن سیما اَست	اسم من سیما است	\N	2026-03-11 14:30:27.27026+02
5	1	Hello	\N	\N	2026-03-11 14:31:56.965979+02
6	1	My name is Marry	\N	\N	2026-03-11 14:32:11.368111+02
7	1	What is your name?	\N	\N	2026-03-11 14:32:24.183743+02
8	1	My name is Sima.	\N	\N	2026-03-11 14:32:43.439247+02
10	3	من ایرانی هستم.	من ایرانی هستم	\N	2026-04-07 11:15:52.26547+03
11	3	تو اهل کجایی؟	تو اهل کجایی	\N	2026-04-07 11:15:52.26547+03
12	3	من توماس هستم.	من توماس هستم	\N	2026-04-07 11:15:52.26547+03
13	3	من اهل آلمان هستم.	من اهل آلمان هستم	\N	2026-04-07 11:15:52.26547+03
15	1	I am Iranian.	i am iranian	\N	2026-04-07 11:15:52.26547+03
16	1	Where are you from?	where are you from	\N	2026-04-07 11:15:52.26547+03
17	1	I am Thomas.	i am thomas	\N	2026-04-07 11:15:52.26547+03
18	1	I am from Germany.	i am from germany	\N	2026-04-07 11:15:52.26547+03
9	3	 من پدرام هستم	سلام من پدرام هستم	\N	2026-04-07 11:15:52.26547+03
19	3	مَن فَرهاد هَستَم	من فرهاد هستم	\N	2026-04-07 16:59:09.937185+03
20	1	I am Farhad.	i am farhad	\N	2026-04-07 16:59:10.015589+03
21	3	مَن اُستادِ زَبانِ فارسى هَستَم	من استاد زبان فارسی هستم	\N	2026-04-07 16:59:10.199415+03
23	3	مَن مَت هَستَم	من مت هستم	\N	2026-04-07 16:59:10.336116+03
24	1	I am Matt.	i am matt	\N	2026-04-07 16:59:10.476373+03
25	3	مَن هَم اُستادِ ایران‌شِناسى هَستَم	من هم استاد ایران شناسی هستم	\N	2026-04-07 16:59:10.600352+03
26	1	I am also an Iranian studies professor.	i am also an iranian studies professor	\N	2026-04-07 16:59:10.687276+03
27	3	سَلام رابِرت	سلام رابرت	\N	2026-04-07 17:22:46.814035+03
28	3	این دوستِ مَن رَحمان اَست	این دوست من رحمان است	\N	2026-04-07 17:22:46.874268+03
29	3	او اَهلِ مِصر اَست	او اهل مصر است	\N	2026-04-07 17:22:46.973473+03
30	3	خوش‌وَقتَم	خوش وقتم	\N	2026-04-07 17:22:47.082711+03
31	3	سَلام دُریس	سلام دریس	\N	2026-04-07 17:22:47.146992+03
32	3	خوب هَستی؟	خوب هستی؟	\N	2026-04-07 17:22:47.210992+03
33	3	خوب هَستَم مَمنون	خوب هستم ممنون	\N	2026-04-07 17:22:47.338068+03
34	3	تو خوب هَستی؟	تو خوب هستی؟	\N	2026-04-07 17:22:47.425485+03
35	3	مَن هَم خوب هَستَم	من هم خوب هستم	\N	2026-04-07 17:22:47.485135+03
36	3	مَمنون	ممنون	\N	2026-04-07 17:22:47.542419+03
37	3	سَلام دُرسا	سلام درسا	\N	2026-04-07 17:22:47.597218+03
38	3	خُداحافِظ	خداحافظ	\N	2026-04-07 17:22:47.65241+03
39	1	Hello Robert	hello robert	\N	2026-04-07 17:22:47.708239+03
40	1	This is my friend Rahman	this is my friend rahman	\N	2026-04-07 17:22:47.762775+03
41	1	He is from Egypt	he is from egypt	\N	2026-04-07 17:22:47.817975+03
42	1	Nice to meet you	nice to meet you	\N	2026-04-07 17:22:47.876312+03
43	1	Hello Doris	hello doris	\N	2026-04-07 17:22:47.991699+03
44	1	Are you well?	are you well	\N	2026-04-07 17:22:48.068801+03
45	1	I am well, thanks	i am well thanks	\N	2026-04-07 17:22:48.13037+03
46	1	Are you doing well?	are you doing well	\N	2026-04-07 17:22:48.18961+03
47	1	I am also well	i am also well	\N	2026-04-07 17:22:48.245385+03
48	1	Thanks	thanks	\N	2026-04-07 17:22:48.299917+03
49	1	Hello Dorsa	hello dorsa	\N	2026-04-07 17:22:48.354688+03
50	1	Goodbye	goodbye	\N	2026-04-07 17:22:48.413064+03
51	3	سَلام خوش‌وَقتَم	سلام خوش‌وقتم	\N	2026-04-08 11:11:47.820201+03
14	1	I am Pedram.	hello i am pedram	\N	2026-04-07 11:15:52.26547+03
22	1	I am a Farsi language professor.	i am a persian language professor	\N	2026-04-07 16:59:10.292718+03
52	1	Hello, nice to meet you	hello nice to meet you	\N	2026-04-08 11:37:11.567546+03
53	3	هَمِه یِه تیم هَستیم	همه یه تیم هستیم	\N	2026-04-08 11:41:48.359172+03
54	1	We are all one team.	we are all one team	\N	2026-04-08 11:41:48.420237+03
55	3	چایی بیارَم یا قَهوه؟	چایی بیارم یا قهوه؟	\N	2026-04-08 19:11:17.993159+03
56	1	Should I bring tea or coffee?	should i bring tea or coffee	\N	2026-04-08 19:11:17.993159+03
57	3	قَهوه	قهوه	\N	2026-04-08 19:11:17.993159+03
58	1	Coffee	coffee	\N	2026-04-08 19:11:17.993159+03
59	3	چیه؟ قَهوه قَهوه؟	چیه؟ قهوه قهوه؟	\N	2026-04-08 19:11:17.993159+03
60	1	What? Coffee, coffee?	what coffee coffee	\N	2026-04-08 19:11:17.993159+03
61	3	اونَم با مِعده‌یِ خالی؟	اونم با معده‌ی خالی	\N	2026-04-08 19:11:17.993159+03
62	1	And that on an empty stomach?	and that on an empty stomach	\N	2026-04-08 19:11:17.993159+03
63	3	مَن عاشِقِ قَهوه و کِتابَم	من عاشق قهوه و کتابم	\N	2026-04-08 19:11:17.993159+03
64	1	I love coffee and books	i love coffee and books	\N	2026-04-08 19:11:17.993159+03
65	3	بِدونِ شِکَر	بدون شکر	\N	2026-04-08 19:11:17.993159+03
66	1	Without sugar	without sugar	\N	2026-04-08 19:11:17.993159+03
67	3	اکسپرِسو	اکسپرسو	\N	2026-04-08 19:11:17.993159+03
69	3	کِیک بَراتون بِگیرَم	کیک براتون بگیرم	\N	2026-04-08 19:11:17.993159+03
70	1	Should I get some cake for you?	should i get some cake for you	\N	2026-04-08 19:11:17.993159+03
71	3	با قَهوَتوون بُخورین؟	با قهوتون بخورین؟	\N	2026-04-08 19:11:17.993159+03
72	1	To eat with your coffee?	to eat with your coffee	\N	2026-04-08 19:11:17.993159+03
73	3	پَس شُما قَهوه بِگیرین	پس شما قهوه بگیرین	\N	2026-04-08 19:11:17.993159+03
74	1	So you get the coffee	so you get the coffee	\N	2026-04-08 19:11:17.993159+03
75	3	ما با کِیکمون بُخوریم	ما با کیکمون بخوریم	\N	2026-04-08 19:11:17.993159+03
68	1	Ekspresso	espresso	\N	2026-04-08 19:11:17.993159+03
76	1	We will eat it with our cake	we will eat it with our cake	\N	2026-04-08 19:11:17.993159+03
77	3	مَن یه قَهوه	من یه قهوه	\N	2026-04-08 19:11:17.993159+03
78	1	One coffee for me	one coffee for me	\N	2026-04-08 19:11:17.993159+03
79	3	مَنَم یه قَهوه	منم یه قهوه	\N	2026-04-08 19:11:17.993159+03
80	1	Me too, one coffee	me too one coffee	\N	2026-04-08 19:11:17.993159+03
81	3	قَهوه رو هَستی؟	قهوه رو هستی؟	\N	2026-04-08 19:11:17.993159+03
82	1	Are you up for coffee?	are you up for coffee	\N	2026-04-08 19:11:17.993159+03
83	3	هَستَم	هستم	\N	2026-04-08 19:11:17.993159+03
84	1	I am in	i am in	\N	2026-04-08 19:11:17.993159+03
85	3	بَه بَه چه قَهوه‌ای دُرُست کَردَم	به به چه قهوه‌ای درست کردم	\N	2026-04-08 19:11:17.993159+03
86	1	Wow, what a coffee I made!	wow what a coffee i made	\N	2026-04-08 19:11:17.993159+03
87	3	مَن عاشِقِ قَهوه‌اَم	من عاشق قهوه‌ام	\N	2026-04-08 19:11:17.993159+03
88	1	I am in love with coffee	i am in love with coffee	\N	2026-04-08 19:11:17.993159+03
89	3	بَه بَه	به به	\N	2026-04-08 19:11:17.993159+03
90	1	Wonderful / Delightful	wonderful delightful	\N	2026-04-08 19:11:17.993159+03
91	3	مَن که هَلاکِ قَهوه‌اَم	من که هلاک قهوه‌ام	\N	2026-04-08 19:11:17.993159+03
92	1	I am dying for coffee	i am dying for coffee	\N	2026-04-08 19:11:17.993159+03
93	3	قَهوه‌یِ تَلخ می‌خواهَم	قهوه‌ی تلخ می‌خواهم	\N	2026-04-08 19:11:17.993159+03
94	1	I want bitter coffee	i want bitter coffee	\N	2026-04-08 19:11:17.993159+03
95	3	که مَرد اَفکَن بُوَد زورَش	که مرد افکن بود زورش	\N	2026-04-08 19:11:17.993159+03
96	1	So strong it could fell a man	so strong it could fell a man	\N	2026-04-08 19:11:17.993159+03
97	3	تَلخه	تلخه	\N	2026-04-08 19:11:17.993159+03
98	1	It is bitter	it is bitter	\N	2026-04-08 19:11:17.993159+03
99	3	از گَلو پاییین نَرَفته خواب رو دَست به سَر می‌کُنه	از گلو پایین نرفته خواب رو دست به سر می‌کنه	\N	2026-04-08 19:11:17.993159+03
100	1	Before it even goes down the throat, it drives sleep away	before it even goes down the throat it drives sleep away	\N	2026-04-08 19:11:17.993159+03
101	3	شُما تاحالا قَهوه خوردین اصلاً؟	شما تاحالا قهوه خوردین اصلا؟	\N	2026-04-08 19:11:17.993159+03
102	1	Have you ever even had coffee?	have you ever even had coffee	\N	2026-04-08 19:11:17.993159+03
103	3	مَن هَمیشه قَهوه می‌خورَم	من همیشه قهوه می‌خورم	\N	2026-04-08 19:11:17.993159+03
104	1	I always drink coffee	i always drink coffee	\N	2026-04-08 19:11:17.993159+03
105	3	تو هَمیشه قَهوه می‌خوردی؟	تو همیشه قهوه می‌خوردی؟	\N	2026-04-08 19:11:17.993159+03
106	1	Did you always use to drink coffee?	did you always use to drink coffee	\N	2026-04-08 19:11:17.993159+03
107	3	بَله	بله	\N	2026-04-08 19:11:17.993159+03
108	1	Yes	yes	\N	2026-04-08 19:11:17.993159+03
109	3	بُخور بِبینَم	بخور ببینم	\N	2026-04-08 19:11:17.993159+03
110	1	Drink it, let me see	drink it let me see	\N	2026-04-08 19:11:17.993159+03
111	3	بیا	بیا	\N	2026-04-08 19:11:17.993159+03
112	1	Here / Come	here come	\N	2026-04-08 19:11:17.993159+03
113	3	خیلی خوش‌مَزِه است	خیلی خوش‌مزه است	\N	2026-04-08 19:11:17.993159+03
114	1	It is very delicious	it is very delicious	\N	2026-04-08 19:11:17.993159+03
116	1	N	\N	\N	2026-04-09 00:02:10.884085+03
115	3	(noon) نـ  ـنـ  ـن  ن	\N	\N	2026-04-09 00:01:27.922208+03
117	3	(vav) و	\N	\N	2026-04-09 00:06:48.024139+03
118	1	V, O	\N	\N	2026-04-09 00:07:39.076548+03
119	3	(meem) م	\N	\N	2026-04-09 00:20:00.411811+03
120	1	M	\N	\N	2026-04-09 00:20:18.987726+03
121	3	یـ  ـیـ  ـی  ی	\N	\N	2026-04-09 00:23:37.856037+03
122	1	i	\N	\N	2026-04-09 00:23:46.449896+03
124	3	.	\N	\N	2026-04-10 08:45:32.098165+03
\.


--
-- Data for Name: user_languages; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_languages (id, user_id, native_language_id, learning_language_id, created_at, proficiency_level, experience, is_current_language) FROM stdin;
125	1	2	1	2026-03-09 16:58:56.531+02	B1	0	t
127	2	1	3	2026-03-11 23:12:20.68+02	B1	0	t
\.


--
-- Data for Name: user_vocabulary; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_vocabulary (id, user_id, word_id, mastery_level, last_review, created_at, user_languages_id) FROM stdin;
16052	1	2117	1	2026-03-11 22:19:54.633+02	2026-03-09 17:10:13.748+02	125
17103	2	200028	2	2026-04-07 16:06:33.219+03	2026-03-11 23:13:36.677+02	127
17914	2	200910	1	2026-04-07 16:06:46.445+03	2026-04-07 16:06:46.445+03	127
17915	2	190	1	2026-04-07 16:08:01.701+03	2026-04-07 16:08:01.701+03	127
14008	1	26	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14009	1	27	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
17075	2	200000	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
14010	1	28	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14011	1	29	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14012	1	30	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14013	1	31	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14014	1	32	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14015	1	33	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14016	1	34	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14017	1	35	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14018	1	36	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14019	1	37	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14020	1	38	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14022	1	40	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14023	1	41	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14024	1	42	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14025	1	43	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14026	1	44	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14027	1	45	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14029	1	47	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14030	1	48	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14031	1	49	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
17862	2	202245	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
14032	1	50	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
17863	2	202246	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17864	2	202247	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17865	2	202248	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17866	2	202249	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17867	2	202250	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17868	2	202251	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17869	2	202252	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17870	2	202253	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17871	2	202254	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17872	2	202255	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17873	2	202256	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17874	2	202257	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17875	2	202258	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17876	2	202259	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17877	2	202260	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17878	2	202261	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17879	2	202262	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17880	2	202263	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17881	2	202264	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17882	2	202265	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17883	2	202266	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17909	2	200512	1	2026-03-12 18:21:49.986+02	2026-03-12 18:21:49.986+02	127
17910	2	201480	4	2026-04-03 21:25:09.543+03	2026-03-30 22:54:07.849+03	127
17911	2	200434	1	2026-04-03 21:25:15.878+03	2026-04-03 21:25:15.878+03	127
17912	2	201016	1	2026-04-03 21:25:17.338+03	2026-04-03 21:25:17.338+03	127
17913	2	201479	1	2026-04-03 21:25:18.973+03	2026-04-03 21:25:18.973+03	127
17908	2	201184	1	2026-04-07 16:04:58.017+03	2026-03-12 18:21:27.658+02	127
17076	2	200001	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17077	2	200002	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17078	2	200003	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17079	2	200004	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17080	2	200005	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17081	2	200006	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17082	2	200007	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17083	2	200008	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17084	2	200009	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17085	2	200010	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17086	2	200011	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17087	2	200012	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17088	2	200013	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17089	2	200014	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17090	2	200015	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17091	2	200016	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17092	2	200017	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17093	2	200018	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17094	2	200019	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17095	2	200020	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17096	2	200021	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17097	2	200022	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17098	2	200023	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17099	2	200024	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17100	2	200025	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17101	2	200026	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17102	2	200027	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17104	2	200029	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17105	2	200030	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17106	2	200031	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17107	2	201490	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17108	2	201491	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17109	2	201492	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17110	2	201493	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17111	2	201494	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17112	2	201495	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17113	2	201496	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17114	2	201497	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17115	2	201498	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17116	2	201499	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17117	2	201500	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17118	2	201501	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17119	2	201502	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17120	2	201503	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17121	2	201504	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17122	2	201505	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17123	2	201506	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17124	2	201507	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17125	2	201508	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17126	2	201509	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17127	2	201510	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17128	2	201511	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17129	2	201512	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17130	2	201513	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17131	2	201514	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17132	2	201515	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17133	2	201516	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17134	2	201517	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17135	2	201518	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17136	2	201519	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17137	2	201520	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17138	2	201521	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17139	2	201522	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17140	2	201523	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17141	2	201524	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17142	2	201525	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17143	2	201526	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17144	2	201527	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17145	2	201528	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17146	2	201529	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17147	2	201530	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17148	2	201531	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17149	2	201532	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17150	2	201533	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17151	2	201534	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17152	2	201535	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17153	2	201536	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17154	2	201537	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17155	2	201538	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17156	2	201539	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17157	2	201540	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17158	2	201541	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17159	2	201542	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17160	2	201543	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17161	2	201544	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17162	2	201545	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17163	2	201546	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17164	2	201547	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17165	2	201548	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17166	2	201549	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17167	2	201550	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17168	2	201551	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17169	2	201552	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17170	2	201553	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17171	2	201554	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17172	2	201555	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17173	2	201556	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17174	2	201557	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17175	2	201558	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17176	2	201559	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17177	2	201560	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17178	2	201561	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17179	2	201562	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17180	2	201563	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17181	2	201564	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17182	2	201565	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17183	2	201566	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17184	2	201567	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17185	2	201568	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17186	2	201569	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17187	2	201570	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17188	2	201571	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17189	2	201572	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17190	2	201573	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17191	2	201574	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17192	2	201575	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17193	2	201576	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17194	2	201577	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17195	2	201578	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17196	2	201579	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17197	2	201580	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17198	2	201581	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17199	2	201582	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17200	2	201583	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17201	2	201584	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17202	2	201585	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17203	2	201586	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17204	2	201587	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17205	2	201588	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17206	2	201589	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17207	2	201590	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17208	2	201591	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17209	2	201592	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17210	2	201593	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17211	2	201594	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17212	2	201595	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17213	2	201596	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17214	2	201597	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17215	2	201598	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17216	2	201599	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17217	2	201600	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17218	2	201601	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17219	2	201602	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17220	2	201603	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17221	2	201604	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17222	2	201605	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17223	2	201606	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17224	2	201607	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17225	2	201608	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17226	2	201609	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17227	2	201610	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17228	2	201611	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17229	2	201612	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17230	2	201613	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17231	2	201614	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17232	2	201615	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17233	2	201616	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17234	2	201617	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17235	2	201618	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17236	2	201619	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17237	2	201620	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17238	2	201621	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17239	2	201622	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17240	2	201623	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17241	2	201624	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17242	2	201625	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17243	2	201626	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17244	2	201627	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17245	2	201628	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17246	2	201629	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17247	2	201630	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17248	2	201631	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17249	2	201632	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17250	2	201633	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17251	2	201634	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17252	2	201635	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17253	2	201636	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17254	2	201637	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17255	2	201638	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17256	2	201639	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17257	2	201640	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17258	2	201641	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17259	2	201642	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17260	2	201643	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17261	2	201644	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17262	2	201645	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17263	2	201646	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17264	2	201647	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17265	2	201648	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17266	2	201649	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17267	2	201650	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17268	2	201651	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17269	2	201652	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17270	2	201653	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17271	2	201654	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17272	2	201655	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17273	2	201656	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17274	2	201657	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17275	2	201658	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17276	2	201659	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17277	2	201660	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17278	2	201661	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17279	2	201662	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17280	2	201663	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17281	2	201664	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17282	2	201665	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17283	2	201666	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17284	2	201667	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17285	2	201668	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17286	2	201669	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17287	2	201670	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17288	2	201671	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17289	2	201672	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17290	2	201673	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17291	2	201674	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17292	2	201675	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17293	2	201676	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17294	2	201677	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17295	2	201678	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17296	2	201679	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17297	2	201680	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17298	2	201681	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17299	2	201682	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17300	2	201683	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17301	2	201684	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17302	2	201685	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17303	2	201686	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17304	2	201687	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17305	2	201688	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17306	2	201689	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17307	2	201690	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17308	2	201691	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17309	2	201692	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17310	2	201693	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17311	2	201694	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17312	2	201695	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17313	2	201696	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17314	2	201697	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17315	2	201698	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17316	2	201699	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17317	2	201700	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17318	2	201701	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17319	2	201702	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17320	2	201703	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17321	2	201704	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17322	2	201705	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17323	2	201706	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17324	2	201707	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17325	2	201708	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17326	2	201709	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17327	2	201710	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17328	2	201711	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17329	2	201712	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17330	2	201713	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17331	2	201714	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17332	2	201715	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17333	2	201716	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17334	2	201717	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17335	2	201718	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17336	2	201719	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17337	2	201720	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17338	2	201721	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17339	2	201722	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17340	2	201723	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17341	2	201724	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17342	2	201725	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17343	2	201726	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17344	2	201727	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17345	2	201728	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17346	2	201729	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17347	2	201730	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17348	2	201731	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17349	2	201732	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17350	2	201733	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17351	2	201734	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17352	2	201735	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17353	2	201736	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17354	2	201737	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17355	2	201738	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17356	2	201739	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17357	2	201740	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17358	2	201741	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17359	2	201742	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17360	2	201743	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17361	2	201744	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17362	2	201745	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17363	2	201746	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17364	2	201747	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17365	2	201748	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17366	2	201749	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17367	2	201750	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17368	2	201751	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17369	2	201752	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17370	2	201753	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17371	2	201754	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17372	2	201755	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17373	2	201756	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17374	2	201757	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17375	2	201758	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17376	2	201759	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17377	2	201760	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17378	2	201761	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17379	2	201762	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17380	2	201763	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17381	2	201764	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17382	2	201765	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17383	2	201766	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17384	2	201767	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17385	2	201768	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17386	2	201769	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17387	2	201770	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17388	2	201771	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17389	2	201772	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17390	2	201773	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17391	2	201774	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17392	2	201775	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17393	2	201776	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17394	2	201777	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17395	2	201778	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17396	2	201779	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17397	2	201780	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17398	2	201781	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17399	2	201782	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17400	2	201783	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17401	2	201784	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17402	2	201785	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17403	2	201786	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17404	2	201787	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17405	2	201788	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17406	2	201789	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17407	2	201790	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17408	2	201791	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17409	2	201792	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17410	2	201793	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17411	2	201794	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17412	2	201795	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17413	2	201796	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17414	2	201797	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17415	2	201798	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17416	2	201799	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17417	2	201800	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17418	2	201801	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17419	2	201802	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17420	2	201803	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17421	2	201804	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17422	2	201805	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17423	2	201806	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17424	2	201807	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17425	2	201808	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17426	2	201809	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17427	2	201810	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17428	2	201811	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17429	2	201812	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17430	2	201813	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17431	2	201814	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17432	2	201815	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17433	2	201816	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17434	2	201817	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17435	2	201818	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17436	2	201819	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17437	2	201820	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17438	2	201821	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17439	2	201822	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17440	2	201823	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17441	2	201824	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17442	2	201825	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17443	2	201826	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17444	2	201827	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17445	2	201828	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17446	2	201829	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17447	2	201830	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17448	2	201831	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17449	2	201832	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17450	2	201833	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17451	2	201834	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17452	2	201835	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17453	2	201836	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17454	2	201837	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17455	2	201838	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17456	2	201839	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17457	2	201840	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17458	2	201841	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17459	2	201842	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17460	2	201843	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17461	2	201844	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17462	2	201845	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17463	2	201846	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17464	2	201847	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17465	2	201848	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17466	2	201849	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17467	2	201850	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17468	2	201851	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17469	2	201852	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17470	2	201853	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17471	2	201854	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17472	2	201855	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17473	2	201856	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17474	2	201857	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17475	2	201858	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17476	2	201859	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17477	2	201860	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17478	2	201861	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17479	2	201862	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17480	2	201863	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17481	2	201864	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17482	2	201865	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17483	2	201866	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17484	2	201867	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17485	2	201868	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17486	2	201869	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17487	2	201870	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17488	2	201871	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17489	2	201872	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17490	2	201873	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17491	2	201874	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17492	2	201875	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17493	2	201876	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17494	2	201877	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17495	2	201878	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17496	2	201879	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17497	2	201880	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17498	2	201881	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17499	2	201882	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17500	2	201883	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17501	2	201884	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17502	2	201885	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17503	2	201886	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17504	2	201887	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17505	2	201888	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17506	2	201889	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17507	2	201890	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17508	2	201891	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17509	2	201892	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17510	2	201893	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17511	2	201894	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17512	2	201895	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17513	2	201896	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17514	2	201897	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17515	2	201898	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17516	2	201899	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17517	2	201900	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17518	2	201901	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17519	2	201902	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17520	2	201903	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17521	2	201904	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17522	2	201905	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17523	2	201906	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17524	2	201907	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17525	2	201908	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17526	2	201909	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17527	2	201910	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17528	2	201911	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17529	2	201912	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17530	2	201913	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17531	2	201914	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17532	2	201915	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17533	2	201916	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17534	2	201917	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17535	2	201918	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17536	2	201919	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17537	2	201920	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17538	2	201921	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17539	2	201922	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17540	2	201923	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17541	2	201924	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17542	2	201925	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17543	2	201926	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17544	2	201927	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17545	2	201928	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17546	2	201929	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17547	2	201930	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17548	2	201931	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17549	2	201932	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17550	2	201933	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17551	2	201934	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17552	2	201935	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17553	2	201936	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17554	2	201937	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17555	2	201938	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17556	2	201939	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17557	2	201940	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17558	2	201941	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17559	2	201942	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17560	2	201943	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17561	2	201944	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17562	2	201945	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17563	2	201946	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17564	2	201947	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17565	2	201948	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17566	2	201949	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17567	2	201950	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17568	2	201951	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17569	2	201952	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17570	2	201953	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17571	2	201954	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17572	2	201955	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17573	2	201956	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17574	2	201957	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17575	2	201958	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17576	2	201959	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17577	2	201960	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17578	2	201961	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17579	2	201962	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17580	2	201963	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17581	2	201964	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17582	2	201965	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17583	2	201966	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17584	2	201967	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17585	2	201968	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17586	2	201969	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17587	2	201970	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17588	2	201971	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17589	2	201972	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17590	2	201973	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17591	2	201974	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17592	2	201975	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17593	2	201976	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17594	2	201977	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17595	2	201978	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17596	2	201979	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17597	2	201980	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17598	2	201981	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17599	2	201982	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17600	2	201983	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17601	2	201984	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17602	2	201985	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17603	2	201986	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17604	2	201987	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17605	2	201988	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17606	2	201989	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17607	2	201990	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17608	2	201991	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17609	2	201992	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17610	2	201993	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17611	2	201994	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17612	2	201995	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17613	2	201996	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17614	2	201997	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17615	2	201998	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17616	2	201999	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17617	2	202000	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17618	2	202001	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17619	2	202002	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17620	2	202003	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17621	2	202004	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17622	2	202005	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17623	2	202006	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17624	2	202007	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17625	2	202008	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17626	2	202009	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17627	2	202010	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17628	2	202011	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17629	2	202012	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17630	2	202013	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17631	2	202014	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17632	2	202015	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17633	2	202016	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17634	2	202017	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17635	2	202018	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17636	2	202019	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17637	2	202020	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17638	2	202021	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17639	2	202022	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17640	2	202023	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17641	2	202024	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17642	2	202025	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17643	2	202026	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17644	2	202027	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17645	2	202028	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17646	2	202029	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17647	2	202030	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17648	2	202031	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17649	2	202032	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17650	2	202033	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17651	2	202034	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17652	2	202035	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17653	2	202036	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17654	2	202037	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17655	2	202038	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17656	2	202039	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17657	2	202040	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17658	2	202041	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17659	2	202042	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17660	2	202043	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17661	2	202044	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17662	2	202045	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17663	2	202046	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17664	2	202047	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17665	2	202048	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17666	2	202049	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17667	2	202050	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17668	2	202051	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17669	2	202052	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17670	2	202053	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17671	2	202054	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17672	2	202055	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17673	2	202056	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17674	2	202057	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17675	2	202058	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17676	2	202059	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17677	2	202060	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17678	2	202061	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17679	2	202062	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17680	2	202063	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17681	2	202064	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17682	2	202065	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17683	2	202066	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17684	2	202067	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17685	2	202068	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17686	2	202069	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17687	2	202070	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17688	2	202071	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17689	2	202072	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17690	2	202073	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17691	2	202074	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17692	2	202075	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17693	2	202076	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17694	2	202077	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17695	2	202078	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17696	2	202079	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17697	2	202080	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17698	2	202081	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17699	2	202082	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17700	2	202083	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17701	2	202084	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17702	2	202085	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17703	2	202086	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17704	2	202087	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17705	2	202088	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17706	2	202089	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17707	2	202090	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17708	2	202091	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17709	2	202092	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17710	2	202093	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17711	2	202094	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17712	2	202095	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17713	2	202096	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17714	2	202097	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17715	2	202098	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17716	2	202099	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17717	2	202100	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17718	2	202101	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17719	2	202102	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17720	2	202103	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17721	2	202104	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17722	2	202105	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17723	2	202106	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17724	2	202107	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17725	2	202108	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17726	2	202109	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17727	2	202110	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17728	2	202111	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17729	2	202112	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17730	2	202113	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17731	2	202114	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17732	2	202115	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17733	2	202116	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17734	2	202117	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17735	2	202118	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17736	2	202119	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17737	2	202120	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17738	2	202121	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17739	2	202122	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17740	2	202123	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17741	2	202124	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17742	2	202125	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17743	2	202126	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17744	2	202127	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17745	2	202128	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17746	2	202129	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17747	2	202130	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17748	2	202131	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17749	2	202132	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17750	2	202133	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17751	2	202134	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17752	2	202135	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17753	2	202136	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17754	2	202137	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17755	2	202138	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17756	2	202139	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17757	2	202140	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17758	2	202141	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17759	2	202142	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17760	2	202143	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17761	2	202144	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17762	2	202145	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17763	2	202146	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17764	2	202147	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17765	2	202148	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17766	2	202149	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17767	2	202150	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17768	2	202151	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17769	2	202152	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17770	2	202153	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17771	2	202154	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17772	2	202155	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17773	2	202156	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17774	2	202157	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17775	2	202158	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17776	2	202159	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17777	2	202160	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17778	2	202161	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17779	2	202162	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17780	2	202163	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17781	2	202164	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17782	2	202165	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17783	2	202166	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17784	2	202167	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17785	2	202168	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17786	2	202169	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17787	2	202170	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17788	2	202171	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17789	2	202172	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17790	2	202173	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17791	2	202174	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17792	2	202175	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17793	2	202176	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17794	2	202177	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17795	2	202178	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17796	2	202179	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17797	2	202180	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17798	2	202181	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17799	2	202182	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17800	2	202183	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17801	2	202184	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17802	2	202185	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17803	2	202186	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17804	2	202187	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17805	2	202188	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17806	2	202189	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17807	2	202190	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17808	2	202191	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17809	2	202192	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17810	2	202193	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17811	2	202194	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17812	2	202195	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17813	2	202196	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17814	2	202197	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17815	2	202198	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17816	2	202199	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17817	2	202200	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17818	2	202201	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17819	2	202202	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17820	2	202203	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17821	2	202204	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17822	2	202205	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17823	2	202206	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17824	2	202207	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17825	2	202208	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17826	2	202209	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17827	2	202210	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17828	2	202211	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17829	2	202212	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17830	2	202213	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17831	2	202214	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17832	2	202215	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17833	2	202216	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17834	2	202217	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17835	2	202218	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17836	2	202219	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17837	2	202220	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17838	2	202221	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17839	2	202222	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17840	2	202223	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17841	2	202224	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17842	2	202225	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17843	2	202226	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17844	2	202227	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17845	2	202228	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17846	2	202229	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17847	2	202230	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17848	2	202231	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17849	2	202232	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17850	2	202233	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17851	2	202234	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17852	2	202235	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17853	2	202236	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17854	2	202237	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17855	2	202238	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17856	2	202239	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17857	2	202240	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17858	2	202241	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17859	2	202242	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17860	2	202243	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17861	2	202244	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17884	2	202267	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17885	2	202268	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17886	2	202269	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17887	2	202270	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17888	2	202271	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17889	2	202272	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17890	2	202273	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17891	2	202274	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17892	2	202275	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17893	2	202276	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17894	2	202277	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17895	2	202278	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17896	2	202279	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17897	2	202280	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17898	2	202281	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17899	2	202282	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17900	2	202283	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17901	2	202284	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17902	2	202285	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17903	2	202286	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17904	2	202287	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17905	2	202288	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17906	2	202289	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
17907	2	202290	3	2026-03-11 23:13:36.677+02	2026-03-11 23:13:36.677+02	127
14033	1	51	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14034	1	52	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14035	1	53	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14036	1	54	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14037	1	55	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14038	1	56	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14039	1	57	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14040	1	58	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14041	1	59	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14042	1	60	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14043	1	61	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14044	1	62	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14045	1	63	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14046	1	64	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14047	1	65	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14048	1	66	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14049	1	67	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14050	1	68	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14051	1	69	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14052	1	70	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14053	1	71	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14054	1	72	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14055	1	73	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14056	1	74	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14057	1	75	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14058	1	76	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14059	1	77	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14060	1	78	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14061	1	79	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14062	1	80	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14063	1	81	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14064	1	82	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14065	1	83	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14066	1	84	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14067	1	85	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14068	1	86	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14069	1	87	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14070	1	88	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14071	1	89	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14072	1	90	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14073	1	91	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14074	1	92	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14075	1	93	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14076	1	94	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14077	1	95	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14078	1	96	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14079	1	97	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14080	1	98	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14081	1	99	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14082	1	100	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14083	1	101	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14084	1	102	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14085	1	103	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14086	1	104	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14087	1	105	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14088	1	106	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14089	1	107	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14090	1	108	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14091	1	109	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14092	1	110	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14093	1	111	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14094	1	112	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14095	1	113	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14096	1	114	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14097	1	115	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14098	1	116	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14099	1	117	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14100	1	118	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14101	1	119	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14102	1	120	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14103	1	121	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14104	1	122	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14105	1	123	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14106	1	124	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14107	1	125	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14108	1	126	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14109	1	127	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14110	1	128	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14111	1	129	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14112	1	130	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14113	1	131	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14114	1	132	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14115	1	133	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14116	1	134	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14117	1	135	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14118	1	136	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14119	1	137	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14120	1	138	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14121	1	139	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14122	1	140	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14123	1	141	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14124	1	142	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14125	1	143	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14126	1	144	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14127	1	145	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14128	1	146	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14129	1	147	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14130	1	148	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14131	1	149	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14132	1	150	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14133	1	151	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14134	1	152	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14135	1	153	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14136	1	154	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14137	1	155	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14138	1	156	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14139	1	157	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14140	1	158	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14141	1	159	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14142	1	160	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14143	1	161	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14144	1	162	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14145	1	163	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14146	1	164	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14147	1	165	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14148	1	166	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14149	1	167	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14150	1	168	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14151	1	169	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14152	1	170	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14153	1	171	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14154	1	172	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14155	1	173	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14156	1	174	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14157	1	175	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14158	1	176	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14159	1	177	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14160	1	178	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14161	1	179	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14162	1	180	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14163	1	181	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14164	1	182	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14165	1	183	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14166	1	184	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14167	1	185	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14168	1	186	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14169	1	187	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14170	1	188	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14171	1	189	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14172	1	190	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14173	1	191	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14174	1	192	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14175	1	193	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14176	1	194	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14177	1	195	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14178	1	196	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14179	1	197	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14180	1	198	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14181	1	199	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14182	1	200	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14183	1	201	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14184	1	202	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14185	1	203	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14186	1	204	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14187	1	205	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14188	1	206	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14189	1	207	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14190	1	208	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14191	1	209	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14192	1	210	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14193	1	211	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14194	1	212	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14195	1	213	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14196	1	214	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14197	1	215	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14198	1	216	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14199	1	217	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14200	1	218	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14201	1	219	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14202	1	220	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14203	1	221	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14204	1	222	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14205	1	223	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14206	1	224	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14207	1	225	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14208	1	226	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14209	1	227	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14210	1	228	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14211	1	229	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14212	1	230	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14213	1	231	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14214	1	232	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14215	1	233	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14216	1	234	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14217	1	235	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14218	1	236	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14219	1	237	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14220	1	238	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14221	1	239	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14222	1	240	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14223	1	241	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14224	1	242	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14225	1	243	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14226	1	244	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14227	1	245	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14228	1	246	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14229	1	247	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14230	1	248	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14231	1	249	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14232	1	250	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14233	1	251	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14234	1	252	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14235	1	253	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14236	1	254	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14237	1	255	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14238	1	256	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14239	1	257	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14240	1	258	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14241	1	259	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14242	1	260	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14243	1	261	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14244	1	262	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14245	1	263	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14246	1	264	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14247	1	265	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14248	1	266	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14249	1	267	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14250	1	268	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14251	1	269	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14252	1	270	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14253	1	271	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14254	1	272	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14255	1	273	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14256	1	274	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14257	1	275	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14258	1	276	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14259	1	277	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14260	1	278	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14261	1	279	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14262	1	280	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14263	1	281	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14264	1	282	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14265	1	283	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14266	1	284	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14267	1	285	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14268	1	286	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14269	1	287	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14270	1	288	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14271	1	289	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14272	1	290	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14273	1	291	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14274	1	292	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14275	1	293	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14276	1	294	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14277	1	295	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14278	1	296	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14279	1	297	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14280	1	298	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14281	1	299	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14282	1	300	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14283	1	301	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14284	1	302	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14285	1	303	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14286	1	304	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14287	1	305	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14288	1	306	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14289	1	307	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14290	1	308	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14291	1	309	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14292	1	310	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14293	1	311	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14294	1	312	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14295	1	313	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14296	1	314	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14297	1	315	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14298	1	316	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14299	1	317	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14300	1	318	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14301	1	319	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14302	1	320	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14303	1	321	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14304	1	322	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14305	1	323	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14306	1	324	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14307	1	325	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14308	1	326	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14309	1	327	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14310	1	328	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14311	1	329	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14312	1	330	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14313	1	331	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14314	1	332	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14315	1	333	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14316	1	334	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14317	1	335	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14318	1	336	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14319	1	337	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14320	1	338	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14321	1	339	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14322	1	340	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14323	1	341	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14324	1	342	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14325	1	343	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14326	1	344	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14327	1	345	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14328	1	346	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14329	1	347	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14330	1	348	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14331	1	349	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14332	1	350	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14333	1	351	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14334	1	352	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14335	1	353	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14336	1	354	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14337	1	355	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14339	1	357	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14340	1	358	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14341	1	359	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14342	1	360	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14343	1	361	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14344	1	362	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14345	1	363	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14346	1	364	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14347	1	365	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14348	1	366	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14349	1	367	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14350	1	368	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14351	1	369	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14352	1	370	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14353	1	371	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14354	1	372	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14355	1	373	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14356	1	374	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14357	1	375	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14358	1	376	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14359	1	377	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14360	1	378	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14361	1	379	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14362	1	380	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14363	1	381	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14364	1	382	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14365	1	383	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14366	1	384	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14367	1	385	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14368	1	386	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14369	1	387	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14370	1	388	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14371	1	389	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14372	1	390	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14373	1	391	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14374	1	392	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14375	1	393	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14376	1	394	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14377	1	395	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14378	1	396	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14379	1	397	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14380	1	398	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14381	1	399	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14382	1	400	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14383	1	401	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14384	1	402	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14385	1	403	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14386	1	404	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14387	1	405	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14388	1	406	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14389	1	407	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14390	1	408	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14391	1	409	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14392	1	410	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14393	1	411	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14394	1	412	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14395	1	413	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14396	1	414	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14397	1	415	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14398	1	416	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14399	1	417	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14400	1	418	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14401	1	419	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14402	1	420	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14403	1	421	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14404	1	422	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14405	1	423	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14406	1	424	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14407	1	425	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14408	1	426	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14409	1	427	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14410	1	428	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14411	1	429	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14412	1	430	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14413	1	431	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14414	1	432	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14415	1	433	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14416	1	434	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14417	1	435	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14418	1	436	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14419	1	437	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14420	1	438	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14421	1	439	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14422	1	440	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14423	1	441	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14424	1	442	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14425	1	443	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14426	1	444	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14427	1	445	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14428	1	446	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14429	1	447	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14430	1	448	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14431	1	449	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14432	1	450	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14433	1	451	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14434	1	452	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14435	1	453	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14436	1	454	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14437	1	455	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14438	1	456	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14439	1	457	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14440	1	458	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14441	1	459	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14442	1	460	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14443	1	461	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14444	1	462	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14445	1	463	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14446	1	464	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14447	1	465	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14448	1	466	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14449	1	467	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14450	1	468	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14451	1	469	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14452	1	470	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14453	1	471	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14454	1	472	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14455	1	473	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14456	1	474	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14457	1	475	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14458	1	476	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14459	1	477	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14460	1	478	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14461	1	479	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14462	1	480	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14463	1	481	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14464	1	482	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14465	1	483	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14466	1	484	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14467	1	485	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14468	1	486	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14469	1	487	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14470	1	488	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14471	1	489	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14472	1	490	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14473	1	491	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14474	1	492	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14475	1	493	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14476	1	494	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14477	1	495	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14478	1	496	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14479	1	497	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14480	1	498	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14481	1	499	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14482	1	500	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14483	1	501	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14484	1	502	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14485	1	503	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14486	1	504	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14487	1	505	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14488	1	506	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14489	1	507	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14490	1	508	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14491	1	509	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14492	1	510	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14493	1	511	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14494	1	512	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14495	1	513	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14496	1	514	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14497	1	515	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14498	1	516	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14499	1	517	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14500	1	518	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14501	1	519	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14502	1	520	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14503	1	521	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14504	1	522	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14505	1	523	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14506	1	524	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14507	1	525	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14508	1	526	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14509	1	527	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14510	1	528	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14511	1	529	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14512	1	530	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14513	1	531	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14514	1	532	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14515	1	533	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14516	1	534	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14517	1	535	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14518	1	536	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14519	1	537	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14520	1	538	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14521	1	539	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14522	1	540	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14523	1	541	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14524	1	542	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14525	1	543	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14526	1	544	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14527	1	545	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14528	1	546	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14529	1	547	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14530	1	548	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14531	1	549	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14532	1	550	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14533	1	551	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14534	1	552	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14535	1	553	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14536	1	554	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14537	1	555	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14538	1	556	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14539	1	557	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14540	1	558	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14541	1	559	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14542	1	560	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14543	1	561	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14544	1	562	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14545	1	563	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14546	1	564	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14547	1	565	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14548	1	566	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14549	1	567	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14550	1	568	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14551	1	569	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14552	1	570	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14553	1	571	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14554	1	572	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14555	1	573	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14556	1	574	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14557	1	575	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14558	1	576	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14559	1	577	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14560	1	578	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14561	1	579	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14562	1	580	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14563	1	581	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14564	1	582	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14565	1	583	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14566	1	584	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14567	1	585	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14568	1	586	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14569	1	1587	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14570	1	587	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14571	1	588	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14572	1	589	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14573	1	590	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14574	1	591	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14575	1	592	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14576	1	593	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14577	1	594	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14578	1	595	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14579	1	596	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14580	1	597	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14581	1	598	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14582	1	599	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14583	1	600	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14584	1	601	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14585	1	602	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14586	1	603	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14587	1	604	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14588	1	605	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14589	1	606	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14590	1	607	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14591	1	608	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14592	1	609	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14593	1	610	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14594	1	611	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14595	1	612	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14596	1	613	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14597	1	614	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14598	1	615	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14599	1	616	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14600	1	617	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14601	1	618	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14602	1	619	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14603	1	620	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14604	1	621	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14605	1	622	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14606	1	623	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14607	1	624	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14608	1	625	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14609	1	626	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14610	1	627	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14611	1	628	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14612	1	629	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14613	1	630	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14614	1	631	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14615	1	632	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14616	1	633	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14617	1	634	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14618	1	635	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14619	1	636	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14620	1	637	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14621	1	638	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14622	1	639	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14623	1	640	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14624	1	641	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14625	1	642	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14626	1	643	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14627	1	644	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14628	1	645	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14629	1	646	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14630	1	647	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14631	1	648	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14632	1	649	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14633	1	650	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14634	1	651	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14635	1	652	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14636	1	653	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14637	1	654	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14638	1	655	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14639	1	656	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14640	1	657	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14641	1	658	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14642	1	659	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14643	1	660	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14644	1	661	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14645	1	662	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14646	1	663	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14647	1	664	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14648	1	665	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14649	1	666	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14650	1	667	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14651	1	668	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14652	1	669	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14653	1	670	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14654	1	671	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14655	1	672	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14656	1	673	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14657	1	674	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14658	1	675	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14659	1	676	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14660	1	677	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14661	1	678	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14662	1	679	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14663	1	680	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14664	1	681	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14665	1	682	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14666	1	683	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14667	1	684	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14668	1	685	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14669	1	686	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14670	1	687	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14671	1	688	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14672	1	689	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14673	1	690	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14674	1	691	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14675	1	692	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14676	1	693	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14677	1	694	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14678	1	695	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14679	1	696	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14680	1	697	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14681	1	698	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14682	1	699	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14683	1	700	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14684	1	701	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14685	1	702	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14686	1	703	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14687	1	704	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14688	1	705	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14689	1	706	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14690	1	707	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14691	1	708	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14692	1	709	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14693	1	710	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14694	1	711	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14695	1	712	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14696	1	713	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14697	1	714	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14698	1	715	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14699	1	716	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14700	1	717	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14701	1	718	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14702	1	719	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14703	1	720	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14704	1	721	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14705	1	722	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14706	1	723	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14707	1	724	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14708	1	725	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14709	1	726	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14710	1	727	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14711	1	728	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14712	1	729	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14713	1	730	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14714	1	731	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14715	1	732	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14716	1	733	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14717	1	734	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14718	1	735	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14719	1	736	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14720	1	737	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14721	1	738	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14722	1	739	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14723	1	740	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14724	1	741	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14725	1	742	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14726	1	743	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14727	1	744	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14728	1	745	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14729	1	746	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14730	1	747	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14731	1	748	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14732	1	749	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14733	1	750	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14734	1	751	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14735	1	752	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14736	1	753	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14737	1	754	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14738	1	755	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14739	1	756	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14740	1	757	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14741	1	758	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14742	1	759	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14743	1	760	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14744	1	761	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14745	1	762	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14746	1	763	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14747	1	764	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14748	1	765	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14749	1	766	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14750	1	767	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14751	1	768	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14752	1	769	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14753	1	770	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14754	1	771	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14755	1	772	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14756	1	773	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14757	1	774	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14758	1	775	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14759	1	776	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14760	1	777	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14761	1	778	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14762	1	779	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14763	1	780	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14764	1	781	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14765	1	782	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14766	1	783	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14767	1	784	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14768	1	785	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14769	1	786	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14770	1	787	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14771	1	788	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14772	1	789	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14773	1	790	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14774	1	791	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14775	1	792	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14776	1	793	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14777	1	794	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14778	1	795	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14779	1	796	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14780	1	797	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14781	1	798	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14782	1	799	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14783	1	800	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14784	1	801	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14785	1	802	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14786	1	803	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14787	1	804	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14788	1	805	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14789	1	806	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14790	1	807	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14791	1	808	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14792	1	809	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14793	1	810	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14794	1	811	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14795	1	812	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14796	1	813	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14797	1	814	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14798	1	815	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14799	1	816	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14800	1	817	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14801	1	818	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14802	1	819	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14803	1	820	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14804	1	821	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14805	1	822	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14806	1	823	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14807	1	824	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14808	1	825	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14809	1	826	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14810	1	827	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14811	1	828	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14812	1	829	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14813	1	830	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14814	1	831	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14815	1	832	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14816	1	833	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14817	1	834	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14818	1	835	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14819	1	836	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14820	1	837	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14821	1	838	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14822	1	839	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14823	1	840	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14824	1	841	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14825	1	842	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14826	1	843	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14827	1	844	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14828	1	845	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14829	1	846	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14830	1	847	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14831	1	848	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14832	1	849	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14833	1	850	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14834	1	851	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14835	1	852	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14836	1	853	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14837	1	854	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14841	1	858	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14854	1	871	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14856	1	873	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14860	1	877	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14861	1	878	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14862	1	879	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14863	1	880	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14864	1	881	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14865	1	882	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14867	1	884	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14868	1	885	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14869	1	886	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14870	1	887	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14871	1	888	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14872	1	889	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14873	1	890	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14874	1	891	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14875	1	892	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14876	1	893	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14877	1	894	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14878	1	895	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14879	1	896	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14880	1	897	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14881	1	898	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14882	1	899	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14883	1	900	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14884	1	901	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14885	1	902	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14886	1	903	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14887	1	904	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14888	1	905	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14889	1	906	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14890	1	907	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14891	1	908	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14892	1	909	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14893	1	910	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14894	1	911	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14895	1	912	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14896	1	913	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14897	1	914	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14898	1	915	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14899	1	916	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14900	1	917	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14901	1	918	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14902	1	919	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14903	1	920	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14904	1	921	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14905	1	922	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14906	1	923	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14907	1	924	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14908	1	925	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14909	1	926	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14910	1	927	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14911	1	928	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14912	1	929	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14913	1	930	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14914	1	931	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14915	1	932	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14916	1	933	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14917	1	934	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14918	1	935	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14919	1	936	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14920	1	937	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14921	1	938	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14922	1	939	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14923	1	940	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14924	1	941	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14925	1	942	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14926	1	943	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14927	1	944	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14928	1	945	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14929	1	946	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14930	1	947	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14931	1	948	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14932	1	949	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14933	1	950	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14934	1	951	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14935	1	952	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14936	1	953	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14937	1	954	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14938	1	955	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14939	1	956	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14940	1	957	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14941	1	958	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14942	1	959	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14943	1	960	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14944	1	961	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14945	1	962	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14946	1	963	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14947	1	964	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14948	1	965	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14949	1	966	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14950	1	967	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14951	1	968	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14952	1	969	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14953	1	970	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14954	1	971	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14955	1	972	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14956	1	973	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14957	1	974	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14958	1	975	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14959	1	976	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14960	1	977	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14961	1	978	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14962	1	979	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14963	1	980	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14964	1	981	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14965	1	982	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14966	1	983	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14967	1	984	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14968	1	985	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14969	1	986	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14970	1	987	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14971	1	988	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14972	1	989	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14973	1	990	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14974	1	991	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14975	1	992	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14976	1	993	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14977	1	994	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14978	1	995	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14979	1	996	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14980	1	997	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14981	1	998	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14982	1	999	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14983	1	1000	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14984	1	1001	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14985	1	1002	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14986	1	1003	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14987	1	1004	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14988	1	1005	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14989	1	1006	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14990	1	1007	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14991	1	1008	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14992	1	1009	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14993	1	1010	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14994	1	1011	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14995	1	1012	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14996	1	1013	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14997	1	1014	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14998	1	1015	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
14999	1	1016	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15000	1	1017	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15001	1	1018	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15002	1	1019	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15003	1	1020	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15004	1	1021	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15005	1	1022	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15006	1	1023	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15007	1	1024	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15008	1	1025	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15009	1	1026	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15010	1	1027	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15011	1	1028	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15012	1	1029	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15013	1	1030	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15014	1	1031	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15015	1	1032	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15016	1	1033	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15017	1	1034	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15018	1	1035	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15019	1	1036	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15020	1	1037	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15021	1	1038	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15022	1	1039	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15023	1	1040	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15024	1	1041	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15025	1	1042	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15026	1	1043	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15027	1	1044	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15028	1	1045	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15029	1	1046	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15030	1	1047	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15031	1	1048	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15032	1	1049	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15033	1	1050	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15034	1	1051	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15035	1	1052	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15036	1	1053	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15037	1	1054	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15038	1	1055	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15039	1	1056	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15040	1	1057	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15041	1	1058	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15042	1	1059	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15043	1	1060	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15044	1	1061	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15045	1	1062	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15046	1	1063	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15047	1	1064	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15048	1	1065	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15049	1	1066	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15050	1	1067	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15051	1	1068	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15052	1	1069	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15053	1	1070	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15054	1	1071	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15055	1	1072	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15056	1	1073	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15057	1	1074	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15058	1	1075	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15059	1	1076	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15060	1	1077	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15061	1	1078	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15062	1	1079	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15063	1	1080	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15064	1	1081	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15065	1	1082	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15066	1	1083	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15067	1	1084	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15068	1	1085	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15069	1	1086	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15070	1	1087	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15071	1	1088	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15072	1	1089	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15073	1	1090	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15074	1	1091	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15075	1	1092	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15076	1	1093	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15077	1	1094	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15078	1	1095	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15079	1	1096	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15080	1	1097	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15081	1	1098	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15082	1	1099	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15083	1	1100	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15084	1	1101	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15085	1	1102	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15086	1	1103	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15087	1	1104	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15088	1	1105	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15089	1	1106	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15090	1	1107	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15091	1	1108	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15092	1	1109	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15093	1	1110	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15094	1	1111	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15095	1	1112	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15096	1	1113	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15097	1	1114	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15098	1	1115	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15099	1	1116	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15100	1	1117	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15101	1	1118	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15102	1	1119	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15103	1	1120	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15104	1	1121	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15105	1	1122	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15106	1	1123	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15107	1	1124	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15108	1	1125	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15109	1	1126	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15110	1	1127	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15111	1	1128	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15112	1	1129	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15113	1	1130	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15114	1	1131	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15115	1	1132	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15116	1	1133	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15117	1	1134	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15118	1	1135	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15119	1	1136	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15120	1	1137	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15121	1	1138	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15122	1	1139	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15123	1	1140	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15124	1	1141	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15125	1	1142	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15126	1	1143	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15127	1	1144	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15128	1	1145	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15129	1	1146	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15130	1	1147	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15131	1	1148	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15132	1	1149	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15133	1	1150	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15134	1	1151	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15135	1	1152	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15136	1	1153	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15137	1	1154	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15138	1	1155	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15139	1	1156	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15140	1	1157	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15141	1	1158	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15142	1	1159	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15143	1	1160	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15144	1	1161	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15145	1	1162	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15146	1	1163	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15147	1	1164	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15148	1	1165	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15149	1	1166	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15150	1	1167	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15151	1	1168	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15152	1	1169	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15153	1	1170	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15154	1	1171	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15155	1	1172	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15156	1	1173	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15157	1	1174	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15158	1	1175	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15159	1	1176	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15160	1	1177	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15161	1	1178	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15162	1	1179	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15163	1	1180	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15164	1	1181	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15165	1	1182	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15166	1	1183	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15167	1	1184	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15168	1	1185	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15169	1	1186	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15170	1	1187	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15171	1	1188	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15172	1	1189	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15173	1	1190	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15174	1	1191	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15175	1	1192	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15176	1	1193	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15177	1	1194	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15178	1	1195	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15179	1	1196	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15180	1	1197	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15181	1	1198	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15182	1	1199	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15183	1	1200	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15184	1	1201	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15185	1	1202	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15186	1	1203	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15187	1	1204	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15188	1	1205	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15189	1	1206	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15190	1	1207	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15191	1	1208	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15192	1	1209	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15193	1	1210	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15194	1	1211	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15195	1	1212	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15196	1	1213	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15197	1	1214	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15198	1	1215	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15199	1	1216	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15200	1	1217	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15201	1	1218	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15202	1	1219	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15203	1	1220	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15204	1	1221	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15205	1	1222	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15206	1	1223	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15207	1	1224	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15208	1	1225	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15209	1	1226	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15210	1	1227	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15211	1	1228	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15212	1	1229	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15213	1	1230	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15214	1	1231	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15215	1	1232	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15216	1	1233	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15217	1	1234	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15218	1	1235	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15219	1	1236	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15220	1	1237	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15221	1	1238	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15222	1	1239	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15223	1	1240	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15224	1	1241	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15225	1	1242	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15226	1	1243	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15227	1	1244	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15228	1	1245	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15229	1	1246	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15230	1	1247	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15231	1	1248	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15232	1	1249	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15233	1	1250	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15234	1	1251	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15235	1	1252	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15236	1	1253	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15237	1	1254	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15238	1	1255	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15239	1	1256	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15240	1	1257	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15241	1	1258	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15242	1	1259	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15243	1	1260	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15244	1	1261	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15245	1	1262	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15246	1	1263	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15247	1	1264	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15248	1	1265	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15249	1	1266	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15250	1	1267	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15251	1	1268	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15252	1	1269	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15253	1	1270	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15254	1	1271	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15255	1	1272	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15256	1	1273	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15257	1	1274	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15258	1	1275	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15259	1	1276	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15260	1	1277	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15261	1	1278	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15262	1	1279	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15263	1	1280	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15264	1	1281	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15265	1	1282	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15266	1	1283	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15267	1	1284	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15268	1	1285	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15269	1	1286	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15270	1	1287	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15271	1	1288	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15272	1	1289	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15273	1	1290	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15274	1	1291	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15275	1	1292	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15276	1	1293	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15277	1	1294	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15278	1	1295	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15279	1	1296	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15280	1	1297	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15281	1	1298	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15282	1	1299	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15283	1	1300	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15284	1	1301	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15285	1	1302	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15286	1	1303	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15287	1	1304	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15288	1	1305	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15289	1	1306	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15290	1	1307	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15291	1	1308	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15292	1	1309	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15293	1	1310	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15294	1	1311	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15295	1	1312	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15296	1	1313	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15297	1	1314	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15298	1	1315	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15299	1	1316	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15300	1	1317	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15301	1	1318	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15302	1	1319	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15303	1	1320	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15304	1	1321	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15305	1	1322	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15306	1	1323	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15307	1	1324	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15308	1	1325	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15309	1	1326	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15310	1	1327	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15311	1	1328	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15312	1	1329	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15313	1	1330	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15314	1	1331	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15315	1	1332	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15316	1	1333	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15317	1	1334	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15318	1	1335	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15319	1	1336	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15320	1	1337	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15321	1	1338	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15322	1	1339	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15323	1	1340	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15324	1	1341	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15325	1	1342	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15326	1	1343	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15327	1	1344	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15328	1	1345	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15329	1	1346	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15330	1	1347	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15331	1	1348	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15332	1	1349	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15333	1	1350	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15334	1	1351	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15335	1	1352	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15336	1	1353	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15337	1	1354	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15338	1	1355	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15339	1	1356	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15340	1	1357	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15341	1	1358	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15342	1	1359	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15343	1	1360	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15344	1	1361	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15345	1	1362	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15346	1	1363	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15347	1	1364	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15348	1	1365	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15349	1	1366	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15350	1	1367	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15351	1	1368	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15352	1	1369	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15353	1	1370	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15354	1	1371	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15355	1	1372	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15356	1	1373	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15357	1	1374	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15358	1	1375	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15359	1	1376	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15360	1	1377	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15361	1	1378	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15362	1	1379	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15363	1	1380	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15364	1	1381	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15365	1	1382	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15366	1	1383	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15367	1	1384	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15368	1	1385	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15369	1	1386	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15370	1	1387	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15371	1	1388	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15372	1	1389	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15373	1	1390	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15374	1	1391	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15375	1	1392	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15376	1	1393	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15377	1	1394	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15378	1	1395	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15379	1	1396	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15380	1	1397	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15381	1	1398	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15382	1	1399	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15383	1	1400	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15384	1	1401	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15385	1	1402	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15386	1	1403	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15387	1	1404	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15388	1	1405	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15389	1	1406	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15390	1	1407	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15391	1	1408	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15392	1	1409	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15393	1	1410	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15394	1	1411	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15395	1	1412	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15396	1	1413	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15397	1	1414	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15398	1	1415	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15399	1	1416	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15400	1	1417	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15401	1	1418	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15402	1	1419	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15403	1	1420	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15404	1	1421	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15405	1	1422	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15406	1	1423	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15407	1	1424	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15408	1	1425	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15409	1	1426	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15410	1	1427	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15411	1	1428	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15412	1	1429	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15413	1	1430	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15414	1	1431	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15415	1	1432	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15416	1	1433	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15417	1	1434	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15418	1	1435	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15419	1	1436	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15420	1	1437	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15421	1	1438	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15422	1	1439	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15423	1	1440	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15424	1	1441	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15425	1	1442	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15426	1	1443	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15427	1	1444	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15428	1	1445	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15429	1	1446	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15430	1	1447	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15431	1	1448	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15432	1	1449	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15433	1	1450	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15434	1	1451	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15435	1	1452	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15436	1	1453	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15437	1	1454	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15438	1	1455	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15439	1	1456	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15440	1	1457	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15441	1	1458	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15442	1	1459	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15443	1	1460	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15444	1	1461	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15445	1	1462	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15446	1	1463	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15447	1	1464	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15448	1	1465	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15449	1	1466	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15450	1	1467	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15451	1	1468	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15452	1	1469	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15453	1	1470	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15454	1	1471	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15455	1	1472	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15456	1	1473	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15457	1	1474	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15458	1	1475	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15459	1	1476	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15460	1	1477	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15461	1	1478	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15462	1	1479	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15463	1	1480	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15464	1	1481	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15465	1	1482	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15466	1	1483	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15467	1	1484	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15468	1	1485	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15469	1	1486	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15470	1	1487	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15471	1	1488	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15472	1	1489	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15473	1	1490	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15474	1	1491	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15475	1	1492	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15476	1	1493	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15477	1	1494	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15478	1	1495	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15479	1	1496	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15480	1	1497	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15481	1	1498	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15482	1	1499	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15483	1	1500	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15484	1	1501	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15485	1	1502	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15486	1	1503	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15487	1	1504	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15488	1	1505	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15489	1	1506	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15490	1	1507	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15491	1	1508	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15492	1	1509	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15493	1	1510	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15494	1	1511	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15495	1	1512	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15496	1	1513	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15497	1	1514	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15498	1	1515	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15499	1	1516	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15500	1	1517	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15501	1	1518	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15502	1	1519	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15503	1	1520	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15504	1	1521	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15505	1	1522	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15506	1	1523	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15507	1	1524	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15508	1	1525	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15509	1	1526	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15510	1	1527	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15511	1	1528	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15512	1	1529	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15513	1	1530	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15514	1	1531	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15515	1	1532	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15516	1	1533	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15517	1	1534	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15518	1	1535	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15519	1	1536	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15520	1	1537	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15521	1	1538	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15522	1	1539	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15523	1	1540	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15524	1	1541	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15525	1	1542	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15526	1	1543	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15527	1	1544	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15528	1	1545	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15529	1	1546	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15530	1	1547	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15531	1	1548	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15532	1	1549	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15533	1	1550	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15534	1	1551	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15535	1	1552	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15536	1	1553	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15537	1	1554	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15538	1	1555	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15539	1	1556	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15540	1	1557	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15541	1	1558	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15542	1	1559	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15543	1	1560	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15544	1	1561	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15545	1	1562	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15546	1	1563	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15547	1	1564	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15548	1	1565	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15549	1	1566	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15550	1	1567	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15551	1	1568	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15552	1	1569	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15553	1	1570	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15554	1	1571	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15555	1	1572	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15556	1	1573	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15557	1	1574	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15558	1	1575	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15559	1	1576	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15560	1	1577	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15561	1	1578	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15562	1	1579	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15563	1	1580	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15564	1	1581	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15565	1	1582	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15566	1	1583	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15567	1	1584	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15568	1	1585	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15569	1	1586	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15570	1	1588	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15571	1	1589	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15572	1	1590	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15573	1	1591	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15574	1	1592	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15575	1	1593	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15576	1	1594	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15577	1	1595	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15578	1	1596	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15579	1	1597	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15580	1	1598	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15581	1	1599	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15582	1	1600	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15583	1	1601	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15584	1	1602	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15585	1	1603	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15586	1	1604	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15587	1	1605	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15588	1	1606	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15589	1	1607	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15590	1	1608	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15591	1	1609	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15592	1	1610	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15593	1	1611	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15594	1	1612	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15595	1	1613	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15596	1	1614	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15597	1	1615	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15598	1	1616	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15599	1	1617	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15600	1	1618	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15601	1	1619	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15602	1	1620	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15603	1	1621	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15604	1	1622	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15605	1	1623	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15606	1	1624	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15607	1	1625	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15608	1	1626	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15609	1	1627	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15610	1	1628	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15611	1	1629	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15612	1	1630	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15613	1	1631	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15614	1	1632	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15615	1	1633	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15616	1	1634	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15617	1	1635	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15618	1	1636	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15619	1	1637	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15620	1	1638	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15621	1	1639	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15622	1	1640	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15623	1	1641	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15624	1	1642	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15625	1	1643	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15626	1	1644	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15627	1	1645	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15628	1	1646	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15629	1	1647	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15630	1	1648	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15631	1	1649	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15632	1	1650	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15633	1	1651	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15634	1	1652	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15635	1	1653	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15636	1	1654	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15637	1	1655	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15638	1	1656	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15639	1	1657	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15640	1	1658	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15641	1	1659	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15642	1	1660	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15643	1	1661	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15644	1	1662	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15645	1	1663	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15646	1	1664	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15647	1	1665	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15648	1	1666	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15649	1	1667	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15650	1	1668	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15651	1	1669	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15652	1	1670	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15653	1	1671	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15654	1	1672	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15655	1	1673	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15656	1	1674	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15657	1	1675	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15658	1	1676	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15659	1	1677	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15660	1	1678	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15661	1	1679	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15662	1	1680	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15663	1	1681	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15664	1	1682	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15665	1	1683	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15666	1	1684	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15667	1	1685	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15668	1	1686	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15669	1	1687	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15670	1	1688	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15671	1	1689	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15672	1	1690	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15673	1	1691	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15674	1	1692	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15675	1	1693	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15676	1	1694	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15677	1	1695	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15678	1	1696	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15679	1	1697	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15680	1	1698	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15681	1	1699	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15682	1	1700	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15683	1	1701	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15684	1	1702	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15685	1	1703	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15686	1	1704	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15687	1	1705	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15688	1	1706	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15689	1	1707	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15690	1	1708	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15691	1	1709	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15692	1	1710	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15693	1	1711	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15694	1	1712	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15695	1	1713	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15696	1	1714	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15697	1	1715	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15698	1	1716	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15699	1	1717	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15700	1	1718	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15701	1	1719	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15702	1	1720	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15703	1	1721	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15704	1	1722	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15705	1	1723	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15706	1	1724	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15707	1	1725	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15708	1	1726	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15709	1	1727	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15710	1	1728	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15711	1	1729	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15712	1	1730	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15713	1	1731	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15714	1	1732	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15715	1	1733	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15716	1	1734	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15717	1	1735	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15718	1	1736	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15719	1	1737	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15720	1	1738	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15721	1	1739	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15722	1	1740	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15723	1	1741	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15724	1	1742	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15725	1	1743	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15726	1	1744	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15727	1	1745	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15728	1	1746	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15729	1	1747	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15730	1	1748	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15731	1	1749	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15732	1	1750	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15733	1	1751	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15734	1	1752	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15735	1	1753	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15736	1	1754	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15737	1	1755	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15738	1	1756	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15739	1	1757	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15740	1	1758	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15741	1	1759	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15742	1	1760	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15743	1	1761	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15744	1	1762	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15745	1	1763	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15746	1	1764	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15747	1	1765	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15748	1	1766	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15749	1	1767	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15750	1	1768	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15751	1	1769	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15752	1	1770	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15753	1	1771	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15754	1	1772	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15755	1	7233	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15756	1	7236	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15757	1	0	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15758	1	1	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15759	1	2	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15760	1	3	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15761	1	4	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15762	1	5	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15763	1	6	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15764	1	7	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15765	1	8	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15766	1	9	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15767	1	10	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15768	1	11	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15769	1	12	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15770	1	13	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15771	1	14	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15772	1	15	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15773	1	16	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15774	1	17	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15775	1	18	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15776	1	19	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15777	1	20	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15778	1	21	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15779	1	22	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15780	1	23	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15781	1	24	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15782	1	25	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15783	1	7238	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15784	1	7239	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15785	1	7240	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15786	1	7241	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15787	1	7242	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15788	1	7243	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15789	1	7244	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15790	1	7245	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15791	1	7247	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15792	1	7248	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15793	1	7249	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15794	1	7250	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15795	1	7251	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15796	1	7253	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15797	1	7255	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15798	1	7256	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15799	1	7258	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15800	1	7260	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15801	1	7262	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15802	1	7263	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15803	1	7264	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15804	1	7265	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15805	1	7266	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15806	1	7267	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15807	1	7268	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15808	1	7269	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15809	1	7270	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15810	1	7271	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15811	1	7272	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15812	1	7274	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15813	1	7275	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15814	1	7277	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15815	1	7278	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15816	1	7279	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15817	1	7280	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15818	1	7281	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15819	1	7282	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15820	1	7283	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15821	1	7285	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15822	1	7286	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15823	1	7287	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15824	1	7289	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15825	1	7290	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15826	1	7291	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15827	1	7293	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15828	1	7294	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15829	1	7295	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15830	1	7296	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15831	1	7300	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15832	1	7301	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15833	1	7302	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15834	1	7303	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15835	1	7304	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15836	1	7305	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15837	1	7306	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15838	1	7307	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15839	1	7308	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15840	1	7309	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15841	1	7310	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15842	1	7312	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15843	1	7314	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15844	1	7315	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15845	1	7316	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15846	1	7317	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15847	1	7319	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15848	1	7320	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15849	1	7321	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15850	1	7326	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15851	1	7328	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15852	1	7330	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15853	1	7331	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15854	1	7334	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15855	1	7335	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15856	1	7336	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15857	1	7339	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15858	1	7340	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15859	1	7341	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15860	1	7344	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15861	1	7345	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15862	1	7346	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15863	1	7348	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15864	1	7349	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15865	1	7352	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15866	1	7353	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15867	1	7354	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15868	1	7355	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15869	1	7356	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15870	1	7357	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15871	1	7358	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15872	1	7359	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15873	1	7361	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15874	1	7362	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15875	1	7363	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15876	1	7364	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15877	1	7365	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15878	1	7366	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15879	1	7367	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15880	1	7368	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15881	1	7369	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15882	1	7372	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15883	1	7373	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15884	1	7375	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15885	1	7376	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15886	1	7379	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15887	1	7380	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15888	1	7381	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15889	1	7382	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15890	1	7383	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15891	1	7384	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15892	1	7385	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15893	1	7388	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15894	1	7390	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15895	1	7391	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15896	1	7392	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15897	1	7396	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15898	1	7400	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15899	1	7402	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15900	1	7403	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15901	1	7404	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15902	1	7405	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15903	1	7406	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15904	1	7407	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15905	1	7408	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15906	1	7409	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15907	1	7410	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15908	1	7412	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15909	1	7414	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15910	1	7415	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15911	1	7416	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15912	1	7418	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15913	1	7419	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15914	1	7420	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15915	1	7422	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15916	1	7424	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15917	1	7425	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15918	1	7426	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15919	1	7428	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15920	1	7429	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15921	1	7430	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15922	1	7432	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15923	1	7433	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15924	1	7434	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15925	1	7435	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15926	1	7436	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15927	1	7440	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15928	1	7442	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15929	1	7443	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15930	1	7444	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15931	1	7445	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15932	1	7446	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15933	1	7447	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15934	1	7448	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15935	1	7449	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15936	1	7452	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15937	1	7453	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15938	1	7454	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15939	1	7455	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15940	1	7456	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15941	1	7457	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15942	1	7458	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15943	1	7459	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15944	1	7463	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15945	1	7464	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15946	1	7470	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15947	1	7471	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15948	1	7472	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15949	1	7473	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15950	1	7474	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15951	1	7475	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15952	1	7476	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15953	1	7477	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15954	1	7478	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15955	1	7479	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15956	1	7482	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15957	1	7483	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15958	1	7487	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15959	1	7488	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15960	1	7490	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15961	1	7491	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15962	1	7493	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15963	1	7494	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15964	1	7495	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15965	1	7497	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15966	1	7499	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15967	1	7500	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15968	1	7501	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15969	1	7502	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15970	1	7503	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15971	1	7504	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15972	1	7505	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15973	1	7506	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15974	1	7507	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15975	1	7508	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15976	1	7509	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15977	1	7510	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15978	1	7511	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15979	1	7512	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15980	1	7513	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15981	1	7514	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15982	1	7515	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15983	1	7516	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15984	1	7517	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15985	1	7518	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15986	1	7519	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15987	1	7521	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15988	1	7522	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15989	1	7523	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15990	1	7524	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15991	1	7525	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15992	1	7526	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15993	1	7527	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15994	1	7528	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15995	1	7529	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15996	1	7530	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15997	1	7534	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15998	1	7535	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
15999	1	7537	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16000	1	7538	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16001	1	7539	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16002	1	7541	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16003	1	7542	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16004	1	7543	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16005	1	7544	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16006	1	7545	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16007	1	7546	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16008	1	7547	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16009	1	7548	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16010	1	7549	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16011	1	7550	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16012	1	7552	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16013	1	7554	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16014	1	7555	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16015	1	7557	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16016	1	7558	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16017	1	7559	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16018	1	7560	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16019	1	7561	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16020	1	7570	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16021	1	7571	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16022	1	7576	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16023	1	7578	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16024	1	7579	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16025	1	7580	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16026	1	7582	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16027	1	7583	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16028	1	7584	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16029	1	7585	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16030	1	7586	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16031	1	7587	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16032	1	7588	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16033	1	7590	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16034	1	7591	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16035	1	7592	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16036	1	7593	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16037	1	7594	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16038	1	7595	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16039	1	7596	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16040	1	7597	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16041	1	7599	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16042	1	7600	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16043	1	7601	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16044	1	7602	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16045	1	7605	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16046	1	7606	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16047	1	7607	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16048	1	7609	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16049	1	7610	3	2026-03-09 17:08:32.449+02	2026-03-09 17:08:32.449+02	125
16053	1	3161	1	2026-03-09 17:10:06.606+02	2026-03-09 17:10:06.606+02	125
16055	1	2617	1	2026-03-09 17:16:05.105+02	2026-03-09 17:16:05.105+02	125
16056	1	2928	1	2026-03-09 17:15:57.191+02	2026-03-09 17:15:57.191+02	125
14338	1	356	2	2026-03-09 17:16:12.364+02	2026-03-09 17:08:32.449+02	125
16057	1	4328	1	2026-03-09 17:16:28.051+02	2026-03-09 17:16:28.051+02	125
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.users (id, google_id, first_name, last_name, username, password_hash, refresh_token, email, profile_picture, joined_date, last_login, energy, coins, age, preferences, notifications, email_verified) FROM stdin;
1	\N	admin	\N	admin	$2b$10$QUDz5xnUbe77Rk9VYBzzl.sZKS7EkU0YVLIb78oICrsCcMd2lU8SG	\N	matin@ionio.gr	\N	2026-03-09 17:08:32.449024+02	2026-04-01 03:11:39.33081+03	100	20	25	Video games	t	f
3	\N		\N	sedkhareji	\N	\N	\N	\N	2026-04-07 09:31:43.637905+03	\N	100	20	\N	\N	t	f
4	\N	\N	\N	calligraphy_ghasemian	\N	\N	\N	\N	2026-04-07 10:41:29.363921+03	\N	100	20	\N	\N	t	f
2	\N	Matin	\N	matin	$2b$10$BAhmVr5MLQm7kkXjUuBeJO4Wlvc.de1dqIh1yipm1ddACHyz3m.VG	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJpYXQiOjE3NzU1Njc0NTAsImV4cCI6MTc3ODE1OTQ1MH0.KA-GBTRvw4QPo7eX_r3sUUPYWaxomx705KOKHRqkDJE	matin1@ionio.gr	\N	2026-03-11 23:13:36.677333+02	2026-04-07 16:10:50.19197+03	100	20	25	Make up	t	f
\.


--
-- Data for Name: word_translations; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.word_translations (id, word_id, translation_word_id, level) FROM stdin;
6196	26	100000	A1
6197	26	100001	A1
6198	26	100002	A1
6199	27	100000	A1
6200	27	100001	A1
6201	27	100002	A1
6202	28	100003	A1
6203	28	100004	A1
6204	29	100005	A1
6205	30	100006	A1
6206	30	100007	A1
6207	31	100008	A1
6208	31	100009	A1
6209	32	100010	A1
6210	33	100011	A1
6211	34	100011	A1
6212	35	100012	A1
6213	36	100013	A1
6214	37	100014	A1
6215	38	100015	A1
6216	39	100016	A1
6217	40	100017	A1
6218	41	100018	A1
6219	41	100019	A1
6220	42	100020	A1
6221	43	100021	A1
6222	44	100022	A1
6223	45	100023	A1
6224	46	100024	A1
6225	46	100025	A1
6226	46	100026	A1
6227	47	100027	A1
6228	48	100028	A1
6229	49	100029	A1
6230	50	100030	A1
6231	50	100031	A1
6232	51	100032	A1
6233	52	100033	A1
6234	53	100034	A1
6235	54	100035	A1
6236	54	100036	A1
6237	54	100037	A1
6238	55	100038	A1
6239	56	100039	A1
6240	57	100040	A1
6241	57	100041	A1
6242	58	100042	A1
6243	58	100043	A1
6244	59	100044	A1
6245	60	100045	A1
6246	61	100046	A1
6247	62	100047	A1
6248	63	100048	A1
6249	63	100049	A1
6250	64	100050	A1
6251	65	100051	A1
6252	66	100052	A1
6253	67	100053	A1
6254	68	100054	A1
6255	69	100055	A1
6256	69	100056	A1
6257	70	100057	A1
6258	70	100058	A1
6259	71	100059	A1
6260	71	100060	A1
6261	71	100061	A1
6262	71	100062	A1
6263	72	100063	A1
6264	73	100064	A1
6265	74	100065	A1
6266	75	100066	A1
6267	76	100067	A1
6268	77	100068	A1
6269	78	100069	A1
6270	79	100070	A1
6271	80	100071	A1
6272	81	100072	A1
6273	82	100073	A1
6274	82	100074	A1
6275	83	100075	A1
6276	84	100076	A1
6277	85	100077	A1
6278	85	100078	A1
6279	86	100077	A1
6280	87	100079	A1
6281	88	100080	A1
6282	89	100081	A1
6283	90	100082	A1
6284	91	100083	A1
6285	92	100084	A1
6286	93	100085	A1
6287	94	100086	A1
6288	95	100021	A1
6289	96	100087	A1
6290	97	100088	A1
6291	98	100089	A1
6292	99	100090	A1
6293	100	100091	A1
6294	101	100092	A1
6295	102	100092	A1
6296	103	100093	A1
6297	104	100094	A1
6298	105	100095	A1
6299	106	100096	A1
6300	107	100097	A1
6301	107	100098	A1
6302	108	100099	A1
6303	108	100100	A1
6304	109	100101	A1
6305	110	100102	A1
6306	111	100103	A1
6307	112	100104	A1
6308	113	100105	A1
6309	114	100106	A1
6310	114	100107	A1
6311	115	100108	A1
6312	116	100109	A1
6313	117	100110	A1
6314	118	100111	A1
6315	119	100112	A1
6316	120	100113	A1
6317	121	100114	A1
6318	121	100115	A1
6319	122	100116	A1
6320	123	100117	A1
6321	124	100118	A1
6322	125	100119	A1
6323	126	100120	A1
6324	127	100121	A1
6325	128	100122	A1
6326	128	100123	A1
6327	129	100124	A1
6328	129	100125	A1
6329	130	100126	A1
6330	131	100127	A1
6331	132	100128	A1
6332	133	100129	A1
6333	134	100130	A1
6334	135	100131	A1
6335	136	100132	A1
6336	137	100133	A1
6337	138	100134	A1
6338	138	100135	A1
6339	139	100136	A1
6340	140	100137	A1
6341	141	100138	A1
6342	142	100139	A1
6343	143	100140	A1
6344	144	100141	A1
6345	145	100142	A1
6346	146	100143	A1
6347	146	100144	A1
6348	147	100145	A1
6349	148	100146	A1
6350	149	100147	A1
6351	150	100148	A1
6352	151	100149	A1
6353	152	100150	A1
6354	153	100151	A1
6355	154	100152	A1
6356	155	100153	A1
6357	155	100154	A1
6358	156	100155	A1
6359	156	100156	A1
6360	157	100157	A1
6361	157	100158	A1
6362	158	100159	A1
6363	159	100160	A1
6364	160	100161	A1
6365	161	100162	A1
6366	162	100163	A1
6367	163	100164	A1
6368	164	100165	A1
6369	164	100166	A1
6370	165	100167	A1
6371	166	100168	A1
6372	167	100169	A1
6373	167	100170	A1
6374	168	100171	A1
6375	169	100172	A1
6376	170	100173	A1
6377	170	100174	A1
6378	171	100175	A1
6379	172	100176	A1
6380	173	100177	A1
6381	174	100178	A1
6382	175	100179	A1
6383	176	100180	A1
6384	177	100181	A1
6385	178	100182	A1
6386	179	100183	A1
6387	180	100184	A1
6388	180	100185	A1
6389	181	100186	A1
6390	182	100187	A1
6391	183	100188	A1
6392	184	100189	A1
6393	185	100190	A1
6394	186	100191	A1
6395	187	100192	A1
6396	188	100193	A1
6397	189	100194	A1
6398	190	100195	A1
6399	191	100196	A1
6400	192	100197	A1
6401	193	100198	A1
6402	193	100199	A1
6403	194	100200	A1
6404	195	100201	A1
6405	196	100202	A1
6406	197	100203	A1
6407	198	100204	A1
6408	199	100205	A1
6409	200	100206	A1
6410	201	100207	A1
6411	202	100208	A1
6412	203	100209	A1
6413	204	100210	A1
6414	205	100211	A1
6415	206	100212	A1
6416	207	100213	A1
6417	208	100214	A1
6418	209	100215	A1
6419	210	100216	A1
6420	211	100217	A1
6421	212	100218	A1
6422	213	100219	A1
6423	214	100220	A1
6424	215	100221	A1
6425	216	100222	A1
6426	217	100223	A1
6427	218	100224	A1
6428	219	100225	A1
6429	220	100226	A1
6430	221	100227	A1
6431	221	100228	A1
6432	222	100207	A1
6433	223	100229	A1
6434	224	100230	A1
6435	225	100231	A1
6436	226	100232	A1
6437	227	100233	A1
6438	228	100234	A1
6439	229	100235	A1
6440	230	100236	A1
6441	231	100237	A1
6442	232	100238	A1
6443	233	100239	A1
6444	234	100240	A1
6445	235	100241	A1
6446	236	100242	A1
6447	237	100243	A1
6448	237	100244	A1
6449	238	100245	A1
6450	239	100246	A1
6451	240	100247	A1
6452	241	100066	A1
6453	242	100249	A1
6454	242	100250	A1
6455	243	100251	A1
6456	244	100252	A1
6457	245	100253	A1
6458	246	100254	A1
6459	247	100255	A1
6460	248	100256	A1
6461	249	100257	A1
6462	249	100258	A1
6463	250	100259	A1
6464	251	100260	A1
6465	251	100261	A1
6466	252	100215	A1
6467	252	100218	A1
6468	252	100294	A1
6469	253	100262	A1
6470	254	100264	A1
6471	255	100265	A1
6472	256	100266	A1
6473	256	100267	A1
6474	257	100268	A1
6475	258	100269	A1
6476	259	100270	A1
6477	260	100271	A1
6478	261	100272	A1
6479	262	100273	A1
6480	263	100274	A1
6481	264	100275	A1
6482	265	100276	A1
6483	265	100277	A1
6484	266	100278	A1
6485	267	100279	A1
6486	268	100280	A1
6487	268	100281	A1
6488	269	100282	A1
6489	270	100283	A1
6490	271	100284	A1
6491	272	100285	A1
6492	273	100286	A1
6493	274	100287	A1
6494	275	100288	A1
6495	276	100289	A1
6496	277	100290	A1
6497	277	100291	A1
6498	278	100292	A1
6499	279	100293	A1
6500	280	100294	A1
6501	281	100295	A1
6502	282	100296	A1
6503	282	100297	A1
6504	283	100298	A1
6505	284	100299	A1
6506	284	100300	A1
6507	285	100301	A1
6508	286	100302	A1
6509	287	100303	A1
6510	288	100304	A1
6511	289	100305	A1
6512	290	100306	A1
6513	291	100307	A1
6514	292	100308	A1
6515	293	100309	A1
6516	294	100310	A1
6517	295	100311	A1
6518	296	100312	A1
6519	297	100313	A1
6520	297	100314	A1
6521	298	100315	A1
6522	299	100316	A1
6523	300	100317	A1
6524	300	100318	A1
6525	301	100319	A1
6526	302	100320	A1
6527	303	100321	A1
6528	304	100322	A1
6529	305	100323	A1
6530	306	100324	A1
6531	307	100325	A1
6532	308	100326	A1
6533	309	100327	A1
6534	310	100328	A1
6535	311	100329	A1
6536	312	100330	A1
6537	313	100331	A1
6538	314	100332	A1
6539	315	100333	A1
6540	316	100334	A1
6541	317	100048	A1
6542	318	100335	A1
6543	319	100336	A1
6544	320	100337	A1
6545	321	100338	A1
6546	322	100339	A1
6547	323	100340	A1
6548	324	100341	A1
6549	325	100342	A1
6550	326	100343	A1
6551	327	100344	A1
6552	328	100345	A1
6553	329	100346	A1
6554	330	100347	A1
6555	331	100348	A1
6556	332	100001	A1
6557	333	100349	A1
6558	334	100347	A1
6559	335	100347	A1
6560	336	100350	A1
6561	337	100342	A1
6562	338	100342	A1
6563	339	100351	A1
6564	340	100352	A1
6565	341	100353	A1
6566	342	100354	A1
6567	343	100355	A1
6568	344	100356	A1
6569	345	100357	A1
6570	346	100358	A1
6571	347	100359	A1
6572	347	100360	A1
6573	348	100361	A1
6574	349	100362	A1
6575	350	100354	A1
6576	351	100062	A1
6577	351	100228	A1
6578	352	100021	A1
6579	353	100363	A1
6580	354	100364	A1
6581	355	100229	A1
6582	356	100365	A1
6583	357	100366	A1
6584	358	100367	A1
6585	359	100368	A1
6586	360	100369	A1
6587	361	100059	A1
6588	362	100370	A1
6589	363	100371	A1
6590	363	100372	A1
6591	364	100373	A1
6592	365	100374	A1
6593	366	100375	A1
6594	367	100376	A1
6595	367	100377	A1
6596	368	100378	A1
6597	369	100379	A1
6598	370	100380	A1
6599	370	100381	A1
6600	371	100382	A1
6601	372	100228	A1
6602	373	100342	A1
6603	374	100383	A1
6604	374	100384	A1
6605	375	100385	A1
6606	376	100386	A1
6607	377	100387	A1
6608	377	100388	A1
6609	378	100389	A1
6610	379	100390	A1
6611	379	100391	A1
6612	380	100392	A1
6613	381	100393	A1
6614	381	100394	A1
6615	382	100395	A1
6616	383	100396	A1
6617	384	100397	A1
6618	385	100398	A1
6619	386	100399	A1
6620	386	100400	A1
6621	387	100401	A1
6622	387	100402	A1
6623	388	100403	A1
6624	389	100350	A1
6625	389	100404	A1
6626	390	100405	A1
6627	391	100406	A1
6628	392	100407	A1
6629	393	100057	A1
6630	394	100087	A1
6631	395	100066	A1
6632	396	100408	A1
6633	396	100409	A1
6634	397	100410	A1
6635	398	100411	A1
6636	399	100412	A1
6637	399	100413	A1
6638	400	100414	A1
6639	400	100415	A1
6640	401	100416	A1
6641	402	100417	A1
6642	402	100418	A1
6643	403	100419	A1
6644	404	100420	A1
6645	405	100056	A1
6646	406	100222	A1
6647	407	100421	A1
6648	408	100422	A1
6649	409	100423	A1
6650	409	100424	A1
6651	410	100425	A1
6652	411	100426	A1
6653	411	100427	A1
6654	412	100428	A1
6655	413	100429	A1
6656	414	100430	A1
6657	415	100431	A1
6658	416	100432	A1
6659	417	100433	A1
6660	418	100434	A1
6661	419	100435	A1
6662	419	100436	A1
6663	420	100437	A1
6664	421	100438	A1
6665	421	100439	A1
6666	422	100440	A1
6667	423	100441	A1
6668	423	100442	A1
6669	424	100443	A1
6670	425	100444	A1
6671	426	100445	A1
6672	427	100446	A1
6673	428	100447	A1
6674	429	100448	A1
6675	429	100449	A1
6676	430	100450	A1
6677	431	100451	A1
6678	432	100229	A1
6679	433	100452	A1
6680	434	100453	A1
6681	435	100454	A1
6682	435	100455	A1
6683	436	100456	A1
6684	437	100457	A1
6685	438	100458	A1
6686	439	100459	A1
6687	440	100460	A1
6688	440	100461	A1
6689	441	100462	A1
6690	442	100463	A1
6691	443	100464	A1
6692	444	100465	A1
6693	445	100466	A1
6694	446	100467	A1
6695	447	100468	A1
6696	448	100469	A1
6697	448	100470	A1
6698	449	100471	A1
6699	450	100472	A1
6700	451	100473	A1
6701	451	100474	A1
6702	452	100475	A1
6703	453	100476	A1
6704	454	100477	A1
6705	454	100478	A1
6706	455	100479	A1
6707	456	100480	A1
6708	457	100481	A1
6709	458	100482	A1
6710	459	100483	A1
6711	460	100485	A1
6712	461	100486	A1
6713	462	100487	A1
6714	463	100488	A1
6715	463	100489	A1
6716	464	100490	A1
6717	465	100491	A1
6718	466	100484	A1
6719	467	100492	A1
6720	468	100493	A1
6721	469	100494	A1
6722	470	100342	A1
6723	471	100495	A1
6724	472	100496	A1
6725	473	100497	A1
6726	474	100498	A1
6727	475	100227	A1
6728	476	100499	A1
6729	476	100500	A1
6730	477	100501	A1
6731	477	100502	A1
6732	478	100503	A1
6733	479	100504	A1
6734	480	100505	A1
6735	481	100506	A1
6736	481	100507	A1
6737	482	100508	A1
6738	483	100509	A1
6739	484	100510	A1
6740	485	100511	A1
6741	486	100512	A1
6742	487	100513	A1
6743	488	100513	A1
6744	489	100464	A1
6745	490	100514	A1
6746	491	100515	A1
6747	492	100492	A1
6748	493	100516	A1
6749	494	100043	A1
6750	495	100517	A1
6751	496	100518	A1
6752	497	100519	A1
6753	498	100362	A1
6754	499	100520	A1
6755	500	100521	A1
6756	500	100522	A1
6757	501	100523	A1
6758	502	100524	A1
6759	503	100525	A1
6760	504	100526	A1
6761	505	100027	A1
6762	506	100527	A1
6763	507	100528	A1
6764	508	100529	A1
6765	509	100530	A1
6766	510	100531	A1
6767	511	100532	A1
6768	512	100533	A1
6769	513	100534	A1
6770	514	100535	A1
6771	515	100536	A1
6772	516	100537	A1
6773	517	100538	A1
6774	518	100539	A1
6775	519	100342	A1
6776	520	100540	A1
6777	521	100541	A1
6778	522	100542	A1
6779	523	100543	A1
6780	524	100544	A1
6781	525	100545	A1
6782	525	100546	A1
6783	526	100547	A1
6784	527	100548	A1
6785	528	100549	A1
6786	529	100550	A1
6787	530	100551	A1
6788	531	100552	A1
6789	532	100553	A1
6790	533	100554	A1
6791	534	100555	A1
6792	535	100556	A1
6793	536	100557	A1
6794	537	100558	A1
6795	538	100559	A1
6796	539	100560	A1
6797	540	100561	A1
6798	541	100562	A1
6799	542	100563	A1
6800	543	100564	A1
6801	544	100565	A1
6802	545	100566	A1
6803	546	100567	A1
6804	547	100568	A1
6805	548	100568	A1
6806	549	100569	A1
6807	550	100570	A1
6808	551	100571	A1
6809	552	100572	A1
6810	553	100573	A1
6811	554	100574	A1
6812	555	100575	A1
6813	556	100576	A1
6814	557	100577	A1
6815	558	100578	A1
6816	559	100579	A1
6817	560	100580	A1
6818	561	100581	A1
6819	562	100582	A1
6820	562	100583	A1
6821	563	100584	A1
6822	564	100585	A1
6823	565	100586	A1
6824	566	100587	A1
6825	567	100588	A1
6826	568	100589	A1
6827	569	100590	A1
6828	570	100591	A1
6829	571	100592	A1
6830	572	100593	A1
6831	573	100594	A1
6832	574	100595	A1
6833	575	100596	A1
6834	576	100597	A1
6835	577	100598	A1
6836	578	100599	A1
6837	579	100600	A1
6838	580	100601	A1
6839	581	100602	A1
6840	582	100603	A1
6841	583	100604	A1
6842	584	100605	A1
6843	585	100606	A1
6844	586	100035	A1
6845	587	100607	A1
6846	588	100607	A1
6847	589	100610	A1
6848	590	100611	A1
6849	591	100612	A1
6850	592	100613	A1
6851	593	100614	A1
6852	594	100615	A1
6853	595	100616	A1
6854	596	100617	A1
6855	597	100618	A1
6856	598	100619	A1
6857	598	100620	A1
6858	599	100621	A1
6859	600	100622	A1
6860	601	100623	A1
6861	602	100624	A1
6862	603	100625	A1
6863	604	100626	A1
6864	605	100627	A1
6865	606	100628	A1
6866	607	100629	A1
6867	608	100630	A1
6868	609	100631	A1
6869	610	100632	A1
6870	611	100633	A1
6871	612	100634	A1
6872	613	100635	A1
6873	613	100636	A1
6874	614	100637	A1
6875	615	100638	A1
6876	616	100639	A1
6877	617	100640	A1
6878	618	100641	A1
6879	619	100642	A1
6880	620	100643	A1
6881	621	100644	A1
6882	622	100645	A1
6883	623	100646	A1
6884	624	100647	A1
6885	625	100648	A1
6886	626	100649	A1
6887	627	100650	A1
6888	628	100621	A1
6889	628	100651	A1
6890	629	100350	A1
6891	630	100652	A1
6892	631	100653	A1
6893	632	100654	A1
6894	633	100655	A1
6895	633	100656	A1
6896	634	100657	A1
6897	635	100658	A1
6898	636	100567	A1
6899	637	100660	A1
6900	638	100661	A1
6901	639	100662	A1
6902	640	100663	A1
6903	641	100664	A1
6904	641	100665	A1
6905	642	100666	A1
6906	643	100667	A1
6907	644	100668	A1
6908	645	100669	A1
6909	646	100670	A1
6910	647	100671	A1
6911	648	100000	A1
6912	648	100001	A1
6913	648	100002	A1
6914	649	100672	A1
6915	650	100673	A1
6916	651	100674	A1
6917	652	100675	A1
6918	653	100676	A1
6919	654	100677	A1
6920	655	100678	A1
6921	656	100679	A1
6922	656	100680	A1
6923	657	100681	A1
6924	658	100682	A1
6925	659	100683	A1
6926	660	100684	A1
6927	661	100685	A1
6928	662	100686	A1
6929	663	100687	A1
6930	664	100688	A1
6931	665	100689	A1
6932	666	100690	A1
6933	667	100362	A1
6934	668	100691	A1
6935	669	100692	A1
6936	670	100693	A1
6937	671	100694	A1
6938	672	100695	A1
6939	673	100696	A1
6940	674	100697	A1
6941	675	100698	A1
6942	676	100699	A1
6943	677	100700	A1
6944	677	100701	A1
6945	678	100702	A1
6946	679	100703	A1
6947	680	100704	A1
6948	681	100705	A1
6949	682	100082	A1
6950	683	100706	A1
6951	684	100707	A1
6952	685	100708	A1
6953	686	100709	A1
6954	687	100710	A1
6955	688	100711	A1
6956	689	100712	A1
6957	689	100713	A1
6958	690	100714	A1
6959	691	100715	A1
6960	692	100716	A1
6961	692	100717	A1
6962	693	100660	A1
6963	694	100718	A1
6964	695	100719	A1
6965	696	100720	A1
6966	697	100721	A1
6967	698	100722	A1
6968	699	100723	A1
6969	700	100724	A1
6970	701	100725	A1
6971	702	100726	A1
6972	703	100727	A1
6973	704	100728	A1
6974	705	100729	A1
6975	706	100730	A1
6976	707	100731	A1
6977	708	100732	A1
6978	709	100733	A1
6979	710	100734	A1
6980	711	100735	A1
6981	712	100736	A1
6982	713	100737	A1
6983	714	100738	A1
6984	715	100739	A1
6985	716	100740	A1
6986	717	100741	A1
6987	718	100742	A1
6988	719	100743	A1
6989	720	100744	A1
6990	721	100745	A1
6991	722	100746	A1
6992	723	100747	A1
6993	724	100748	A1
6994	725	100749	A1
6995	726	100750	A1
6996	727	100751	A1
6997	728	100229	A1
6998	729	100200	A1
6999	730	100022	A1
7000	731	100737	A1
7001	732	100752	A1
7002	733	100753	A1
7003	734	100754	A1
7004	735	100755	A1
7005	736	100756	A1
7006	737	100757	A1
7007	738	100758	A1
7008	739	100759	A1
7009	740	100760	A1
7010	741	100761	A1
7011	742	100762	A1
7012	742	100763	A1
7013	743	100764	A1
7014	744	100765	A1
7015	745	100766	A1
7016	746	100767	A1
7017	747	100768	A1
7018	748	100769	A1
7019	749	100770	A1
7020	750	100771	A1
7021	751	100772	A1
7022	752	100773	A1
7023	753	100774	A1
7024	754	100775	A1
7025	755	100776	A1
7026	756	100777	A1
7027	757	100778	A1
7028	758	100779	A1
7029	759	100780	A1
7030	760	100781	A1
7031	761	100782	A1
7032	762	100783	A1
7033	763	100784	A1
7034	764	100785	A1
7035	765	100786	A1
7036	766	100787	A1
7037	766	100788	A1
7038	767	100789	A1
7039	768	100790	A1
7040	769	100791	A1
7041	770	100792	A1
7042	771	100793	A1
7043	772	100794	A1
7044	773	100795	A1
7045	774	100796	A1
7046	775	100797	A1
7047	776	100342	A1
7048	777	100798	A1
7049	778	100799	A1
7050	779	100800	A1
7051	780	100677	A1
7052	781	100801	A1
7053	782	100802	A1
7054	783	100803	A1
7055	784	100804	A1
7056	785	100805	A1
7057	786	100806	A1
7058	787	100807	A1
7059	788	100808	A1
7060	789	100809	A1
7061	790	100810	A1
7062	791	100811	A1
7063	792	100812	A1
7064	793	100813	A1
7065	794	100814	A1
7066	795	100815	A1
7067	796	100816	A1
7068	797	100817	A1
7069	798	100818	A1
7070	799	100819	A1
7071	800	100820	A1
7072	801	100821	A1
7073	802	100079	A1
7074	803	100079	A1
7075	804	100079	A1
7076	805	100822	A1
7077	806	100823	A1
7078	807	100824	A1
7079	808	100825	A1
7080	809	100826	A1
7081	810	100827	A1
7082	811	100817	A1
7083	812	100819	A1
7084	813	100818	A1
7085	814	100818	A1
7086	815	100818	A1
7087	816	100819	A1
7088	817	100819	A1
7089	818	100822	A1
7090	819	100822	A1
7091	820	100822	A1
7092	821	100822	A1
7093	822	100825	A1
7094	823	100825	A1
7095	824	100825	A1
7096	825	100825	A1
7097	826	100825	A1
7098	827	100825	A1
7099	828	100191	A1
7100	829	100191	A1
7101	830	100191	A1
7102	831	100102	A1
7103	832	100828	A1
7104	833	100829	A1
7105	834	100830	A1
7106	835	100831	A1
7107	836	100832	A1
7108	837	100833	A1
7109	838	100834	A1
7110	839	100835	A1
7111	840	100836	A1
7112	841	100837	A1
7113	842	100838	A1
7114	843	100839	A1
7115	844	100505	A1
7116	845	100379	A1
7117	846	100840	A1
7118	847	100521	A1
7119	848	100841	A1
7120	849	100728	A1
7121	850	100000	A1
7122	850	100001	A1
7123	850	100002	A1
7124	851	100518	A1
7125	852	100028	A1
7126	853	100842	A1
7127	854	100225	A1
7128	855	100843	A2
7129	856	100844	A2
7130	857	100845	A2
7131	858	100846	A2
7132	859	100847	A2
7133	860	100848	A2
7134	860	100849	A2
7135	861	100850	A2
7136	862	100851	A2
7137	862	100852	A2
7138	863	100853	A2
7139	864	100854	A2
7140	865	100855	A2
7141	866	100856	A2
7142	867	100857	A2
7143	868	100857	A2
7144	869	100858	A2
7145	870	100859	A2
7146	871	100016	A2
7147	872	100860	A2
7148	873	100861	A2
7149	874	100862	A2
7150	875	100863	A2
7151	876	100864	A2
7152	877	100024	A2
7153	878	100865	A2
7154	879	100866	A2
7155	880	100867	A2
7156	881	100868	A2
7157	882	100869	A2
7158	883	100870	A2
7159	884	100871	A2
7160	885	100872	A2
7161	885	100873	A2
7162	886	100874	A2
7163	887	100875	A2
7164	888	100039	A2
7165	889	100876	A2
7166	890	100877	A2
7167	891	100878	A2
7168	892	100879	A2
7169	893	100880	A2
7170	894	100881	A2
7171	895	100882	A2
7172	896	100883	A2
7173	897	100884	A2
7174	898	100885	A2
7175	899	100886	A2
7176	900	100887	A2
7177	901	100888	A2
7178	902	100889	A2
7179	903	100890	A2
7180	904	100056	A2
7181	905	100891	A2
7182	906	100892	A2
7183	907	100893	A2
7184	907	100894	A2
7185	908	100895	A2
7186	909	100896	A2
7187	910	100897	A2
7188	911	100898	A2
7189	912	100899	A2
7190	913	100900	A2
7191	913	100901	A2
7192	914	100902	A2
7193	915	100903	A2
7194	916	100904	A2
7195	917	100905	A2
7196	918	100906	A2
7197	919	100907	A2
7198	920	100665	A2
7199	921	100908	A2
7200	921	100909	A2
7201	922	100910	A2
7202	923	100911	A2
7203	924	100912	A2
7204	925	100913	A2
7205	926	100914	A2
7206	927	100915	A2
7207	928	100916	A2
7208	928	100917	A2
7209	929	100918	A2
7210	930	100021	A2
7211	931	100919	A2
7212	932	100920	A2
7213	933	100921	A2
7214	934	100922	A2
7215	934	100923	A2
7216	935	100092	A2
7217	936	100092	A2
7218	937	100092	A2
7219	938	100092	A2
7220	939	100093	A2
7221	940	100924	A2
7222	941	100925	A2
7223	942	100926	A2
7224	943	100927	A2
7225	944	100928	A2
7226	945	100929	A2
7227	946	100930	A2
7228	947	100931	A2
7229	948	100932	A2
7230	949	100933	A2
7231	949	100934	A2
7232	950	100935	A2
7233	951	100936	A2
7234	952	100937	A2
7235	953	100938	A2
7236	954	100939	A2
7237	955	100940	A2
7238	955	100941	A2
7239	956	100940	A2
7240	957	100942	A2
7241	958	100943	A2
7242	959	100944	A2
7243	960	100945	A2
7244	961	100946	A2
7245	961	100947	A2
7246	962	100948	A2
7247	963	100949	A2
7248	964	100950	A2
7249	965	100951	A2
7250	966	100952	A2
7251	967	100953	A2
7252	968	100954	A2
7253	969	100955	A2
7254	970	100956	A2
7255	971	100955	A2
7256	972	100110	A2
7257	973	100957	A2
7258	974	100958	A2
7259	975	100959	A2
7260	976	100960	A2
7261	977	100961	A2
7262	978	100962	A2
7263	979	100963	A2
7264	980	100964	A2
7265	981	100965	A2
7266	982	100966	A2
7267	983	100967	A2
7268	984	100969	A2
7269	985	100968	A2
7270	986	100970	A2
7271	987	100971	A2
7272	988	100972	A2
7273	988	100973	A2
7274	989	100974	A2
7275	990	100975	A2
7276	991	100976	A2
7277	992	100977	A2
7278	993	100978	A2
7279	994	100979	A2
7280	995	100980	A2
7281	996	100981	A2
7282	997	100982	A2
7283	998	100983	A2
7284	999	100984	A2
7285	1000	100985	A2
7286	1001	100986	A2
7287	1002	100987	A2
7288	1003	100129	A2
7289	1004	100988	A2
7290	1005	100989	A2
7291	1006	100990	A2
7292	1007	100132	A2
7293	1008	100496	A2
7294	1009	100523	A2
7295	1010	101033	A2
7296	1011	100991	A2
7297	1012	100992	A2
7298	1012	100993	A2
7299	1013	100994	A2
7300	1013	100995	A2
7301	1014	100996	A2
7302	1014	100997	A2
7303	1015	100998	A2
7304	1016	100999	A2
7305	1017	101000	A2
7306	1018	101001	A2
7307	1019	101002	A2
7308	1020	101003	A2
7309	1021	101004	A2
7310	1022	101005	A2
7311	1023	101006	A2
7312	1024	101007	A2
7313	1025	101008	A2
7314	1026	101009	A2
7315	1026	101010	A2
7316	1027	101011	A2
7317	1028	101012	A2
7318	1029	101013	A2
7319	1030	101014	A2
7320	1030	101015	A2
7321	1031	101016	A2
7322	1032	101017	A2
7323	1033	101018	A2
7324	1034	101019	A2
7325	1035	101020	A2
7326	1036	101021	A2
7327	1037	100144	A2
7328	1038	101022	A2
7329	1039	101023	A2
7330	1040	101024	A2
7331	1041	101025	A2
7332	1042	101026	A2
7333	1043	101027	A2
7334	1044	101028	A2
7335	1045	101029	A2
7336	1046	101030	A2
7337	1047	101031	A2
7338	1048	101032	A2
7339	1049	101033	A2
7340	1050	101034	A2
7341	1051	101035	A2
7342	1052	101036	A2
7343	1053	101037	A2
7344	1054	101038	A2
7345	1055	101038	A2
7346	1056	101039	A2
7347	1057	100169	A2
7348	1058	101040	A2
7349	1059	101041	A2
7350	1060	101042	A2
7351	1060	101043	A2
7352	1061	101044	A2
7353	1062	101045	A2
7354	1063	101046	A2
7355	1064	101047	A2
7356	1065	101048	A2
7357	1066	101049	A2
7358	1067	101050	A2
7359	1068	101051	A2
7360	1069	101052	A2
7361	1070	101053	A2
7362	1071	101054	A2
7363	1072	100576	A2
7364	1073	100198	A2
7365	1074	101055	A2
7366	1074	101056	A2
7367	1075	101057	A2
7368	1076	101058	A2
7369	1077	101059	A2
7370	1078	101060	A2
7371	1079	101061	A2
7372	1080	101062	A2
7373	1081	101063	A2
7374	1082	100532	A2
7375	1082	101064	A2
7376	1083	101065	A2
7377	1084	101066	A2
7378	1085	101067	A2
7379	1086	101068	A2
7380	1086	101069	A2
7381	1087	101070	A2
7382	1088	101071	A2
7383	1089	101072	A2
7384	1090	101073	A2
7385	1091	101074	A2
7386	1092	101075	A2
7387	1093	101076	A2
7388	1093	101077	A2
7389	1094	101078	A2
7390	1095	101079	A2
7391	1096	101080	A2
7392	1097	101081	A2
7393	1098	101081	A2
7394	1099	101082	A2
7395	1100	101083	A2
7396	1101	100197	A2
7397	1102	100197	A2
7398	1103	101084	A2
7399	1104	101085	A2
7400	1105	101086	A2
7401	1106	100202	A2
7402	1107	100204	A2
7403	1108	101087	A2
7404	1108	101088	A2
7405	1109	101089	A2
7406	1110	101090	A2
7407	1111	101091	A2
7408	1112	101092	A2
7409	1113	100402	A2
7410	1113	101093	A2
7411	1114	101094	A2
7412	1115	101095	A2
7413	1116	101096	A2
7414	1117	101096	A2
7415	1118	101096	A2
7416	1119	101097	A2
7417	1120	101098	A2
7418	1121	101099	A2
7419	1122	101100	A2
7420	1123	101101	A2
7421	1124	101102	A2
7422	1125	101103	A2
7423	1126	101104	A2
7424	1127	101105	A2
7425	1128	101106	A2
7426	1129	101107	A2
7427	1130	101108	A2
7428	1131	101109	A2
7429	1132	101110	A2
7430	1133	101111	A2
7431	1134	101112	A2
7432	1135	101113	A2
7433	1136	101114	A2
7434	1137	101115	A2
7435	1138	101116	A2
7436	1139	101117	A2
7437	1140	101118	A2
7438	1141	101119	A2
7439	1142	101120	A2
7440	1143	101120	A2
7441	1144	101121	A2
7442	1145	101122	A2
7443	1146	101123	A2
7444	1147	101124	A2
7445	1148	101125	A2
7446	1149	101125	A2
7447	1150	101126	A2
7448	1151	101127	A2
7449	1152	101128	A2
7450	1153	101129	A2
7451	1154	101130	A2
7452	1155	101131	A2
7453	1156	100557	A2
7454	1157	101132	A2
7455	1158	101133	A2
7456	1158	101134	A2
7457	1159	101135	A2
7458	1160	101136	A2
7459	1161	100253	A2
7460	1162	100253	A2
7461	1163	101137	A2
7462	1164	101138	A2
7463	1165	101139	A2
7464	1166	101140	A2
7465	1167	101141	A2
7466	1168	101142	A2
7467	1168	101143	A2
7468	1169	101144	A2
7469	1170	101145	A2
7470	1171	101146	A2
7471	1171	101147	A2
7472	1172	100266	A2
7473	1173	100490	A2
7474	1174	101148	A2
7475	1175	101149	A2
7476	1176	100273	A2
7477	1177	101150	A2
7478	1178	101150	A2
7479	1179	100274	A2
7480	1180	101151	A2
7481	1181	101152	A2
7482	1182	101153	A2
7483	1183	100278	A2
7484	1184	101154	A2
7485	1185	101155	A2
7486	1186	101156	A2
7487	1187	101157	A2
7488	1188	101158	A2
7489	1189	101159	A2
7490	1190	101160	A2
7491	1191	101161	A2
7492	1192	101162	A2
7493	1193	101163	A2
7494	1194	101164	A2
7495	1195	101165	A2
7496	1196	101166	A2
7497	1197	101167	A2
7498	1198	101168	A2
7499	1199	101169	A2
7500	1200	101170	A2
7501	1200	101171	A2
7502	1201	101172	A2
7503	1202	101173	A2
7504	1203	100596	A2
7505	1204	101174	A2
7506	1205	101175	A2
7507	1206	101176	A2
7508	1207	101177	A2
7509	1208	101178	A2
7510	1209	101179	A2
7511	1210	101180	A2
7512	1211	101181	A2
7513	1212	101182	A2
7514	1212	101183	A2
7515	1213	101184	A2
7516	1214	101185	A2
7517	1215	101186	A2
7518	1216	100334	A2
7519	1217	100334	A2
7520	1218	101187	A2
7521	1219	101188	A2
7522	1220	101189	A2
7523	1221	101190	A2
7524	1222	101191	A2
7525	1222	101192	A2
7526	1223	101193	A2
7527	1224	101194	A2
7528	1225	101195	A2
7529	1226	101196	A2
7530	1227	101197	A2
7531	1228	101198	A2
7532	1229	101199	A2
7533	1229	101200	A2
7534	1230	100350	A2
7535	1231	100350	A2
7536	1232	101201	A2
7537	1233	101202	A2
7538	1234	100342	A2
7539	1235	100808	A2
7540	1236	101203	A2
7541	1237	101204	A2
7542	1238	101205	A2
7543	1239	101206	A2
7544	1240	101207	A2
7545	1241	101208	A2
7546	1242	100404	A2
7547	1243	101209	A2
7548	1244	101210	A2
7549	1245	101211	A2
7550	1246	101212	A2
7551	1247	101213	A2
7552	1248	101214	A2
7553	1249	101215	A2
7554	1250	101216	A2
7555	1251	101217	A2
7556	1252	100571	A2
7557	1253	101218	A2
7558	1254	101219	A2
7559	1255	101220	A2
7560	1256	100205	A2
7561	1257	101222	A2
7562	1258	101223	A2
7563	1259	101224	A2
7564	1260	101225	A2
7565	1261	101226	A2
7566	1262	101227	A2
7567	1263	101228	A2
7568	1264	101229	A2
7569	1265	101230	A2
7570	1266	101231	A2
7571	1267	101232	A2
7572	1268	101232	A2
7573	1269	101233	A2
7574	1270	101234	A2
7575	1270	101235	A2
7576	1271	101236	A2
7577	1272	101237	A2
7578	1273	101238	A2
7579	1274	101239	A2
7580	1275	101240	A2
7581	1276	101241	A2
7582	1277	101242	A2
7583	1278	101243	A2
7584	1279	101244	A2
7585	1280	101245	A2
7586	1281	101246	A2
7587	1282	101248	A2
7588	1283	100120	A2
7589	1284	101249	A2
7590	1285	101250	A2
7591	1286	101252	A2
7592	1287	101251	A2
7593	1288	101253	A2
7594	1289	101254	A2
7595	1290	101255	A2
7596	1291	101256	A2
7597	1292	101257	A2
7598	1293	101258	A2
7599	1294	101259	A2
7600	1295	101260	A2
7601	1296	100401	A2
7602	1297	101261	A2
7603	1298	101262	A2
7604	1299	100405	A2
7605	1300	100405	A2
7606	1301	101263	A2
7607	1302	101264	A2
7608	1303	101265	A2
7609	1304	101266	A2
7610	1305	101267	A2
7611	1305	101268	A2
7612	1306	101269	A2
7613	1307	101270	A2
7614	1308	101271	A2
7615	1309	101272	A2
7616	1310	101272	A2
7617	1311	101272	A2
7618	1312	101273	A2
7619	1313	101274	A2
7620	1314	101275	A2
7621	1315	101276	A2
7622	1316	101276	A2
7623	1317	101276	A2
7624	1318	101277	A2
7625	1319	101278	A2
7626	1320	101279	A2
7627	1321	101280	A2
7628	1322	100404	A2
7629	1323	101281	A2
7630	1324	101282	A2
7631	1325	101283	A2
7632	1326	101284	A2
7633	1327	101285	A2
7634	1328	101286	A2
7635	1328	101287	A2
7636	1329	101288	A2
7637	1330	101289	A2
7638	1331	101290	A2
7639	1332	101291	A2
7640	1333	101292	A2
7641	1334	101293	A2
7642	1335	101294	A2
7643	1336	101295	A2
7644	1337	101296	A2
7645	1338	101297	A2
7646	1339	101298	A2
7647	1340	101298	A2
7648	1341	101299	A2
7649	1342	101300	A2
7650	1343	100767	A2
7651	1344	101301	A2
7652	1345	101302	A2
7653	1346	101303	A2
7654	1347	101304	A2
7655	1348	101305	A2
7656	1349	101306	A2
7657	1350	101307	A2
7658	1351	101308	A2
7659	1352	100781	A2
7660	1353	101309	A2
7661	1353	101310	A2
7662	1354	101311	A2
7663	1355	100812	A2
7664	1356	101312	A2
7665	1357	101313	A2
7666	1358	101314	A2
7667	1359	101315	A2
7668	1360	101316	A2
7669	1361	101317	A2
7670	1362	101318	A2
7671	1363	101319	A2
7672	1364	101320	A2
7673	1365	101321	A2
7674	1366	101322	A2
7675	1367	101323	A2
7676	1368	101324	A2
7677	1369	101325	A2
7678	1370	101326	A2
7679	1371	101327	A2
7680	1372	101328	A2
7681	1373	101329	A2
7682	1374	101330	A2
7683	1375	100497	A2
7684	1376	101331	A2
7685	1377	101331	A2
7686	1378	101332	A2
7687	1379	101333	A2
7688	1380	101334	A2
7689	1381	101335	A2
7690	1382	101336	A2
7691	1383	101337	A2
7692	1384	101338	A2
7693	1385	101339	A2
7694	1385	101340	A2
7695	1386	101341	A2
7696	1387	101342	A2
7697	1388	101343	A2
7698	1389	101344	A2
7699	1390	101345	A2
7700	1391	101346	A2
7701	1392	101347	A2
7702	1393	101348	A2
7703	1394	101349	A2
7704	1395	101350	A2
7705	1395	101351	A2
7706	1396	100840	A2
7707	1397	101352	A2
7708	1398	101353	A2
7709	1399	101354	A2
7710	1400	101355	A2
7711	1401	101356	A2
7712	1402	101357	A2
7713	1403	101358	A2
7714	1404	100540	A2
7715	1405	100540	A2
7716	1406	101359	A2
7717	1407	100540	A2
7718	1408	101360	A2
7719	1409	101361	A2
7720	1409	101362	A2
7721	1410	101363	A2
7722	1411	101364	A2
7723	1412	101365	A2
7724	1413	101366	A2
7725	1414	101367	A2
7726	1415	101368	A2
7727	1416	101369	A2
7728	1417	101370	A2
7729	1417	101371	A2
7730	1418	101372	A2
7731	1419	101373	A2
7732	1419	101374	A2
7733	1420	100557	A2
7734	1421	101375	A2
7735	1422	100016	A2
7736	1423	101376	A2
7737	1424	101377	A2
7738	1425	101378	A2
7739	1426	101379	A2
7740	1427	101380	A2
7741	1428	101381	A2
7742	1429	101382	A2
7743	1429	101383	A2
7744	1430	101384	A2
7745	1431	101385	A2
7746	1432	101386	A2
7747	1433	101387	A2
7748	1434	101388	A2
7749	1435	101389	A2
7750	1436	101390	A2
7751	1436	101391	A2
7752	1437	101392	A2
7753	1438	101393	A2
7754	1438	101394	A2
7755	1439	101395	A2
7756	1440	101396	A2
7757	1440	101397	A2
7758	1441	101398	A2
7759	1442	101399	A2
7760	1443	101401	A2
7761	1444	101400	A2
7762	1445	101402	A2
7763	1446	101403	A2
7764	1447	101404	A2
7765	1448	101405	A2
7766	1449	101406	A2
7767	1450	101407	A2
7768	1451	101408	A2
7769	1452	101409	A2
7770	1453	100588	A2
7771	1454	101410	A2
7772	1455	101411	A2
7773	1456	101412	A2
7774	1457	101413	A2
7775	1458	101414	A2
7776	1459	101415	A2
7777	1460	101416	A2
7778	1460	101417	A2
7779	1461	101418	A2
7780	1462	101419	A2
7781	1463	101420	A2
7782	1464	100596	A2
7783	1464	101421	A2
7784	1465	101422	A2
7785	1466	101423	A2
7786	1467	101424	A2
7787	1467	101425	A2
7788	1468	101426	A2
7789	1469	101427	A2
7790	1470	101428	A2
7791	1471	101429	A2
7792	1472	101430	A2
7793	1473	101431	A2
7794	1474	101432	A2
7795	1474	101433	A2
7796	1475	101434	A2
7797	1476	101435	A2
7798	1477	101436	A2
7799	1478	101437	A2
7800	1479	101438	A2
7801	1480	101439	A2
7802	1481	101440	A2
7803	1482	101441	A2
7804	1483	101442	A2
7805	1484	101442	A2
7806	1485	101443	A2
7807	1486	101444	A2
7808	1487	101445	A2
7809	1488	101446	A2
7810	1489	101447	A2
7811	1490	101448	A2
7812	1491	101449	A2
7813	1492	101450	A2
7814	1492	101451	A2
7815	1493	101452	A2
7816	1494	101453	A2
7817	1495	101454	A2
7818	1496	101455	A2
7819	1497	101456	A2
7820	1498	101457	A2
7821	1499	101458	A2
7822	1500	101459	A2
7823	1501	101460	A2
7824	1502	101461	A2
7825	1503	101462	A2
7826	1504	101463	A2
7827	1505	101464	A2
7828	1506	101465	A2
7829	1507	101466	A2
7830	1508	101467	A2
7831	1508	101468	A2
7832	1509	101469	A2
7833	1509	101470	A2
7834	1510	101471	A2
7835	1511	101472	A2
7836	1512	101473	A2
7837	1513	101474	A2
7838	1514	101475	A2
7839	1515	101476	A2
7840	1516	101477	A2
7841	1517	101478	A2
7842	1518	101479	A2
7843	1519	101152	A2
7844	1520	101480	A2
7845	1521	101481	A2
7846	1522	101482	A2
7847	1523	101484	A2
7848	1524	101485	A2
7849	1525	101486	A2
7850	1526	101487	A2
7851	1527	101488	A2
7852	1527	101489	A2
7853	1528	101490	A2
7854	1529	101491	A2
7855	1530	101492	A2
7856	1531	101493	A2
7857	1532	101494	A2
7858	1533	101495	A2
7859	1534	101496	A2
7860	1535	101497	A2
7861	1536	101498	A2
7862	1537	101499	A2
7863	1538	101500	A2
7864	1539	101501	A2
7865	1540	101502	A2
7866	1541	101503	A2
7867	1542	101504	A2
7868	1543	101505	A2
7869	1544	101506	A2
7870	1545	101507	A2
7871	1546	101508	A2
7872	1547	101509	A2
7873	1548	101510	A2
7874	1549	101511	A2
7875	1550	101512	A2
7876	1551	101513	A2
7877	1552	101514	A2
7878	1553	101515	A2
7879	1554	101516	A2
7880	1555	101517	A2
7881	1556	101518	A2
7882	1557	101519	A2
7883	1558	101520	A2
7884	1558	101521	A2
7885	1559	101522	A2
7886	1560	101523	A2
7887	1561	101525	A2
7888	1562	101526	A2
7889	1563	101527	A2
7890	1564	101528	A2
7891	1565	101530	A2
7892	1566	101531	A2
7893	1567	101532	A2
7894	1568	101533	A2
7895	1569	101534	A2
7896	1570	101535	A2
7897	1571	101536	A2
7898	1572	101537	A2
7899	1573	101538	A2
7900	1574	101539	A2
7901	1575	101540	A2
7902	1576	101541	A2
7903	1577	101542	A2
7904	1578	101543	A2
7905	1579	101544	A2
7906	1580	101545	A2
7907	1581	101546	A2
7908	1582	101547	A2
7909	1582	101548	A2
7910	1583	101549	A2
7911	1584	101550	A2
7912	1585	101551	A2
7913	1586	101552	A2
7914	1587	101553	A2
7915	1587	101554	A2
7916	1588	101555	A2
7917	1588	101556	A2
7918	1589	101557	A2
7919	1590	101558	A2
7920	1591	101559	A2
7921	1592	101560	A2
7922	1593	101561	A2
7923	1594	101562	A2
7924	1595	101563	A2
7925	1596	101564	A2
7926	1596	101565	A2
7927	1597	101566	A2
7928	1598	101567	A2
7929	1599	101568	A2
7930	1600	101569	A2
7931	1601	101570	A2
7932	1602	101571	A2
7933	1603	101572	A2
7934	1604	101573	A2
7935	1605	101574	A2
7936	1606	101575	A2
7937	1607	101576	A2
7938	1608	101577	A2
7939	1609	101578	A2
7940	1610	101579	A2
7941	1611	101580	A2
7942	1612	101581	A2
7943	1613	101582	A2
7944	1614	101583	A2
7945	1615	100287	A2
7946	1616	101584	A2
7947	1617	101585	A2
7948	1618	101586	A2
7949	1619	101587	A2
7950	1620	101588	A2
7951	1621	101589	A2
7952	1622	101590	A2
7953	1623	101591	A2
7954	1623	101592	A2
7955	1624	101593	A2
7956	1625	101594	A2
7957	1625	101595	A2
7958	1626	101596	A2
7959	1627	101597	A2
7960	1628	101598	A2
7961	1629	101599	A2
7962	1630	101600	A2
7963	1631	101601	A2
7964	1631	101602	A2
7965	1632	101603	A2
7966	1633	101604	A2
7967	1634	101605	A2
7968	1635	101606	A2
7969	1636	101607	A2
7970	1637	100428	A2
7971	1638	101608	A2
7972	1639	101609	A2
7973	1640	101610	A2
7974	1641	101611	A2
7975	1642	101612	A2
7976	1643	101613	A2
7977	1644	101614	A2
7978	1645	101615	A2
7979	1646	101616	A2
7980	1647	101617	A2
7981	1648	101618	A2
7982	1649	101619	A2
7983	1649	101620	A2
7984	1650	101215	A2
7985	1651	101621	A2
7986	1652	101622	A2
7987	1653	101623	A2
7988	1654	101624	A2
7989	1655	101625	A2
7990	1656	101626	A2
7991	1657	101627	A2
7992	1658	101628	A2
7993	1659	101629	A2
7994	1660	101630	A2
7995	1661	101631	A2
7996	1662	101632	A2
7997	1663	101633	A2
7998	1664	101634	A2
7999	1665	101635	A2
8000	1666	101636	A2
8001	1667	101637	A2
8002	1668	101638	A2
8003	1669	100621	A2
8004	1670	101639	A2
8005	1671	101640	A2
8006	1672	101641	A2
8007	1673	101642	A2
8008	1674	101643	A2
8009	1675	101644	A2
8010	1676	101645	A2
8011	1677	101646	A2
8012	1678	101647	A2
8013	1679	101648	A2
8014	1680	101649	A2
8015	1681	101650	A2
8016	1682	101651	A2
8017	1682	101652	A2
8018	1683	101653	A2
8019	1684	101654	A2
8020	1685	101655	A2
8021	1686	101656	A2
8022	1687	101657	A2
8023	1688	101658	A2
8024	1689	101659	A2
8025	1690	101660	A2
8026	1691	101661	A2
8027	1692	100702	A2
8028	1693	100702	A2
8029	1694	101662	A2
8030	1695	101663	A2
8031	1696	101664	A2
8032	1697	101665	A2
8033	1698	101666	A2
8034	1699	101667	A2
8035	1700	101668	A2
8036	1701	101669	A2
8037	1702	101670	A2
8038	1703	101671	A2
8039	1704	101672	A2
8040	1705	101673	A2
8041	1706	101674	A2
8042	1707	101675	A2
8043	1707	101676	A2
8044	1708	101677	A2
8045	1708	101678	A2
8046	1709	101679	A2
8047	1709	101680	A2
8048	1710	101681	A2
8049	1711	101682	A2
8050	1712	101161	A2
8051	1713	101683	A2
8052	1714	101684	A2
8053	1715	101685	A2
8054	1716	101507	A2
8055	1717	101686	A2
8056	1718	101687	A2
8057	1719	101688	A2
8058	1720	101689	A2
8059	1721	101690	A2
8060	1722	101691	A2
8061	1723	100730	A2
8062	1724	100730	A2
8063	1725	101692	A2
8064	1726	101693	A2
8065	1727	101195	A2
8066	1728	101694	A2
8067	100733	101693	A2
8068	1730	101695	A2
8069	1731	101696	A2
8070	1732	101697	A2
8071	1733	101698	A2
8072	1734	101699	A2
8073	1735	101700	A2
8074	1736	101701	A2
8075	1737	101702	A2
8076	1738	101703	A2
8077	1739	101704	A2
8078	1740	101705	A2
8079	1741	101706	A2
8080	1742	101707	A2
8081	1743	101708	A2
8082	1744	101709	A2
8083	1745	101710	A2
8084	1746	101711	A2
8085	1747	101712	A2
8086	1747	101713	A2
8087	1748	101714	A2
8088	1748	101715	A2
8089	1749	100841	A2
8090	1750	101716	A2
8091	1751	101717	A2
8092	1752	101717	A2
8093	1753	101718	A2
8094	1754	101719	A2
8095	1755	101720	A2
8096	1756	101721	A2
8097	1757	101722	A2
8098	1758	101723	A2
8099	1759	101724	A2
8100	1760	101725	A2
8101	1761	101726	A2
8102	1762	101727	A2
8103	1763	101728	A2
8104	1764	101729	A2
8105	1765	101730	A2
8106	1766	101731	A2
8107	1767	101732	A2
8108	1768	101733	A2
8109	1769	101734	A2
8110	1770	101735	A2
8111	1771	100813	A2
8112	1772	101736	A2
8113	1773	101737	B1
8114	1774	101738	B1
8115	1775	101739	B1
8116	1776	101740	B1
8117	1777	101741	B1
8118	1778	101742	B1
8119	1779	101743	B1
8120	1780	101744	B1
8121	1781	101745	B1
8122	1782	101746	B1
8123	1783	101747	B1
8124	1784	101748	B1
8125	1785	101749	B1
8126	1786	101750	B1
8127	1787	101751	B1
8128	1788	101752	B1
8129	1789	101753	B1
8130	1790	101754	B1
8131	1791	101755	B1
8132	1792	101756	B1
8133	1793	101757	B1
8134	1794	101758	B1
8135	1795	101759	B1
8136	1796	101760	B1
8137	1797	101761	B1
8138	1799	101762	B1
8139	1800	101763	B1
8140	1801	101764	B1
8141	1802	101765	B1
8142	1803	101766	B1
8143	1804	101767	B1
8144	1805	101768	B1
8145	1806	101769	B1
8146	1807	101770	B1
8147	1808	101771	B1
8148	1809	101772	B1
8149	1810	101773	B1
8150	1811	101774	B1
8151	1812	101775	B1
8152	1813	101776	B1
8153	1814	101777	B1
8154	1815	101778	B1
8155	1816	101779	B1
8156	1817	101780	B1
8157	1818	101781	B1
8158	1819	101782	B1
8159	1820	101783	B1
8160	1821	101784	B1
8161	1822	101785	B1
8162	1823	101786	B1
8163	1824	101787	B1
8164	1826	101788	B1
8165	1827	101789	B1
8166	1828	101790	B1
8167	1829	101791	B1
8168	1830	101792	B1
8169	1831	101793	B1
8170	1832	101794	B1
8171	1834	101795	B1
8172	1836	101796	B1
8173	1837	101797	B1
8174	1839	101798	B1
8175	1840	101799	B1
8176	1841	101800	B1
8177	1842	101801	B1
8178	1843	101802	B1
8179	1844	101803	B1
8180	1845	101804	B1
8181	1845	101805	B1
8182	1846	101806	B1
8183	1846	101807	B1
8184	1847	101808	B1
8185	1848	101809	B1
8186	1849	101810	B1
8187	1850	101811	B1
8188	1851	101812	B1
8189	1852	101813	B1
8190	1853	101814	B1
8191	1854	101815	B1
8192	1855	101816	B1
8193	1856	101817	B1
8194	1857	101818	B1
8195	1858	101819	B1
8196	1858	101820	B1
8197	1859	101821	B1
8198	1860	101822	B1
8199	1861	101823	B1
8200	1862	101824	B1
8201	1863	101825	B1
8202	1864	101826	B1
8203	1865	101827	B1
8204	1866	101828	B1
8205	1867	101829	B1
8206	1868	101830	B1
8207	1869	101831	B1
8208	1870	101832	B1
8209	1871	101833	B1
8210	1872	101834	B1
8211	1873	101835	B1
8212	1874	101836	B1
8213	1875	101837	B1
8214	1876	101838	B1
8215	1877	101839	B1
8216	1878	101840	B1
8217	1879	101841	B1
8218	1880	101842	B1
8219	1881	101843	B1
8220	1882	101844	B1
8221	1883	101845	B1
8222	1884	101846	B1
8223	1885	101847	B1
8224	1886	101848	B1
8225	1887	101849	B1
8226	1888	101850	B1
8227	1888	101851	B1
8228	1889	101852	B1
8229	1890	101853	B1
8230	1890	101854	B1
8231	1891	101855	B1
8232	1892	101856	B1
8233	1893	101857	B1
8234	1894	101858	B1
8235	1895	101859	B1
8236	1896	101860	B1
8237	1896	101861	B1
8238	1897	101862	B1
8239	1898	101863	B1
8240	1899	101864	B1
8241	1900	101865	B1
8242	1901	101866	B1
8243	1902	101867	B1
8244	1902	101868	B1
8245	1903	101869	B1
8246	1903	101870	B1
8247	1904	101871	B1
8248	1904	101872	B1
8249	1905	101873	B1
8250	1906	101874	B1
8251	1907	101875	B1
8252	1908	101876	B1
8253	1909	101877	B1
8254	1910	101878	B1
8255	1911	101879	B1
8256	1912	101880	B1
8257	1913	101881	B1
8258	1914	101882	B1
8259	1915	101883	B1
8260	1916	101884	B1
8261	1917	101885	B1
8262	1918	101886	B1
8263	1918	101887	B1
8264	1919	101888	B1
8265	1920	101889	B1
8266	1921	101890	B1
8267	1922	101891	B1
8268	1923	101892	B1
8269	1924	101893	B1
8270	1925	101894	B1
8271	1926	101895	B1
8272	1927	101896	B1
8273	1928	101897	B1
8274	1929	101898	B1
8275	1930	101899	B1
8276	1931	101900	B1
8277	1932	101901	B1
8278	1933	101902	B1
8279	1934	101903	B1
8280	1935	101904	B1
8281	1936	101905	B1
8282	1937	101906	B1
8283	1938	101907	B1
8284	1939	101908	B1
8285	1940	101909	B1
8286	1940	101910	B1
8287	1941	101911	B1
8288	1941	101912	B1
8289	1942	101913	B1
8290	1943	101914	B1
8291	1944	101915	B1
8292	1945	101916	B1
8293	1946	101917	B1
8294	1947	101918	B1
8295	1948	101919	B1
8296	1949	101920	B1
8297	1950	101921	B1
8298	1951	101922	B1
8299	1952	101923	B1
8300	1953	101924	B1
8301	1954	101925	B1
8302	1954	101926	B1
8303	1955	101927	B1
8304	1956	101928	B1
8305	1957	101929	B1
8306	1958	101930	B1
8307	1959	101931	B1
8308	1960	101932	B1
8309	1961	101933	B1
8310	1962	101934	B1
8311	1963	101935	B1
8312	1964	101936	B1
8313	1965	101937	B1
8314	1966	101938	B1
8315	1967	101939	B1
8316	1968	101940	B1
8317	1969	101941	B1
8318	1970	101942	B1
8319	1971	101943	B1
8320	1972	101944	B1
8321	1973	101945	B1
8322	1974	101946	B1
8323	1975	101947	B1
8324	1976	101948	B1
8325	1977	101949	B1
8326	1978	101950	B1
8327	1979	101951	B1
8328	1980	101952	B1
8329	1981	101953	B1
8330	1982	101954	B1
8331	1983	101955	B1
8332	1984	101956	B1
8333	1985	101957	B1
8334	1986	101958	B1
8335	1987	101959	B1
8336	1988	101960	B1
8337	1989	101961	B1
8338	1990	101962	B1
8339	1991	101963	B1
8340	1992	101964	B1
8341	1993	101965	B1
8342	1994	101966	B1
8343	1995	101967	B1
8344	1996	101968	B1
8345	1997	101969	B1
8346	1998	101970	B1
8347	1998	101971	B1
8348	1999	101972	B1
8349	2000	101973	B1
8350	2001	101974	B1
8351	2002	101975	B1
8352	2003	101977	B1
8353	2004	101978	B1
8354	2005	101979	B1
8355	2006	101980	B1
8356	2007	101981	B1
8357	2008	101982	B1
8358	2009	101983	B1
8359	2010	101984	B1
8360	2011	101985	B1
8361	2012	101986	B1
8362	2013	101987	B1
8363	2014	101988	B1
8364	2015	101989	B1
8365	2016	101990	B1
8366	2017	101991	B1
8367	2018	101992	B1
8368	2019	101993	B1
8369	2020	101994	B1
8370	2021	101995	B1
8371	2022	101996	B1
8372	2023	101997	B1
8373	2023	101998	B1
8374	2024	101999	B1
8375	2025	102000	B1
8376	2026	102001	B1
8377	2027	102002	B1
8378	2028	102003	B1
8379	2029	102004	B1
8380	2030	102005	B1
8381	2031	102006	B1
8382	2032	102007	B1
8383	2032	102008	B1
8384	2033	102009	B1
8385	2034	102010	B1
8386	2035	102011	B1
8387	2036	102012	B1
8388	2037	102013	B1
8389	2038	102014	B1
8390	2039	102015	B1
8391	2040	102016	B1
8392	2041	102017	B1
8393	2041	102018	B1
8394	2042	102019	B1
8395	2042	102020	B1
8396	2043	102021	B1
8397	2043	102022	B1
8398	2044	102023	B1
8399	2045	102024	B1
8400	2045	102025	B1
8401	2046	102026	B1
8402	2046	102027	B1
8403	2047	102028	B1
8404	2048	102029	B1
8405	2049	102030	B1
8406	2050	102031	B1
8407	2051	102032	B1
8408	2052	102033	B1
8409	2053	102034	B1
8410	2054	102035	B1
8411	2055	102036	B1
8412	2055	102037	B1
8413	2056	102038	B1
8414	2057	102039	B1
8415	2058	102040	B1
8416	2059	102041	B1
8417	2060	102042	B1
8418	2061	102043	B1
8419	2061	102044	B1
8420	2062	102045	B1
8421	2062	102046	B1
8422	2063	102047	B1
8423	2064	102048	B1
8424	2065	102049	B1
8425	2066	102050	B1
8426	2067	102051	B1
8427	2068	102052	B1
8428	2069	102053	B1
8429	2069	102054	B1
8430	2070	102055	B1
8431	2071	102056	B1
8432	2071	102057	B1
8433	2072	102058	B1
8434	2073	102059	B1
8435	2074	102060	B1
8436	2074	102061	B1
8437	2075	102062	B1
8438	2076	102063	B1
8439	2077	102064	B1
8440	2078	102065	B1
8441	2079	102066	B1
8442	2080	102067	B1
8443	2081	102068	B1
8444	2082	102069	B1
8445	2083	102070	B1
8446	2084	102071	B1
8447	2085	102072	B1
8448	2086	102073	B1
8449	2087	102074	B1
8450	2088	102075	B1
8451	2089	102076	B1
8452	2089	102077	B1
8453	2090	102078	B1
8454	2091	102079	B1
8455	2092	102080	B1
8456	2093	102081	B1
8457	2093	102082	B1
8458	2094	102083	B1
8459	2095	102084	B1
8460	2096	102085	B1
8461	2097	102086	B1
8462	2098	102087	B1
8463	2098	102088	B1
8464	2099	102089	B1
8465	2099	102090	B1
8466	2100	102091	B1
8467	2101	102092	B1
8468	2102	102093	B1
8469	2102	102094	B1
8470	2103	102095	B1
8471	2103	102096	B1
8472	2104	102097	B1
8473	2105	102098	B1
8474	2105	102099	B1
8475	2106	102100	B1
8476	2107	102101	B1
8477	2108	102102	B1
8478	2108	102103	B1
8479	2109	102104	B1
8480	2110	102105	B1
8481	2111	102106	B1
8482	2112	102107	B1
8483	2113	102108	B1
8484	2113	102109	B1
8485	2114	102110	B1
8486	2115	102111	B1
8487	2116	102112	B1
8488	2117	102113	B1
8489	2118	102114	B1
8490	2118	102115	B1
8491	2119	102116	B1
8492	2119	102117	B1
8493	2120	102118	B1
8494	2120	102119	B1
8495	2121	102120	B1
8496	2122	102121	B1
8497	2123	102122	B1
8498	2124	102122	B1
8499	2125	102123	B1
8500	2126	102124	B1
8501	2127	102125	B1
8502	2128	102126	B1
8503	2129	102127	B1
8504	2130	102128	B1
8505	2131	102129	B1
8506	2132	102130	B1
8507	2133	102131	B1
8508	2134	102132	B1
8509	2135	102133	B1
8510	2136	102134	B1
8511	2137	102135	B1
8512	2138	102136	B1
8513	2139	102137	B1
8514	2140	102138	B1
8515	2141	102139	B1
8516	2141	102140	B1
8517	2142	102141	B1
8518	2143	102142	B1
8519	2144	102143	B1
8520	2145	102144	B1
8521	2146	102145	B1
8522	2147	102146	B1
8523	2148	102147	B1
8524	2149	102148	B1
8525	2150	102149	B1
8526	2151	102150	B1
8527	2152	102151	B1
8528	2153	102152	B1
8529	2154	102153	B1
8530	2154	102154	B1
8531	2155	102155	B1
8532	2156	102156	B1
8533	2157	102157	B1
8534	2158	102158	B1
8535	2159	102159	B1
8536	2160	102160	B1
8537	2161	102161	B1
8538	2162	102162	B1
8539	2162	102163	B1
8540	2163	102164	B1
8541	2164	102165	B1
8542	2165	102166	B1
8543	2166	102167	B1
8544	2166	102168	B1
8545	2167	102169	B1
8546	2168	102170	B1
8547	2169	102171	B1
8548	2170	102172	B1
8549	2170	102173	B1
8550	2171	102174	B1
8551	2172	102175	B1
8552	2172	102176	B1
8553	2173	102177	B1
8554	2174	102178	B1
8555	2175	102179	B1
8556	2175	102180	B1
8557	2176	102181	B1
8558	2176	102182	B1
8559	2177	102183	B1
8560	2178	102184	B1
8561	2179	102185	B1
8562	2180	102186	B1
8563	2180	102187	B1
8564	2181	102188	B1
8565	2182	102189	B1
8566	2183	102190	B1
8567	2184	102191	B1
8568	2185	102192	B1
8569	2186	102193	B1
8570	2187	102194	B1
8571	2187	102195	B1
8572	2188	102196	B1
8573	2188	102197	B1
8574	2189	102198	B1
8575	2190	102200	B1
8576	2197	102199	B1
8577	2191	102201	B1
8578	2192	102202	B1
8579	2193	102203	B1
8580	2193	102204	B1
8581	2194	102205	B1
8582	2195	102206	B1
8583	2196	102207	B1
8584	2198	102208	B1
8585	2199	102209	B1
8586	2199	102210	B1
8587	2200	102211	B1
8588	2201	102212	B1
8589	2202	102213	B1
8590	2203	102214	B1
8591	2204	102215	B1
8592	2205	102216	B1
8593	2206	102217	B1
8594	2207	102218	B1
8595	2207	102219	B1
8596	2208	102220	B1
8597	2209	102221	B1
8598	2210	102222	B1
8599	2211	102223	B1
8600	2211	102224	B1
8601	2212	102225	B1
8602	2213	102226	B1
8603	2214	102227	B1
8604	2215	102228	B1
8605	2216	102229	B1
8606	2217	102230	B1
8607	2218	102231	B1
8608	2218	102232	B1
8609	2219	102233	B1
8610	2220	102234	B1
8611	2221	102235	B1
8612	2222	102236	B1
8613	2223	102237	B1
8614	2224	102238	B1
8615	2225	102239	B1
8616	2226	102240	B1
8617	2227	102241	B1
8618	2227	102242	B1
8619	2228	102243	B1
8620	2228	102244	B1
8621	2229	102245	B1
8622	2230	102246	B1
8623	2231	102247	B1
8624	2231	102248	B1
8625	2232	102249	B1
8626	2233	102250	B1
8627	2234	102251	B1
8628	2234	102252	B1
8629	2235	102253	B1
8630	2236	102254	B1
8631	2236	102255	B1
8632	2237	102256	B1
8633	2238	102257	B1
8634	2239	102258	B1
8635	2240	102259	B1
8636	2240	102260	B1
8637	2241	102261	B1
8638	2242	102262	B1
8639	2243	102263	B1
8640	2243	102264	B1
8641	2244	102265	B1
8642	2245	102266	B1
8643	2246	102267	B1
8644	2247	102268	B1
8645	2248	102269	B1
8646	2249	102270	B1
8647	2250	102271	B1
8648	2250	102272	B1
8649	2252	102273	B1
8650	2253	102274	B1
8651	2254	102275	B1
8652	2255	102276	B1
8653	2256	102277	B1
8654	2257	102278	B1
8655	2258	102279	B1
8656	2259	102280	B1
8657	2260	102281	B1
8658	2260	102282	B1
8659	2261	102283	B1
8660	2262	102284	B1
8661	2263	102285	B1
8662	2264	102286	B1
8663	2264	102287	B1
8664	2265	102288	B1
8665	2265	102289	B1
8666	2266	102290	B1
8667	2267	102291	B1
8668	2268	102292	B1
8669	2269	102293	B1
8670	2269	102294	B1
8671	2270	102295	B1
8672	2271	102296	B1
8673	2272	102297	B1
8674	2273	102298	B1
8675	2274	102299	B1
8676	2275	102300	B1
8677	2276	102301	B1
8678	2276	102302	B1
8679	2277	102303	B1
8680	2278	102304	B1
8681	2279	102305	B1
8682	2280	102306	B1
8683	2281	102307	B1
8684	2282	102308	B1
8685	2283	102309	B1
8686	2284	102310	B1
8687	2285	102311	B1
8688	2285	102312	B1
8689	2286	102313	B1
8690	2287	102314	B1
8691	2288	102315	B1
8692	2288	102316	B1
8693	2289	102317	B1
8694	2290	102318	B1
8695	2291	102319	B1
8696	2292	102320	B1
8697	2293	102321	B1
8698	2294	102322	B1
8699	2294	102323	B1
8700	2295	102324	B1
8701	2296	102325	B1
8702	2296	102326	B1
8703	2297	102327	B1
8704	2297	102328	B1
8705	2298	102329	B1
8706	2299	102330	B1
8707	2299	102331	B1
8708	2300	102332	B1
8709	2300	102333	B1
8710	2301	102334	B1
8711	2301	102335	B1
8712	2302	102336	B1
8713	2302	102337	B1
8714	2303	102338	B1
8715	2304	102339	B1
8716	2305	102340	B1
8717	2306	102341	B1
8718	2306	102342	B1
8719	2307	102343	B1
8720	2308	102344	B1
8721	2309	102345	B1
8722	2310	102346	B1
8723	2310	102347	B1
8724	2311	102348	B1
8725	2312	102349	B1
8726	2313	102350	B1
8727	2314	102351	B1
8728	2315	102352	B1
8729	2316	102353	B1
8730	2316	102354	B1
8731	2317	102355	B1
8732	2318	102356	B1
8733	2318	102357	B1
8734	2319	102358	B1
8735	2319	102359	B1
8736	2320	102360	B1
8737	2321	102361	B1
8738	2322	102362	B1
8739	2322	102363	B1
8740	2323	102364	B1
8741	2323	102365	B1
8742	2324	102366	B1
8743	2324	102367	B1
8744	2325	102368	B1
8745	2326	102369	B1
8746	2327	102370	B1
8747	2328	102371	B1
8748	2328	102372	B1
8749	2329	102373	B1
8750	2329	102374	B1
8751	2330	102375	B1
8752	2330	102376	B1
8753	2331	102377	B1
8754	2332	102378	B1
8755	2333	102379	B1
8756	2333	102380	B1
8757	2334	102381	B1
8758	2334	102382	B1
8759	2336	102383	B1
8760	2337	102384	B1
8761	2337	102385	B1
8762	2338	102386	B1
8763	2339	102387	B1
8764	2339	102388	B1
8765	2340	102389	B1
8766	2341	102390	B1
8767	2342	102391	B1
8768	2343	102392	B1
8769	2344	102393	B1
8770	2345	102394	B1
8771	2346	102395	B1
8772	2346	102396	B1
8773	2347	102397	B1
8774	2348	102398	B1
8775	2349	102399	B1
8776	2350	102400	B1
8777	2351	102401	B1
8778	2352	102402	B1
8779	2353	102403	B1
8780	2354	102404	B1
8781	2355	102405	B1
8782	2356	102406	B1
8783	2356	102407	B1
8784	2357	102408	B1
8785	2358	102409	B1
8786	2359	102410	B1
8787	2360	102411	B1
8788	2361	102412	B1
8789	2362	102413	B1
8790	2363	102414	B1
8791	2364	102415	B1
8792	2365	102416	B1
8793	2366	102417	B1
8794	2367	102418	B1
8795	2368	102419	B1
8796	2369	102420	B1
8797	2370	102421	B1
8798	2371	102422	B1
8799	2372	102423	B1
8800	2372	102424	B1
8801	2373	102425	B1
8802	2374	102426	B1
8803	2375	102427	B1
8804	2376	102428	B1
8805	2377	102429	B1
8806	2378	102430	B1
8807	2379	102431	B1
8808	2380	102432	B1
8809	2380	102433	B1
8810	2381	102434	B1
8811	2381	102435	B1
8812	2382	102436	B1
8813	2383	102437	B1
8814	2384	102438	B1
8815	2385	102439	B1
8816	2386	102440	B1
8817	2387	102441	B1
8818	2387	102442	B1
8819	2388	102443	B1
8820	2388	102444	B1
8821	2389	102445	B1
8822	2390	102446	B1
8823	2391	102447	B1
8824	2391	102448	B1
8825	2392	102449	B1
8826	2393	102450	B1
8827	2394	102451	B1
8828	2395	102452	B1
8829	2396	102453	B1
8830	2397	102454	B1
8831	2398	102455	B1
8832	2399	102456	B1
8833	2400	102457	B1
8834	2401	102458	B1
8835	2401	102459	B1
8836	2402	102460	B1
8837	2403	102461	B1
8838	2403	102462	B1
8839	2404	102463	B1
8840	2404	102464	B1
8841	2405	102465	B1
8842	2406	102466	B1
8843	2407	102467	B1
8844	2407	102468	B1
8845	2408	102469	B1
8846	2409	102470	B1
8847	2409	102471	B1
8848	2410	102472	B1
8849	2411	102473	B1
8850	2412	102474	B1
8851	2412	102475	B1
8852	2413	102476	B1
8853	2414	102477	B1
8854	2414	102478	B1
8855	2415	102479	B1
8856	2416	102480	B1
8857	2417	102481	B1
8858	2417	102482	B1
8859	2418	102483	B1
8860	2418	102484	B1
8861	2419	102485	B1
8862	2419	102486	B1
8863	2420	102487	B1
8864	2421	102488	B1
8865	2422	102489	B1
8866	2422	102490	B1
8867	2423	102491	B1
8868	2424	102492	B1
8869	2424	102493	B1
8870	2425	102494	B1
8871	2426	102495	B1
8872	2426	102496	B1
8873	2427	102497	B1
8874	2427	102498	B1
8875	2428	102499	B1
8876	2429	102500	B1
8877	2430	102501	B1
8878	2431	102502	B1
8879	2431	102503	B1
8880	2432	102504	B1
8881	2433	102505	B1
8882	2433	102506	B1
8883	2434	102507	B1
8884	2434	102508	B1
8885	2435	102509	B1
8886	2436	102510	B1
8887	2437	102511	B1
8888	2438	102512	B1
8889	2439	102513	B1
8890	2440	102514	B1
8891	2440	102515	B1
8892	2441	102516	B1
8893	2441	102517	B1
8894	2442	102518	B1
8895	2443	102519	B1
8896	2444	102520	B1
8897	2445	102521	B1
8898	2445	102522	B1
8899	2446	102523	B1
8900	2446	102524	B1
8901	2447	102525	B1
8902	2447	102526	B1
8903	2448	102527	B1
8904	2449	102528	B1
8905	2450	102529	B1
8906	2450	102530	B1
8907	2451	102531	B1
8908	2452	102532	B1
8909	2452	102533	B1
8910	2453	102534	B1
8911	2453	102535	B1
8912	2454	102536	B1
8913	2455	102537	B1
8914	2456	102538	B1
8915	2456	102539	B1
8916	2457	102540	B1
8917	2458	102541	B1
8918	2458	102542	B1
8919	2459	102543	B1
8920	2459	102544	B1
8921	2460	102545	B1
8922	2461	102546	B1
8923	2462	102547	B1
8924	2463	102548	B1
8925	2464	102549	B1
8926	2465	102550	B1
8927	2466	102551	B1
8928	2467	102552	B1
8929	2468	102553	B1
8930	2468	102554	B1
8931	2469	102555	B1
8932	2469	102556	B1
8933	2470	102557	B1
8934	2471	102558	B1
8935	2472	102559	B1
8936	2473	102560	B1
8937	2474	102561	B1
8938	2474	102562	B1
8939	2475	102563	B1
8940	2476	102564	B1
8941	2476	102565	B1
8942	2477	102566	B1
8943	2477	102567	B1
8944	2478	102568	B1
8945	2478	102569	B1
8946	2479	102570	B1
8947	2479	102571	B1
8948	2480	102572	B1
8949	2480	102573	B1
8950	2481	102574	B1
8951	2482	102575	B1
8952	2483	102576	B1
8953	2484	102577	B1
8954	2485	102578	B1
8955	2485	102579	B1
8956	2486	102580	B1
8957	2486	102581	B1
8958	2487	102582	B1
8959	2488	102583	B1
8960	2488	102584	B1
8961	2489	102585	B1
8962	2490	102586	B1
8963	2491	102587	B1
8964	2491	102588	B1
8965	2492	102589	B1
8966	2493	102590	B1
8967	2494	102591	B1
8968	2495	102592	B1
8969	2496	102593	B1
8970	2497	102594	B1
8971	2498	102595	B1
8972	2499	102596	B1
8973	2500	102597	B1
8974	2501	102598	B1
8975	2502	102599	B1
8976	2503	102600	B1
8977	2504	102601	B1
8978	2505	102602	B1
8979	2505	102603	B1
8980	2506	102604	B1
8981	2507	102605	B1
8982	2507	102606	B1
8983	2508	102607	B1
8984	2508	102608	B1
8985	2509	102609	B1
8986	2509	102610	B1
8987	2510	102611	B1
8988	2510	102612	B1
8989	2511	102613	B1
8990	2511	102614	B1
8991	2512	102615	B1
8992	2513	102616	B1
8993	2514	102617	B1
8994	2514	102618	B1
8995	2515	102619	B1
8996	2515	102620	B1
8997	2516	102621	B1
8998	2516	102622	B1
8999	2517	102623	B1
9000	2518	102624	B1
9001	2519	102625	B1
9002	2520	102626	B1
9003	2520	102627	B1
9004	2521	102628	B1
9005	2521	102629	B1
9006	2522	102630	B1
9007	2523	102631	B1
9008	2523	102632	B1
9009	2524	102633	B1
9010	2525	102634	B1
9011	2526	102635	B1
9012	2527	102636	B1
9013	2528	102637	B1
9014	2529	102638	B1
9015	2530	102639	B1
9016	2531	102640	B1
9017	2532	102641	B1
9018	2533	102642	B1
9019	2534	102643	B1
9020	2535	102644	B1
9021	2536	102645	B1
9022	2536	102646	B1
9023	2537	102647	B1
9024	2538	102648	B1
9025	2539	102649	B1
9026	2539	102650	B1
9027	2540	102651	B1
9028	2540	102652	B1
9029	2541	102653	B1
9030	2542	102654	B1
9031	2542	102655	B1
9032	2543	102656	B1
9033	2544	102657	B1
9034	2545	102658	B1
9035	2546	102659	B1
9036	2547	102660	B1
9037	2548	102661	B1
9038	2548	102662	B1
9039	2549	102663	B1
9040	2550	102664	B1
9041	2550	102665	B1
9042	2551	102666	B1
9043	2552	102667	B1
9044	2553	102668	B1
9045	2553	102669	B1
9046	2554	102670	B1
9047	2554	102671	B1
9048	2555	102672	B1
9049	2556	102673	B1
9050	2557	102674	B1
9051	2557	102675	B1
9052	2557	102676	B1
9053	2558	102677	B1
9054	2559	102678	B1
9055	2560	102679	B1
9056	2561	102680	B1
9057	2562	102681	B1
9058	2563	102682	B1
9059	2564	102683	B1
9060	2564	102684	B1
9061	2565	102685	B1
9062	2565	102686	B1
9063	2566	102687	B1
9064	2566	102688	B1
9065	2567	102689	B1
9066	2568	102690	B1
9067	2569	102691	B1
9068	2570	102692	B1
9069	2571	102693	B1
9070	2572	102694	B1
9071	2573	102695	B1
9072	2574	102696	B1
9073	2575	102697	B1
9074	2575	102698	B1
9078	26	201490	A1
9079	27	201491	A1
9080	28	201492	A1
9081	29	201493	A1
9082	30	201494	A1
9083	31	201495	A1
9084	32	201496	A1
9085	33	201497	A1
9086	34	201498	A1
9087	35	201499	A1
9088	36	201500	A1
9089	37	201501	A1
9090	38	201502	A1
9091	39	201503	A1
9092	40	201504	A1
9093	41	201505	A1
9094	42	201506	A1
9095	43	201507	A1
9096	44	201508	A1
9097	45	201509	A1
9098	46	201510	A1
9099	47	201511	A1
9100	48	201512	A1
9101	49	201513	A1
9102	50	201514	A1
9103	51	201515	A1
9104	52	201516	A1
9105	53	201517	A1
9106	54	201518	A1
9107	55	201519	A1
9108	56	201520	A1
9109	57	201521	A1
9110	58	201522	A1
9111	59	201523	A1
9112	60	201524	A1
9113	61	201525	A1
9114	62	201526	A1
9115	63	201527	A1
9116	64	201528	A1
9117	65	201529	A1
9118	66	201530	A1
9119	67	201531	A1
9120	68	201532	A1
9121	69	201533	A1
9122	70	201534	A1
9123	71	201535	A1
9124	72	201536	A1
9125	73	201537	A1
9126	74	201538	A1
9127	75	201539	A1
9128	76	201540	A1
9129	77	201541	A1
9130	78	201542	A1
9131	79	201543	A1
9132	80	201544	A1
9133	81	201545	A1
9134	82	201546	A1
9135	83	201547	A1
9136	84	201548	A1
9137	85	201549	A1
9138	86	201550	A1
9139	87	201551	A1
9140	88	201552	A1
9141	89	201553	A1
9142	90	201554	A1
9143	91	201555	A1
9144	92	201556	A1
9145	93	201557	A1
9146	94	201558	A1
9147	95	201559	A1
9148	96	201560	A1
9149	97	201561	A1
9150	98	201562	A1
9151	99	201563	A1
9152	100	201564	A1
9153	101	201565	A1
9154	102	201566	A1
9155	103	201567	A1
9156	104	201568	A1
9157	105	201569	A1
9158	106	201570	A1
9159	107	201571	A1
9160	108	201572	A1
9161	109	201573	A1
9162	110	201574	A1
9163	111	201575	A1
9164	112	201576	A1
9165	113	201577	A1
9166	114	201578	A1
9167	115	201579	A1
9168	116	201580	A1
9169	117	201581	A1
9170	118	201582	A1
9171	119	201583	A1
9172	120	201584	A1
9173	121	201585	A1
9174	122	201586	A1
9175	123	201587	A1
9176	124	201588	A1
9177	125	201589	A1
9178	126	201590	A1
9179	127	201591	A1
9180	128	201592	A1
9181	129	201593	A1
9182	130	201594	A1
9183	131	201595	A1
9184	132	201596	A1
9185	133	201597	A1
9186	134	201598	A1
9187	135	201599	A1
9188	136	201600	A1
9189	137	201601	A1
9190	138	201602	A1
9191	139	201603	A1
9192	140	201604	A1
9193	141	201605	A1
9194	142	201606	A1
9195	143	201607	A1
9196	144	201608	A1
9197	145	201609	A1
9198	146	201610	A1
9199	147	201611	A1
9200	148	201612	A1
9201	149	201613	A1
9202	150	201614	A1
9203	151	201615	A1
9204	152	201616	A1
9205	153	201617	A1
9206	154	201618	A1
9207	155	201619	A1
9208	156	201620	A1
9209	157	201621	A1
9210	158	201622	A1
9211	159	201623	A1
9212	160	201624	A1
9213	161	201625	A1
9214	162	201626	A1
9215	163	201627	A1
9216	164	201628	A1
9217	165	201629	A1
9218	166	201630	A1
9219	167	201631	A1
9220	168	201632	A1
9221	169	201633	A1
9222	170	201634	A1
9223	171	201635	A1
9224	172	201636	A1
9225	173	201637	A1
9226	174	201638	A1
9227	175	201639	A1
9228	176	201640	A1
9229	177	201641	A1
9230	178	201642	A1
9231	179	201643	A1
9232	180	201644	A1
9233	181	201645	A1
9234	182	201646	A1
9235	183	201647	A1
9236	184	201648	A1
9237	185	201649	A1
9238	186	201650	A1
9239	187	201651	A1
9240	188	201652	A1
9241	189	201653	A1
9242	190	201654	A1
9243	191	201655	A1
9244	192	201656	A1
9245	193	201657	A1
9246	194	201658	A1
9247	195	201659	A1
9248	196	201660	A1
9249	197	201661	A1
9250	198	201662	A1
9251	199	201663	A1
9252	200	201664	A1
9253	201	201665	A1
9254	202	201666	A1
9255	203	201667	A1
9256	204	201668	A1
9257	205	201669	A1
9258	206	201670	A1
9259	207	201671	A1
9260	208	201672	A1
9261	209	201673	A1
9262	210	201674	A1
9263	211	201675	A1
9264	212	201676	A1
9265	213	201677	A1
9266	214	201678	A1
9267	215	201679	A1
9268	216	201680	A1
9269	217	201681	A1
9270	218	201682	A1
9271	219	201683	A1
9272	220	201684	A1
9273	221	201685	A1
9274	222	201686	A1
9275	223	201687	A1
9276	224	201688	A1
9277	225	201689	A1
9278	226	201690	A1
9279	227	201691	A1
9280	228	201692	A1
9281	229	201693	A1
9282	230	201694	A1
9283	231	201695	A1
9284	232	201696	A1
9285	233	201697	A1
9286	234	201698	A1
9287	235	201699	A1
9288	236	201700	A1
9289	237	201701	A1
9290	238	201702	A1
9291	239	201703	A1
9292	240	201704	A1
9293	241	201705	A1
9294	242	201706	A1
9295	243	201707	A1
9296	244	201708	A1
9297	245	201709	A1
9298	246	201710	A1
9299	247	201711	A1
9300	248	201712	A1
9301	249	201713	A1
9302	250	201714	A1
9303	251	201715	A1
9304	252	201716	A1
9305	253	201717	A1
9306	254	201718	A1
9307	255	201719	A1
9308	256	201720	A1
9309	257	201721	A1
9310	258	201722	A1
9311	259	201723	A1
9312	260	201724	A1
9313	261	201725	A1
9314	262	201726	A1
9315	263	201727	A1
9316	264	201728	A1
9317	265	201729	A1
9318	266	201730	A1
9319	267	201731	A1
9320	268	201732	A1
9321	269	201733	A1
9322	270	201734	A1
9323	271	201735	A1
9324	272	201736	A1
9325	273	201737	A1
9326	274	201738	A1
9327	275	201739	A1
9328	276	201740	A1
9329	277	201741	A1
9330	278	201742	A1
9331	279	201743	A1
9332	280	201744	A1
9333	281	201745	A1
9334	282	201746	A1
9335	283	201747	A1
9336	284	201748	A1
9337	285	201749	A1
9338	286	201750	A1
9339	287	201751	A1
9340	288	201752	A1
9341	289	201753	A1
9342	290	201754	A1
9343	291	201755	A1
9344	292	201756	A1
9345	293	201757	A1
9346	294	201758	A1
9347	295	201759	A1
9348	296	201760	A1
9349	297	201761	A1
9350	298	201762	A1
9351	299	201763	A1
9352	300	201764	A1
9353	301	201765	A1
9354	302	201766	A1
9355	303	201767	A1
9356	304	201768	A1
9357	305	201769	A1
9358	306	201770	A1
9359	307	201771	A1
9360	308	201772	A1
9361	309	201773	A1
9362	310	201774	A1
9363	311	201775	A1
9364	312	201776	A1
9365	313	201777	A1
9366	314	201778	A1
9367	315	201779	A1
9368	316	201780	A1
9369	317	201781	A1
9370	318	201782	A1
9371	319	201783	A1
9372	320	201784	A1
9373	321	201785	A1
9374	322	201786	A1
9375	323	201787	A1
9376	324	201788	A1
9377	325	201789	A1
9378	326	201790	A1
9379	327	201791	A1
9380	328	201792	A1
9381	329	201793	A1
9382	330	201794	A1
9383	331	201795	A1
9384	332	201796	A1
9385	333	201797	A1
9386	334	201798	A1
9387	335	201799	A1
9388	336	201800	A1
9389	337	201801	A1
9390	338	201802	A1
9391	339	201803	A1
9392	340	201804	A1
9393	341	201805	A1
9394	342	201806	A1
9395	343	201807	A1
9396	344	201808	A1
9397	345	201809	A1
9398	346	201810	A1
9399	347	201811	A1
9400	348	201812	A1
9401	349	201813	A1
9402	350	201814	A1
9403	351	201815	A1
9404	352	201816	A1
9405	353	201817	A1
9406	354	201818	A1
9407	355	201819	A1
9408	356	201820	A1
9409	357	201821	A1
9410	358	201822	A1
9411	359	201823	A1
9412	360	201824	A1
9413	361	201825	A1
9414	362	201826	A1
9415	363	201827	A1
9416	364	201828	A1
9417	365	201829	A1
9418	366	201830	A1
9419	367	201831	A1
9420	368	201832	A1
9421	369	201833	A1
9422	370	201834	A1
9423	371	201835	A1
9424	372	201836	A1
9425	373	201837	A1
9426	374	201838	A1
9427	375	201839	A1
9428	376	201840	A1
9429	377	201841	A1
9430	378	201842	A1
9431	379	201843	A1
9432	380	201844	A1
9433	381	201845	A1
9434	382	201846	A1
9435	383	201847	A1
9436	384	201848	A1
9437	385	201849	A1
9438	386	201850	A1
9439	387	201851	A1
9440	388	201852	A1
9441	389	201853	A1
9442	390	201854	A1
9443	391	201855	A1
9444	392	201856	A1
9445	393	201857	A1
9446	394	201858	A1
9447	395	201859	A1
9448	396	201860	A1
9449	397	201861	A1
9450	398	201862	A1
9451	399	201863	A1
9452	400	201864	A1
9453	401	201865	A1
9454	402	201866	A1
9455	403	201867	A1
9456	404	201868	A1
9457	405	201869	A1
9458	406	201869	A1
9459	407	201870	A1
9460	408	201871	A1
9461	409	201872	A1
9462	410	201873	A1
9463	411	201874	A1
9464	412	201875	A1
9465	413	201876	A1
9466	414	201877	A1
9467	415	201878	A1
9468	416	201879	A1
9469	417	201880	A1
9470	418	201881	A1
9471	419	201882	A1
9472	420	201883	A1
9473	421	201884	A1
9474	422	201885	A1
9475	423	201886	A1
9476	424	201887	A1
9477	425	201888	A1
9478	426	201889	A1
9479	427	201890	A1
9480	428	201891	A1
9481	429	201892	A1
9482	430	201893	A1
9483	431	201894	A1
9484	432	201895	A1
9485	433	201896	A1
9486	434	201897	A1
9487	435	201898	A1
9488	436	201899	A1
9489	437	201900	A1
9490	438	201901	A1
9491	439	201902	A1
9492	440	201903	A1
9493	441	201904	A1
9494	442	201905	A1
9495	443	201906	A1
9496	444	201907	A1
9497	445	201908	A1
9498	446	201909	A1
9499	447	201910	A1
9500	448	201911	A1
9501	449	201912	A1
9502	450	201913	A1
9503	451	201914	A1
9504	452	201915	A1
9505	453	201916	A1
9506	454	201917	A1
9507	455	201918	A1
9508	456	201919	A1
9509	457	201920	A1
9510	458	201921	A1
9511	459	201922	A1
9512	460	201923	A1
9513	461	201924	A1
9514	462	201925	A1
9515	463	201926	A1
9516	464	201927	A1
9517	465	201928	A1
9518	466	201929	A1
9519	467	201930	A1
9520	468	201931	A1
9521	469	201932	A1
9522	470	201933	A1
9523	471	201934	A1
9524	472	201935	A1
9525	473	201936	A1
9526	474	201937	A1
9527	475	201938	A1
9528	476	201939	A1
9529	477	201940	A1
9530	478	201941	A1
9531	479	201942	A1
9532	480	201943	A1
9533	481	201944	A1
9534	482	201945	A1
9535	483	201946	A1
9536	484	201947	A1
9537	485	201948	A1
9538	486	201949	A1
9539	487	201950	A1
9540	488	201951	A1
9541	489	201952	A1
9542	490	201953	A1
9543	491	201954	A1
9544	492	201955	A1
9545	493	201956	A1
9546	494	201957	A1
9547	495	201958	A1
9548	496	201959	A1
9549	497	201960	A1
9550	498	201961	A1
9551	499	201962	A1
9552	500	201963	A1
9553	501	201964	A1
9554	502	201965	A1
9555	503	201966	A1
9556	504	201967	A1
9557	505	201968	A1
9558	506	201969	A1
9559	507	201970	A1
9560	508	201971	A1
9561	509	201972	A1
9562	510	201973	A1
9563	511	201974	A1
9564	512	201975	A1
9565	513	201976	A1
9566	514	201977	A1
9567	515	201978	A1
9568	516	201979	A1
9569	517	201980	A1
9570	518	201981	A1
9571	519	201982	A1
9572	520	201983	A1
9573	521	201984	A1
9574	522	201985	A1
9575	523	201986	A1
9576	524	201987	A1
9577	525	201988	A1
9578	526	201989	A1
9579	527	201990	A1
9580	528	201991	A1
9581	529	201992	A1
9582	530	201993	A1
9583	531	201994	A1
9584	532	201995	A1
9585	533	201996	A1
9586	534	201997	A1
9587	535	201998	A1
9588	536	201999	A1
9589	537	202000	A1
9590	538	202001	A1
9591	539	202002	A1
9592	540	202003	A1
9593	541	202004	A1
9594	542	202005	A1
9595	543	202006	A1
9596	544	202007	A1
9597	545	202008	A1
9598	546	202009	A1
9599	547	202010	A1
9600	548	202011	A1
9601	549	202012	A1
9602	550	202013	A1
9603	551	202014	A1
9604	552	202015	A1
9605	553	202016	A1
9606	554	202017	A1
9607	555	202018	A1
9608	556	202019	A1
9609	557	202020	A1
9610	558	202021	A1
9611	559	202022	A1
9612	560	202023	A1
9613	561	202024	A1
9614	562	202025	A1
9615	563	202026	A1
9616	564	202027	A1
9617	565	202028	A1
9618	566	202029	A1
9619	567	202030	A1
9620	568	202031	A1
9621	569	202032	A1
9622	570	202033	A1
9623	571	202034	A1
9624	572	202035	A1
9625	573	202036	A1
9626	574	202037	A1
9627	575	202038	A1
9628	576	202039	A1
9629	577	202040	A1
9630	578	202041	A1
9631	579	202042	A1
9632	580	202043	A1
9633	581	202044	A1
9634	582	202045	A1
9635	583	202046	A1
9636	584	202047	A1
9637	585	202048	A1
9638	586	202049	A1
9639	587	202050	A1
9640	588	202051	A1
9641	589	202052	A1
9642	590	202053	A1
9643	591	202054	A1
9644	592	202055	A1
9645	593	202056	A1
9646	594	202057	A1
9647	595	202058	A1
9648	596	202059	A1
9649	597	202060	A1
9650	598	202061	A1
9651	599	202062	A1
9652	600	202063	A1
9653	601	202064	A1
9654	602	202065	A1
9655	603	202066	A1
9656	604	202067	A1
9657	605	202068	A1
9658	606	202069	A1
9659	607	202070	A1
9660	608	202071	A1
9661	609	202072	A1
9662	610	202073	A1
9663	611	202074	A1
9664	612	202075	A1
9665	613	202076	A1
9666	614	202077	A1
9667	615	202078	A1
9668	616	202079	A1
9669	617	202080	A1
9670	618	202081	A1
9671	619	202082	A1
9672	620	202083	A1
9673	621	202084	A1
9674	622	202085	A1
9675	623	202086	A1
9676	624	202087	A1
9677	625	202088	A1
9678	626	202089	A1
9679	627	202090	A1
9680	628	202091	A1
9681	629	202092	A1
9682	630	202093	A1
9683	631	202094	A1
9684	632	202095	A1
9685	633	202096	A1
9686	634	202097	A1
9687	635	202098	A1
9688	636	202099	A1
9689	637	202100	A1
9690	638	202101	A1
9691	639	202102	A1
9692	640	202103	A1
9693	641	202104	A1
9694	642	202105	A1
9695	643	202106	A1
9696	644	202107	A1
9697	645	202108	A1
9698	646	202109	A1
9699	647	202110	A1
9700	648	202111	A1
9701	649	202112	A1
9702	650	202113	A1
9703	651	202114	A1
9704	652	202115	A1
9705	653	202116	A1
9706	654	202117	A1
9707	655	202118	A1
9708	656	202119	A1
9709	657	202120	A1
9710	658	202121	A1
9711	659	202122	A1
9712	660	202123	A1
9713	661	202124	A1
9714	662	202125	A1
9715	663	202126	A1
9716	664	202127	A1
9717	665	202128	A1
9718	666	202129	A1
9719	667	202130	A1
9720	668	202131	A1
9721	669	202132	A1
9722	670	202133	A1
9723	671	202134	A1
9724	672	202135	A1
9725	673	202136	A1
9726	674	202137	A1
9727	675	202138	A1
9728	676	202139	A1
9729	677	202140	A1
9730	678	202141	A1
9731	679	202142	A1
9732	680	202143	A1
9733	681	202144	A1
9734	682	202145	A1
9735	683	202146	A1
9736	684	202147	A1
9737	685	202148	A1
9738	686	202149	A1
9739	687	202150	A1
9740	688	202151	A1
9741	689	202152	A1
9742	690	202153	A1
9743	691	202154	A1
9744	692	202155	A1
9745	693	202156	A1
9746	694	202157	A1
9747	695	202158	A1
9748	696	202159	A1
9749	697	202160	A1
9750	698	202161	A1
9751	699	202162	A1
9752	700	202163	A1
9753	701	202164	A1
9754	702	202165	A1
9755	703	202166	A1
9756	704	202167	A1
9757	705	202168	A1
9758	706	202169	A1
9759	707	202170	A1
9760	708	202171	A1
9761	709	202172	A1
9762	710	202173	A1
9763	711	202174	A1
9764	712	202175	A1
9765	713	202176	A1
9766	714	202177	A1
9767	715	202178	A1
9768	716	202179	A1
9769	717	202180	A1
9770	718	202181	A1
9771	719	202182	A1
9772	720	202183	A1
9773	721	202184	A1
9774	722	202185	A1
9775	723	202186	A1
9776	724	202187	A1
9777	725	202188	A1
9778	726	202189	A1
9779	727	202190	A1
9780	728	202191	A1
9781	729	202192	A1
9782	730	202193	A1
9783	731	202194	A1
9784	732	202195	A1
9785	733	202196	A1
9786	734	202197	A1
9787	735	202198	A1
9788	736	202199	A1
9789	737	202200	A1
9790	738	202201	A1
9791	739	202202	A1
9792	740	202203	A1
9793	741	202204	A1
9794	742	202205	A1
9795	743	202206	A1
9796	744	202207	A1
9797	745	202208	A1
9798	746	202209	A1
9799	747	202210	A1
9800	748	202211	A1
9801	749	202212	A1
9802	750	202213	A1
9803	751	202214	A1
9804	752	202215	A1
9805	753	202216	A1
9806	754	202217	A1
9807	755	202218	A1
9808	756	202219	A1
9809	757	202219	A1
9810	758	202220	A1
9811	759	202221	A1
9812	760	202222	A1
9813	761	202223	A1
9814	762	202224	A1
9815	763	202225	A1
9816	764	202226	A1
9817	765	202227	A1
9818	766	202228	A1
9819	767	202229	A1
9820	768	202230	A1
9821	769	202231	A1
9822	770	202232	A1
9823	771	202233	A1
9824	772	202234	A1
9825	773	202235	A1
9826	774	201819	A1
9827	775	202232	A1
9828	776	201789	A1
9829	777	202236	A1
9830	778	201836	A1
9831	779	202191	A1
9832	780	202117	A1
9833	781	201895	A1
9834	782	201801	A1
9835	783	201796	A1
9836	784	202170	A1
9837	785	202114	A1
9838	786	201933	A1
9839	787	202234	A1
9840	788	201802	A1
9841	789	201837	A1
9842	790	201982	A1
9843	791	202113	A1
9844	792	202237	A1
9845	793	202238	A1
9846	794	202239	A1
9847	795	202240	A1
9848	796	202241	A1
9849	797	202242	A1
9850	798	202243	A1
9851	799	202244	A1
9852	800	202245	A1
9853	801	202246	A1
9854	802	201551	A1
9855	803	202247	A1
9856	804	202248	A1
9857	805	201787	A1
9858	806	202249	A1
9859	807	202250	A1
9860	808	202251	A1
9861	809	202252	A1
9862	810	202253	A1
9863	811	202254	A1
9864	812	202255	A1
9865	813	202256	A1
9866	814	202257	A1
9867	815	202258	A1
9868	816	202259	A1
9869	817	202260	A1
9870	818	202261	A1
9871	819	202262	A1
9872	820	202263	A1
9873	821	202264	A1
9874	822	202265	A1
9875	823	202266	A1
9876	824	202267	A1
9877	825	202268	A1
9878	826	202269	A1
9879	827	202270	A1
9880	828	202271	A1
9881	829	202272	A1
9882	830	202273	A1
9883	831	202274	A1
9884	832	202275	A1
9885	833	202276	A1
9886	834	202277	A1
9887	835	202278	A1
9888	836	202279	A1
9889	837	202280	A1
9890	838	202281	A1
9891	839	202282	A1
9892	840	202283	A1
9893	841	202284	A1
9894	842	202285	A1
9895	843	202286	A1
9896	844	202287	A1
9897	845	201833	A1
9898	846	202288	A1
9899	847	201963	A1
9900	848	202289	A1
9901	849	202167	A1
9902	850	202111	A1
9903	851	201959	A1
9904	852	201512	A1
9905	853	202290	A1
9906	854	201683	A1
\.


--
-- Data for Name: words; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.words (id, written_form, part_of_speech, image_url, audio_url, language_id, level, article) FROM stdin;
26	a	det	\N	\N	1	A1	\N
27	an	det	\N	\N	1	A1	\N
28	about	prep	\N	\N	1	A1	\N
29	above	prep	\N	\N	1	A1	\N
30	across	prep	\N	\N	1	A1	\N
31	action	n	\N	\N	1	A1	\N
32	activity	n	\N	\N	1	A1	\N
33	actor	n	\N	\N	1	A1	\N
34	actress	n	\N	\N	1	A1	\N
35	add	v	\N	\N	1	A1	\N
36	address	n	\N	\N	1	A1	\N
37	adult	n	\N	\N	1	A1	\N
38	afraid	adj	\N	\N	1	A1	\N
39	after	prep	\N	\N	1	A1	\N
40	afternoon	n	\N	\N	1	A1	\N
41	again	adv	\N	\N	1	A1	\N
42	age	n	\N	\N	1	A1	\N
43	ago	adv	\N	\N	1	A1	\N
44	air	n	\N	\N	1	A1	\N
45	airport	n	\N	\N	1	A1	\N
46	all	det	\N	\N	1	A1	\N
47	all right	adj	\N	\N	1	A1	\N
48	also	adv	\N	\N	1	A1	\N
49	always	adv	\N	\N	1	A1	\N
50	amazing	adj	\N	\N	1	A1	\N
51	and	conj	\N	\N	1	A1	\N
52	angry	adj	\N	\N	1	A1	\N
53	animal	n	\N	\N	1	A1	\N
54	another	det	\N	\N	1	A1	\N
55	answer	n	\N	\N	1	A1	\N
56	any	det	\N	\N	1	A1	\N
57	anyone	pron	\N	\N	1	A1	\N
58	anything	pron	\N	\N	1	A1	\N
59	apartment	n	\N	\N	1	A1	\N
60	apple	n	\N	\N	1	A1	\N
61	April	n	\N	\N	1	A1	\N
62	area	n	\N	\N	1	A1	\N
63	arm	n	\N	\N	1	A1	\N
64	around	prep	\N	\N	1	A1	\N
65	arrive	v	\N	\N	1	A1	\N
66	art	n	\N	\N	1	A1	\N
67	article	n	\N	\N	1	A1	\N
68	artist	n	\N	\N	1	A1	\N
69	as	prep	\N	\N	1	A1	\N
70	ask	v	\N	\N	1	A1	\N
71	at	prep	\N	\N	1	A1	\N
72	August	n	\N	\N	1	A1	\N
73	aunt	n	\N	\N	1	A1	\N
74	autumn	n	\N	\N	1	A1	\N
75	away	adv	\N	\N	1	A1	\N
76	baby	n	\N	\N	1	A1	\N
77	back	adv	\N	\N	1	A1	\N
78	bad	adj	\N	\N	1	A1	\N
79	bag	n	\N	\N	1	A1	\N
80	ball	n	\N	\N	1	A1	\N
81	banana	n	\N	\N	1	A1	\N
82	band	n	\N	\N	1	A1	\N
83	bank	n	\N	\N	1	A1	\N
84	bar	n	\N	\N	1	A1	\N
85	bath	n	\N	\N	1	A1	\N
86	bathroom	n	\N	\N	1	A1	\N
87	be	v	\N	\N	1	A1	\N
88	beach	n	\N	\N	1	A1	\N
89	beautiful	adj	\N	\N	1	A1	\N
90	because	conj	\N	\N	1	A1	\N
91	become	v	\N	\N	1	A1	\N
92	bed	n	\N	\N	1	A1	\N
93	bedroom	n	\N	\N	1	A1	\N
94	beer	n	\N	\N	1	A1	\N
95	before	prep	\N	\N	1	A1	\N
96	begin	v	\N	\N	1	A1	\N
97	beginning	n	\N	\N	1	A1	\N
98	behind	prep	\N	\N	1	A1	\N
99	believe	v	\N	\N	1	A1	\N
100	below	prep	\N	\N	1	A1	\N
101	best	adj	\N	\N	1	A1	\N
102	better	adj	\N	\N	1	A1	\N
103	between	prep	\N	\N	1	A1	\N
104	bicycle	n	\N	\N	1	A1	\N
105	big	adj	\N	\N	1	A1	\N
106	cafe	n	\N	\N	1	A1	\N
107	cake	n	\N	\N	1	A1	\N
108	call	v	\N	\N	1	A1	\N
109	camera	n	\N	\N	1	A1	\N
110	can	v	\N	\N	1	A1	\N
111	car	n	\N	\N	1	A1	\N
112	card	n	\N	\N	1	A1	\N
113	carrot	n	\N	\N	1	A1	\N
114	carry	v	\N	\N	1	A1	\N
115	cat	n	\N	\N	1	A1	\N
116	CD	n	\N	\N	1	A1	\N
117	cent	n	\N	\N	1	A1	\N
118	centre	n	\N	\N	1	A1	\N
119	chair	n	\N	\N	1	A1	\N
120	change	v	\N	\N	1	A1	\N
121	chart	n	\N	\N	1	A1	\N
122	cheap	adj	\N	\N	1	A1	\N
123	check	v	\N	\N	1	A1	\N
124	cheese	n	\N	\N	1	A1	\N
125	chicken	n	\N	\N	1	A1	\N
126	child	n	\N	\N	1	A1	\N
127	chocolate	n	\N	\N	1	A1	\N
128	choose	v	\N	\N	1	A1	\N
129	cinema	n	\N	\N	1	A1	\N
130	city	n	\N	\N	1	A1	\N
131	class	n	\N	\N	1	A1	\N
132	classroom	n	\N	\N	1	A1	\N
133	clean	adj	\N	\N	1	A1	\N
134	climb	v	\N	\N	1	A1	\N
135	clock	n	\N	\N	1	A1	\N
136	close	v	\N	\N	1	A1	\N
137	clothes	n	\N	\N	1	A1	\N
138	club	n	\N	\N	1	A1	\N
139	coat	n	\N	\N	1	A1	\N
140	coffee	n	\N	\N	1	A1	\N
141	cold	adj	\N	\N	1	A1	\N
142	college	n	\N	\N	1	A1	\N
143	colour	n	\N	\N	1	A1	\N
144	come	v	\N	\N	1	A1	\N
145	company	n	\N	\N	1	A1	\N
146	complete	v	\N	\N	1	A1	\N
147	computer	n	\N	\N	1	A1	\N
148	concert	n	\N	\N	1	A1	\N
149	cook	v	\N	\N	1	A1	\N
150	cooking	n	\N	\N	1	A1	\N
151	cool	adj	\N	\N	1	A1	\N
152	correct	adj	\N	\N	1	A1	\N
153	cost	v	\N	\N	1	A1	\N
154	could	v	\N	\N	1	A1	\N
155	country	n	\N	\N	1	A1	\N
156	course	n	\N	\N	1	A1	\N
157	cousin	n	\N	\N	1	A1	\N
158	cow	n	\N	\N	1	A1	\N
159	cream	n	\N	\N	1	A1	\N
160	cup	n	\N	\N	1	A1	\N
161	dad	n	\N	\N	1	A1	\N
162	daily	adj	\N	\N	1	A1	\N
163	dance	v	\N	\N	1	A1	\N
164	dancer	n	\N	\N	1	A1	\N
165	dancing	n	\N	\N	1	A1	\N
166	dangerous	adj	\N	\N	1	A1	\N
167	dark	adj	\N	\N	1	A1	\N
168	date	n	\N	\N	1	A1	\N
169	daughter	n	\N	\N	1	A1	\N
170	day	n	\N	\N	1	A1	\N
171	dear	adj	\N	\N	1	A1	\N
172	December	n	\N	\N	1	A1	\N
173	decide	v	\N	\N	1	A1	\N
174	delicious	adj	\N	\N	1	A1	\N
175	desk	n	\N	\N	1	A1	\N
176	detail	n	\N	\N	1	A1	\N
177	dialogue	n	\N	\N	1	A1	\N
178	dictionary	n	\N	\N	1	A1	\N
179	die	v	\N	\N	1	A1	\N
180	diet	n	\N	\N	1	A1	\N
181	different	adj	\N	\N	1	A1	\N
182	difficult	adj	\N	\N	1	A1	\N
183	dinner	n	\N	\N	1	A1	\N
184	dirty	adj	\N	\N	1	A1	\N
185	dish	n	\N	\N	1	A1	\N
186	do	v	\N	\N	1	A1	\N
187	doctor	n	\N	\N	1	A1	\N
188	dog	n	\N	\N	1	A1	\N
189	dollar	n	\N	\N	1	A1	\N
190	door	n	\N	\N	1	A1	\N
191	down	adv	\N	\N	1	A1	\N
192	downstairs	adv	\N	\N	1	A1	\N
193	draw	v	\N	\N	1	A1	\N
194	dress	n	\N	\N	1	A1	\N
195	drink	v	\N	\N	1	A1	\N
196	drive	v	\N	\N	1	A1	\N
197	driver	n	\N	\N	1	A1	\N
198	driving	n	\N	\N	1	A1	\N
199	during	prep	\N	\N	1	A1	\N
200	DVD	n	\N	\N	1	A1	\N
201	each	det	\N	\N	1	A1	\N
202	ear	n	\N	\N	1	A1	\N
203	early	adj	\N	\N	1	A1	\N
204	east	n	\N	\N	1	A1	\N
205	easy	adj	\N	\N	1	A1	\N
206	eat	v	\N	\N	1	A1	\N
207	egg	n	\N	\N	1	A1	\N
208	eight	num	\N	\N	1	A1	\N
209	eighteen	num	\N	\N	1	A1	\N
210	eighty	num	\N	\N	1	A1	\N
211	elephant	n	\N	\N	1	A1	\N
212	eleven	num	\N	\N	1	A1	\N
213	else	adv	\N	\N	1	A1	\N
214	email	n	\N	\N	1	A1	\N
215	end	n	\N	\N	1	A1	\N
216	enjoy	v	\N	\N	1	A1	\N
217	enough	det	\N	\N	1	A1	\N
218	euro	n	\N	\N	1	A1	\N
219	even	adv	\N	\N	1	A1	\N
220	evening	n	\N	\N	1	A1	\N
221	ever	adv	\N	\N	1	A1	\N
222	every	det	\N	\N	1	A1	\N
223	everybody	pron	\N	\N	1	A1	\N
224	everyone	pron	\N	\N	1	A1	\N
225	everything	pron	\N	\N	1	A1	\N
226	exam	n	\N	\N	1	A1	\N
227	example	n	\N	\N	1	A1	\N
228	excited	adj	\N	\N	1	A1	\N
229	exciting	adj	\N	\N	1	A1	\N
230	exercise	n	\N	\N	1	A1	\N
231	expensive	adj	\N	\N	1	A1	\N
232	explain	v	\N	\N	1	A1	\N
233	extra	adj	\N	\N	1	A1	\N
234	eye	n	\N	\N	1	A1	\N
235	face	n	\N	\N	1	A1	\N
236	fall	v	\N	\N	1	A1	\N
237	false	adj	\N	\N	1	A1	\N
238	family	n	\N	\N	1	A1	\N
239	famous	adj	\N	\N	1	A1	\N
240	fantastic	adj	\N	\N	1	A1	\N
241	far	adv	\N	\N	1	A1	\N
242	farm	n	\N	\N	1	A1	\N
243	farmer	n	\N	\N	1	A1	\N
244	fast	adj	\N	\N	1	A1	\N
245	fat	adj	\N	\N	1	A1	\N
246	father	n	\N	\N	1	A1	\N
247	favourite	adj	\N	\N	1	A1	\N
248	February	n	\N	\N	1	A1	\N
249	feel	v	\N	\N	1	A1	\N
250	festival	n	\N	\N	1	A1	\N
251	few	det	\N	\N	1	A1	\N
252	fifteen	num	\N	\N	1	A1	\N
253	fifth	num	\N	\N	1	A1	\N
254	fifty	num	\N	\N	1	A1	\N
255	fill	v	\N	\N	1	A1	\N
256	film	n	\N	\N	1	A1	\N
257	final	adj	\N	\N	1	A1	\N
258	find	v	\N	\N	1	A1	\N
259	fine	adj	\N	\N	1	A1	\N
260	finish	v	\N	\N	1	A1	\N
261	fire	n	\N	\N	1	A1	\N
262	first	num	\N	\N	1	A1	\N
263	fish	n	\N	\N	1	A1	\N
264	five	num	\N	\N	1	A1	\N
265	fix	v	\N	\N	1	A1	\N
266	flat	n	\N	\N	1	A1	\N
267	flight	n	\N	\N	1	A1	\N
268	floor	n	\N	\N	1	A1	\N
269	flower	n	\N	\N	1	A1	\N
270	fly	v	\N	\N	1	A1	\N
271	follow	v	\N	\N	1	A1	\N
272	food	n	\N	\N	1	A1	\N
273	foot	n	\N	\N	1	A1	\N
274	football	n	\N	\N	1	A1	\N
275	for	prep	\N	\N	1	A1	\N
276	forget	v	\N	\N	1	A1	\N
277	form	n	\N	\N	1	A1	\N
278	forty	num	\N	\N	1	A1	\N
279	four	num	\N	\N	1	A1	\N
280	fourteen	num	\N	\N	1	A1	\N
281	fourth	num	\N	\N	1	A1	\N
282	free	adj	\N	\N	1	A1	\N
283	Friday	n	\N	\N	1	A1	\N
284	friend	n	\N	\N	1	A1	\N
285	friendly	adj	\N	\N	1	A1	\N
286	from	prep	\N	\N	1	A1	\N
287	front	n	\N	\N	1	A1	\N
288	fruit	n	\N	\N	1	A1	\N
289	full	adj	\N	\N	1	A1	\N
290	fun	n	\N	\N	1	A1	\N
291	funny	adj	\N	\N	1	A1	\N
292	future	n	\N	\N	1	A1	\N
293	game	n	\N	\N	1	A1	\N
294	garden	n	\N	\N	1	A1	\N
295	geography	n	\N	\N	1	A1	\N
296	get	v	\N	\N	1	A1	\N
297	girl	n	\N	\N	1	A1	\N
298	girlfriend	n	\N	\N	1	A1	\N
299	give	v	\N	\N	1	A1	\N
300	glass	n	\N	\N	1	A1	\N
301	go	v	\N	\N	1	A1	\N
302	good	adj	\N	\N	1	A1	\N
303	goodbye	interj	\N	\N	1	A1	\N
304	grandfather	n	\N	\N	1	A1	\N
305	grandmother	n	\N	\N	1	A1	\N
306	grandparent	n	\N	\N	1	A1	\N
307	great	adj	\N	\N	1	A1	\N
308	green	adj	\N	\N	1	A1	\N
309	grey	adj	\N	\N	1	A1	\N
310	group	n	\N	\N	1	A1	\N
311	grow	v	\N	\N	1	A1	\N
312	guess	v	\N	\N	1	A1	\N
313	guitar	n	\N	\N	1	A1	\N
314	gym	n	\N	\N	1	A1	\N
315	hair	n	\N	\N	1	A1	\N
316	half	n	\N	\N	1	A1	\N
317	hand	n	\N	\N	1	A1	\N
318	happen	v	\N	\N	1	A1	\N
319	happy	adj	\N	\N	1	A1	\N
320	hard	adj	\N	\N	1	A1	\N
321	hat	n	\N	\N	1	A1	\N
322	hate	v	\N	\N	1	A1	\N
323	have	v	\N	\N	1	A1	\N
324	have to	v	\N	\N	1	A1	\N
325	he	pron	\N	\N	1	A1	\N
326	head	n	\N	\N	1	A1	\N
327	health	n	\N	\N	1	A1	\N
328	healthy	adj	\N	\N	1	A1	\N
329	hear	v	\N	\N	1	A1	\N
330	hello	interj	\N	\N	1	A1	\N
331	help	v	\N	\N	1	A1	\N
332	her	pron	\N	\N	1	A1	\N
333	here	adv	\N	\N	1	A1	\N
334	hey	interj	\N	\N	1	A1	\N
335	hi	interj	\N	\N	1	A1	\N
336	high	adj	\N	\N	1	A1	\N
337	him	pron	\N	\N	1	A1	\N
338	his	det	\N	\N	1	A1	\N
339	history	n	\N	\N	1	A1	\N
340	hobby	n	\N	\N	1	A1	\N
341	holiday	n	\N	\N	1	A1	\N
342	home	n	\N	\N	1	A1	\N
343	homework	n	\N	\N	1	A1	\N
344	hope	v	\N	\N	1	A1	\N
345	horse	n	\N	\N	1	A1	\N
346	hospital	n	\N	\N	1	A1	\N
347	hot	adj	\N	\N	1	A1	\N
348	hotel	n	\N	\N	1	A1	\N
349	hour	n	\N	\N	1	A1	\N
350	house	n	\N	\N	1	A1	\N
351	how	adv	\N	\N	1	A1	\N
352	hundred	num	\N	\N	1	A1	\N
353	hungry	adj	\N	\N	1	A1	\N
354	husband	n	\N	\N	1	A1	\N
355	I	pron	\N	\N	1	A1	\N
356	ice	n	\N	\N	1	A1	\N
357	ice cream	n	\N	\N	1	A1	\N
358	idea	n	\N	\N	1	A1	\N
359	if	conj	\N	\N	1	A1	\N
360	important	adj	\N	\N	1	A1	\N
361	in	prep	\N	\N	1	A1	\N
362	include	v	\N	\N	1	A1	\N
363	information	n	\N	\N	1	A1	\N
364	interest	n	\N	\N	1	A1	\N
365	interested	adj	\N	\N	1	A1	\N
366	interesting	adj	\N	\N	1	A1	\N
367	internet	n	\N	\N	1	A1	\N
368	interview	n	\N	\N	1	A1	\N
369	into	prep	\N	\N	1	A1	\N
370	introduce	v	\N	\N	1	A1	\N
371	island	n	\N	\N	1	A1	\N
372	it	pron	\N	\N	1	A1	\N
373	its	det	\N	\N	1	A1	\N
374	jacket	n	\N	\N	1	A1	\N
375	January	n	\N	\N	1	A1	\N
376	jeans	n	\N	\N	1	A1	\N
377	job	n	\N	\N	1	A1	\N
378	join	v	\N	\N	1	A1	\N
379	journey	n	\N	\N	1	A1	\N
380	juice	n	\N	\N	1	A1	\N
381	keep	v	\N	\N	1	A1	\N
382	key	n	\N	\N	1	A1	\N
383	kilometre	n	\N	\N	1	A1	\N
384	kind	n	\N	\N	1	A1	\N
385	kitchen	n	\N	\N	1	A1	\N
386	know	v	\N	\N	1	A1	\N
387	land	n	\N	\N	1	A1	\N
388	language	n	\N	\N	1	A1	\N
389	large	adj	\N	\N	1	A1	\N
390	last	adj	\N	\N	1	A1	\N
391	late	adj	\N	\N	1	A1	\N
392	later	adv	\N	\N	1	A1	\N
393	laugh	v	\N	\N	1	A1	\N
394	learn	v	\N	\N	1	A1	\N
395	leave	v	\N	\N	1	A1	\N
396	left	adj	\N	\N	1	A1	\N
397	leg	n	\N	\N	1	A1	\N
398	lesson	n	\N	\N	1	A1	\N
399	let	v	\N	\N	1	A1	\N
400	letter	n	\N	\N	1	A1	\N
401	library	n	\N	\N	1	A1	\N
402	lie	v	\N	\N	1	A1	\N
403	life	n	\N	\N	1	A1	\N
404	light	n	\N	\N	1	A1	\N
405	like	prep	\N	\N	1	A1	\N
406	like	v	\N	\N	1	A1	\N
407	line	n	\N	\N	1	A1	\N
408	lion	n	\N	\N	1	A1	\N
409	list	n	\N	\N	1	A1	\N
410	listen	v	\N	\N	1	A1	\N
411	little	adj	\N	\N	1	A1	\N
412	live	v	\N	\N	1	A1	\N
413	long	adj	\N	\N	1	A1	\N
414	look	v	\N	\N	1	A1	\N
415	lose	v	\N	\N	1	A1	\N
416	lot	n	\N	\N	1	A1	\N
417	love	v	\N	\N	1	A1	\N
418	lunch	n	\N	\N	1	A1	\N
419	machine	n	\N	\N	1	A1	\N
420	magazine	n	\N	\N	1	A1	\N
421	main	adj	\N	\N	1	A1	\N
422	make	v	\N	\N	1	A1	\N
423	man	n	\N	\N	1	A1	\N
424	many	det	\N	\N	1	A1	\N
425	map	n	\N	\N	1	A1	\N
426	March	n	\N	\N	1	A1	\N
427	market	n	\N	\N	1	A1	\N
428	married	adj	\N	\N	1	A1	\N
429	match	n	\N	\N	1	A1	\N
430	May	n	\N	\N	1	A1	\N
431	maybe	adv	\N	\N	1	A1	\N
432	me	pron	\N	\N	1	A1	\N
433	meal	n	\N	\N	1	A1	\N
434	mean	v	\N	\N	1	A1	\N
435	meaning	n	\N	\N	1	A1	\N
436	meat	n	\N	\N	1	A1	\N
437	meet	v	\N	\N	1	A1	\N
438	meeting	n	\N	\N	1	A1	\N
439	member	n	\N	\N	1	A1	\N
440	menu	n	\N	\N	1	A1	\N
441	message	n	\N	\N	1	A1	\N
442	metre	n	\N	\N	1	A1	\N
443	midnight	n	\N	\N	1	A1	\N
444	mile	n	\N	\N	1	A1	\N
445	milk	n	\N	\N	1	A1	\N
446	million	num	\N	\N	1	A1	\N
447	minute	n	\N	\N	1	A1	\N
448	miss	v	\N	\N	1	A1	\N
449	mistake	n	\N	\N	1	A1	\N
450	model	n	\N	\N	1	A1	\N
451	modern	adj	\N	\N	1	A1	\N
452	moment	n	\N	\N	1	A1	\N
453	Monday	n	\N	\N	1	A1	\N
454	money	n	\N	\N	1	A1	\N
455	month	n	\N	\N	1	A1	\N
456	more	det	\N	\N	1	A1	\N
457	morning	n	\N	\N	1	A1	\N
458	most	det	\N	\N	1	A1	\N
459	mother	n	\N	\N	1	A1	\N
460	mountain	n	\N	\N	1	A1	\N
461	mouse	n	\N	\N	1	A1	\N
462	mouth	n	\N	\N	1	A1	\N
463	move	v	\N	\N	1	A1	\N
464	movie	n	\N	\N	1	A1	\N
465	much	det	\N	\N	1	A1	\N
466	mum	n	\N	\N	1	A1	\N
467	museum	n	\N	\N	1	A1	\N
468	music	n	\N	\N	1	A1	\N
469	must	v	\N	\N	1	A1	\N
470	my	det	\N	\N	1	A1	\N
471	name	n	\N	\N	1	A1	\N
472	near	prep	\N	\N	1	A1	\N
473	need	v	\N	\N	1	A1	\N
474	neighbour	n	\N	\N	1	A1	\N
475	never	adv	\N	\N	1	A1	\N
476	new	adj	\N	\N	1	A1	\N
477	news	n	\N	\N	1	A1	\N
478	newspaper	n	\N	\N	1	A1	\N
479	next	adj	\N	\N	1	A1	\N
480	next to	prep	\N	\N	1	A1	\N
481	nice	adj	\N	\N	1	A1	\N
482	night	n	\N	\N	1	A1	\N
483	nine	num	\N	\N	1	A1	\N
484	nineteen	num	\N	\N	1	A1	\N
485	ninety	num	\N	\N	1	A1	\N
486	no	det	\N	\N	1	A1	\N
487	no one	pron	\N	\N	1	A1	\N
488	nobody	pron	\N	\N	1	A1	\N
489	noon	n	\N	\N	1	A1	\N
490	north	n	\N	\N	1	A1	\N
491	nose	n	\N	\N	1	A1	\N
492	not	adv	\N	\N	1	A1	\N
493	note	n	\N	\N	1	A1	\N
494	nothing	pron	\N	\N	1	A1	\N
495	November	n	\N	\N	1	A1	\N
496	now	adv	\N	\N	1	A1	\N
497	number	n	\N	\N	1	A1	\N
498	o'clock	adv	\N	\N	1	A1	\N
499	October	n	\N	\N	1	A1	\N
500	of	prep	\N	\N	1	A1	\N
501	off	adv	\N	\N	1	A1	\N
502	office	n	\N	\N	1	A1	\N
503	often	adv	\N	\N	1	A1	\N
504	oh	interj	\N	\N	1	A1	\N
505	OK	adj	\N	\N	1	A1	\N
506	old	adj	\N	\N	1	A1	\N
507	on	prep	\N	\N	1	A1	\N
508	once	adv	\N	\N	1	A1	\N
509	one	num	\N	\N	1	A1	\N
510	onion	n	\N	\N	1	A1	\N
511	online	adj	\N	\N	1	A1	\N
512	only	adv	\N	\N	1	A1	\N
513	open	v	\N	\N	1	A1	\N
514	opposite	adj	\N	\N	1	A1	\N
515	or	conj	\N	\N	1	A1	\N
516	orange	n	\N	\N	1	A1	\N
517	order	v	\N	\N	1	A1	\N
518	other	adj	\N	\N	1	A1	\N
519	our	det	\N	\N	1	A1	\N
520	out	adv	\N	\N	1	A1	\N
521	outside	adv	\N	\N	1	A1	\N
522	over	prep	\N	\N	1	A1	\N
523	own	v	\N	\N	1	A1	\N
524	page	n	\N	\N	1	A1	\N
525	paint	v	\N	\N	1	A1	\N
526	painting	n	\N	\N	1	A1	\N
527	pair	n	\N	\N	1	A1	\N
528	paper	n	\N	\N	1	A1	\N
529	paragraph	n	\N	\N	1	A1	\N
530	parent	n	\N	\N	1	A1	\N
531	park	n	\N	\N	1	A1	\N
532	part	n	\N	\N	1	A1	\N
533	partner	n	\N	\N	1	A1	\N
534	party	n	\N	\N	1	A1	\N
535	passport	n	\N	\N	1	A1	\N
536	past	adj	\N	\N	1	A1	\N
537	pay	v	\N	\N	1	A1	\N
538	pen	n	\N	\N	1	A1	\N
539	pencil	n	\N	\N	1	A1	\N
540	people	n	\N	\N	1	A1	\N
541	pepper	n	\N	\N	1	A1	\N
542	perfect	adj	\N	\N	1	A1	\N
543	period	n	\N	\N	1	A1	\N
544	person	n	\N	\N	1	A1	\N
545	personal	adj	\N	\N	1	A1	\N
546	phone	n	\N	\N	1	A1	\N
547	photo	n	\N	\N	1	A1	\N
548	photograph	n	\N	\N	1	A1	\N
549	phrase	n	\N	\N	1	A1	\N
550	piano	n	\N	\N	1	A1	\N
551	picture	n	\N	\N	1	A1	\N
552	piece	n	\N	\N	1	A1	\N
553	pig	n	\N	\N	1	A1	\N
554	pink	adj	\N	\N	1	A1	\N
555	place	n	\N	\N	1	A1	\N
556	plan	n	\N	\N	1	A1	\N
557	plane	n	\N	\N	1	A1	\N
558	plant	n	\N	\N	1	A1	\N
559	play	v	\N	\N	1	A1	\N
560	player	n	\N	\N	1	A1	\N
561	please	interj	\N	\N	1	A1	\N
562	point	n	\N	\N	1	A1	\N
563	police	n	\N	\N	1	A1	\N
564	policeman	n	\N	\N	1	A1	\N
565	pool	n	\N	\N	1	A1	\N
566	poor	adj	\N	\N	1	A1	\N
567	pop	n	\N	\N	1	A1	\N
568	popular	adj	\N	\N	1	A1	\N
569	possible	adj	\N	\N	1	A1	\N
570	post	n	\N	\N	1	A1	\N
571	potato	n	\N	\N	1	A1	\N
572	pound	n	\N	\N	1	A1	\N
573	practice	n	\N	\N	1	A1	\N
574	practise	v	\N	\N	1	A1	\N
575	present	n	\N	\N	1	A1	\N
576	pretty	adj	\N	\N	1	A1	\N
577	price	n	\N	\N	1	A1	\N
578	problem	n	\N	\N	1	A1	\N
579	programme	n	\N	\N	1	A1	\N
580	project	n	\N	\N	1	A1	\N
581	purple	adj	\N	\N	1	A1	\N
582	put	v	\N	\N	1	A1	\N
583	snake	n	\N	\N	1	A1	\N
584	snow	n	\N	\N	1	A1	\N
585	so	conj	\N	\N	1	A1	\N
586	some	det	\N	\N	1	A1	\N
1587	side	n	\N	\N	1	A2	\N
587	somebody	pron	\N	\N	1	A1	\N
588	someone	pron	\N	\N	1	A1	\N
589	something	pron	\N	\N	1	A1	\N
590	sometimes	adv	\N	\N	1	A1	\N
591	son	n	\N	\N	1	A1	\N
592	song	n	\N	\N	1	A1	\N
593	soon	adv	\N	\N	1	A1	\N
594	sorry	adj	\N	\N	1	A1	\N
595	sound	n	\N	\N	1	A1	\N
596	soup	n	\N	\N	1	A1	\N
597	south	n	\N	\N	1	A1	\N
598	space	n	\N	\N	1	A1	\N
599	speak	v	\N	\N	1	A1	\N
600	special	adj	\N	\N	1	A1	\N
601	spell	v	\N	\N	1	A1	\N
602	spelling	n	\N	\N	1	A1	\N
603	spend	v	\N	\N	1	A1	\N
604	sport	n	\N	\N	1	A1	\N
605	spring	n	\N	\N	1	A1	\N
606	stand	v	\N	\N	1	A1	\N
607	start	v	\N	\N	1	A1	\N
608	station	n	\N	\N	1	A1	\N
609	stop	v	\N	\N	1	A1	\N
610	story	n	\N	\N	1	A1	\N
611	street	n	\N	\N	1	A1	\N
612	strong	adj	\N	\N	1	A1	\N
613	student	n	\N	\N	1	A1	\N
614	study	v	\N	\N	1	A1	\N
615	style	n	\N	\N	1	A1	\N
616	subject	n	\N	\N	1	A1	\N
617	sugar	n	\N	\N	1	A1	\N
618	summer	n	\N	\N	1	A1	\N
619	sun	n	\N	\N	1	A1	\N
620	Sunday	n	\N	\N	1	A1	\N
621	supermarket	n	\N	\N	1	A1	\N
622	sure	adj	\N	\N	1	A1	\N
623	sweater	n	\N	\N	1	A1	\N
624	swim	v	\N	\N	1	A1	\N
625	swimming	n	\N	\N	1	A1	\N
626	table	n	\N	\N	1	A1	\N
627	take	v	\N	\N	1	A1	\N
628	talk	v	\N	\N	1	A1	\N
629	tall	adj	\N	\N	1	A1	\N
630	taxi	n	\N	\N	1	A1	\N
631	tea	n	\N	\N	1	A1	\N
632	teach	v	\N	\N	1	A1	\N
633	teacher	n	\N	\N	1	A1	\N
634	team	n	\N	\N	1	A1	\N
635	teenager	n	\N	\N	1	A1	\N
636	telephone	n	\N	\N	1	A1	\N
637	television	n	\N	\N	1	A1	\N
638	tell	v	\N	\N	1	A1	\N
639	ten	num	\N	\N	1	A1	\N
640	tennis	n	\N	\N	1	A1	\N
641	terrible	adj	\N	\N	1	A1	\N
642	test	n	\N	\N	1	A1	\N
643	text	n	\N	\N	1	A1	\N
644	than	conj	\N	\N	1	A1	\N
645	thank	v	\N	\N	1	A1	\N
646	thanks	interj	\N	\N	1	A1	\N
647	that	det	\N	\N	1	A1	\N
648	the	det	\N	\N	1	A1	\N
649	theatre	n	\N	\N	1	A1	\N
650	their	det	\N	\N	1	A1	\N
651	them	pron	\N	\N	1	A1	\N
652	then	adv	\N	\N	1	A1	\N
653	there	adv	\N	\N	1	A1	\N
654	they	pron	\N	\N	1	A1	\N
655	thing	n	\N	\N	1	A1	\N
656	think	v	\N	\N	1	A1	\N
657	third	num	\N	\N	1	A1	\N
658	thirsty	adj	\N	\N	1	A1	\N
659	thirteen	num	\N	\N	1	A1	\N
660	thirty	num	\N	\N	1	A1	\N
661	this	det	\N	\N	1	A1	\N
662	thousand	num	\N	\N	1	A1	\N
663	three	num	\N	\N	1	A1	\N
664	through	prep	\N	\N	1	A1	\N
665	Thursday	n	\N	\N	1	A1	\N
666	ticket	n	\N	\N	1	A1	\N
667	time	n	\N	\N	1	A1	\N
668	tired	adj	\N	\N	1	A1	\N
669	title	n	\N	\N	1	A1	\N
670	to	prep	\N	\N	1	A1	\N
671	today	adv	\N	\N	1	A1	\N
672	together	adv	\N	\N	1	A1	\N
673	toilet	n	\N	\N	1	A1	\N
674	tomato	n	\N	\N	1	A1	\N
675	tomorrow	adv	\N	\N	1	A1	\N
676	tonight	adv	\N	\N	1	A1	\N
677	too	adv	\N	\N	1	A1	\N
678	top	n	\N	\N	1	A1	\N
679	tooth	n	\N	\N	1	A1	\N
680	tourist	n	\N	\N	1	A1	\N
681	town	n	\N	\N	1	A1	\N
682	traffic	n	\N	\N	1	A1	\N
683	train	n	\N	\N	1	A1	\N
684	travel	v	\N	\N	1	A1	\N
685	tree	n	\N	\N	1	A1	\N
686	trip	n	\N	\N	1	A1	\N
687	trousers	n	\N	\N	1	A1	\N
688	true	adj	\N	\N	1	A1	\N
689	try	v	\N	\N	1	A1	\N
690	T-shirt	n	\N	\N	1	A1	\N
691	Tuesday	n	\N	\N	1	A1	\N
692	turn	v	\N	\N	1	A1	\N
693	TV	n	\N	\N	1	A1	\N
694	twelve	num	\N	\N	1	A1	\N
695	twenty	num	\N	\N	1	A1	\N
696	twice	adv	\N	\N	1	A1	\N
697	two	num	\N	\N	1	A1	\N
698	type	n	\N	\N	1	A1	\N
699	umbrella	n	\N	\N	1	A1	\N
700	uncle	n	\N	\N	1	A1	\N
701	under	prep	\N	\N	1	A1	\N
702	understand	v	\N	\N	1	A1	\N
703	university	n	\N	\N	1	A1	\N
704	until	conj	\N	\N	1	A1	\N
705	up	adv	\N	\N	1	A1	\N
706	upstairs	adv	\N	\N	1	A1	\N
707	us	pron	\N	\N	1	A1	\N
708	use	v	\N	\N	1	A1	\N
709	usually	adv	\N	\N	1	A1	\N
710	vacation	n	\N	\N	1	A1	\N
711	vegetable	n	\N	\N	1	A1	\N
712	very	adv	\N	\N	1	A1	\N
713	video	n	\N	\N	1	A1	\N
714	village	n	\N	\N	1	A1	\N
715	visit	v	\N	\N	1	A1	\N
716	visitor	n	\N	\N	1	A1	\N
717	wait	v	\N	\N	1	A1	\N
718	waiter	n	\N	\N	1	A1	\N
719	wake	v	\N	\N	1	A1	\N
720	walk	v	\N	\N	1	A1	\N
721	wall	n	\N	\N	1	A1	\N
722	want	v	\N	\N	1	A1	\N
723	warm	adj	\N	\N	1	A1	\N
724	wash	v	\N	\N	1	A1	\N
725	watch	v	\N	\N	1	A1	\N
726	water	n	\N	\N	1	A1	\N
727	way	n	\N	\N	1	A1	\N
728	we	pron	\N	\N	1	A1	\N
729	wear	v	\N	\N	1	A1	\N
730	weather	n	\N	\N	1	A1	\N
731	website	n	\N	\N	1	A1	\N
732	Wednesday	n	\N	\N	1	A1	\N
733	week	n	\N	\N	1	A1	\N
734	weekend	n	\N	\N	1	A1	\N
735	welcome	interj	\N	\N	1	A1	\N
736	well	adv	\N	\N	1	A1	\N
737	west	n	\N	\N	1	A1	\N
738	what	pron	\N	\N	1	A1	\N
739	when	adv	\N	\N	1	A1	\N
740	where	adv	\N	\N	1	A1	\N
741	which	pron	\N	\N	1	A1	\N
742	white	adj	\N	\N	1	A1	\N
743	who	pron	\N	\N	1	A1	\N
744	why	adv	\N	\N	1	A1	\N
745	wife	n	\N	\N	1	A1	\N
746	will	v	\N	\N	1	A1	\N
747	win	v	\N	\N	1	A1	\N
748	window	n	\N	\N	1	A1	\N
749	wine	n	\N	\N	1	A1	\N
750	winter	n	\N	\N	1	A1	\N
751	with	prep	\N	\N	1	A1	\N
752	without	prep	\N	\N	1	A1	\N
753	woman	n	\N	\N	1	A1	\N
754	wonderful	adj	\N	\N	1	A1	\N
755	word	n	\N	\N	1	A1	\N
756	work	n	\N	\N	1	A1	\N
757	work	v	\N	\N	1	A1	\N
758	worker	n	\N	\N	1	A1	\N
759	world	n	\N	\N	1	A1	\N
760	would	v	\N	\N	1	A1	\N
761	write	v	\N	\N	1	A1	\N
762	writer	n	\N	\N	1	A1	\N
763	writing	n	\N	\N	1	A1	\N
764	wrong	adj	\N	\N	1	A1	\N
765	yeah	interj	\N	\N	1	A1	\N
766	year	n	\N	\N	1	A1	\N
767	yellow	adj	\N	\N	1	A1	\N
768	yes	interj	\N	\N	1	A1	\N
769	yesterday	adv	\N	\N	1	A1	\N
770	you	pron	\N	\N	1	A1	\N
771	young	adj	\N	\N	1	A1	\N
772	your	det	\N	\N	1	A1	\N
773	yourself	pron	\N	\N	1	A1	\N
774	I	pron	\N	\N	1	A1	\N
775	you	pron	\N	\N	1	A1	\N
776	he	pron	\N	\N	1	A1	\N
777	she	pron	\N	\N	1	A1	\N
778	it	pron	\N	\N	1	A1	\N
779	we	pron	\N	\N	1	A1	\N
780	they	pron	\N	\N	1	A1	\N
781	me	pron	\N	\N	1	A1	\N
782	him	pron	\N	\N	1	A1	\N
783	her	pron	\N	\N	1	A1	\N
784	us	pron	\N	\N	1	A1	\N
785	them	pron	\N	\N	1	A1	\N
786	my	det	\N	\N	1	A1	\N
787	your	det	\N	\N	1	A1	\N
788	his	det	\N	\N	1	A1	\N
789	its	det	\N	\N	1	A1	\N
790	our	det	\N	\N	1	A1	\N
791	their	det	\N	\N	1	A1	\N
792	mine	pron	\N	\N	1	A1	\N
793	yours	pron	\N	\N	1	A1	\N
794	hers	pron	\N	\N	1	A1	\N
795	ours	pron	\N	\N	1	A1	\N
796	theirs	pron	\N	\N	1	A1	\N
797	am	v	\N	\N	1	A1	\N
798	is	v	\N	\N	1	A1	\N
799	are	v	\N	\N	1	A1	\N
800	was	v	\N	\N	1	A1	\N
801	were	v	\N	\N	1	A1	\N
802	be	v	\N	\N	1	A1	\N
803	been	v	\N	\N	1	A1	\N
804	being	v	\N	\N	1	A1	\N
805	have	v	\N	\N	1	A1	\N
806	has	v	\N	\N	1	A1	\N
807	had	v	\N	\N	1	A1	\N
808	shall	v	\N	\N	1	A1	\N
809	may	v	\N	\N	1	A1	\N
810	might	v	\N	\N	1	A1	\N
811	I'm	contr	\N	\N	1	A1	\N
812	you're	contr	\N	\N	1	A1	\N
813	he's	contr	\N	\N	1	A1	\N
814	she's	contr	\N	\N	1	A1	\N
815	it's	contr	\N	\N	1	A1	\N
816	we're	contr	\N	\N	1	A1	\N
817	they're	contr	\N	\N	1	A1	\N
818	I've	contr	\N	\N	1	A1	\N
819	you've	contr	\N	\N	1	A1	\N
820	we've	contr	\N	\N	1	A1	\N
821	they've	contr	\N	\N	1	A1	\N
822	I'll	contr	\N	\N	1	A1	\N
823	you'll	contr	\N	\N	1	A1	\N
824	he'll	contr	\N	\N	1	A1	\N
825	she'll	contr	\N	\N	1	A1	\N
826	we'll	contr	\N	\N	1	A1	\N
827	they'll	contr	\N	\N	1	A1	\N
828	don't	contr	\N	\N	1	A1	\N
829	doesn't	contr	\N	\N	1	A1	\N
830	didn't	contr	\N	\N	1	A1	\N
831	can't	contr	\N	\N	1	A1	\N
832	couldn't	contr	\N	\N	1	A1	\N
833	won't	contr	\N	\N	1	A1	\N
834	shouldn't	contr	\N	\N	1	A1	\N
835	wouldn't	contr	\N	\N	1	A1	\N
836	isn't	contr	\N	\N	1	A1	\N
837	aren't	contr	\N	\N	1	A1	\N
838	wasn't	contr	\N	\N	1	A1	\N
839	weren't	contr	\N	\N	1	A1	\N
840	haven't	contr	\N	\N	1	A1	\N
841	hasn't	contr	\N	\N	1	A1	\N
842	hadn't	contr	\N	\N	1	A1	\N
843	beside	prep	\N	\N	1	A1	\N
844	in front of	prep	\N	\N	1	A1	\N
845	into	prep	\N	\N	1	A1	\N
846	onto	prep	\N	\N	1	A1	\N
847	of	prep	\N	\N	1	A1	\N
848	while	conj	\N	\N	1	A1	\N
849	until	conj	\N	\N	1	A1	\N
850	the	det	\N	\N	1	A1	\N
851	now	adv	\N	\N	1	A1	\N
852	also	adv	\N	\N	1	A1	\N
853	just	adv	\N	\N	1	A1	\N
854	even	adv	\N	\N	1	A1	\N
855	ability	n	\N	\N	1	A2	\N
856	able	adj	\N	\N	1	A2	\N
857	abroad	adv	\N	\N	1	A2	\N
858	accept	v	\N	\N	1	A2	\N
859	accident	n	\N	\N	1	A2	\N
860	achieve	v	\N	\N	1	A2	\N
861	act	v	\N	\N	1	A2	\N
862	active	adj	\N	\N	1	A2	\N
863	actually	adv	\N	\N	1	A2	\N
864	advantage	n	\N	\N	1	A2	\N
865	adventure	n	\N	\N	1	A2	\N
866	advertise	v	\N	\N	1	A2	\N
867	advertisement	n	\N	\N	1	A2	\N
868	advertising	n	\N	\N	1	A2	\N
869	advice	n	\N	\N	1	A2	\N
870	affect	v	\N	\N	1	A2	\N
871	after	prep	\N	\N	1	A2	\N
872	against	prep	\N	\N	1	A2	\N
873	agree	v	\N	\N	1	A2	\N
874	ah	interj	\N	\N	1	A2	\N
875	airline	n	\N	\N	1	A2	\N
876	alive	adj	\N	\N	1	A2	\N
877	all	det	\N	\N	1	A2	\N
878	allow	v	\N	\N	1	A2	\N
879	almost	adv	\N	\N	1	A2	\N
880	alone	adj	\N	\N	1	A2	\N
881	along	prep	\N	\N	1	A2	\N
882	already	adv	\N	\N	1	A2	\N
883	although	conj	\N	\N	1	A2	\N
884	among	prep	\N	\N	1	A2	\N
885	amount	n	\N	\N	1	A2	\N
886	ancient	adj	\N	\N	1	A2	\N
887	ankle	n	\N	\N	1	A2	\N
888	any	det	\N	\N	1	A2	\N
889	anybody	pron	\N	\N	1	A2	\N
890	any more	adv	\N	\N	1	A2	\N
891	anyway	adv	\N	\N	1	A2	\N
892	anywhere	adv	\N	\N	1	A2	\N
893	app	n	\N	\N	1	A2	\N
894	appear	v	\N	\N	1	A2	\N
895	appearance	n	\N	\N	1	A2	\N
896	apply	v	\N	\N	1	A2	\N
897	architect	n	\N	\N	1	A2	\N
898	architecture	n	\N	\N	1	A2	\N
899	argue	v	\N	\N	1	A2	\N
900	argument	n	\N	\N	1	A2	\N
901	army	n	\N	\N	1	A2	\N
902	arrange	v	\N	\N	1	A2	\N
903	arrangement	n	\N	\N	1	A2	\N
904	as	prep	\N	\N	1	A2	\N
905	asleep	adj	\N	\N	1	A2	\N
906	assistant	n	\N	\N	1	A2	\N
907	athlete	n	\N	\N	1	A2	\N
908	attack	n	\N	\N	1	A2	\N
909	attack	v	\N	\N	1	A2	\N
910	attend	v	\N	\N	1	A2	\N
911	attention	n	\N	\N	1	A2	\N
912	attractive	adj	\N	\N	1	A2	\N
913	audience	n	\N	\N	1	A2	\N
914	author	n	\N	\N	1	A2	\N
915	available	adj	\N	\N	1	A2	\N
916	average	n	\N	\N	1	A2	\N
917	average	adj	\N	\N	1	A2	\N
918	avoid	v	\N	\N	1	A2	\N
919	award	n	\N	\N	1	A2	\N
920	awful	adj	\N	\N	1	A2	\N
921	background	n	\N	\N	1	A2	\N
922	badly	adv	\N	\N	1	A2	\N
923	baseball	n	\N	\N	1	A2	\N
924	basketball	n	\N	\N	1	A2	\N
925	bass	n	\N	\N	1	A2	\N
926	bean	n	\N	\N	1	A2	\N
927	bear	n	\N	\N	1	A2	\N
928	beat	v	\N	\N	1	A2	\N
929	beef	n	\N	\N	1	A2	\N
930	before	prep	\N	\N	1	A2	\N
931	behave	v	\N	\N	1	A2	\N
932	belong	v	\N	\N	1	A2	\N
933	belt	n	\N	\N	1	A2	\N
934	benefit	n	\N	\N	1	A2	\N
935	best	adj	\N	\N	1	A2	\N
936	best	adv	\N	\N	1	A2	\N
937	better	adj	\N	\N	1	A2	\N
938	better	adv	\N	\N	1	A2	\N
939	between	prep	\N	\N	1	A2	\N
940	billion	num	\N	\N	1	A2	\N
941	bin	n	\N	\N	1	A2	\N
942	biology	n	\N	\N	1	A2	\N
943	birth	n	\N	\N	1	A2	\N
944	biscuit	n	\N	\N	1	A2	\N
945	bit	n	\N	\N	1	A2	\N
946	blank	adj	\N	\N	1	A2	\N
947	blood	n	\N	\N	1	A2	\N
948	blow	v	\N	\N	1	A2	\N
949	board	n	\N	\N	1	A2	\N
950	boil	v	\N	\N	1	A2	\N
951	bone	n	\N	\N	1	A2	\N
952	book	v	\N	\N	1	A2	\N
953	borrow	v	\N	\N	1	A2	\N
954	boss	n	\N	\N	1	A2	\N
955	bottom	n	\N	\N	1	A2	\N
956	bottom	adj	\N	\N	1	A2	\N
957	bowl	n	\N	\N	1	A2	\N
958	brain	n	\N	\N	1	A2	\N
959	bridge	n	\N	\N	1	A2	\N
960	bright	adj	\N	\N	1	A2	\N
961	brilliant	adj	\N	\N	1	A2	\N
962	broken	adj	\N	\N	1	A2	\N
963	brush	n	\N	\N	1	A2	\N
964	brush	v	\N	\N	1	A2	\N
965	buddy	n	\N	\N	1	A2	\N
966	burn	v	\N	\N	1	A2	\N
967	businessman	n	\N	\N	1	A2	\N
968	button	n	\N	\N	1	A2	\N
969	camp	n	\N	\N	1	A2	\N
970	camp	v	\N	\N	1	A2	\N
971	camping	n	\N	\N	1	A2	\N
972	can	n	\N	\N	1	A2	\N
973	care	n	\N	\N	1	A2	\N
974	care	v	\N	\N	1	A2	\N
975	careful	adj	\N	\N	1	A2	\N
976	carefully	adv	\N	\N	1	A2	\N
977	carpet	n	\N	\N	1	A2	\N
978	cartoon	n	\N	\N	1	A2	\N
979	case	n	\N	\N	1	A2	\N
980	cash	n	\N	\N	1	A2	\N
981	casino	n	\N	\N	1	A2	\N
982	castle	n	\N	\N	1	A2	\N
983	catch	v	\N	\N	1	A2	\N
984	cause	v	\N	\N	1	A2	\N
985	cause	n	\N	\N	1	A2	\N
986	celebrate	v	\N	\N	1	A2	\N
987	celebrity	n	\N	\N	1	A2	\N
988	certain	adj	\N	\N	1	A2	\N
989	certainly	adv	\N	\N	1	A2	\N
990	chance	n	\N	\N	1	A2	\N
991	character	n	\N	\N	1	A2	\N
992	charity	n	\N	\N	1	A2	\N
993	chat	n	\N	\N	1	A2	\N
994	chat	v	\N	\N	1	A2	\N
995	chef	n	\N	\N	1	A2	\N
996	chemistry	n	\N	\N	1	A2	\N
997	chip	n	\N	\N	1	A2	\N
998	choice	n	\N	\N	1	A2	\N
999	church	n	\N	\N	1	A2	\N
1000	cigarette	n	\N	\N	1	A2	\N
1001	circle	n	\N	\N	1	A2	\N
1002	classical	adj	\N	\N	1	A2	\N
1003	clear	adj	\N	\N	1	A2	\N
1004	clearly	adv	\N	\N	1	A2	\N
1005	clever	adj	\N	\N	1	A2	\N
1006	climate	n	\N	\N	1	A2	\N
1007	close	adj	\N	\N	1	A2	\N
1008	close	adv	\N	\N	1	A2	\N
1009	closed	adj	\N	\N	1	A2	\N
1010	clothing	n	\N	\N	1	A2	\N
1011	cloud	n	\N	\N	1	A2	\N
1012	coach	n	\N	\N	1	A2	\N
1013	coast	n	\N	\N	1	A2	\N
1014	code	n	\N	\N	1	A2	\N
1015	coin	n	\N	\N	1	A2	\N
1016	colleague	n	\N	\N	1	A2	\N
1017	collect	v	\N	\N	1	A2	\N
1018	column	n	\N	\N	1	A2	\N
1019	comedy	n	\N	\N	1	A2	\N
1020	comfortable	adj	\N	\N	1	A2	\N
1021	common	adj	\N	\N	1	A2	\N
1022	comment	n	\N	\N	1	A2	\N
1023	communicate	v	\N	\N	1	A2	\N
1024	community	n	\N	\N	1	A2	\N
1025	compare	v	\N	\N	1	A2	\N
1026	compete	v	\N	\N	1	A2	\N
1027	competition	n	\N	\N	1	A2	\N
1028	complain	v	\N	\N	1	A2	\N
1029	completely	adv	\N	\N	1	A2	\N
1030	condition	n	\N	\N	1	A2	\N
1031	conference	n	\N	\N	1	A2	\N
1032	connect	v	\N	\N	1	A2	\N
1033	connected	adj	\N	\N	1	A2	\N
1034	consider	v	\N	\N	1	A2	\N
1035	contain	v	\N	\N	1	A2	\N
1036	continent	n	\N	\N	1	A2	\N
1037	continue	v	\N	\N	1	A2	\N
1038	conversation	n	\N	\N	1	A2	\N
1039	control	n	\N	\N	1	A2	\N
1040	control	v	\N	\N	1	A2	\N
1041	cook	n	\N	\N	1	A2	\N
1042	cooker	n	\N	\N	1	A2	\N
1043	copy	n	\N	\N	1	A2	\N
1044	copy	v	\N	\N	1	A2	\N
1045	corner	n	\N	\N	1	A2	\N
1046	correctly	adv	\N	\N	1	A2	\N
1047	count	v	\N	\N	1	A2	\N
1048	couple	n	\N	\N	1	A2	\N
1049	crazy	adj	\N	\N	1	A2	\N
1050	creative	adj	\N	\N	1	A2	\N
1051	crime	n	\N	\N	1	A2	\N
1052	criminal	n	\N	\N	1	A2	\N
1053	criminal	adj	\N	\N	1	A2	\N
1054	daily	adj	\N	\N	1	A2	\N
1055	daily	adv	\N	\N	1	A2	\N
1056	danger	n	\N	\N	1	A2	\N
1057	dark	adj	\N	\N	1	A2	\N
1058	dark	n	\N	\N	1	A2	\N
1059	dead	adj	\N	\N	1	A2	\N
1060	deal with	v	\N	\N	1	A2	\N
1061	death	n	\N	\N	1	A2	\N
1062	decision	n	\N	\N	1	A2	\N
1063	deep	adj	\N	\N	1	A2	\N
1064	definitely	adv	\N	\N	1	A2	\N
1065	degree	n	\N	\N	1	A2	\N
1066	dentist	n	\N	\N	1	A2	\N
1067	department	n	\N	\N	1	A2	\N
1068	depend	v	\N	\N	1	A2	\N
1069	describe	v	\N	\N	1	A2	\N
1070	description	n	\N	\N	1	A2	\N
1071	desert	n	\N	\N	1	A2	\N
1072	design	n	\N	\N	1	A2	\N
1073	design	v	\N	\N	1	A2	\N
1074	designer	n	\N	\N	1	A2	\N
1075	destroy	v	\N	\N	1	A2	\N
1076	detective	n	\N	\N	1	A2	\N
1077	develop	v	\N	\N	1	A2	\N
1078	device	n	\N	\N	1	A2	\N
1079	diary	n	\N	\N	1	A2	\N
1080	difference	n	\N	\N	1	A2	\N
1081	differently	adv	\N	\N	1	A2	\N
1082	digital	adj	\N	\N	1	A2	\N
1083	direct	adj	\N	\N	1	A2	\N
1084	direct	v	\N	\N	1	A2	\N
1085	direction	n	\N	\N	1	A2	\N
1086	director	n	\N	\N	1	A2	\N
1087	disagree	v	\N	\N	1	A2	\N
1088	disappear	v	\N	\N	1	A2	\N
1089	disaster	n	\N	\N	1	A2	\N
1090	discover	v	\N	\N	1	A2	\N
1091	discovery	n	\N	\N	1	A2	\N
1092	discussion	n	\N	\N	1	A2	\N
1093	disease	n	\N	\N	1	A2	\N
1094	distance	n	\N	\N	1	A2	\N
1095	divorced	adj	\N	\N	1	A2	\N
1096	document	n	\N	\N	1	A2	\N
1097	double	adj	\N	\N	1	A2	\N
1098	double	det	\N	\N	1	A2	\N
1099	double	v	\N	\N	1	A2	\N
1100	download	v	\N	\N	1	A2	\N
1101	downstairs	adv	\N	\N	1	A2	\N
1102	downstairs	adj	\N	\N	1	A2	\N
1103	drama	n	\N	\N	1	A2	\N
1104	dream	n	\N	\N	1	A2	\N
1105	dream	v	\N	\N	1	A2	\N
1106	drive	n	\N	\N	1	A2	\N
1107	driving	n	\N	\N	1	A2	\N
1108	drop	v	\N	\N	1	A2	\N
1109	drug	n	\N	\N	1	A2	\N
1110	dry	adj	\N	\N	1	A2	\N
1111	dry	v	\N	\N	1	A2	\N
1112	earn	v	\N	\N	1	A2	\N
1113	earth	n	\N	\N	1	A2	\N
1114	easily	adv	\N	\N	1	A2	\N
1115	education	n	\N	\N	1	A2	\N
1116	either	det	\N	\N	1	A2	\N
1117	either	pron	\N	\N	1	A2	\N
1118	either	adv	\N	\N	1	A2	\N
1119	electric	adj	\N	\N	1	A2	\N
1120	electrical	adj	\N	\N	1	A2	\N
1121	electricity	n	\N	\N	1	A2	\N
1122	electronic	adj	\N	\N	1	A2	\N
1123	employ	v	\N	\N	1	A2	\N
1124	employee	n	\N	\N	1	A2	\N
1125	employer	n	\N	\N	1	A2	\N
1126	empty	adj	\N	\N	1	A2	\N
1127	ending	n	\N	\N	1	A2	\N
1128	energy	n	\N	\N	1	A2	\N
1129	engine	n	\N	\N	1	A2	\N
1130	engineer	n	\N	\N	1	A2	\N
1131	enormous	adj	\N	\N	1	A2	\N
1132	enter	v	\N	\N	1	A2	\N
1133	equipment	n	\N	\N	1	A2	\N
1134	error	n	\N	\N	1	A2	\N
1135	especially	adv	\N	\N	1	A2	\N
1136	essay	n	\N	\N	1	A2	\N
1137	everyday	adj	\N	\N	1	A2	\N
1138	everywhere	adv	\N	\N	1	A2	\N
1139	exact	adj	\N	\N	1	A2	\N
1140	exactly	adv	\N	\N	1	A2	\N
1141	excellent	adj	\N	\N	1	A2	\N
1142	except	prep	\N	\N	1	A2	\N
1143	except	conj	\N	\N	1	A2	\N
1144	exist	v	\N	\N	1	A2	\N
1145	expect	v	\N	\N	1	A2	\N
1146	experience	n	\N	\N	1	A2	\N
1147	experiment	n	\N	\N	1	A2	\N
1148	expert	n	\N	\N	1	A2	\N
1149	expert	adj	\N	\N	1	A2	\N
1150	explanation	n	\N	\N	1	A2	\N
1151	express	v	\N	\N	1	A2	\N
1152	expression	n	\N	\N	1	A2	\N
1153	extreme	adj	\N	\N	1	A2	\N
1154	extremely	adv	\N	\N	1	A2	\N
1155	factory	n	\N	\N	1	A2	\N
1156	fail	v	\N	\N	1	A2	\N
1157	fair	adj	\N	\N	1	A2	\N
1158	fan	n	\N	\N	1	A2	\N
1159	farming	n	\N	\N	1	A2	\N
1160	fashion	n	\N	\N	1	A2	\N
1161	fat	adj	\N	\N	1	A2	\N
1162	fat	n	\N	\N	1	A2	\N
1163	fear	n	\N	\N	1	A2	\N
1164	feeling	n	\N	\N	1	A2	\N
1165	female	adj	\N	\N	1	A2	\N
1166	female	n	\N	\N	1	A2	\N
1167	fiction	n	\N	\N	1	A2	\N
1168	field	n	\N	\N	1	A2	\N
1169	fight	n	\N	\N	1	A2	\N
1170	fight	v	\N	\N	1	A2	\N
1171	figure	n	\N	\N	1	A2	\N
1172	film	n	\N	\N	1	A2	\N
1173	film	v	\N	\N	1	A2	\N
1174	finally	adv	\N	\N	1	A2	\N
1175	finger	n	\N	\N	1	A2	\N
1176	first	adj	\N	\N	1	A2	\N
1177	first	adv	\N	\N	1	A2	\N
1178	firstly	adv	\N	\N	1	A2	\N
1179	fish	v	\N	\N	1	A2	\N
1180	fishing	n	\N	\N	1	A2	\N
1181	fit	adj	\N	\N	1	A2	\N
1182	flag	n	\N	\N	1	A2	\N
1183	flat	adj	\N	\N	1	A2	\N
1184	flu	n	\N	\N	1	A2	\N
1185	flying	adj	\N	\N	1	A2	\N
1186	focus	v	\N	\N	1	A2	\N
1187	following	adj	\N	\N	1	A2	\N
1188	foreign	adj	\N	\N	1	A2	\N
1189	forest	n	\N	\N	1	A2	\N
1190	fork	n	\N	\N	1	A2	\N
1191	formal	adj	\N	\N	1	A2	\N
1192	fortunately	adv	\N	\N	1	A2	\N
1193	forward	adv	\N	\N	1	A2	\N
1194	fresh	adj	\N	\N	1	A2	\N
1195	fridge	n	\N	\N	1	A2	\N
1196	furniture	n	\N	\N	1	A2	\N
1197	further	adv	\N	\N	1	A2	\N
1198	gallery	n	\N	\N	1	A2	\N
1199	gap	n	\N	\N	1	A2	\N
1200	gas	n	\N	\N	1	A2	\N
1201	gate	n	\N	\N	1	A2	\N
1202	general	adj	\N	\N	1	A2	\N
1203	gift	n	\N	\N	1	A2	\N
1204	goal	n	\N	\N	1	A2	\N
1205	god	n	\N	\N	1	A2	\N
1206	gold	n	\N	\N	1	A2	\N
1207	gold	adj	\N	\N	1	A2	\N
1208	golf	n	\N	\N	1	A2	\N
1209	grass	n	\N	\N	1	A2	\N
1210	greet	v	\N	\N	1	A2	\N
1211	ground	n	\N	\N	1	A2	\N
1212	guest	n	\N	\N	1	A2	\N
1213	guide	n	\N	\N	1	A2	\N
1214	guide	v	\N	\N	1	A2	\N
1215	habit	n	\N	\N	1	A2	\N
1216	half	n	\N	\N	1	A2	\N
1217	half	det	\N	\N	1	A2	\N
1218	hall	n	\N	\N	1	A2	\N
1219	happily	adv	\N	\N	1	A2	\N
1220	headache	n	\N	\N	1	A2	\N
1221	heart	n	\N	\N	1	A2	\N
1222	heat	n	\N	\N	1	A2	\N
1223	heavy	adj	\N	\N	1	A2	\N
1224	height	n	\N	\N	1	A2	\N
1225	helpful	adj	\N	\N	1	A2	\N
1226	hero	n	\N	\N	1	A2	\N
1227	hers	pron	\N	\N	1	A2	\N
1228	herself	pron	\N	\N	1	A2	\N
1229	hide	v	\N	\N	1	A2	\N
1230	high	adj	\N	\N	1	A2	\N
1231	high	adv	\N	\N	1	A2	\N
1232	hill	n	\N	\N	1	A2	\N
1233	himself	pron	\N	\N	1	A2	\N
1234	his	det	\N	\N	1	A2	\N
1235	his	pron	\N	\N	1	A2	\N
1236	hit	n	\N	\N	1	A2	\N
1237	hit	v	\N	\N	1	A2	\N
1238	hockey	n	\N	\N	1	A2	\N
1239	hold	v	\N	\N	1	A2	\N
1240	hole	n	\N	\N	1	A2	\N
1241	hope	n	\N	\N	1	A2	\N
1242	huge	adj	\N	\N	1	A2	\N
1243	human	n	\N	\N	1	A2	\N
1244	human	adj	\N	\N	1	A2	\N
1245	hurry	v	\N	\N	1	A2	\N
1246	hurry	n	\N	\N	1	A2	\N
1247	hurt	v	\N	\N	1	A2	\N
1248	ideal	adj	\N	\N	1	A2	\N
1249	idiot	n	\N	\N	1	A2	\N
1250	ill	adj	\N	\N	1	A2	\N
1251	illness	n	\N	\N	1	A2	\N
1252	image	n	\N	\N	1	A2	\N
1253	immediately	adv	\N	\N	1	A2	\N
1254	impossible	adj	\N	\N	1	A2	\N
1255	included	adj	\N	\N	1	A2	\N
1256	including	prep	\N	\N	1	A2	\N
1257	increase	v	\N	\N	1	A2	\N
1258	incredible	adj	\N	\N	1	A2	\N
1259	independent	adj	\N	\N	1	A2	\N
1260	individual	n	\N	\N	1	A2	\N
1261	individual	adj	\N	\N	1	A2	\N
1262	industry	n	\N	\N	1	A2	\N
1263	informal	adj	\N	\N	1	A2	\N
1264	injury	n	\N	\N	1	A2	\N
1265	ink	n	\N	\N	1	A2	\N
1266	insect	n	\N	\N	1	A2	\N
1267	inside	adv	\N	\N	1	A2	\N
1268	inside	prep	\N	\N	1	A2	\N
1269	instruction	n	\N	\N	1	A2	\N
1270	instructor	n	\N	\N	1	A2	\N
1271	instrument	n	\N	\N	1	A2	\N
1272	intelligent	adj	\N	\N	1	A2	\N
1273	international	adj	\N	\N	1	A2	\N
1274	introduction	n	\N	\N	1	A2	\N
1275	invent	v	\N	\N	1	A2	\N
1276	invention	n	\N	\N	1	A2	\N
1277	jam	n	\N	\N	1	A2	\N
1278	jazz	n	\N	\N	1	A2	\N
1279	jewellery	n	\N	\N	1	A2	\N
1280	joke	n	\N	\N	1	A2	\N
1281	journalist	n	\N	\N	1	A2	\N
1282	jump	v	\N	\N	1	A2	\N
1283	kid	n	\N	\N	1	A2	\N
1284	kill	v	\N	\N	1	A2	\N
1285	king	n	\N	\N	1	A2	\N
1286	kiss	v	\N	\N	1	A2	\N
1287	kiss	n	\N	\N	1	A2	\N
1288	knee	n	\N	\N	1	A2	\N
1289	knife	n	\N	\N	1	A2	\N
1290	knock	v	\N	\N	1	A2	\N
1291	knowledge	n	\N	\N	1	A2	\N
1292	lab	n	\N	\N	1	A2	\N
1293	lady	n	\N	\N	1	A2	\N
1294	lake	n	\N	\N	1	A2	\N
1295	lamp	n	\N	\N	1	A2	\N
1296	land	n	\N	\N	1	A2	\N
1297	land	v	\N	\N	1	A2	\N
1298	laptop	n	\N	\N	1	A2	\N
1299	last	adj	\N	\N	1	A2	\N
1300	last	adv	\N	\N	1	A2	\N
1301	laughter	n	\N	\N	1	A2	\N
1302	law	n	\N	\N	1	A2	\N
1303	lawyer	n	\N	\N	1	A2	\N
1304	lazy	adj	\N	\N	1	A2	\N
1305	lead	v	\N	\N	1	A2	\N
1306	lead	n	\N	\N	1	A2	\N
1307	leader	n	\N	\N	1	A2	\N
1308	learning	n	\N	\N	1	A2	\N
1309	least	det	\N	\N	1	A2	\N
1310	least	pron	\N	\N	1	A2	\N
1311	least	adv	\N	\N	1	A2	\N
1312	lecture	n	\N	\N	1	A2	\N
1313	lemon	n	\N	\N	1	A2	\N
1314	lend	v	\N	\N	1	A2	\N
1315	less	det	\N	\N	1	A2	\N
1316	less	pron	\N	\N	1	A2	\N
1317	less	adv	\N	\N	1	A2	\N
1318	level	n	\N	\N	1	A2	\N
1319	lifestyle	n	\N	\N	1	A2	\N
1320	lift	n	\N	\N	1	A2	\N
1321	lift	v	\N	\N	1	A2	\N
1322	light	adj	\N	\N	1	A2	\N
1323	likely	adj	\N	\N	1	A2	\N
1324	link	n	\N	\N	1	A2	\N
1325	link	v	\N	\N	1	A2	\N
1326	mail	n	\N	\N	1	A2	\N
1327	mail	v	\N	\N	1	A2	\N
1328	major	adj	\N	\N	1	A2	\N
1329	male	adj	\N	\N	1	A2	\N
1330	male	n	\N	\N	1	A2	\N
1331	manage	v	\N	\N	1	A2	\N
1332	manager	n	\N	\N	1	A2	\N
1333	manner	n	\N	\N	1	A2	\N
1334	mark	n	\N	\N	1	A2	\N
1335	mark	v	\N	\N	1	A2	\N
1336	marry	v	\N	\N	1	A2	\N
1337	mask	n	\N	\N	1	A2	\N
1338	material	n	\N	\N	1	A2	\N
1339	mathematics	n	\N	\N	1	A2	\N
1340	maths	n	\N	\N	1	A2	\N
1341	matter	n	\N	\N	1	A2	\N
1342	matter	v	\N	\N	1	A2	\N
1343	may	v	\N	\N	1	A2	\N
1344	media	n	\N	\N	1	A2	\N
1345	medical	adj	\N	\N	1	A2	\N
1346	medicine	n	\N	\N	1	A2	\N
1347	memory	n	\N	\N	1	A2	\N
1348	mention	v	\N	\N	1	A2	\N
1349	metal	n	\N	\N	1	A2	\N
1350	middle	n	\N	\N	1	A2	\N
1351	middle	adj	\N	\N	1	A2	\N
1352	might	v	\N	\N	1	A2	\N
1353	mind	n	\N	\N	1	A2	\N
1354	mind	v	\N	\N	1	A2	\N
1355	mine	pron	\N	\N	1	A2	\N
1356	mirror	n	\N	\N	1	A2	\N
1357	missing	adj	\N	\N	1	A2	\N
1358	mobile	adj	\N	\N	1	A2	\N
1359	monkey	n	\N	\N	1	A2	\N
1360	moon	n	\N	\N	1	A2	\N
1361	mostly	adv	\N	\N	1	A2	\N
1362	motorcycle	n	\N	\N	1	A2	\N
1363	movement	n	\N	\N	1	A2	\N
1364	musical	adj	\N	\N	1	A2	\N
1365	musical	n	\N	\N	1	A2	\N
1366	musician	n	\N	\N	1	A2	\N
1367	myself	pron	\N	\N	1	A2	\N
1368	narrow	adj	\N	\N	1	A2	\N
1369	national	adj	\N	\N	1	A2	\N
1370	natural	adj	\N	\N	1	A2	\N
1371	nature	n	\N	\N	1	A2	\N
1372	nearly	adv	\N	\N	1	A2	\N
1373	necessary	adj	\N	\N	1	A2	\N
1374	neck	n	\N	\N	1	A2	\N
1375	need	n	\N	\N	1	A2	\N
1376	neither	det	\N	\N	1	A2	\N
1377	neither	pron	\N	\N	1	A2	\N
1378	nervous	adj	\N	\N	1	A2	\N
1379	nest	n	\N	\N	1	A2	\N
1380	net	n	\N	\N	1	A2	\N
1381	network	n	\N	\N	1	A2	\N
1382	noise	n	\N	\N	1	A2	\N
1383	noisy	adj	\N	\N	1	A2	\N
1384	none	pron	\N	\N	1	A2	\N
1385	normal	adj	\N	\N	1	A2	\N
1386	normally	adv	\N	\N	1	A2	\N
1387	notice	n	\N	\N	1	A2	\N
1388	notice	v	\N	\N	1	A2	\N
1389	novel	n	\N	\N	1	A2	\N
1390	nowhere	adv	\N	\N	1	A2	\N
1391	ocean	n	\N	\N	1	A2	\N
1392	offer	n	\N	\N	1	A2	\N
1393	offer	v	\N	\N	1	A2	\N
1394	officer	n	\N	\N	1	A2	\N
1395	oil	n	\N	\N	1	A2	\N
1396	onto	prep	\N	\N	1	A2	\N
1397	option	n	\N	\N	1	A2	\N
1398	ordinary	adj	\N	\N	1	A2	\N
1399	organisation	n	\N	\N	1	A2	\N
1400	organise	v	\N	\N	1	A2	\N
1401	original	adj	\N	\N	1	A2	\N
1402	original	n	\N	\N	1	A2	\N
1403	ourselves	pron	\N	\N	1	A2	\N
1404	outside	adv	\N	\N	1	A2	\N
1405	outside	prep	\N	\N	1	A2	\N
1406	outside	adj	\N	\N	1	A2	\N
1407	outside	n	\N	\N	1	A2	\N
1408	oven	n	\N	\N	1	A2	\N
1409	owner	n	\N	\N	1	A2	\N
1410	pack	n	\N	\N	1	A2	\N
1411	pack	v	\N	\N	1	A2	\N
1412	pain	n	\N	\N	1	A2	\N
1413	painter	n	\N	\N	1	A2	\N
1414	palace	n	\N	\N	1	A2	\N
1415	pants	n	\N	\N	1	A2	\N
1416	parking	n	\N	\N	1	A2	\N
1417	particular	adj	\N	\N	1	A2	\N
1418	pass	v	\N	\N	1	A2	\N
1419	passenger	n	\N	\N	1	A2	\N
1420	past	adj	\N	\N	1	A2	\N
1421	past	n	\N	\N	1	A2	\N
1422	past	prep	\N	\N	1	A2	\N
1423	patient	n	\N	\N	1	A2	\N
1424	pattern	n	\N	\N	1	A2	\N
1425	peace	n	\N	\N	1	A2	\N
1426	penny	n	\N	\N	1	A2	\N
1427	per	prep	\N	\N	1	A2	\N
1428	per cent	n	\N	\N	1	A2	\N
1429	perform	v	\N	\N	1	A2	\N
1430	perhaps	adv	\N	\N	1	A2	\N
1431	permission	n	\N	\N	1	A2	\N
1432	personality	n	\N	\N	1	A2	\N
1433	pet	n	\N	\N	1	A2	\N
1434	petrol	n	\N	\N	1	A2	\N
1435	photograph	v	\N	\N	1	A2	\N
1436	physical	adj	\N	\N	1	A2	\N
1437	physics	n	\N	\N	1	A2	\N
1438	pick	v	\N	\N	1	A2	\N
1439	pilot	n	\N	\N	1	A2	\N
1440	pirate	n	\N	\N	1	A2	\N
1441	planet	n	\N	\N	1	A2	\N
1442	plant	v	\N	\N	1	A2	\N
1443	plastic	n	\N	\N	1	A2	\N
1444	plastic	adj	\N	\N	1	A2	\N
1445	plate	n	\N	\N	1	A2	\N
1446	platform	n	\N	\N	1	A2	\N
1447	pleased	adj	\N	\N	1	A2	\N
1448	plug	n	\N	\N	1	A2	\N
1449	pocket	n	\N	\N	1	A2	\N
1450	polite	adj	\N	\N	1	A2	\N
1451	pollution	n	\N	\N	1	A2	\N
1452	pond	n	\N	\N	1	A2	\N
1453	pop	n	\N	\N	1	A2	\N
1454	pop	v	\N	\N	1	A2	\N
1455	population	n	\N	\N	1	A2	\N
1456	position	n	\N	\N	1	A2	\N
1457	possession	n	\N	\N	1	A2	\N
1458	possibility	n	\N	\N	1	A2	\N
1459	poster	n	\N	\N	1	A2	\N
1460	power	n	\N	\N	1	A2	\N
1461	predict	v	\N	\N	1	A2	\N
1462	prefer	v	\N	\N	1	A2	\N
1463	prepare	v	\N	\N	1	A2	\N
1464	present	n	\N	\N	1	A2	\N
1465	present	adj	\N	\N	1	A2	\N
1466	president	n	\N	\N	1	A2	\N
1467	prevent	v	\N	\N	1	A2	\N
1468	print	v	\N	\N	1	A2	\N
1469	printer	n	\N	\N	1	A2	\N
1470	prison	n	\N	\N	1	A2	\N
1471	prize	n	\N	\N	1	A2	\N
1472	professional	adj	\N	\N	1	A2	\N
1473	professional	n	\N	\N	1	A2	\N
1474	professor	n	\N	\N	1	A2	\N
1475	profile	n	\N	\N	1	A2	\N
1476	program	n	\N	\N	1	A2	\N
1477	progress	n	\N	\N	1	A2	\N
1478	promise	n	\N	\N	1	A2	\N
1479	promise	v	\N	\N	1	A2	\N
1480	pronounce	v	\N	\N	1	A2	\N
1481	protect	v	\N	\N	1	A2	\N
1482	pub	n	\N	\N	1	A2	\N
1483	public	adj	\N	\N	1	A2	\N
1484	public	n	\N	\N	1	A2	\N
1485	publish	v	\N	\N	1	A2	\N
1486	pull	v	\N	\N	1	A2	\N
1487	push	v	\N	\N	1	A2	\N
1488	quality	n	\N	\N	1	A2	\N
1489	quantity	n	\N	\N	1	A2	\N
1490	queen	n	\N	\N	1	A2	\N
1491	quietly	adv	\N	\N	1	A2	\N
1492	race	n	\N	\N	1	A2	\N
1493	railway	n	\N	\N	1	A2	\N
1494	raise	v	\N	\N	1	A2	\N
1495	rat	n	\N	\N	1	A2	\N
1496	rate	n	\N	\N	1	A2	\N
1497	rather	adv	\N	\N	1	A2	\N
1498	reach	v	\N	\N	1	A2	\N
1499	react	v	\N	\N	1	A2	\N
1500	realise	v	\N	\N	1	A2	\N
1501	receive	v	\N	\N	1	A2	\N
1502	recent	adj	\N	\N	1	A2	\N
1503	recently	adv	\N	\N	1	A2	\N
1504	reception	n	\N	\N	1	A2	\N
1505	recipe	n	\N	\N	1	A2	\N
1506	recognise	v	\N	\N	1	A2	\N
1507	recommend	v	\N	\N	1	A2	\N
1508	record	n	\N	\N	1	A2	\N
1509	record	v	\N	\N	1	A2	\N
1510	recording	n	\N	\N	1	A2	\N
1511	recycle	v	\N	\N	1	A2	\N
1512	reduce	v	\N	\N	1	A2	\N
1513	refer	v	\N	\N	1	A2	\N
1514	refuse	v	\N	\N	1	A2	\N
1515	region	n	\N	\N	1	A2	\N
1516	regular	adj	\N	\N	1	A2	\N
1517	relationship	n	\N	\N	1	A2	\N
1518	remove	v	\N	\N	1	A2	\N
1519	repair	v	\N	\N	1	A2	\N
1520	replace	v	\N	\N	1	A2	\N
1521	reply	n	\N	\N	1	A2	\N
1522	reply	v	\N	\N	1	A2	\N
1523	report	v	\N	\N	1	A2	\N
1524	reporter	n	\N	\N	1	A2	\N
1525	request	n	\N	\N	1	A2	\N
1526	request	v	\N	\N	1	A2	\N
1527	researcher	n	\N	\N	1	A2	\N
1528	rest	n	\N	\N	1	A2	\N
1529	rest	v	\N	\N	1	A2	\N
1530	review	n	\N	\N	1	A2	\N
1531	review	v	\N	\N	1	A2	\N
1532	ride	n	\N	\N	1	A2	\N
1533	ring	n	\N	\N	1	A2	\N
1534	ring	v	\N	\N	1	A2	\N
1535	rock	n	\N	\N	1	A2	\N
1536	role	n	\N	\N	1	A2	\N
1537	roof	n	\N	\N	1	A2	\N
1538	round	adj	\N	\N	1	A2	\N
1539	round	prep	\N	\N	1	A2	\N
1540	routine	n	\N	\N	1	A2	\N
1541	rubbish	n	\N	\N	1	A2	\N
1542	rude	adj	\N	\N	1	A2	\N
1543	run	n	\N	\N	1	A2	\N
1544	runner	n	\N	\N	1	A2	\N
1545	sadly	adv	\N	\N	1	A2	\N
1546	safe	adj	\N	\N	1	A2	\N
1547	sail	n	\N	\N	1	A2	\N
1548	sail	v	\N	\N	1	A2	\N
1549	sailing	n	\N	\N	1	A2	\N
1550	salary	n	\N	\N	1	A2	\N
1551	sale	n	\N	\N	1	A2	\N
1552	sauce	n	\N	\N	1	A2	\N
1553	save	v	\N	\N	1	A2	\N
1554	scared	adj	\N	\N	1	A2	\N
1555	scary	adj	\N	\N	1	A2	\N
1556	scene	n	\N	\N	1	A2	\N
1557	schedule	n	\N	\N	1	A2	\N
1558	score	n	\N	\N	1	A2	\N
1559	score	v	\N	\N	1	A2	\N
1560	screen	n	\N	\N	1	A2	\N
1561	search	v	\N	\N	1	A2	\N
1562	season	n	\N	\N	1	A2	\N
1563	seat	n	\N	\N	1	A2	\N
1564	second	adj	\N	\N	1	A2	\N
1565	second	adv	\N	\N	1	A2	\N
1566	secret	n	\N	\N	1	A2	\N
1567	secret	adj	\N	\N	1	A2	\N
1568	secretary	n	\N	\N	1	A2	\N
1569	seem	v	\N	\N	1	A2	\N
1570	sell	v	\N	\N	1	A2	\N
1571	sense	n	\N	\N	1	A2	\N
1572	separate	adj	\N	\N	1	A2	\N
1573	series	n	\N	\N	1	A2	\N
1574	serious	adj	\N	\N	1	A2	\N
1575	serve	v	\N	\N	1	A2	\N
1576	service	n	\N	\N	1	A2	\N
1577	several	det	\N	\N	1	A2	\N
1578	shake	v	\N	\N	1	A2	\N
1579	shall	v	\N	\N	1	A2	\N
1580	share	v	\N	\N	1	A2	\N
1581	shape	n	\N	\N	1	A2	\N
1582	sheet	n	\N	\N	1	A2	\N
1583	ship	n	\N	\N	1	A2	\N
1584	shoulder	n	\N	\N	1	A2	\N
1585	shout	v	\N	\N	1	A2	\N
1586	shut	v	\N	\N	1	A2	\N
1588	sign	n	\N	\N	1	A2	\N
1589	silver	n	\N	\N	1	A2	\N
1590	silver	adj	\N	\N	1	A2	\N
1591	similar	adj	\N	\N	1	A2	\N
1592	simple	adj	\N	\N	1	A2	\N
1593	since	prep	\N	\N	1	A2	\N
1594	since	conj	\N	\N	1	A2	\N
1595	singing	n	\N	\N	1	A2	\N
1596	single	adj	\N	\N	1	A2	\N
1597	sir	n	\N	\N	1	A2	\N
1598	site	n	\N	\N	1	A2	\N
1599	size	n	\N	\N	1	A2	\N
1600	ski	n	\N	\N	1	A2	\N
1601	ski	v	\N	\N	1	A2	\N
1602	skiing	n	\N	\N	1	A2	\N
1603	skin	n	\N	\N	1	A2	\N
1604	sky	n	\N	\N	1	A2	\N
1605	slowly	adv	\N	\N	1	A2	\N
1606	smartphone	n	\N	\N	1	A2	\N
1607	smell	n	\N	\N	1	A2	\N
1608	smell	v	\N	\N	1	A2	\N
1609	smile	n	\N	\N	1	A2	\N
1610	smile	v	\N	\N	1	A2	\N
1611	smoke	n	\N	\N	1	A2	\N
1612	smoke	v	\N	\N	1	A2	\N
1613	smoking	n	\N	\N	1	A2	\N
1614	soap	n	\N	\N	1	A2	\N
1615	soccer	n	\N	\N	1	A2	\N
1616	social	adj	\N	\N	1	A2	\N
1617	sock	n	\N	\N	1	A2	\N
1618	soft	adj	\N	\N	1	A2	\N
1619	soldier	n	\N	\N	1	A2	\N
1620	solution	n	\N	\N	1	A2	\N
1621	somewhere	adv	\N	\N	1	A2	\N
1622	sort	n	\N	\N	1	A2	\N
1623	speaker	n	\N	\N	1	A2	\N
1624	specific	adj	\N	\N	1	A2	\N
1625	speech	n	\N	\N	1	A2	\N
1626	speed	n	\N	\N	1	A2	\N
1627	spider	n	\N	\N	1	A2	\N
1628	spoon	n	\N	\N	1	A2	\N
1629	square	n	\N	\N	1	A2	\N
1630	square	adj	\N	\N	1	A2	\N
1631	stage	n	\N	\N	1	A2	\N
1632	stair	n	\N	\N	1	A2	\N
1633	stamp	n	\N	\N	1	A2	\N
1634	star	n	\N	\N	1	A2	\N
1635	state	n	\N	\N	1	A2	\N
1636	statement	n	\N	\N	1	A2	\N
1637	stay	v	\N	\N	1	A2	\N
1638	steal	v	\N	\N	1	A2	\N
1639	step	n	\N	\N	1	A2	\N
1640	step	v	\N	\N	1	A2	\N
1641	still	adv	\N	\N	1	A2	\N
1642	stomach	n	\N	\N	1	A2	\N
1643	stone	n	\N	\N	1	A2	\N
1644	store	n	\N	\N	1	A2	\N
1645	storm	n	\N	\N	1	A2	\N
1646	straight	adj	\N	\N	1	A2	\N
1647	straight	adv	\N	\N	1	A2	\N
1648	strange	adj	\N	\N	1	A2	\N
1649	stress	n	\N	\N	1	A2	\N
1650	stupid	adj	\N	\N	1	A2	\N
1651	succeed	v	\N	\N	1	A2	\N
1652	successful	adj	\N	\N	1	A2	\N
1653	such	det	\N	\N	1	A2	\N
1654	suddenly	adv	\N	\N	1	A2	\N
1655	suggest	v	\N	\N	1	A2	\N
1656	suggestion	n	\N	\N	1	A2	\N
1657	suit	n	\N	\N	1	A2	\N
1658	support	n	\N	\N	1	A2	\N
1659	support	v	\N	\N	1	A2	\N
1660	suppose	v	\N	\N	1	A2	\N
1661	surprise	n	\N	\N	1	A2	\N
1662	surprise	v	\N	\N	1	A2	\N
1663	surprised	adj	\N	\N	1	A2	\N
1664	surprising	adj	\N	\N	1	A2	\N
1665	sweet	adj	\N	\N	1	A2	\N
1666	swing	n	\N	\N	1	A2	\N
1667	swing	v	\N	\N	1	A2	\N
1668	tablet	n	\N	\N	1	A2	\N
1669	talk	n	\N	\N	1	A2	\N
1670	target	n	\N	\N	1	A2	\N
1671	task	n	\N	\N	1	A2	\N
1672	taste	n	\N	\N	1	A2	\N
1673	taste	v	\N	\N	1	A2	\N
1674	teaching	n	\N	\N	1	A2	\N
1675	technology	n	\N	\N	1	A2	\N
1676	teenage	adj	\N	\N	1	A2	\N
1677	temperature	n	\N	\N	1	A2	\N
1678	tent	n	\N	\N	1	A2	\N
1679	term	n	\N	\N	1	A2	\N
1680	text	v	\N	\N	1	A2	\N
1681	themselves	pron	\N	\N	1	A2	\N
1682	thick	adj	\N	\N	1	A2	\N
1683	thief	n	\N	\N	1	A2	\N
1684	thin	adj	\N	\N	1	A2	\N
1685	tidy	adj	\N	\N	1	A2	\N
1686	tidy	v	\N	\N	1	A2	\N
1687	tie	n	\N	\N	1	A2	\N
1688	tie	v	\N	\N	1	A2	\N
1689	tip	n	\N	\N	1	A2	\N
1690	toe	n	\N	\N	1	A2	\N
1691	tool	n	\N	\N	1	A2	\N
1692	top	n	\N	\N	1	A2	\N
1693	top	adj	\N	\N	1	A2	\N
1694	total	adj	\N	\N	1	A2	\N
1695	touch	v	\N	\N	1	A2	\N
1696	tour	n	\N	\N	1	A2	\N
1697	tourism	n	\N	\N	1	A2	\N
1698	towards	prep	\N	\N	1	A2	\N
1699	towel	n	\N	\N	1	A2	\N
1700	tower	n	\N	\N	1	A2	\N
1701	toy	n	\N	\N	1	A2	\N
1702	track	n	\N	\N	1	A2	\N
1703	tradition	n	\N	\N	1	A2	\N
1704	traditional	adj	\N	\N	1	A2	\N
1705	trainers	n	\N	\N	1	A2	\N
1706	training	n	\N	\N	1	A2	\N
1707	transport	n	\N	\N	1	A2	\N
1708	traveller	n	\N	\N	1	A2	\N
1709	trouble	n	\N	\N	1	A2	\N
1710	truck	n	\N	\N	1	A2	\N
1711	twin	n	\N	\N	1	A2	\N
1712	typical	adj	\N	\N	1	A2	\N
1713	underground	adj	\N	\N	1	A2	\N
1714	underground	adv	\N	\N	1	A2	\N
1715	understanding	n	\N	\N	1	A2	\N
1716	unfortunately	adv	\N	\N	1	A2	\N
1717	unhappy	adj	\N	\N	1	A2	\N
1718	uniform	n	\N	\N	1	A2	\N
1719	unit	n	\N	\N	1	A2	\N
1720	united	adj	\N	\N	1	A2	\N
1721	unusual	adj	\N	\N	1	A2	\N
1722	upset	adj	\N	\N	1	A2	\N
1723	upstairs	adv	\N	\N	1	A2	\N
1724	upstairs	adj	\N	\N	1	A2	\N
1725	use	n	\N	\N	1	A2	\N
1726	used to	v	\N	\N	1	A2	\N
1727	useful	adj	\N	\N	1	A2	\N
1728	user	n	\N	\N	1	A2	\N
1729	usual	adj	\N	\N	1	A2	\N
1730	valley	n	\N	\N	1	A2	\N
1731	van	n	\N	\N	1	A2	\N
1732	variety	n	\N	\N	1	A2	\N
1733	view	n	\N	\N	1	A2	\N
1734	virus	n	\N	\N	1	A2	\N
1735	voice	n	\N	\N	1	A2	\N
1736	war	n	\N	\N	1	A2	\N
1737	washing	n	\N	\N	1	A2	\N
1738	wave	n	\N	\N	1	A2	\N
1739	wave	v	\N	\N	1	A2	\N
1740	weak	adj	\N	\N	1	A2	\N
1741	web	n	\N	\N	1	A2	\N
1742	wedding	n	\N	\N	1	A2	\N
1743	weight	n	\N	\N	1	A2	\N
1744	welcome	n	\N	\N	1	A2	\N
1745	welcome	adj	\N	\N	1	A2	\N
1746	welcome	v	\N	\N	1	A2	\N
1747	wet	adj	\N	\N	1	A2	\N
1748	wheel	n	\N	\N	1	A2	\N
1749	while	conj	\N	\N	1	A2	\N
1750	whole	adj	\N	\N	1	A2	\N
1751	whose	det	\N	\N	1	A2	\N
1752	whose	pron	\N	\N	1	A2	\N
1753	wide	adj	\N	\N	1	A2	\N
1754	wild	adj	\N	\N	1	A2	\N
1755	wind	n	\N	\N	1	A2	\N
1756	winner	n	\N	\N	1	A2	\N
1757	wish	n	\N	\N	1	A2	\N
1758	wish	v	\N	\N	1	A2	\N
1759	wood	n	\N	\N	1	A2	\N
1760	wooden	adj	\N	\N	1	A2	\N
1761	working	adj	\N	\N	1	A2	\N
1762	worried	adj	\N	\N	1	A2	\N
1763	worry	v	\N	\N	1	A2	\N
1764	worry	n	\N	\N	1	A2	\N
1765	worse	adj	\N	\N	1	A2	\N
1766	worse	adv	\N	\N	1	A2	\N
1767	worst	adj	\N	\N	1	A2	\N
1768	worst	adv	\N	\N	1	A2	\N
1769	wow	interj	\N	\N	1	A2	\N
1770	yet	adv	\N	\N	1	A2	\N
1771	yours	pron	\N	\N	1	A2	\N
1772	zero	num	\N	\N	1	A2	\N
1773	absolutely	adv	\N	\N	1	B1	\N
1774	academic	adj	\N	\N	1	B1	\N
1775	access	n	\N	\N	1	B1	\N
1776	to access	v	\N	\N	1	B1	\N
1777	accommodation	n	\N	\N	1	B1	\N
1778	account	n	\N	\N	1	B1	\N
1779	according to	prep	\N	\N	1	B1	\N
1780	achievement	n	\N	\N	1	B1	\N
1781	ad	n	\N	\N	1	B1	\N
1782	addition	n	\N	\N	1	B1	\N
1783	to admire	v	\N	\N	1	B1	\N
1784	to admit	v	\N	\N	1	B1	\N
1785	advanced	adj	\N	\N	1	B1	\N
1786	to advise	v	\N	\N	1	B1	\N
1787	to afford	v	\N	\N	1	B1	\N
1788	aged	adj	\N	\N	1	B1	\N
1789	agent	n	\N	\N	1	B1	\N
1790	agreement	n	\N	\N	1	B1	\N
1791	ahead	adv	\N	\N	1	B1	\N
1792	aim	n	\N	\N	1	B1	\N
1793	to aim	v	\N	\N	1	B1	\N
1794	alarm	n	\N	\N	1	B1	\N
1795	album	n	\N	\N	1	B1	\N
1796	alcohol	n	\N	\N	1	B1	\N
1797	alcoholic	adj	\N	\N	1	B1	\N
1798	alcoholic	n	\N	\N	1	B1	\N
1799	alternative	adj	\N	\N	1	B1	\N
1800	alternative	n	\N	\N	1	B1	\N
1801	amazed	adj	\N	\N	1	B1	\N
1802	ambition	n	\N	\N	1	B1	\N
1803	ambitious	adj	\N	\N	1	B1	\N
1804	to announce	v	\N	\N	1	B1	\N
1805	announcement	n	\N	\N	1	B1	\N
1806	to annoy	v	\N	\N	1	B1	\N
1807	annoyed	adj	\N	\N	1	B1	\N
1808	annoying	adj	\N	\N	1	B1	\N
1809	apart	adv	\N	\N	1	B1	\N
1810	to apologise	v	\N	\N	1	B1	\N
1811	application	n	\N	\N	1	B1	\N
1812	appointment	n	\N	\N	1	B1	\N
1813	to appreciate	v	\N	\N	1	B1	\N
1814	approximately	adv	\N	\N	1	B1	\N
1815	to arrest	v	\N	\N	1	B1	\N
1816	arrival	n	\N	\N	1	B1	\N
1817	assignment	n	\N	\N	1	B1	\N
1818	to assist	v	\N	\N	1	B1	\N
1819	atmosphere	n	\N	\N	1	B1	\N
1820	to attach	v	\N	\N	1	B1	\N
1821	attitude	n	\N	\N	1	B1	\N
1822	to attract	v	\N	\N	1	B1	\N
1823	attraction	n	\N	\N	1	B1	\N
1824	authority	n	\N	\N	1	B1	\N
1825	average	adj	\N	\N	1	B1	\N
1826	average	n	\N	\N	1	B1	\N
1827	award	n	\N	\N	1	B1	\N
1828	to award	v	\N	\N	1	B1	\N
1829	aware	adj	\N	\N	1	B1	\N
1830	backwards	adv	\N	\N	1	B1	\N
1831	to bake	v	\N	\N	1	B1	\N
1832	balance	n	\N	\N	1	B1	\N
1833	to balance	v	\N	\N	1	B1	\N
1834	ban	n	\N	\N	1	B1	\N
1835	to ban	v	\N	\N	1	B1	\N
1836	bank	n	\N	\N	1	B1	\N
1837	base	n	\N	\N	1	B1	\N
1838	to base	v	\N	\N	1	B1	\N
1839	basic	adj	\N	\N	1	B1	\N
1840	battery	n	\N	\N	1	B1	\N
1841	battle	n	\N	\N	1	B1	\N
1842	beauty	n	\N	\N	1	B1	\N
1843	bee	n	\N	\N	1	B1	\N
1844	behaviour	n	\N	\N	1	B1	\N
1845	belief	n	\N	\N	1	B1	\N
1846	bell	n	\N	\N	1	B1	\N
1847	to bend	v	\N	\N	1	B1	\N
1848	to benefit	v	\N	\N	1	B1	\N
1849	to bite	v	\N	\N	1	B1	\N
1850	block	n	\N	\N	1	B1	\N
1851	to block	v	\N	\N	1	B1	\N
1852	to board	v	\N	\N	1	B1	\N
1853	bomb	n	\N	\N	1	B1	\N
1854	to bomb	v	\N	\N	1	B1	\N
1855	booking	n	\N	\N	1	B1	\N
1856	border	n	\N	\N	1	B1	\N
1857	to bother	v	\N	\N	1	B1	\N
1858	branch	n	\N	\N	1	B1	\N
1859	brand	n	\N	\N	1	B1	\N
1860	brave	adj	\N	\N	1	B1	\N
1861	breath	n	\N	\N	1	B1	\N
1862	to breathe	v	\N	\N	1	B1	\N
1863	breathing	n	\N	\N	1	B1	\N
1864	bride	n	\N	\N	1	B1	\N
1865	bubble	n	\N	\N	1	B1	\N
1866	to burst	v	\N	\N	1	B1	\N
1867	to bury	v	\N	\N	1	B1	\N
1868	calm	adj	\N	\N	1	B1	\N
1869	campaign	n	\N	\N	1	B1	\N
1870	campus	n	\N	\N	1	B1	\N
1871	candidate	n	\N	\N	1	B1	\N
1872	cap	n	\N	\N	1	B1	\N
1873	captain	n	\N	\N	1	B1	\N
1874	career	n	\N	\N	1	B1	\N
1875	careless	adj	\N	\N	1	B1	\N
1876	category	n	\N	\N	1	B1	\N
1877	ceiling	n	\N	\N	1	B1	\N
1878	celebration	n	\N	\N	1	B1	\N
1879	central	adj	\N	\N	1	B1	\N
1880	century	n	\N	\N	1	B1	\N
1881	ceremony	n	\N	\N	1	B1	\N
1882	chain	n	\N	\N	1	B1	\N
1883	challenge	n	\N	\N	1	B1	\N
1884	to challenge	v	\N	\N	1	B1	\N
1885	champion	n	\N	\N	1	B1	\N
1886	channel	n	\N	\N	1	B1	\N
1887	chapter	n	\N	\N	1	B1	\N
1888	charge	n	\N	\N	1	B1	\N
1889	to charge	v	\N	\N	1	B1	\N
1890	to cheat	v	\N	\N	1	B1	\N
1891	cheerful	adj	\N	\N	1	B1	\N
1892	chemical	n	\N	\N	1	B1	\N
1893	chemical	adj	\N	\N	1	B1	\N
1894	chest	n	\N	\N	1	B1	\N
1895	childhood	n	\N	\N	1	B1	\N
1896	claim	n	\N	\N	1	B1	\N
1897	to claim	v	\N	\N	1	B1	\N
1898	click	n	\N	\N	1	B1	\N
1899	to click	v	\N	\N	1	B1	\N
1900	client	n	\N	\N	1	B1	\N
1901	close	adj	\N	\N	1	B1	\N
1902	cloth	n	\N	\N	1	B1	\N
1903	clue	n	\N	\N	1	B1	\N
1904	coach	n	\N	\N	1	B1	\N
1905	coal	n	\N	\N	1	B1	\N
1906	collection	n	\N	\N	1	B1	\N
1907	coloured	adj	\N	\N	1	B1	\N
1908	to combine	v	\N	\N	1	B1	\N
1909	to comment	v	\N	\N	1	B1	\N
1910	commercial	adj	\N	\N	1	B1	\N
1911	commercial	n	\N	\N	1	B1	\N
1912	to commit	v	\N	\N	1	B1	\N
1913	communication	n	\N	\N	1	B1	\N
1914	comparison	n	\N	\N	1	B1	\N
1915	competitor	n	\N	\N	1	B1	\N
1916	competitive	adj	\N	\N	1	B1	\N
1917	complaint	n	\N	\N	1	B1	\N
1918	complex	adj	\N	\N	1	B1	\N
1919	to concentrate	v	\N	\N	1	B1	\N
1920	to conclude	v	\N	\N	1	B1	\N
1921	confident	adj	\N	\N	1	B1	\N
1922	to confirm	v	\N	\N	1	B1	\N
1923	to confuse	v	\N	\N	1	B1	\N
1924	confused	adj	\N	\N	1	B1	\N
1925	connection	n	\N	\N	1	B1	\N
1926	to contact	v	\N	\N	1	B1	\N
1927	contact	n	\N	\N	1	B1	\N
1928	container	n	\N	\N	1	B1	\N
1929	content	n	\N	\N	1	B1	\N
1930	continuous	adj	\N	\N	1	B1	\N
1931	contrast	n	\N	\N	1	B1	\N
1932	to contrast	v	\N	\N	1	B1	\N
1933	convenient	adj	\N	\N	1	B1	\N
1934	to convince	v	\N	\N	1	B1	\N
1935	copper	n	\N	\N	1	B1	\N
1936	costume	n	\N	\N	1	B1	\N
1937	cottage	n	\N	\N	1	B1	\N
1938	cotton	n	\N	\N	1	B1	\N
1939	countryside	n	\N	\N	1	B1	\N
1940	court	n	\N	\N	1	B1	\N
1941	cover	n	\N	\N	1	B1	\N
1942	to cover	v	\N	\N	1	B1	\N
1943	covered	adj	\N	\N	1	B1	\N
1944	to create	v	\N	\N	1	B1	\N
1945	credit	n	\N	\N	1	B1	\N
1946	cruel	adj	\N	\N	1	B1	\N
1947	cultural	adj	\N	\N	1	B1	\N
1948	culture	n	\N	\N	1	B1	\N
1949	currency	n	\N	\N	1	B1	\N
1950	current	adj	\N	\N	1	B1	\N
1951	currently	adv	\N	\N	1	B1	\N
1952	curtain	n	\N	\N	1	B1	\N
1953	custom	n	\N	\N	1	B1	\N
1954	damage	n	\N	\N	1	B1	\N
1955	to damage	v	\N	\N	1	B1	\N
1956	to deal	v	\N	\N	1	B1	\N
1957	decade	n	\N	\N	1	B1	\N
1958	to decorate	v	\N	\N	1	B1	\N
1959	definite	adj	\N	\N	1	B1	\N
1960	to deliver	v	\N	\N	1	B1	\N
1961	departure	n	\N	\N	1	B1	\N
1962	desktop	n	\N	\N	1	B1	\N
1963	despite	prep	\N	\N	1	B1	\N
1964	destination	n	\N	\N	1	B1	\N
1965	determined	adj	\N	\N	1	B1	\N
1966	development	n	\N	\N	1	B1	\N
1967	diagram	n	\N	\N	1	B1	\N
1968	diamond	n	\N	\N	1	B1	\N
1969	difficulty	n	\N	\N	1	B1	\N
1970	direct	adj	\N	\N	1	B1	\N
1971	directly	adv	\N	\N	1	B1	\N
1972	dirt	n	\N	\N	1	B1	\N
1973	disadvantage	n	\N	\N	1	B1	\N
1974	disappointed	adj	\N	\N	1	B1	\N
1975	disappointing	adj	\N	\N	1	B1	\N
1976	discount	n	\N	\N	1	B1	\N
1977	to discuss	v	\N	\N	1	B1	\N
1978	to dislike	v	\N	\N	1	B1	\N
1979	to divide	v	\N	\N	1	B1	\N
1980	documentary	n	\N	\N	1	B1	\N
1981	to donate	v	\N	\N	1	B1	\N
1982	doubt	n	\N	\N	1	B1	\N
1983	to doubt	v	\N	\N	1	B1	\N
1984	dressed	adj	\N	\N	1	B1	\N
1985	drunk	adj	\N	\N	1	B1	\N
1986	due	adj	\N	\N	1	B1	\N
1987	dust	n	\N	\N	1	B1	\N
1988	duty	n	\N	\N	1	B1	\N
1989	earthquake	n	\N	\N	1	B1	\N
1990	eastern	adj	\N	\N	1	B1	\N
1991	economic	adj	\N	\N	1	B1	\N
1992	economy	n	\N	\N	1	B1	\N
1993	edge	n	\N	\N	1	B1	\N
1994	editor	n	\N	\N	1	B1	\N
1995	to educate	v	\N	\N	1	B1	\N
1996	educated	adj	\N	\N	1	B1	\N
1997	educational	adj	\N	\N	1	B1	\N
1998	effect	n	\N	\N	1	B1	\N
1999	effective	adj	\N	\N	1	B1	\N
2000	effectively	adv	\N	\N	1	B1	\N
2001	effort	n	\N	\N	1	B1	\N
2002	election	n	\N	\N	1	B1	\N
2003	embarrassed	adj	\N	\N	1	B1	\N
2004	embarrassing	adj	\N	\N	1	B1	\N
2005	emergency	n	\N	\N	1	B1	\N
2006	emotion	n	\N	\N	1	B1	\N
2007	employment	n	\N	\N	1	B1	\N
2008	to encourage	v	\N	\N	1	B1	\N
2009	enemy	n	\N	\N	1	B1	\N
2010	engaged	adj	\N	\N	1	B1	\N
2011	engineering	n	\N	\N	1	B1	\N
2012	to entertain	v	\N	\N	1	B1	\N
2013	entertainment	n	\N	\N	1	B1	\N
2014	entrance	n	\N	\N	1	B1	\N
2015	entry	n	\N	\N	1	B1	\N
2016	environment	n	\N	\N	1	B1	\N
2017	environmental	adj	\N	\N	1	B1	\N
2018	episode	n	\N	\N	1	B1	\N
2019	equal	adj	\N	\N	1	B1	\N
2020	equally	adv	\N	\N	1	B1	\N
2021	to escape	v	\N	\N	1	B1	\N
2022	essential	adj	\N	\N	1	B1	\N
2023	event	n	\N	\N	1	B1	\N
2024	eventually	adv	\N	\N	1	B1	\N
2025	to examine	v	\N	\N	1	B1	\N
2026	exchange	n	\N	\N	1	B1	\N
2027	to exchange	v	\N	\N	1	B1	\N
2028	excitement	n	\N	\N	1	B1	\N
2029	exhibition	n	\N	\N	1	B1	\N
2030	to expand	v	\N	\N	1	B1	\N
2031	expected	adj	\N	\N	1	B1	\N
2032	expedition	n	\N	\N	1	B1	\N
2033	experienced	adj	\N	\N	1	B1	\N
2034	to explode	v	\N	\N	1	B1	\N
2035	to explore	v	\N	\N	1	B1	\N
2036	explosion	n	\N	\N	1	B1	\N
2037	export	n	\N	\N	1	B1	\N
2038	to export	v	\N	\N	1	B1	\N
2039	to face	v	\N	\N	1	B1	\N
2040	fact	n	\N	\N	1	B1	\N
2041	fairly	adv	\N	\N	1	B1	\N
2042	familiar	adj	\N	\N	1	B1	\N
2043	to fancy	v	\N	\N	1	B1	\N
2044	fascinating	adj	\N	\N	1	B1	\N
2045	fashionable	adj	\N	\N	1	B1	\N
2046	to fasten	v	\N	\N	1	B1	\N
2047	favour	n	\N	\N	1	B1	\N
2048	fear	n	\N	\N	1	B1	\N
2049	to fear	v	\N	\N	1	B1	\N
2050	feature	n	\N	\N	1	B1	\N
2051	to feature	v	\N	\N	1	B1	\N
2052	to feed	v	\N	\N	1	B1	\N
2053	fence	n	\N	\N	1	B1	\N
2054	fighting	n	\N	\N	1	B1	\N
2055	figure	n	\N	\N	1	B1	\N
2056	file	n	\N	\N	1	B1	\N
2057	to file	v	\N	\N	1	B1	\N
2058	financial	adj	\N	\N	1	B1	\N
2059	fine	n	\N	\N	1	B1	\N
2060	fitness	n	\N	\N	1	B1	\N
2061	fixed	adj	\N	\N	1	B1	\N
2062	flash	n	\N	\N	1	B1	\N
2063	flood	n	\N	\N	1	B1	\N
2064	to flood	v	\N	\N	1	B1	\N
2065	flour	n	\N	\N	1	B1	\N
2066	flow	n	\N	\N	1	B1	\N
2067	to flow	v	\N	\N	1	B1	\N
2068	to fold	v	\N	\N	1	B1	\N
2069	folk	n	\N	\N	1	B1	\N
2070	following	adj	\N	\N	1	B1	\N
2071	force	n	\N	\N	1	B1	\N
2072	to force	v	\N	\N	1	B1	\N
2073	forever	adv	\N	\N	1	B1	\N
2074	frame	n	\N	\N	1	B1	\N
2075	to freeze	v	\N	\N	1	B1	\N
2076	frequently	adv	\N	\N	1	B1	\N
2077	friendship	n	\N	\N	1	B1	\N
2078	to frighten	v	\N	\N	1	B1	\N
2079	frightened	adj	\N	\N	1	B1	\N
2080	frightening	adj	\N	\N	1	B1	\N
2081	frozen	adj	\N	\N	1	B1	\N
2082	to fry	v	\N	\N	1	B1	\N
2083	fuel	n	\N	\N	1	B1	\N
2084	function	n	\N	\N	1	B1	\N
2085	to function	v	\N	\N	1	B1	\N
2086	fur	n	\N	\N	1	B1	\N
2087	further	adv	\N	\N	1	B1	\N
2088	garage	n	\N	\N	1	B1	\N
2089	to gather	v	\N	\N	1	B1	\N
2090	generally	adv	\N	\N	1	B1	\N
2091	generation	n	\N	\N	1	B1	\N
2092	generous	adj	\N	\N	1	B1	\N
2093	gentle	adj	\N	\N	1	B1	\N
2094	gentleman	n	\N	\N	1	B1	\N
2095	ghost	n	\N	\N	1	B1	\N
2096	giant	n	\N	\N	1	B1	\N
2097	giant	adj	\N	\N	1	B1	\N
2098	gig	n	\N	\N	1	B1	\N
2099	glad	adj	\N	\N	1	B1	\N
2100	global	adj	\N	\N	1	B1	\N
2101	glove	n	\N	\N	1	B1	\N
2102	goods	n	\N	\N	1	B1	\N
2103	grade	n	\N	\N	1	B1	\N
2104	to graduate	v	\N	\N	1	B1	\N
2105	grain	n	\N	\N	1	B1	\N
2106	grateful	adj	\N	\N	1	B1	\N
2107	growth	n	\N	\N	1	B1	\N
2108	guard	n	\N	\N	1	B1	\N
2109	to guard	v	\N	\N	1	B1	\N
2110	guilty	adj	\N	\N	1	B1	\N
2111	to hang	v	\N	\N	1	B1	\N
2112	happiness	n	\N	\N	1	B1	\N
2113	hardly	adv	\N	\N	1	B1	\N
2114	headline	n	\N	\N	1	B1	\N
2115	heating	n	\N	\N	1	B1	\N
2116	heavily	adv	\N	\N	1	B1	\N
2117	helicopter	n	\N	\N	1	B1	\N
2118	to highlight	v	\N	\N	1	B1	\N
2119	highly	adv	\N	\N	1	B1	\N
2120	to hire	v	\N	\N	1	B1	\N
2121	hint	n	\N	\N	1	B1	\N
2122	to hint	v	\N	\N	1	B1	\N
2123	historic	adj	\N	\N	1	B1	\N
2124	historical	adj	\N	\N	1	B1	\N
2125	honest	adj	\N	\N	1	B1	\N
2126	honey	n	\N	\N	1	B1	\N
2127	horrible	adj	\N	\N	1	B1	\N
2128	horror	n	\N	\N	1	B1	\N
2129	host	n	\N	\N	1	B1	\N
2130	to host	v	\N	\N	1	B1	\N
2131	however	adv	\N	\N	1	B1	\N
2132	to hunt	v	\N	\N	1	B1	\N
2133	hurricane	n	\N	\N	1	B1	\N
2134	ignorant	adj	\N	\N	1	B1	\N
2135	to ignore	v	\N	\N	1	B1	\N
2136	illegal	adj	\N	\N	1	B1	\N
2137	to imagine	v	\N	\N	1	B1	\N
2138	imaginary	adj	\N	\N	1	B1	\N
2139	immediate	adj	\N	\N	1	B1	\N
2140	immigrant	n	\N	\N	1	B1	\N
2141	impact	n	\N	\N	1	B1	\N
2142	import	n	\N	\N	1	B1	\N
2143	to import	v	\N	\N	1	B1	\N
2144	importance	n	\N	\N	1	B1	\N
2145	impression	n	\N	\N	1	B1	\N
2146	impressive	adj	\N	\N	1	B1	\N
2147	to improve	v	\N	\N	1	B1	\N
2148	improvement	n	\N	\N	1	B1	\N
2149	incredibly	adv	\N	\N	1	B1	\N
2150	indeed	adv	\N	\N	1	B1	\N
2151	to indicate	v	\N	\N	1	B1	\N
2152	indirect	adj	\N	\N	1	B1	\N
2153	indoor	adj	\N	\N	1	B1	\N
2154	indoors	adv	\N	\N	1	B1	\N
2155	infant	n	\N	\N	1	B1	\N
2156	influence	n	\N	\N	1	B1	\N
2157	to influence	v	\N	\N	1	B1	\N
2158	ingredient	n	\N	\N	1	B1	\N
2159	to injure	v	\N	\N	1	B1	\N
2160	injured	adj	\N	\N	1	B1	\N
2161	innocent	adj	\N	\N	1	B1	\N
2162	intelligence	n	\N	\N	1	B1	\N
2163	to intend	v	\N	\N	1	B1	\N
2164	intention	n	\N	\N	1	B1	\N
2165	to invest	v	\N	\N	1	B1	\N
2166	to investigate	v	\N	\N	1	B1	\N
2167	involved	adj	\N	\N	1	B1	\N
2168	iron	n	\N	\N	1	B1	\N
2169	to iron	v	\N	\N	1	B1	\N
2170	issue	n	\N	\N	1	B1	\N
2171	IT	n	\N	\N	1	B1	\N
2172	journal	n	\N	\N	1	B1	\N
2173	judge	n	\N	\N	1	B1	\N
2174	to judge	v	\N	\N	1	B1	\N
2175	keen	adj	\N	\N	1	B1	\N
2176	key	adj	\N	\N	1	B1	\N
2177	keyboard	n	\N	\N	1	B1	\N
2178	to kick	v	\N	\N	1	B1	\N
2179	killing	n	\N	\N	1	B1	\N
2180	kind	adj	\N	\N	1	B1	\N
2181	kingdom	n	\N	\N	1	B1	\N
2182	label	n	\N	\N	1	B1	\N
2183	to label	v	\N	\N	1	B1	\N
2184	laboratory	n	\N	\N	1	B1	\N
2185	lack	n	\N	\N	1	B1	\N
2186	to lack	v	\N	\N	1	B1	\N
2187	latest	adj	\N	\N	1	B1	\N
2188	to lay	v	\N	\N	1	B1	\N
2189	layer	n	\N	\N	1	B1	\N
2190	lead	n	\N	\N	1	B1	\N
2191	leading	adj	\N	\N	1	B1	\N
2192	leaf	n	\N	\N	1	B1	\N
2193	leather	n	\N	\N	1	B1	\N
2194	legal	adj	\N	\N	1	B1	\N
2195	leisure	n	\N	\N	1	B1	\N
2196	length	n	\N	\N	1	B1	\N
2197	level	n	\N	\N	1	B1	\N
2198	to level	v	\N	\N	1	B1	\N
2199	to lie	v	\N	\N	1	B1	\N
2200	limit	n	\N	\N	1	B1	\N
2201	to limit	v	\N	\N	1	B1	\N
2202	lip	n	\N	\N	1	B1	\N
2203	liquid	n	\N	\N	1	B1	\N
2204	literature	n	\N	\N	1	B1	\N
2205	living	n	\N	\N	1	B1	\N
2206	living	adj	\N	\N	1	B1	\N
2207	to locate	v	\N	\N	1	B1	\N
2208	located	adj	\N	\N	1	B1	\N
2209	location	n	\N	\N	1	B1	\N
2210	log	n	\N	\N	1	B1	\N
2211	lonely	adj	\N	\N	1	B1	\N
2212	loss	n	\N	\N	1	B1	\N
2213	luxury	n	\N	\N	1	B1	\N
2214	mad	adj	\N	\N	1	B1	\N
2215	magic	n	\N	\N	1	B1	\N
2216	mainly	adv	\N	\N	1	B1	\N
2217	mall	n	\N	\N	1	B1	\N
2218	management	n	\N	\N	1	B1	\N
2219	marketing	n	\N	\N	1	B1	\N
2220	marriage	n	\N	\N	1	B1	\N
2221	material	n	\N	\N	1	B1	\N
2222	meanwhile	adv	\N	\N	1	B1	\N
2223	measure	n	\N	\N	1	B1	\N
2224	to measure	v	\N	\N	1	B1	\N
2225	medium	adj	\N	\N	1	B1	\N
2226	mental	adj	\N	\N	1	B1	\N
2227	mess	n	\N	\N	1	B1	\N
2228	mild	adj	\N	\N	1	B1	\N
2229	mill	n	\N	\N	1	B1	\N
2230	mine	n	\N	\N	1	B1	\N
2231	to mix	v	\N	\N	1	B1	\N
2232	mixture	n	\N	\N	1	B1	\N
2233	model	n	\N	\N	1	B1	\N
2234	mood	n	\N	\N	1	B1	\N
2235	mud	n	\N	\N	1	B1	\N
2236	murder	n	\N	\N	1	B1	\N
2237	to murder	v	\N	\N	1	B1	\N
2238	muscle	n	\N	\N	1	B1	\N
2239	mystery	n	\N	\N	1	B1	\N
2240	nail	n	\N	\N	1	B1	\N
2241	narrative	n	\N	\N	1	B1	\N
2242	nation	n	\N	\N	1	B1	\N
2243	native	adj / n	\N	\N	1	B1	\N
2244	naturally	adv	\N	\N	1	B1	\N
2245	necessarily	adv	\N	\N	1	B1	\N
2246	needle	n	\N	\N	1	B1	\N
2247	negative	adj	\N	\N	1	B1	\N
2248	neighbourhood	n	\N	\N	1	B1	\N
2249	neither	conj / det / pron	\N	\N	1	B1	\N
2250	net	n	\N	\N	1	B1	\N
2251	nor	conj	\N	\N	1	B1	\N
2252	normal	adj / n	\N	\N	1	B1	\N
2253	northern	adj	\N	\N	1	B1	\N
2254	to note	v	\N	\N	1	B1	\N
2255	nuclear	adj	\N	\N	1	B1	\N
2256	obvious	adj	\N	\N	1	B1	\N
2257	obviously	adv	\N	\N	1	B1	\N
2258	occasion	n	\N	\N	1	B1	\N
2259	to occur	v	\N	\N	1	B1	\N
2260	odd	adj	\N	\N	1	B1	\N
2261	official	adj	\N	\N	1	B1	\N
2262	old-fashioned	adj	\N	\N	1	B1	\N
2263	once	conj	\N	\N	1	B1	\N
2264	opinion	n	\N	\N	1	B1	\N
2265	operation	n	\N	\N	1	B1	\N
2266	opportunity	n	\N	\N	1	B1	\N
2267	organised	adj	\N	\N	1	B1	\N
2268	organiser	n	\N	\N	1	B1	\N
2269	original	adj	\N	\N	1	B1	\N
2270	originally	adv	\N	\N	1	B1	\N
2271	ought to	v	\N	\N	1	B1	\N
2272	ours	pron	\N	\N	1	B1	\N
2273	outdoor	adj	\N	\N	1	B1	\N
2274	outdoors	adv	\N	\N	1	B1	\N
2275	package	n	\N	\N	1	B1	\N
2276	pad	n	\N	\N	1	B1	\N
2277	painful	adj	\N	\N	1	B1	\N
2278	pale	adj	\N	\N	1	B1	\N
2279	pan	n	\N	\N	1	B1	\N
2280	to participate	v	\N	\N	1	B1	\N
2281	particularly	adv	\N	\N	1	B1	\N
2282	passion	n	\N	\N	1	B1	\N
2283	path	n	\N	\N	1	B1	\N
2284	payment	n	\N	\N	1	B1	\N
2285	peaceful	adj	\N	\N	1	B1	\N
2286	percentage	n	\N	\N	1	B1	\N
2287	perfectly	adv	\N	\N	1	B1	\N
2288	performance	n	\N	\N	1	B1	\N
2289	personally	adv	\N	\N	1	B1	\N
2290	pessimistic	adj	\N	\N	1	B1	\N
2291	to persuade	v	\N	\N	1	B1	\N
2292	photographer	n	\N	\N	1	B1	\N
2293	photography	n	\N	\N	1	B1	\N
2294	pin	n	\N	\N	1	B1	\N
2295	to pin	v	\N	\N	1	B1	\N
2296	pipe	n	\N	\N	1	B1	\N
2297	planning	n	\N	\N	1	B1	\N
2298	pleasant	adj	\N	\N	1	B1	\N
2299	pleasure	n	\N	\N	1	B1	\N
2300	plenty	pron	\N	\N	1	B1	\N
2301	plot	n	\N	\N	1	B1	\N
2302	plus	prep / conj	\N	\N	1	B1	\N
2303	poem	n	\N	\N	1	B1	\N
2304	poet	n	\N	\N	1	B1	\N
2305	poetry	n	\N	\N	1	B1	\N
2306	to point	v	\N	\N	1	B1	\N
2307	poison	n	\N	\N	1	B1	\N
2308	to poison	v	\N	\N	1	B1	\N
2309	poisonous	adj	\N	\N	1	B1	\N
2310	policy	n	\N	\N	1	B1	\N
2311	political	adj	\N	\N	1	B1	\N
2312	politician	n	\N	\N	1	B1	\N
2313	politics	n	\N	\N	1	B1	\N
2314	port	n	\N	\N	1	B1	\N
2315	portrait	n	\N	\N	1	B1	\N
2316	position	n	\N	\N	1	B1	\N
2317	positive	adj	\N	\N	1	B1	\N
2318	possibly	adv	\N	\N	1	B1	\N
2319	pot	n	\N	\N	1	B1	\N
2320	to pour	v	\N	\N	1	B1	\N
2321	poverty	n	\N	\N	1	B1	\N
2322	powder	n	\N	\N	1	B1	\N
2323	power	n	\N	\N	1	B1	\N
2324	powerful	adj	\N	\N	1	B1	\N
2325	practical	adj	\N	\N	1	B1	\N
2326	to pray	v	\N	\N	1	B1	\N
2327	prayer	n	\N	\N	1	B1	\N
2328	qualification	n	\N	\N	1	B1	\N
2329	qualified	adj	\N	\N	1	B1	\N
2330	to qualify	v	\N	\N	1	B1	\N
2331	queue	n	\N	\N	1	B1	\N
2332	to queue	v	\N	\N	1	B1	\N
2333	to quit	v	\N	\N	1	B1	\N
2334	quotation	n	\N	\N	1	B1	\N
2335	quote	n	\N	\N	1	B1	\N
2336	to quote	v	\N	\N	1	B1	\N
2337	race	n	\N	\N	1	B1	\N
2338	racing	n	\N	\N	1	B1	\N
2339	range	n	\N	\N	1	B1	\N
2340	rare	adj	\N	\N	1	B1	\N
2341	rarely	adv	\N	\N	1	B1	\N
2342	reaction	n	\N	\N	1	B1	\N
2343	reality	n	\N	\N	1	B1	\N
2344	receipt	n	\N	\N	1	B1	\N
2345	recommendation	n	\N	\N	1	B1	\N
2346	reference	n	\N	\N	1	B1	\N
2347	to reflect	v	\N	\N	1	B1	\N
2348	regularly	adv	\N	\N	1	B1	\N
2349	to reject	v	\N	\N	1	B1	\N
2350	to relate	v	\N	\N	1	B1	\N
2351	related	adj	\N	\N	1	B1	\N
2352	relation	n	\N	\N	1	B1	\N
2353	relative	n	\N	\N	1	B1	\N
2354	relaxed	adj	\N	\N	1	B1	\N
2355	relaxing	adj	\N	\N	1	B1	\N
2356	to release	v	\N	\N	1	B1	\N
2357	reliable	adj	\N	\N	1	B1	\N
2358	religion	n	\N	\N	1	B1	\N
2359	religious	adj	\N	\N	1	B1	\N
2360	to remain	v	\N	\N	1	B1	\N
2361	to remind	v	\N	\N	1	B1	\N
2362	remote	adj	\N	\N	1	B1	\N
2363	rent	n	\N	\N	1	B1	\N
2364	to rent	v	\N	\N	1	B1	\N
2365	repeated	adj	\N	\N	1	B1	\N
2366	to represent	v	\N	\N	1	B1	\N
2367	to require	v	\N	\N	1	B1	\N
2368	reservation	n	\N	\N	1	B1	\N
2369	resource	n	\N	\N	1	B1	\N
2370	respect	n	\N	\N	1	B1	\N
2371	to respect	v	\N	\N	1	B1	\N
2372	response	n	\N	\N	1	B1	\N
2373	responsibility	n	\N	\N	1	B1	\N
2374	responsible	adj	\N	\N	1	B1	\N
2375	result	n	\N	\N	1	B1	\N
2376	to retire	v	\N	\N	1	B1	\N
2377	retired	adj	\N	\N	1	B1	\N
2378	to revise	v	\N	\N	1	B1	\N
2379	rifle	n	\N	\N	1	B1	\N
2380	to rise	v	\N	\N	1	B1	\N
2381	risk	n	\N	\N	1	B1	\N
2382	to risk	v	\N	\N	1	B1	\N
2383	robot	n	\N	\N	1	B1	\N
2384	to roll	v	\N	\N	1	B1	\N
2385	romantic	adj	\N	\N	1	B1	\N
2386	rope	n	\N	\N	1	B1	\N
2387	rough	adj	\N	\N	1	B1	\N
2388	row	n	\N	\N	1	B1	\N
2389	royal	adj	\N	\N	1	B1	\N
2390	rugby	n	\N	\N	1	B1	\N
2391	to rule	v	\N	\N	1	B1	\N
2392	safety	n	\N	\N	1	B1	\N
2393	sailor	n	\N	\N	1	B1	\N
2394	sample	n	\N	\N	1	B1	\N
2395	sand	n	\N	\N	1	B1	\N
2396	to scan	v	\N	\N	1	B1	\N
2397	scientific	adj	\N	\N	1	B1	\N
2398	script	n	\N	\N	1	B1	\N
2399	sculpture	n	\N	\N	1	B1	\N
2400	secondary	adj	\N	\N	1	B1	\N
2401	security	n	\N	\N	1	B1	\N
2402	seed	n	\N	\N	1	B1	\N
2403	sensible	adj	\N	\N	1	B1	\N
2404	to separate	v	\N	\N	1	B1	\N
2405	seriously	adv	\N	\N	1	B1	\N
2406	servant	n	\N	\N	1	B1	\N
2407	to set	v	\N	\N	1	B1	\N
2408	set	n	\N	\N	1	B1	\N
2409	setting	n	\N	\N	1	B1	\N
2410	sex	n	\N	\N	1	B1	\N
2411	sexual	adj	\N	\N	1	B1	\N
2412	sharp	adj	\N	\N	1	B1	\N
2413	shelf	n	\N	\N	1	B1	\N
2414	shell	n	\N	\N	1	B1	\N
2415	shift	n	\N	\N	1	B1	\N
2416	to shift	v	\N	\N	1	B1	\N
2417	to shine	v	\N	\N	1	B1	\N
2418	shiny	adj	\N	\N	1	B1	\N
2419	to shoot	v	\N	\N	1	B1	\N
2420	shock	n	\N	\N	1	B1	\N
2421	to shock	v	\N	\N	1	B1	\N
2422	shot	n	\N	\N	1	B1	\N
2423	shy	adj	\N	\N	1	B1	\N
2424	sight	n	\N	\N	1	B1	\N
2425	signal	n	\N	\N	1	B1	\N
2426	silent	adj	\N	\N	1	B1	\N
2427	silly	adj	\N	\N	1	B1	\N
2428	similarity	n	\N	\N	1	B1	\N
2429	similarly	adv	\N	\N	1	B1	\N
2430	simply	adv	\N	\N	1	B1	\N
2431	since	conj	\N	\N	1	B1	\N
2432	to sink	v	\N	\N	1	B1	\N
2433	skill	n	\N	\N	1	B1	\N
2434	to skip	v	\N	\N	1	B1	\N
2435	to slam	v	\N	\N	1	B1	\N
2436	to slap	v	\N	\N	1	B1	\N
2437	slice	n	\N	\N	1	B1	\N
2438	to slice	v	\N	\N	1	B1	\N
2439	slightly	adv	\N	\N	1	B1	\N
2440	smart	adj	\N	\N	1	B1	\N
2441	smooth	adj	\N	\N	1	B1	\N
2442	society	n	\N	\N	1	B1	\N
2443	software	n	\N	\N	1	B1	\N
2444	soil	n	\N	\N	1	B1	\N
2445	solid	adj	\N	\N	1	B1	\N
2446	to solve	v	\N	\N	1	B1	\N
2447	to sort	v	\N	\N	1	B1	\N
2448	southern	adj	\N	\N	1	B1	\N
2449	spam	n	\N	\N	1	B1	\N
2450	specifically	adv	\N	\N	1	B1	\N
2451	speed	n	\N	\N	1	B1	\N
2452	spending	n	\N	\N	1	B1	\N
2453	spicy	adj	\N	\N	1	B1	\N
2454	spirit	n	\N	\N	1	B1	\N
2455	spoken	adj	\N	\N	1	B1	\N
2456	spot	n	\N	\N	1	B1	\N
2457	to spot	v	\N	\N	1	B1	\N
2458	to spread	v	\N	\N	1	B1	\N
2459	spring	n	\N	\N	1	B1	\N
2460	spy	n	\N	\N	1	B1	\N
2461	to spy	v	\N	\N	1	B1	\N
2462	stadium	n	\N	\N	1	B1	\N
2463	staff	n	\N	\N	1	B1	\N
2464	standard	n	\N	\N	1	B1	\N
2465	standard	adj	\N	\N	1	B1	\N
2466	to state	v	\N	\N	1	B1	\N
2467	statue	n	\N	\N	1	B1	\N
2468	to stick	v	\N	\N	1	B1	\N
2469	stick	n	\N	\N	1	B1	\N
2470	to store	v	\N	\N	1	B1	\N
2471	stranger	n	\N	\N	1	B1	\N
2472	strength	n	\N	\N	1	B1	\N
2473	string	n	\N	\N	1	B1	\N
2474	strongly	adv	\N	\N	1	B1	\N
2475	studio	n	\N	\N	1	B1	\N
2476	stuff	n	\N	\N	1	B1	\N
2477	successfully	adv	\N	\N	1	B1	\N
2478	sudden	adj	\N	\N	1	B1	\N
2479	to suffer	v	\N	\N	1	B1	\N
2480	to suit	v	\N	\N	1	B1	\N
2481	suitable	adj	\N	\N	1	B1	\N
2482	success	n	\N	\N	1	B1	\N
2483	to summarise	v	\N	\N	1	B1	\N
2484	summary	n	\N	\N	1	B1	\N
2485	supply	n	\N	\N	1	B1	\N
2486	to supply	v	\N	\N	1	B1	\N
2487	supporter	n	\N	\N	1	B1	\N
2488	surely	adv	\N	\N	1	B1	\N
2489	surface	n	\N	\N	1	B1	\N
2490	to survive	v	\N	\N	1	B1	\N
2491	survey	n	\N	\N	1	B1	\N
2492	switch	n	\N	\N	1	B1	\N
2493	to switch	v	\N	\N	1	B1	\N
2494	sword	n	\N	\N	1	B1	\N
2495	symptom	n	\N	\N	1	B1	\N
2496	tail	n	\N	\N	1	B1	\N
2497	talent	n	\N	\N	1	B1	\N
2498	talented	adj	\N	\N	1	B1	\N
2499	tape	n	\N	\N	1	B1	\N
2500	tax	n	\N	\N	1	B1	\N
2501	technical	adj	\N	\N	1	B1	\N
2502	technique	n	\N	\N	1	B1	\N
2503	to tend	v	\N	\N	1	B1	\N
2504	theme	n	\N	\N	1	B1	\N
2505	though	adv / conj	\N	\N	1	B1	\N
2506	throat	n	\N	\N	1	B1	\N
2507	throughout	prep / adv	\N	\N	1	B1	\N
2508	tight	adj	\N	\N	1	B1	\N
2509	till	conj / prep	\N	\N	1	B1	\N
2510	tin	n	\N	\N	1	B1	\N
2511	tiny	adj	\N	\N	1	B1	\N
2512	tongue	n	\N	\N	1	B1	\N
2513	topic	n	\N	\N	1	B1	\N
2514	total	adj / n	\N	\N	1	B1	\N
2515	totally	adv	\N	\N	1	B1	\N
2516	trade	n / v	\N	\N	1	B1	\N
2517	trailer	n	\N	\N	1	B1	\N
2518	to translate	v	\N	\N	1	B1	\N
2519	translation	n	\N	\N	1	B1	\N
2520	to treat	v	\N	\N	1	B1	\N
2521	treatment	n	\N	\N	1	B1	\N
2522	trend	n	\N	\N	1	B1	\N
2523	trick	n / v	\N	\N	1	B1	\N
2524	truth	n	\N	\N	1	B1	\N
2525	tube	n	\N	\N	1	B1	\N
2526	to type	v	\N	\N	1	B1	\N
2527	typically	adv	\N	\N	1	B1	\N
2528	tyre	n	\N	\N	1	B1	\N
2529	ugly	adj	\N	\N	1	B1	\N
2530	unable	adj	\N	\N	1	B1	\N
2531	uncomfortable	adj	\N	\N	1	B1	\N
2532	underwear	n	\N	\N	1	B1	\N
2533	unemployed	adj	\N	\N	1	B1	\N
2534	unemployment	n	\N	\N	1	B1	\N
2535	unfair	adj	\N	\N	1	B1	\N
2536	union	n	\N	\N	1	B1	\N
2537	unless	conj	\N	\N	1	B1	\N
2538	unlike	prep	\N	\N	1	B1	\N
2539	unlikely	adj	\N	\N	1	B1	\N
2540	unnecessary	adj	\N	\N	1	B1	\N
2541	unpleasant	adj	\N	\N	1	B1	\N
2542	to update	v	\N	\N	1	B1	\N
2543	upon	prep	\N	\N	1	B1	\N
2544	to upset	v	\N	\N	1	B1	\N
2545	used	adj	\N	\N	1	B1	\N
2546	valuable	adj	\N	\N	1	B1	\N
2547	value	n	\N	\N	1	B1	\N
2548	various	adj	\N	\N	1	B1	\N
2549	vehicle	n	\N	\N	1	B1	\N
2550	version	n	\N	\N	1	B1	\N
2551	victim	n	\N	\N	1	B1	\N
2552	violent	adj	\N	\N	1	B1	\N
2553	volunteer	n / v	\N	\N	1	B1	\N
2554	vote	n / v	\N	\N	1	B1	\N
2555	warn	v	\N	\N	1	B1	\N
2556	warning	n	\N	\N	1	B1	\N
2557	waste	n / v	\N	\N	1	B1	\N
2558	weapon	n	\N	\N	1	B1	\N
2559	weigh	v	\N	\N	1	B1	\N
2560	western	adj	\N	\N	1	B1	\N
2561	whatever	det / pron	\N	\N	1	B1	\N
2562	whenever	conj	\N	\N	1	B1	\N
2563	whether	conj	\N	\N	1	B1	\N
2564	while	conj	\N	\N	1	B1	\N
2565	wing	n	\N	\N	1	B1	\N
2566	within	prep	\N	\N	1	B1	\N
2567	wonder	v	\N	\N	1	B1	\N
2568	wool	n	\N	\N	1	B1	\N
2569	worldwide	adj / adv	\N	\N	1	B1	\N
2570	worth	adj	\N	\N	1	B1	\N
2571	wrinkle	n	\N	\N	1	B1	\N
2572	written	adj	\N	\N	1	B1	\N
2573	yard	n	\N	\N	1	B1	\N
2574	yell	v	\N	\N	1	B1	\N
2575	youth	n	\N	\N	1	B1	\N
100000	ένας	det	\N	\N	2	A1	ο
100001	μία	det	\N	\N	2	A1	η
100002	ένα	det	\N	\N	2	A1	το
100003	σχετικά με	prep	\N	\N	2	A1	\N
100004	περίπου	adv	\N	\N	2	A1	\N
100005	πάνω από	prep	\N	\N	2	A1	\N
100006	απέναντι	prep	\N	\N	2	A1	\N
100007	διά μέσου	prep	\N	\N	2	A1	\N
100008	δράση	n	\N	\N	2	A1	η
100009	ενέργεια	n	\N	\N	2	A1	η
100010	δραστηριότητα	n	\N	\N	2	A1	η
100011	ηθοποιός	n	\N	\N	2	A1	ο/η
100012	προσθέτω	v	\N	\N	2	A1	\N
100013	διεύθυνση	n	\N	\N	2	A1	η
100014	ενήλικας	n	\N	\N	2	A1	ο/η
100015	φοβισμένος	adj	\N	\N	2	A1	\N
100016	μετά	prep	\N	\N	2	A1	\N
100017	απόγευμα	n	\N	\N	2	A1	το
100018	ξανά	adv	\N	\N	2	A1	\N
100019	πάλι	adv	\N	\N	2	A1	\N
100020	ηλικία	n	\N	\N	2	A1	η
100021	πριν	adv	\N	\N	2	A1	\N
100022	αέρας	n	\N	\N	2	A1	ο
100023	αεροδρόμιο	n	\N	\N	2	A1	το
100024	όλος	det	\N	\N	2	A1	ο
100025	όλη	det	\N	\N	2	A1	η
100026	όλο	det	\N	\N	2	A1	το
100027	εντάξει	adj	\N	\N	2	A1	\N
100028	επίσης	adv	\N	\N	2	A1	\N
100029	πάντα	adv	\N	\N	2	A1	\N
100030	εκπληκτικός	adj	\N	\N	2	A1	\N
100031	φανταστικός	adj	\N	\N	2	A1	\N
100032	και	conj	\N	\N	2	A1	\N
100033	θυμωμένος	adj	\N	\N	2	A1	\N
100034	ζώο	n	\N	\N	2	A1	το
100035	άλλος	det	\N	\N	2	A1	ο
100036	άλλη	det	\N	\N	2	A1	η
100037	άλλο	det	\N	\N	2	A1	το
100038	απάντηση	n	\N	\N	2	A1	η
100039	οποιοσδήποτε	det	\N	\N	2	A1	\N
100040	κανένας	pron	\N	\N	2	A1	\N
100041	οποιοσδήποτε	pron	\N	\N	2	A1	\N
100042	οτιδήποτε	pron	\N	\N	2	A1	\N
100043	τίποτα	pron	\N	\N	2	A1	\N
100044	διαμέρισμα	n	\N	\N	2	A1	το
100045	μήλο	n	\N	\N	2	A1	το
100046	Απρίλιος	n	\N	\N	2	A1	ο
100047	περιοχή	n	\N	\N	2	A1	η
100048	χέρι	n	\N	\N	2	A1	το
100049	βραχίονας	n	\N	\N	2	A1	ο
100050	γύρω	prep	\N	\N	2	A1	\N
100051	φτάνω	v	\N	\N	2	A1	\N
100052	τέχνη	n	\N	\N	2	A1	η
100053	άρθρο	n	\N	\N	2	A1	το
100054	καλλιτέχνης	n	\N	\N	2	A1	ο/η
100055	ως	prep	\N	\N	2	A1	\N
100056	σαν	prep	\N	\N	2	A1	\N
100057	ρωτάω	v	\N	\N	2	A1	\N
100058	ζητάω	v	\N	\N	2	A1	\N
100059	σε	prep	\N	\N	2	A1	\N
100060	στον	prep	\N	\N	2	A1	\N
100061	στην	prep	\N	\N	2	A1	\N
100062	στο	prep	\N	\N	2	A1	\N
100063	Αύγουστος	n	\N	\N	2	A1	ο
100064	θεία	n	\N	\N	2	A1	η
100065	φθινόπωρο	n	\N	\N	2	A1	το
100066	μακριά	adv	\N	\N	2	A1	\N
100067	μωρό	n	\N	\N	2	A1	το
100068	πίσω	adv	\N	\N	2	A1	\N
100069	κακός	adj	\N	\N	2	A1	\N
100070	τσάντα	n	\N	\N	2	A1	η
100071	μπάλα	n	\N	\N	2	A1	η
100072	μπανάνα	n	\N	\N	2	A1	η
100073	συγκρότημα	n	\N	\N	2	A1	το
100074	μπάντα	n	\N	\N	2	A1	η
100075	τράπεζα	n	\N	\N	2	A1	η
100076	μπαρ	n	\N	\N	2	A1	το
100077	μπάνιο	n	\N	\N	2	A1	το
100078	λουτρό	n	\N	\N	2	A1	το
100079	είμαι	v	\N	\N	2	A1	\N
100080	παραλία	n	\N	\N	2	A1	η
100081	όμορφος	adj	\N	\N	2	A1	\N
100082	επειδή	conj	\N	\N	2	A1	\N
100083	γίνομαι	v	\N	\N	2	A1	\N
100084	κρεβάτι	n	\N	\N	2	A1	το
100085	υπνοδωμάτιο	n	\N	\N	2	A1	το
100086	μπίρα	n	\N	\N	2	A1	η
100087	αρχίζω	v	\N	\N	2	A1	\N
100088	αρχή	n	\N	\N	2	A1	η
100089	πίσω από	prep	\N	\N	2	A1	\N
100090	πιστεύω	v	\N	\N	2	A1	\N
100091	κάτω από	prep	\N	\N	2	A1	\N
100092	καλύτερος	adj	\N	\N	2	A1	\N
100093	ανάμεσα σε	prep	\N	\N	2	A1	\N
100094	ποδήλατο	n	\N	\N	2	A1	το
100095	μεγάλος	adj	\N	\N	2	A1	\N
100096	καφετέρια	n	\N	\N	2	A1	η
100097	κέικ	n	\N	\N	2	A1	το
100098	τούρτα	n	\N	\N	2	A1	η
100099	καλώ	v	\N	\N	2	A1	\N
100100	τηλεφωνώ	v	\N	\N	2	A1	\N
100101	φωτογραφική μηχανή	n	\N	\N	2	A1	η
100102	μπορώ	v	\N	\N	2	A1	\N
100103	αυτοκίνητο	n	\N	\N	2	A1	το
100104	κάρτα	n	\N	\N	2	A1	η
100105	καρότο	n	\N	\N	2	A1	το
100106	κουβαλάω	v	\N	\N	2	A1	\N
100107	μεταφέρω	v	\N	\N	2	A1	\N
100108	γάτα	n	\N	\N	2	A1	η
100109	CD	n	\N	\N	2	A1	το
100110	σεντ	n	\N	\N	2	A1	το
100111	κέντρο	n	\N	\N	2	A1	το
100112	καρέκλα	n	\N	\N	2	A1	η
100113	αλλάζω	v	\N	\N	2	A1	\N
100114	πίνακας	n	\N	\N	2	A1	ο
100115	διάγραμμα	n	\N	\N	2	A1	το
100116	φθηνός	adj	\N	\N	2	A1	\N
100117	ελέγχω	v	\N	\N	2	A1	\N
100118	τυρί	n	\N	\N	2	A1	το
100119	κοτόπουλο	n	\N	\N	2	A1	το
100120	παιδί	n	\N	\N	2	A1	το
100121	σοκολάτα	n	\N	\N	2	A1	η
100122	επιλέγω	v	\N	\N	2	A1	\N
100123	διαλέγω	v	\N	\N	2	A1	\N
100124	κινηματογράφος	n	\N	\N	2	A1	ο
100125	σινεμά	n	\N	\N	2	A1	το
100126	πόλη	n	\N	\N	2	A1	η
100127	τάξη	n	\N	\N	2	A1	η
100128	αίθουσα	n	\N	\N	2	A1	η
100129	καθαρός	adj	\N	\N	2	A1	\N
100130	σκαρφαλώνω	v	\N	\N	2	A1	\N
100131	ρολόι	n	\N	\N	2	A1	το
100132	κλείνω	v	\N	\N	2	A1	\N
100133	ρούχα	n	\N	\N	2	A1	τα
100134	κλαμπ	n	\N	\N	2	A1	το
100135	σύλλογος	n	\N	\N	2	A1	ο
100136	παλτό	n	\N	\N	2	A1	το
100137	καφές	n	\N	\N	2	A1	ο
100138	κρύος	adj	\N	\N	2	A1	\N
100139	κολέγιο	n	\N	\N	2	A1	το
100140	χρώμα	n	\N	\N	2	A1	το
100141	έρχομαι	v	\N	\N	2	A1	\N
100142	εταιρεία	n	\N	\N	2	A1	η
100143	συμπληρώνω	v	\N	\N	2	A1	\N
100144	ολοκληρώνω	v	\N	\N	2	A1	\N
100145	υπολογιστής	n	\N	\N	2	A1	ο
100146	συναυλία	n	\N	\N	2	A1	η
100147	μαγειρεύω	v	\N	\N	2	A1	\N
100148	μαγειρική	n	\N	\N	2	A1	η
100149	δροσερός	adj	\N	\N	2	A1	\N
100150	σωστός	adj	\N	\N	2	A1	\N
100151	κοστίζω	v	\N	\N	2	A1	\N
100152	θα μπορούσα	v	\N	\N	2	A1	\N
100153	χώρα	n	\N	\N	2	A1	η
100154	επαρχία	n	\N	\N	2	A1	η
100155	μάθημα	n	\N	\N	2	A1	το
100156	σειρά μαθημάτων	n	\N	\N	2	A1	η
100157	ξάδερφος	n	\N	\N	2	A1	ο
100158	ξαδέρφη	n	\N	\N	2	A1	η
100159	αγελάδα	n	\N	\N	2	A1	η
100160	κρέμα	n	\N	\N	2	A1	η
100161	φλιτζάνι	n	\N	\N	2	A1	το
100162	μπαμπάς	n	\N	\N	2	A1	ο
100163	καθημερινός	adj	\N	\N	2	A1	\N
100164	χορεύω	v	\N	\N	2	A1	\N
100165	χορευτής	n	\N	\N	2	A1	ο
100166	χορεύτρια	n	\N	\N	2	A1	η
100167	χορός	n	\N	\N	2	A1	ο
100168	επικίνδυνος	adj	\N	\N	2	A1	\N
100169	σκοτεινός	adj	\N	\N	2	A1	\N
100170	σκούρος	adj	\N	\N	2	A1	\N
100171	ημερομηνία	n	\N	\N	2	A1	η
100172	κόρη	n	\N	\N	2	A1	η
100173	ημέρα	n	\N	\N	2	A1	η
100174	μέρα	n	\N	\N	2	A1	η
100175	αγαπητός	adj	\N	\N	2	A1	\N
100176	Δεκέμβριος	n	\N	\N	2	A1	ο
100177	αποφασίζω	v	\N	\N	2	A1	\N
100178	νόστιμος	adj	\N	\N	2	A1	\N
100179	γραφείο	n	\N	\N	2	A1	το
100180	λεπτομέρεια	n	\N	\N	2	A1	η
100181	διάλογος	n	\N	\N	2	A1	ο
100182	λεξικό	n	\N	\N	2	A1	το
100183	πεθαίνω	v	\N	\N	2	A1	\N
100184	δίαιτα	n	\N	\N	2	A1	η
100185	διατροφή	n	\N	\N	2	A1	η
100186	διαφορετικός	adj	\N	\N	2	A1	\N
100187	δύσκολος	adj	\N	\N	2	A1	\N
100188	βραδινό	n	\N	\N	2	A1	το
100189	βρώμικος	adj	\N	\N	2	A1	\N
100190	πιάτο	n	\N	\N	2	A1	το
100191	κάνω	v	\N	\N	2	A1	\N
100192	γιατρός	n	\N	\N	2	A1	ο/η
100193	σκύλος	n	\N	\N	2	A1	ο
100194	δολάριο	n	\N	\N	2	A1	το
100195	πόρτα	n	\N	\N	2	A1	η
100196	κάτω	adv	\N	\N	2	A1	\N
100197	κάτω όροφος	adv	\N	\N	2	A1	ο
3156	heal	v	\N	\N	1	B2	\N
100198	σχεδιάζω	v	\N	\N	2	A1	\N
100199	ζωγραφίζω	v	\N	\N	2	A1	\N
100200	φόρεμα	n	\N	\N	2	A1	το
100201	πίνω	v	\N	\N	2	A1	\N
100202	οδηγώ	v	\N	\N	2	A1	\N
100203	οδηγός	n	\N	\N	2	A1	ο/η
100204	οδήγηση	n	\N	\N	2	A1	η
100205	κατά τη διάρκεια	prep	\N	\N	2	A1	\N
100206	DVD	n	\N	\N	2	A1	το
100207	κάθε	det	\N	\N	2	A1	\N
100208	αυτί	n	\N	\N	2	A1	το
100209	νωρίς	adj	\N	\N	2	A1	\N
100210	ανατολή	n	\N	\N	2	A1	η
100211	εύκολος	adj	\N	\N	2	A1	\N
100212	τρώω	v	\N	\N	2	A1	\N
100213	αυγό	n	\N	\N	2	A1	το
100214	οκτώ	num	\N	\N	2	A1	\N
100215	δεκαοκτώ	num	\N	\N	2	A1	\N
100216	ογδόντα	num	\N	\N	2	A1	\N
100217	ελέφαντας	n	\N	\N	2	A1	ο
100218	έντεκα	num	\N	\N	2	A1	\N
100219	άλλο	adv	\N	\N	2	A1	\N
100220	email	n	\N	\N	2	A1	το
100221	τέλος	n	\N	\N	2	A1	το
100222	απολαμβάνω	v	\N	\N	2	A1	\N
100223	αρκετός	det	\N	\N	2	A1	\N
100224	ευρώ	n	\N	\N	2	A1	το
100225	ακόμα	adv	\N	\N	2	A1	\N
100226	βράδυ	n	\N	\N	2	A1	το
100227	ποτέ	adv	\N	\N	2	A1	\N
100228	οποιοσδήποτε	adv	\N	\N	2	A1	\N
100229	όλοι	pron	\N	\N	2	A1	οι
100230	καθένας	pron	\N	\N	2	A1	ο
100231	τα πάντα	pron	\N	\N	2	A1	\N
100232	εξέταση	n	\N	\N	2	A1	η
100233	παράδειγμα	n	\N	\N	2	A1	το
100234	ενθουσιασμένος	adj	\N	\N	2	A1	\N
100235	συναρπαστικός	adj	\N	\N	2	A1	\N
100236	άσκηση	n	\N	\N	2	A1	η
100237	ακριβός	adj	\N	\N	2	A1	\N
100238	εξηγώ	v	\N	\N	2	A1	\N
100239	επιπλέον	adj	\N	\N	2	A1	\N
100240	μάτι	n	\N	\N	2	A1	το
100241	πρόσωπο	n	\N	\N	2	A1	το
100242	πέφτω	v	\N	\N	2	A1	\N
100243	λάθος	adj	\N	\N	2	A1	\N
100244	ψεύτικος	adj	\N	\N	2	A1	\N
100245	οικογένεια	n	\N	\N	2	A1	η
100246	διάσημος	adj	\N	\N	2	A1	\N
100247	υπέροχος	adj	\N	\N	2	A1	\N
100249	φάρμα	n	\N	\N	2	A1	η
100250	αγρόκτημα	n	\N	\N	2	A1	το
100251	αγρότης	n	\N	\N	2	A1	ο
100252	γρήγορος	adj	\N	\N	2	A1	\N
100253	παχύς	adj	\N	\N	2	A1	\N
100254	πατέρας	n	\N	\N	2	A1	ο
100255	αγαπημένος	adj	\N	\N	2	A1	\N
100256	Φεβρουάριος	n	\N	\N	2	A1	ο
100257	νιώθω	v	\N	\N	2	A1	\N
100258	αισθάνομαι	v	\N	\N	2	A1	\N
100259	φεστιβάλ	n	\N	\N	2	A1	το
100260	λίγοι	det	\N	\N	2	A1	\N
100261	μερικοί	det	\N	\N	2	A1	\N
100262	δέκατος πέμπτος	num	\N	\N	2	A1	ο
100263	πέμπτος	num	\N	\N	2	A1	ο
100264	πενήντα	num	\N	\N	2	A1	\N
100265	γεμίζω	v	\N	\N	2	A1	\N
100266	ταινία	n	\N	\N	2	A1	η
100267	φιλμ	n	\N	\N	2	A1	το
100268	τελικός	adj	\N	\N	2	A1	\N
100269	βρίσκω	v	\N	\N	2	A1	\N
100270	καλά	adj	\N	\N	2	A1	\N
100271	τελειώνω	v	\N	\N	2	A1	\N
100272	φωτιά	n	\N	\N	2	A1	η
100273	πρώτος	num	\N	\N	2	A1	ο
100274	ψάρι	n	\N	\N	2	A1	το
100275	πέντε	num	\N	\N	2	A1	\N
100276	φτιάχνω	v	\N	\N	2	A1	\N
100277	επισκευάζω	v	\N	\N	2	A1	\N
100278	διαμέρισμα (flat)	n	\N	\N	2	A1	το
100279	πτήση	n	\N	\N	2	A1	η
100280	πάτωμα	n	\N	\N	2	A1	το
100281	όροφος	n	\N	\N	2	A1	ο
100282	λουλούδι	n	\N	\N	2	A1	το
100283	πετάω	v	\N	\N	2	A1	\N
100284	ακολουθώ	v	\N	\N	2	A1	\N
100285	φαγητό	n	\N	\N	2	A1	το
100286	πόδι	n	\N	\N	2	A1	το
100287	ποδόσφαιρο	n	\N	\N	2	A1	το
100288	για	prep	\N	\N	2	A1	\N
100289	ξεχνώ	v	\N	\N	2	A1	\N
100290	φόρμα	n	\N	\N	2	A1	η
100291	έντυπο	n	\N	\N	2	A1	το
100292	σαράντα	num	\N	\N	2	A1	\N
100293	τέσσερα	num	\N	\N	2	A1	\N
100294	δεκατέσσερα	num	\N	\N	2	A1	\N
100295	τέταρτος	num	\N	\N	2	A1	ο
100296	ελεύθερος	adj	\N	\N	2	A1	\N
100297	δωρεάν	adj	\N	\N	2	A1	\N
100298	Παρασκευή	n	\N	\N	2	A1	η
100299	φίλος	n	\N	\N	2	A1	ο
100300	φίλη	n	\N	\N	2	A1	η
100301	φιλικός	adj	\N	\N	2	A1	\N
100302	από	prep	\N	\N	2	A1	\N
100303	μπροστινό μέρος	n	\N	\N	2	A1	το
100304	φρούτο	n	\N	\N	2	A1	το
100305	γεμάτος	adj	\N	\N	2	A1	\N
100306	διασκέδαση	n	\N	\N	2	A1	η
100307	αστείος	adj	\N	\N	2	A1	\N
100308	μέλλον	n	\N	\N	2	A1	το
100309	παιχνίδι	n	\N	\N	2	A1	το
100310	κήπος	n	\N	\N	2	A1	ο
100311	γεωγραφία	n	\N	\N	2	A1	η
100312	παίρνω	v	\N	\N	2	A1	\N
100313	κορίτσι	n	\N	\N	2	A1	το
100314	κοπέλα	n	\N	\N	2	A1	η
100315	κοπέλα (σχέση)	n	\N	\N	2	A1	η
100316	δίνω	v	\N	\N	2	A1	\N
100317	ποτήρι	n	\N	\N	2	A1	το
100318	γυαλί	n	\N	\N	2	A1	το
100319	πηγαίνω	v	\N	\N	2	A1	\N
100320	καλός	adj	\N	\N	2	A1	\N
100321	αντίο	interj	\N	\N	2	A1	\N
100322	παππούς	n	\N	\N	2	A1	ο
100323	γιαγιά	n	\N	\N	2	A1	η
100324	παππούδες	n	\N	\N	2	A1	οι
100325	σπουδαίος	adj	\N	\N	2	A1	\N
100326	πράσινος	adj	\N	\N	2	A1	\N
100327	γκρι	adj	\N	\N	2	A1	\N
100328	ομάδα	n	\N	\N	2	A1	η
100329	μεγαλώνω	v	\N	\N	2	A1	\N
100330	μαντεύω	v	\N	\N	2	A1	\N
100331	κιθάρα	n	\N	\N	2	A1	η
100332	γυμναστήριο	n	\N	\N	2	A1	το
100333	μαλλιά	n	\N	\N	2	A1	τα
100334	μισό	n	\N	\N	2	A1	το
100335	συμβαίνω	v	\N	\N	2	A1	\N
100336	χαρούμενος	adj	\N	\N	2	A1	\N
100337	σκληρός	adj	\N	\N	2	A1	\N
100338	καπέλο	n	\N	\N	2	A1	το
100339	μισώ	v	\N	\N	2	A1	\N
100340	έχω	v	\N	\N	2	A1	\N
100341	πρέπει	v	\N	\N	2	A1	\N
100342	αυτός	pron	\N	\N	2	A1	ο
100343	κεφάλι	n	\N	\N	2	A1	το
100344	υγεία	n	\N	\N	2	A1	η
100345	υγιής	adj	\N	\N	2	A1	\N
100346	ακούω	v	\N	\N	2	A1	\N
100347	γεια	interj	\N	\N	2	A1	\N
100348	βοηθώ	v	\N	\N	2	A1	\N
100349	εδώ	adv	\N	\N	2	A1	\N
100350	ψηλός	adj	\N	\N	2	A1	\N
100351	ιστορία	n	\N	\N	2	A1	η
100352	χόμπι	n	\N	\N	2	A1	το
100353	διακοπές	n	\N	\N	2	A1	οι
100354	σπίτι	n	\N	\N	2	A1	το
100355	εργασία για το σπίτι	n	\N	\N	2	A1	η
100356	ελπίζω	v	\N	\N	2	A1	\N
100357	άλογο	n	\N	\N	2	A1	το
100358	νοσοκομείο	n	\N	\N	2	A1	το
100359	ζεστός	adj	\N	\N	2	A1	\N
100360	καυτός	adj	\N	\N	2	A1	\N
100361	ξενοδοχείο	n	\N	\N	2	A1	το
100362	ώρα	n	\N	\N	2	A1	η
100363	πεινασμένος	adj	\N	\N	2	A1	\N
100364	σύζυγος (άνδρας)	n	\N	\N	2	A1	ο
100365	πάγος	n	\N	\N	2	A1	ο
100366	παγωτό	n	\N	\N	2	A1	το
100367	ιδέα	n	\N	\N	2	A1	η
100368	αν	conj	\N	\N	2	A1	\N
100369	σημαντικός	adj	\N	\N	2	A1	\N
100370	περιλαμβάνω	v	\N	\N	2	A1	\N
100371	πληροφορία	n	\N	\N	2	A1	η
100372	πληροφορίες	n	\N	\N	2	A1	οι
100373	ενδιαφέρον	n	\N	\N	2	A1	το
100374	ενδιαφερόμενος	adj	\N	\N	2	A1	\N
100375	ενδιαφέρων	adj	\N	\N	2	A1	\N
100376	διαδίκτυο	n	\N	\N	2	A1	το
100377	ίντερνετ	n	\N	\N	2	A1	το
100378	συνέντευξη	n	\N	\N	2	A1	η
100379	μέσα σε	prep	\N	\N	2	A1	\N
100380	παρουσιάζω	v	\N	\N	2	A1	\N
100381	συστήνω	v	\N	\N	2	A1	\N
100382	νησί	n	\N	\N	2	A1	το
100383	τζάκετ	n	\N	\N	2	A1	το
100384	μπουφάν	n	\N	\N	2	A1	το
100385	Ιανουάριος	n	\N	\N	2	A1	ο
100386	τζιν	n	\N	\N	2	A1	το
100387	δουλειά	n	\N	\N	2	A1	η
100388	επάγγελμα	n	\N	\N	2	A1	το
100389	συμμετέχω	v	\N	\N	2	A1	\N
100390	ταξίδι	n	\N	\N	2	A1	το
100391	διαδρομή	n	\N	\N	2	A1	η
100392	χυμός	n	\N	\N	2	A1	ο
100393	κρατάω	v	\N	\N	2	A1	\N
100394	διατηρώ	v	\N	\N	2	A1	\N
100395	κλειδί	n	\N	\N	2	A1	το
100396	χιλιόμετρο	n	\N	\N	2	A1	το
100397	είδος	n	\N	\N	2	A1	το
100398	κουζίνα	n	\N	\N	2	A1	η
100399	ξέρω	v	\N	\N	2	A1	\N
100400	γνωρίζω	v	\N	\N	2	A1	\N
100401	ξηρά	n	\N	\N	2	A1	η
100402	γη	n	\N	\N	2	A1	η
100403	γλώσσα	n	\N	\N	2	A1	η
100404	τεράστιος	adj	\N	\N	2	A1	\N
100405	τελευταίος	adj	\N	\N	2	A1	\N
100406	αργά	adj	\N	\N	2	A1	\N
100407	αργότερα	adv	\N	\N	2	A1	\N
100408	αριστερός	adj	\N	\N	2	A1	\N
100409	αριστερά	adv	\N	\N	2	A1	\N
100410	πόδι (κάτω μέρος)	n	\N	\N	2	A1	το
100411	μάθημα (ενότητα)	n	\N	\N	2	A1	το
100412	αφήνω	v	\N	\N	2	A1	\N
100413	επιτρέπω	v	\N	\N	2	A1	\N
100414	γράμμα	n	\N	\N	2	A1	το
100415	επιστολή	n	\N	\N	2	A1	η
100416	βιβλιοθήκη	n	\N	\N	2	A1	η
100417	λέω ψέματα	v	\N	\N	2	A1	\N
100418	κείτομαι	v	\N	\N	2	A1	\N
100419	ζωή	n	\N	\N	2	A1	η
100420	φως	n	\N	\N	2	A1	το
100421	γραμμή	n	\N	\N	2	A1	η
100422	λιοντάρι	n	\N	\N	2	A1	το
100423	λίστα	n	\N	\N	2	A1	η
100424	κατάλογος	n	\N	\N	2	A1	ο
100425	ακούω (προσέχω)	v	\N	\N	2	A1	\N
100426	μικρός	adj	\N	\N	2	A1	\N
100427	λίγος	adj	\N	\N	2	A1	\N
100428	μένω (κατοικώ)	v	\N	\N	2	A1	\N
100429	μακρύς	adj	\N	\N	2	A1	\N
100430	κοιτάζω	v	\N	\N	2	A1	\N
100431	χάνω	v	\N	\N	2	A1	\N
100432	πολύ	n	\N	\N	2	A1	το
100433	αγαπώ	v	\N	\N	2	A1	\N
100434	μεσημεριανό	n	\N	\N	2	A1	το
100435	μηχανή	n	\N	\N	2	A1	η
100436	μηχάνημα	n	\N	\N	2	A1	το
100437	περιοδικό	n	\N	\N	2	A1	το
100438	κύριος	adj	\N	\N	2	A1	\N
100439	βασικός	adj	\N	\N	2	A1	\N
100440	φτιάχνω (δημιουργώ)	v	\N	\N	2	A1	\N
100441	άνδρας	n	\N	\N	2	A1	ο
100442	άντρας	n	\N	\N	2	A1	ο
100443	πολλοί	det	\N	\N	2	A1	\N
100444	χάρτης	n	\N	\N	2	A1	ο
100445	Μάρτιος	n	\N	\N	2	A1	ο
100446	αγορά	n	\N	\N	2	A1	η
100447	παντρεμένος	adj	\N	\N	2	A1	\N
100448	αγώνας	n	\N	\N	2	A1	ο
100449	ταίριασμα	n	\N	\N	2	A1	το
100450	Μάιος	n	\N	\N	2	A1	ο
100451	ίσως	adv	\N	\N	2	A1	\N
100452	γεύμα	n	\N	\N	2	A1	το
100453	σημαίνω	v	\N	\N	2	A1	\N
100454	σημασία	n	\N	\N	2	A1	η
100455	έννοια	n	\N	\N	2	A1	η
100456	κρέας	n	\N	\N	2	A1	το
100457	συναντώ	v	\N	\N	2	A1	\N
100458	συνάντηση	n	\N	\N	2	A1	η
100459	μέλος	n	\N	\N	2	A1	το
100460	μενού	n	\N	\N	2	A1	το
100461	κατάλογος (μενού)	n	\N	\N	2	A1	ο
100462	μήνυμα	n	\N	\N	2	A1	το
100463	μέτρο	n	\N	\N	2	A1	το
100464	μεσάνυχτα	n	\N	\N	2	A1	τα
100465	μίλι	n	\N	\N	2	A1	το
100466	γάλα	n	\N	\N	2	A1	το
100467	εκατομμύριο	num	\N	\N	2	A1	το
100468	λεπτό (ώρας)	n	\N	\N	2	A1	το
100469	χάνω (κάτι/κάποιον)	v	\N	\N	2	A1	\N
100470	μου λείπει	v	\N	\N	2	A1	\N
100471	λάθος (σφάλμα)	n	\N	\N	2	A1	το
100472	μοντέλο	n	\N	\N	2	A1	το
100473	μοντέρνος	adj	\N	\N	2	A1	\N
100474	σύγχρονος	adj	\N	\N	2	A1	\N
100475	στιγμή	n	\N	\N	2	A1	η
100476	Δευτέρα	n	\N	\N	2	A1	η
100477	χρήματα	n	\N	\N	2	A1	τα
100478	λεφτά	n	\N	\N	2	A1	τα
100479	μήνας	n	\N	\N	2	A1	ο
100480	περισσότερο	det	\N	\N	2	A1	\N
100481	πρωί	n	\N	\N	2	A1	το
100482	περισσότερο (συγκριτικός)	det	\N	\N	2	A1	\N
100483	μητέρα	n	\N	\N	2	A1	η
100484	μαμά	n	\N	\N	2	A1	η
100485	βουνό	n	\N	\N	2	A1	το
100486	ποντίκι	n	\N	\N	2	A1	το
100487	στόμα	n	\N	\N	2	A1	το
100488	κουνάω	v	\N	\N	2	A1	\N
100489	μετακομίζω	v	\N	\N	2	A1	\N
100490	ταινία (movie)	n	\N	\N	2	A1	η
100491	πολύ (ποσότητα)	det	\N	\N	2	A1	\N
100492	μουσείο	n	\N	\N	2	A1	το
100493	μουσική	n	\N	\N	2	A1	η
100494	πρέπει (must)	v	\N	\N	2	A1	\N
100495	όνομα	n	\N	\N	2	A1	το
100496	κοντά	prep	\N	\N	2	A1	\N
100497	χρειάζομαι	v	\N	\N	2	A1	\N
100498	γείτονας	n	\N	\N	2	A1	ο
100499	νέος	adj	\N	\N	2	A1	\N
100500	καινούργιος	adj	\N	\N	2	A1	\N
100501	νέα (news)	n	\N	\N	2	A1	τα
100502	ειδήσεις	n	\N	\N	2	A1	οι
100503	εφημερίδα	n	\N	\N	2	A1	η
100504	επόμενος	adj	\N	\N	2	A1	\N
100505	δίπλα σε	prep	\N	\N	2	A1	\N
100506	ωραίος	adj	\N	\N	2	A1	\N
100507	ευχάριστος	adj	\N	\N	2	A1	\N
100508	νύχτα	n	\N	\N	2	A1	η
100509	εννέα	num	\N	\N	2	A1	\N
100510	δεκαεννέα	num	\N	\N	2	A1	\N
100511	ενενήντα	num	\N	\N	2	A1	\N
100512	όχι	det	\N	\N	2	A1	\N
100513	κανείς (no one)	pron	\N	\N	2	A1	\N
100514	βορράς	n	\N	\N	2	A1	ο
100515	μύτη	n	\N	\N	2	A1	η
100516	σημείωση	n	\N	\N	2	A1	η
100517	Νοέμβριος	n	\N	\N	2	A1	ο
100518	τώρα	adv	\N	\N	2	A1	\N
100519	αριθμός	n	\N	\N	2	A1	ο
100520	Οκτώβριος	n	\N	\N	2	A1	ο
100521	του	prep	\N	\N	2	A1	\N
100522	της	prep	\N	\N	2	A1	\N
100523	κλειστός	adv	\N	\N	2	A1	\N
100524	γραφείο (χώρος)	n	\N	\N	2	A1	το
100525	συχνά	adv	\N	\N	2	A1	\N
100526	ω!	interj	\N	\N	2	A1	\N
100527	παλιός	adj	\N	\N	2	A1	\N
100528	πάνω σε	prep	\N	\N	2	A1	\N
100529	μία φορά	adv	\N	\N	2	A1	\N
100530	ένας	num	\N	\N	2	A1	\N
100531	κρεμμύδι	n	\N	\N	2	A1	το
100532	διαδικτυακός	adj	\N	\N	2	A1	\N
100533	μόνο	adv	\N	\N	2	A1	\N
100534	ανοίγω	v	\N	\N	2	A1	\N
100535	απέναντι	adj	\N	\N	2	A1	\N
100536	ή	conj	\N	\N	2	A1	\N
100537	πορτοκάλι	n	\N	\N	2	A1	το
100538	παραγγέλνω	v	\N	\N	2	A1	\N
100539	άλλος	adj	\N	\N	2	A1	\N
100540	έξω	adv	\N	\N	2	A1	\N
100541	έξω (υπαίθρια)	adv	\N	\N	2	A1	\N
100542	πάνω από (λήξη)	prep	\N	\N	2	A1	\N
100543	κατέχω	v	\N	\N	2	A1	\N
100544	σελίδα	n	\N	\N	2	A1	η
100545	βάφω	v	\N	\N	2	A1	\N
100546	ζωγραφίζω (με χρώμα)	v	\N	\N	2	A1	\N
100547	πίνακας ζωγραφικής	n	\N	\N	2	A1	ο
100548	ζευγάρι	n	\N	\N	2	A1	το
100549	χαρτί	n	\N	\N	2	A1	το
100550	παράγραφος	n	\N	\N	2	A1	η
100551	γονέας	n	\N	\N	2	A1	ο
100552	πάρκο	n	\N	\N	2	A1	το
100553	μέρος (τμήμα)	n	\N	\N	2	A1	το
100554	σύντροφος	n	\N	\N	2	A1	ο/η
100555	πάρτι	n	\N	\N	2	A1	το
100556	διαβατήριο	n	\N	\N	2	A1	το
100557	περασμένος	adj	\N	\N	2	A1	\N
100558	πληρώνω	v	\N	\N	2	A1	\N
100559	στυλό	n	\N	\N	2	A1	το
100560	μολύβι	n	\N	\N	2	A1	το
100561	άνθρωποι	n	\N	\N	2	A1	οι
100562	κόκκινο πιπέρι	n	\N	\N	2	A1	το
100563	τέλειος	adj	\N	\N	2	A1	\N
100564	περίοδος	n	\N	\N	2	A1	η
100565	άνθρωπος	n	\N	\N	2	A1	ο
100566	προσωπικός	adj	\N	\N	2	A1	\N
100567	τηλέφωνο	n	\N	\N	2	A1	το
100568	φωτογραφία	n	\N	\N	2	A1	η
100569	φράση	n	\N	\N	2	A1	η
100570	πιάνο	n	\N	\N	2	A1	το
100571	εικόνα	n	\N	\N	2	A1	η
100572	κομμάτι	n	\N	\N	2	A1	το
100573	γουρούνι	n	\N	\N	2	A1	το
100574	ροζ	adj	\N	\N	2	A1	\N
100575	μέρος (τοποθεσία)	n	\N	\N	2	A1	το
100576	σχέδιο	n	\N	\N	2	A1	το
100577	αεροπλάνο	n	\N	\N	2	A1	το
100578	φυτό	n	\N	\N	2	A1	το
100579	παίζω	v	\N	\N	2	A1	\N
100580	παίκτης	n	\N	\N	2	A1	ο
100581	παρακαλώ	interj	\N	\N	2	A1	\N
100582	σημείο	n	\N	\N	2	A1	το
100583	βαθμός	n	\N	\N	2	A1	ο
100584	αστυνομία	n	\N	\N	2	A1	η
100585	αστυνομικός	n	\N	\N	2	A1	ο
100586	πισίνα	n	\N	\N	2	A1	η
100587	φτωχός	adj	\N	\N	2	A1	\N
100588	ποπ (μουσική)	n	\N	\N	2	A1	η
100589	δημοφιλής	adj	\N	\N	2	A1	\N
100590	πιθανός	adj	\N	\N	2	A1	\N
100591	δημοσίευση	n	\N	\N	2	A1	η
100592	πατάτα	n	\N	\N	2	A1	η
100593	λίρα	n	\N	\N	2	A1	η
100594	εξάσκηση	n	\N	\N	2	A1	η
100595	εξασκούμαι	v	\N	\N	2	A1	\N
100596	δώρο	n	\N	\N	2	A1	το
100597	όμορφος (για κοπέλα/πράγμα)	adj	\N	\N	2	A1	\N
100598	τιμή	n	\N	\N	2	A1	η
100599	πρόβλημα	n	\N	\N	2	A1	το
100600	πρόγραμμα	n	\N	\N	2	A1	το
100601	έργο	n	\N	\N	2	A1	το
100602	μωβ	adj	\N	\N	2	A1	\N
100603	βάζω	v	\N	\N	2	A1	\N
100604	φίδι	n	\N	\N	2	A1	το
100605	χιόνι	n	\N	\N	2	A1	το
100606	λοιπόν	conj	\N	\N	2	A1	\N
100607	κάποιος	pron	\N	\N	2	A1	ο
100608	κάποια	pron	\N	\N	2	A1	η
100609	κάποιο	pron	\N	\N	2	A1	το
100610	κάτι	pron	\N	\N	2	A1	το
100611	μερικές φορές	adv	\N	\N	2	A1	\N
100612	γιος	n	\N	\N	2	A1	ο
100613	τραγούδι	n	\N	\N	2	A1	το
100614	σύντομα	adv	\N	\N	2	A1	\N
100615	συγγνώμη	adj	\N	\N	2	A1	\N
100616	ήχος	n	\N	\N	2	A1	ο
100617	σούπα	n	\N	\N	2	A1	η
100618	νότος	n	\N	\N	2	A1	ο
100619	διάστημα	n	\N	\N	2	A1	το
100620	χώρος	n	\N	\N	2	A1	ο
100621	μιλάω	v	\N	\N	2	A1	\N
100622	ειδικός	adj	\N	\N	2	A1	\N
100623	συλλαβίζω	v	\N	\N	2	A1	\N
100624	ορθογραφία	n	\N	\N	2	A1	η
100625	ξοδεύω	v	\N	\N	2	A1	\N
100626	άθλημα	n	\N	\N	2	A1	το
100627	άνοιξη	n	\N	\N	2	A1	η
100628	στέκομαι	v	\N	\N	2	A1	\N
100629	αρχίζω (start)	v	\N	\N	2	A1	\N
100630	σταθμός	n	\N	\N	2	A1	ο
100631	σταματάω	v	\N	\N	2	A1	\N
100632	ιστορία (story)	n	\N	\N	2	A1	η
100633	δρόμος	n	\N	\N	2	A1	ο
100634	δυνατός	adj	\N	\N	2	A1	\N
100635	μαθητής	n	\N	\N	2	A1	ο
100636	φοιτητής	n	\N	\N	2	A1	ο
100637	μελετώ	v	\N	\N	2	A1	\N
100638	στυλ	n	\N	\N	2	A1	το
100639	θέμα	n	\N	\N	2	A1	το
100640	ζάχαρη	n	\N	\N	2	A1	η
100641	καλοκαίρι	n	\N	\N	2	A1	το
100642	ήλιος	n	\N	\N	2	A1	ο
100643	Κυριακή	n	\N	\N	2	A1	η
100644	σουπερμάρκετ	n	\N	\N	2	A1	το
100645	σίγουρος	adj	\N	\N	2	A1	\N
100646	πουλόβερ	n	\N	\N	2	A1	το
100647	κολυμπάω	v	\N	\N	2	A1	\N
100648	κολύμβηση	n	\N	\N	2	A1	η
100649	τραπέζι	n	\N	\N	2	A1	το
100650	παίρνω (take)	v	\N	\N	2	A1	\N
100651	κουβεντιάζω	v	\N	\N	2	A1	\N
100652	ταξί	n	\N	\N	2	A1	το
100653	τσάι	n	\N	\N	2	A1	το
100654	διδάσκω	v	\N	\N	2	A1	\N
100655	δάσκαλος	n	\N	\N	2	A1	ο
100656	δασκάλα	n	\N	\N	2	A1	η
100657	ομάδα (team)	n	\N	\N	2	A1	η
100658	έφηβος	n	\N	\N	2	A1	ο
100659	τηλεφωνώ (v)	v	\N	\N	2	A1	\N
100660	τηλεόραση	n	\N	\N	2	A1	η
100661	λέω	v	\N	\N	2	A1	\N
100662	δέκα	num	\N	\N	2	A1	\N
100663	τένις	n	\N	\N	2	A1	το
100664	τρομερός	adj	\N	\N	2	A1	\N
100665	απαίσιος	adj	\N	\N	2	A1	\N
100666	τεστ	n	\N	\N	2	A1	το
100667	κείμενο	n	\N	\N	2	A1	το
100668	από (than)	conj	\N	\N	2	A1	\N
100669	ευχαριστώ	v	\N	\N	2	A1	\N
100670	ευχαριστίες	interj	\N	\N	2	A1	οι
100671	εκείνο	det	\N	\N	2	A1	το
100672	θέατρο	n	\N	\N	2	A1	το
100673	τους (their)	det	\N	\N	2	A1	\N
100674	αυτούς	pron	\N	\N	2	A1	\N
100675	τότε	adv	\N	\N	2	A1	\N
100676	εκεί	adv	\N	\N	2	A1	\N
100677	αυτοί	pron	\N	\N	2	A1	\N
100678	πράγμα	n	\N	\N	2	A1	το
100679	νομίζω	v	\N	\N	2	A1	\N
100680	σκέφτομαι	v	\N	\N	2	A1	\N
100681	τρίτος	num	\N	\N	2	A1	ο
100682	διψασμένος	adj	\N	\N	2	A1	\N
100683	δεκατρία	num	\N	\N	2	A1	\N
100684	τριάντα	num	\N	\N	2	A1	\N
100685	αυτό (this)	det	\N	\N	2	A1	το
100686	χίλια	num	\N	\N	2	A1	\N
100687	τρία	num	\N	\N	2	A1	\N
100688	μέσα από	prep	\N	\N	2	A1	\N
100689	Πέμπτη	n	\N	\N	2	A1	η
100690	εισιτήριο	n	\N	\N	2	A1	το
100691	κουρασμένος	adj	\N	\N	2	A1	\N
100692	τίτλος	n	\N	\N	2	A1	ο
100693	σε / προς	prep	\N	\N	2	A1	\N
100694	σήμερα	adv	\N	\N	2	A1	\N
100695	μαζί	adv	\N	\N	2	A1	\N
100696	τουαλέτα	n	\N	\N	2	A1	η
100697	ντομάτα	n	\N	\N	2	A1	η
100698	αύριο	adv	\N	\N	2	A1	\N
100699	απόψε	adv	\N	\N	2	A1	\N
100700	επίσης (too)	adv	\N	\N	2	A1	\N
100701	πολύ (too)	adv	\N	\N	2	A1	\N
100702	κορυφή	n	\N	\N	2	A1	η
100703	δόντι	n	\N	\N	2	A1	το
100704	τουρίστας	n	\N	\N	2	A1	ο
100705	πόλη (town)	n	\N	\N	2	A1	η
100706	τρένο	n	\N	\N	2	A1	το
100707	ταξιδεύω	v	\N	\N	2	A1	\N
100708	δέντρο	n	\N	\N	2	A1	το
100709	εκδρομή	n	\N	\N	2	A1	η
100710	παντελόνι	n	\N	\N	2	A1	το
100711	αληθινός	adj	\N	\N	2	A1	\N
100712	προσπαθώ	v	\N	\N	2	A1	\N
100713	δοκιμάζω	v	\N	\N	2	A1	\N
100714	μπλουζάκι	n	\N	\N	2	A1	το
100715	Τρίτη	n	\N	\N	2	A1	η
100716	στρίβω	v	\N	\N	2	A1	\N
100717	γυρίζω	v	\N	\N	2	A1	\N
100718	δώδεκα	num	\N	\N	2	A1	\N
100719	είκοσι	num	\N	\N	2	A1	\N
100720	δύο φορές	adv	\N	\N	2	A1	\N
100721	δύο	num	\N	\N	2	A1	\N
100722	τύπος	n	\N	\N	2	A1	ο
100723	ομπρέλα	n	\N	\N	2	A1	η
100724	θείος	n	\N	\N	2	A1	ο
100725	κάτω από (under)	prep	\N	\N	2	A1	\N
100726	καταλαβαίνω	v	\N	\N	2	A1	\N
100727	πανεπιστήμιο	n	\N	\N	2	A1	το
100728	μέχρι	conj	\N	\N	2	A1	\N
100729	πάνω (up)	adv	\N	\N	2	A1	\N
100730	επάνω όροφος	adv	\N	\N	2	A1	ο
100731	εμάς	pron	\N	\N	2	A1	\N
100732	χρησιμοποιώ	v	\N	\N	2	A1	\N
100733	συνήθως	adv	\N	\N	2	A1	\N
100734	διακοπές (vacation)	n	\N	\N	2	A1	οι
100735	λαχανικό	n	\N	\N	2	A1	το
100736	πολύ (very)	adv	\N	\N	2	A1	\N
100737	βίντεο	n	\N	\N	2	A1	το
100738	χωριό	n	\N	\N	2	A1	το
100739	επισκέπτομαι	v	\N	\N	2	A1	\N
100740	επισκέπτης	n	\N	\N	2	A1	ο
100741	περιμένω	v	\N	\N	2	A1	\N
100742	σερβιτόρος	n	\N	\N	2	A1	ο
100743	ξυπνάω	v	\N	\N	2	A1	\N
100744	περπατάω	v	\N	\N	2	A1	\N
100745	τοίχος	n	\N	\N	2	A1	ο
100746	θέλω	v	\N	\N	2	A1	\N
100747	ζεστός (warm)	adj	\N	\N	2	A1	\N
100748	πλένω	v	\N	\N	2	A1	\N
100749	παρακολουθώ	v	\N	\N	2	A1	\N
100750	νερό	n	\N	\N	2	A1	το
100751	τρόπος	n	\N	\N	2	A1	ο
100752	Τετάρτη	n	\N	\N	2	A1	η
100753	εβδομάδα	n	\N	\N	2	A1	η
100754	σαββατοκύριακο	n	\N	\N	2	A1	το
100755	καλώς ορίσατε	interj	\N	\N	2	A1	\N
100756	καλά (well)	adv	\N	\N	2	A1	\N
100757	δύση	n	\N	\N	2	A1	η
100758	τι	pron	\N	\N	2	A1	\N
100759	πότε	adv	\N	\N	2	A1	\N
100760	πού	adv	\N	\N	2	A1	\N
100761	ποιο	pron	\N	\N	2	A1	το
100762	λευκό	adj	\N	\N	2	A1	\N
100763	άσπρο	adj	\N	\N	2	A1	\N
100764	ποιος	pron	\N	\N	2	A1	ο
100765	γιατί	adv	\N	\N	2	A1	\N
100766	σύζυγος (γυναίκα)	n	\N	\N	2	A1	η
100767	θα	v	\N	\N	2	A1	\N
100768	κερδίζω	v	\N	\N	2	A1	\N
100769	παράθυρο	n	\N	\N	2	A1	το
100770	κρασί	n	\N	\N	2	A1	το
100771	χειμώνας	n	\N	\N	2	A1	ο
100772	με	prep	\N	\N	2	A1	\N
100773	χωρίς	prep	\N	\N	2	A1	\N
100774	γυναίκα	n	\N	\N	2	A1	η
100775	υπέροχος (wonderful)	adj	\N	\N	2	A1	\N
100776	λέξη	n	\N	\N	2	A1	η
100777	εργασία	n	\N	\N	2	A1	η
100778	δουλεύω	v	\N	\N	2	A1	\N
100779	εργάτης	n	\N	\N	2	A1	ο
100780	κόσμος	n	\N	\N	2	A1	ο
100781	θα (would)	v	\N	\N	2	A1	\N
100782	γράφω	v	\N	\N	2	A1	\N
100783	συγγραφέας	n	\N	\N	2	A1	ο/η
100784	γράψιμο	n	\N	\N	2	A1	το
100785	λάθος (wrong)	adj	\N	\N	2	A1	\N
100786	ναι (yeah)	interj	\N	\N	2	A1	\N
100787	χρόνος (year)	n	\N	\N	2	A1	ο
100788	έτος	n	\N	\N	2	A1	το
100789	κίτρινο	adj	\N	\N	2	A1	\N
100790	ναι (yes)	interj	\N	\N	2	A1	\N
100791	χθες	adv	\N	\N	2	A1	\N
100792	εσύ	pron	\N	\N	2	A1	\N
100793	νέος (young)	adj	\N	\N	2	A1	\N
100794	σου	det	\N	\N	2	A1	\N
100795	τον εαυτό σου	pron	\N	\N	2	A1	\N
3811	trace	n	\N	\N	1	B2	\N
100796	εγώ	pron	\N	\N	2	A1	\N
100797	εσείς	pron	\N	\N	2	A1	\N
100798	αυτή	pron	\N	\N	2	A1	η
100799	αυτό (pron)	pron	\N	\N	2	A1	το
100800	εμείς	pron	\N	\N	2	A1	\N
100801	εμένα	pron	\N	\N	2	A1	\N
100802	αυτόν	pron	\N	\N	2	A1	\N
100803	αυτήν	pron	\N	\N	2	A1	\N
100804	εμάς (us)	pron	\N	\N	2	A1	\N
100805	αυτούς (them)	pron	\N	\N	2	A1	\N
100806	δικός μου	det	\N	\N	2	A1	\N
100807	δικός σου	det	\N	\N	2	A1	\N
100808	δικός του	det	\N	\N	2	A1	\N
100809	δικό του	det	\N	\N	2	A1	\N
100810	δικός μας	det	\N	\N	2	A1	\N
100811	δικός τους	det	\N	\N	2	A1	\N
100812	δικό μου (mine)	pron	\N	\N	2	A1	\N
100813	δικό σου (yours)	pron	\N	\N	2	A1	\N
100814	δικό της (hers)	pron	\N	\N	2	A1	\N
100815	δικό μας (ours)	pron	\N	\N	2	A1	\N
100816	δικό τους (theirs)	pron	\N	\N	2	A1	\N
100817	είμαι (am)	v	\N	\N	2	A1	\N
100818	είναι (is)	v	\N	\N	2	A1	\N
100819	είναι (are)	v	\N	\N	2	A1	\N
100820	ήμουν	v	\N	\N	2	A1	\N
100821	ήταν	v	\N	\N	2	A1	\N
100822	έχω (have)	v	\N	\N	2	A1	\N
100823	έχει	v	\N	\N	2	A1	\N
100824	είχα	v	\N	\N	2	A1	\N
100825	θα (shall)	v	\N	\N	2	A1	\N
100826	μπορεί (may)	v	\N	\N	2	A1	\N
100827	μπορεί να (might)	v	\N	\N	2	A1	\N
100828	δεν μπορούσα	v	\N	\N	2	A1	\N
100829	δεν θα	v	\N	\N	2	A1	\N
100830	δεν θα έπρεπε	v	\N	\N	2	A1	\N
100831	δεν θα ήθελα	v	\N	\N	2	A1	\N
100832	δεν είναι (isn't)	v	\N	\N	2	A1	\N
100833	δεν είναι (aren't)	v	\N	\N	2	A1	\N
100834	δεν ήταν (wasn't)	v	\N	\N	2	A1	\N
100835	δεν ήταν (weren't)	v	\N	\N	2	A1	\N
100836	δεν έχω (haven't)	v	\N	\N	2	A1	\N
100837	δεν έχει (hasn't)	v	\N	\N	2	A1	\N
100838	δεν είχα (hadn't)	v	\N	\N	2	A1	\N
100839	δίπλα	prep	\N	\N	2	A1	\N
100840	πάνω σε (onto)	prep	\N	\N	2	A1	\N
100841	ενώ	conj	\N	\N	2	A1	\N
100842	μόλις	adv	\N	\N	2	A1	\N
100843	ικανότητα	n	\N	\N	2	A2	η
100844	ικανός	adj	\N	\N	2	A2	\N
100845	στο εξωτερικό	adv	\N	\N	2	A2	\N
100846	αποδέχομαι	v	\N	\N	2	A2	\N
100847	ατύχημα	n	\N	\N	2	A2	το
100848	κατορθώνω	v	\N	\N	2	A2	\N
100849	επιτυγχάνω	v	\N	\N	2	A2	\N
100850	δρω	v	\N	\N	2	A2	\N
100851	ενεργός	adj	\N	\N	2	A2	\N
100852	δραστήριος	adj	\N	\N	2	A2	\N
100853	στην πραγματικότητα	adv	\N	\N	2	A2	\N
100854	πλεονέκτημα	n	\N	\N	2	A2	το
100855	περιπέτεια	n	\N	\N	2	A2	η
100856	διαφημίζω	v	\N	\N	2	A2	\N
100857	διαφήμιση	n	\N	\N	2	A2	η
100858	συμβουλή	n	\N	\N	2	A2	η
100859	επηρεάζω	v	\N	\N	2	A2	\N
100860	εναντίον	prep	\N	\N	2	A2	\N
100861	συμφωνώ	v	\N	\N	2	A2	\N
100862	α!	interj	\N	\N	2	A2	\N
100863	αεροπορική εταιρεία	n	\N	\N	2	A2	η
100864	ζωντανός	adj	\N	\N	2	A2	\N
100865	επιτρέπω	v	\N	\N	2	A2	\N
100866	σχεδόν	adv	\N	\N	2	A2	\N
100867	μόνος	adj	\N	\N	2	A2	\N
100868	κατά μήκος	prep	\N	\N	2	A2	\N
100869	ήδη	adv	\N	\N	2	A2	\N
100870	αν και	conj	\N	\N	2	A2	\N
100871	μεταξύ	prep	\N	\N	2	A2	\N
100872	ποσότητα	n	\N	\N	2	A2	η
100873	ποσό	n	\N	\N	2	A2	το
100874	αρχαίος	adj	\N	\N	2	A2	\N
100875	αστράγαλος	n	\N	\N	2	A2	ο
100876	οποιοσδήποτε	pron	\N	\N	2	A2	\N
100877	πια	adv	\N	\N	2	A2	\N
100878	έτσι κι αλλιώς	adv	\N	\N	2	A2	\N
100879	οπουδήποτε	adv	\N	\N	2	A2	\N
100880	εφαρμογή	n	\N	\N	2	A2	η
100881	εμφανίζομαι	v	\N	\N	2	A2	\N
100882	εμφάνιση	n	\N	\N	2	A2	η
100883	κάνω αίτηση	v	\N	\N	2	A2	\N
100884	αρχιτέκτονας	n	\N	\N	2	A2	ο/η
100885	αρχιτεκτονική	n	\N	\N	2	A2	η
100886	λογομαχώ	v	\N	\N	2	A2	\N
100887	επιχείρημα	n	\N	\N	2	A2	το
100888	στρατός	n	\N	\N	2	A2	ο
100889	κανονίζω	v	\N	\N	2	A2	\N
100890	διευθέτηση	n	\N	\N	2	A2	η
100891	κοιμισμένος	adj	\N	\N	2	A2	\N
100892	βοηθός	n	\N	\N	2	A2	ο/η
100893	αθλητής	n	\N	\N	2	A2	ο
100894	αθλήτρια	n	\N	\N	2	A2	η
100895	επίθεση	n	\N	\N	2	A2	η
100896	επιτίθεμαι	v	\N	\N	2	A2	\N
100897	παρευρίσκομαι	v	\N	\N	2	A2	\N
100898	προσοχή	n	\N	\N	2	A2	η
100899	ελκυστικός	adj	\N	\N	2	A2	\N
100900	κοινό	n	\N	\N	2	A2	το
100901	ακροατήριο	n	\N	\N	2	A2	το
100902	συγγραφέας (author)	n	\N	\N	2	A2	ο/η
100903	διαθέσιμος	adj	\N	\N	2	A2	\N
100904	μέσος όρος	n	\N	\N	2	A2	ο
100905	μέσος	adj	\N	\N	2	A2	\N
100906	αποφεύγω	v	\N	\N	2	A2	\N
100907	βραβείο	n	\N	\N	2	A2	το
100908	φόντο	n	\N	\N	2	A2	το
100909	υπόβαθρο	n	\N	\N	2	A2	το
100910	άσχημα	adv	\N	\N	2	A2	\N
100911	μπέιζμπολ	n	\N	\N	2	A2	το
100912	μπάσκετ	n	\N	\N	2	A2	το
100913	μπάσο	n	\N	\N	2	A2	το
100914	φασόλι	n	\N	\N	2	A2	το
100915	αρκούδα	n	\N	\N	2	A2	η
100916	νικώ	v	\N	\N	2	A2	\N
100917	χτυπώ (beat)	v	\N	\N	2	A2	\N
100918	βοδινό κρέας	n	\N	\N	2	A2	το
100919	συμπεριφέρομαι	v	\N	\N	2	A2	\N
100920	ανήκω	v	\N	\N	2	A2	\N
100921	ζώνη	n	\N	\N	2	A2	η
100922	όφελος	n	\N	\N	2	A2	το
100923	ευεργέτημα	n	\N	\N	2	A2	το
100924	δισεκατομμύριο	num	\N	\N	2	A2	το
100925	κάδος	n	\N	\N	2	A2	ο
100926	βιολογία	n	\N	\N	2	A2	η
100927	γέννηση	n	\N	\N	2	A2	η
100928	μπισκότο	n	\N	\N	2	A2	το
100929	κομμάτι (bit)	n	\N	\N	2	A2	το
100930	κενός	adj	\N	\N	2	A2	\N
100931	αίμα	n	\N	\N	2	A2	το
100932	φυσώ	v	\N	\N	2	A2	\N
100933	σανίδα	n	\N	\N	2	A2	η
100934	συμβούλιο	n	\N	\N	2	A2	το
100935	βράζω	v	\N	\N	2	A2	\N
100936	κόκκαλο	n	\N	\N	2	A2	το
100937	κλείνω (book)	v	\N	\N	2	A2	\N
100938	δανείζομαι	v	\N	\N	2	A2	\N
100939	αφεντικό	n	\N	\N	2	A2	το
100940	πάτος	n	\N	\N	2	A2	ο
100941	κάτω μέρος	n	\N	\N	2	A2	το
100942	μπολ	n	\N	\N	2	A2	το
100943	εγκέφαλος	n	\N	\N	2	A2	ο
100944	γέφυρα	n	\N	\N	2	A2	η
100945	φωτεινός	adj	\N	\N	2	A2	\N
100946	λαμπρός	adj	\N	\N	2	A2	\N
100947	εξαιρετικός	adj	\N	\N	2	A2	\N
100948	σπασμένος	adj	\N	\N	2	A2	\N
100949	βούρτσα	n	\N	\N	2	A2	η
100950	βουρτσίζω	v	\N	\N	2	A2	\N
100951	κολλητός	n	\N	\N	2	A2	ο
100952	καίω	v	\N	\N	2	A2	\N
100953	επιχειρηματίας	n	\N	\N	2	A2	ο
100954	κουμπί	n	\N	\N	2	A2	το
100955	κατασκήνωση	n	\N	\N	2	A2	η
100956	κατασκηνώνω	v	\N	\N	2	A2	\N
100957	φροντίδα	n	\N	\N	2	A2	η
100958	φροντίζω	v	\N	\N	2	A2	\N
100959	προσεκτικός	adj	\N	\N	2	A2	\N
100960	προσεκτικά	adv	\N	\N	2	A2	\N
100961	χαλί	n	\N	\N	2	A2	το
100962	κινούμενα σχέδια	n	\N	\N	2	A2	τα
100963	περίπτωση	n	\N	\N	2	A2	η
100964	μετρητά	n	\N	\N	2	A2	τα
100965	καζίνο	n	\N	\N	2	A2	το
100966	κάστρο	n	\N	\N	2	A2	το
100967	πιάνω	v	\N	\N	2	A2	\N
100968	αιτία	n	\N	\N	2	A2	η
100969	προκαλώ	v	\N	\N	2	A2	\N
100970	γιορτάζω	v	\N	\N	2	A2	\N
100971	διασημότητα	n	\N	\N	2	A2	η
100972	συγκεκριμένος	adj	\N	\N	2	A2	\N
100973	βέβαιος	adj	\N	\N	2	A2	\N
100974	σίγουρα	adv	\N	\N	2	A2	\N
100975	ευκαιρία	n	\N	\N	2	A2	η
100976	χαρακτήρας	n	\N	\N	2	A2	ο
100977	φιλανθρωπία	n	\N	\N	2	A2	η
100978	συνομιλία	n	\N	\N	2	A2	η
100979	συνομιλώ	v	\N	\N	2	A2	\N
100980	σεφ	n	\N	\N	2	A2	ο
100981	χημεία	n	\N	\N	2	A2	η
100982	πατατάκι	n	\N	\N	2	A2	το
100983	επιλογή	n	\N	\N	2	A2	η
100984	εκκλησία	n	\N	\N	2	A2	η
100985	τσιγάρο	n	\N	\N	2	A2	το
100986	κύκλος	n	\N	\N	2	A2	ο
100987	κλασικός	adj	\N	\N	2	A2	\N
100988	σαφώς	adv	\N	\N	2	A2	\N
100989	έξυπνος	adj	\N	\N	2	A2	\N
100990	κλίμα	n	\N	\N	2	A2	το
100991	σύννεφο	n	\N	\N	2	A2	το
100992	πούλμαν	n	\N	\N	2	A2	το
100993	προπονητής	n	\N	\N	2	A2	ο
100994	ακτή	n	\N	\N	2	A2	η
100995	παραλία (coast)	n	\N	\N	2	A2	η
100996	κώδικας	n	\N	\N	2	A2	ο
100997	κωδικός	n	\N	\N	2	A2	ο
100998	νόμισμα	n	\N	\N	2	A2	το
100999	συνάδελφος	n	\N	\N	2	A2	ο/η
101000	συλλέγω	v	\N	\N	2	A2	\N
101001	στήλη	n	\N	\N	2	A2	η
101002	κωμωδία	n	\N	\N	2	A2	η
101003	άνετος	adj	\N	\N	2	A2	\N
101004	κοινός	adj	\N	\N	2	A2	\N
101005	σχόλιο	n	\N	\N	2	A2	το
101006	επικοινωνώ	v	\N	\N	2	A2	\N
101007	κοινότητα	n	\N	\N	2	A2	η
101008	συγκρίνω	v	\N	\N	2	A2	\N
101009	συναγωνίζομαι	v	\N	\N	2	A2	\N
101010	διαγωνίζομαι	v	\N	\N	2	A2	\N
101011	διαγωνισμός	n	\N	\N	2	A2	ο
101012	παραπονιέμαι	v	\N	\N	2	A2	\N
101013	εντελώς	adv	\N	\N	2	A2	\N
101014	κατάσταση	n	\N	\N	2	A2	η
101015	συνθήκη	n	\N	\N	2	A2	η
101016	συνέδριο	n	\N	\N	2	A2	το
101017	συνδέω	v	\N	\N	2	A2	\N
101018	συνδεδεμένος	adj	\N	\N	2	A2	\N
101019	εξετάζω (consider)	v	\N	\N	2	A2	\N
101020	περιέχω	v	\N	\N	2	A2	\N
101021	ήπειρος	n	\N	\N	2	A2	η
101022	συζήτηση	n	\N	\N	2	A2	η
101023	έλεγχος	n	\N	\N	2	A2	ο
101024	ελέγχω (control)	v	\N	\N	2	A2	\N
101025	μάγειρας	n	\N	\N	2	A2	ο
101026	κουζίνα (συσκευή)	n	\N	\N	2	A2	η
101027	αντίγραφο	n	\N	\N	2	A2	το
101028	αντιγράφω	v	\N	\N	2	A2	\N
101029	γωνία	n	\N	\N	2	A2	η
101030	σωστά	adv	\N	\N	2	A2	\N
101031	μετρώ	v	\N	\N	2	A2	\N
101032	ζευγάρι (people)	n	\N	\N	2	A2	το
101033	τρελός	adj	\N	\N	2	A2	\N
101034	δημιουργικός	adj	\N	\N	2	A2	\N
101035	έγκλημα	n	\N	\N	2	A2	το
101036	εγκληματίας	n	\N	\N	2	A2	ο/η
101037	εγκληματικός	adj	\N	\N	2	A2	\N
101038	καθημερινά	adv	\N	\N	2	A2	\N
101039	κίνδυνος	n	\N	\N	2	A2	ο
101040	σκοτάδι	n	\N	\N	2	A2	το
101041	νεκρός	adj	\N	\N	2	A2	\N
101042	αντιμετωπίζω	v	\N	\N	2	A2	\N
101043	ασχολούμαι με	v	\N	\N	2	A2	\N
101044	θάνατος	n	\N	\N	2	A2	ο
101045	απόφαση	n	\N	\N	2	A2	η
101046	βαθύς	adj	\N	\N	2	A2	\N
101047	οπωσδήποτε	adv	\N	\N	2	A2	\N
101048	βαθμός (πτυχίο)	n	\N	\N	2	A2	ο
101049	οδοντίατρος	n	\N	\N	2	A2	ο/η
101050	τμήμα (υπηρεσία)	n	\N	\N	2	A2	το
101051	εξαρτώμαι	v	\N	\N	2	A2	\N
101052	περιγράφω	v	\N	\N	2	A2	\N
101053	περιγραφή	n	\N	\N	2	A2	η
101054	έρημος	n	\N	\N	2	A2	η
101055	σχεδιαστής	n	\N	\N	2	A2	ο
101056	σχεδιάστρια	n	\N	\N	2	A2	η
101057	καταστρέφω	v	\N	\N	2	A2	\N
101058	ντετέκτιβ	n	\N	\N	2	A2	ο/η
101059	αναπτύσσω	v	\N	\N	2	A2	\N
101060	συσκευή	n	\N	\N	2	A2	η
101061	ημερολόγιο (diary)	n	\N	\N	2	A2	το
101062	διαφορά	n	\N	\N	2	A2	η
101063	διαφορετικά	adv	\N	\N	2	A2	\N
101064	ψηφιακός	adj	\N	\N	2	A2	\N
101065	άμεσος	adj	\N	\N	2	A2	\N
101066	κατευθύνω	v	\N	\N	2	A2	\N
101067	κατεύθυνση	n	\N	\N	2	A2	η
101068	διευθυντής	n	\N	\N	2	A2	ο
101069	διευθύντρια	n	\N	\N	2	A2	η
101070	διαφωνώ	v	\N	\N	2	A2	\N
101071	εξαφανίζομαι	v	\N	\N	2	A2	\N
101072	καταστροφή	n	\N	\N	2	A2	η
101073	ανακαλύπτω	v	\N	\N	2	A2	\N
101074	ανακάλυψη	n	\N	\N	2	A2	η
101075	συζήτηση (group)	n	\N	\N	2	A2	η
101076	ασθένεια	n	\N	\N	2	A2	η
101077	νόσος	n	\N	\N	2	A2	η
101078	απόσταση	n	\N	\N	2	A2	η
101079	χωρισμένος	adj	\N	\N	2	A2	\N
101080	έγγραφο	n	\N	\N	2	A2	το
101081	διπλός	adj	\N	\N	2	A2	\N
101082	διπλασιάζω	v	\N	\N	2	A2	\N
101083	κατεβάζω (download)	v	\N	\N	2	A2	\N
101084	δράμα	n	\N	\N	2	A2	το
101085	όνειρο	n	\N	\N	2	A2	το
101086	ονειρεύομαι	v	\N	\N	2	A2	\N
101087	ρίχνω	v	\N	\N	2	A2	\N
101088	πέφτω (drop)	v	\N	\N	2	A2	\N
101089	φάρμακο	n	\N	\N	2	A2	το
101090	στεγνός	adj	\N	\N	2	A2	\N
101091	στεγνώνω	v	\N	\N	2	A2	\N
101092	κερδίζω (χρήματα)	v	\N	\N	2	A2	\N
101093	γη (πλανήτης)	n	\N	\N	2	A2	η
101094	εύκολα	adv	\N	\N	2	A2	\N
101095	εκπαίδευση	n	\N	\N	2	A2	η
101096	είτε	conj	\N	\N	2	A2	\N
101097	ηλεκτρικός	adj	\N	\N	2	A2	\N
101098	ηλεκτρολογικός	adj	\N	\N	2	A2	\N
101099	ηλεκτρισμός	n	\N	\N	2	A2	ο
101100	ηλεκτρονικός	adj	\N	\N	2	A2	\N
101101	προσλαμβάνω	v	\N	\N	2	A2	\N
101102	υπάλληλος	n	\N	\N	2	A2	ο/η
101103	εργοδότης	n	\N	\N	2	A2	ο
101104	άδειος	adj	\N	\N	2	A2	\N
101105	τέλος (ending)	n	\N	\N	2	A2	το
101106	ενέργεια (energy)	n	\N	\N	2	A2	η
101107	μηχανή (engine)	n	\N	\N	2	A2	η
101108	μηχανικός	n	\N	\N	2	A2	ο/η
101109	τεράστιος (enormous)	adj	\N	\N	2	A2	\N
101110	μπαίνω	v	\N	\N	2	A2	\N
101111	εξοπλισμός	n	\N	\N	2	A2	ο
101112	λάθος (error)	n	\N	\N	2	A2	το
101113	ειδικά	adv	\N	\N	2	A2	\N
101114	έκθεση (essay)	n	\N	\N	2	A2	η
101115	καθημερινός (everyday)	adj	\N	\N	2	A2	\N
101116	παντού	adv	\N	\N	2	A2	\N
101117	ακριβής	adj	\N	\N	2	A2	\N
101118	ακριβώς	adv	\N	\N	2	A2	\N
101119	εξαιρετικός (excellent)	adj	\N	\N	2	A2	\N
101120	εκτός από	prep	\N	\N	2	A2	\N
101121	υπάρχω	v	\N	\N	2	A2	\N
101122	περιμένω (expect)	v	\N	\N	2	A2	\N
101123	εμπειρία	n	\N	\N	2	A2	η
101124	πείραμα	n	\N	\N	2	A2	το
101125	ειδικός (expert)	n	\N	\N	2	A2	ο/η
101126	επεξήγηση	n	\N	\N	2	A2	η
101127	εκφράζω	v	\N	\N	2	A2	\N
101128	έκφραση	n	\N	\N	2	A2	η
101129	ακραίος	adj	\N	\N	2	A2	\N
101130	εξαιρετικά (extremely)	adv	\N	\N	2	A2	\N
101131	εργοστάσιο	n	\N	\N	2	A2	το
101132	δίκαιος	adj	\N	\N	2	A2	\N
101133	θαυμαστής	n	\N	\N	2	A2	ο
101134	ανεμιστήρας	n	\N	\N	2	A2	ο
101135	καλλιέργεια	n	\N	\N	2	A2	η
101136	μόδα	n	\N	\N	2	A2	η
101137	φόβος	n	\N	\N	2	A2	ο
101138	συναίσθημα	n	\N	\N	2	A2	το
101139	θήλυ	adj	\N	\N	2	A2	\N
101140	γυναίκα (female)	n	\N	\N	2	A2	η
101141	μυθοπλασία	n	\N	\N	2	A2	η
101142	πεδίο	n	\N	\N	2	A2	το
101143	γήπεδο	n	\N	\N	2	A2	το
101144	μάχη	n	\N	\N	2	A2	η
101145	πολεμώ	v	\N	\N	2	A2	\N
101146	φιγούρα	n	\N	\N	2	A2	η
101147	σχήμα (figure)	n	\N	\N	2	A2	το
101148	επιτέλους	adv	\N	\N	2	A2	\N
101149	δάχτυλο	n	\N	\N	2	A2	το
101150	πρώτα	adv	\N	\N	2	A2	\N
101151	ψάρεμα	n	\N	\N	2	A2	το
101152	ταιριάζω	v	\N	\N	2	A2	\N
101153	σημαία	n	\N	\N	2	A2	η
101154	γρίπη	n	\N	\N	2	A2	η
101155	πετώντας	adj	\N	\N	2	A2	\N
101156	εστιάζω	v	\N	\N	2	A2	\N
101157	ακόλουθος	adj	\N	\N	2	A2	\N
101158	ξένος	adj	\N	\N	2	A2	\N
101159	δάσος	n	\N	\N	2	A2	το
101160	πιρούνι	n	\N	\N	2	A2	το
101161	τυπικός	adj	\N	\N	2	A2	\N
101162	ευτυχώς	adv	\N	\N	2	A2	\N
101163	μπροστά	adv	\N	\N	2	A2	\N
101164	φρέσκος	adj	\N	\N	2	A2	\N
101165	ψυγείο	n	\N	\N	2	A2	το
101166	έπιπλα	n	\N	\N	2	A2	τα
101167	περαιτέρω	adv	\N	\N	2	A2	\N
101168	γκαλερί	n	\N	\N	2	A2	η
101169	κενό	n	\N	\N	2	A2	το
101170	αέριο	n	\N	\N	2	A2	το
101171	γκάζι	n	\N	\N	2	A2	το
101172	πύλη	n	\N	\N	2	A2	η
101173	γενικός	adj	\N	\N	2	A2	\N
101174	στόχος	n	\N	\N	2	A2	ο
101175	θεός	n	\N	\N	2	A2	ο
101176	χρυσός	n	\N	\N	2	A2	ο
101177	χρυσός (adj)	adj	\N	\N	2	A2	\N
101178	γκολφ	n	\N	\N	2	A2	το
101179	γρασίδι	n	\N	\N	2	A2	το
101180	χαιρετώ	v	\N	\N	2	A2	\N
101181	έδαφος	n	\N	\N	2	A2	το
101182	καλεσμένος	n	\N	\N	2	A2	ο
101183	φιλοξενούμενος	n	\N	\N	2	A2	ο
101184	οδηγός (guide)	n	\N	\N	2	A2	ο/η
101185	καθοδηγώ	v	\N	\N	2	A2	\N
101186	συνήθεια	n	\N	\N	2	A2	η
101187	αίθουσα (hall)	n	\N	\N	2	A2	η
101188	ευτυχισμένα	adv	\N	\N	2	A2	\N
101189	πονοκέφαλος	n	\N	\N	2	A2	ο
101190	καρδιά	n	\N	\N	2	A2	η
101191	θερμότητα	n	\N	\N	2	A2	η
101192	ζέστη	n	\N	\N	2	A2	η
101193	βαρύς	adj	\N	\N	2	A2	\N
101194	ύψος	n	\N	\N	2	A2	το
101195	χρήσιμος	adj	\N	\N	2	A2	\N
101196	ήρωας	n	\N	\N	2	A2	ο
101197	δικός της (hers)	pron	\N	\N	2	A2	\N
101198	η ίδια (herself)	pron	\N	\N	2	A2	\N
101199	κρύβω	v	\N	\N	2	A2	\N
101200	κρύβομαι	v	\N	\N	2	A2	\N
101201	λόφος	n	\N	\N	2	A2	ο
101202	ο ίδιος (himself)	pron	\N	\N	2	A2	\N
101203	χτύπημα	n	\N	\N	2	A2	το
101204	χτυπώ (hit)	v	\N	\N	2	A2	\N
101205	χόκεϊ	n	\N	\N	2	A2	το
101206	κρατώ (hold)	v	\N	\N	2	A2	\N
101207	τρύπα	n	\N	\N	2	A2	η
101208	ελπίδα	n	\N	\N	2	A2	η
101209	άνθρωπος (human)	n	\N	\N	2	A2	ο
101210	ανθρώπινος	adj	\N	\N	2	A2	\N
101211	βιάζομαι	v	\N	\N	2	A2	\N
101212	βιασύνη	n	\N	\N	2	A2	η
101213	πονάω	v	\N	\N	2	A2	\N
101214	ιδανικός	adj	\N	\N	2	A2	\N
101215	ηλίθιος	n	\N	\N	2	A2	ο
101216	άρρωστος	adj	\N	\N	2	A2	\N
101217	αρρώστια	n	\N	\N	2	A2	η
101218	αμέσως	adv	\N	\N	2	A2	\N
101219	αδύνατος (impossible)	adj	\N	\N	2	A2	\N
101220	συμπεριλαμβανόμενος	adj	\N	\N	2	A2	\N
101221	αύξηση	n	\N	\N	2	A2	η
101222	αυξάνω	v	\N	\N	2	A2	\N
101223	απίστευτος	adj	\N	\N	2	A2	\N
101224	ανεξάρτητος	adj	\N	\N	2	A2	\N
101225	άτομο	n	\N	\N	2	A2	το
101226	ατομικός	adj	\N	\N	2	A2	\N
101227	βιομηχανία	n	\N	\N	2	A2	η
101228	ανεπίσημος	adj	\N	\N	2	A2	\N
101229	τραυματισμός	n	\N	\N	2	A2	ο
101230	μελάνι	n	\N	\N	2	A2	το
101231	έντομο	n	\N	\N	2	A2	το
101232	μέσα	adv	\N	\N	2	A2	\N
101233	οδηγία	n	\N	\N	2	A2	η
101234	εκπαιδευτής	n	\N	\N	2	A2	ο
101235	εκπαιδεύτρια	n	\N	\N	2	A2	η
101236	όργανο	n	\N	\N	2	A2	το
101237	έξυπνος (intelligent)	adj	\N	\N	2	A2	\N
101238	διεθνής	adj	\N	\N	2	A2	\N
101239	εισαγωγή	n	\N	\N	2	A2	η
101240	εφευρίσκω	v	\N	\N	2	A2	\N
101241	εφεύρεση	n	\N	\N	2	A2	η
101242	μαρμελάδα	n	\N	\N	2	A2	η
101243	τζάζ	n	\N	\N	2	A2	η
101244	κόσμημα	n	\N	\N	2	A2	το
101245	αστείο	n	\N	\N	2	A2	το
101246	δημοσιογράφος	n	\N	\N	2	A2	ο/η
101247	άλμα	n	\N	\N	2	A2	το
101248	πηδάω	v	\N	\N	2	A2	\N
101249	σκοτώνω	v	\N	\N	2	A2	\N
101250	βασιλιάς	n	\N	\N	2	A2	ο
101251	φιλί	n	\N	\N	2	A2	το
101252	φιλάω	v	\N	\N	2	A2	\N
101253	γόνατο	n	\N	\N	2	A2	το
101254	μαχαίρι	n	\N	\N	2	A2	το
101255	χτυπάω (knock)	v	\N	\N	2	A2	\N
101256	γνώση	n	\N	\N	2	A2	η
101257	εργαστήριο	n	\N	\N	2	A2	το
101258	κυρία	n	\N	\N	2	A2	η
101259	λίμνη	n	\N	\N	2	A2	η
101260	λάμπα	n	\N	\N	2	A2	η
101261	προσγειώνομαι	v	\N	\N	2	A2	\N
101262	φορητός υπολογιστής	n	\N	\N	2	A2	ο
101263	γέλιο	n	\N	\N	2	A2	το
101264	νόμος	n	\N	\N	2	A2	ο
101265	δικηγόρος	n	\N	\N	2	A2	ο/η
101266	τεμπέλης	adj	\N	\N	2	A2	\N
101267	ηγούμαι	v	\N	\N	2	A2	\N
101268	οδηγώ (lead)	v	\N	\N	2	A2	\N
101269	μόλυβδος	n	\N	\N	2	A2	ο
101270	ηγέτης	n	\N	\N	2	A2	ο
101271	μάθηση	n	\N	\N	2	A2	η
101272	τουλάχιστον	adv	\N	\N	2	A2	\N
101273	διάλεξη	n	\N	\N	2	A2	η
101274	λεμόνι	n	\N	\N	2	A2	το
101275	δανείζω	v	\N	\N	2	A2	\N
101276	λιγότερο	adv	\N	\N	2	A2	\N
101277	επίπεδο	n	\N	\N	2	A2	το
101278	τρόπος ζωής	n	\N	\N	2	A2	ο
3812	track	n	\N	\N	1	B2	\N
101279	ασανσέρ	n	\N	\N	2	A2	το
101280	σηκώνω	v	\N	\N	2	A2	\N
101281	πιθανός (likely)	adj	\N	\N	2	A2	\N
101282	σύνδεσμος	n	\N	\N	2	A2	ο
101283	συνδέω (link)	v	\N	\N	2	A2	\N
101284	ταχυδρομείο	n	\N	\N	2	A2	το
101285	ταχυδρομώ	v	\N	\N	2	A2	\N
101286	κύριος (major)	adj	\N	\N	2	A2	\N
101287	σημαντικός (major)	adj	\N	\N	2	A2	\N
101288	αρσενικό	adj	\N	\N	2	A2	\N
101289	άνδρας (male)	n	\N	\N	2	A2	ο
101290	διαχειρίζομαι	v	\N	\N	2	A2	\N
101291	διευθυντής (manager)	n	\N	\N	2	A2	ο
101292	τρόπος (manner)	n	\N	\N	2	A2	ο
101293	σημάδι	n	\N	\N	2	A2	το
101294	βαθμολογώ	v	\N	\N	2	A2	\N
101295	παντρεύομαι	v	\N	\N	2	A2	\N
101296	μάσκα	n	\N	\N	2	A2	η
101297	υλικό	n	\N	\N	2	A2	το
101298	μαθηματικά	n	\N	\N	2	A2	τα
101299	ζήτημα	n	\N	\N	2	A2	το
101300	πειράζει	v	\N	\N	2	A2	\N
101301	μέσα ενημέρωσης	n	\N	\N	2	A2	τα
101302	ιατρικός	adj	\N	\N	2	A2	\N
101303	φάρμακο (medicine)	n	\N	\N	2	A2	το
101304	μνήμη	n	\N	\N	2	A2	η
101305	αναφέρω	v	\N	\N	2	A2	\N
101306	μέταλλο	n	\N	\N	2	A2	το
101307	μέση	n	\N	\N	2	A2	η
101308	μεσαίος	adj	\N	\N	2	A2	\N
101309	νου	n	\N	\N	2	A2	ο
101310	μυαλό	n	\N	\N	2	A2	το
101311	προσέχω (mind)	v	\N	\N	2	A2	\N
101312	καθρέφτης	n	\N	\N	2	A2	ο
101313	λείπει	adj	\N	\N	2	A2	\N
101314	κινητό (τηλέφωνο)	adj	\N	\N	2	A2	\N
101315	μαϊμού	n	\N	\N	2	A2	η
101316	φεγγάρι	n	\N	\N	2	A2	το
101317	κυρίως	adv	\N	\N	2	A2	\N
101318	μοτοσυκλέτα	n	\N	\N	2	A2	η
101319	κίνηση (movement)	n	\N	\N	2	A2	η
101320	μουσικός (adj)	adj	\N	\N	2	A2	\N
101321	μουσικό έργο	n	\N	\N	2	A2	το
101322	μουσικός (n)	n	\N	\N	2	A2	ο/η
101323	ο εαυτός μου	pron	\N	\N	2	A2	\N
101324	στενός	adj	\N	\N	2	A2	\N
101325	εθνικός	adj	\N	\N	2	A2	\N
101326	φυσικός (natural)	adj	\N	\N	2	A2	\N
101327	φύση	n	\N	\N	2	A2	η
101328	σχεδόν (nearly)	adv	\N	\N	2	A2	\N
101329	απαραίτητος	adj	\N	\N	2	A2	\N
101330	λαιμός	n	\N	\N	2	A2	ο
101331	ούτε ο ένας ούτε ο άλλος	det	\N	\N	2	A2	\N
101332	νευρικός	adj	\N	\N	2	A2	\N
101333	φωλιά	n	\N	\N	2	A2	η
101334	δίχτυ	n	\N	\N	2	A2	το
101335	δίκτυο	n	\N	\N	2	A2	το
101336	θόρυβος	n	\N	\N	2	A2	ο
101337	θορυβώδης	adj	\N	\N	2	A2	\N
101338	κανένας (none)	pron	\N	\N	2	A2	\N
101339	κανονικός	adj	\N	\N	2	A2	\N
101340	φυσιολογικός	adj	\N	\N	2	A2	\N
101341	φυσιολογικά	adv	\N	\N	2	A2	\N
101342	ειδοποίηση	n	\N	\N	2	A2	η
101343	παρατηρώ	v	\N	\N	2	A2	\N
101344	μυθιστόρημα	n	\N	\N	2	A2	το
101345	πουθενά	adv	\N	\N	2	A2	\N
101346	ωκεανός	n	\N	\N	2	A2	ο
101347	προσφορά	n	\N	\N	2	A2	η
101348	προσφέρω	v	\N	\N	2	A2	\N
101349	αξιωματικός	n	\N	\N	2	A2	ο/η
101350	λάδι	n	\N	\N	2	A2	το
101351	πετρέλαιο	n	\N	\N	2	A2	το
101352	επιλογή (option)	n	\N	\N	2	A2	η
101353	συνηθισμένος	adj	\N	\N	2	A2	\N
101354	οργάνωση	n	\N	\N	2	A2	η
101355	οργανώνω	v	\N	\N	2	A2	\N
101356	πρωτότυπος	adj	\N	\N	2	A2	\N
101357	πρωτότυπο	n	\N	\N	2	A2	το
101358	εμείς οι ίδιοι	pron	\N	\N	2	A2	\N
101359	εξωτερικός	adj	\N	\N	2	A2	\N
101360	φούρνος	n	\N	\N	2	A2	ο
101361	ιδιοκτήτης	n	\N	\N	2	A2	ο
101362	ιδιοκτήτρια	n	\N	\N	2	A2	η
101363	πακέτο	n	\N	\N	2	A2	το
101364	πακετάρω	v	\N	\N	2	A2	\N
101365	πόνος	n	\N	\N	2	A2	ο
101366	ζωγράφος	n	\N	\N	2	A2	ο/η
101367	παλάτι	n	\N	\N	2	A2	το
101368	παντελόνι (pants)	n	\N	\N	2	A2	το
101369	παρκάρισμα	n	\N	\N	2	A2	το
101370	ιδιαίτερος	adj	\N	\N	2	A2	\N
101371	συγκεκριμένος (particular)	adj	\N	\N	2	A2	\N
101372	περνώ	v	\N	\N	2	A2	\N
101373	επιβάτης	n	\N	\N	2	A2	ο
101374	επιβάτισσα	n	\N	\N	2	A2	η
101375	παρελθόν	n	\N	\N	2	A2	το
101376	ασθενής	n	\N	\N	2	A2	ο/η
101377	μοτίβο	n	\N	\N	2	A2	το
101378	ειρήνη	n	\N	\N	2	A2	η
101379	πενάκι	n	\N	\N	2	A2	το
101380	ανά	prep	\N	\N	2	A2	\N
101381	τοις εκατό	n	\N	\N	2	A2	το
101382	παρουσιάζω (perform)	v	\N	\N	2	A2	\N
101383	εκτελώ	v	\N	\N	2	A2	\N
101384	ίσως (perhaps)	adv	\N	\N	2	A2	\N
101385	άδεια	n	\N	\N	2	A2	η
101386	προσωπικότητα	n	\N	\N	2	A2	η
101387	κατοικίδιο	n	\N	\N	2	A2	το
101388	βενζίνη	n	\N	\N	2	A2	η
101389	φωτογραφίζω	v	\N	\N	2	A2	\N
101390	σωματικός	adj	\N	\N	2	A2	\N
101391	φυσικός (physics)	adj	\N	\N	2	A2	\N
101392	φυσική	n	\N	\N	2	A2	η
101393	διαλέγω (pick)	v	\N	\N	2	A2	\N
101394	μαζεύω	v	\N	\N	2	A2	\N
101395	πιλότος	n	\N	\N	2	A2	ο/η
101396	πειρατής	n	\N	\N	2	A2	ο
101397	πειρατίνα	n	\N	\N	2	A2	η
101398	πλανήτης	n	\N	\N	2	A2	ο
101399	φυτεύω	v	\N	\N	2	A2	\N
101400	πλαστικός	adj	\N	\N	2	A2	\N
101401	πλαστικό	n	\N	\N	2	A2	το
101402	πιάτο (plate)	n	\N	\N	2	A2	το
101403	αποβάθρα	n	\N	\N	2	A2	η
101404	ευχαριστημένος	adj	\N	\N	2	A2	\N
101405	φις (plug)	n	\N	\N	2	A2	το
101406	τσέπη	n	\N	\N	2	A2	η
101407	ευγενικός	adj	\N	\N	2	A2	\N
101408	ρύπανση	n	\N	\N	2	A2	η
101409	λιμνούλα	n	\N	\N	2	A2	η
101410	σκάω (pop)	v	\N	\N	2	A2	\N
101411	πληθυσμός	n	\N	\N	2	A2	ο
101412	θέση	n	\N	\N	2	A2	η
101413	κατοχή	n	\N	\N	2	A2	η
101414	πιθανότητα	n	\N	\N	2	A2	η
101415	αφίσα	n	\N	\N	2	A2	η
101416	δύναμη	n	\N	\N	2	A2	η
101417	ισχύς	n	\N	\N	2	A2	η
101418	προβλέπω	v	\N	\N	2	A2	\N
101419	προτιμώ	v	\N	\N	2	A2	\N
101420	προετοιμάζω	v	\N	\N	2	A2	\N
101421	παρόν	n	\N	\N	2	A2	το
101422	τωρινός	adj	\N	\N	2	A2	\N
101423	πρόεδρος	n	\N	\N	2	A2	ο/η
101424	εμποδίζω	v	\N	\N	2	A2	\N
101425	προλαβαίνω	v	\N	\N	2	A2	\N
101426	εκτυπώνω	v	\N	\N	2	A2	\N
101427	εκτυπωτής	n	\N	\N	2	A2	ο
101428	φυλακή	n	\N	\N	2	A2	η
101429	έπαθλο	n	\N	\N	2	A2	το
101430	επαγγελματικός	adj	\N	\N	2	A2	\N
101431	επαγγελματίας	n	\N	\N	2	A2	ο/η
101432	καθηγητής (πανεπιστημίου)	n	\N	\N	2	A2	ο
101433	καθηγήτρια (πανεπιστημίου)	n	\N	\N	2	A2	η
101434	προφίλ	n	\N	\N	2	A2	το
101435	πρόγραμμα (it)	n	\N	\N	2	A2	το
101436	πρόοδος	n	\N	\N	2	A2	η
101437	υπόσχεση	n	\N	\N	2	A2	η
101438	υπόσχομαι	v	\N	\N	2	A2	\N
101439	προφέρω	v	\N	\N	2	A2	\N
101440	προστατεύω	v	\N	\N	2	A2	\N
101441	παμπ	n	\N	\N	2	A2	η
101442	δημόσιος	adj	\N	\N	2	A2	\N
101443	δημοσιεύω	v	\N	\N	2	A2	\N
101444	τραβώ	v	\N	\N	2	A2	\N
101445	σπρώχνω	v	\N	\N	2	A2	\N
101446	ποιότητα	n	\N	\N	2	A2	η
101447	ποσότητα (quantity)	n	\N	\N	2	A2	η
101448	βασίλισσα	n	\N	\N	2	A2	η
101449	ήσυχα	adv	\N	\N	2	A2	\N
101450	φυλή (race)	n	\N	\N	2	A2	η
101451	αγώνας δρόμου	n	\N	\N	2	A2	ο
101452	σιδηρόδρομος	n	\N	\N	2	A2	ο
101453	σηκώνω (raise)	v	\N	\N	2	A2	\N
101454	αρουραίος	n	\N	\N	2	A2	ο
101455	ρυθμός	n	\N	\N	2	A2	ο
101456	μάλλον	adv	\N	\N	2	A2	\N
101457	φτάνω (reach)	v	\N	\N	2	A2	\N
101458	αντιδρώ	v	\N	\N	2	A2	\N
101459	συνειδητοποιώ	v	\N	\N	2	A2	\N
101460	λαμβάνω	v	\N	\N	2	A2	\N
101461	πρόσφατος	adj	\N	\N	2	A2	\N
101462	πρόσφατα	adv	\N	\N	2	A2	\N
101463	υποδοχή	n	\N	\N	2	A2	η
101464	συνταγή	n	\N	\N	2	A2	η
101465	αναγνωρίζω	v	\N	\N	2	A2	\N
101466	συνιστώ	v	\N	\N	2	A2	\N
101467	δίσκος (record)	n	\N	\N	2	A2	ο
101468	αρχείο	n	\N	\N	2	A2	το
101469	καταγράφω	v	\N	\N	2	A2	\N
4248	demon	n	\N	\N	1	C1	\N
101470	ηχογραφώ	v	\N	\N	2	A2	\N
101471	ηχογράφηση	n	\N	\N	2	A2	η
101472	ανακυκλώνω	v	\N	\N	2	A2	\N
101473	μειώνω	v	\N	\N	2	A2	\N
101474	αναφέρομαι	v	\N	\N	2	A2	\N
101475	αρνούμαι	v	\N	\N	2	A2	\N
101476	περιοχή (region)	n	\N	\N	2	A2	η
101477	τακτικός	adj	\N	\N	2	A2	\N
101478	σχέση	n	\N	\N	2	A2	η
101479	αφαιρώ	v	\N	\N	2	A2	\N
101480	αντικαθιστώ	v	\N	\N	2	A2	\N
101481	απάντηση (reply)	n	\N	\N	2	A2	η
101482	απαντώ	v	\N	\N	2	A2	\N
101483	αναφορά	n	\N	\N	2	A2	η
101484	αναφέρω (report)	v	\N	\N	2	A2	\N
101485	δημοσιογράφος (reporter)	n	\N	\N	2	A2	ο/η
101486	αίτημα	n	\N	\N	2	A2	το
101487	ζητώ (request)	v	\N	\N	2	A2	\N
101488	ερευνητής	n	\N	\N	2	A2	ο
101489	ερευνήτρια	n	\N	\N	2	A2	η
101490	ξεκούραση	n	\N	\N	2	A2	η
101491	ξεκουράζομαι	v	\N	\N	2	A2	\N
101492	κριτική	n	\N	\N	2	A2	η
101493	επανεξετάζω	v	\N	\N	2	A2	\N
101494	διαδρομή (ride)	n	\N	\N	2	A2	η
101495	δαχτυλίδι	n	\N	\N	2	A2	το
101496	κουδουνίζω	v	\N	\N	2	A2	\N
101497	βράχος	n	\N	\N	2	A2	ο
101498	ρόλος	n	\N	\N	2	A2	ο
101499	στέγη	n	\N	\N	2	A2	η
101500	στρογγυλός	adj	\N	\N	2	A2	\N
101501	γύρω (round)	prep	\N	\N	2	A2	\N
101502	ρουτίνα	n	\N	\N	2	A2	η
101503	σκουπίδια	n	\N	\N	2	A2	τα
101504	αγενής	adj	\N	\N	2	A2	\N
101505	τρέξιμο	n	\N	\N	2	A2	το
101506	δρομέας	n	\N	\N	2	A2	ο/η
101507	δυστυχώς	adv	\N	\N	2	A2	\N
101508	ασφαλής	adj	\N	\N	2	A2	\N
101509	πανί (sail)	n	\N	\N	2	A2	το
101510	σαλπάρω	v	\N	\N	2	A2	\N
101511	ιστιοπλοΐα	n	\N	\N	2	A2	η
101512	μισθός	n	\N	\N	2	A2	ο
101513	πώληση	n	\N	\N	2	A2	η
101514	σάλτσα	n	\N	\N	2	A2	η
101515	σώζω	v	\N	\N	2	A2	\N
101516	τρομαγμένος	adj	\N	\N	2	A2	\N
101517	τρομακτικός	adj	\N	\N	2	A2	\N
101518	σκηνή	n	\N	\N	2	A2	η
101519	πρόγραμμα (schedule)	n	\N	\N	2	A2	το
101520	σκορ	n	\N	\N	2	A2	το
101521	βαθμολογία	n	\N	\N	2	A2	η
101522	σκοράρω	v	\N	\N	2	A2	\N
101523	οθόνη	n	\N	\N	2	A2	η
101524	αναζήτηση	n	\N	\N	2	A2	η
101525	αναζητώ	v	\N	\N	2	A2	\N
101526	εποχή	n	\N	\N	2	A2	η
101527	κάθισμα	n	\N	\N	2	A2	το
101528	δεύτερος	adj	\N	\N	2	A2	ο
101529	δεύτερο (χρόνος)	n	\N	\N	2	A2	το
101530	δεύτερον	adv	\N	\N	2	A2	\N
101531	μυστικό	n	\N	\N	2	A2	το
101532	μυστικός	adj	\N	\N	2	A2	\N
101533	γραμματέας	n	\N	\N	2	A2	ο/η
101534	φαίνομαι	v	\N	\N	2	A2	\N
101535	πουλάω	v	\N	\N	2	A2	\N
101536	αίσθηση	n	\N	\N	2	A2	η
101537	χωριστός	adj	\N	\N	2	A2	\N
101538	σειρά	n	\N	\N	2	A2	η
101539	σοβαρός	adj	\N	\N	2	A2	\N
101540	σερβίρω	v	\N	\N	2	A2	\N
101541	εξυπηρέτηση	n	\N	\N	2	A2	η
101542	αρκετοί	det	\N	\N	2	A2	\N
101543	κουνώ	v	\N	\N	2	A2	\N
101544	θα (shall/A2)	v	\N	\N	2	A2	\N
101545	μοιράζομαι	v	\N	\N	2	A2	\N
101546	σχήμα	n	\N	\N	2	A2	το
101547	σεντόνι	n	\N	\N	2	A2	το
101548	φύλλο (χαρτιού)	n	\N	\N	2	A2	το
101549	πλοίο	n	\N	\N	2	A2	το
101550	ώμος	n	\N	\N	2	A2	ο
101551	φωνάζω	v	\N	\N	2	A2	\N
101552	κλείνω (shut)	v	\N	\N	2	A2	\N
101553	πλευρά	n	\N	\N	2	A2	η
101554	μεριά	n	\N	\N	2	A2	η
101555	πινακίδα	n	\N	\N	2	A2	η
101556	σημάδι (sign)	n	\N	\N	2	A2	το
101557	ασήμι	n	\N	\N	2	A2	το
101558	ασημένιος	adj	\N	\N	2	A2	\N
101559	παρόμοιος	adj	\N	\N	2	A2	\N
101560	απλός	adj	\N	\N	2	A2	\N
101561	από τότε	prep	\N	\N	2	A2	\N
101562	εφόσον	conj	\N	\N	2	A2	\N
101563	τραγούδι (singing)	n	\N	\N	2	A2	το
101564	μονός	adj	\N	\N	2	A2	\N
101565	ανύπαντρος	adj	\N	\N	2	A2	\N
101566	κύριος (sir)	n	\N	\N	2	A2	ο
5762	foray	n	\N	\N	1	C2	\N
101567	τοποθεσία	n	\N	\N	2	A2	η
101568	μέγεθος	n	\N	\N	2	A2	το
101569	πέδιλο του σκι	n	\N	\N	2	A2	το
101570	κάνω σκι	v	\N	\N	2	A2	\N
101571	σκι	n	\N	\N	2	A2	το
101572	δέρμα	n	\N	\N	2	A2	το
101573	ουρανός	n	\N	\N	2	A2	ο
101574	αργά (slowly)	adv	\N	\N	2	A2	\N
101575	έξυπνο τηλέφωνο	n	\N	\N	2	A2	το
101576	οσμή	n	\N	\N	2	A2	η
101577	μυρίζω	v	\N	\N	2	A2	\N
101578	χαμόγελο	n	\N	\N	2	A2	το
101579	χαμογελώ	v	\N	\N	2	A2	\N
101580	καπνός	n	\N	\N	2	A2	ο
101581	καπνίζω	v	\N	\N	2	A2	\N
101582	κάπνισμα	n	\N	\N	2	A2	το
101583	σαπούνι	n	\N	\N	2	A2	το
101584	κοινωνικός	adj	\N	\N	2	A2	\N
101585	κάλτσα	n	\N	\N	2	A2	η
101586	μαλακός	adj	\N	\N	2	A2	\N
101587	στρατιώτης	n	\N	\N	2	A2	ο
101588	λύση	n	\N	\N	2	A2	η
101589	κάπου	adv	\N	\N	2	A2	\N
101590	είδος (sort)	n	\N	\N	2	A2	το
101591	ηχείο	n	\N	\N	2	A2	το
101592	ομιλητής	n	\N	\N	2	A2	ο
101593	συγκεκριμένος (specific)	adj	\N	\N	2	A2	\N
101594	ομιλία	n	\N	\N	2	A2	η
101595	λόγος (speech)	n	\N	\N	2	A2	ο
101596	ταχύτητα	n	\N	\N	2	A2	η
101597	αράχνη	n	\N	\N	2	A2	η
101598	κουτάλι	n	\N	\N	2	A2	το
101599	τετράγωνο	n	\N	\N	2	A2	το
101600	τετράγωνος	adj	\N	\N	2	A2	\N
101601	σκηνή (stage)	n	\N	\N	2	A2	η
101602	στάδιο (stage)	n	\N	\N	2	A2	το
101603	σκαλοπάτι	n	\N	\N	2	A2	το
101604	γραμματόσημο	n	\N	\N	2	A2	το
101605	αστέρι	n	\N	\N	2	A2	το
101606	κράτος	n	\N	\N	2	A2	το
101607	δήλωση	n	\N	\N	2	A2	η
101608	κλέβω	v	\N	\N	2	A2	\N
101609	βήμα	n	\N	\N	2	A2	το
101610	πατάω	v	\N	\N	2	A2	\N
101611	ακόμα (still)	adv	\N	\N	2	A2	\N
101612	στομάχι	n	\N	\N	2	A2	το
101613	πέτρα	n	\N	\N	2	A2	η
101614	κατάστημα	n	\N	\N	2	A2	το
101615	καταιγίδα	n	\N	\N	2	A2	η
101616	ίσιος	adj	\N	\N	2	A2	\N
101617	κατευθείαν	adv	\N	\N	2	A2	\N
101618	παράξενος	adj	\N	\N	2	A2	\N
101619	άγχος	n	\N	\N	2	A2	το
101620	στρες	n	\N	\N	2	A2	το
101621	πετυχαίνω (succeed)	v	\N	\N	2	A2	\N
101622	επιτυχημένος	adj	\N	\N	2	A2	\N
101623	τέτοιος	det	\N	\N	2	A2	\N
101624	ξαφνικά	adv	\N	\N	2	A2	\N
101625	προτείνω	v	\N	\N	2	A2	\N
101626	πρόταση (suggestion)	n	\N	\N	2	A2	η
101627	κοστούμι	n	\N	\N	2	A2	το
101628	υποστήριξη	n	\N	\N	2	A2	η
101629	υποστηρίζω	v	\N	\N	2	A2	\N
101630	υποθέτω	v	\N	\N	2	A2	\N
101631	έκπληξη	n	\N	\N	2	A2	η
101632	εκπλήσσω	v	\N	\N	2	A2	\N
101633	ξαφνιασμένος	adj	\N	\N	2	A2	\N
101634	ξαφνικός	adj	\N	\N	2	A2	\N
101635	γλυκός	adj	\N	\N	2	A2	\N
101636	κούνια	n	\N	\N	2	A2	η
101637	αιωρούμαι	v	\N	\N	2	A2	\N
101638	ταμπλέτα	n	\N	\N	2	A2	η
101639	στόχος (target)	n	\N	\N	2	A2	ο
101640	εργασία (task)	n	\N	\N	2	A2	η
101641	γεύση	n	\N	\N	2	A2	η
101642	γεύομαι	v	\N	\N	2	A2	\N
101643	διδασκαλία	n	\N	\N	2	A2	η
101644	τεχνολογία	n	\N	\N	2	A2	η
101645	εφηβικός	adj	\N	\N	2	A2	\N
101646	θερμοκρασία	n	\N	\N	2	A2	η
101647	σκηνή (tent)	n	\N	\N	2	A2	η
101648	όρος (term)	n	\N	\N	2	A2	ο
101649	στέλνω μήνυμα	v	\N	\N	2	A2	\N
101650	οι ίδιοι	pron	\N	\N	2	A2	\N
101651	πυκνός	adj	\N	\N	2	A2	\N
101652	χοντρός (thick)	adj	\N	\N	2	A2	\N
101653	κλέφτης	n	\N	\N	2	A2	ο/η
101654	λεπτός (thin)	adj	\N	\N	2	A2	\N
101655	τακτοποιημένος	adj	\N	\N	2	A2	\N
101656	τακτοποιώ	v	\N	\N	2	A2	\N
101657	γραβάτα	n	\N	\N	2	A2	η
101658	δένω	v	\N	\N	2	A2	\N
101659	φιλοδώρημα	n	\N	\N	2	A2	το
101660	δάχτυλο ποδιού	n	\N	\N	2	A2	το
101661	εργαλείο	n	\N	\N	2	A2	το
101662	συνολικός	adj	\N	\N	2	A2	\N
101663	αγγίζω	v	\N	\N	2	A2	\N
101664	περιοδεία	n	\N	\N	2	A2	η
101665	τουρισμός	n	\N	\N	2	A2	ο
101666	προς	prep	\N	\N	2	A2	\N
101667	πετσέτα	n	\N	\N	2	A2	η
101668	πύργος	n	\N	\N	2	A2	ο
101669	παιχνίδι (toy)	n	\N	\N	2	A2	το
101670	στίβος	n	\N	\N	2	A2	ο
101671	παράδοση	n	\N	\N	2	A2	η
101672	παραδοσιακός	adj	\N	\N	2	A2	\N
101673	αθλητικά παπούτσια	n	\N	\N	2	A2	τα
101674	εκπαίδευση (training)	n	\N	\N	2	A2	η
101675	μεταφορά	n	\N	\N	2	A2	η
101676	μεταφορικό μέσο	n	\N	\N	2	A2	το
101677	ταξιδιώτης	n	\N	\N	2	A2	ο
101678	ταξιδιώτισσα	n	\N	\N	2	A2	η
101679	πρόβλημα (trouble)	n	\N	\N	2	A2	το
101680	μπελάς	n	\N	\N	2	A2	ο
101681	φορτηγό	n	\N	\N	2	A2	το
101682	δίδυμος	n	\N	\N	2	A2	ο
101683	υπόγειος	adj	\N	\N	2	A2	\N
101684	υπογείως	adv	\N	\N	2	A2	\N
101685	κατανόηση	n	\N	\N	2	A2	η
101686	δυστυχισμένος	adj	\N	\N	2	A2	\N
101687	στολή	n	\N	\N	2	A2	η
101688	μονάδα	n	\N	\N	2	A2	η
101689	ενωμένος	adj	\N	\N	2	A2	\N
101690	ασυνήθιστος	adj	\N	\N	2	A2	\N
101691	αναστατωμένος	adj	\N	\N	2	A2	\N
101692	χρήση	n	\N	\N	2	A2	η
101693	συνήθιζα να	v	\N	\N	2	A2	\N
101694	χρήστης	n	\N	\N	2	A2	ο
101695	κοιλάδα	n	\N	\N	2	A2	η
101696	φορτηγάκι	n	\N	\N	2	A2	το
101697	ποικιλία	n	\N	\N	2	A2	η
101698	θέα	n	\N	\N	2	A2	η
101699	ιός	n	\N	\N	2	A2	ο
101700	φωνή	n	\N	\N	2	A2	η
101701	πόλεμος	n	\N	\N	2	A2	ο
101702	πλύσιμο	n	\N	\N	2	A2	το
101703	κύμα	n	\N	\N	2	A2	το
101704	χαιρετώ (wave)	v	\N	\N	2	A2	\N
101705	αδύναμος	adj	\N	\N	2	A2	\N
101706	ιστός	n	\N	\N	2	A2	ο
101707	γάμος	n	\N	\N	2	A2	ο
101708	βάρος	n	\N	\N	2	A2	το
101709	υποδοχή (welcome)	n	\N	\N	2	A2	η
101710	καλοδεχούμενος	adj	\N	\N	2	A2	\N
101711	καλωσορίζω	v	\N	\N	2	A2	\N
101712	υγρός	adj	\N	\N	2	A2	\N
101713	βρεγμένος	adj	\N	\N	2	A2	\N
101714	ρόδα	n	\N	\N	2	A2	η
101715	τροχός	n	\N	\N	2	A2	ο
101716	ολόκληρος	adj	\N	\N	2	A2	\N
101717	τίνος	det	\N	\N	2	A2	\N
101718	πλατύς	adj	\N	\N	2	A2	\N
101719	άγριος	adj	\N	\N	2	A2	\N
101720	άνεμος	n	\N	\N	2	A2	ο
101721	νικητής	n	\N	\N	2	A2	ο
101722	ευχή	n	\N	\N	2	A2	η
101723	εύχομαι	v	\N	\N	2	A2	\N
101724	ξύλο	n	\N	\N	2	A2	το
101725	ξύλινος	adj	\N	\N	2	A2	\N
101726	εργαζόμενος (adj)	adj	\N	\N	2	A2	\N
101727	ανήσυχος	adj	\N	\N	2	A2	\N
101728	ανησυχώ	v	\N	\N	2	A2	\N
101729	ανησυχία	n	\N	\N	2	A2	η
101730	χειρότερος	adj	\N	\N	2	A2	\N
101731	χειρότερα	adv	\N	\N	2	A2	\N
101732	χείριστος	adj	\N	\N	2	A2	\N
101733	χείριστα	adv	\N	\N	2	A2	\N
101734	ουάου	interj	\N	\N	2	A2	\N
101735	ακόμα (yet)	adv	\N	\N	2	A2	\N
101736	μηδέν	num	\N	\N	2	A2	το
101737	απολύτως	adv	\N	\N	2	B1	\N
101738	ακαδημαϊκός	adj	\N	\N	2	B1	\N
101739	πρόσβαση	n	\N	\N	2	B1	η
101740	αποκτώ πρόσβαση	v	\N	\N	2	B1	\N
101741	κατάλυμα	n	\N	\N	2	B1	το
101742	λογαριασμός	n	\N	\N	2	B1	ο
101743	σύμφωνα με	prep	\N	\N	2	B1	\N
101744	επίτευγμα	n	\N	\N	2	B1	το
101745	διαφήμιση	n	\N	\N	2	B1	η
101746	προσθήκη	n	\N	\N	2	B1	η
101747	θαυμάζω	v	\N	\N	2	B1	\N
101748	παραδέχομαι	v	\N	\N	2	B1	\N
101749	προχωρημένος	adj	\N	\N	2	B1	\N
101750	συμβουλεύω	v	\N	\N	2	B1	\N
101751	αντέχω οικονομικά	v	\N	\N	2	B1	\N
101752	ηλικιωμένος	adj	\N	\N	2	B1	\N
101753	πράκτορας	n	\N	\N	2	B1	ο
101754	συμφωνία	n	\N	\N	2	B1	η
101755	μπροστά	adv	\N	\N	2	B1	\N
101756	στόχος	n	\N	\N	2	B1	ο
101757	στοχεύω	v	\N	\N	2	B1	\N
101758	συναγερμός	n	\N	\N	2	B1	ο
101759	άλμπουμ	n	\N	\N	2	B1	το
6730	shun	v	\N	\N	1	C2	\N
101760	αλκοόλ	n	\N	\N	2	B1	το
101761	αλκοολούχος	adj	\N	\N	2	B1	\N
101762	εναλλακτικός	adj	\N	\N	2	B1	\N
101763	εναλλακτική	n	\N	\N	2	B1	η
101764	έκπληκτος	adj	\N	\N	2	B1	\N
101765	φιλοδοξία	n	\N	\N	2	B1	η
101766	φιλόδοξος	adj	\N	\N	2	B1	\N
101767	ανακοινώνω	v	\N	\N	2	B1	\N
101768	ανακοίνωση	n	\N	\N	2	B1	η
101769	ενοχλώ	v	\N	\N	2	B1	\N
101770	ενοχλημένος	adj	\N	\N	2	B1	\N
101771	ενοχλητικός	adj	\N	\N	2	B1	\N
101772	χωριστά	adv	\N	\N	2	B1	\N
101773	ζητώ συγγνώμη	v	\N	\N	2	B1	\N
101774	αίτηση	n	\N	\N	2	B1	η
101775	ραντεβού	n	\N	\N	2	B1	το
101776	εκτιμώ	v	\N	\N	2	B1	\N
101777	περίπου	adv	\N	\N	2	B1	\N
101778	συλλαμβάνω	v	\N	\N	2	B1	\N
101779	άφιξη	n	\N	\N	2	B1	η
101780	εργασία	n	\N	\N	2	B1	η
101781	βοηθώ	v	\N	\N	2	B1	\N
101782	ατμόσφαιρα	n	\N	\N	2	B1	η
101783	επισυνάπτω	v	\N	\N	2	B1	\N
101784	στάση	n	\N	\N	2	B1	η
101785	ελκύω	v	\N	\N	2	B1	\N
101786	ατραξιόν	n	\N	\N	2	B1	η
101787	αρχή	n	\N	\N	2	B1	η
101788	μέσος όρος	n	\N	\N	2	B1	ο
101789	βραβείο	n	\N	\N	2	B1	το
101790	βραβεύω	v	\N	\N	2	B1	\N
101791	ενήμερος	adj	\N	\N	2	B1	\N
101792	προς τα πίσω	adv	\N	\N	2	B1	\N
101793	ψήνω	v	\N	\N	2	B1	\N
101794	ισορροπία	n	\N	\N	2	B1	η
101795	απαγόρευση	n	\N	\N	2	B1	η
101796	όχθη	n	\N	\N	2	B1	η
101797	βάση	n	\N	\N	2	B1	η
101798	βασικός	adj	\N	\N	2	B1	\N
101799	μπαταρία	n	\N	\N	2	B1	η
101800	μάχη	n	\N	\N	2	B1	η
101801	ομορφιά	n	\N	\N	2	B1	η
101802	μέλισσα	n	\N	\N	2	B1	η
101803	συμπεριφορά	n	\N	\N	2	B1	η
101804	πεποίθηση	n	\N	\N	2	B1	η
101805	πίστη	n	\N	\N	2	B1	η
101806	καμπάνα	n	\N	\N	2	B1	η
101807	κουδούνι	n	\N	\N	2	B1	το
101808	λυγίζω	v	\N	\N	2	B1	\N
101809	ωφελούμαι	v	\N	\N	2	B1	\N
101810	δαγκώνω	v	\N	\N	2	B1	\N
101811	τετράγωνο	n	\N	\N	2	B1	το
101812	μπλοκάρω	v	\N	\N	2	B1	\N
101813	επιβιβάζομαι	v	\N	\N	2	B1	\N
101814	βόμβα	n	\N	\N	2	B1	η
101815	βομβαρδίζω	v	\N	\N	2	B1	\N
101816	κράτηση	n	\N	\N	2	B1	η
101817	σύνορο	n	\N	\N	2	B1	το
101818	ενοχλώ	v	\N	\N	2	B1	\N
101819	κατάστημα	n	\N	\N	2	B1	το
101820	κλαδί	n	\N	\N	2	B1	το
101821	μάρκα	n	\N	\N	2	B1	η
101822	γενναίος	adj	\N	\N	2	B1	\N
101823	ανάσα	n	\N	\N	2	B1	η
101824	αναπνέω	v	\N	\N	2	B1	\N
101825	αναπνοή	n	\N	\N	2	B1	η
101826	νύφη	n	\N	\N	2	B1	η
101827	φούσκα	n	\N	\N	2	B1	η
101828	σκάω	v	\N	\N	2	B1	\N
101829	θάβω	v	\N	\N	2	B1	\N
101830	ήρεμος	adj	\N	\N	2	B1	\N
101831	εκστρατεία	n	\N	\N	2	B1	η
101832	πανεπιστημιούπολη	n	\N	\N	2	B1	η
101833	υποψήφιος	n	\N	\N	2	B1	ο
101834	καπέλο	n	\N	\N	2	B1	το
101835	καπετάνιος	n	\N	\N	2	B1	ο
101836	καριέρα	n	\N	\N	2	B1	η
101837	απρόσεκτος	adj	\N	\N	2	B1	\N
101838	κατηγορία	n	\N	\N	2	B1	η
101839	ταβάνι	n	\N	\N	2	B1	το
101840	γιορτή	n	\N	\N	2	B1	η
101841	κεντρικός	adj	\N	\N	2	B1	\N
101842	αιώνας	n	\N	\N	2	B1	ο
101843	τελετή	n	\N	\N	2	B1	η
101844	αλυσίδα	n	\N	\N	2	B1	η
101845	πρόκληση	n	\N	\N	2	B1	η
101846	προκαλώ	v	\N	\N	2	B1	\N
101847	πρωταθλητής	n	\N	\N	2	B1	ο
101848	κανάλι	n	\N	\N	2	B1	το
101849	κεφάλαιο	n	\N	\N	2	B1	το
101850	χρέωση	n	\N	\N	2	B1	η
101851	κατηγορία	n	\N	\N	2	B1	η
101852	χρεώνω	v	\N	\N	2	B1	\N
101853	κλέβω	v	\N	\N	2	B1	\N
101854	αντιγράφω	v	\N	\N	2	B1	\N
101855	χαρούμενος	adj	\N	\N	2	B1	\N
101856	χημική ουσία	n	\N	\N	2	B1	η
101857	χημικός	adj	\N	\N	2	B1	\N
101858	στήθος	n	\N	\N	2	B1	το
101859	παιδική ηλικία	n	\N	\N	2	B1	η
101860	ισχυρισμός	n	\N	\N	2	B1	ο
101861	αξίωση	n	\N	\N	2	B1	η
101862	ισχυρίζομαι	v	\N	\N	2	B1	\N
101863	κλικ	n	\N	\N	2	B1	το
101864	κάνω κλικ	v	\N	\N	2	B1	\N
101865	πελάτης	n	\N	\N	2	B1	ο
101866	κοντινός	adj	\N	\N	2	B1	\N
101867	πανί	n	\N	\N	2	B1	το
101868	ύφασμα	n	\N	\N	2	B1	το
101869	στοιχείο	n	\N	\N	2	B1	το
101870	ένδειξη	n	\N	\N	2	B1	η
101871	πούλμαν	n	\N	\N	2	B1	το
101872	προπονητής	n	\N	\N	2	B1	ο
101873	κάρβουνο	n	\N	\N	2	B1	το
101874	συλλογή	n	\N	\N	2	B1	η
101875	έγχρωμος	adj	\N	\N	2	B1	\N
101876	συνδυάζω	v	\N	\N	2	B1	\N
101877	σχολιάζω	v	\N	\N	2	B1	\N
101878	εμπορικός	adj	\N	\N	2	B1	\N
101879	διαφήμιση	n	\N	\N	2	B1	η
101880	διαπράττω	v	\N	\N	2	B1	\N
101881	επικοινωνία	n	\N	\N	2	B1	η
101882	σύγκριση	n	\N	\N	2	B1	η
101883	ανταγωνιστής	n	\N	\N	2	B1	ο
101884	ανταγωνιστικός	adj	\N	\N	2	B1	\N
101885	παράπονο	n	\N	\N	2	B1	το
101886	σύνθετος	adj	\N	\N	2	B1	\N
101887	περίπλοκος	adj	\N	\N	2	B1	\N
101888	συγκεντρώνομαι	v	\N	\N	2	B1	\N
101889	συμπεραίνω	v	\N	\N	2	B1	\N
101890	σίγουρος	adj	\N	\N	2	B1	\N
101891	επιβεβαιώνω	v	\N	\N	2	B1	\N
101892	μπερδεύω	v	\N	\N	2	B1	\N
101893	μπερδεμένος	adj	\N	\N	2	B1	\N
101894	σύνδεση	n	\N	\N	2	B1	η
101895	επικοινωνώ	v	\N	\N	2	B1	\N
101896	επαφή	n	\N	\N	2	B1	η
101897	δοχείο	n	\N	\N	2	B1	το
101898	περιεχόμενο	n	\N	\N	2	B1	το
101899	συνεχής	adj	\N	\N	2	B1	\N
101900	αντίθεση	n	\N	\N	2	B1	η
101901	κάνω αντίθεση	v	\N	\N	2	B1	\N
101902	βολικός	adj	\N	\N	2	B1	\N
101903	πείθω	v	\N	\N	2	B1	\N
101904	χαλκός	n	\N	\N	2	B1	ο
101905	κοστούμι	n	\N	\N	2	B1	το
101906	εξοχικό	n	\N	\N	2	B1	το
101907	βαμβάκι	n	\N	\N	2	B1	το
101908	επαρχία	n	\N	\N	2	B1	η
101909	δικαστήριο	n	\N	\N	2	B1	το
101910	γήπεδο	n	\N	\N	2	B1	το
101911	εξώφυλλο	n	\N	\N	2	B1	το
101912	κάλυμμα	n	\N	\N	2	B1	το
101913	καλύπτω	v	\N	\N	2	B1	\N
101914	καλυμμένος	adj	\N	\N	2	B1	\N
101915	δημιουργώ	v	\N	\N	2	B1	\N
101916	πίστωση	n	\N	\N	2	B1	η
101917	σκληρός	adj	\N	\N	2	B1	\N
101918	πολιτιστικός	adj	\N	\N	2	B1	\N
101919	πολιτισμός	n	\N	\N	2	B1	ο
101920	νόμισμα	n	\N	\N	2	B1	το
101921	τρέχων	adj	\N	\N	2	B1	\N
101922	επί του παρόντος	adv	\N	\N	2	B1	\N
101923	κουρτίνα	n	\N	\N	2	B1	η
101924	έθιμο	n	\N	\N	2	B1	το
101925	ζημιά	n	\N	\N	2	B1	η
101926	βλάβη	n	\N	\N	2	B1	η
101927	προξενώ ζημιά	v	\N	\N	2	B1	\N
101928	ασχολούμαι	v	\N	\N	2	B1	\N
101929	δεκαετία	n	\N	\N	2	B1	η
101930	διακοσμώ	v	\N	\N	2	B1	\N
101931	οριστικός	adj	\N	\N	2	B1	\N
101932	παραδίδω	v	\N	\N	2	B1	\N
101933	αναχώρηση	n	\N	\N	2	B1	η
101934	επιφάνεια εργασίας	n	\N	\N	2	B1	η
101935	παρά το γεγονός	prep	\N	\N	2	B1	\N
101936	προορισμός	n	\N	\N	2	B1	ο
101937	αποφασισμένος	adj	\N	\N	2	B1	\N
101938	ανάπτυξη	n	\N	\N	2	B1	η
101939	διάγραμμα	n	\N	\N	2	B1	το
101940	διαμάντι	n	\N	\N	2	B1	το
101941	δυσκολία	n	\N	\N	2	B1	η
101942	άμεσος	adj	\N	\N	2	B1	\N
101943	απευθείας	adv	\N	\N	2	B1	\N
101944	βρωμιά	n	\N	\N	2	B1	η
101945	μειονέκτημα	n	\N	\N	2	B1	το
101946	απογοητευμένος	adj	\N	\N	2	B1	\N
101947	απογοητευτικός	adj	\N	\N	2	B1	\N
101948	έκπτωση	n	\N	\N	2	B1	η
101949	συζητώ	v	\N	\N	2	B1	\N
101950	αντιπαθώ	v	\N	\N	2	B1	\N
101951	διαιρώ	v	\N	\N	2	B1	\N
101952	ντοκιμαντέρ	n	\N	\N	2	B1	το
101953	δωρίζω	v	\N	\N	2	B1	\N
101954	αμφιβολία	n	\N	\N	2	B1	η
101955	αμφιβάλλω	v	\N	\N	2	B1	\N
101956	ντυμένος	adj	\N	\N	2	B1	\N
101957	μεθυσμένος	adj	\N	\N	2	B1	\N
101958	αναμενόμενος	adj	\N	\N	2	B1	\N
101959	σκόνη	n	\N	\N	2	B1	η
101960	καθήκον	n	\N	\N	2	B1	το
101961	σεισμός	n	\N	\N	2	B1	ο
101962	ανατολικός	adj	\N	\N	2	B1	\N
101963	οικονομικός	adj	\N	\N	2	B1	\N
101964	οικονομία	n	\N	\N	2	B1	η
101965	άκρη	n	\N	\N	2	B1	η
101966	συντάκτης	n	\N	\N	2	B1	ο
101967	εκπαιδεύω	v	\N	\N	2	B1	\N
101968	μορφωμένος	adj	\N	\N	2	B1	\N
101969	εκπαιδευτικός	adj	\N	\N	2	B1	\N
101970	αποτέλεσμα	n	\N	\N	2	B1	το
101971	επίδραση	n	\N	\N	2	B1	η
101972	αποτελεσματικός	adj	\N	\N	2	B1	\N
101973	αποτελεσματικά	adv	\N	\N	2	B1	\N
101974	προσπάθεια	n	\N	\N	2	B1	η
101975	εκλογή	n	\N	\N	2	B1	η
101976	φέρνω σε δύσκολη θέση	v	\N	\N	2	B1	\N
101977	αμήχανος	adj	\N	\N	2	B1	\N
101978	ντροπιαστικός	adj	\N	\N	2	B1	\N
101979	έκτακτη ανάγκη	n	\N	\N	2	B1	η
101980	συναίσθημα	n	\N	\N	2	B1	το
101981	απασχόληση	n	\N	\N	2	B1	η
101982	ενθαρρύνω	v	\N	\N	2	B1	\N
101983	εχθρός	n	\N	\N	2	B1	ο
101984	αρραβωνιασμένος	adj	\N	\N	2	B1	\N
101985	μηχανική	n	\N	\N	2	B1	η
101986	ψυχαγωγώ	v	\N	\N	2	B1	\N
101987	διασκέδαση	n	\N	\N	2	B1	η
101988	είσοδος	n	\N	\N	2	B1	η
101989	συμμετοχή	n	\N	\N	2	B1	η
101990	περιβάλλον	n	\N	\N	2	B1	το
101991	περιβαλλοντικός	adj	\N	\N	2	B1	\N
101992	επεισόδιο	n	\N	\N	2	B1	το
101993	ίσος	adj	\N	\N	2	B1	\N
101994	εξίσου	adv	\N	\N	2	B1	\N
101995	δραπετεύω	v	\N	\N	2	B1	\N
101996	απαραίτητος	adj	\N	\N	2	B1	\N
101997	εκδήλωση	n	\N	\N	2	B1	η
101998	γεγονός	n	\N	\N	2	B1	το
101999	τελικά	adv	\N	\N	2	B1	\N
102000	εξετάζω	v	\N	\N	2	B1	\N
102001	ανταλλαγή	n	\N	\N	2	B1	η
102002	ανταλλάσσω	v	\N	\N	2	B1	\N
102003	ενθουσιασμός	n	\N	\N	2	B1	ο
102004	έκθεση	n	\N	\N	2	B1	η
102005	επεκτείνω	v	\N	\N	2	B1	\N
102006	αναμενόμενος	adj	\N	\N	2	B1	\N
102007	αποστολή	n	\N	\N	2	B1	η
102008	εκστρατεία	n	\N	\N	2	B1	η
102009	έμπειρος	adj	\N	\N	2	B1	\N
102010	εκρήγνυμαι	v	\N	\N	2	B1	\N
102011	εξερευνώ	v	\N	\N	2	B1	\N
102012	έκρηξη	n	\N	\N	2	B1	η
102013	εξαγωγή	n	\N	\N	2	B1	η
102014	εξάγω	v	\N	\N	2	B1	\N
102015	αντιμετωπίζω	v	\N	\N	2	B1	\N
102016	γεγονός	n	\N	\N	2	B1	το
102017	μάλλον	adv	\N	\N	2	B1	\N
102018	σχετικά	adv	\N	\N	2	B1	\N
102019	οικείος	adj	\N	\N	2	B1	\N
102020	γνώριμος	adj	\N	\N	2	B1	\N
102021	μου αρέσει	v	\N	\N	2	B1	\N
102022	φαντάζομαι	v	\N	\N	2	B1	\N
102023	συναρπαστικός	adj	\N	\N	2	B1	\N
102024	μοντέρνος	adj	\N	\N	2	B1	\N
102025	της μόδας	adj	\N	\N	2	B1	\N
102026	δένω	v	\N	\N	2	B1	\N
102027	ασφαλίζω	v	\N	\N	2	B1	\N
102028	χάρη	n	\N	\N	2	B1	η
102029	φόβος	n	\N	\N	2	B1	ο
102030	φοβάμαι	v	\N	\N	2	B1	\N
102031	χαρακτηριστικό	n	\N	\N	2	B1	το
102032	παρουσιάζω	v	\N	\N	2	B1	\N
102033	ταΐζω	v	\N	\N	2	B1	\N
102034	φράχτης	n	\N	\N	2	B1	ο
102035	μάχη	n	\N	\N	2	B1	η
102036	αριθμός	n	\N	\N	2	B1	ο
102037	φιγούρα	n	\N	\N	2	B1	η
102038	αρχείο	n	\N	\N	2	B1	το
102039	αρχειοθετώ	v	\N	\N	2	B1	\N
102040	οικονομικός	adj	\N	\N	2	B1	\N
102041	πρόστιμο	n	\N	\N	2	B1	το
102042	φυσική κατάσταση	n	\N	\N	2	B1	η
102043	σταθερός	adj	\N	\N	2	B1	\N
102044	καθορισμένος	adj	\N	\N	2	B1	\N
102045	λάμψη	n	\N	\N	2	B1	η
102046	φλας	n	\N	\N	2	B1	το
102047	πλημμύρα	n	\N	\N	2	B1	η
102048	πλημμυρίζω	v	\N	\N	2	B1	\N
102049	αλεύρι	n	\N	\N	2	B1	το
102050	ροή	n	\N	\N	2	B1	η
102051	ρέω	v	\N	\N	2	B1	\N
102052	διπλώνω	v	\N	\N	2	B1	\N
102053	κόσμος	n	\N	\N	2	B1	ο
102054	λαϊκός	adj	\N	\N	2	B1	\N
102055	επόμενος	adj	\N	\N	2	B1	\N
102056	δύναμη	n	\N	\N	2	B1	η
102057	ισχύς	n	\N	\N	2	B1	η
102058	αναγκάζω	v	\N	\N	2	B1	\N
102059	για πάντα	adv	\N	\N	2	B1	\N
102060	πλαίσιο	n	\N	\N	2	B1	το
102061	κορνίζα	n	\N	\N	2	B1	η
102062	παγώνω	v	\N	\N	2	B1	\N
102063	συχνά	adv	\N	\N	2	B1	\N
102064	φιλία	n	\N	\N	2	B1	η
102065	τρομάζω	v	\N	\N	2	B1	\N
102066	τρομαγμένος	adj	\N	\N	2	B1	\N
102067	τρομακτικός	adj	\N	\N	2	B1	\N
102068	κατεψυγμένος	adj	\N	\N	2	B1	\N
102069	τηγανίζω	v	\N	\N	2	B1	\N
102070	καύσιμο	n	\N	\N	2	B1	το
102071	λειτουργία	n	\N	\N	2	B1	η
102072	λειτουργώ	v	\N	\N	2	B1	\N
102073	γούνα	n	\N	\N	2	B1	η
102074	περαιτέρω	adv	\N	\N	2	B1	\N
102075	γκαράζ	n	\N	\N	2	B1	το
102076	συγκεντρώνομαι	v	\N	\N	2	B1	\N
102077	μαζεύω	v	\N	\N	2	B1	\N
102078	γενικά	adv	\N	\N	2	B1	\N
102079	γενιά	n	\N	\N	2	B1	η
102080	γενναιόδωρος	adj	\N	\N	2	B1	\N
102081	ευγενικός	adj	\N	\N	2	B1	\N
102082	πράος	adj	\N	\N	2	B1	\N
102083	κύριος	n	\N	\N	2	B1	ο
102084	φάντασμα	n	\N	\N	2	B1	το
102085	γίγαντας	n	\N	\N	2	B1	ο
102086	γιγαντιαίος	adj	\N	\N	2	B1	\N
102087	συναυλία	n	\N	\N	2	B1	η
102088	εμφάνιση	n	\N	\N	2	B1	η
102089	χαρούμενος	adj	\N	\N	2	B1	\N
102090	ευτυχής	adj	\N	\N	2	B1	\N
102091	παγκόσμιος	adj	\N	\N	2	B1	\N
102092	γάντι	n	\N	\N	2	B1	το
102093	αγαθά	n	\N	\N	2	B1	τα
102094	εμπορεύματα	n	\N	\N	2	B1	τα
102095	βαθμός	n	\N	\N	2	B1	ο
102096	τάξη	n	\N	\N	2	B1	η
102097	αποφοιτώ	v	\N	\N	2	B1	\N
102098	κόκκος	n	\N	\N	2	B1	ο
102099	δημητριακά	n	\N	\N	2	B1	τα
102100	ευγνώμων	adj	\N	\N	2	B1	\N
102101	ανάπτυξη	n	\N	\N	2	B1	η
102102	φύλακας	n	\N	\N	2	B1	ο
102103	φρουρός	n	\N	\N	2	B1	ο
102104	φυλάω	v	\N	\N	2	B1	\N
102105	ένοχος	adj	\N	\N	2	B1	\N
102106	κρεμάω	v	\N	\N	2	B1	\N
102107	ευτυχία	n	\N	\N	2	B1	η
102108	σχεδόν καθόλου	adv	\N	\N	2	B1	\N
102109	μετά βίας	adv	\N	\N	2	B1	\N
102110	τίτλος ειδήσεων	n	\N	\N	2	B1	ο
102111	θέρμανση	n	\N	\N	2	B1	η
102112	βαριά	adv	\N	\N	2	B1	\N
102113	ελικόπτερο	n	\N	\N	2	B1	το
102114	επισημαίνω	v	\N	\N	2	B1	\N
102115	τονίζω	v	\N	\N	2	B1	\N
102116	εξαιρετικά	adv	\N	\N	2	B1	\N
102117	πολύ	adv	\N	\N	2	B1	\N
102118	προσλαμβάνω	v	\N	\N	2	B1	\N
102119	νοικιάζω	v	\N	\N	2	B1	\N
102120	υπαινιγμός	n	\N	\N	2	B1	ο
102121	υπαινίσσομαι	v	\N	\N	2	B1	\N
102122	ιστορικός	adj	\N	\N	2	B1	\N
102123	ειλικρινής	adj	\N	\N	2	B1	\N
102124	μέλι	n	\N	\N	2	B1	το
102125	φρικτός	adj	\N	\N	2	B1	\N
102126	τρόμος	n	\N	\N	2	B1	ο
102127	οικοδεσπότης	n	\N	\N	2	B1	ο
102128	φιλοξενώ	v	\N	\N	2	B1	\N
102129	ωστόσο	adv	\N	\N	2	B1	\N
102130	κυνηγώ	v	\N	\N	2	B1	\N
102131	τυφώνας	n	\N	\N	2	B1	ο
102132	αμαθής	adj	\N	\N	2	B1	\N
102133	αγνοώ	v	\N	\N	2	B1	\N
102134	παράνομος	adj	\N	\N	2	B1	\N
102135	φαντάζομαι	v	\N	\N	2	B1	\N
102136	φανταστικός	adj	\N	\N	2	B1	\N
102137	άμεσος	adj	\N	\N	2	B1	\N
102138	μετανάστης	n	\N	\N	2	B1	ο
102139	αντίκτυπος	n	\N	\N	2	B1	ο
102140	επίδραση	n	\N	\N	2	B1	η
102141	εισαγωγή	n	\N	\N	2	B1	η
102142	εισάγω	v	\N	\N	2	B1	\N
102143	σπουδαιότητα	n	\N	\N	2	B1	η
102144	εντύπωση	n	\N	\N	2	B1	η
102145	εντυπωσιακός	adj	\N	\N	2	B1	\N
102146	βελτιώνω	v	\N	\N	2	B1	\N
102147	βελτίωση	n	\N	\N	2	B1	η
102148	απίστευτα	adv	\N	\N	2	B1	\N
102149	πράγματι	adv	\N	\N	2	B1	\N
102150	υποδεικνύω	v	\N	\N	2	B1	\N
102151	έμμεσος	adj	\N	\N	2	B1	\N
102152	εσωτερικού χώρου	adj	\N	\N	2	B1	\N
102153	μέσα	adv	\N	\N	2	B1	\N
102154	σε εσωτερικό χώρο	adv	\N	\N	2	B1	\N
102155	βρέφος	n	\N	\N	2	B1	το
102156	επιρροή	n	\N	\N	2	B1	η
102157	επηρεάζω	v	\N	\N	2	B1	\N
102158	συστατικό	n	\N	\N	2	B1	το
102159	τραυματίζω	v	\N	\N	2	B1	\N
102160	τραυματισμένος	adj	\N	\N	2	B1	\N
102161	αθώος	adj	\N	\N	2	B1	\N
102162	νοημοσύνη	n	\N	\N	2	B1	η
102163	ευφυΐα	n	\N	\N	2	B1	η
102164	σκοπεύω	v	\N	\N	2	B1	\N
102165	πρόθεση	n	\N	\N	2	B1	η
102166	επενδύω	v	\N	\N	2	B1	\N
102167	ερευνώ	v	\N	\N	2	B1	\N
102168	ανακρίνω	v	\N	\N	2	B1	\N
102169	αναμεμειγμένος	adj	\N	\N	2	B1	\N
102170	σίδερο	n	\N	\N	2	B1	το
102171	σιδερώνω	v	\N	\N	2	B1	\N
102172	ζήτημα	n	\N	\N	2	B1	το
102173	θέμα	n	\N	\N	2	B1	το
102174	πληροφορική	n	\N	\N	2	B1	η
102175	περιοδικό	n	\N	\N	2	B1	το
102176	ημερολόγιο	n	\N	\N	2	B1	το
102177	δικαστής	n	\N	\N	2	B1	ο
102178	κρίνω	v	\N	\N	2	B1	\N
102179	πρόθυμος	adj	\N	\N	2	B1	\N
102180	ένθερμος	adj	\N	\N	2	B1	\N
102181	βασικός	adj	\N	\N	2	B1	\N
102182	κλειδί	adj	\N	\N	2	B1	\N
102183	πληκτρολόγιο	n	\N	\N	2	B1	το
102184	κλοτσάω	v	\N	\N	2	B1	\N
102185	φόνος	n	\N	\N	2	B1	ο
102186	ευγενικός	adj	\N	\N	2	B1	\N
102187	καλόκαρδος	adj	\N	\N	2	B1	\N
102188	βασίλειο	n	\N	\N	2	B1	το
102189	ετικέτα	n	\N	\N	2	B1	η
102190	βάζω ετικέτα	v	\N	\N	2	B1	\N
102191	εργαστήριο	n	\N	\N	2	B1	το
102192	έλλειψη	n	\N	\N	2	B1	η
102193	στερούμαι	v	\N	\N	2	B1	\N
102194	τελευταίος	adj	\N	\N	2	B1	\N
102195	πρόσφατος	adj	\N	\N	2	B1	\N
102196	ακουμπώ	v	\N	\N	2	B1	\N
102197	στρώνω	v	\N	\N	2	B1	\N
102198	στρώμα	n	\N	\N	2	B1	το
102199	επίπεδο	n	\N	\N	2	B1	το
102200	προβάδισμα	n	\N	\N	2	B1	το
102201	κορυφαίος	adj	\N	\N	2	B1	\N
102202	φύλλο	n	\N	\N	2	B1	το
102203	δέρμα	n	\N	\N	2	B1	το
102204	δερμάτινος	adj	\N	\N	2	B1	\N
102205	νόμιμος	adj	\N	\N	2	B1	\N
102206	ελεύθερος χρόνος	n	\N	\N	2	B1	ο
102207	μήκος	n	\N	\N	2	B1	το
102208	ισοπεδώνω	v	\N	\N	2	B1	\N
102209	λέω ψέματα	v	\N	\N	2	B1	\N
102210	κείτομαι	v	\N	\N	2	B1	\N
102211	όριο	n	\N	\N	2	B1	το
102212	περιορίζω	v	\N	\N	2	B1	\N
102213	χείλος	n	\N	\N	2	B1	το
102214	υγρό	n	\N	\N	2	B1	το
102215	λογοτεχνία	n	\N	\N	2	B1	η
102216	διαβίωση	n	\N	\N	2	B1	η
102217	ζωντανός	adj	\N	\N	2	B1	\N
102218	εντοπίζω	v	\N	\N	2	B1	\N
102219	τοποθετώ	v	\N	\N	2	B1	\N
102220	βρίσκεται	adj	\N	\N	2	B1	\N
102221	τοποθεσία	n	\N	\N	2	B1	η
102222	κορμός	n	\N	\N	2	B1	ο
102223	μόνος	adj	\N	\N	2	B1	\N
102224	μοναχικός	adj	\N	\N	2	B1	\N
102225	απώλεια	n	\N	\N	2	B1	η
102226	πολυτέλεια	n	\N	\N	2	B1	η
102227	τρελός	adj	\N	\N	2	B1	\N
102228	μαγεία	n	\N	\N	2	B1	η
102229	κυρίως	adv	\N	\N	2	B1	\N
102230	εμπορικό κέντρο	n	\N	\N	2	B1	το
102231	διοίκηση	n	\N	\N	2	B1	η
102232	διαχείριση	n	\N	\N	2	B1	η
102233	μάρκετινγκ	n	\N	\N	2	B1	το
102234	γάμος	n	\N	\N	2	B1	ο
102235	υλικό	n	\N	\N	2	B1	το
102236	εν τω μεταξύ	adv	\N	\N	2	B1	\N
102237	μέτρο	n	\N	\N	2	B1	το
102238	μετράω	v	\N	\N	2	B1	\N
102239	μεσαίος	adj	\N	\N	2	B1	\N
102240	ψυχικός	adj	\N	\N	2	B1	\N
102241	ακαταστασία	n	\N	\N	2	B1	η
102242	μπέρδεμα	n	\N	\N	2	B1	το
102243	ήπιος	adj	\N	\N	2	B1	\N
102244	ελαφρύς	adj	\N	\N	2	B1	\N
102245	μύλος	n	\N	\N	2	B1	ο
102246	ορυχείο	n	\N	\N	2	B1	το
102247	ανακατεύω	v	\N	\N	2	B1	\N
102248	αναμιγνύω	v	\N	\N	2	B1	\N
102249	μίγμα	n	\N	\N	2	B1	το
102250	μοντέλο	n	\N	\N	2	B1	το
102251	διάθεση	n	\N	\N	2	B1	η
102252	κέφι	n	\N	\N	2	B1	το
102253	λάσπη	n	\N	\N	2	B1	η
102254	φόνος	n	\N	\N	2	B1	ο
102255	δολοφονία	n	\N	\N	2	B1	η
102256	δολοφονώ	v	\N	\N	2	B1	\N
102257	μυς	n	\N	\N	2	B1	ο
102258	μυστήριο	n	\N	\N	2	B1	το
102259	νύχι	n	\N	\N	2	B1	το
102260	καρφί	n	\N	\N	2	B1	το
102261	αφήγηση	n	\N	\N	2	B1	η
102262	έθνος	n	\N	\N	2	B1	το
102263	ντόπιος	adj	\N	\N	2	B1	\N
102264	ιθαγενής	n	\N	\N	2	B1	ο
102265	φυσικά	adv	\N	\N	2	B1	\N
102266	αναγκαστικά	adv	\N	\N	2	B1	\N
102267	βελόνα	n	\N	\N	2	B1	η
102268	αρνητικός	adj	\N	\N	2	B1	\N
102269	γειτονιά	n	\N	\N	2	B1	η
102270	ούτε	conj	\N	\N	2	B1	\N
102271	δίκτυ	n	\N	\N	2	B1	το
102272	δίχτυ	n	\N	\N	2	B1	το
102273	κανονικός	adj	\N	\N	2	B1	\N
102274	βόρειος	adj	\N	\N	2	B1	\N
102275	σημειώνω	v	\N	\N	2	B1	\N
102276	πυρηνικός	adj	\N	\N	2	B1	\N
102277	προφανής	adj	\N	\N	2	B1	\N
102278	προφανώς	adv	\N	\N	2	B1	\N
102279	περίσταση	n	\N	\N	2	B1	η
102280	συμβαίνω	v	\N	\N	2	B1	\N
102281	παράξενος	adj	\N	\N	2	B1	\N
102282	μονός	adj	\N	\N	2	B1	\N
102283	επίσημος	adj	\N	\N	2	B1	\N
102284	παλιομοδίτικος	adj	\N	\N	2	B1	\N
102285	μόλις	conj	\N	\N	2	B1	\N
102286	άποψη	n	\N	\N	2	B1	η
102287	γνώμη	n	\N	\N	2	B1	η
102288	εγχείρηση	n	\N	\N	2	B1	η
102289	λειτουργία	n	\N	\N	2	B1	η
102290	ευκαιρία	n	\N	\N	2	B1	η
102291	οργανωμένος	adj	\N	\N	2	B1	\N
102292	διοργανωτής	n	\N	\N	2	B1	ο
102293	πρωτότυπος	adj	\N	\N	2	B1	\N
102294	αρχικός	adj	\N	\N	2	B1	\N
102295	αρχικά	adv	\N	\N	2	B1	\N
102296	πρέπει	v	\N	\N	2	B1	\N
102297	δικός μας	pron	\N	\N	2	B1	\N
102298	εξωτερικός	adj	\N	\N	2	B1	\N
102299	έξω	adv	\N	\N	2	B1	\N
102300	πακέτο	n	\N	\N	2	B1	το
102301	σημειωματάριο	n	\N	\N	2	B1	το
102302	επίθεμα	n	\N	\N	2	B1	το
102303	επώδυνος	adj	\N	\N	2	B1	\N
102304	χλωμός	adj	\N	\N	2	B1	\N
102305	τηγάνι	n	\N	\N	2	B1	το
102306	συμμετέχω	v	\N	\N	2	B1	\N
102307	ιδιαίτερα	adv	\N	\N	2	B1	\N
102308	πάθος	n	\N	\N	2	B1	το
102309	μονοπάτι	n	\N	\N	2	B1	το
102310	πληρωμή	n	\N	\N	2	B1	η
102311	ειρηνικός	adj	\N	\N	2	B1	\N
102312	ήσυχος	adj	\N	\N	2	B1	\N
102313	ποσοστό	n	\N	\N	2	B1	το
102314	τέλεια	adv	\N	\N	2	B1	\N
102315	παράσταση	n	\N	\N	2	B1	η
102316	επίδοση	n	\N	\N	2	B1	η
102317	προσωπικά	adv	\N	\N	2	B1	\N
102318	απαισιόδοξος	adj	\N	\N	2	B1	\N
102319	πείθω	v	\N	\N	2	B1	\N
102320	φωτογράφος	n	\N	\N	2	B1	ο
102321	φωτογραφία	n	\N	\N	2	B1	η
102322	πινέζα	n	\N	\N	2	B1	η
102323	καρφίτσα	n	\N	\N	2	B1	η
102324	καρφιτσώνω	v	\N	\N	2	B1	\N
102325	σωλήνας	n	\N	\N	2	B1	ο
102326	πίπα	n	\N	\N	2	B1	η
102327	σχεδιασμός	n	\N	\N	2	B1	ο
102328	προγραμματισμός	n	\N	\N	2	B1	ο
102329	ευχάριστος	adj	\N	\N	2	B1	\N
102330	ευχαρίστηση	n	\N	\N	2	B1	η
102331	απόλαυση	n	\N	\N	2	B1	η
102332	άφθονος	pron	\N	\N	2	B1	\N
102333	μπόλικος	pron	\N	\N	2	B1	\N
102334	πλοκή	n	\N	\N	2	B1	η
102335	σχέδιο	n	\N	\N	2	B1	το
102336	συν	prep	\N	\N	2	B1	\N
102337	επιπλέον	conj	\N	\N	2	B1	\N
102338	ποίημα	n	\N	\N	2	B1	το
102339	ποιητής	n	\N	\N	2	B1	ο
102340	ποίηση	n	\N	\N	2	B1	η
102341	δείχνω	v	\N	\N	2	B1	\N
102342	σημαδεύω	v	\N	\N	2	B1	\N
102343	δηλητήριο	n	\N	\N	2	B1	το
102344	δηλητηριάζω	v	\N	\N	2	B1	\N
102345	δηλητηριώδης	adj	\N	\N	2	B1	\N
102346	πολιτική	n	\N	\N	2	B1	η
102347	τακτική	n	\N	\N	2	B1	η
102348	πολιτικός	adj	\N	\N	2	B1	\N
102349	πολιτικός	n	\N	\N	2	B1	ο
102350	πολιτική επιστήμη	n	\N	\N	2	B1	η
102351	λιμάνι	n	\N	\N	2	B1	το
102352	πορτρέτο	n	\N	\N	2	B1	το
102353	θέση	n	\N	\N	2	B1	η
102354	τοποθεσία	n	\N	\N	2	B1	η
102355	θετικός	adj	\N	\N	2	B1	\N
102356	πιθανώς	adv	\N	\N	2	B1	\N
102357	ίσως	adv	\N	\N	2	B1	\N
102358	γλάστρα	n	\N	\N	2	B1	η
102359	κατσαρόλα	n	\N	\N	2	B1	η
102360	ρίχνω	v	\N	\N	2	B1	\N
102361	φτώχεια	n	\N	\N	2	B1	η
102362	σκόνη	n	\N	\N	2	B1	η
102363	πούδρα	n	\N	\N	2	B1	η
102364	δύναμη	n	\N	\N	2	B1	η
102365	ισχύς	n	\N	\N	2	B1	η
102366	ισχυρός	adj	\N	\N	2	B1	\N
102367	δυνατός	adj	\N	\N	2	B1	\N
102368	πρακτικός	adj	\N	\N	2	B1	\N
102369	προσεύχομαι	v	\N	\N	2	B1	\N
102370	προσευχή	n	\N	\N	2	B1	η
102371	προσόν	n	\N	\N	2	B1	το
102372	πτυχίο	n	\N	\N	2	B1	το
102373	πιστοποιημένος	adj	\N	\N	2	B1	\N
102374	ειδικευμένος	adj	\N	\N	2	B1	\N
102375	προκρίνομαι	v	\N	\N	2	B1	\N
102376	παίρνω πτυχίο	v	\N	\N	2	B1	\N
102377	ουρά	n	\N	\N	2	B1	η
102378	περιμένω στην ουρά	v	\N	\N	2	B1	\N
102379	παραιτούμαι	v	\N	\N	2	B1	\N
102380	σταματώ	v	\N	\N	2	B1	\N
102381	παράθεση	n	\N	\N	2	B1	η
102382	απόσπασμα	n	\N	\N	2	B1	το
102383	παραθέτω	v	\N	\N	2	B1	\N
102384	αγώνας δρόμου	n	\N	\N	2	B1	ο
102385	φυλή	n	\N	\N	2	B1	η
102386	αγώνες	n	\N	\N	2	B1	οι
102387	ποικιλία	n	\N	\N	2	B1	η
102388	εύρος	n	\N	\N	2	B1	το
102389	σπάνιος	adj	\N	\N	2	B1	\N
102390	σπάνια	adv	\N	\N	2	B1	\N
102391	αντίδραση	n	\N	\N	2	B1	η
102392	πραγματικότητα	n	\N	\N	2	B1	η
102393	απόδειξη	n	\N	\N	2	B1	η
102394	σύσταση	n	\N	\N	2	B1	η
102395	αναφορά	n	\N	\N	2	B1	η
102396	παραπομπή	n	\N	\N	2	B1	η
102397	αντανακλώ	v	\N	\N	2	B1	\N
102398	τακτικά	adv	\N	\N	2	B1	\N
102399	απορρίπτω	v	\N	\N	2	B1	\N
102400	σχετίζομαι	v	\N	\N	2	B1	\N
102401	σχετικός	adj	\N	\N	2	B1	\N
102402	σχέση	n	\N	\N	2	B1	η
102403	συγγενής	n	\N	\N	2	B1	ο/η
102404	χαλαρός	adj	\N	\N	2	B1	\N
102405	χαλαρωτικός	adj	\N	\N	2	B1	\N
102406	αποδεσμεύω	v	\N	\N	2	B1	\N
102407	κυκλοφορώ	v	\N	\N	2	B1	\N
102408	αξιόπιστος	adj	\N	\N	2	B1	\N
102409	θρησκεία	n	\N	\N	2	B1	η
102410	θρησκευτικός	adj	\N	\N	2	B1	\N
102411	παραμένω	v	\N	\N	2	B1	\N
102412	υπενθυμίζω	v	\N	\N	2	B1	\N
102413	απομακρυσμένος	adj	\N	\N	2	B1	\N
102414	ενοίκιο	n	\N	\N	2	B1	το
102415	νοικιάζω	v	\N	\N	2	B1	\N
102416	επαναλαμβανόμενος	adj	\N	\N	2	B1	\N
102417	αντιπροσωπεύω	v	\N	\N	2	B1	\N
102418	απαιτώ	v	\N	\N	2	B1	\N
102419	κράτηση	n	\N	\N	2	B1	η
102420	πόρος	n	\N	\N	2	B1	ο
102421	σεβασμός	n	\N	\N	2	B1	ο
102422	σέβομαι	v	\N	\N	2	B1	\N
102423	απάντηση	n	\N	\N	2	B1	η
102424	ανταπόκριση	n	\N	\N	2	B1	η
102425	υπευθυνότητα	n	\N	\N	2	B1	η
102426	υπεύθυνος	adj	\N	\N	2	B1	\N
102427	αποτέλεσμα	n	\N	\N	2	B1	το
102428	συνταξιοδοτούμαι	v	\N	\N	2	B1	\N
102429	συνταξιούχος	adj	\N	\N	2	B1	\N
102430	κάνω επανάληψη	v	\N	\N	2	B1	\N
102431	τουφέκι	n	\N	\N	2	B1	το
102432	ανεβαίνω	v	\N	\N	2	B1	\N
102433	αυξάνομαι	v	\N	\N	2	B1	\N
102434	ρίσκο	n	\N	\N	2	B1	το
102435	κίνδυνος	n	\N	\N	2	B1	ο
102436	ρισκάρω	v	\N	\N	2	B1	\N
102437	ρομπότ	n	\N	\N	2	B1	το
102438	κυλάω	v	\N	\N	2	B1	\N
102439	ρομαντικός	adj	\N	\N	2	B1	\N
102440	σκοινί	n	\N	\N	2	B1	το
102441	τραχύς	adj	\N	\N	2	B1	\N
102442	άγριος	adj	\N	\N	2	B1	\N
102443	σειρά	n	\N	\N	2	B1	η
102444	γραμμή	n	\N	\N	2	B1	η
102445	βασιλικός	adj	\N	\N	2	B1	\N
102446	ράγκμπι	n	\N	\N	2	B1	το
102447	κυβερνώ	v	\N	\N	2	B1	\N
102448	ορίζω	v	\N	\N	2	B1	\N
102449	ασφάλεια	n	\N	\N	2	B1	η
102450	ναύτης	n	\N	\N	2	B1	ο
102451	δείγμα	n	\N	\N	2	B1	το
102452	άμμος	n	\N	\N	2	B1	η
102453	σαρώνω	v	\N	\N	2	B1	\N
102454	επιστημονικός	adj	\N	\N	2	B1	\N
102455	σενάριο	n	\N	\N	2	B1	το
102456	γλυπτό	n	\N	\N	2	B1	το
102457	δευτεροβάθμιος	adj	\N	\N	2	B1	\N
102458	ασφάλεια	n	\N	\N	2	B1	η
102459	φύλαξη	n	\N	\N	2	B1	η
102460	σπόρος	n	\N	\N	2	B1	ο
102461	λογικός	adj	\N	\N	2	B1	\N
102462	συνετός	adj	\N	\N	2	B1	\N
102463	χωρίζω	v	\N	\N	2	B1	\N
102464	διαχωρίζω	v	\N	\N	2	B1	\N
102465	σοβαρά	adv	\N	\N	2	B1	\N
102466	υπηρέτης	n	\N	\N	2	B1	ο
102467	ορίζω	v	\N	\N	2	B1	\N
102468	ρυθμίζω	v	\N	\N	2	B1	\N
102469	σετ	n	\N	\N	2	B1	το
102470	σκηνικό	n	\N	\N	2	B1	το
102471	περιβάλλον	n	\N	\N	2	B1	το
102472	φύλο	n	\N	\N	2	B1	το
102473	σεξουαλικός	adj	\N	\N	2	B1	\N
102474	κοφτερός	adj	\N	\N	2	B1	\N
102475	αιχμηρός	adj	\N	\N	2	B1	\N
102476	ράφι	n	\N	\N	2	B1	το
102477	κοχύλι	n	\N	\N	2	B1	το
102478	κέλυφος	n	\N	\N	2	B1	το
102479	βάρδια	n	\N	\N	2	B1	η
102480	μετατοπίζω	v	\N	\N	2	B1	\N
102481	λάμπω	v	\N	\N	2	B1	\N
102482	γυαλίζω	v	\N	\N	2	B1	\N
102483	λαμπερός	adj	\N	\N	2	B1	\N
102484	γυαλιστερός	adj	\N	\N	2	B1	\N
102485	πυροβολώ	v	\N	\N	2	B1	\N
102486	τραβάω φωτογραφία	v	\N	\N	2	B1	\N
102487	σοκ	n	\N	\N	2	B1	το
102488	σοκάρω	v	\N	\N	2	B1	\N
102489	βολή	n	\N	\N	2	B1	η
102490	πυροβολισμός	n	\N	\N	2	B1	ο
102491	ντροπαλός	adj	\N	\N	2	B1	\N
102492	θέα	n	\N	\N	2	B1	η
102493	όραση	n	\N	\N	2	B1	η
102494	σήμα	n	\N	\N	2	B1	το
102495	σιωπηλός	adj	\N	\N	2	B1	\N
102496	βουβός	adj	\N	\N	2	B1	\N
102497	ανόητος	adj	\N	\N	2	B1	\N
102498	χαζός	adj	\N	\N	2	B1	\N
102499	ομοιότητα	n	\N	\N	2	B1	η
102500	παρόμοια	adv	\N	\N	2	B1	\N
102501	απλά	adv	\N	\N	2	B1	\N
102502	από τότε που	conj	\N	\N	2	B1	\N
102503	εφόσον	conj	\N	\N	2	B1	\N
102504	βυθίζομαι	v	\N	\N	2	B1	\N
102505	δεξιότητα	n	\N	\N	2	B1	η
102506	ικανότητα	n	\N	\N	2	B1	η
102507	παραλείπω	v	\N	\N	2	B1	\N
102508	πηδάω	v	\N	\N	2	B1	\N
102509	βροντάω	v	\N	\N	2	B1	\N
102510	χαστουκίζω	v	\N	\N	2	B1	\N
102511	φέτα	n	\N	\N	2	B1	η
102512	κόβω σε φέτες	v	\N	\N	2	B1	\N
102513	ελαφρώς	adv	\N	\N	2	B1	\N
102514	έξυπνος	adj	\N	\N	2	B1	\N
102515	κομψός	adj	\N	\N	2	B1	\N
102516	λείος	adj	\N	\N	2	B1	\N
102517	ομαλός	adj	\N	\N	2	B1	\N
102518	κοινωνία	n	\N	\N	2	B1	η
102519	λογισμικό	n	\N	\N	2	B1	το
102520	έδαφος	n	\N	\N	2	B1	το
102521	στερεός	adj	\N	\N	2	B1	\N
102522	συμπαγής	adj	\N	\N	2	B1	\N
102523	λύνω	v	\N	\N	2	B1	\N
102524	επιλύω	v	\N	\N	2	B1	\N
102525	ταξινομώ	v	\N	\N	2	B1	\N
102526	ξεδιαλέγω	v	\N	\N	2	B1	\N
102527	νότιος	adj	\N	\N	2	B1	\N
102528	ανεπιθύμητη αλληλογραφία	n	\N	\N	2	B1	η
102529	συγκεκριμένα	adv	\N	\N	2	B1	\N
102530	ειδικά	adv	\N	\N	2	B1	\N
102531	ταχύτητα	n	\N	\N	2	B1	η
102532	δαπάνες	n	\N	\N	2	B1	οι
102533	έξοδα	n	\N	\N	2	B1	τα
102534	καυτερός	adj	\N	\N	2	B1	\N
102535	πικάντικος	adj	\N	\N	2	B1	\N
102536	πνεύμα	n	\N	\N	2	B1	το
102537	προφορικός	adj	\N	\N	2	B1	\N
102538	σημάδι	n	\N	\N	2	B1	το
102539	κηλίδα	n	\N	\N	2	B1	η
102540	εντοπίζω	v	\N	\N	2	B1	\N
102541	διαδίδω	v	\N	\N	2	B1	\N
102542	απλώνω	v	\N	\N	2	B1	\N
102543	άνοιξη	n	\N	\N	2	B1	η
102544	ελατήριο	n	\N	\N	2	B1	το
102545	κατάσκοπος	n	\N	\N	2	B1	ο
102546	κατασκοπεύω	v	\N	\N	2	B1	\N
102547	στάδιο	n	\N	\N	2	B1	το
102548	προσωπικό	n	\N	\N	2	B1	το
102549	πρότυπο	n	\N	\N	2	B1	το
102550	επίπεδο	n	\N	\N	2	B1	το
102551	δηλώνω	v	\N	\N	2	B1	\N
102552	άγαλμα	n	\N	\N	2	B1	το
102553	κολλάω	v	\N	\N	2	B1	\N
102554	μπήγω	v	\N	\N	2	B1	\N
102555	ξύλο	n	\N	\N	2	B1	το
102556	ραβδί	n	\N	\N	2	B1	το
102557	αποθηκεύω	v	\N	\N	2	B1	\N
102558	ξένος	n	\N	\N	2	B1	ο
102559	δύναμη	n	\N	\N	2	B1	η
102560	σπάγγος	n	\N	\N	2	B1	ο
102561	σθεναρά	adv	\N	\N	2	B1	\N
102562	έντονα	adv	\N	\N	2	B1	\N
102563	στούντιο	n	\N	\N	2	B1	το
102564	πράγματα	n	\N	\N	2	B1	τα
102565	υλικό	n	\N	\N	2	B1	το
102566	με επιτυχία	adv	\N	\N	2	B1	\N
102567	επιτυχημένα	adv	\N	\N	2	B1	\N
102568	ξαφνικός	adj	\N	\N	2	B1	\N
102569	αιφνίδιος	adj	\N	\N	2	B1	\N
102570	υποφέρω	v	\N	\N	2	B1	\N
102571	πάσχω	v	\N	\N	2	B1	\N
102572	ταιριάζω	v	\N	\N	2	B1	\N
102573	πηγαίνω	v	\N	\N	2	B1	\N
102574	κατάλληλος	adj	\N	\N	2	B1	\N
102575	επιτυχία	n	\N	\N	2	B1	η
102576	συνοψίζω	v	\N	\N	2	B1	\N
102577	περίληψη	n	\N	\N	2	B1	η
102578	προμήθεια	n	\N	\N	2	B1	η
102579	απόθεμα	n	\N	\N	2	B1	το
102580	προμηθεύω	v	\N	\N	2	B1	\N
102581	παρέχω	v	\N	\N	2	B1	\N
102582	υποστηρικτής	n	\N	\N	2	B1	ο
102583	σίγουρα	adv	\N	\N	2	B1	\N
102584	ασφαλώς	adv	\N	\N	2	B1	\N
102585	επιφάνεια	n	\N	\N	2	B1	η
102586	επιβιώνω	v	\N	\N	2	B1	\N
102587	έρευνα	n	\N	\N	2	B1	η
102588	δημοσκόπηση	n	\N	\N	2	B1	η
102589	διακόπτης	n	\N	\N	2	B1	ο
102590	αλλάζω	v	\N	\N	2	B1	\N
102591	σπαθί	n	\N	\N	2	B1	το
102592	σύμπτωμα	n	\N	\N	2	B1	το
102593	ουρά	n	\N	\N	2	B1	η
102594	ταλέντο	n	\N	\N	2	B1	το
102595	ταλαντούχος	adj	\N	\N	2	B1	\N
102596	ταινία	n	\N	\N	2	B1	η
102597	φόρος	n	\N	\N	2	B1	ο
102598	τεχνικός	adj	\N	\N	2	B1	\N
102599	τεχνική	n	\N	\N	2	B1	η
102600	τείνω	v	\N	\N	2	B1	\N
102601	θέμα	n	\N	\N	2	B1	το
102602	αν και	conj	\N	\N	2	B1	\N
102603	όμως	adv	\N	\N	2	B1	\N
102604	λαιμός	n	\N	\N	2	B1	ο
102605	καθ’ όλη τη διάρκεια	prep	\N	\N	2	B1	\N
102606	παντού	adv	\N	\N	2	B1	\N
102607	στενός	adj	\N	\N	2	B1	\N
102608	σφιχτός	adj	\N	\N	2	B1	\N
102609	μέχρι	conj	\N	\N	2	B1	\N
102610	έως	prep	\N	\N	2	B1	\N
102611	τενεκές	n	\N	\N	2	B1	ο
102612	κονσέρβα	n	\N	\N	2	B1	η
102613	λιλιπούτειος	adj	\N	\N	2	B1	\N
102614	μικροσκοπικός	adj	\N	\N	2	B1	\N
102615	γλώσσα	n	\N	\N	2	B1	η
102616	ζήτημα	n	\N	\N	2	B1	το
102617	συνολικός	adj	\N	\N	2	B1	\N
102618	σύνολο	n	\N	\N	2	B1	το
102619	εντελώς	adv	\N	\N	2	B1	\N
102620	πλήρως	adv	\N	\N	2	B1	\N
102621	εμπόριο	n	\N	\N	2	B1	το
102622	εμπορεύομαι	v	\N	\N	2	B1	\N
102623	τρέιλερ	n	\N	\N	2	B1	το
102624	μεταφράζω	v	\N	\N	2	B1	\N
102625	μετάφραση	n	\N	\N	2	B1	η
102626	συμπεριφέρομαι	v	\N	\N	2	B1	\N
102627	θεραπεύω	v	\N	\N	2	B1	\N
102628	θεραπεία	n	\N	\N	2	B1	η
102629	μεταχείριση	n	\N	\N	2	B1	η
102630	τάση	n	\N	\N	2	B1	η
102631	κόλπο	n	\N	\N	2	B1	το
102632	τεχνάσμα	n	\N	\N	2	B1	το
102633	αλήθεια	n	\N	\N	2	B1	η
102634	σωλήνας	n	\N	\N	2	B1	ο
102635	πληκτρολογώ	v	\N	\N	2	B1	\N
102636	τυπικά	adv	\N	\N	2	B1	\N
102637	λάστιχο	n	\N	\N	2	B1	το
102638	άσχημος	adj	\N	\N	2	B1	\N
102639	ανίκανος	adj	\N	\N	2	B1	\N
102640	άβολος	adj	\N	\N	2	B1	\N
102641	εσώρουχα	n	\N	\N	2	B1	τα
102642	άνεργος	adj	\N	\N	2	B1	\N
102643	ανεργία	n	\N	\N	2	B1	η
102644	άδικος	adj	\N	\N	2	B1	\N
102645	ένωση	n	\N	\N	2	B1	η
102646	συνδικάτο	n	\N	\N	2	B1	το
102647	εκτός αν	conj	\N	\N	2	B1	\N
102648	σε αντίθεση με	prep	\N	\N	2	B1	\N
102649	ανόμοιος	adj	\N	\N	2	B1	\N
102650	απίθανος	adj	\N	\N	2	B1	\N
102651	περιττός	adj	\N	\N	2	B1	\N
102652	αχρείαστος	adj	\N	\N	2	B1	\N
102653	δυσάρεστος	adj	\N	\N	2	B1	\N
102654	ενημερώνω	v	\N	\N	2	B1	\N
102655	επικαιροποιώ	v	\N	\N	2	B1	\N
102656	πάνω σε	prep	\N	\N	2	B1	\N
102657	αναστατώνω	v	\N	\N	2	B1	\N
102658	μεταχειρισμένος	adj	\N	\N	2	B1	\N
102659	πολύτιμος	adj	\N	\N	2	B1	\N
102660	αξία	n	\N	\N	2	B1	η
102661	διάφοροι	adj	\N	\N	2	B1	\N
102662	ποικίλοι	adj	\N	\N	2	B1	\N
102663	όχημα	n	\N	\N	2	B1	το
102664	έκδοση	n	\N	\N	2	B1	η
102665	εκδοχή	n	\N	\N	2	B1	η
102666	θύμα	n	\N	\N	2	B1	το
102667	βίαιος	adj	\N	\N	2	B1	\N
102668	εθελοντής	n	\N	\N	2	B1	ο
102669	προσφέρω εθελοντικά	v	\N	\N	2	B1	\N
102670	ψήφος	n	\N	\N	2	B1	η
102671	ψηφίζω	v	\N	\N	2	B1	\N
102672	προειδοποιώ	v	\N	\N	2	B1	\N
102673	προειδοποίηση	n	\N	\N	2	B1	η
102674	απόβλητα	n	\N	\N	2	B1	τα
102675	σπατάλη	n	\N	\N	2	B1	η
102676	σπαταλώ	v	\N	\N	2	B1	\N
102677	όπλο	n	\N	\N	2	B1	το
102678	ζυγίζω	v	\N	\N	2	B1	\N
102679	δυτικός	adj	\N	\N	2	B1	\N
102680	οτιδήποτε	pron	\N	\N	2	B1	\N
102681	οποτεδήποτε	conj	\N	\N	2	B1	\N
102682	αν	conj	\N	\N	2	B1	\N
102683	καθώς	conj	\N	\N	2	B1	\N
102684	ενώ	conj	\N	\N	2	B1	\N
102685	φτερό	n	\N	\N	2	B1	το
102686	πτέρυγα	n	\N	\N	2	B1	η
102687	εντός	prep	\N	\N	2	B1	\N
102688	μέσα σε	prep	\N	\N	2	B1	\N
102689	αναρωτιέμαι	v	\N	\N	2	B1	\N
102690	μαλλί	n	\N	\N	2	B1	το
102691	παγκόσμιος	adj	\N	\N	2	B1	\N
102692	αξίζει	adj	\N	\N	2	B1	\N
102693	ρυτίδα	n	\N	\N	2	B1	η
102694	γραπτός	adj	\N	\N	2	B1	\N
102695	αυλή	n	\N	\N	2	B1	η
102696	ουρλιάζω	v	\N	\N	2	B1	\N
102697	νεολαία	n	\N	\N	2	B1	η
102698	νιάτα	n	\N	\N	2	B1	τα
7233	adjective	noun	\N	\N	1	A2	\N
7234	adverb	noun	\N	\N	1	B1	\N
7235	advise	verb	\N	\N	1	B1	\N
7236	aerobics	noun	\N	\N	1	A2	\N
2576	abandon	v	\N	\N	1	B2	\N
2577	absent	adj	\N	\N	1	B2	\N
2578	absolute	adj	\N	\N	1	B2	\N
2579	absorb	v	\N	\N	1	B2	\N
2580	abstract	adj	\N	\N	1	B2	\N
2581	academic	adj	\N	\N	1	B2	\N
2582	accent	n	\N	\N	1	B2	\N
2583	acceptable	adj	\N	\N	1	B2	\N
2584	accidentally	adv	\N	\N	1	B2	\N
2585	accommodate	v	\N	\N	1	B2	\N
2586	accompany	v	\N	\N	1	B2	\N
2587	accomplish	v	\N	\N	1	B2	\N
2588	account for	v	\N	\N	1	B2	\N
2589	accountant	n	\N	\N	1	B2	\N
2590	accuracy	n	\N	\N	1	B2	\N
2591	accurate	adj	\N	\N	1	B2	\N
2592	accurately	adv	\N	\N	1	B2	\N
2593	accuse	v	\N	\N	1	B2	\N
2594	acknowledge	v	\N	\N	1	B2	\N
2595	acquire	v	\N	\N	1	B2	\N
2596	acre	n	\N	\N	1	B2	\N
2597	activate	v	\N	\N	1	B2	\N
2598	actual	adj	\N	\N	1	B2	\N
2599	adapt	v	\N	\N	1	B2	\N
2600	addiction	n	\N	\N	1	B2	\N
2601	additional	adj	\N	\N	1	B2	\N
2602	additionally	adv	\N	\N	1	B2	\N
2603	address	v	\N	\N	1	B2	\N
2604	adequate	adj	\N	\N	1	B2	\N
2605	adequately	adv	\N	\N	1	B2	\N
2606	adjust	v	\N	\N	1	B2	\N
2607	administration	n	\N	\N	1	B2	\N
2608	adopt	v	\N	\N	1	B2	\N
2609	advance	n	\N	\N	1	B2	\N
2610	affair	n	\N	\N	1	B2	\N
2611	affordable	adj	\N	\N	1	B2	\N
2612	afterwards	adv	\N	\N	1	B2	\N
2613	agency	n	\N	\N	1	B2	\N
2614	agenda	n	\N	\N	1	B2	\N
2615	aggressive	adj	\N	\N	1	B2	\N
2616	agriculture	n	\N	\N	1	B2	\N
2617	aid	n	\N	\N	1	B2	\N
2618	AIDS	n	\N	\N	1	B2	\N
2619	aircraft	n	\N	\N	1	B2	\N
2620	alarm	v	\N	\N	1	B2	\N
2621	alien	n	\N	\N	1	B2	\N
2622	alongside	prep	\N	\N	1	B2	\N
2623	alter	v	\N	\N	1	B2	\N
2624	altogether	adv	\N	\N	1	B2	\N
2625	ambulance	n	\N	\N	1	B2	\N
2626	amusing	adj	\N	\N	1	B2	\N
2627	analyse	v	\N	\N	1	B2	\N
2628	analysis	n	\N	\N	1	B2	\N
2629	analyst	n	\N	\N	1	B2	\N
2630	ancestor	n	\N	\N	1	B2	\N
2631	angel	n	\N	\N	1	B2	\N
2632	anger	n	\N	\N	1	B2	\N
2633	angle	n	\N	\N	1	B2	\N
2634	animation	n	\N	\N	1	B2	\N
2635	anniversary	n	\N	\N	1	B2	\N
2636	annual	adj	\N	\N	1	B2	\N
2637	annually	adv	\N	\N	1	B2	\N
2638	anticipate	v	\N	\N	1	B2	\N
2639	anxiety	n	\N	\N	1	B2	\N
2640	anxious	adj	\N	\N	1	B2	\N
2641	apology	n	\N	\N	1	B2	\N
2642	apparent	adj	\N	\N	1	B2	\N
2643	apparently	adv	\N	\N	1	B2	\N
2644	appeal	n	\N	\N	1	B2	\N
2645	applicant	n	\N	\N	1	B2	\N
2646	approach	n	\N	\N	1	B2	\N
2647	appropriate	adj	\N	\N	1	B2	\N
2648	appropriately	adv	\N	\N	1	B2	\N
2649	approval	n	\N	\N	1	B2	\N
2650	approve	v	\N	\N	1	B2	\N
2651	arise	v	\N	\N	1	B2	\N
2652	armed	adj	\N	\N	1	B2	\N
2653	arms	n	\N	\N	1	B2	\N
2654	arrow	n	\N	\N	1	B2	\N
2655	artificial	adj	\N	\N	1	B2	\N
2656	artistic	adj	\N	\N	1	B2	\N
2657	artwork	n	\N	\N	1	B2	\N
2658	ashamed	adj	\N	\N	1	B2	\N
2659	aspect	n	\N	\N	1	B2	\N
2660	assess	v	\N	\N	1	B2	\N
2661	assessment	n	\N	\N	1	B2	\N
2662	asset	n	\N	\N	1	B2	\N
2663	assign	v	\N	\N	1	B2	\N
2664	assistance	n	\N	\N	1	B2	\N
2665	associate	v	\N	\N	1	B2	\N
2666	associated	adj	\N	\N	1	B2	\N
2667	association	n	\N	\N	1	B2	\N
2668	assume	v	\N	\N	1	B2	\N
2669	assumption	n	\N	\N	1	B2	\N
2670	assure	v	\N	\N	1	B2	\N
2671	astonishing	adj	\N	\N	1	B2	\N
2672	athletic	adj	\N	\N	1	B2	\N
2673	attachment	n	\N	\N	1	B2	\N
2674	attempt	n	\N	\N	1	B2	\N
2675	audio	adj	\N	\N	1	B2	\N
2676	awareness	n	\N	\N	1	B2	\N
2677	awkward	adj	\N	\N	1	B2	\N
2678	bacteria	n	\N	\N	1	B2	\N
2679	badge	n	\N	\N	1	B2	\N
2680	balanced	adj	\N	\N	1	B2	\N
2681	ballet	n	\N	\N	1	B2	\N
2682	balloon	n	\N	\N	1	B2	\N
2683	barely	adv	\N	\N	1	B2	\N
2684	bargain	n	\N	\N	1	B2	\N
2685	barrier	n	\N	\N	1	B2	\N
2686	based on	adj	\N	\N	1	B2	\N
2687	basement	n	\N	\N	1	B2	\N
2688	basically	adv	\N	\N	1	B2	\N
2689	basis	n	\N	\N	1	B2	\N
2690	basket	n	\N	\N	1	B2	\N
2691	bat	n	\N	\N	1	B2	\N
2692	bear	v	\N	\N	1	B2	\N
2693	beg	v	\N	\N	1	B2	\N
2694	being	n	\N	\N	1	B2	\N
2695	beneficial	adj	\N	\N	1	B2	\N
2696	bent	adj	\N	\N	1	B2	\N
2697	beside	prep	\N	\N	1	B2	\N
2698	besides	prep	\N	\N	1	B2	\N
2699	bet	v	\N	\N	1	B2	\N
2700	beyond	prep	\N	\N	1	B2	\N
2701	bias	n	\N	\N	1	B2	\N
2702	bid	v	\N	\N	1	B2	\N
2703	biological	adj	\N	\N	1	B2	\N
2704	bitter	adj	\N	\N	1	B2	\N
2705	blame	n	\N	\N	1	B2	\N
2706	blanket	n	\N	\N	1	B2	\N
2707	blind	adj	\N	\N	1	B2	\N
2708	bold	adj	\N	\N	1	B2	\N
2709	bombing	n	\N	\N	1	B2	\N
2710	bond	n	\N	\N	1	B2	\N
2711	boost	v	\N	\N	1	B2	\N
2712	bound	adj	\N	\N	1	B2	\N
2713	breast	n	\N	\N	1	B2	\N
2714	brick	n	\N	\N	1	B2	\N
2715	brief	adj	\N	\N	1	B2	\N
2716	briefly	adv	\N	\N	1	B2	\N
2717	broad	adj	\N	\N	1	B2	\N
2718	broadcast	n	\N	\N	1	B2	\N
2719	broadcaster	n	\N	\N	1	B2	\N
2720	broadly	adv	\N	\N	1	B2	\N
2721	buck	n	\N	\N	1	B2	\N
2722	budget	n	\N	\N	1	B2	\N
2723	bug	n	\N	\N	1	B2	\N
2724	bullet	n	\N	\N	1	B2	\N
2725	bunch	n	\N	\N	1	B2	\N
2726	bush	n	\N	\N	1	B2	\N
2727	but	prep	\N	\N	1	B2	\N
2728	cabin	n	\N	\N	1	B2	\N
2729	cable	n	\N	\N	1	B2	\N
2730	calculate	v	\N	\N	1	B2	\N
2731	canal	n	\N	\N	1	B2	\N
2732	cancel	v	\N	\N	1	B2	\N
2733	cancer	n	\N	\N	1	B2	\N
2734	candle	n	\N	\N	1	B2	\N
2735	capable	adj	\N	\N	1	B2	\N
2736	capacity	n	\N	\N	1	B2	\N
2737	capture	v	\N	\N	1	B2	\N
2738	carbon	n	\N	\N	1	B2	\N
2739	cast	n	\N	\N	1	B2	\N
2740	casual	adj	\N	\N	1	B2	\N
2741	catastrophe	n	\N	\N	1	B2	\N
2742	cave	n	\N	\N	1	B2	\N
2743	cell	n	\N	\N	1	B2	\N
2744	certainty	n	\N	\N	1	B2	\N
2745	certificate	n	\N	\N	1	B2	\N
2746	chairman	n	\N	\N	1	B2	\N
2747	challenging	adj	\N	\N	1	B2	\N
2748	championship	n	\N	\N	1	B2	\N
2749	characteristic	n	\N	\N	1	B2	\N
2750	charming	adj	\N	\N	1	B2	\N
2751	chase	v	\N	\N	1	B2	\N
2752	cheek	n	\N	\N	1	B2	\N
2753	cheer	v	\N	\N	1	B2	\N
2754	chief	adj	\N	\N	1	B2	\N
2755	chop	v	\N	\N	1	B2	\N
2756	circuit	n	\N	\N	1	B2	\N
2757	circumstance	n	\N	\N	1	B2	\N
2758	cite	v	\N	\N	1	B2	\N
2759	citizen	n	\N	\N	1	B2	\N
2760	civil	adj	\N	\N	1	B2	\N
2761	civilization	n	\N	\N	1	B2	\N
2762	clarify	v	\N	\N	1	B2	\N
2763	classic	adj	\N	\N	1	B2	\N
2764	classify	v	\N	\N	1	B2	\N
2765	clause	n	\N	\N	1	B2	\N
2766	cliff	n	\N	\N	1	B2	\N
2767	clinic	n	\N	\N	1	B2	\N
2768	clip	n	\N	\N	1	B2	\N
2769	closely	adv	\N	\N	1	B2	\N
2770	coincidence	n	\N	\N	1	B2	\N
2771	collapse	v	\N	\N	1	B2	\N
2772	collector	n	\N	\N	1	B2	\N
2773	colony	n	\N	\N	1	B2	\N
2774	colourful	adj	\N	\N	1	B2	\N
2775	combination	n	\N	\N	1	B2	\N
2776	comfort	n	\N	\N	1	B2	\N
2777	comic	adj	\N	\N	1	B2	\N
2778	command	n	\N	\N	1	B2	\N
2779	commander	n	\N	\N	1	B2	\N
2780	commission	n	\N	\N	1	B2	\N
2781	commitment	n	\N	\N	1	B2	\N
2782	committee	n	\N	\N	1	B2	\N
2783	commonly	adv	\N	\N	1	B2	\N
2784	comparative	adj	\N	\N	1	B2	\N
2785	completion	n	\N	\N	1	B2	\N
2786	complicated	adj	\N	\N	1	B2	\N
2787	component	n	\N	\N	1	B2	\N
2788	compose	v	\N	\N	1	B2	\N
2789	composer	n	\N	\N	1	B2	\N
2790	compound	n	\N	\N	1	B2	\N
2791	comprehensive	adj	\N	\N	1	B2	\N
2792	compulsory	adj	\N	\N	1	B2	\N
2793	concentration	n	\N	\N	1	B2	\N
2794	concept	n	\N	\N	1	B2	\N
2795	concern	n	\N	\N	1	B2	\N
2796	concerned	adj	\N	\N	1	B2	\N
2797	conclusion	n	\N	\N	1	B2	\N
2798	concrete	adj	\N	\N	1	B2	\N
2799	conduct	v	\N	\N	1	B2	\N
2800	confess	v	\N	\N	1	B2	\N
2801	confidence	n	\N	\N	1	B2	\N
2802	conflict	n	\N	\N	1	B2	\N
2803	confusing	adj	\N	\N	1	B2	\N
2804	confusion	n	\N	\N	1	B2	\N
2805	conscious	adj	\N	\N	1	B2	\N
2806	consequence	n	\N	\N	1	B2	\N
2807	consequently	adv	\N	\N	1	B2	\N
2808	conservation	n	\N	\N	1	B2	\N
2809	conservative	adj	\N	\N	1	B2	\N
2810	considerable	adj	\N	\N	1	B2	\N
2811	considerably	adv	\N	\N	1	B2	\N
2812	consideration	n	\N	\N	1	B2	\N
2813	consist of	v	\N	\N	1	B2	\N
2814	consistent	adj	\N	\N	1	B2	\N
2815	consistently	adv	\N	\N	1	B2	\N
2816	conspiracy	n	\N	\N	1	B2	\N
2817	constant	adj	\N	\N	1	B2	\N
2818	constantly	adv	\N	\N	1	B2	\N
2819	construct	v	\N	\N	1	B2	\N
2820	construction	n	\N	\N	1	B2	\N
2821	consult	v	\N	\N	1	B2	\N
2822	consultant	n	\N	\N	1	B2	\N
2823	consumer	n	\N	\N	1	B2	\N
2824	consumption	n	\N	\N	1	B2	\N
2825	contemporary	adj	\N	\N	1	B2	\N
2826	contest	n	\N	\N	1	B2	\N
2827	context	n	\N	\N	1	B2	\N
2828	contract	n	\N	\N	1	B2	\N
2829	contribute	v	\N	\N	1	B2	\N
2830	contribution	n	\N	\N	1	B2	\N
2831	controversial	adj	\N	\N	1	B2	\N
2832	controversy	n	\N	\N	1	B2	\N
2833	convenience	n	\N	\N	1	B2	\N
2834	convention	n	\N	\N	1	B2	\N
2835	conventional	adj	\N	\N	1	B2	\N
2836	convert	v	\N	\N	1	B2	\N
2837	convey	v	\N	\N	1	B2	\N
2838	convinced	adj	\N	\N	1	B2	\N
2839	convincing	adj	\N	\N	1	B2	\N
2840	cope	v	\N	\N	1	B2	\N
2841	core	n	\N	\N	1	B2	\N
2842	corporate	adj	\N	\N	1	B2	\N
2843	corporation	n	\N	\N	1	B2	\N
2844	corridor	n	\N	\N	1	B2	\N
2845	council	n	\N	\N	1	B2	\N
2846	counter	n	\N	\N	1	B2	\N
2847	county	n	\N	\N	1	B2	\N
2848	courage	n	\N	\N	1	B2	\N
2849	coverage	n	\N	\N	1	B2	\N
2850	cowboy	n	\N	\N	1	B2	\N
2851	crack	v	\N	\N	1	B2	\N
2852	crash	n	\N	\N	1	B2	\N
2853	creation	n	\N	\N	1	B2	\N
2854	creativity	n	\N	\N	1	B2	\N
2855	creature	n	\N	\N	1	B2	\N
2856	crew	n	\N	\N	1	B2	\N
2857	crisis	n	\N	\N	1	B2	\N
2858	critic	n	\N	\N	1	B2	\N
2859	critical	adj	\N	\N	1	B2	\N
2860	critically	adv	\N	\N	1	B2	\N
2861	criticism	n	\N	\N	1	B2	\N
2862	criticise	v	\N	\N	1	B2	\N
2863	crop	n	\N	\N	1	B2	\N
2864	crucial	adj	\N	\N	1	B2	\N
2865	cruise	n	\N	\N	1	B2	\N
2866	cue	n	\N	\N	1	B2	\N
2867	cure	n	\N	\N	1	B2	\N
2868	curious	adj	\N	\N	1	B2	\N
2869	curriculum	n	\N	\N	1	B2	\N
2870	curve	n	\N	\N	1	B2	\N
2871	curved	adj	\N	\N	1	B2	\N
2872	dairy	n	\N	\N	1	B2	\N
2873	dare	v	\N	\N	1	B2	\N
2874	darkness	n	\N	\N	1	B2	\N
2875	data	n	\N	\N	1	B2	\N
2876	database	n	\N	\N	1	B2	\N
2877	deadline	n	\N	\N	1	B2	\N
2878	deadly	adj	\N	\N	1	B2	\N
2879	dealer	n	\N	\N	1	B2	\N
2880	debate	n	\N	\N	1	B2	\N
2881	debt	n	\N	\N	1	B2	\N
2882	decent	adj	\N	\N	1	B2	\N
2883	deck	n	\N	\N	1	B2	\N
2884	declare	v	\N	\N	1	B2	\N
2885	decline	n	\N	\N	1	B2	\N
2886	decoration	n	\N	\N	1	B2	\N
2887	decrease	v	\N	\N	1	B2	\N
2888	deeply	adv	\N	\N	1	B2	\N
2889	defeat	n	\N	\N	1	B2	\N
2890	defence	n	\N	\N	1	B2	\N
2891	defend	v	\N	\N	1	B2	\N
2892	defender	n	\N	\N	1	B2	\N
2893	define	v	\N	\N	1	B2	\N
2894	definition	n	\N	\N	1	B2	\N
2895	delay	n	\N	\N	1	B2	\N
2896	delete	v	\N	\N	1	B2	\N
2897	deliberate	adj	\N	\N	1	B2	\N
2898	deliberately	adv	\N	\N	1	B2	\N
2899	delight	n	\N	\N	1	B2	\N
2900	delighted	adj	\N	\N	1	B2	\N
2901	delivery	n	\N	\N	1	B2	\N
2902	demand	n	\N	\N	1	B2	\N
2903	democracy	n	\N	\N	1	B2	\N
2904	democratic	adj	\N	\N	1	B2	\N
2905	demonstrate	v	\N	\N	1	B2	\N
2906	demonstration	n	\N	\N	1	B2	\N
2907	deny	v	\N	\N	1	B2	\N
2908	depart	v	\N	\N	1	B2	\N
2909	dependent	adj	\N	\N	1	B2	\N
2910	deposit	n	\N	\N	1	B2	\N
2911	depressed	adj	\N	\N	1	B2	\N
2912	depressing	adj	\N	\N	1	B2	\N
2913	depression	n	\N	\N	1	B2	\N
2914	depth	n	\N	\N	1	B2	\N
2915	derive	v	\N	\N	1	B2	\N
2916	deserve	v	\N	\N	1	B2	\N
2917	desire	n	\N	\N	1	B2	\N
2918	desperate	adj	\N	\N	1	B2	\N
2919	desperately	adv	\N	\N	1	B2	\N
2920	destruction	n	\N	\N	1	B2	\N
2921	detailed	adj	\N	\N	1	B2	\N
2922	detect	v	\N	\N	1	B2	\N
2923	determine	v	\N	\N	1	B2	\N
2924	determination	n	\N	\N	1	B2	\N
2925	devil	n	\N	\N	1	B2	\N
2926	devote	v	\N	\N	1	B2	\N
2927	differ	v	\N	\N	1	B2	\N
2928	dig	v	\N	\N	1	B2	\N
2929	dime	n	\N	\N	1	B2	\N
2930	disability	n	\N	\N	1	B2	\N
2931	disabled	adj	\N	\N	1	B2	\N
2932	disagreement	n	\N	\N	1	B2	\N
2933	disappoint	v	\N	\N	1	B2	\N
2934	disappointment	n	\N	\N	1	B2	\N
2935	disc	n	\N	\N	1	B2	\N
2936	discipline	n	\N	\N	1	B2	\N
2937	discourage	v	\N	\N	1	B2	\N
2938	dishonest	adj	\N	\N	1	B2	\N
2939	dismiss	v	\N	\N	1	B2	\N
2940	disorder	n	\N	\N	1	B2	\N
2941	display	n	\N	\N	1	B2	\N
2942	distant	adj	\N	\N	1	B2	\N
2943	distinct	adj	\N	\N	1	B2	\N
2944	distinguish	v	\N	\N	1	B2	\N
2945	distract	v	\N	\N	1	B2	\N
2946	distribute	v	\N	\N	1	B2	\N
2947	distribution	n	\N	\N	1	B2	\N
2948	district	n	\N	\N	1	B2	\N
2949	disturb	v	\N	\N	1	B2	\N
2950	dive	v	\N	\N	1	B2	\N
2951	diverse	adj	\N	\N	1	B2	\N
2952	diversity	n	\N	\N	1	B2	\N
2953	division	n	\N	\N	1	B2	\N
2954	divorce	n	\N	\N	1	B2	\N
2955	document	n	\N	\N	1	B2	\N
2956	domestic	adj	\N	\N	1	B2	\N
2957	dominant	adj	\N	\N	1	B2	\N
2958	dominate	v	\N	\N	1	B2	\N
2959	donation	n	\N	\N	1	B2	\N
2960	dot	n	\N	\N	1	B2	\N
2961	downwards	adv	\N	\N	1	B2	\N
2962	dozen	n	\N	\N	1	B2	\N
2963	draft	n	\N	\N	1	B2	\N
2964	drag	v	\N	\N	1	B2	\N
2965	dramatic	adj	\N	\N	1	B2	\N
2966	dramatically	adv	\N	\N	1	B2	\N
2967	drought	n	\N	\N	1	B2	\N
2968	dull	adj	\N	\N	1	B2	\N
2969	dump	v	\N	\N	1	B2	\N
2970	duration	n	\N	\N	1	B2	\N
2971	dynamic	adj	\N	\N	1	B2	\N
2972	eager	adj	\N	\N	1	B2	\N
2973	economics	n	\N	\N	1	B2	\N
2974	economist	n	\N	\N	1	B2	\N
2975	edit	v	\N	\N	1	B2	\N
2976	edition	n	\N	\N	1	B2	\N
2977	editorial	n	\N	\N	1	B2	\N
2978	efficient	adj	\N	\N	1	B2	\N
2979	efficiently	adv	\N	\N	1	B2	\N
2980	elbow	n	\N	\N	1	B2	\N
2981	elderly	adj	\N	\N	1	B2	\N
2982	elect	v	\N	\N	1	B2	\N
2983	element	n	\N	\N	1	B2	\N
2984	electronics	n	\N	\N	1	B2	\N
2985	elegant	adj	\N	\N	1	B2	\N
2986	elementary	adj	\N	\N	1	B2	\N
2987	eliminate	v	\N	\N	1	B2	\N
2988	elsewhere	adv	\N	\N	1	B2	\N
2989	embrace	v	\N	\N	1	B2	\N
2990	emerge	v	\N	\N	1	B2	\N
2991	emission	n	\N	\N	1	B2	\N
2992	emotional	adj	\N	\N	1	B2	\N
2993	emotionally	adv	\N	\N	1	B2	\N
2994	emphasis	n	\N	\N	1	B2	\N
2995	emphasise	v	\N	\N	1	B2	\N
2996	empire	n	\N	\N	1	B2	\N
2997	enable	v	\N	\N	1	B2	\N
2998	encounter	v	\N	\N	1	B2	\N
2999	engage	v	\N	\N	1	B2	\N
3000	enhance	v	\N	\N	1	B2	\N
3001	enjoyable	adj	\N	\N	1	B2	\N
3002	enquiry	n	\N	\N	1	B2	\N
3003	ensure	v	\N	\N	1	B2	\N
3004	entertaining	adj	\N	\N	1	B2	\N
3005	enthusiasm	n	\N	\N	1	B2	\N
3006	enthusiastic	adj	\N	\N	1	B2	\N
3007	entire	adj	\N	\N	1	B2	\N
3008	entirely	adv	\N	\N	1	B2	\N
3009	entrepreneur	n	\N	\N	1	B2	\N
3010	envelope	n	\N	\N	1	B2	\N
3011	equip	v	\N	\N	1	B2	\N
3012	equivalent	adj	\N	\N	1	B2	\N
3013	era	n	\N	\N	1	B2	\N
3014	erupt	v	\N	\N	1	B2	\N
3015	essentially	adv	\N	\N	1	B2	\N
3016	establish	v	\N	\N	1	B2	\N
3017	estate	n	\N	\N	1	B2	\N
3018	estimate	n	\N	\N	1	B2	\N
3019	ethic	n	\N	\N	1	B2	\N
3020	ethical	adj	\N	\N	1	B2	\N
3021	ethnic	adj	\N	\N	1	B2	\N
3022	evaluate	v	\N	\N	1	B2	\N
3023	evaluation	n	\N	\N	1	B2	\N
3024	even	adv	\N	\N	1	B2	\N
3025	evidence	n	\N	\N	1	B2	\N
3026	evident	adj	\N	\N	1	B2	\N
3027	evil	adj	\N	\N	1	B2	\N
3028	evolution	n	\N	\N	1	B2	\N
3029	evolve	v	\N	\N	1	B2	\N
3030	examination	n	\N	\N	1	B2	\N
3031	exceed	v	\N	\N	1	B2	\N
3032	exception	n	\N	\N	1	B2	\N
3033	excessive	adj	\N	\N	1	B2	\N
3034	exclude	v	\N	\N	1	B2	\N
3035	excuse	n	\N	\N	1	B2	\N
3036	executive	n	\N	\N	1	B2	\N
3037	existence	n	\N	\N	1	B2	\N
3038	exotic	adj	\N	\N	1	B2	\N
3039	expansion	n	\N	\N	1	B2	\N
3040	expectation	n	\N	\N	1	B2	\N
3041	expense	n	\N	\N	1	B2	\N
3042	expertise	n	\N	\N	1	B2	\N
3043	exploit	v	\N	\N	1	B2	\N
3044	exploration	n	\N	\N	1	B2	\N
3045	expose	v	\N	\N	1	B2	\N
3046	exposure	n	\N	\N	1	B2	\N
3047	extend	v	\N	\N	1	B2	\N
3048	extension	n	\N	\N	1	B2	\N
3049	extensive	adj	\N	\N	1	B2	\N
3050	extensively	adv	\N	\N	1	B2	\N
3051	extent	n	\N	\N	1	B2	\N
3052	external	adj	\N	\N	1	B2	\N
3053	extract	n	\N	\N	1	B2	\N
3054	extraordinary	adj	\N	\N	1	B2	\N
3055	fabric	n	\N	\N	1	B2	\N
3056	fabulous	adj	\N	\N	1	B2	\N
3057	facility	n	\N	\N	1	B2	\N
3058	factor	n	\N	\N	1	B2	\N
3059	faculty	n	\N	\N	1	B2	\N
3060	failed	adj	\N	\N	1	B2	\N
3061	failure	n	\N	\N	1	B2	\N
3062	faith	n	\N	\N	1	B2	\N
3063	fake	adj	\N	\N	1	B2	\N
3064	fame	n	\N	\N	1	B2	\N
3065	fantasy	n	\N	\N	1	B2	\N
3066	fare	n	\N	\N	1	B2	\N
3067	fault	n	\N	\N	1	B2	\N
3068	favour	n	\N	\N	1	B2	\N
3069	feather	n	\N	\N	1	B2	\N
3070	fee	n	\N	\N	1	B2	\N
3071	feedback	n	\N	\N	1	B2	\N
3072	fellow	adj	\N	\N	1	B2	\N
3073	finance	n	\N	\N	1	B2	\N
3074	finding	n	\N	\N	1	B2	\N
3075	firefighter	n	\N	\N	1	B2	\N
3076	firework	n	\N	\N	1	B2	\N
3077	firm	n	\N	\N	1	B2	\N
3078	firmly	adv	\N	\N	1	B2	\N
3079	flame	n	\N	\N	1	B2	\N
3080	flash	v	\N	\N	1	B2	\N
3081	flavour	n	\N	\N	1	B2	\N
3082	flexible	adj	\N	\N	1	B2	\N
3083	float	v	\N	\N	1	B2	\N
3084	folding	adj	\N	\N	1	B2	\N
3085	fond	adj	\N	\N	1	B2	\N
3086	fool	n	\N	\N	1	B2	\N
3087	forbid	v	\N	\N	1	B2	\N
3088	forecast	n	\N	\N	1	B2	\N
3089	forgive	v	\N	\N	1	B2	\N
3090	format	n	\N	\N	1	B2	\N
3091	formation	n	\N	\N	1	B2	\N
3092	former	adj	\N	\N	1	B2	\N
3093	formerly	adv	\N	\N	1	B2	\N
3094	fortunate	adj	\N	\N	1	B2	\N
3095	fortune	n	\N	\N	1	B2	\N
3096	forum	n	\N	\N	1	B2	\N
3097	found	v	\N	\N	1	B2	\N
3098	foundation	n	\N	\N	1	B2	\N
3099	founder	n	\N	\N	1	B2	\N
3100	fraction	n	\N	\N	1	B2	\N
3101	fragment	n	\N	\N	1	B2	\N
3102	framework	n	\N	\N	1	B2	\N
3103	fraud	n	\N	\N	1	B2	\N
3104	freedom	n	\N	\N	1	B2	\N
3105	freely	adv	\N	\N	1	B2	\N
3106	frequency	n	\N	\N	1	B2	\N
3107	frequent	adj	\N	\N	1	B2	\N
3108	frustrated	adj	\N	\N	1	B2	\N
3109	fulfil	v	\N	\N	1	B2	\N
3110	full-time	adj	\N	\N	1	B2	\N
3111	fully	adv	\N	\N	1	B2	\N
3112	fund	n	\N	\N	1	B2	\N
3113	fundamental	adj	\N	\N	1	B2	\N
3114	fundamentally	adv	\N	\N	1	B2	\N
3115	funding	n	\N	\N	1	B2	\N
3116	funeral	n	\N	\N	1	B2	\N
3117	furious	adj	\N	\N	1	B2	\N
3118	furthermore	adv	\N	\N	1	B2	\N
3119	gain	v	\N	\N	1	B2	\N
3120	gallon	n	\N	\N	1	B2	\N
3121	gaming	n	\N	\N	1	B2	\N
3122	gang	n	\N	\N	1	B2	\N
3123	gay	adj	\N	\N	1	B2	\N
3124	gender	n	\N	\N	1	B2	\N
3125	gene	n	\N	\N	1	B2	\N
3126	generate	v	\N	\N	1	B2	\N
3127	genetic	adj	\N	\N	1	B2	\N
3128	genius	n	\N	\N	1	B2	\N
3129	genre	n	\N	\N	1	B2	\N
3130	genuine	adj	\N	\N	1	B2	\N
3131	genuinely	adv	\N	\N	1	B2	\N
3132	gesture	n	\N	\N	1	B2	\N
3133	globalization	n	\N	\N	1	B2	\N
3134	globe	n	\N	\N	1	B2	\N
3135	golden	adj	\N	\N	1	B2	\N
3136	goodness	n	\N	\N	1	B2	\N
3137	gorgeous	adj	\N	\N	1	B2	\N
3138	govern	v	\N	\N	1	B2	\N
3139	grab	v	\N	\N	1	B2	\N
3140	gradually	adv	\N	\N	1	B2	\N
3141	grand	adj	\N	\N	1	B2	\N
3142	grant	n	\N	\N	1	B2	\N
3143	graphic	adj	\N	\N	1	B2	\N
3144	graphics	n	\N	\N	1	B2	\N
3145	grave	n	\N	\N	1	B2	\N
3146	greatly	adv	\N	\N	1	B2	\N
3147	greenhouse	n	\N	\N	1	B2	\N
3148	guarantee	v	\N	\N	1	B2	\N
3149	guideline	n	\N	\N	1	B2	\N
3150	habitat	n	\N	\N	1	B2	\N
3151	handle	v	\N	\N	1	B2	\N
3152	harbour	n	\N	\N	1	B2	\N
3153	harm	n	\N	\N	1	B2	\N
3154	harmful	adj	\N	\N	1	B2	\N
3155	headquarters	n	\N	\N	1	B2	\N
3157	healthcare	n	\N	\N	1	B2	\N
3158	hearing	n	\N	\N	1	B2	\N
3159	heaven	n	\N	\N	1	B2	\N
3160	heel	n	\N	\N	1	B2	\N
3161	hell	n	\N	\N	1	B2	\N
3162	helmet	n	\N	\N	1	B2	\N
3163	herb	n	\N	\N	1	B2	\N
3164	hesitate	v	\N	\N	1	B2	\N
3165	hidden	adj	\N	\N	1	B2	\N
3166	hilarious	adj	\N	\N	1	B2	\N
3167	hip	n	\N	\N	1	B2	\N
3168	historian	n	\N	\N	1	B2	\N
3169	hollow	adj	\N	\N	1	B2	\N
3170	holy	adj	\N	\N	1	B2	\N
3171	homeless	adj	\N	\N	1	B2	\N
3172	honesty	n	\N	\N	1	B2	\N
3173	honour	n	\N	\N	1	B2	\N
3174	hook	n	\N	\N	1	B2	\N
3175	hopefully	adv	\N	\N	1	B2	\N
3176	household	n	\N	\N	1	B2	\N
3177	housing	n	\N	\N	1	B2	\N
3178	humorous	adj	\N	\N	1	B2	\N
3179	humour	n	\N	\N	1	B2	\N
3180	hunger	n	\N	\N	1	B2	\N
3181	hunting	n	\N	\N	1	B2	\N
3182	icon	n	\N	\N	1	B2	\N
3183	ID	n	\N	\N	1	B2	\N
3184	ideal	adj	\N	\N	1	B2	\N
3185	identical	adj	\N	\N	1	B2	\N
3186	identity	n	\N	\N	1	B2	\N
3187	illusion	n	\N	\N	1	B2	\N
3188	illustrate	v	\N	\N	1	B2	\N
3189	illustration	n	\N	\N	1	B2	\N
3190	imagination	n	\N	\N	1	B2	\N
3191	immigration	n	\N	\N	1	B2	\N
3192	immune	adj	\N	\N	1	B2	\N
3193	impatient	adj	\N	\N	1	B2	\N
3194	implement	v	\N	\N	1	B2	\N
3195	implication	n	\N	\N	1	B2	\N
3196	imply	v	\N	\N	1	B2	\N
3197	impose	v	\N	\N	1	B2	\N
3198	impress	v	\N	\N	1	B2	\N
3199	impressed	adj	\N	\N	1	B2	\N
3200	incentive	n	\N	\N	1	B2	\N
3201	inch	n	\N	\N	1	B2	\N
3202	incident	n	\N	\N	1	B2	\N
3203	income	n	\N	\N	1	B2	\N
3204	incorporate	v	\N	\N	1	B2	\N
3205	incorrect	adj	\N	\N	1	B2	\N
3206	increasingly	adv	\N	\N	1	B2	\N
3207	independence	n	\N	\N	1	B2	\N
3208	index	n	\N	\N	1	B2	\N
3209	indication	n	\N	\N	1	B2	\N
3210	industrial	adj	\N	\N	1	B2	\N
3211	inevitable	adj	\N	\N	1	B2	\N
3212	inevitably	adv	\N	\N	1	B2	\N
3213	infection	n	\N	\N	1	B2	\N
3214	infer	v	\N	\N	1	B2	\N
3215	inflation	n	\N	\N	1	B2	\N
3216	info	n	\N	\N	1	B2	\N
3217	inform	v	\N	\N	1	B2	\N
3218	inhabitant	n	\N	\N	1	B2	\N
3219	inherit	v	\N	\N	1	B2	\N
3220	initial	adj	\N	\N	1	B2	\N
3221	initially	adv	\N	\N	1	B2	\N
3222	initiative	n	\N	\N	1	B2	\N
3223	ink	n	\N	\N	1	B2	\N
3224	inner	adj	\N	\N	1	B2	\N
3225	innovation	n	\N	\N	1	B2	\N
3226	innovative	adj	\N	\N	1	B2	\N
3227	input	n	\N	\N	1	B2	\N
3228	insert	v	\N	\N	1	B2	\N
3229	insight	n	\N	\N	1	B2	\N
3230	insist	v	\N	\N	1	B2	\N
3231	inspector	n	\N	\N	1	B2	\N
3232	inspire	v	\N	\N	1	B2	\N
3233	install	v	\N	\N	1	B2	\N
3234	installation	n	\N	\N	1	B2	\N
3235	instance	n	\N	\N	1	B2	\N
3236	instant	adj	\N	\N	1	B2	\N
3237	instantly	adv	\N	\N	1	B2	\N
3238	institute	n	\N	\N	1	B2	\N
3239	institution	n	\N	\N	1	B2	\N
3240	insurance	n	\N	\N	1	B2	\N
3241	integrate	v	\N	\N	1	B2	\N
3242	intellectual	adj	\N	\N	1	B2	\N
3243	intended	adj	\N	\N	1	B2	\N
3244	intense	adj	\N	\N	1	B2	\N
3245	interact	v	\N	\N	1	B2	\N
3246	interaction	n	\N	\N	1	B2	\N
3247	internal	adj	\N	\N	1	B2	\N
3248	interpret	v	\N	\N	1	B2	\N
3249	interpretation	n	\N	\N	1	B2	\N
3250	interrupt	v	\N	\N	1	B2	\N
3251	interval	n	\N	\N	1	B2	\N
3252	invade	v	\N	\N	1	B2	\N
3253	invasion	n	\N	\N	1	B2	\N
3254	investigation	n	\N	\N	1	B2	\N
3255	investment	n	\N	\N	1	B2	\N
3256	investor	n	\N	\N	1	B2	\N
3257	isolate	v	\N	\N	1	B2	\N
3258	isolated	adj	\N	\N	1	B2	\N
3259	issue	v	\N	\N	1	B2	\N
3260	jail	n	\N	\N	1	B2	\N
3261	jet	n	\N	\N	1	B2	\N
3262	joint	n	\N	\N	1	B2	\N
3263	journalism	n	\N	\N	1	B2	\N
3264	joy	n	\N	\N	1	B2	\N
3265	judgement	n	\N	\N	1	B2	\N
3266	junior	adj	\N	\N	1	B2	\N
3267	jury	n	\N	\N	1	B2	\N
3268	justice	n	\N	\N	1	B2	\N
3269	justify	v	\N	\N	1	B2	\N
3270	kidnap	v	\N	\N	1	B2	\N
3271	kidney	n	\N	\N	1	B2	\N
3272	kindergarten	n	\N	\N	1	B2	\N
3273	kit	n	\N	\N	1	B2	\N
3274	labour	n	\N	\N	1	B2	\N
3275	ladder	n	\N	\N	1	B2	\N
3276	landing	n	\N	\N	1	B2	\N
3277	landscape	n	\N	\N	1	B2	\N
3278	lane	n	\N	\N	1	B2	\N
3279	largely	adv	\N	\N	1	B2	\N
3280	laser	n	\N	\N	1	B2	\N
3281	lately	adv	\N	\N	1	B2	\N
3282	launch	v	\N	\N	1	B2	\N
3283	leadership	n	\N	\N	1	B2	\N
3284	league	n	\N	\N	1	B2	\N
3285	lean	v	\N	\N	1	B2	\N
3286	legend	n	\N	\N	1	B2	\N
3287	lens	n	\N	\N	1	B2	\N
3288	licence	n	\N	\N	1	B2	\N
3289	lifetime	n	\N	\N	1	B2	\N
3290	lighting	n	\N	\N	1	B2	\N
3291	likewise	adv	\N	\N	1	B2	\N
3292	limitation	n	\N	\N	1	B2	\N
3293	limited	adj	\N	\N	1	B2	\N
3294	literally	adv	\N	\N	1	B2	\N
3295	literary	adj	\N	\N	1	B2	\N
3296	litter	n	\N	\N	1	B2	\N
3297	lively	adj	\N	\N	1	B2	\N
3298	liver	n	\N	\N	1	B2	\N
3299	load	n	\N	\N	1	B2	\N
3300	loan	n	\N	\N	1	B2	\N
3301	logical	adj	\N	\N	1	B2	\N
3302	logo	n	\N	\N	1	B2	\N
3303	long-term	adj	\N	\N	1	B2	\N
3304	loose	adj	\N	\N	1	B2	\N
3305	lord	n	\N	\N	1	B2	\N
3306	lottery	n	\N	\N	1	B2	\N
3307	lower	v	\N	\N	1	B2	\N
3308	loyal	adj	\N	\N	1	B2	\N
3309	lung	n	\N	\N	1	B2	\N
3310	lyric	n	\N	\N	1	B2	\N
3311	magnificent	adj	\N	\N	1	B2	\N
3312	maintain	v	\N	\N	1	B2	\N
3313	majority	n	\N	\N	1	B2	\N
3314	makeup	n	\N	\N	1	B2	\N
3315	making	n	\N	\N	1	B2	\N
3316	manufacture	v	\N	\N	1	B2	\N
3317	manufacturing	n	\N	\N	1	B2	\N
3318	marathon	n	\N	\N	1	B2	\N
3319	margin	n	\N	\N	1	B2	\N
3320	marker	n	\N	\N	1	B2	\N
3321	martial	adj	\N	\N	1	B2	\N
3322	mass	n	\N	\N	1	B2	\N
3323	massive	adj	\N	\N	1	B2	\N
3324	master	n	\N	\N	1	B2	\N
3325	matching	adj	\N	\N	1	B2	\N
3326	mate	n	\N	\N	1	B2	\N
3327	maximum	n	\N	\N	1	B2	\N
3328	means	n	\N	\N	1	B2	\N
3329	measurement	n	\N	\N	1	B2	\N
3330	mechanic	n	\N	\N	1	B2	\N
3331	mechanical	adj	\N	\N	1	B2	\N
3332	mechanism	n	\N	\N	1	B2	\N
3333	medal	n	\N	\N	1	B2	\N
3334	medication	n	\N	\N	1	B2	\N
3335	medium	n	\N	\N	1	B2	\N
3336	melt	v	\N	\N	1	B2	\N
3337	membership	n	\N	\N	1	B2	\N
3338	memorable	adj	\N	\N	1	B2	\N
3339	metaphor	n	\N	\N	1	B2	\N
3340	method	n	\N	\N	1	B2	\N
3341	military	adj	\N	\N	1	B2	\N
3342	miner	n	\N	\N	1	B2	\N
3343	mineral	n	\N	\N	1	B2	\N
3344	minimum	n	\N	\N	1	B2	\N
3345	minister	n	\N	\N	1	B2	\N
3346	minor	adj	\N	\N	1	B2	\N
3347	minority	n	\N	\N	1	B2	\N
3348	miserable	adj	\N	\N	1	B2	\N
3349	mission	n	\N	\N	1	B2	\N
3350	mistaken	adj	\N	\N	1	B2	\N
3351	mixed	adj	\N	\N	1	B2	\N
3352	mode	n	\N	\N	1	B2	\N
3353	modest	adj	\N	\N	1	B2	\N
3354	modify	v	\N	\N	1	B2	\N
3355	monitor	n	\N	\N	1	B2	\N
3356	monster	n	\N	\N	1	B2	\N
3357	monthly	adj	\N	\N	1	B2	\N
3358	monument	n	\N	\N	1	B2	\N
3359	moral	adj	\N	\N	1	B2	\N
3360	moreover	adv	\N	\N	1	B2	\N
3361	mortgage	n	\N	\N	1	B2	\N
3362	mosque	n	\N	\N	1	B2	\N
3363	mosquito	n	\N	\N	1	B2	\N
3364	motion	n	\N	\N	1	B2	\N
3365	motivate	v	\N	\N	1	B2	\N
3366	motivation	n	\N	\N	1	B2	\N
3367	motor	n	\N	\N	1	B2	\N
3368	mount	v	\N	\N	1	B2	\N
3369	moving	adj	\N	\N	1	B2	\N
3370	multiple	adj	\N	\N	1	B2	\N
3371	multiply	v	\N	\N	1	B2	\N
3372	mysterious	adj	\N	\N	1	B2	\N
3373	myth	n	\N	\N	1	B2	\N
3374	naked	adj	\N	\N	1	B2	\N
3375	nasty	adj	\N	\N	1	B2	\N
3376	navigation	n	\N	\N	1	B2	\N
3377	nearby	adj	\N	\N	1	B2	\N
3378	neat	adj	\N	\N	1	B2	\N
3379	necessity	n	\N	\N	1	B2	\N
3380	negative	adj	\N	\N	1	B2	\N
3381	negotiate	v	\N	\N	1	B2	\N
3382	negotiation	n	\N	\N	1	B2	\N
3383	nerve	n	\N	\N	1	B2	\N
3384	neutral	adj	\N	\N	1	B2	\N
3385	nevertheless	adv	\N	\N	1	B2	\N
3386	newly	adv	\N	\N	1	B2	\N
3387	nickel	n	\N	\N	1	B2	\N
3388	nightmare	n	\N	\N	1	B2	\N
3389	nostalgia	n	\N	\N	1	B2	\N
3390	notebook	n	\N	\N	1	B2	\N
3391	notion	n	\N	\N	1	B2	\N
3392	novelist	n	\N	\N	1	B2	\N
3393	nowadays	adv	\N	\N	1	B2	\N
3394	numerous	adj	\N	\N	1	B2	\N
3395	nursing	n	\N	\N	1	B2	\N
3396	nutrition	n	\N	\N	1	B2	\N
3397	obesity	n	\N	\N	1	B2	\N
3398	obey	v	\N	\N	1	B2	\N
3399	object	n	\N	\N	1	B2	\N
3400	objective	n	\N	\N	1	B2	\N
3401	obligatory	adj	\N	\N	1	B2	\N
3402	obligation	n	\N	\N	1	B2	\N
3403	observation	n	\N	\N	1	B2	\N
3404	observe	v	\N	\N	1	B2	\N
3405	observer	n	\N	\N	1	B2	\N
3406	obstacle	n	\N	\N	1	B2	\N
3407	obtain	v	\N	\N	1	B2	\N
3408	occasionally	adv	\N	\N	1	B2	\N
3409	occupation	n	\N	\N	1	B2	\N
3410	occupy	v	\N	\N	1	B2	\N
3411	offence	n	\N	\N	1	B2	\N
3412	offend	v	\N	\N	1	B2	\N
3413	offender	n	\N	\N	1	B2	\N
3414	offensive	adj	\N	\N	1	B2	\N
3415	ongoing	adj	\N	\N	1	B2	\N
3416	onwards	adv	\N	\N	1	B2	\N
3417	opening	n	\N	\N	1	B2	\N
3418	openly	adv	\N	\N	1	B2	\N
3419	opera	n	\N	\N	1	B2	\N
3420	operate	v	\N	\N	1	B2	\N
3421	operator	n	\N	\N	1	B2	\N
3422	opponent	n	\N	\N	1	B2	\N
3423	oppose	v	\N	\N	1	B2	\N
3424	opposed	adj	\N	\N	1	B2	\N
3425	opposition	n	\N	\N	1	B2	\N
3426	optical	adj	\N	\N	1	B2	\N
3427	optimistic	adj	\N	\N	1	B2	\N
3428	orchestra	n	\N	\N	1	B2	\N
3429	organ	n	\N	\N	1	B2	\N
3430	organic	adj	\N	\N	1	B2	\N
3431	origin	n	\N	\N	1	B2	\N
3432	otherwise	adv	\N	\N	1	B2	\N
3433	outcome	n	\N	\N	1	B2	\N
3434	outer	adj	\N	\N	1	B2	\N
3435	outfit	n	\N	\N	1	B2	\N
3436	outline	n	\N	\N	1	B2	\N
3437	output	n	\N	\N	1	B2	\N
3438	outstanding	adj	\N	\N	1	B2	\N
3439	overall	adj	\N	\N	1	B2	\N
3440	overcome	v	\N	\N	1	B2	\N
3441	overnight	adv	\N	\N	1	B2	\N
3442	overseas	adv	\N	\N	1	B2	\N
3443	owe	v	\N	\N	1	B2	\N
3444	ownership	n	\N	\N	1	B2	\N
3445	oxygen	n	\N	\N	1	B2	\N
3446	pace	n	\N	\N	1	B2	\N
3447	packet	n	\N	\N	1	B2	\N
3448	palm	n	\N	\N	1	B2	\N
3449	panel	n	\N	\N	1	B2	\N
3450	panic	n	\N	\N	1	B2	\N
3451	parade	n	\N	\N	1	B2	\N
3452	parallel	adj	\N	\N	1	B2	\N
3453	parliament	n	\N	\N	1	B2	\N
3454	part-time	adj	\N	\N	1	B2	\N
3455	participant	n	\N	\N	1	B2	\N
3456	participation	n	\N	\N	1	B2	\N
3457	partly	adv	\N	\N	1	B2	\N
3458	partnership	n	\N	\N	1	B2	\N
3459	passage	n	\N	\N	1	B2	\N
3460	passionate	adj	\N	\N	1	B2	\N
3461	password	n	\N	\N	1	B2	\N
3462	patch	n	\N	\N	1	B2	\N
3463	patience	n	\N	\N	1	B2	\N
3464	pause	n	\N	\N	1	B2	\N
3465	peer	n	\N	\N	1	B2	\N
3466	penalty	n	\N	\N	1	B2	\N
3467	pension	n	\N	\N	1	B2	\N
3468	perceive	v	\N	\N	1	B2	\N
3469	perception	n	\N	\N	1	B2	\N
3470	permanent	adj	\N	\N	1	B2	\N
3471	permanently	adv	\N	\N	1	B2	\N
3472	permit	n	\N	\N	1	B2	\N
3473	perspective	n	\N	\N	1	B2	\N
3474	pharmacy	n	\N	\N	1	B2	\N
3475	phase	n	\N	\N	1	B2	\N
3476	phenomenon	n	\N	\N	1	B2	\N
3477	philosophy	n	\N	\N	1	B2	\N
3478	physician	n	\N	\N	1	B2	\N
3479	pile	n	\N	\N	1	B2	\N
3480	pill	n	\N	\N	1	B2	\N
3481	pitch	n	\N	\N	1	B2	\N
3482	pity	n	\N	\N	1	B2	\N
3483	placement	n	\N	\N	1	B2	\N
3484	plain	adj	\N	\N	1	B2	\N
3485	plus	prep	\N	\N	1	B2	\N
3486	pointed	adj	\N	\N	1	B2	\N
3487	popularity	n	\N	\N	1	B2	\N
3488	portion	n	\N	\N	1	B2	\N
3489	pose	n	\N	\N	1	B2	\N
3490	positive	adj	\N	\N	1	B2	\N
3491	possess	v	\N	\N	1	B2	\N
3492	potential	adj	\N	\N	1	B2	\N
3493	potentially	adv	\N	\N	1	B2	\N
3494	praise	v	\N	\N	1	B2	\N
3495	precious	adj	\N	\N	1	B2	\N
3496	precise	adj	\N	\N	1	B2	\N
3497	precisely	adv	\N	\N	1	B2	\N
3498	predictable	adj	\N	\N	1	B2	\N
3499	preference	n	\N	\N	1	B2	\N
3500	pregnant	adj	\N	\N	1	B2	\N
3501	preparation	n	\N	\N	1	B2	\N
3502	presence	n	\N	\N	1	B2	\N
3503	preserve	v	\N	\N	1	B2	\N
3504	presidential	adj	\N	\N	1	B2	\N
3505	pride	n	\N	\N	1	B2	\N
3506	primarily	adv	\N	\N	1	B2	\N
3507	prime	adj	\N	\N	1	B2	\N
3508	principal	adj	\N	\N	1	B2	\N
3509	principle	n	\N	\N	1	B2	\N
3510	prior	adj	\N	\N	1	B2	\N
3511	priority	n	\N	\N	1	B2	\N
3512	privacy	n	\N	\N	1	B2	\N
3513	probability	n	\N	\N	1	B2	\N
3514	probable	adj	\N	\N	1	B2	\N
3515	procedure	n	\N	\N	1	B2	\N
3516	proceed	v	\N	\N	1	B2	\N
3517	professional	adj	\N	\N	1	B2	\N
3518	programming	n	\N	\N	1	B2	\N
3519	progressive	adj	\N	\N	1	B2	\N
3520	prohibit	v	\N	\N	1	B2	\N
3521	promising	adj	\N	\N	1	B2	\N
3522	promotion	n	\N	\N	1	B2	\N
3523	prompt	v	\N	\N	1	B2	\N
3524	proof	n	\N	\N	1	B2	\N
3525	proportion	n	\N	\N	1	B2	\N
3526	proportion	n	\N	\N	1	B2	\N
3527	proposal	n	\N	\N	1	B2	\N
3528	propose	v	\N	\N	1	B2	\N
3529	prospect	n	\N	\N	1	B2	\N
3530	protection	n	\N	\N	1	B2	\N
3531	protein	n	\N	\N	1	B2	\N
3532	protester	n	\N	\N	1	B2	\N
3533	proven	adj	\N	\N	1	B2	\N
3534	psychological	adj	\N	\N	1	B2	\N
3535	psychologist	n	\N	\N	1	B2	\N
3536	psychology	n	\N	\N	1	B2	\N
3537	publication	n	\N	\N	1	B2	\N
3538	publicity	n	\N	\N	1	B2	\N
3539	publishing	n	\N	\N	1	B2	\N
3540	punk	n	\N	\N	1	B2	\N
3541	pupil	n	\N	\N	1	B2	\N
3542	purchase	n	\N	\N	1	B2	\N
3543	pure	adj	\N	\N	1	B2	\N
3544	purely	adv	\N	\N	1	B2	\N
3545	pursue	v	\N	\N	1	B2	\N
3546	pursuit	n	\N	\N	1	B2	\N
3547	puzzle	n	\N	\N	1	B2	\N
3548	question	v	\N	\N	1	B2	\N
3549	questionnaire	n	\N	\N	1	B2	\N
3550	racial	adj	\N	\N	1	B2	\N
3551	racism	n	\N	\N	1	B2	\N
3552	racist	adj	\N	\N	1	B2	\N
3553	radar	n	\N	\N	1	B2	\N
3554	radiation	n	\N	\N	1	B2	\N
3555	rail	n	\N	\N	1	B2	\N
3556	random	adj	\N	\N	1	B2	\N
3557	rank	n	\N	\N	1	B2	\N
3558	rapid	adj	\N	\N	1	B2	\N
3559	rapidly	adv	\N	\N	1	B2	\N
3560	raw	adj	\N	\N	1	B2	\N
3561	realistic	adj	\N	\N	1	B2	\N
3562	reasonable	adj	\N	\N	1	B2	\N
3563	reasonably	adv	\N	\N	1	B2	\N
3564	rebuild	v	\N	\N	1	B2	\N
3565	recall	v	\N	\N	1	B2	\N
3566	receiver	n	\N	\N	1	B2	\N
3567	recession	n	\N	\N	1	B2	\N
3568	reckon	v	\N	\N	1	B2	\N
3569	recognition	n	\N	\N	1	B2	\N
3570	recover	v	\N	\N	1	B2	\N
3571	recovery	n	\N	\N	1	B2	\N
3572	recruit	v	\N	\N	1	B2	\N
3573	reduction	n	\N	\N	1	B2	\N
3574	referee	n	\N	\N	1	B2	\N
3575	refugee	n	\N	\N	1	B2	\N
3576	regard	v	\N	\N	1	B2	\N
3577	regional	adj	\N	\N	1	B2	\N
3578	register	v	\N	\N	1	B2	\N
3579	registration	n	\N	\N	1	B2	\N
3580	regret	v	\N	\N	1	B2	\N
3581	regulate	v	\N	\N	1	B2	\N
3582	regulation	n	\N	\N	1	B2	\N
3583	reinforce	v	\N	\N	1	B2	\N
3584	relatively	adv	\N	\N	1	B2	\N
3585	relevant	adj	\N	\N	1	B2	\N
3586	relief	n	\N	\N	1	B2	\N
3587	relieve	v	\N	\N	1	B2	\N
3588	relieved	adj	\N	\N	1	B2	\N
3589	rely on	v	\N	\N	1	B2	\N
3590	remark	n	\N	\N	1	B2	\N
3591	remarkable	adj	\N	\N	1	B2	\N
3592	remarkably	adv	\N	\N	1	B2	\N
3593	reporting	n	\N	\N	1	B2	\N
3594	representative	n	\N	\N	1	B2	\N
3595	reputation	n	\N	\N	1	B2	\N
3596	requirement	n	\N	\N	1	B2	\N
3597	rescue	v	\N	\N	1	B2	\N
3598	research	n	\N	\N	1	B2	\N
3599	reserve	v	\N	\N	1	B2	\N
3600	resident	n	\N	\N	1	B2	\N
3601	resign	v	\N	\N	1	B2	\N
3602	resist	v	\N	\N	1	B2	\N
3603	resolution	n	\N	\N	1	B2	\N
3604	resolve	v	\N	\N	1	B2	\N
3605	resort	n	\N	\N	1	B2	\N
3606	restore	v	\N	\N	1	B2	\N
3607	restrict	v	\N	\N	1	B2	\N
3608	restriction	n	\N	\N	1	B2	\N
3609	résumé	n	\N	\N	1	B2	\N
3610	retail	n	\N	\N	1	B2	\N
3611	retain	v	\N	\N	1	B2	\N
3612	retirement	n	\N	\N	1	B2	\N
3613	reveal	v	\N	\N	1	B2	\N
3614	revenue	n	\N	\N	1	B2	\N
3615	revision	n	\N	\N	1	B2	\N
3616	revolution	n	\N	\N	1	B2	\N
3617	reward	n	\N	\N	1	B2	\N
3618	rhythm	n	\N	\N	1	B2	\N
3619	rid	adj	\N	\N	1	B2	\N
3620	ridiculous	adj	\N	\N	1	B2	\N
3621	risky	adj	\N	\N	1	B2	\N
3622	rival	n	\N	\N	1	B2	\N
3623	rob	v	\N	\N	1	B2	\N
3624	robbery	n	\N	\N	1	B2	\N
3625	rocket	n	\N	\N	1	B2	\N
3626	romance	n	\N	\N	1	B2	\N
3627	root	n	\N	\N	1	B2	\N
3628	rose	n	\N	\N	1	B2	\N
3629	roughly	adv	\N	\N	1	B2	\N
3630	rub	v	\N	\N	1	B2	\N
3631	rubber	n	\N	\N	1	B2	\N
3632	ruin	v	\N	\N	1	B2	\N
3633	rural	adj	\N	\N	1	B2	\N
3634	rush	v	\N	\N	1	B2	\N
3635	satellite	n	\N	\N	1	B2	\N
3636	satisfaction	n	\N	\N	1	B2	\N
3637	satisfied	adj	\N	\N	1	B2	\N
3638	satisfy	v	\N	\N	1	B2	\N
3639	saving	n	\N	\N	1	B2	\N
3640	scale	n	\N	\N	1	B2	\N
3641	scandal	n	\N	\N	1	B2	\N
3642	scare	v	\N	\N	1	B2	\N
3643	scholar	n	\N	\N	1	B2	\N
3644	scholarship	n	\N	\N	1	B2	\N
3645	scratch	v	\N	\N	1	B2	\N
3646	scream	v	\N	\N	1	B2	\N
3647	screening	n	\N	\N	1	B2	\N
3648	sector	n	\N	\N	1	B2	\N
3649	secure	v	\N	\N	1	B2	\N
3650	seek	v	\N	\N	1	B2	\N
3651	seeker	n	\N	\N	1	B2	\N
3652	select	v	\N	\N	1	B2	\N
3653	selection	n	\N	\N	1	B2	\N
3654	self	n	\N	\N	1	B2	\N
3655	seminar	n	\N	\N	1	B2	\N
3656	senior	adj	\N	\N	1	B2	\N
3657	sensitive	adj	\N	\N	1	B2	\N
3658	sequence	n	\N	\N	1	B2	\N
3659	session	n	\N	\N	1	B2	\N
3660	settle	v	\N	\N	1	B2	\N
3661	settler	n	\N	\N	1	B2	\N
3662	severe	adj	\N	\N	1	B2	\N
3663	severely	adv	\N	\N	1	B2	\N
3664	sexy	adj	\N	\N	1	B2	\N
3665	shade	n	\N	\N	1	B2	\N
3666	shadow	n	\N	\N	1	B2	\N
3667	shallow	adj	\N	\N	1	B2	\N
3668	shame	n	\N	\N	1	B2	\N
3669	shaped	adj	\N	\N	1	B2	\N
3670	shelter	n	\N	\N	1	B2	\N
3671	shooting	n	\N	\N	1	B2	\N
3672	shore	n	\N	\N	1	B2	\N
3673	short-term	adj	\N	\N	1	B2	\N
3674	shortage	n	\N	\N	1	B2	\N
3675	shortly	adv	\N	\N	1	B2	\N
3676	sibling	n	\N	\N	1	B2	\N
3677	sidewalk	n	\N	\N	1	B2	\N
3678	signature	n	\N	\N	1	B2	\N
3679	significance	n	\N	\N	1	B2	\N
3680	significant	adj	\N	\N	1	B2	\N
3681	significantly	adv	\N	\N	1	B2	\N
3682	silence	n	\N	\N	1	B2	\N
3683	silk	n	\N	\N	1	B2	\N
3684	sincere	adj	\N	\N	1	B2	\N
3685	skilled	adj	\N	\N	1	B2	\N
3686	skull	n	\N	\N	1	B2	\N
3687	slave	n	\N	\N	1	B2	\N
3688	slide	v	\N	\N	1	B2	\N
3689	slight	adj	\N	\N	1	B2	\N
3690	slip	v	\N	\N	1	B2	\N
3691	slogan	n	\N	\N	1	B2	\N
3692	slope	n	\N	\N	1	B2	\N
3693	so-called	adj	\N	\N	1	B2	\N
3694	solar	adj	\N	\N	1	B2	\N
3695	somehow	adv	\N	\N	1	B2	\N
3696	sometime	adv	\N	\N	1	B2	\N
3697	somewhat	adv	\N	\N	1	B2	\N
3698	sophisticated	adj	\N	\N	1	B2	\N
3699	soul	n	\N	\N	1	B2	\N
3700	source	n	\N	\N	1	B2	\N
3701	spare	adj	\N	\N	1	B2	\N
3702	specialise	v	\N	\N	1	B2	\N
3703	specialist	n	\N	\N	1	B2	\N
3704	species	n	\N	\N	1	B2	\N
3705	specify	v	\N	\N	1	B2	\N
3706	spectacular	adj	\N	\N	1	B2	\N
3707	spectator	n	\N	\N	1	B2	\N
3708	speculate	v	\N	\N	1	B2	\N
3709	speculation	n	\N	\N	1	B2	\N
3710	spice	n	\N	\N	1	B2	\N
3711	spill	v	\N	\N	1	B2	\N
3712	spiritual	adj	\N	\N	1	B2	\N
3713	in spite of	prep	\N	\N	1	B2	\N
3714	split	v	\N	\N	1	B2	\N
3715	spoil	v	\N	\N	1	B2	\N
3716	spokesman	n	\N	\N	1	B2	\N
3717	spokesperson	n	\N	\N	1	B2	\N
3718	spokeswoman	n	\N	\N	1	B2	\N
3719	sponsor	n	\N	\N	1	B2	\N
3720	sponsorship	n	\N	\N	1	B2	\N
3721	stable	adj	\N	\N	1	B2	\N
3722	stall	n	\N	\N	1	B2	\N
3723	stance	n	\N	\N	1	B2	\N
3724	stare	v	\N	\N	1	B2	\N
3725	starve	v	\N	\N	1	B2	\N
3726	statistic	n	\N	\N	1	B2	\N
3727	status	n	\N	\N	1	B2	\N
3728	steadily	adv	\N	\N	1	B2	\N
3729	steady	adj	\N	\N	1	B2	\N
3730	steam	n	\N	\N	1	B2	\N
3731	steel	n	\N	\N	1	B2	\N
3732	steep	adj	\N	\N	1	B2	\N
3733	sticky	adj	\N	\N	1	B2	\N
3734	stiff	adj	\N	\N	1	B2	\N
3735	stimulate	v	\N	\N	1	B2	\N
3736	stock	n	\N	\N	1	B2	\N
3737	stream	n	\N	\N	1	B2	\N
3738	strengthen	v	\N	\N	1	B2	\N
3739	stretch	v	\N	\N	1	B2	\N
3740	strict	adj	\N	\N	1	B2	\N
3741	strictly	adv	\N	\N	1	B2	\N
3742	strike	n	\N	\N	1	B2	\N
3743	striking	adj	\N	\N	1	B2	\N
3744	stroke	n	\N	\N	1	B2	\N
3745	struggle	v	\N	\N	1	B2	\N
3746	stunning	adj	\N	\N	1	B2	\N
3747	submit	v	\N	\N	1	B2	\N
3748	substance	n	\N	\N	1	B2	\N
3749	suburb	n	\N	\N	1	B2	\N
3750	suffering	n	\N	\N	1	B2	\N
3751	sufficient	adj	\N	\N	1	B2	\N
3752	sufficiently	adv	\N	\N	1	B2	\N
3753	sum	n	\N	\N	1	B2	\N
3754	super	adj	\N	\N	1	B2	\N
3755	surgeon	n	\N	\N	1	B2	\N
3756	surgery	n	\N	\N	1	B2	\N
3757	surround	v	\N	\N	1	B2	\N
3758	surrounding	adj	\N	\N	1	B2	\N
3759	survival	n	\N	\N	1	B2	\N
3760	survivor	n	\N	\N	1	B2	\N
3761	suspect	n	\N	\N	1	B2	\N
3762	suspend	v	\N	\N	1	B2	\N
3763	sustainability	n	\N	\N	1	B2	\N
3764	sustainable	adj	\N	\N	1	B2	\N
3765	swallow	v	\N	\N	1	B2	\N
3766	swear	v	\N	\N	1	B2	\N
3767	sweep	v	\N	\N	1	B2	\N
3768	symbol	n	\N	\N	1	B2	\N
3769	symbolise	v	\N	\N	1	B2	\N
3770	sympathetic	adj	\N	\N	1	B2	\N
3771	sympathy	n	\N	\N	1	B2	\N
3772	tag	n	\N	\N	1	B2	\N
3773	tale	n	\N	\N	1	B2	\N
3774	tank	n	\N	\N	1	B2	\N
3775	tap	n	\N	\N	1	B2	\N
3776	tear	n	\N	\N	1	B2	\N
3777	technological	adj	\N	\N	1	B2	\N
3778	teen	n	\N	\N	1	B2	\N
3779	temple	n	\N	\N	1	B2	\N
3780	temporarily	adv	\N	\N	1	B2	\N
3781	temporary	adj	\N	\N	1	B2	\N
3782	tendency	n	\N	\N	1	B2	\N
3783	tension	n	\N	\N	1	B2	\N
3784	terminal	n	\N	\N	1	B2	\N
3785	terms	n	\N	\N	1	B2	\N
3786	terribly	adv	\N	\N	1	B2	\N
3787	terrify	v	\N	\N	1	B2	\N
3788	territory	n	\N	\N	1	B2	\N
3789	terror	n	\N	\N	1	B2	\N
3790	terrorism	n	\N	\N	1	B2	\N
3791	terrorist	n	\N	\N	1	B2	\N
3792	testing	n	\N	\N	1	B2	\N
3793	textbook	n	\N	\N	1	B2	\N
3794	theft	n	\N	\N	1	B2	\N
3795	therapist	n	\N	\N	1	B2	\N
3796	therapy	n	\N	\N	1	B2	\N
3797	theory	n	\N	\N	1	B2	\N
3798	therefore	adv	\N	\N	1	B2	\N
3799	thorough	adj	\N	\N	1	B2	\N
3800	thoroughly	adv	\N	\N	1	B2	\N
3801	threat	n	\N	\N	1	B2	\N
3802	threaten	v	\N	\N	1	B2	\N
3803	thumb	n	\N	\N	1	B2	\N
3804	thus	adv	\N	\N	1	B2	\N
3805	timing	n	\N	\N	1	B2	\N
3806	tissue	n	\N	\N	1	B2	\N
3807	tone	n	\N	\N	1	B2	\N
3808	tough	adj	\N	\N	1	B2	\N
3809	tournament	n	\N	\N	1	B2	\N
3810	toxic	adj	\N	\N	1	B2	\N
3813	trading	n	\N	\N	1	B2	\N
3814	tragedy	n	\N	\N	1	B2	\N
3815	tragic	adj	\N	\N	1	B2	\N
3816	trait	n	\N	\N	1	B2	\N
3817	transfer	n	\N	\N	1	B2	\N
3818	transform	v	\N	\N	1	B2	\N
3819	transition	n	\N	\N	1	B2	\N
3820	transmit	v	\N	\N	1	B2	\N
3821	trap	n	\N	\N	1	B2	\N
3822	treasure	n	\N	\N	1	B2	\N
3823	trial	n	\N	\N	1	B2	\N
3824	tribe	n	\N	\N	1	B2	\N
3825	trillion	num	\N	\N	1	B2	\N
3826	troop	n	\N	\N	1	B2	\N
3827	tropical	adj	\N	\N	1	B2	\N
3828	truly	adv	\N	\N	1	B2	\N
3829	trust	n	\N	\N	1	B2	\N
3830	tsunami	n	\N	\N	1	B2	\N
3831	tune	n	\N	\N	1	B2	\N
3832	tunnel	n	\N	\N	1	B2	\N
3833	ultimate	adj	\N	\N	1	B2	\N
3834	ultimately	adv	\N	\N	1	B2	\N
3835	unacceptable	adj	\N	\N	1	B2	\N
3836	uncertainty	n	\N	\N	1	B2	\N
3837	unconscious	adj	\N	\N	1	B2	\N
3838	undergo	v	\N	\N	1	B2	\N
3839	undertake	v	\N	\N	1	B2	\N
3840	unexpected	adj	\N	\N	1	B2	\N
3841	unfold	v	\N	\N	1	B2	\N
3842	unfortunate	adj	\N	\N	1	B2	\N
3843	unique	adj	\N	\N	1	B2	\N
3844	unite	v	\N	\N	1	B2	\N
3845	unity	n	\N	\N	1	B2	\N
3846	universal	adj	\N	\N	1	B2	\N
3847	universe	n	\N	\N	1	B2	\N
3848	unknown	adj	\N	\N	1	B2	\N
3849	upper	adj	\N	\N	1	B2	\N
3850	upwards	adv	\N	\N	1	B2	\N
3851	urban	adj	\N	\N	1	B2	\N
3852	urge	v	\N	\N	1	B2	\N
3853	urgent	adj	\N	\N	1	B2	\N
3854	usage	n	\N	\N	1	B2	\N
3855	useless	adj	\N	\N	1	B2	\N
3856	valid	adj	\N	\N	1	B2	\N
3857	variation	n	\N	\N	1	B2	\N
3858	vary	v	\N	\N	1	B2	\N
3859	vast	adj	\N	\N	1	B2	\N
3860	venue	n	\N	\N	1	B2	\N
3861	vertical	adj	\N	\N	1	B2	\N
3862	via	prep	\N	\N	1	B2	\N
3863	victory	n	\N	\N	1	B2	\N
3864	victorious	adj	\N	\N	1	B2	\N
3865	viewpoint	n	\N	\N	1	B2	\N
3866	violence	n	\N	\N	1	B2	\N
3867	virtual	adj	\N	\N	1	B2	\N
3868	visa	n	\N	\N	1	B2	\N
3869	visible	adj	\N	\N	1	B2	\N
3870	vision	n	\N	\N	1	B2	\N
3871	visual	adj	\N	\N	1	B2	\N
3872	vital	adj	\N	\N	1	B2	\N
3873	vitamin	n	\N	\N	1	B2	\N
3874	volume	n	\N	\N	1	B2	\N
3875	voluntarily	adv	\N	\N	1	B2	\N
3876	voluntary	adj	\N	\N	1	B2	\N
3877	voting	n	\N	\N	1	B2	\N
3878	wage	n	\N	\N	1	B2	\N
3879	wander	v	\N	\N	1	B2	\N
3880	warming	n	\N	\N	1	B2	\N
3881	weakness	n	\N	\N	1	B2	\N
3882	wealth	n	\N	\N	1	B2	\N
3883	wealthy	adj	\N	\N	1	B2	\N
3884	weekly	adj	\N	\N	1	B2	\N
3885	weird	adj	\N	\N	1	B2	\N
3886	welfare	n	\N	\N	1	B2	\N
3887	wheat	n	\N	\N	1	B2	\N
3888	whereas	conj	\N	\N	1	B2	\N
3889	wherever	conj	\N	\N	1	B2	\N
3890	whisper	v	\N	\N	1	B2	\N
3891	whoever	pron	\N	\N	1	B2	\N
3892	whom	pron	\N	\N	1	B2	\N
3893	widely	adv	\N	\N	1	B2	\N
3894	widespread	adj	\N	\N	1	B2	\N
3895	widow	n	\N	\N	1	B2	\N
3896	wildlife	n	\N	\N	1	B2	\N
3897	willing	adj	\N	\N	1	B2	\N
3898	wire	n	\N	\N	1	B2	\N
3899	wisdom	n	\N	\N	1	B2	\N
3900	wise	adj	\N	\N	1	B2	\N
3901	withdraw	v	\N	\N	1	B2	\N
3902	witness	n	\N	\N	1	B2	\N
3903	wolf	n	\N	\N	1	B2	\N
3904	workforce	n	\N	\N	1	B2	\N
3905	workplace	n	\N	\N	1	B2	\N
3906	workshop	n	\N	\N	1	B2	\N
3907	worm	n	\N	\N	1	B2	\N
3908	wound	n	\N	\N	1	B2	\N
3909	wrap	v	\N	\N	1	B2	\N
3910	wrist	n	\N	\N	1	B2	\N
3911	zone	n	\N	\N	1	B2	\N
3912	yield	v	\N	\N	1	B2	\N
3913	abolish	v	\N	\N	1	C1	\N
3914	abortion	n	\N	\N	1	C1	\N
3915	absence	n	\N	\N	1	C1	\N
3916	absurd	adj	\N	\N	1	C1	\N
3917	abuse	n	\N	\N	1	C1	\N
3918	academy	n	\N	\N	1	C1	\N
3919	accelerate	v	\N	\N	1	C1	\N
3920	acceptance	n	\N	\N	1	C1	\N
3921	accessible	adj	\N	\N	1	C1	\N
3922	accomplishment	n	\N	\N	1	C1	\N
3923	accordingly	adv	\N	\N	1	C1	\N
3924	accountability	n	\N	\N	1	C1	\N
3925	accountable	adj	\N	\N	1	C1	\N
3926	accumulate	v	\N	\N	1	C1	\N
3927	accumulation	n	\N	\N	1	C1	\N
3928	accusation	n	\N	\N	1	C1	\N
3929	accused	n	\N	\N	1	C1	\N
3930	acid	n	\N	\N	1	C1	\N
3931	acquisition	n	\N	\N	1	C1	\N
3932	activation	n	\N	\N	1	C1	\N
3933	activist	n	\N	\N	1	C1	\N
3934	acute	adj	\N	\N	1	C1	\N
3935	adaptation	n	\N	\N	1	C1	\N
3936	adhere	v	\N	\N	1	C1	\N
3937	adjacent	adj	\N	\N	1	C1	\N
3938	adjustment	n	\N	\N	1	C1	\N
3939	administer	v	\N	\N	1	C1	\N
3940	administrative	adj	\N	\N	1	C1	\N
3941	administrator	n	\N	\N	1	C1	\N
3942	admission	n	\N	\N	1	C1	\N
3943	adolescent	n	\N	\N	1	C1	\N
3944	adoption	n	\N	\N	1	C1	\N
3945	adverse	adj	\N	\N	1	C1	\N
3946	advocate	n	\N	\N	1	C1	\N
3947	aesthetic	adj	\N	\N	1	C1	\N
3948	affection	n	\N	\N	1	C1	\N
3949	aftermath	n	\N	\N	1	C1	\N
3950	aggression	n	\N	\N	1	C1	\N
3951	agricultural	adj	\N	\N	1	C1	\N
3952	aide	n	\N	\N	1	C1	\N
3953	alert	v	\N	\N	1	C1	\N
3954	align	v	\N	\N	1	C1	\N
3955	alignment	n	\N	\N	1	C1	\N
3956	alike	adj	\N	\N	1	C1	\N
3957	allegation	n	\N	\N	1	C1	\N
3958	allege	v	\N	\N	1	C1	\N
3959	allegedly	adv	\N	\N	1	C1	\N
3960	alliance	n	\N	\N	1	C1	\N
3961	allocate	v	\N	\N	1	C1	\N
3962	allocation	n	\N	\N	1	C1	\N
3963	allowance	n	\N	\N	1	C1	\N
3964	ally	n	\N	\N	1	C1	\N
3965	aluminium	n	\N	\N	1	C1	\N
3966	amateur	n	\N	\N	1	C1	\N
3967	ambassador	n	\N	\N	1	C1	\N
3968	amend	v	\N	\N	1	C1	\N
3969	amendment	n	\N	\N	1	C1	\N
3970	amid	prep	\N	\N	1	C1	\N
3971	analogy	n	\N	\N	1	C1	\N
3972	anchor	n	\N	\N	1	C1	\N
3973	anonymous	adj	\N	\N	1	C1	\N
3974	apparel	n	\N	\N	1	C1	\N
3975	appealing	adj	\N	\N	1	C1	\N
3976	appetite	n	\N	\N	1	C1	\N
3977	applaud	v	\N	\N	1	C1	\N
3978	applicable	adj	\N	\N	1	C1	\N
3979	appoint	v	\N	\N	1	C1	\N
3980	appreciation	n	\N	\N	1	C1	\N
3981	arbitrary	adj	\N	\N	1	C1	\N
3982	architectural	adj	\N	\N	1	C1	\N
3983	archive	n	\N	\N	1	C1	\N
3984	arena	n	\N	\N	1	C1	\N
3985	arm	v	\N	\N	1	C1	\N
3986	array	n	\N	\N	1	C1	\N
3987	articulate	v	\N	\N	1	C1	\N
3988	ash	n	\N	\N	1	C1	\N
3989	aspiration	n	\N	\N	1	C1	\N
3990	aspire	v	\N	\N	1	C1	\N
3991	assassination	n	\N	\N	1	C1	\N
3992	assault	n	\N	\N	1	C1	\N
3993	assemble	v	\N	\N	1	C1	\N
3994	assembly	n	\N	\N	1	C1	\N
3995	assert	v	\N	\N	1	C1	\N
3996	assertion	n	\N	\N	1	C1	\N
3997	assurance	n	\N	\N	1	C1	\N
3998	asylum	n	\N	\N	1	C1	\N
3999	atrocity	n	\N	\N	1	C1	\N
4000	attain	v	\N	\N	1	C1	\N
4001	attendance	n	\N	\N	1	C1	\N
4002	attribute	n	\N	\N	1	C1	\N
4003	auction	n	\N	\N	1	C1	\N
4004	audit	n	\N	\N	1	C1	\N
4005	authentic	adj	\N	\N	1	C1	\N
4006	authorise	v	\N	\N	1	C1	\N
4007	auto	n	\N	\N	1	C1	\N
4008	autonomy	n	\N	\N	1	C1	\N
4009	availability	n	\N	\N	1	C1	\N
4010	await	v	\N	\N	1	C1	\N
4011	backdrop	n	\N	\N	1	C1	\N
4012	backing	n	\N	\N	1	C1	\N
4013	backup	n	\N	\N	1	C1	\N
4014	bail	n	\N	\N	1	C1	\N
4015	ballot	n	\N	\N	1	C1	\N
4016	bankruptcy	n	\N	\N	1	C1	\N
4017	banner	n	\N	\N	1	C1	\N
4018	bare	adj	\N	\N	1	C1	\N
4019	barrel	n	\N	\N	1	C1	\N
4020	battlefield	n	\N	\N	1	C1	\N
4021	bay	n	\N	\N	1	C1	\N
4022	beam	n	\N	\N	1	C1	\N
4023	beast	n	\N	\N	1	C1	\N
4024	behalf	n	\N	\N	1	C1	\N
4025	behavioural	adj	\N	\N	1	C1	\N
4026	beloved	adj	\N	\N	1	C1	\N
4027	bench	n	\N	\N	1	C1	\N
4028	benchmark	n	\N	\N	1	C1	\N
4029	beneath	prep	\N	\N	1	C1	\N
4030	beneficiary	n	\N	\N	1	C1	\N
6731	siege	n	\N	\N	1	C2	\N
4031	betray	v	\N	\N	1	C1	\N
4032	betrayal	n	\N	\N	1	C1	\N
4033	beverage	n	\N	\N	1	C1	\N
4034	bind	v	\N	\N	1	C1	\N
4035	biography	n	\N	\N	1	C1	\N
4036	bishop	n	\N	\N	1	C1	\N
4037	bizarre	adj	\N	\N	1	C1	\N
4038	blade	n	\N	\N	1	C1	\N
4039	blast	n	\N	\N	1	C1	\N
4040	bleed	v	\N	\N	1	C1	\N
4041	blend	n	\N	\N	1	C1	\N
4042	bless	v	\N	\N	1	C1	\N
4043	blessing	n	\N	\N	1	C1	\N
4044	boast	v	\N	\N	1	C1	\N
4045	bonus	n	\N	\N	1	C1	\N
4046	boom	n	\N	\N	1	C1	\N
4047	bounce	v	\N	\N	1	C1	\N
4048	boundary	n	\N	\N	1	C1	\N
4049	bow	v	\N	\N	1	C1	\N
4050	breach	n	\N	\N	1	C1	\N
4051	breakdown	n	\N	\N	1	C1	\N
4052	breakthrough	n	\N	\N	1	C1	\N
4053	breed	v	\N	\N	1	C1	\N
4054	broadband	n	\N	\N	1	C1	\N
4055	browser	n	\N	\N	1	C1	\N
4056	brutal	adj	\N	\N	1	C1	\N
4057	buffer	n	\N	\N	1	C1	\N
4058	bulk	n	\N	\N	1	C1	\N
4059	burden	n	\N	\N	1	C1	\N
4060	bureaucracy	n	\N	\N	1	C1	\N
4061	burial	n	\N	\N	1	C1	\N
4062	cabinet	n	\N	\N	1	C1	\N
4063	calculation	n	\N	\N	1	C1	\N
4064	canvas	n	\N	\N	1	C1	\N
4065	capability	n	\N	\N	1	C1	\N
4066	capitalism	n	\N	\N	1	C1	\N
4067	capitalist	n	\N	\N	1	C1	\N
4068	cargo	n	\N	\N	1	C1	\N
4069	carriage	n	\N	\N	1	C1	\N
4070	carve	v	\N	\N	1	C1	\N
4071	casualty	n	\N	\N	1	C1	\N
4072	catalogue	n	\N	\N	1	C1	\N
4073	cater	v	\N	\N	1	C1	\N
4074	cattle	n	\N	\N	1	C1	\N
4075	caution	n	\N	\N	1	C1	\N
4076	cautious	adj	\N	\N	1	C1	\N
4077	cease	v	\N	\N	1	C1	\N
4078	cemetery	n	\N	\N	1	C1	\N
4079	chamber	n	\N	\N	1	C1	\N
4080	chaos	n	\N	\N	1	C1	\N
4081	characterise	v	\N	\N	1	C1	\N
4082	charm	n	\N	\N	1	C1	\N
4083	charter	n	\N	\N	1	C1	\N
4084	choir	n	\N	\N	1	C1	\N
4085	chronic	adj	\N	\N	1	C1	\N
4086	chunk	n	\N	\N	1	C1	\N
4087	circulate	v	\N	\N	1	C1	\N
4088	circulation	n	\N	\N	1	C1	\N
4089	citizenship	n	\N	\N	1	C1	\N
4090	civic	adj	\N	\N	1	C1	\N
4091	civilian	n	\N	\N	1	C1	\N
4092	clarity	n	\N	\N	1	C1	\N
4093	clash	n	\N	\N	1	C1	\N
4094	classification	n	\N	\N	1	C1	\N
4095	cling	v	\N	\N	1	C1	\N
4096	clinical	adj	\N	\N	1	C1	\N
4097	closure	n	\N	\N	1	C1	\N
4098	cluster	n	\N	\N	1	C1	\N
4099	coalition	n	\N	\N	1	C1	\N
4100	coastal	adj	\N	\N	1	C1	\N
4101	cocktail	n	\N	\N	1	C1	\N
4102	cognitive	adj	\N	\N	1	C1	\N
4103	coincide	v	\N	\N	1	C1	\N
4104	collaborate	v	\N	\N	1	C1	\N
4105	collaboration	n	\N	\N	1	C1	\N
4106	collective	adj	\N	\N	1	C1	\N
4107	collision	n	\N	\N	1	C1	\N
4108	colonial	adj	\N	\N	1	C1	\N
4109	columnist	n	\N	\N	1	C1	\N
4110	combat	n	\N	\N	1	C1	\N
4111	commence	v	\N	\N	1	C1	\N
4112	commentary	n	\N	\N	1	C1	\N
4113	commentator	n	\N	\N	1	C1	\N
4114	commerce	n	\N	\N	1	C1	\N
4115	commissioner	n	\N	\N	1	C1	\N
4116	commodity	n	\N	\N	1	C1	\N
4117	communist	n	\N	\N	1	C1	\N
4118	companion	n	\N	\N	1	C1	\N
4119	comparable	adj	\N	\N	1	C1	\N
4120	compassion	n	\N	\N	1	C1	\N
4121	compel	v	\N	\N	1	C1	\N
4122	compelling	adj	\N	\N	1	C1	\N
4123	compensate	v	\N	\N	1	C1	\N
4124	compensation	n	\N	\N	1	C1	\N
4125	competence	n	\N	\N	1	C1	\N
4126	competent	adj	\N	\N	1	C1	\N
4127	compile	v	\N	\N	1	C1	\N
4128	complement	n	\N	\N	1	C1	\N
4129	complexity	n	\N	\N	1	C1	\N
4130	compliance	n	\N	\N	1	C1	\N
4131	complication	n	\N	\N	1	C1	\N
4132	comply	v	\N	\N	1	C1	\N
4133	composition	n	\N	\N	1	C1	\N
4134	comprise	v	\N	\N	1	C1	\N
4135	compromise	n	\N	\N	1	C1	\N
4136	compute	v	\N	\N	1	C1	\N
4137	conceal	v	\N	\N	1	C1	\N
4138	concede	v	\N	\N	1	C1	\N
4139	conceive	v	\N	\N	1	C1	\N
4140	conception	n	\N	\N	1	C1	\N
4141	concession	n	\N	\N	1	C1	\N
4142	condemn	v	\N	\N	1	C1	\N
4143	confer	v	\N	\N	1	C1	\N
4144	confession	n	\N	\N	1	C1	\N
4145	configuration	n	\N	\N	1	C1	\N
4146	confine	v	\N	\N	1	C1	\N
4147	confirmation	n	\N	\N	1	C1	\N
4148	confront	v	\N	\N	1	C1	\N
4149	confrontation	n	\N	\N	1	C1	\N
4150	congratulate	v	\N	\N	1	C1	\N
4151	congregation	n	\N	\N	1	C1	\N
4152	congressional	adj	\N	\N	1	C1	\N
4153	conquer	v	\N	\N	1	C1	\N
4154	conscience	n	\N	\N	1	C1	\N
4155	consciously	adv	\N	\N	1	C1	\N
4156	consciousness	n	\N	\N	1	C1	\N
4157	consecutive	adj	\N	\N	1	C1	\N
4158	consensus	n	\N	\N	1	C1	\N
4159	consent	n	\N	\N	1	C1	\N
4160	conserve	v	\N	\N	1	C1	\N
4161	consistency	n	\N	\N	1	C1	\N
4162	consolidate	v	\N	\N	1	C1	\N
4163	consolidation	n	\N	\N	1	C1	\N
4164	constitute	v	\N	\N	1	C1	\N
4165	constitution	n	\N	\N	1	C1	\N
4166	constitutional	adj	\N	\N	1	C1	\N
4167	constraint	n	\N	\N	1	C1	\N
4168	consultation	n	\N	\N	1	C1	\N
4169	contemplate	v	\N	\N	1	C1	\N
4170	contempt	n	\N	\N	1	C1	\N
4171	contend	v	\N	\N	1	C1	\N
4172	contender	n	\N	\N	1	C1	\N
4173	content	adj	\N	\N	1	C1	\N
4174	contention	n	\N	\N	1	C1	\N
4175	continually	adv	\N	\N	1	C1	\N
4176	contractor	n	\N	\N	1	C1	\N
4177	contradiction	n	\N	\N	1	C1	\N
4178	contrary	adj	\N	\N	1	C1	\N
4179	contributor	n	\N	\N	1	C1	\N
4180	conversion	n	\N	\N	1	C1	\N
4181	convict	n	\N	\N	1	C1	\N
4182	conviction	n	\N	\N	1	C1	\N
4183	cooperate	v	\N	\N	1	C1	\N
4184	cooperative	adj	\N	\N	1	C1	\N
4185	coordinate	v	\N	\N	1	C1	\N
4186	coordination	n	\N	\N	1	C1	\N
4187	coordinator	n	\N	\N	1	C1	\N
4188	copyright	n	\N	\N	1	C1	\N
4189	correction	n	\N	\N	1	C1	\N
4190	correlate	v	\N	\N	1	C1	\N
4191	correlation	n	\N	\N	1	C1	\N
4192	correspond	v	\N	\N	1	C1	\N
4193	correspondence	n	\N	\N	1	C1	\N
4194	correspondent	n	\N	\N	1	C1	\N
4195	corresponding	adj	\N	\N	1	C1	\N
4196	correspondingly	adv	\N	\N	1	C1	\N
4197	corrupt	adj	\N	\N	1	C1	\N
4198	corruption	n	\N	\N	1	C1	\N
4199	costly	adj	\N	\N	1	C1	\N
4200	councillor	n	\N	\N	1	C1	\N
4201	counselling	n	\N	\N	1	C1	\N
4202	counsellor	n	\N	\N	1	C1	\N
4203	counter	v	\N	\N	1	C1	\N
4204	counterpart	n	\N	\N	1	C1	\N
4205	countless	adj	\N	\N	1	C1	\N
4206	coup	n	\N	\N	1	C1	\N
4207	courtesy	n	\N	\N	1	C1	\N
4208	craft	n	\N	\N	1	C1	\N
4209	crawl	v	\N	\N	1	C1	\N
4210	creator	n	\N	\N	1	C1	\N
4211	credibility	n	\N	\N	1	C1	\N
4212	credible	adj	\N	\N	1	C1	\N
4213	creep	v	\N	\N	1	C1	\N
4214	criterion	n	\N	\N	1	C1	\N
4215	critique	n	\N	\N	1	C1	\N
4216	crown	n	\N	\N	1	C1	\N
4217	crude	adj	\N	\N	1	C1	\N
4218	crush	v	\N	\N	1	C1	\N
4219	crystal	n	\N	\N	1	C1	\N
4220	cult	n	\N	\N	1	C1	\N
4221	cultivate	v	\N	\N	1	C1	\N
4222	curiosity	n	\N	\N	1	C1	\N
4223	custody	n	\N	\N	1	C1	\N
4224	cutting	n	\N	\N	1	C1	\N
4225	cynical	adj	\N	\N	1	C1	\N
4226	dam	n	\N	\N	1	C1	\N
4227	damaging	adj	\N	\N	1	C1	\N
4228	dawn	n	\N	\N	1	C1	\N
4229	debris	n	\N	\N	1	C1	\N
4230	debut	n	\N	\N	1	C1	\N
4231	decision-making	n	\N	\N	1	C1	\N
4232	decisive	adj	\N	\N	1	C1	\N
4233	declaration	n	\N	\N	1	C1	\N
4234	dedicated	adj	\N	\N	1	C1	\N
4235	dedication	n	\N	\N	1	C1	\N
4236	deed	n	\N	\N	1	C1	\N
4237	deem	v	\N	\N	1	C1	\N
4238	default	n	\N	\N	1	C1	\N
4239	defect	n	\N	\N	1	C1	\N
4240	defensive	adj	\N	\N	1	C1	\N
4241	deficiency	n	\N	\N	1	C1	\N
4242	deficit	n	\N	\N	1	C1	\N
4243	definitive	adj	\N	\N	1	C1	\N
4244	defy	v	\N	\N	1	C1	\N
4245	delegate	n	\N	\N	1	C1	\N
4246	delegation	n	\N	\N	1	C1	\N
4247	delicate	adj	\N	\N	1	C1	\N
4249	denial	n	\N	\N	1	C1	\N
4250	denounce	v	\N	\N	1	C1	\N
4251	dense	adj	\N	\N	1	C1	\N
4252	density	n	\N	\N	1	C1	\N
4253	dependence	n	\N	\N	1	C1	\N
4254	depict	v	\N	\N	1	C1	\N
4255	deploy	v	\N	\N	1	C1	\N
4256	deployment	n	\N	\N	1	C1	\N
4257	deprive	v	\N	\N	1	C1	\N
4258	deputy	n	\N	\N	1	C1	\N
4259	descend	v	\N	\N	1	C1	\N
4260	descent	n	\N	\N	1	C1	\N
4261	designate	v	\N	\N	1	C1	\N
4262	desirable	adj	\N	\N	1	C1	\N
4263	destructive	adj	\N	\N	1	C1	\N
4264	detain	v	\N	\N	1	C1	\N
4265	detection	n	\N	\N	1	C1	\N
4266	detention	n	\N	\N	1	C1	\N
4267	deteriorate	v	\N	\N	1	C1	\N
4268	devastate	v	\N	\N	1	C1	\N
4269	devise	v	\N	\N	1	C1	\N
4270	diagnose	v	\N	\N	1	C1	\N
4271	diagnosis	n	\N	\N	1	C1	\N
4272	dictate	v	\N	\N	1	C1	\N
4273	dictator	n	\N	\N	1	C1	\N
4274	differentiate	v	\N	\N	1	C1	\N
4275	dignity	n	\N	\N	1	C1	\N
4276	dilemma	n	\N	\N	1	C1	\N
4277	dimension	n	\N	\N	1	C1	\N
4278	diminish	v	\N	\N	1	C1	\N
4279	dip	v	\N	\N	1	C1	\N
4280	diplomat	n	\N	\N	1	C1	\N
4281	diplomatic	adj	\N	\N	1	C1	\N
4282	directory	n	\N	\N	1	C1	\N
4283	disastrous	adj	\N	\N	1	C1	\N
4284	discard	v	\N	\N	1	C1	\N
4285	discharge	v	\N	\N	1	C1	\N
4286	disclose	v	\N	\N	1	C1	\N
4287	disclosure	n	\N	\N	1	C1	\N
4288	discourse	n	\N	\N	1	C1	\N
4289	discretion	n	\N	\N	1	C1	\N
4290	discrimination	n	\N	\N	1	C1	\N
4291	disregard	v	\N	\N	1	C1	\N
4292	dismissal	n	\N	\N	1	C1	\N
4293	displace	v	\N	\N	1	C1	\N
4294	disposal	n	\N	\N	1	C1	\N
4295	dispose of	v	\N	\N	1	C1	\N
4296	dispute	n	\N	\N	1	C1	\N
4297	disrupt	v	\N	\N	1	C1	\N
4298	disruption	n	\N	\N	1	C1	\N
4299	dissolve	v	\N	\N	1	C1	\N
4300	distinction	n	\N	\N	1	C1	\N
4301	distinctive	adj	\N	\N	1	C1	\N
4302	distort	v	\N	\N	1	C1	\N
4303	distress	n	\N	\N	1	C1	\N
4304	disturbing	adj	\N	\N	1	C1	\N
4305	divert	v	\N	\N	1	C1	\N
4306	divine	adj	\N	\N	1	C1	\N
4307	doctrine	n	\N	\N	1	C1	\N
4308	documentation	n	\N	\N	1	C1	\N
4309	domain	n	\N	\N	1	C1	\N
4310	dominance	n	\N	\N	1	C1	\N
4311	donor	n	\N	\N	1	C1	\N
4312	dose	n	\N	\N	1	C1	\N
4313	drawback	n	\N	\N	1	C1	\N
4314	drain	v	\N	\N	1	C1	\N
4315	drift	v	\N	\N	1	C1	\N
4316	drown	v	\N	\N	1	C1	\N
4317	dual	adj	\N	\N	1	C1	\N
4318	dub	v	\N	\N	1	C1	\N
4319	dumb	adj	\N	\N	1	C1	\N
4320	duo	n	\N	\N	1	C1	\N
4321	earnings	n	\N	\N	1	C1	\N
4322	ease	n	\N	\N	1	C1	\N
4323	echo	n	\N	\N	1	C1	\N
4324	ecological	adj	\N	\N	1	C1	\N
4325	educator	n	\N	\N	1	C1	\N
4326	effectiveness	n	\N	\N	1	C1	\N
4327	efficiency	n	\N	\N	1	C1	\N
4328	ego	n	\N	\N	1	C1	\N
4329	elaborate	adj	\N	\N	1	C1	\N
4330	electoral	adj	\N	\N	1	C1	\N
4331	elevate	v	\N	\N	1	C1	\N
4332	eligible	adj	\N	\N	1	C1	\N
4333	elite	n	\N	\N	1	C1	\N
4334	embark	v	\N	\N	1	C1	\N
4335	embarrassment	n	\N	\N	1	C1	\N
4336	embassy	n	\N	\N	1	C1	\N
4337	embed	v	\N	\N	1	C1	\N
4338	embody	v	\N	\N	1	C1	\N
4339	emergence	n	\N	\N	1	C1	\N
4340	empirical	adj	\N	\N	1	C1	\N
4341	empower	v	\N	\N	1	C1	\N
4342	enact	v	\N	\N	1	C1	\N
4343	encompass	v	\N	\N	1	C1	\N
4344	encouragement	n	\N	\N	1	C1	\N
4345	encouraging	adj	\N	\N	1	C1	\N
4346	endeavour	n	\N	\N	1	C1	\N
4347	endless	adj	\N	\N	1	C1	\N
4348	endorse	v	\N	\N	1	C1	\N
4349	endorsement	n	\N	\N	1	C1	\N
4350	endure	v	\N	\N	1	C1	\N
4351	enforce	v	\N	\N	1	C1	\N
4352	enforcement	n	\N	\N	1	C1	\N
4353	engagement	n	\N	\N	1	C1	\N
4354	engaging	adj	\N	\N	1	C1	\N
4355	enrich	v	\N	\N	1	C1	\N
4356	enrol	v	\N	\N	1	C1	\N
7163	wager	v	\N	\N	1	C2	\N
4357	enterprise	n	\N	\N	1	C1	\N
4358	enthusiast	n	\N	\N	1	C1	\N
4359	entitle	v	\N	\N	1	C1	\N
4360	entity	n	\N	\N	1	C1	\N
4361	epidemic	n	\N	\N	1	C1	\N
4362	equality	n	\N	\N	1	C1	\N
4363	equation	n	\N	\N	1	C1	\N
4364	erect	v	\N	\N	1	C1	\N
4365	escalate	v	\N	\N	1	C1	\N
4366	escort	n	\N	\N	1	C1	\N
4367	essence	n	\N	\N	1	C1	\N
4368	establishment	n	\N	\N	1	C1	\N
4369	eternal	adj	\N	\N	1	C1	\N
4370	evacuate	v	\N	\N	1	C1	\N
4371	evoke	v	\N	\N	1	C1	\N
4372	evolutionary	adj	\N	\N	1	C1	\N
4373	exaggerate	v	\N	\N	1	C1	\N
4374	excellence	n	\N	\N	1	C1	\N
4375	exceptional	adj	\N	\N	1	C1	\N
4376	excess	n	\N	\N	1	C1	\N
4377	exclusion	n	\N	\N	1	C1	\N
4378	exclusive	adj	\N	\N	1	C1	\N
4379	exclusively	adv	\N	\N	1	C1	\N
4380	execute	v	\N	\N	1	C1	\N
4381	execution	n	\N	\N	1	C1	\N
4382	exert	v	\N	\N	1	C1	\N
4383	exile	n	\N	\N	1	C1	\N
4384	expenditure	n	\N	\N	1	C1	\N
4385	experimental	adj	\N	\N	1	C1	\N
4386	expire	v	\N	\N	1	C1	\N
4387	explicit	adj	\N	\N	1	C1	\N
4388	explicitly	adv	\N	\N	1	C1	\N
4389	exploitation	n	\N	\N	1	C1	\N
4390	explosive	n	\N	\N	1	C1	\N
4391	extremist	n	\N	\N	1	C1	\N
4392	facilitate	v	\N	\N	1	C1	\N
4393	faction	n	\N	\N	1	C1	\N
4394	fade	v	\N	\N	1	C1	\N
4395	fairness	n	\N	\N	1	C1	\N
4396	fatal	adj	\N	\N	1	C1	\N
4397	fate	n	\N	\N	1	C1	\N
4398	favourable	adj	\N	\N	1	C1	\N
4399	feat	n	\N	\N	1	C1	\N
4400	felony	n	\N	\N	1	C1	\N
4401	feminist	n	\N	\N	1	C1	\N
4402	fibre	n	\N	\N	1	C1	\N
4403	fierce	adj	\N	\N	1	C1	\N
4404	filmmaker	n	\N	\N	1	C1	\N
4405	filter	n	\N	\N	1	C1	\N
4406	firearm	n	\N	\N	1	C1	\N
4407	fiscal	adj	\N	\N	1	C1	\N
4408	flaw	n	\N	\N	1	C1	\N
4409	flawed	adj	\N	\N	1	C1	\N
4410	flee	v	\N	\N	1	C1	\N
4411	fleet	n	\N	\N	1	C1	\N
4412	flesh	n	\N	\N	1	C1	\N
4413	flexibility	n	\N	\N	1	C1	\N
4414	flourish	v	\N	\N	1	C1	\N
4415	fluid	n	\N	\N	1	C1	\N
4416	footage	n	\N	\N	1	C1	\N
4417	foresee	v	\N	\N	1	C1	\N
4418	foreigner	n	\N	\N	1	C1	\N
4419	forge	v	\N	\N	1	C1	\N
4420	formula	n	\N	\N	1	C1	\N
4421	formulate	v	\N	\N	1	C1	\N
4422	forth	adv	\N	\N	1	C1	\N
4423	forthcoming	adj	\N	\N	1	C1	\N
4424	foster	v	\N	\N	1	C1	\N
4425	fragile	adj	\N	\N	1	C1	\N
4426	franchise	n	\N	\N	1	C1	\N
4427	frankly	adv	\N	\N	1	C1	\N
4428	fraudulent	adj	\N	\N	1	C1	\N
4429	frustrating	adj	\N	\N	1	C1	\N
4430	frustration	n	\N	\N	1	C1	\N
4431	functional	adj	\N	\N	1	C1	\N
4432	fundraising	n	\N	\N	1	C1	\N
4433	gambling	n	\N	\N	1	C1	\N
4434	gathering	n	\N	\N	1	C1	\N
4435	gaze	v	\N	\N	1	C1	\N
4436	gear	n	\N	\N	1	C1	\N
4437	generic	adj	\N	\N	1	C1	\N
4438	genocide	n	\N	\N	1	C1	\N
4439	glance	v	\N	\N	1	C1	\N
4440	glimpse	n	\N	\N	1	C1	\N
4441	glorious	adj	\N	\N	1	C1	\N
4442	glory	n	\N	\N	1	C1	\N
4443	governance	n	\N	\N	1	C1	\N
4444	grace	n	\N	\N	1	C1	\N
4445	grasp	v	\N	\N	1	C1	\N
4446	grave	adj	\N	\N	1	C1	\N
4447	gravity	n	\N	\N	1	C1	\N
4448	grid	n	\N	\N	1	C1	\N
4449	grief	n	\N	\N	1	C1	\N
4450	grin	v	\N	\N	1	C1	\N
4451	grind	v	\N	\N	1	C1	\N
4452	grip	n	\N	\N	1	C1	\N
4453	gross	adj	\N	\N	1	C1	\N
4454	guerrilla	n	\N	\N	1	C1	\N
4455	guidance	n	\N	\N	1	C1	\N
4456	guilt	n	\N	\N	1	C1	\N
4457	gut	n	\N	\N	1	C1	\N
4458	hail	v	\N	\N	1	C1	\N
4459	halfway	adv	\N	\N	1	C1	\N
4460	halt	v	\N	\N	1	C1	\N
4461	handful	n	\N	\N	1	C1	\N
4462	handling	n	\N	\N	1	C1	\N
4463	handy	adj	\N	\N	1	C1	\N
4464	harassment	n	\N	\N	1	C1	\N
4465	hardware	n	\N	\N	1	C1	\N
4466	harmony	n	\N	\N	1	C1	\N
4467	harsh	adj	\N	\N	1	C1	\N
4468	harvest	n	\N	\N	1	C1	\N
4469	hatred	n	\N	\N	1	C1	\N
4470	haunt	v	\N	\N	1	C1	\N
4471	hazard	n	\N	\N	1	C1	\N
4472	hence	adv	\N	\N	1	C1	\N
4473	heighten	v	\N	\N	1	C1	\N
4474	heritage	n	\N	\N	1	C1	\N
4475	hierarchy	n	\N	\N	1	C1	\N
4476	high-profile	adj	\N	\N	1	C1	\N
4477	homeland	n	\N	\N	1	C1	\N
4478	hopeful	adj	\N	\N	1	C1	\N
4479	horizon	n	\N	\N	1	C1	\N
4480	hostage	n	\N	\N	1	C1	\N
4481	hostile	adj	\N	\N	1	C1	\N
4482	hostility	n	\N	\N	1	C1	\N
4483	humanitarian	adj	\N	\N	1	C1	\N
4484	humanity	n	\N	\N	1	C1	\N
4485	humble	adj	\N	\N	1	C1	\N
4486	hydrogen	n	\N	\N	1	C1	\N
4487	hypothesis	n	\N	\N	1	C1	\N
4488	identification	n	\N	\N	1	C1	\N
4489	ideological	adj	\N	\N	1	C1	\N
4490	ideology	n	\N	\N	1	C1	\N
4491	ignorance	n	\N	\N	1	C1	\N
4492	imagery	n	\N	\N	1	C1	\N
4493	immense	adj	\N	\N	1	C1	\N
4494	imminent	adj	\N	\N	1	C1	\N
4495	implementation	n	\N	\N	1	C1	\N
4496	imprison	v	\N	\N	1	C1	\N
4497	inability	n	\N	\N	1	C1	\N
4498	inadequate	adj	\N	\N	1	C1	\N
4499	inappropriate	adj	\N	\N	1	C1	\N
4500	incarcerate	v	\N	\N	1	C1	\N
4501	incarceration	n	\N	\N	1	C1	\N
4502	incidence	n	\N	\N	1	C1	\N
4503	inclined	adj	\N	\N	1	C1	\N
4504	inclusion	n	\N	\N	1	C1	\N
4505	incur	v	\N	\N	1	C1	\N
4506	indicator	n	\N	\N	1	C1	\N
4507	indictment	n	\N	\N	1	C1	\N
4508	indigenous	adj	\N	\N	1	C1	\N
4509	induce	v	\N	\N	1	C1	\N
4510	indulge	v	\N	\N	1	C1	\N
4511	inequality	n	\N	\N	1	C1	\N
4512	infamous	adj	\N	\N	1	C1	\N
4513	infect	v	\N	\N	1	C1	\N
4514	inflict	v	\N	\N	1	C1	\N
4515	influential	adj	\N	\N	1	C1	\N
4516	infrastructure	n	\N	\N	1	C1	\N
4517	inherent	adj	\N	\N	1	C1	\N
4518	inhibit	v	\N	\N	1	C1	\N
4519	initiate	v	\N	\N	1	C1	\N
4520	inject	v	\N	\N	1	C1	\N
4521	injection	n	\N	\N	1	C1	\N
4522	injustice	n	\N	\N	1	C1	\N
4523	inmate	n	\N	\N	1	C1	\N
4524	inquire	v	\N	\N	1	C1	\N
4525	insertion	n	\N	\N	1	C1	\N
4526	insider	n	\N	\N	1	C1	\N
4527	inspect	v	\N	\N	1	C1	\N
4528	inspection	n	\N	\N	1	C1	\N
4529	inspiration	n	\N	\N	1	C1	\N
4530	instinct	n	\N	\N	1	C1	\N
4531	institutional	adj	\N	\N	1	C1	\N
4532	instruct	v	\N	\N	1	C1	\N
4533	instrumental	adj	\N	\N	1	C1	\N
4534	insufficient	adj	\N	\N	1	C1	\N
4535	insult	n	\N	\N	1	C1	\N
4536	intact	adj	\N	\N	1	C1	\N
4537	intake	n	\N	\N	1	C1	\N
4538	integral	adj	\N	\N	1	C1	\N
4539	integrated	adj	\N	\N	1	C1	\N
4540	integration	n	\N	\N	1	C1	\N
4541	integrity	n	\N	\N	1	C1	\N
4542	intensify	v	\N	\N	1	C1	\N
4543	intensity	n	\N	\N	1	C1	\N
4544	intensive	adj	\N	\N	1	C1	\N
4545	intent	n	\N	\N	1	C1	\N
4546	interactive	adj	\N	\N	1	C1	\N
4547	interface	n	\N	\N	1	C1	\N
4548	interfere	v	\N	\N	1	C1	\N
4549	interference	n	\N	\N	1	C1	\N
4550	interim	adj	\N	\N	1	C1	\N
4551	interior	n	\N	\N	1	C1	\N
4552	intermediate	adj	\N	\N	1	C1	\N
4553	intersection	n	\N	\N	1	C1	\N
4554	intervene	v	\N	\N	1	C1	\N
4555	intervention	n	\N	\N	1	C1	\N
4556	intimate	adj	\N	\N	1	C1	\N
4557	intriguing	adj	\N	\N	1	C1	\N
4558	inventory	n	\N	\N	1	C1	\N
4559	investigator	n	\N	\N	1	C1	\N
4560	invisible	adj	\N	\N	1	C1	\N
4561	invoke	v	\N	\N	1	C1	\N
4562	involvement	n	\N	\N	1	C1	\N
4563	ironic	adj	\N	\N	1	C1	\N
4564	ironically	adv	\N	\N	1	C1	\N
4565	irony	n	\N	\N	1	C1	\N
4566	irrelevant	adj	\N	\N	1	C1	\N
4567	isolation	n	\N	\N	1	C1	\N
4568	judicial	adj	\N	\N	1	C1	\N
4569	jurisdiction	n	\N	\N	1	C1	\N
4570	just	adj	\N	\N	1	C1	\N
4571	justification	n	\N	\N	1	C1	\N
4572	landlord	n	\N	\N	1	C1	\N
4573	landmark	n	\N	\N	1	C1	\N
4574	lap	n	\N	\N	1	C1	\N
4575	large-scale	adj	\N	\N	1	C1	\N
4576	latter	adj	\N	\N	1	C1	\N
4577	lawmaker	n	\N	\N	1	C1	\N
4578	lawn	n	\N	\N	1	C1	\N
4579	lawsuit	n	\N	\N	1	C1	\N
4580	layout	n	\N	\N	1	C1	\N
4581	leak	n	\N	\N	1	C1	\N
4582	leap	v	\N	\N	1	C1	\N
4583	legacy	n	\N	\N	1	C1	\N
4584	legendary	adj	\N	\N	1	C1	\N
4585	legislation	n	\N	\N	1	C1	\N
4586	legislative	adj	\N	\N	1	C1	\N
4587	legislature	n	\N	\N	1	C1	\N
4588	legitimate	adj	\N	\N	1	C1	\N
4589	lengthy	adj	\N	\N	1	C1	\N
4590	lesbian	adj	\N	\N	1	C1	\N
4591	lesser	adj	\N	\N	1	C1	\N
4592	lethal	adj	\N	\N	1	C1	\N
4593	liable	adj	\N	\N	1	C1	\N
4594	liability	n	\N	\N	1	C1	\N
4595	liberal	adj	\N	\N	1	C1	\N
4596	liberation	n	\N	\N	1	C1	\N
4597	liberty	n	\N	\N	1	C1	\N
4598	lifelong	adj	\N	\N	1	C1	\N
4599	likelihood	n	\N	\N	1	C1	\N
4600	limb	n	\N	\N	1	C1	\N
4601	linear	adj	\N	\N	1	C1	\N
4602	line-up	n	\N	\N	1	C1	\N
4603	linger	v	\N	\N	1	C1	\N
4604	listing	n	\N	\N	1	C1	\N
4605	literacy	n	\N	\N	1	C1	\N
4606	lobby	n	\N	\N	1	C1	\N
4607	logic	n	\N	\N	1	C1	\N
4608	long-standing	adj	\N	\N	1	C1	\N
4609	long-time	adj	\N	\N	1	C1	\N
4610	loom	v	\N	\N	1	C1	\N
4611	loop	n	\N	\N	1	C1	\N
4612	loyalty	n	\N	\N	1	C1	\N
4613	machinery	n	\N	\N	1	C1	\N
4614	magical	adj	\N	\N	1	C1	\N
4615	magnetic	adj	\N	\N	1	C1	\N
4616	magnitude	n	\N	\N	1	C1	\N
4617	mainland	n	\N	\N	1	C1	\N
4618	mainstream	n	\N	\N	1	C1	\N
4619	maintenance	n	\N	\N	1	C1	\N
4620	mandate	n	\N	\N	1	C1	\N
4621	mandatory	adj	\N	\N	1	C1	\N
4622	manifest	v	\N	\N	1	C1	\N
4623	manipulate	v	\N	\N	1	C1	\N
4624	manipulation	n	\N	\N	1	C1	\N
4625	manuscript	n	\N	\N	1	C1	\N
4626	march	n	\N	\N	1	C1	\N
4627	marginal	adj	\N	\N	1	C1	\N
4628	marine	adj	\N	\N	1	C1	\N
4629	marketplace	n	\N	\N	1	C1	\N
4630	massacre	n	\N	\N	1	C1	\N
4631	mathematical	adj	\N	\N	1	C1	\N
4632	mature	adj	\N	\N	1	C1	\N
4633	maximise	v	\N	\N	1	C1	\N
4634	meaningful	adj	\N	\N	1	C1	\N
4635	meantime	n	\N	\N	1	C1	\N
4636	medieval	adj	\N	\N	1	C1	\N
4637	meditation	n	\N	\N	1	C1	\N
4638	melody	n	\N	\N	1	C1	\N
4639	memo	n	\N	\N	1	C1	\N
4640	memoir	n	\N	\N	1	C1	\N
4641	memorial	n	\N	\N	1	C1	\N
4642	mentor	n	\N	\N	1	C1	\N
4643	merchant	n	\N	\N	1	C1	\N
4644	mercy	n	\N	\N	1	C1	\N
4645	mere	adj	\N	\N	1	C1	\N
4646	merely	adv	\N	\N	1	C1	\N
4647	merge	v	\N	\N	1	C1	\N
4648	merger	n	\N	\N	1	C1	\N
4649	merit	n	\N	\N	1	C1	\N
4650	in the midst of	prep	\N	\N	1	C1	\N
4651	migration	n	\N	\N	1	C1	\N
4652	militant	n	\N	\N	1	C1	\N
4653	militia	n	\N	\N	1	C1	\N
4654	minimal	adj	\N	\N	1	C1	\N
4655	minimise	v	\N	\N	1	C1	\N
4656	mining	n	\N	\N	1	C1	\N
4657	ministry	n	\N	\N	1	C1	\N
4658	minute	adj	\N	\N	1	C1	\N
4659	miracle	n	\N	\N	1	C1	\N
4660	misery	n	\N	\N	1	C1	\N
4661	misleading	adj	\N	\N	1	C1	\N
4662	mismanagement	n	\N	\N	1	C1	\N
4663	missile	n	\N	\N	1	C1	\N
4664	mob	n	\N	\N	1	C1	\N
4665	mobility	n	\N	\N	1	C1	\N
4666	mobilise	v	\N	\N	1	C1	\N
4667	moderate	adj	\N	\N	1	C1	\N
4668	modification	n	\N	\N	1	C1	\N
4669	module	n	\N	\N	1	C1	\N
4670	momentum	n	\N	\N	1	C1	\N
4671	monk	n	\N	\N	1	C1	\N
4672	monopoly	n	\N	\N	1	C1	\N
4673	morality	n	\N	\N	1	C1	\N
4674	motive	n	\N	\N	1	C1	\N
4675	municipal	adj	\N	\N	1	C1	\N
4676	mutual	adj	\N	\N	1	C1	\N
4677	naive	adj	\N	\N	1	C1	\N
4678	namely	adv	\N	\N	1	C1	\N
4679	nationwide	adj	\N	\N	1	C1	\N
4680	naval	adj	\N	\N	1	C1	\N
4681	neglect	v	\N	\N	1	C1	\N
4682	neighbouring	adj	\N	\N	1	C1	\N
4683	newsletter	n	\N	\N	1	C1	\N
4684	niche	n	\N	\N	1	C1	\N
4685	noble	adj	\N	\N	1	C1	\N
4686	nod	v	\N	\N	1	C1	\N
4687	nominate	v	\N	\N	1	C1	\N
4688	nomination	n	\N	\N	1	C1	\N
4689	nominee	n	\N	\N	1	C1	\N
4690	nonetheless	adv	\N	\N	1	C1	\N
4691	non-profit	adj	\N	\N	1	C1	\N
4692	nonsense	n	\N	\N	1	C1	\N
4693	norm	n	\N	\N	1	C1	\N
4694	notable	adj	\N	\N	1	C1	\N
4695	notably	adv	\N	\N	1	C1	\N
4696	notify	v	\N	\N	1	C1	\N
4697	notorious	adj	\N	\N	1	C1	\N
4698	nursery	n	\N	\N	1	C1	\N
4699	objection	n	\N	\N	1	C1	\N
4700	oblige	v	\N	\N	1	C1	\N
4701	obsess	v	\N	\N	1	C1	\N
4702	obsession	n	\N	\N	1	C1	\N
4703	occasional	adj	\N	\N	1	C1	\N
4704	occurrence	n	\N	\N	1	C1	\N
4705	odds	n	\N	\N	1	C1	\N
4706	offering	n	\N	\N	1	C1	\N
4707	offspring	n	\N	\N	1	C1	\N
4708	operational	adj	\N	\N	1	C1	\N
4709	opt	v	\N	\N	1	C1	\N
4710	optimism	n	\N	\N	1	C1	\N
4711	oral	adj	\N	\N	1	C1	\N
4712	organisational	adj	\N	\N	1	C1	\N
4713	orientation	n	\N	\N	1	C1	\N
4714	originate	v	\N	\N	1	C1	\N
4715	outbreak	n	\N	\N	1	C1	\N
4716	outing	n	\N	\N	1	C1	\N
4717	outlet	n	\N	\N	1	C1	\N
4718	outlook	n	\N	\N	1	C1	\N
4719	outrage	n	\N	\N	1	C1	\N
4720	outsider	n	\N	\N	1	C1	\N
4721	overlook	v	\N	\N	1	C1	\N
4722	overly	adv	\N	\N	1	C1	\N
4723	oversee	v	\N	\N	1	C1	\N
4724	overturn	v	\N	\N	1	C1	\N
4725	overwhelm	v	\N	\N	1	C1	\N
4726	overwhelming	adj	\N	\N	1	C1	\N
4727	parameter	n	\N	\N	1	C1	\N
4728	parental	adj	\N	\N	1	C1	\N
4729	partial	adj	\N	\N	1	C1	\N
4730	partially	adv	\N	\N	1	C1	\N
4731	passing	n	\N	\N	1	C1	\N
4732	passive	adj	\N	\N	1	C1	\N
4733	pastor	n	\N	\N	1	C1	\N
4734	patent	n	\N	\N	1	C1	\N
4735	pathway	n	\N	\N	1	C1	\N
4736	patrol	n	\N	\N	1	C1	\N
4737	patron	n	\N	\N	1	C1	\N
4738	peak	n	\N	\N	1	C1	\N
4739	peasant	n	\N	\N	1	C1	\N
4740	peculiar	adj	\N	\N	1	C1	\N
4741	persist	v	\N	\N	1	C1	\N
4742	persistent	adj	\N	\N	1	C1	\N
4743	personnel	n	\N	\N	1	C1	\N
4744	petition	n	\N	\N	1	C1	\N
4745	philosopher	n	\N	\N	1	C1	\N
4746	philosophical	adj	\N	\N	1	C1	\N
4747	pioneer	n	\N	\N	1	C1	\N
4748	pipeline	n	\N	\N	1	C1	\N
4749	pit	n	\N	\N	1	C1	\N
4750	plausible	adj	\N	\N	1	C1	\N
4751	plea	n	\N	\N	1	C1	\N
4752	plead	v	\N	\N	1	C1	\N
4753	pledge	n	\N	\N	1	C1	\N
4754	plunge	n	\N	\N	1	C1	\N
4755	pole	n	\N	\N	1	C1	\N
4756	poll	n	\N	\N	1	C1	\N
4757	portfolio	n	\N	\N	1	C1	\N
4758	portray	v	\N	\N	1	C1	\N
4759	postpone	v	\N	\N	1	C1	\N
4760	post-war	adj	\N	\N	1	C1	\N
4761	practitioner	n	\N	\N	1	C1	\N
4762	preach	v	\N	\N	1	C1	\N
4763	precede	v	\N	\N	1	C1	\N
4764	precedent	n	\N	\N	1	C1	\N
4765	precision	n	\N	\N	1	C1	\N
4766	predator	n	\N	\N	1	C1	\N
4767	predecessor	n	\N	\N	1	C1	\N
4768	predominantly	adv	\N	\N	1	C1	\N
4769	pregnancy	n	\N	\N	1	C1	\N
4770	prejudice	n	\N	\N	1	C1	\N
4771	preliminary	adj	\N	\N	1	C1	\N
4772	premier	n	\N	\N	1	C1	\N
4773	premise	n	\N	\N	1	C1	\N
4774	premium	n	\N	\N	1	C1	\N
4775	prescribe	v	\N	\N	1	C1	\N
4776	prescription	n	\N	\N	1	C1	\N
4777	presently	adv	\N	\N	1	C1	\N
4778	preservation	n	\N	\N	1	C1	\N
4779	preside	v	\N	\N	1	C1	\N
4780	presidency	n	\N	\N	1	C1	\N
4781	prestigious	adj	\N	\N	1	C1	\N
4782	presumably	adv	\N	\N	1	C1	\N
4783	presume	v	\N	\N	1	C1	\N
4784	prevail	v	\N	\N	1	C1	\N
4785	prevalence	n	\N	\N	1	C1	\N
4786	prevention	n	\N	\N	1	C1	\N
4787	prey	n	\N	\N	1	C1	\N
4788	privatization	n	\N	\N	1	C1	\N
4789	privilege	n	\N	\N	1	C1	\N
4790	probe	n	\N	\N	1	C1	\N
4791	problematic	adj	\N	\N	1	C1	\N
4792	proceeding	n	\N	\N	1	C1	\N
4793	proceeds	n	\N	\N	1	C1	\N
4794	processing	n	\N	\N	1	C1	\N
4795	processor	n	\N	\N	1	C1	\N
4796	proclaim	v	\N	\N	1	C1	\N
4797	productive	adj	\N	\N	1	C1	\N
4798	productivity	n	\N	\N	1	C1	\N
4799	profitable	adj	\N	\N	1	C1	\N
4800	profound	adj	\N	\N	1	C1	\N
4801	projection	n	\N	\N	1	C1	\N
4802	prominent	adj	\N	\N	1	C1	\N
4803	pronounced	adj	\N	\N	1	C1	\N
4804	propaganda	n	\N	\N	1	C1	\N
4805	proposition	n	\N	\N	1	C1	\N
4806	prosecute	v	\N	\N	1	C1	\N
4807	prosecution	n	\N	\N	1	C1	\N
4808	prosecutor	n	\N	\N	1	C1	\N
4809	prospective	adj	\N	\N	1	C1	\N
4810	prosperity	n	\N	\N	1	C1	\N
4811	protective	adj	\N	\N	1	C1	\N
4812	protocol	n	\N	\N	1	C1	\N
4813	province	n	\N	\N	1	C1	\N
4814	provincial	adj	\N	\N	1	C1	\N
4815	provision	n	\N	\N	1	C1	\N
4816	provoke	v	\N	\N	1	C1	\N
4817	psychiatric	adj	\N	\N	1	C1	\N
4818	pulse	n	\N	\N	1	C1	\N
4819	query	n	\N	\N	1	C1	\N
4820	quest	n	\N	\N	1	C1	\N
4821	quota	n	\N	\N	1	C1	\N
4822	radical	adj	\N	\N	1	C1	\N
4823	rage	n	\N	\N	1	C1	\N
4824	raid	n	\N	\N	1	C1	\N
4825	rally	n	\N	\N	1	C1	\N
4826	ranking	n	\N	\N	1	C1	\N
4827	rape	n	\N	\N	1	C1	\N
4828	ratio	n	\N	\N	1	C1	\N
4829	rational	adj	\N	\N	1	C1	\N
4830	ray	n	\N	\N	1	C1	\N
4831	readily	adv	\N	\N	1	C1	\N
4832	realization	n	\N	\N	1	C1	\N
4833	realm	n	\N	\N	1	C1	\N
4834	rear	n	\N	\N	1	C1	\N
4835	reasoning	n	\N	\N	1	C1	\N
4836	reassure	v	\N	\N	1	C1	\N
4837	rebel	n	\N	\N	1	C1	\N
4838	rebellion	n	\N	\N	1	C1	\N
4839	recipient	n	\N	\N	1	C1	\N
4840	reconstruction	n	\N	\N	1	C1	\N
4841	recount	v	\N	\N	1	C1	\N
4842	recruitment	n	\N	\N	1	C1	\N
4843	referendum	n	\N	\N	1	C1	\N
4844	reflection	n	\N	\N	1	C1	\N
4845	reform	n	\N	\N	1	C1	\N
4846	refuge	n	\N	\N	1	C1	\N
4847	refusal	n	\N	\N	1	C1	\N
4848	regain	v	\N	\N	1	C1	\N
4849	regardless	adv	\N	\N	1	C1	\N
4850	regime	n	\N	\N	1	C1	\N
4851	regulator	n	\N	\N	1	C1	\N
4852	regulatory	adj	\N	\N	1	C1	\N
4853	rehabilitation	n	\N	\N	1	C1	\N
4854	reign	n	\N	\N	1	C1	\N
4855	rejection	n	\N	\N	1	C1	\N
4856	relevance	n	\N	\N	1	C1	\N
4857	reliability	n	\N	\N	1	C1	\N
4858	reluctant	adj	\N	\N	1	C1	\N
4859	remainder	n	\N	\N	1	C1	\N
4860	remains	n	\N	\N	1	C1	\N
4861	remedy	n	\N	\N	1	C1	\N
4862	reminder	n	\N	\N	1	C1	\N
4863	removal	n	\N	\N	1	C1	\N
4864	render	v	\N	\N	1	C1	\N
4865	renew	v	\N	\N	1	C1	\N
4866	renowned	adj	\N	\N	1	C1	\N
4867	rental	n	\N	\N	1	C1	\N
4868	replacement	n	\N	\N	1	C1	\N
4869	reportedly	adv	\N	\N	1	C1	\N
4870	representation	n	\N	\N	1	C1	\N
4871	reproduce	v	\N	\N	1	C1	\N
4872	reproduction	n	\N	\N	1	C1	\N
4873	republic	n	\N	\N	1	C1	\N
4874	resemble	v	\N	\N	1	C1	\N
4875	reside	v	\N	\N	1	C1	\N
4876	residence	n	\N	\N	1	C1	\N
4877	residential	adj	\N	\N	1	C1	\N
4878	residue	n	\N	\N	1	C1	\N
4879	resignation	n	\N	\N	1	C1	\N
4880	resistance	n	\N	\N	1	C1	\N
4881	respective	adj	\N	\N	1	C1	\N
4882	respectively	adv	\N	\N	1	C1	\N
4883	restoration	n	\N	\N	1	C1	\N
4884	restraint	n	\N	\N	1	C1	\N
4885	resume	v	\N	\N	1	C1	\N
4886	retreat	n	\N	\N	1	C1	\N
4887	retrieve	v	\N	\N	1	C1	\N
4888	revelation	n	\N	\N	1	C1	\N
4889	revenge	n	\N	\N	1	C1	\N
4890	reverse	v	\N	\N	1	C1	\N
4891	revival	n	\N	\N	1	C1	\N
4892	revive	v	\N	\N	1	C1	\N
4893	revolutionary	adj	\N	\N	1	C1	\N
4894	rhetoric	n	\N	\N	1	C1	\N
4895	riot	n	\N	\N	1	C1	\N
4896	rip	v	\N	\N	1	C1	\N
4897	ritual	n	\N	\N	1	C1	\N
4898	robust	adj	\N	\N	1	C1	\N
4899	rod	n	\N	\N	1	C1	\N
4900	rookie	n	\N	\N	1	C1	\N
4901	roster	n	\N	\N	1	C1	\N
4902	rotate	v	\N	\N	1	C1	\N
4903	rotation	n	\N	\N	1	C1	\N
4904	ruling	n	\N	\N	1	C1	\N
4905	rumour	n	\N	\N	1	C1	\N
4906	sacred	adj	\N	\N	1	C1	\N
4907	sacrifice	n	\N	\N	1	C1	\N
4908	saint	n	\N	\N	1	C1	\N
4909	sake	n	\N	\N	1	C1	\N
4910	sanction	n	\N	\N	1	C1	\N
4911	saviour	n	\N	\N	1	C1	\N
4912	scenario	n	\N	\N	1	C1	\N
4913	scattered	adj	\N	\N	1	C1	\N
4914	scope	n	\N	\N	1	C1	\N
4915	screw	n	\N	\N	1	C1	\N
4916	scrutiny	n	\N	\N	1	C1	\N
4917	seal	n	\N	\N	1	C1	\N
4918	secondly	adv	\N	\N	1	C1	\N
4919	secular	adj	\N	\N	1	C1	\N
4920	seemingly	adv	\N	\N	1	C1	\N
4921	segment	n	\N	\N	1	C1	\N
4922	seize	v	\N	\N	1	C1	\N
4923	seldom	adv	\N	\N	1	C1	\N
4924	selective	adj	\N	\N	1	C1	\N
4925	sensation	n	\N	\N	1	C1	\N
4926	sensitivity	n	\N	\N	1	C1	\N
4927	sentiment	n	\N	\N	1	C1	\N
4928	separation	n	\N	\N	1	C1	\N
4929	serial	adj	\N	\N	1	C1	\N
4930	settlement	n	\N	\N	1	C1	\N
4931	setup	n	\N	\N	1	C1	\N
4932	sexuality	n	\N	\N	1	C1	\N
4933	shareholder	n	\N	\N	1	C1	\N
4934	shatter	v	\N	\N	1	C1	\N
4935	shed	v	\N	\N	1	C1	\N
4936	sheer	adj	\N	\N	1	C1	\N
4937	shipping	n	\N	\N	1	C1	\N
4938	shrink	v	\N	\N	1	C1	\N
4939	shrug	v	\N	\N	1	C1	\N
4940	sigh	v	\N	\N	1	C1	\N
4941	simulate	v	\N	\N	1	C1	\N
4942	simulation	n	\N	\N	1	C1	\N
4943	simultaneously	adv	\N	\N	1	C1	\N
4944	sin	n	\N	\N	1	C1	\N
4945	situated	adj	\N	\N	1	C1	\N
4946	sceptical	adj	\N	\N	1	C1	\N
4947	sketch	n	\N	\N	1	C1	\N
4948	slash	n	\N	\N	1	C1	\N
4949	slavery	n	\N	\N	1	C1	\N
4950	slot	n	\N	\N	1	C1	\N
4951	smash	v	\N	\N	1	C1	\N
4952	snap	v	\N	\N	1	C1	\N
4953	soak	v	\N	\N	1	C1	\N
4954	soar	v	\N	\N	1	C1	\N
4955	socialist	adj	\N	\N	1	C1	\N
4956	sole	adj	\N	\N	1	C1	\N
4957	solely	adv	\N	\N	1	C1	\N
4958	solidarity	n	\N	\N	1	C1	\N
4959	solo	n	\N	\N	1	C1	\N
4960	sovereignty	n	\N	\N	1	C1	\N
4961	span	n	\N	\N	1	C1	\N
4962	spark	n	\N	\N	1	C1	\N
4963	specialised	adj	\N	\N	1	C1	\N
4964	specification	n	\N	\N	1	C1	\N
4965	specimen	n	\N	\N	1	C1	\N
4966	spectacle	n	\N	\N	1	C1	\N
4967	spectrum	n	\N	\N	1	C1	\N
4968	sphere	n	\N	\N	1	C1	\N
4969	spin	v	\N	\N	1	C1	\N
4970	spine	n	\N	\N	1	C1	\N
4971	spotlight	n	\N	\N	1	C1	\N
4972	spouse	n	\N	\N	1	C1	\N
4973	squad	n	\N	\N	1	C1	\N
4974	squeeze	v	\N	\N	1	C1	\N
4975	stab	v	\N	\N	1	C1	\N
4976	stability	n	\N	\N	1	C1	\N
4977	stabilise	v	\N	\N	1	C1	\N
4978	stake	n	\N	\N	1	C1	\N
4979	standing	n	\N	\N	1	C1	\N
4980	stark	adj	\N	\N	1	C1	\N
4981	statistical	adj	\N	\N	1	C1	\N
4982	steer	v	\N	\N	1	C1	\N
4983	stem from	v	\N	\N	1	C1	\N
4984	stereotype	n	\N	\N	1	C1	\N
4985	stimulus	n	\N	\N	1	C1	\N
4986	stir	v	\N	\N	1	C1	\N
4987	storage	n	\N	\N	1	C1	\N
4988	straightforward	adj	\N	\N	1	C1	\N
4989	strain	n	\N	\N	1	C1	\N
4990	strand	n	\N	\N	1	C1	\N
4991	strategic	adj	\N	\N	1	C1	\N
4992	strip	n	\N	\N	1	C1	\N
4993	strive	v	\N	\N	1	C1	\N
4994	structural	adj	\N	\N	1	C1	\N
4995	stumble	v	\N	\N	1	C1	\N
4996	stun	v	\N	\N	1	C1	\N
4997	submission	n	\N	\N	1	C1	\N
4998	subscriber	n	\N	\N	1	C1	\N
4999	subscription	n	\N	\N	1	C1	\N
5000	subsequent	adj	\N	\N	1	C1	\N
5001	subsequently	adv	\N	\N	1	C1	\N
5002	subsidy	n	\N	\N	1	C1	\N
5003	substantial	adj	\N	\N	1	C1	\N
5004	substantially	adv	\N	\N	1	C1	\N
5005	substitute	n	\N	\N	1	C1	\N
5006	substitution	n	\N	\N	1	C1	\N
5007	subtle	adj	\N	\N	1	C1	\N
5008	suburban	adj	\N	\N	1	C1	\N
5009	succession	n	\N	\N	1	C1	\N
5010	successive	adj	\N	\N	1	C1	\N
5011	successor	n	\N	\N	1	C1	\N
5012	suck	v	\N	\N	1	C1	\N
5013	sue	v	\N	\N	1	C1	\N
5014	suicide	n	\N	\N	1	C1	\N
5015	suite	n	\N	\N	1	C1	\N
5016	summit	n	\N	\N	1	C1	\N
5017	superb	adj	\N	\N	1	C1	\N
5018	superintendent	n	\N	\N	1	C1	\N
5019	superior	adj	\N	\N	1	C1	\N
5020	supervise	v	\N	\N	1	C1	\N
5021	supervision	n	\N	\N	1	C1	\N
5022	supervisor	n	\N	\N	1	C1	\N
5023	supplement	n	\N	\N	1	C1	\N
5024	supportive	adj	\N	\N	1	C1	\N
5025	supposedly	adv	\N	\N	1	C1	\N
5026	suppress	v	\N	\N	1	C1	\N
5027	supreme	adj	\N	\N	1	C1	\N
5028	surge	n	\N	\N	1	C1	\N
5029	surgical	adj	\N	\N	1	C1	\N
5030	surplus	n	\N	\N	1	C1	\N
5031	surrender	v	\N	\N	1	C1	\N
5032	surveillance	n	\N	\N	1	C1	\N
5033	suspension	n	\N	\N	1	C1	\N
5034	suspicion	n	\N	\N	1	C1	\N
5035	suspicious	adj	\N	\N	1	C1	\N
5036	sustain	v	\N	\N	1	C1	\N
5037	symbolic	adj	\N	\N	1	C1	\N
5038	syndrome	n	\N	\N	1	C1	\N
5039	synthesis	n	\N	\N	1	C1	\N
5040	systematic	adj	\N	\N	1	C1	\N
5041	tackle	v	\N	\N	1	C1	\N
5042	tactic	n	\N	\N	1	C1	\N
5043	tactical	adj	\N	\N	1	C1	\N
5044	taxpayer	n	\N	\N	1	C1	\N
5045	tempt	v	\N	\N	1	C1	\N
5046	tenant	n	\N	\N	1	C1	\N
5047	tender	adj	\N	\N	1	C1	\N
5048	tenure	n	\N	\N	1	C1	\N
5049	terminate	v	\N	\N	1	C1	\N
5050	terrain	n	\N	\N	1	C1	\N
5051	terrific	adj	\N	\N	1	C1	\N
5052	testify	v	\N	\N	1	C1	\N
5053	testimony	n	\N	\N	1	C1	\N
5054	texture	n	\N	\N	1	C1	\N
5055	thankfully	adv	\N	\N	1	C1	\N
5056	theatrical	adj	\N	\N	1	C1	\N
5057	theology	n	\N	\N	1	C1	\N
5058	theoretical	adj	\N	\N	1	C1	\N
5059	thereafter	adv	\N	\N	1	C1	\N
5060	thereby	adv	\N	\N	1	C1	\N
5061	thesis	n	\N	\N	1	C1	\N
5062	thoughtful	adj	\N	\N	1	C1	\N
5063	thread	n	\N	\N	1	C1	\N
5064	threshold	n	\N	\N	1	C1	\N
5065	thrilled	adj	\N	\N	1	C1	\N
5066	thrive	v	\N	\N	1	C1	\N
5067	tide	n	\N	\N	1	C1	\N
5068	tighten	v	\N	\N	1	C1	\N
5069	timber	n	\N	\N	1	C1	\N
5070	timely	adj	\N	\N	1	C1	\N
5071	tobacco	n	\N	\N	1	C1	\N
5072	tolerance	n	\N	\N	1	C1	\N
5073	tolerate	v	\N	\N	1	C1	\N
5074	toll	n	\N	\N	1	C1	\N
5075	torture	n	\N	\N	1	C1	\N
5076	toss	v	\N	\N	1	C1	\N
5077	trademark	n	\N	\N	1	C1	\N
5078	trail	n	\N	\N	1	C1	\N
5079	traitor	n	\N	\N	1	C1	\N
5080	transaction	n	\N	\N	1	C1	\N
5081	transcript	n	\N	\N	1	C1	\N
5082	transformation	n	\N	\N	1	C1	\N
5083	transit	n	\N	\N	1	C1	\N
5084	transmission	n	\N	\N	1	C1	\N
5085	transparency	n	\N	\N	1	C1	\N
5086	transparent	adj	\N	\N	1	C1	\N
5087	trauma	n	\N	\N	1	C1	\N
5088	treaty	n	\N	\N	1	C1	\N
5089	tremendous	adj	\N	\N	1	C1	\N
5090	tribal	adj	\N	\N	1	C1	\N
5091	tribute	n	\N	\N	1	C1	\N
5092	trigger	n	\N	\N	1	C1	\N
5093	trio	n	\N	\N	1	C1	\N
5094	triumph	n	\N	\N	1	C1	\N
5095	trophy	n	\N	\N	1	C1	\N
5096	troubled	adj	\N	\N	1	C1	\N
5097	trustee	n	\N	\N	1	C1	\N
5098	tuition	n	\N	\N	1	C1	\N
5099	tumour	n	\N	\N	1	C1	\N
5100	turnout	n	\N	\N	1	C1	\N
5101	turnover	n	\N	\N	1	C1	\N
5102	twist	v	\N	\N	1	C1	\N
5103	unconstitutional	adj	\N	\N	1	C1	\N
5104	undergraduate	n	\N	\N	1	C1	\N
5105	underlying	adj	\N	\N	1	C1	\N
5106	undermine	v	\N	\N	1	C1	\N
5107	undoubtedly	adv	\N	\N	1	C1	\N
5108	unify	v	\N	\N	1	C1	\N
5109	unprecedented	adj	\N	\N	1	C1	\N
5110	unveil	v	\N	\N	1	C1	\N
5111	upcoming	adj	\N	\N	1	C1	\N
5112	upgrade	v	\N	\N	1	C1	\N
5113	uphold	v	\N	\N	1	C1	\N
5114	utility	n	\N	\N	1	C1	\N
5115	utilise	v	\N	\N	1	C1	\N
5116	utterly	adv	\N	\N	1	C1	\N
5117	vacuum	n	\N	\N	1	C1	\N
5118	vague	adj	\N	\N	1	C1	\N
5119	validity	n	\N	\N	1	C1	\N
5120	vanish	v	\N	\N	1	C1	\N
5121	variable	n	\N	\N	1	C1	\N
5122	varied	adj	\N	\N	1	C1	\N
5123	vein	n	\N	\N	1	C1	\N
5124	venture	n	\N	\N	1	C1	\N
5125	verbal	adj	\N	\N	1	C1	\N
5126	verdict	n	\N	\N	1	C1	\N
5127	verify	v	\N	\N	1	C1	\N
5128	verse	n	\N	\N	1	C1	\N
5129	versus	prep	\N	\N	1	C1	\N
5130	vessel	n	\N	\N	1	C1	\N
5131	veteran	n	\N	\N	1	C1	\N
5132	viable	adj	\N	\N	1	C1	\N
5133	vibrant	adj	\N	\N	1	C1	\N
5134	vice	n	\N	\N	1	C1	\N
5135	vicious	adj	\N	\N	1	C1	\N
5136	violate	v	\N	\N	1	C1	\N
5137	violation	n	\N	\N	1	C1	\N
5138	virtue	n	\N	\N	1	C1	\N
5139	vocal	adj	\N	\N	1	C1	\N
5140	vow	v	\N	\N	1	C1	\N
5141	vulnerability	n	\N	\N	1	C1	\N
5142	vulnerable	adj	\N	\N	1	C1	\N
5143	ward	n	\N	\N	1	C1	\N
5144	warehouse	n	\N	\N	1	C1	\N
5145	warfare	n	\N	\N	1	C1	\N
5146	warrant	n	\N	\N	1	C1	\N
5147	warrior	n	\N	\N	1	C1	\N
5148	weaken	v	\N	\N	1	C1	\N
5149	weave	v	\N	\N	1	C1	\N
5150	weed	n	\N	\N	1	C1	\N
5151	well	n	\N	\N	1	C1	\N
5152	well-being	n	\N	\N	1	C1	\N
5153	whatsoever	adv	\N	\N	1	C1	\N
5154	whip	v	\N	\N	1	C1	\N
5155	wholly	adv	\N	\N	1	C1	\N
5156	widen	v	\N	\N	1	C1	\N
5157	width	n	\N	\N	1	C1	\N
5158	willingness	n	\N	\N	1	C1	\N
5159	wipe	v	\N	\N	1	C1	\N
5160	wit	n	\N	\N	1	C1	\N
5161	withdrawal	n	\N	\N	1	C1	\N
5162	workout	n	\N	\N	1	C1	\N
5163	worship	n	\N	\N	1	C1	\N
5164	worthwhile	adj	\N	\N	1	C1	\N
5165	worthy	adj	\N	\N	1	C1	\N
5166	wrongdoing	n	\N	\N	1	C1	\N
5167	yield	v	\N	\N	1	C1	\N
5168	abate	v	\N	\N	1	C2	\N
5169	abdicate	v	\N	\N	1	C2	\N
5170	aberration	n	\N	\N	1	C2	\N
5171	abet	v	\N	\N	1	C2	\N
5172	abeyance	n	\N	\N	1	C2	\N
5173	abhor	v	\N	\N	1	C2	\N
5174	abiding	adj	\N	\N	1	C2	\N
5175	abject	adj	\N	\N	1	C2	\N
5176	abjure	v	\N	\N	1	C2	\N
5177	abrogated	v	\N	\N	1	C2	\N
5178	abrogation	n	\N	\N	1	C2	\N
5179	abscond	v	\N	\N	1	C2	\N
5180	absolve	v	\N	\N	1	C2	\N
5181	abstain	v	\N	\N	1	C2	\N
5182	abstention	n	\N	\N	1	C2	\N
5183	abstinence	n	\N	\N	1	C2	\N
5184	abstruse	adj	\N	\N	1	C2	\N
5185	abyss	n	\N	\N	1	C2	\N
5186	accede	v	\N	\N	1	C2	\N
5187	accentuate	v	\N	\N	1	C2	\N
5188	accession	n	\N	\N	1	C2	\N
5189	acclaimed	adj	\N	\N	1	C2	\N
5190	acclamation	n	\N	\N	1	C2	\N
5191	accolade	n	\N	\N	1	C2	\N
5192	accomplice	n	\N	\N	1	C2	\N
5193	accost	v	\N	\N	1	C2	\N
5194	accredit	v	\N	\N	1	C2	\N
5195	accreditation	n	\N	\N	1	C2	\N
5196	accrue	v	\N	\N	1	C2	\N
5197	acerbic	adj	\N	\N	1	C2	\N
5198	acquiesce	v	\N	\N	1	C2	\N
5199	acquiescence	n	\N	\N	1	C2	\N
5200	acquit	v	\N	\N	1	C2	\N
5201	acrimonious	adj	\N	\N	1	C2	\N
5202	acrimony	n	\N	\N	1	C2	\N
5203	acuity	n	\N	\N	1	C2	\N
5204	acumen	n	\N	\N	1	C2	\N
5205	adage	n	\N	\N	1	C2	\N
5206	adamant	adj	\N	\N	1	C2	\N
5207	adherence	n	\N	\N	1	C2	\N
5208	adherent	n	\N	\N	1	C2	\N
5209	adjuration	n	\N	\N	1	C2	\N
5210	admittance	n	\N	\N	1	C2	\N
5211	admonish	v	\N	\N	1	C2	\N
5212	adroit	adj	\N	\N	1	C2	\N
5213	adulation	n	\N	\N	1	C2	\N
5214	advent	n	\N	\N	1	C2	\N
5215	adversary	n	\N	\N	1	C2	\N
5216	adversity	n	\N	\N	1	C2	\N
5217	aegis	n	\N	\N	1	C2	\N
5218	affable	adj	\N	\N	1	C2	\N
5219	affectation	n	\N	\N	1	C2	\N
5220	affidavit	n	\N	\N	1	C2	\N
5221	affinity	n	\N	\N	1	C2	\N
5222	affliction	n	\N	\N	1	C2	\N
5223	alacrity	n	\N	\N	1	C2	\N
5224	albeit	conj	\N	\N	1	C2	\N
5225	alchemy	n	\N	\N	1	C2	\N
5226	allegiance	n	\N	\N	1	C2	\N
5227	allegory	n	\N	\N	1	C2	\N
5228	alleviate	v	\N	\N	1	C2	\N
5229	allude	v	\N	\N	1	C2	\N
5230	allusion	n	\N	\N	1	C2	\N
5231	aloof	adj	\N	\N	1	C2	\N
5232	altercation	n	\N	\N	1	C2	\N
5233	altruistic	adj	\N	\N	1	C2	\N
5234	amalgamation	n	\N	\N	1	C2	\N
5235	ambiguity	n	\N	\N	1	C2	\N
5236	ambivalent	adj	\N	\N	1	C2	\N
5237	ambrosial	adj	\N	\N	1	C2	\N
5238	ameliorate	v	\N	\N	1	C2	\N
5239	amenable	adj	\N	\N	1	C2	\N
5240	anachronism	n	\N	\N	1	C2	\N
5241	anachronistic	adj	\N	\N	1	C2	\N
5242	analogous	adj	\N	\N	1	C2	\N
5243	anarchy	n	\N	\N	1	C2	\N
5244	anathema	n	\N	\N	1	C2	\N
5245	anecdote	n	\N	\N	1	C2	\N
5246	anguish	n	\N	\N	1	C2	\N
5247	animosity	n	\N	\N	1	C2	\N
5248	annihilation	n	\N	\N	1	C2	\N
5249	annum	n	\N	\N	1	C2	\N
5250	anomaly	n	\N	\N	1	C2	\N
5251	antagonise	v	\N	\N	1	C2	\N
5252	antecedent	n	\N	\N	1	C2	\N
5253	antidote	n	\N	\N	1	C2	\N
5254	antipathy	n	\N	\N	1	C2	\N
5255	antiquated	adj	\N	\N	1	C2	\N
5256	antiquity	n	\N	\N	1	C2	\N
5257	antithesis	n	\N	\N	1	C2	\N
5258	apathetic	adj	\N	\N	1	C2	\N
5259	aperture	n	\N	\N	1	C2	\N
5260	apex	n	\N	\N	1	C2	\N
5261	aplomb	n	\N	\N	1	C2	\N
5262	apostle	n	\N	\N	1	C2	\N
5263	apparatus	n	\N	\N	1	C2	\N
5264	apparition	n	\N	\N	1	C2	\N
5265	appease	v	\N	\N	1	C2	\N
5266	appellation	n	\N	\N	1	C2	\N
5267	apprehension	n	\N	\N	1	C2	\N
5268	apprehensive	adj	\N	\N	1	C2	\N
5269	aptitude	n	\N	\N	1	C2	\N
5270	arbiter	n	\N	\N	1	C2	\N
5271	arcane	adj	\N	\N	1	C2	\N
5272	archetype	n	\N	\N	1	C2	\N
5273	archipelago	n	\N	\N	1	C2	\N
5274	ardour	n	\N	\N	1	C2	\N
5275	arduous	adj	\N	\N	1	C2	\N
5276	arguably	adv	\N	\N	1	C2	\N
5277	armistice	n	\N	\N	1	C2	\N
5278	arrogance	n	\N	\N	1	C2	\N
5279	artifice	n	\N	\N	1	C2	\N
5280	artisan	n	\N	\N	1	C2	\N
5281	ascendancy	n	\N	\N	1	C2	\N
5282	ascertain	v	\N	\N	1	C2	\N
5283	aspersion	n	\N	\N	1	C2	\N
5284	assiduous	adj	\N	\N	1	C2	\N
5285	assuage	v	\N	\N	1	C2	\N
5286	astute	adj	\N	\N	1	C2	\N
5287	atone	v	\N	\N	1	C2	\N
5288	attrition	n	\N	\N	1	C2	\N
5289	audacity	n	\N	\N	1	C2	\N
5290	augment	v	\N	\N	1	C2	\N
5291	auspicious	adj	\N	\N	1	C2	\N
5292	austere	adj	\N	\N	1	C2	\N
5293	autocracy	n	\N	\N	1	C2	\N
5294	autocrat	n	\N	\N	1	C2	\N
5295	avarice	n	\N	\N	1	C2	\N
5296	aversion	n	\N	\N	1	C2	\N
5297	axiom	n	\N	\N	1	C2	\N
5298	axiomatic	adj	\N	\N	1	C2	\N
5299	backlash	n	\N	\N	1	C2	\N
5300	baleful	adj	\N	\N	1	C2	\N
5301	balk	v	\N	\N	1	C2	\N
5302	ballast	n	\N	\N	1	C2	\N
5303	balm	n	\N	\N	1	C2	\N
5304	banal	adj	\N	\N	1	C2	\N
5305	bane	n	\N	\N	1	C2	\N
5306	barrage	n	\N	\N	1	C2	\N
5307	bastion	n	\N	\N	1	C2	\N
5308	bear up	phr v	\N	\N	1	C2	\N
5309	bedlam	n	\N	\N	1	C2	\N
5310	beguile	v	\N	\N	1	C2	\N
5311	behemoth	n	\N	\N	1	C2	\N
5312	beleaguer	v	\N	\N	1	C2	\N
5313	belie	v	\N	\N	1	C2	\N
5314	bellicose	adj	\N	\N	1	C2	\N
5315	belligerent	adj	\N	\N	1	C2	\N
5316	bellwether	n	\N	\N	1	C2	\N
5317	bemoan	v	\N	\N	1	C2	\N
5318	benefactor	n	\N	\N	1	C2	\N
5319	benevolence	n	\N	\N	1	C2	\N
5320	benevolent	adj	\N	\N	1	C2	\N
5321	bequeath	v	\N	\N	1	C2	\N
5322	bequest	n	\N	\N	1	C2	\N
5323	berate	v	\N	\N	1	C2	\N
5324	bereavement	n	\N	\N	1	C2	\N
5325	bereft	adj	\N	\N	1	C2	\N
5326	beseech	v	\N	\N	1	C2	\N
5327	beset	v	\N	\N	1	C2	\N
5328	besotted	adj	\N	\N	1	C2	\N
5329	bestow	v	\N	\N	1	C2	\N
5330	bewitching	adj	\N	\N	1	C2	\N
5331	bigotry	n	\N	\N	1	C2	\N
5332	bilateral	adj	\N	\N	1	C2	\N
5333	billow	v	\N	\N	1	C2	\N
5334	bite the bullet	idiom	\N	\N	1	C2	\N
5335	blasphemy	n	\N	\N	1	C2	\N
5336	blithe	adj	\N	\N	1	C2	\N
5337	boisterous	adj	\N	\N	1	C2	\N
5338	bombastic	adj	\N	\N	1	C2	\N
5339	boon	n	\N	\N	1	C2	\N
5340	boorish	adj	\N	\N	1	C2	\N
5341	bounty	n	\N	\N	1	C2	\N
5342	bourgeoisie	n	\N	\N	1	C2	\N
5343	brandish	v	\N	\N	1	C2	\N
5344	bravado	n	\N	\N	1	C2	\N
5345	bravura	n	\N	\N	1	C2	\N
5346	brevity	n	\N	\N	1	C2	\N
5347	brinkmanship	n	\N	\N	1	C2	\N
5348	brusque	adj	\N	\N	1	C2	\N
5349	bulwark	n	\N	\N	1	C2	\N
5350	burgeon	v	\N	\N	1	C2	\N
5351	buttress	v	\N	\N	1	C2	\N
5352	byword	n	\N	\N	1	C2	\N
5353	cabal	n	\N	\N	1	C2	\N
5354	cache	n	\N	\N	1	C2	\N
5355	cacophony	n	\N	\N	1	C2	\N
5356	cadence	n	\N	\N	1	C2	\N
5357	cajole	v	\N	\N	1	C2	\N
5358	calibre	n	\N	\N	1	C2	\N
5359	callous	adj	\N	\N	1	C2	\N
5360	camaraderie	n	\N	\N	1	C2	\N
5361	candour	n	\N	\N	1	C2	\N
5362	cantankerous	adj	\N	\N	1	C2	\N
5363	capitulate	v	\N	\N	1	C2	\N
5364	capricious	adj	\N	\N	1	C2	\N
5365	cardinal	adj	\N	\N	1	C2	\N
5366	cartography	n	\N	\N	1	C2	\N
5367	caste	n	\N	\N	1	C2	\N
5368	castigate	v	\N	\N	1	C2	\N
5369	cataclysm	n	\N	\N	1	C2	\N
5370	catharsis	n	\N	\N	1	C2	\N
5371	caustic	adj	\N	\N	1	C2	\N
5372	cavalcade	n	\N	\N	1	C2	\N
5373	caveat	n	\N	\N	1	C2	\N
5374	censure	n	\N	\N	1	C2	\N
5375	cessation	n	\N	\N	1	C2	\N
5376	chagrin	n	\N	\N	1	C2	\N
5377	charlatan	n	\N	\N	1	C2	\N
5378	chasm	n	\N	\N	1	C2	\N
5379	chastise	v	\N	\N	1	C2	\N
5380	chattel	n	\N	\N	1	C2	\N
5381	chicanery	n	\N	\N	1	C2	\N
5382	chide	v	\N	\N	1	C2	\N
5383	chronology	n	\N	\N	1	C2	\N
5384	churlish	adj	\N	\N	1	C2	\N
5385	circumspect	adj	\N	\N	1	C2	\N
5386	circumvent	v	\N	\N	1	C2	\N
5387	citadel	n	\N	\N	1	C2	\N
5388	clandestine	adj	\N	\N	1	C2	\N
5389	cleave	v	\N	\N	1	C2	\N
5390	clemency	n	\N	\N	1	C2	\N
5391	clique	n	\N	\N	1	C2	\N
5392	cloister	n	\N	\N	1	C2	\N
5393	cloistered	adj	\N	\N	1	C2	\N
5394	clout	n	\N	\N	1	C2	\N
5395	coalesce	v	\N	\N	1	C2	\N
5396	coerce	v	\N	\N	1	C2	\N
5397	coercion	n	\N	\N	1	C2	\N
5398	cogent	adj	\N	\N	1	C2	\N
5399	cohesion	n	\N	\N	1	C2	\N
5400	collude	v	\N	\N	1	C2	\N
5401	collusion	n	\N	\N	1	C2	\N
5402	colossal	adj	\N	\N	1	C2	\N
5403	colossus	n	\N	\N	1	C2	\N
5404	commensurate	adj	\N	\N	1	C2	\N
5405	commiserate	v	\N	\N	1	C2	\N
5406	compatriot	n	\N	\N	1	C2	\N
5407	complacency	n	\N	\N	1	C2	\N
5408	complacent	adj	\N	\N	1	C2	\N
5409	complementary	adj	\N	\N	1	C2	\N
5410	complicity	n	\N	\N	1	C2	\N
5411	compulsion	n	\N	\N	1	C2	\N
5412	concatenation	n	\N	\N	1	C2	\N
5413	conciliatory	adj	\N	\N	1	C2	\N
5414	conclave	n	\N	\N	1	C2	\N
5415	concordance	n	\N	\N	1	C2	\N
5416	condescension	n	\N	\N	1	C2	\N
5417	condone	v	\N	\N	1	C2	\N
5418	confiscate	v	\N	\N	1	C2	\N
5419	conflagration	n	\N	\N	1	C2	\N
5420	confluence	n	\N	\N	1	C2	\N
5421	confound	v	\N	\N	1	C2	\N
5422	conjecture	n	\N	\N	1	C2	\N
5423	conjure	v	\N	\N	1	C2	\N
5424	connive	v	\N	\N	1	C2	\N
5425	connoisseur	n	\N	\N	1	C2	\N
5426	connotation	n	\N	\N	1	C2	\N
5427	conquest	n	\N	\N	1	C2	\N
5428	consecration	n	\N	\N	1	C2	\N
5429	consortium	n	\N	\N	1	C2	\N
5430	consternation	n	\N	\N	1	C2	\N
5431	construe	v	\N	\N	1	C2	\N
5432	consummation	n	\N	\N	1	C2	\N
5433	contagion	n	\N	\N	1	C2	\N
5434	contemptible	adj	\N	\N	1	C2	\N
5435	contingency	n	\N	\N	1	C2	\N
5436	continuum	n	\N	\N	1	C2	\N
5437	contravene	v	\N	\N	1	C2	\N
5438	contrition	n	\N	\N	1	C2	\N
5439	conundrum	n	\N	\N	1	C2	\N
5440	convene	v	\N	\N	1	C2	\N
5441	convergence	n	\N	\N	1	C2	\N
5442	convivial	adj	\N	\N	1	C2	\N
5443	convoluted	adj	\N	\N	1	C2	\N
5444	copious	adj	\N	\N	1	C2	\N
5445	coquettish	adj	\N	\N	1	C2	\N
5446	cordial	adj	\N	\N	1	C2	\N
5447	cornucopia	n	\N	\N	1	C2	\N
5448	corollary	n	\N	\N	1	C2	\N
5449	corroborate	v	\N	\N	1	C2	\N
5450	cortege	n	\N	\N	1	C2	\N
5451	cosmology	n	\N	\N	1	C2	\N
5452	cosmos	n	\N	\N	1	C2	\N
5453	countenance	v	\N	\N	1	C2	\N
5454	covet	v	\N	\N	1	C2	\N
5455	craven	adj	\N	\N	1	C2	\N
5456	credulous	adj	\N	\N	1	C2	\N
5457	creed	n	\N	\N	1	C2	\N
5458	crevasse	n	\N	\N	1	C2	\N
5459	crucible	n	\N	\N	1	C2	\N
5460	crux	n	\N	\N	1	C2	\N
5461	crypt	n	\N	\N	1	C2	\N
5462	culminate	v	\N	\N	1	C2	\N
5463	culpable	adj	\N	\N	1	C2	\N
5464	culprit	n	\N	\N	1	C2	\N
5465	cunning	adj	\N	\N	1	C2	\N
5466	cupidity	n	\N	\N	1	C2	\N
5467	curmudgeon	n	\N	\N	1	C2	\N
5468	cursory	adj	\N	\N	1	C2	\N
5469	curtail	v	\N	\N	1	C2	\N
5470	daft	adj	\N	\N	1	C2	\N
5471	dalliance	n	\N	\N	1	C2	\N
5472	daunting	adj	\N	\N	1	C2	\N
5473	dawdle	v	\N	\N	1	C2	\N
5474	dearth	n	\N	\N	1	C2	\N
5475	debacle	n	\N	\N	1	C2	\N
5476	debilitate	v	\N	\N	1	C2	\N
5477	debonair	adj	\N	\N	1	C2	\N
5478	debunk	v	\N	\N	1	C2	\N
5479	decadence	n	\N	\N	1	C2	\N
5480	deceitful	adj	\N	\N	1	C2	\N
5481	decimate	v	\N	\N	1	C2	\N
5482	decorous	adj	\N	\N	1	C2	\N
5483	decorum	n	\N	\N	1	C2	\N
5484	decree	n	\N	\N	1	C2	\N
5485	decrepit	adj	\N	\N	1	C2	\N
5486	decry	v	\N	\N	1	C2	\N
5487	defamation	n	\N	\N	1	C2	\N
5488	deference	n	\N	\N	1	C2	\N
5489	deflate	v	\N	\N	1	C2	\N
5490	defunct	adj	\N	\N	1	C2	\N
5491	dehort	v	\N	\N	1	C2	\N
5492	deign	v	\N	\N	1	C2	\N
5493	deity	n	\N	\N	1	C2	\N
5494	deleterious	adj	\N	\N	1	C2	\N
5495	deliberation	n	\N	\N	1	C2	\N
5496	delineate	v	\N	\N	1	C2	\N
5497	delineation	n	\N	\N	1	C2	\N
5498	delirium	n	\N	\N	1	C2	\N
5499	deliverance	n	\N	\N	1	C2	\N
5500	deluge	n	\N	\N	1	C2	\N
5501	demagogue	n	\N	\N	1	C2	\N
5502	demarcation	n	\N	\N	1	C2	\N
5503	demean	v	\N	\N	1	C2	\N
5504	demeanour	n	\N	\N	1	C2	\N
5505	demise	n	\N	\N	1	C2	\N
5506	demur	v	\N	\N	1	C2	\N
5507	demure	adj	\N	\N	1	C2	\N
5508	denigrate	v	\N	\N	1	C2	\N
5509	denouement	n	\N	\N	1	C2	\N
5510	deplete	v	\N	\N	1	C2	\N
5511	deplorable	adj	\N	\N	1	C2	\N
5512	deplore	v	\N	\N	1	C2	\N
5513	depravity	n	\N	\N	1	C2	\N
5514	derelict	adj	\N	\N	1	C2	\N
5515	deride	v	\N	\N	1	C2	\N
5516	derisive	adj	\N	\N	1	C2	\N
5517	derogatory	adj	\N	\N	1	C2	\N
5518	desecrate	v	\N	\N	1	C2	\N
5519	desolation	n	\N	\N	1	C2	\N
5520	despondency	n	\N	\N	1	C2	\N
5521	despondent	adj	\N	\N	1	C2	\N
5522	destitute	adj	\N	\N	1	C2	\N
5523	desultory	adj	\N	\N	1	C2	\N
5524	detachment	n	\N	\N	1	C2	\N
5525	deter	v	\N	\N	1	C2	\N
5526	detestable	adj	\N	\N	1	C2	\N
5527	detriment	n	\N	\N	1	C2	\N
5528	detrimental	adj	\N	\N	1	C2	\N
5529	deviation	n	\N	\N	1	C2	\N
5530	devious	adj	\N	\N	1	C2	\N
5531	devoid	adj	\N	\N	1	C2	\N
5532	dexterity	n	\N	\N	1	C2	\N
5533	dexterous	adj	\N	\N	1	C2	\N
5534	dialectic	n	\N	\N	1	C2	\N
5535	diaphanous	adj	\N	\N	1	C2	\N
5536	diaspora	n	\N	\N	1	C2	\N
5537	diatribe	n	\N	\N	1	C2	\N
5538	dichotomy	n	\N	\N	1	C2	\N
5539	didactic	adj	\N	\N	1	C2	\N
5540	diffident	adj	\N	\N	1	C2	\N
5541	dilatory	adj	\N	\N	1	C2	\N
5542	diligence	n	\N	\N	1	C2	\N
5543	diligently	adv	\N	\N	1	C2	\N
5544	diminution	n	\N	\N	1	C2	\N
5545	dingy	adj	\N	\N	1	C2	\N
5546	dirge	n	\N	\N	1	C2	\N
5547	disaffection	n	\N	\N	1	C2	\N
5548	discern	v	\N	\N	1	C2	\N
5549	discernment	n	\N	\N	1	C2	\N
5550	disciple	n	\N	\N	1	C2	\N
5551	discord	n	\N	\N	1	C2	\N
5552	discordant	adj	\N	\N	1	C2	\N
5553	discrepancy	n	\N	\N	1	C2	\N
5554	disdain	n	\N	\N	1	C2	\N
5555	dishevelled	adj	\N	\N	1	C2	\N
5556	disillusionment	n	\N	\N	1	C2	\N
5557	disingenuous	adj	\N	\N	1	C2	\N
5558	disinterested	adj	\N	\N	1	C2	\N
5559	disjointed	adj	\N	\N	1	C2	\N
5560	dismay	n	\N	\N	1	C2	\N
5561	disparage	v	\N	\N	1	C2	\N
5562	disparate	adj	\N	\N	1	C2	\N
5563	disparity	n	\N	\N	1	C2	\N
5564	dispassionate	adj	\N	\N	1	C2	\N
5565	dispel	v	\N	\N	1	C2	\N
5566	dispensation	n	\N	\N	1	C2	\N
5567	dispense	v	\N	\N	1	C2	\N
5568	disposition	n	\N	\N	1	C2	\N
5569	disrepute	n	\N	\N	1	C2	\N
5570	disseminate	v	\N	\N	1	C2	\N
5571	dissension	n	\N	\N	1	C2	\N
5572	dissent	n	\N	\N	1	C2	\N
5573	dissertation	n	\N	\N	1	C2	\N
5574	dissident	n	\N	\N	1	C2	\N
5575	dissipate	v	\N	\N	1	C2	\N
5576	dissolution	n	\N	\N	1	C2	\N
5577	dissonance	n	\N	\N	1	C2	\N
5578	divination	n	\N	\N	1	C2	\N
5579	divulge	v	\N	\N	1	C2	\N
5580	dogged	adj	\N	\N	1	C2	\N
5581	dogma	n	\N	\N	1	C2	\N
5582	dogmatic	adj	\N	\N	1	C2	\N
5583	doldrums	n	\N	\N	1	C2	\N
5584	domicile	n	\N	\N	1	C2	\N
5585	dominion	n	\N	\N	1	C2	\N
5586	dormant	adj	\N	\N	1	C2	\N
5587	dossier	n	\N	\N	1	C2	\N
5588	dotage	n	\N	\N	1	C2	\N
5589	drudgery	n	\N	\N	1	C2	\N
5590	dubious	adj	\N	\N	1	C2	\N
5591	duplicity	n	\N	\N	1	C2	\N
5592	duress	n	\N	\N	1	C2	\N
5593	dwindle	v	\N	\N	1	C2	\N
5594	dynasty	n	\N	\N	1	C2	\N
5595	ebullience	n	\N	\N	1	C2	\N
5596	ebullient	adj	\N	\N	1	C2	\N
5597	eccentric	adj	\N	\N	1	C2	\N
5598	echelon	n	\N	\N	1	C2	\N
5599	eclectic	adj	\N	\N	1	C2	\N
5600	edict	n	\N	\N	1	C2	\N
5601	edification	n	\N	\N	1	C2	\N
5602	edifice	n	\N	\N	1	C2	\N
5603	efficacious	adj	\N	\N	1	C2	\N
5604	effigy	n	\N	\N	1	C2	\N
5605	effrontery	n	\N	\N	1	C2	\N
5606	effusion	n	\N	\N	1	C2	\N
5607	effusive	adj	\N	\N	1	C2	\N
5608	egregious	adj	\N	\N	1	C2	\N
5609	elated	adj	\N	\N	1	C2	\N
5610	elation	n	\N	\N	1	C2	\N
5611	elicit	v	\N	\N	1	C2	\N
5612	eloquent	adj	\N	\N	1	C2	\N
5613	elucidate	v	\N	\N	1	C2	\N
5614	elusive	adj	\N	\N	1	C2	\N
5615	emaciated	adj	\N	\N	1	C2	\N
5616	emanate	v	\N	\N	1	C2	\N
5617	emancipate	v	\N	\N	1	C2	\N
5618	emancipation	n	\N	\N	1	C2	\N
5619	embargo	n	\N	\N	1	C2	\N
5620	embellish	v	\N	\N	1	C2	\N
5621	embezzle	v	\N	\N	1	C2	\N
5622	emblem	n	\N	\N	1	C2	\N
5623	embroil	v	\N	\N	1	C2	\N
5624	emissary	n	\N	\N	1	C2	\N
5625	emulate	v	\N	\N	1	C2	\N
5626	enclave	n	\N	\N	1	C2	\N
5627	encroach	v	\N	\N	1	C2	\N
5628	endemic	adj	\N	\N	1	C2	\N
5629	endow	v	\N	\N	1	C2	\N
5630	enervate	v	\N	\N	1	C2	\N
5631	engender	v	\N	\N	1	C2	\N
5632	enigma	n	\N	\N	1	C2	\N
5633	enigmatic	adj	\N	\N	1	C2	\N
5634	enmity	n	\N	\N	1	C2	\N
5635	ennui	n	\N	\N	1	C2	\N
5636	enormity	n	\N	\N	1	C2	\N
5637	ensue	v	\N	\N	1	C2	\N
5638	entail	v	\N	\N	1	C2	\N
5639	enthrall	v	\N	\N	1	C2	\N
5640	enticing	adj	\N	\N	1	C2	\N
5641	entourage	n	\N	\N	1	C2	\N
5642	entreat	v	\N	\N	1	C2	\N
5643	entrenchment	n	\N	\N	1	C2	\N
5644	entropy	n	\N	\N	1	C2	\N
5645	enumerate	v	\N	\N	1	C2	\N
5646	envoy	n	\N	\N	1	C2	\N
5647	ephemeral	adj	\N	\N	1	C2	\N
5648	epicentre	n	\N	\N	1	C2	\N
5649	epicure	n	\N	\N	1	C2	\N
5650	epigram	n	\N	\N	1	C2	\N
5651	epilogue	n	\N	\N	1	C2	\N
5652	epiphany	n	\N	\N	1	C2	\N
5653	epitaph	n	\N	\N	1	C2	\N
5654	epitome	n	\N	\N	1	C2	\N
5655	epitomise	v	\N	\N	1	C2	\N
5656	epoch	n	\N	\N	1	C2	\N
5657	equanimity	n	\N	\N	1	C2	\N
5658	equilibrium	n	\N	\N	1	C2	\N
5659	equivocal	adj	\N	\N	1	C2	\N
5660	eradicate	v	\N	\N	1	C2	\N
5661	erotic	adj	\N	\N	1	C2	\N
5662	err	v	\N	\N	1	C2	\N
5663	erstwhile	adj	\N	\N	1	C2	\N
5664	erudite	adj	\N	\N	1	C2	\N
5665	erudition	n	\N	\N	1	C2	\N
5666	escapade	n	\N	\N	1	C2	\N
5667	escarpment	n	\N	\N	1	C2	\N
5668	eschew	v	\N	\N	1	C2	\N
5669	esoteric	adj	\N	\N	1	C2	\N
5670	espouse	v	\N	\N	1	C2	\N
5671	esteem	n	\N	\N	1	C2	\N
5672	ethereal	adj	\N	\N	1	C2	\N
5673	ethos	n	\N	\N	1	C2	\N
5674	etymology	n	\N	\N	1	C2	\N
5675	eulogy	n	\N	\N	1	C2	\N
5676	euphemism	n	\N	\N	1	C2	\N
5677	euphoria	n	\N	\N	1	C2	\N
5678	evanescent	adj	\N	\N	1	C2	\N
5679	exacerbate	v	\N	\N	1	C2	\N
5680	exacting	adj	\N	\N	1	C2	\N
5681	exalt	v	\N	\N	1	C2	\N
5682	exaltation	n	\N	\N	1	C2	\N
5683	exchequer	n	\N	\N	1	C2	\N
5684	excoriate	v	\N	\N	1	C2	\N
5685	excruciating	adj	\N	\N	1	C2	\N
5686	execrable	adj	\N	\N	1	C2	\N
5687	exemplify	v	\N	\N	1	C2	\N
5688	exhort	v	\N	\N	1	C2	\N
5689	exhortation	n	\N	\N	1	C2	\N
5690	exigency	n	\N	\N	1	C2	\N
5691	exigent	adj	\N	\N	1	C2	\N
5692	exodus	n	\N	\N	1	C2	\N
5693	exonerate	v	\N	\N	1	C2	\N
5694	exorbitant	adj	\N	\N	1	C2	\N
5695	expatriate	n	\N	\N	1	C2	\N
5696	expediency	n	\N	\N	1	C2	\N
5697	expedient	adj	\N	\N	1	C2	\N
5698	expedite	v	\N	\N	1	C2	\N
5699	exponent	n	\N	\N	1	C2	\N
5700	exposition	n	\N	\N	1	C2	\N
5701	expound	v	\N	\N	1	C2	\N
5702	expunge	v	\N	\N	1	C2	\N
5703	exquisite	adj	\N	\N	1	C2	\N
5704	extol	v	\N	\N	1	C2	\N
5705	extraneous	adj	\N	\N	1	C2	\N
5706	extricate	v	\N	\N	1	C2	\N
5707	exuberant	adj	\N	\N	1	C2	\N
5708	exude	v	\N	\N	1	C2	\N
5709	exultation	n	\N	\N	1	C2	\N
5710	fabricate	v	\N	\N	1	C2	\N
5711	fabrication	n	\N	\N	1	C2	\N
5712	facet	n	\N	\N	1	C2	\N
5713	facetious	adj	\N	\N	1	C2	\N
5714	facile	adj	\N	\N	1	C2	\N
5715	facsimile	n	\N	\N	1	C2	\N
5716	fallacious	adj	\N	\N	1	C2	\N
5717	fallacy	n	\N	\N	1	C2	\N
5718	fallibility	n	\N	\N	1	C2	\N
5719	famine	n	\N	\N	1	C2	\N
5720	fanaticism	n	\N	\N	1	C2	\N
5721	farce	n	\N	\N	1	C2	\N
5722	farcical	adj	\N	\N	1	C2	\N
5723	fastidious	adj	\N	\N	1	C2	\N
5724	fatalism	n	\N	\N	1	C2	\N
5725	fathom	v	\N	\N	1	C2	\N
5726	fatuous	adj	\N	\N	1	C2	\N
5727	fauna	n	\N	\N	1	C2	\N
5728	fawn over	phr v	\N	\N	1	C2	\N
5729	façade	n	\N	\N	1	C2	\N
5730	feckless	adj	\N	\N	1	C2	\N
5731	feign	v	\N	\N	1	C2	\N
5732	feisty	adj	\N	\N	1	C2	\N
5733	fermentation	n	\N	\N	1	C2	\N
5734	ferocious	adj	\N	\N	1	C2	\N
5735	ferret out	phr v	\N	\N	1	C2	\N
5736	fervent	adj	\N	\N	1	C2	\N
5737	fervid	adj	\N	\N	1	C2	\N
5738	fervour	n	\N	\N	1	C2	\N
5739	fetish	n	\N	\N	1	C2	\N
5740	feud	n	\N	\N	1	C2	\N
5741	fiasco	n	\N	\N	1	C2	\N
5742	fickle	adj	\N	\N	1	C2	\N
5743	fidelity	n	\N	\N	1	C2	\N
5744	figment	n	\N	\N	1	C2	\N
5745	figurehead	n	\N	\N	1	C2	\N
5746	filibuster	n	\N	\N	1	C2	\N
5747	finesse	n	\N	\N	1	C2	\N
5748	fissure	n	\N	\N	1	C2	\N
5749	flagrant	adj	\N	\N	1	C2	\N
5750	flaunt	v	\N	\N	1	C2	\N
5751	fleeting	adj	\N	\N	1	C2	\N
5752	flimsy	adj	\N	\N	1	C2	\N
5753	flora	n	\N	\N	1	C2	\N
5754	flotsam	n	\N	\N	1	C2	\N
5755	flout	v	\N	\N	1	C2	\N
5756	flux	n	\N	\N	1	C2	\N
5757	fodder	n	\N	\N	1	C2	\N
5758	foible	n	\N	\N	1	C2	\N
5759	folly	n	\N	\N	1	C2	\N
5760	foment	v	\N	\N	1	C2	\N
5761	foolhardiness	n	\N	\N	1	C2	\N
5763	forbearance	n	\N	\N	1	C2	\N
5764	forerunner	n	\N	\N	1	C2	\N
5765	forestall	v	\N	\N	1	C2	\N
5766	forfeiture	n	\N	\N	1	C2	\N
5767	forgo	v	\N	\N	1	C2	\N
5768	forlorn	adj	\N	\N	1	C2	\N
5769	formidable	adj	\N	\N	1	C2	\N
5770	forsake	v	\N	\N	1	C2	\N
5771	forte	n	\N	\N	1	C2	\N
5772	fortitude	n	\N	\N	1	C2	\N
5773	fortuitous	adj	\N	\N	1	C2	\N
5774	founder	v	\N	\N	1	C2	\N
5775	fractious	adj	\N	\N	1	C2	\N
5776	fraught	adj	\N	\N	1	C2	\N
5777	fray	n	\N	\N	1	C2	\N
5778	frenetic	adj	\N	\N	1	C2	\N
5779	frenzy	n	\N	\N	1	C2	\N
5780	freshman	n	\N	\N	1	C2	\N
5781	fretful	adj	\N	\N	1	C2	\N
5782	frivolous	adj	\N	\N	1	C2	\N
5783	frugal	adj	\N	\N	1	C2	\N
5784	fruition	n	\N	\N	1	C2	\N
5785	fulcrum	n	\N	\N	1	C2	\N
5786	fulsome	adj	\N	\N	1	C2	\N
5787	furor	n	\N	\N	1	C2	\N
5788	furtive	adj	\N	\N	1	C2	\N
5789	futile	adj	\N	\N	1	C2	\N
5790	futility	n	\N	\N	1	C2	\N
5791	gaffe	n	\N	\N	1	C2	\N
5792	galvanise	v	\N	\N	1	C2	\N
5793	gambit	n	\N	\N	1	C2	\N
5794	garish	adj	\N	\N	1	C2	\N
5795	garner	v	\N	\N	1	C2	\N
5796	garrison	n	\N	\N	1	C2	\N
5797	garrulous	adj	\N	\N	1	C2	\N
5798	gauche	adj	\N	\N	1	C2	\N
5799	gauntlet	n	\N	\N	1	C2	\N
5800	genealogy	n	\N	\N	1	C2	\N
5801	genesis	n	\N	\N	1	C2	\N
5802	genial	adj	\N	\N	1	C2	\N
5803	genuflect	v	\N	\N	1	C2	\N
5804	germane	adj	\N	\N	1	C2	\N
5805	gestation	n	\N	\N	1	C2	\N
5806	gingerly	adv	\N	\N	1	C2	\N
5807	gist	n	\N	\N	1	C2	\N
5808	glean	v	\N	\N	1	C2	\N
5809	glib	adj	\N	\N	1	C2	\N
5810	glossary	n	\N	\N	1	C2	\N
5811	gluttony	n	\N	\N	1	C2	\N
5812	grandeur	n	\N	\N	1	C2	\N
5813	gratification	n	\N	\N	1	C2	\N
5814	gratuitous	adj	\N	\N	1	C2	\N
5815	gravitas	n	\N	\N	1	C2	\N
5816	gregarious	adj	\N	\N	1	C2	\N
5817	grievance	n	\N	\N	1	C2	\N
5818	grovel	v	\N	\N	1	C2	\N
5819	gruelling	adj	\N	\N	1	C2	\N
5820	guile	n	\N	\N	1	C2	\N
5821	gullible	adj	\N	\N	1	C2	\N
5822	hackneyed	adj	\N	\N	1	C2	\N
5823	halcyon	n	\N	\N	1	C2	\N
5824	hallmark	n	\N	\N	1	C2	\N
5825	halo	n	\N	\N	1	C2	\N
5826	hamper	v	\N	\N	1	C2	\N
5827	haphazard	adj	\N	\N	1	C2	\N
5828	hapless	adj	\N	\N	1	C2	\N
5829	harangue	n	\N	\N	1	C2	\N
5830	harbinger	n	\N	\N	1	C2	\N
5831	harness	v	\N	\N	1	C2	\N
5832	hasten	v	\N	\N	1	C2	\N
5833	haughty	adj	\N	\N	1	C2	\N
5834	havoc	n	\N	\N	1	C2	\N
5835	hearsay	n	\N	\N	1	C2	\N
5836	hedonistic	adj	\N	\N	1	C2	\N
5837	heed	v	\N	\N	1	C2	\N
5838	hegemony	n	\N	\N	1	C2	\N
5839	heinous	adj	\N	\N	1	C2	\N
5840	heirloom	n	\N	\N	1	C2	\N
5841	henceforth	adv	\N	\N	1	C2	\N
5842	henchman	n	\N	\N	1	C2	\N
5843	herald	v	\N	\N	1	C2	\N
5844	herbivore	n	\N	\N	1	C2	\N
5845	heresy	n	\N	\N	1	C2	\N
5846	heretical	adj	\N	\N	1	C2	\N
5847	hiatus	n	\N	\N	1	C2	\N
5848	hindrance	n	\N	\N	1	C2	\N
5849	hinterland	n	\N	\N	1	C2	\N
5850	histrionic	adj	\N	\N	1	C2	\N
5851	hitherto	adv	\N	\N	1	C2	\N
5852	hoard	v	\N	\N	1	C2	\N
5853	holocaust	n	\N	\N	1	C2	\N
5854	homage	n	\N	\N	1	C2	\N
5855	homogeneous	adj	\N	\N	1	C2	\N
5856	hone	v	\N	\N	1	C2	\N
5857	horoscope	n	\N	\N	1	C2	\N
5858	hospice	n	\N	\N	1	C2	\N
5859	hubris	n	\N	\N	1	C2	\N
5860	hybrid	n	\N	\N	1	C2	\N
5861	hyperbole	n	\N	\N	1	C2	\N
5862	hypocrisy	n	\N	\N	1	C2	\N
5863	hypothetical	adj	\N	\N	1	C2	\N
5864	hysteria	n	\N	\N	1	C2	\N
5865	iconoclasm	n	\N	\N	1	C2	\N
5866	iconoclast	n	\N	\N	1	C2	\N
5867	ideologue	n	\N	\N	1	C2	\N
5868	idiosyncrasy	n	\N	\N	1	C2	\N
5869	idiosyncratic	adj	\N	\N	1	C2	\N
5870	idyllic	adj	\N	\N	1	C2	\N
5871	ignominious	adj	\N	\N	1	C2	\N
5872	ignominy	n	\N	\N	1	C2	\N
5873	ill-advised	adj	\N	\N	1	C2	\N
5874	illicit	adj	\N	\N	1	C2	\N
5875	imbue	v	\N	\N	1	C2	\N
5876	immaculate	adj	\N	\N	1	C2	\N
5877	immeasurably	adv	\N	\N	1	C2	\N
5878	immensity	n	\N	\N	1	C2	\N
5879	immortal	adj	\N	\N	1	C2	\N
5880	immutable	adj	\N	\N	1	C2	\N
5881	impair	v	\N	\N	1	C2	\N
5882	impartial	adj	\N	\N	1	C2	\N
5883	impasse	n	\N	\N	1	C2	\N
5884	impassive	adj	\N	\N	1	C2	\N
5885	impeachment	n	\N	\N	1	C2	\N
5886	impeccable	adj	\N	\N	1	C2	\N
5887	impede	v	\N	\N	1	C2	\N
5888	impediment	n	\N	\N	1	C2	\N
5889	imperative	adj	\N	\N	1	C2	\N
5890	imperceptibly	adv	\N	\N	1	C2	\N
5891	imperialism	n	\N	\N	1	C2	\N
5892	imperil	v	\N	\N	1	C2	\N
5893	imperious	adj	\N	\N	1	C2	\N
5894	impertinent	adj	\N	\N	1	C2	\N
5895	imperturbable	adj	\N	\N	1	C2	\N
5896	impervious	adj	\N	\N	1	C2	\N
5897	impetuous	adj	\N	\N	1	C2	\N
5898	impetus	n	\N	\N	1	C2	\N
5899	implacable	adj	\N	\N	1	C2	\N
5900	implausible	adj	\N	\N	1	C2	\N
5901	impracticable	adj	\N	\N	1	C2	\N
5902	impregnable	adj	\N	\N	1	C2	\N
5903	impromptu	adj	\N	\N	1	C2	\N
5904	impropriety	n	\N	\N	1	C2	\N
5905	impudence	n	\N	\N	1	C2	\N
5906	impugn	v	\N	\N	1	C2	\N
5907	impunity	n	\N	\N	1	C2	\N
5908	inadequacy	n	\N	\N	1	C2	\N
5909	inadvertent	adj	\N	\N	1	C2	\N
5910	inane	adj	\N	\N	1	C2	\N
5911	inaugurate	v	\N	\N	1	C2	\N
5912	incarnation	n	\N	\N	1	C2	\N
5913	incendiary	adj	\N	\N	1	C2	\N
5914	incense	v	\N	\N	1	C2	\N
5915	inception	n	\N	\N	1	C2	\N
5916	incessant	adj	\N	\N	1	C2	\N
5917	incisive	adj	\N	\N	1	C2	\N
5918	incite	v	\N	\N	1	C2	\N
5919	inclement	adj	\N	\N	1	C2	\N
5920	inclination	n	\N	\N	1	C2	\N
5921	inclusive	adj	\N	\N	1	C2	\N
5922	incomprehensible	adj	\N	\N	1	C2	\N
5923	inconceivable	adj	\N	\N	1	C2	\N
5924	incongruity	n	\N	\N	1	C2	\N
5925	incongruous	adj	\N	\N	1	C2	\N
5926	incontrovertible	adj	\N	\N	1	C2	\N
5927	incorrigible	adj	\N	\N	1	C2	\N
5928	incredulity	n	\N	\N	1	C2	\N
5929	incredulous	adj	\N	\N	1	C2	\N
5930	incumbency	n	\N	\N	1	C2	\N
5931	incumbent	n	\N	\N	1	C2	\N
5932	incursion	n	\N	\N	1	C2	\N
5933	indefatigable	adj	\N	\N	1	C2	\N
5934	indelible	adj	\N	\N	1	C2	\N
5935	indemnify	v	\N	\N	1	C2	\N
5936	indifference	n	\N	\N	1	C2	\N
5937	indifferent	adj	\N	\N	1	C2	\N
5938	indignant	adj	\N	\N	1	C2	\N
5939	indignation	n	\N	\N	1	C2	\N
5940	indiscretion	n	\N	\N	1	C2	\N
5941	indoctrination	n	\N	\N	1	C2	\N
5942	indolent	adj	\N	\N	1	C2	\N
5943	indomitable	adj	\N	\N	1	C2	\N
5944	inducement	n	\N	\N	1	C2	\N
5945	induction	n	\N	\N	1	C2	\N
5946	indulgent	adj	\N	\N	1	C2	\N
5947	industrious	adj	\N	\N	1	C2	\N
5948	ineffable	adj	\N	\N	1	C2	\N
5949	inept	adj	\N	\N	1	C2	\N
5950	ineptitude	n	\N	\N	1	C2	\N
5951	inequity	n	\N	\N	1	C2	\N
5952	inertia	n	\N	\N	1	C2	\N
5953	inexhaustible	adj	\N	\N	1	C2	\N
5954	inexorable	adj	\N	\N	1	C2	\N
5955	infallible	adj	\N	\N	1	C2	\N
5956	infamy	n	\N	\N	1	C2	\N
5957	infatuation	n	\N	\N	1	C2	\N
5958	inferno	n	\N	\N	1	C2	\N
5959	infirmary	n	\N	\N	1	C2	\N
5960	inflammatory	adj	\N	\N	1	C2	\N
5961	influx	n	\N	\N	1	C2	\N
5962	infraction	n	\N	\N	1	C2	\N
5963	ingenious	adj	\N	\N	1	C2	\N
5964	ingenuity	n	\N	\N	1	C2	\N
5965	ingenuous	adj	\N	\N	1	C2	\N
5966	ingrained	adj	\N	\N	1	C2	\N
5967	inhospitable	adj	\N	\N	1	C2	\N
5968	inhumanity	n	\N	\N	1	C2	\N
5969	inimical	adj	\N	\N	1	C2	\N
5970	iniquitous	adj	\N	\N	1	C2	\N
5971	injunction	n	\N	\N	1	C2	\N
5972	inkling	n	\N	\N	1	C2	\N
5973	innocuous	adj	\N	\N	1	C2	\N
5974	innuendo	n	\N	\N	1	C2	\N
5975	innumerable	adj	\N	\N	1	C2	\N
5976	inquisition	n	\N	\N	1	C2	\N
5977	insatiable	adj	\N	\N	1	C2	\N
5978	inscrutable	adj	\N	\N	1	C2	\N
5979	insidious	adj	\N	\N	1	C2	\N
5980	insipid	adj	\N	\N	1	C2	\N
5981	insolent	adj	\N	\N	1	C2	\N
5982	insoluble	adj	\N	\N	1	C2	\N
5983	insouciant	adj	\N	\N	1	C2	\N
5984	instigate	v	\N	\N	1	C2	\N
5985	insurgency	n	\N	\N	1	C2	\N
5986	insurmountable	adj	\N	\N	1	C2	\N
5987	insurrection	n	\N	\N	1	C2	\N
5988	intelligentsia	n	\N	\N	1	C2	\N
5989	inter alia	adv	\N	\N	1	C2	\N
5990	interlude	n	\N	\N	1	C2	\N
5991	intermittently	adv	\N	\N	1	C2	\N
5992	internecine	adj	\N	\N	1	C2	\N
5993	intimation	n	\N	\N	1	C2	\N
5994	intimidation	n	\N	\N	1	C2	\N
5995	intransigence	n	\N	\N	1	C2	\N
5996	intransigent	adj	\N	\N	1	C2	\N
5997	intrepid	adj	\N	\N	1	C2	\N
5998	intrinsic	adj	\N	\N	1	C2	\N
5999	introspection	n	\N	\N	1	C2	\N
6000	intrusive	adj	\N	\N	1	C2	\N
6001	intuition	n	\N	\N	1	C2	\N
6002	inundate	v	\N	\N	1	C2	\N
6003	invasive	adj	\N	\N	1	C2	\N
6004	invective	n	\N	\N	1	C2	\N
6005	inveterate	adj	\N	\N	1	C2	\N
6006	invidious	adj	\N	\N	1	C2	\N
6007	invocation	n	\N	\N	1	C2	\N
6008	iota	n	\N	\N	1	C2	\N
6009	irascible	adj	\N	\N	1	C2	\N
6010	ire	n	\N	\N	1	C2	\N
6011	irk	v	\N	\N	1	C2	\N
6012	irreproachable	adj	\N	\N	1	C2	\N
6013	irreverent	adj	\N	\N	1	C2	\N
6014	itinerant	adj	\N	\N	1	C2	\N
6015	itinerary	n	\N	\N	1	C2	\N
6016	jaded	adj	\N	\N	1	C2	\N
6017	jamboree	n	\N	\N	1	C2	\N
6018	jargon	n	\N	\N	1	C2	\N
6019	jaundiced	adj	\N	\N	1	C2	\N
6020	jaunt	n	\N	\N	1	C2	\N
6021	jeopardise	v	\N	\N	1	C2	\N
6022	jingoism	n	\N	\N	1	C2	\N
6023	jocular	adj	\N	\N	1	C2	\N
6024	jocularity	n	\N	\N	1	C2	\N
6025	journeyman	n	\N	\N	1	C2	\N
6026	joust	n	\N	\N	1	C2	\N
6027	jubilation	n	\N	\N	1	C2	\N
6028	jubilee	n	\N	\N	1	C2	\N
6029	judicious	adj	\N	\N	1	C2	\N
6030	juggernaut	n	\N	\N	1	C2	\N
6031	juncture	n	\N	\N	1	C2	\N
6032	jurisprudence	n	\N	\N	1	C2	\N
6033	jurist	n	\N	\N	1	C2	\N
6034	juxtapose	v	\N	\N	1	C2	\N
6035	juxtaposition	n	\N	\N	1	C2	\N
6036	kaleidoscope	n	\N	\N	1	C2	\N
6037	ken	n	\N	\N	1	C2	\N
6038	kernel	n	\N	\N	1	C2	\N
6039	keynote	n	\N	\N	1	C2	\N
6040	kindle	v	\N	\N	1	C2	\N
6041	kindred	n	\N	\N	1	C2	\N
6042	kinship	n	\N	\N	1	C2	\N
6043	knoll	n	\N	\N	1	C2	\N
6044	kudos	n	\N	\N	1	C2	\N
6045	labyrinth	n	\N	\N	1	C2	\N
6046	lackadaisical	adj	\N	\N	1	C2	\N
6047	lacklustre	adj	\N	\N	1	C2	\N
6048	laconic	adj	\N	\N	1	C2	\N
6049	laggard	n	\N	\N	1	C2	\N
6050	lambaste	v	\N	\N	1	C2	\N
6051	lament	v	\N	\N	1	C2	\N
6052	lamentable	adj	\N	\N	1	C2	\N
6053	lampoon	n	\N	\N	1	C2	\N
6054	languid	adj	\N	\N	1	C2	\N
6055	languish	v	\N	\N	1	C2	\N
6056	lapse	n	\N	\N	1	C2	\N
6057	larceny	n	\N	\N	1	C2	\N
6058	largesse	n	\N	\N	1	C2	\N
6059	latent	adj	\N	\N	1	C2	\N
6060	latitude	n	\N	\N	1	C2	\N
6061	laud	v	\N	\N	1	C2	\N
6062	laudable	adj	\N	\N	1	C2	\N
6063	laureate	n	\N	\N	1	C2	\N
6064	lectern	n	\N	\N	1	C2	\N
6065	leery of	adj	\N	\N	1	C2	\N
6066	leeway	n	\N	\N	1	C2	\N
6067	lenient	adj	\N	\N	1	C2	\N
6068	lethargic	adj	\N	\N	1	C2	\N
6069	lethargy	n	\N	\N	1	C2	\N
6070	level-headed	adj	\N	\N	1	C2	\N
6071	levity	n	\N	\N	1	C2	\N
6072	levy	v	\N	\N	1	C2	\N
6073	lexicon	n	\N	\N	1	C2	\N
6074	liaison	n	\N	\N	1	C2	\N
6075	licentious	adj	\N	\N	1	C2	\N
6076	limbo	n	\N	\N	1	C2	\N
6077	lineage	n	\N	\N	1	C2	\N
6078	linguist	n	\N	\N	1	C2	\N
6079	liquidate	v	\N	\N	1	C2	\N
6080	liquidation	n	\N	\N	1	C2	\N
6081	litany	n	\N	\N	1	C2	\N
6082	litigant	n	\N	\N	1	C2	\N
6083	litigious	adj	\N	\N	1	C2	\N
6084	liturgy	n	\N	\N	1	C2	\N
6085	loathe	v	\N	\N	1	C2	\N
6086	longevity	n	\N	\N	1	C2	\N
6087	loophole	n	\N	\N	1	C2	\N
6088	loquacious	adj	\N	\N	1	C2	\N
6089	lore	n	\N	\N	1	C2	\N
6090	lout	n	\N	\N	1	C2	\N
6091	lucid	adj	\N	\N	1	C2	\N
6092	ludicrous	adj	\N	\N	1	C2	\N
6093	lugubrious	adj	\N	\N	1	C2	\N
6094	lukewarm	adj	\N	\N	1	C2	\N
6095	luminary	n	\N	\N	1	C2	\N
6096	luminous	adj	\N	\N	1	C2	\N
6097	lustre	n	\N	\N	1	C2	\N
6098	luxuriant	adj	\N	\N	1	C2	\N
6099	machination	n	\N	\N	1	C2	\N
6100	machismo	n	\N	\N	1	C2	\N
6101	macrocosm	n	\N	\N	1	C2	\N
6102	madcap	adj	\N	\N	1	C2	\N
6103	maelstrom	n	\N	\N	1	C2	\N
6104	maestro	n	\N	\N	1	C2	\N
6105	magnanimous	adj	\N	\N	1	C2	\N
6106	magnate	n	\N	\N	1	C2	\N
6107	mainstay	n	\N	\N	1	C2	\N
6108	malady	n	\N	\N	1	C2	\N
6109	malaise	n	\N	\N	1	C2	\N
6110	malcontent	n	\N	\N	1	C2	\N
6111	malevolent	adj	\N	\N	1	C2	\N
6112	malfeasance	n	\N	\N	1	C2	\N
6113	malice	n	\N	\N	1	C2	\N
6114	malign	v	\N	\N	1	C2	\N
6115	malleable	adj	\N	\N	1	C2	\N
6116	malodorous	adj	\N	\N	1	C2	\N
6117	manifestation	n	\N	\N	1	C2	\N
6118	mannerism	n	\N	\N	1	C2	\N
6119	manor	n	\N	\N	1	C2	\N
6120	mantle	n	\N	\N	1	C2	\N
6121	marauder	n	\N	\N	1	C2	\N
6122	marquee	n	\N	\N	1	C2	\N
6123	martyrdom	n	\N	\N	1	C2	\N
6124	masochism	n	\N	\N	1	C2	\N
6125	masquerade	n	\N	\N	1	C2	\N
6126	materialism	n	\N	\N	1	C2	\N
6127	matriarch	n	\N	\N	1	C2	\N
6128	maudlin	adj	\N	\N	1	C2	\N
6129	maverick	n	\N	\N	1	C2	\N
6130	maxim	n	\N	\N	1	C2	\N
6131	mayhem	n	\N	\N	1	C2	\N
6132	meagre	adj	\N	\N	1	C2	\N
6133	mediator	n	\N	\N	1	C2	\N
6134	mediocrity	n	\N	\N	1	C2	\N
6135	megalomania	n	\N	\N	1	C2	\N
6136	melancholy	n	\N	\N	1	C2	\N
6137	melee	n	\N	\N	1	C2	\N
6138	memento	n	\N	\N	1	C2	\N
6139	memorabilia	n	\N	\N	1	C2	\N
6140	menacing	adj	\N	\N	1	C2	\N
6141	mendacious	adj	\N	\N	1	C2	\N
6142	mercenary	n	\N	\N	1	C2	\N
6143	meritocracy	n	\N	\N	1	C2	\N
6144	messiah	n	\N	\N	1	C2	\N
6145	metamorphosis	n	\N	\N	1	C2	\N
6146	methodology	n	\N	\N	1	C2	\N
6147	meticulous	adj	\N	\N	1	C2	\N
6148	mettle	n	\N	\N	1	C2	\N
6149	microcosm	n	\N	\N	1	C2	\N
6150	minion	n	\N	\N	1	C2	\N
6151	minutiae	n	\N	\N	1	C2	\N
6152	mirage	n	\N	\N	1	C2	\N
6153	mire	n	\N	\N	1	C2	\N
6154	misanthrope	n	\N	\N	1	C2	\N
6155	mischievous	adj	\N	\N	1	C2	\N
6156	misgiving	n	\N	\N	1	C2	\N
6157	mishap	n	\N	\N	1	C2	\N
6158	misnomer	n	\N	\N	1	C2	\N
6159	misogyny	n	\N	\N	1	C2	\N
6160	mitigate	v	\N	\N	1	C2	\N
6161	modicum	n	\N	\N	1	C2	\N
6162	mogul	n	\N	\N	1	C2	\N
6163	mollify	v	\N	\N	1	C2	\N
6164	moniker	n	\N	\N	1	C2	\N
6165	monolith	n	\N	\N	1	C2	\N
6166	monologue	n	\N	\N	1	C2	\N
6167	montage	n	\N	\N	1	C2	\N
6168	moratorium	n	\N	\N	1	C2	\N
6169	mordant	adj	\N	\N	1	C2	\N
6170	morgue	n	\N	\N	1	C2	\N
6171	moribund	adj	\N	\N	1	C2	\N
6172	morose	adj	\N	\N	1	C2	\N
6173	mortal	adj	\N	\N	1	C2	\N
6174	mortifying	adj	\N	\N	1	C2	\N
6175	mosaic	n	\N	\N	1	C2	\N
6176	muffle	v	\N	\N	1	C2	\N
6177	multitude	n	\N	\N	1	C2	\N
6178	mundane	adj	\N	\N	1	C2	\N
6179	munificent	adj	\N	\N	1	C2	\N
6180	munition	n	\N	\N	1	C2	\N
6181	mural	n	\N	\N	1	C2	\N
6182	mutable	adj	\N	\N	1	C2	\N
6183	myopic	adj	\N	\N	1	C2	\N
6184	myriad	n	\N	\N	1	C2	\N
6185	mystique	n	\N	\N	1	C2	\N
6186	nadir	n	\N	\N	1	C2	\N
6187	nag	v	\N	\N	1	C2	\N
6188	naivety	n	\N	\N	1	C2	\N
6189	namesake	n	\N	\N	1	C2	\N
6190	narcissism	n	\N	\N	1	C2	\N
6191	nascent	adj	\N	\N	1	C2	\N
6192	nebulous	adj	\N	\N	1	C2	\N
6193	nefarious	adj	\N	\N	1	C2	\N
6194	negligence	n	\N	\N	1	C2	\N
6195	nemesis	n	\N	\N	1	C2	\N
6196	neophyte	n	\N	\N	1	C2	\N
6197	nepotism	n	\N	\N	1	C2	\N
6198	nexus	n	\N	\N	1	C2	\N
6199	nihilism	n	\N	\N	1	C2	\N
6200	nirvana	n	\N	\N	1	C2	\N
6201	nomenclature	n	\N	\N	1	C2	\N
6202	nonchalance	n	\N	\N	1	C2	\N
6203	nonchalant	adj	\N	\N	1	C2	\N
6204	nonentity	n	\N	\N	1	C2	\N
6205	notoriety	n	\N	\N	1	C2	\N
6206	novice	n	\N	\N	1	C2	\N
6207	noxious	adj	\N	\N	1	C2	\N
6208	nuance	n	\N	\N	1	C2	\N
6209	oaf	n	\N	\N	1	C2	\N
6210	oasis	n	\N	\N	1	C2	\N
6211	obdurate	adj	\N	\N	1	C2	\N
6212	obfuscate	v	\N	\N	1	C2	\N
6213	obfuscation	n	\N	\N	1	C2	\N
6214	obituary	n	\N	\N	1	C2	\N
6215	obliterate	v	\N	\N	1	C2	\N
6216	oblivion	n	\N	\N	1	C2	\N
6217	obscenity	n	\N	\N	1	C2	\N
6218	obscure	adj	\N	\N	1	C2	\N
6219	obscurity	n	\N	\N	1	C2	\N
6220	obsequious	adj	\N	\N	1	C2	\N
6221	observance	n	\N	\N	1	C2	\N
6222	obsolescence	n	\N	\N	1	C2	\N
6223	obsolete	adj	\N	\N	1	C2	\N
6224	obstinate	adj	\N	\N	1	C2	\N
6225	obstreperous	adj	\N	\N	1	C2	\N
6226	obtuse	adj	\N	\N	1	C2	\N
6227	obviate	v	\N	\N	1	C2	\N
6228	ode	n	\N	\N	1	C2	\N
6229	odyssey	n	\N	\N	1	C2	\N
6230	officious	adj	\N	\N	1	C2	\N
6231	oligarchy	n	\N	\N	1	C2	\N
6232	omen	n	\N	\N	1	C2	\N
6233	ominous	adj	\N	\N	1	C2	\N
6234	omission	n	\N	\N	1	C2	\N
6235	omnipotence	n	\N	\N	1	C2	\N
6236	omniscience	n	\N	\N	1	C2	\N
6237	onerous	adj	\N	\N	1	C2	\N
6238	onset	n	\N	\N	1	C2	\N
6239	onslaught	n	\N	\N	1	C2	\N
6240	onus	n	\N	\N	1	C2	\N
6241	opacity	n	\N	\N	1	C2	\N
6242	opaque	adj	\N	\N	1	C2	\N
6243	opportunistic	adj	\N	\N	1	C2	\N
6244	opulence	n	\N	\N	1	C2	\N
6245	opulent	adj	\N	\N	1	C2	\N
6246	oracle	n	\N	\N	1	C2	\N
6247	orator	n	\N	\N	1	C2	\N
6248	oratory	n	\N	\N	1	C2	\N
6249	ordeal	n	\N	\N	1	C2	\N
6250	ordinance	n	\N	\N	1	C2	\N
6251	ornate	adj	\N	\N	1	C2	\N
6252	orthodoxy	n	\N	\N	1	C2	\N
6253	oscillation	n	\N	\N	1	C2	\N
6254	ostensible	adj	\N	\N	1	C2	\N
6255	ostentation	n	\N	\N	1	C2	\N
6256	ostentatious	adj	\N	\N	1	C2	\N
6257	ostracise	v	\N	\N	1	C2	\N
6258	ostracism	n	\N	\N	1	C2	\N
6259	oust	v	\N	\N	1	C2	\N
6260	outweigh	v	\N	\N	1	C2	\N
6261	ovation	n	\N	\N	1	C2	\N
6262	oversight	n	\N	\N	1	C2	\N
6263	overweening	adj	\N	\N	1	C2	\N
6264	oxymoron	n	\N	\N	1	C2	\N
6265	pacifism	n	\N	\N	1	C2	\N
6266	pacify	v	\N	\N	1	C2	\N
6267	pageant	n	\N	\N	1	C2	\N
6268	pageantry	n	\N	\N	1	C2	\N
6269	painstaking	adj	\N	\N	1	C2	\N
6270	palatable	adj	\N	\N	1	C2	\N
6271	palatial	adj	\N	\N	1	C2	\N
6272	pallbearer	n	\N	\N	1	C2	\N
6273	palliate	v	\N	\N	1	C2	\N
6274	pallid	adj	\N	\N	1	C2	\N
6275	pallor	n	\N	\N	1	C2	\N
6276	palpable	adj	\N	\N	1	C2	\N
6277	palpitation	n	\N	\N	1	C2	\N
6278	paltry	adj	\N	\N	1	C2	\N
6279	pamper	v	\N	\N	1	C2	\N
6280	panacea	n	\N	\N	1	C2	\N
6281	panache	n	\N	\N	1	C2	\N
6282	pandemonium	n	\N	\N	1	C2	\N
6283	pang	n	\N	\N	1	C2	\N
6284	panorama	n	\N	\N	1	C2	\N
6285	parable	n	\N	\N	1	C2	\N
6286	paradigm	n	\N	\N	1	C2	\N
6287	paradox	n	\N	\N	1	C2	\N
6288	paragon	n	\N	\N	1	C2	\N
6289	paramount	adj	\N	\N	1	C2	\N
6290	paraphernalia	n	\N	\N	1	C2	\N
6291	pariah	n	\N	\N	1	C2	\N
6292	parity	n	\N	\N	1	C2	\N
6293	parlance	n	\N	\N	1	C2	\N
6294	parochial	adj	\N	\N	1	C2	\N
6295	parody	n	\N	\N	1	C2	\N
6296	parsimonious	adj	\N	\N	1	C2	\N
6297	parsimony	n	\N	\N	1	C2	\N
6298	partisan	adj	\N	\N	1	C2	\N
6299	partisanship	n	\N	\N	1	C2	\N
6300	patently	adv	\N	\N	1	C2	\N
6301	pathos	n	\N	\N	1	C2	\N
6302	patriarch	n	\N	\N	1	C2	\N
6303	patronage	n	\N	\N	1	C2	\N
6304	paucity	n	\N	\N	1	C2	\N
6305	pavilion	n	\N	\N	1	C2	\N
6306	pedagogy	n	\N	\N	1	C2	\N
6307	pedant	n	\N	\N	1	C2	\N
6308	pedantic	adj	\N	\N	1	C2	\N
6309	pedantry	n	\N	\N	1	C2	\N
6310	pedestal	n	\N	\N	1	C2	\N
6311	pedigree	n	\N	\N	1	C2	\N
6312	peevish	adj	\N	\N	1	C2	\N
6313	pejorative	adj	\N	\N	1	C2	\N
6314	penchant	n	\N	\N	1	C2	\N
6315	pending	adj	\N	\N	1	C2	\N
6316	penitence	n	\N	\N	1	C2	\N
6317	penitent	adj	\N	\N	1	C2	\N
6318	pennant	n	\N	\N	1	C2	\N
6319	pensive	adj	\N	\N	1	C2	\N
6320	penury	n	\N	\N	1	C2	\N
6321	peremptory	adj	\N	\N	1	C2	\N
6322	perennial	adj	\N	\N	1	C2	\N
6323	perfidious	adj	\N	\N	1	C2	\N
6324	perfunctory	adj	\N	\N	1	C2	\N
6325	peril	n	\N	\N	1	C2	\N
6326	perilous	adj	\N	\N	1	C2	\N
6327	perimeter	n	\N	\N	1	C2	\N
6328	periphery	n	\N	\N	1	C2	\N
6329	perjurer	n	\N	\N	1	C2	\N
6330	perjury	n	\N	\N	1	C2	\N
6331	permanence	n	\N	\N	1	C2	\N
6332	permeate	v	\N	\N	1	C2	\N
6333	permutation	n	\N	\N	1	C2	\N
6334	pernicious	adj	\N	\N	1	C2	\N
6335	perpetrator	n	\N	\N	1	C2	\N
6336	perpetual	adj	\N	\N	1	C2	\N
6337	perpetuate	v	\N	\N	1	C2	\N
6338	perplexity	n	\N	\N	1	C2	\N
6339	persecute	v	\N	\N	1	C2	\N
6340	perseverance	n	\N	\N	1	C2	\N
6341	perspicacious	adj	\N	\N	1	C2	\N
6342	perturbed	adj	\N	\N	1	C2	\N
6343	peruse	v	\N	\N	1	C2	\N
6344	pervade	v	\N	\N	1	C2	\N
6345	pervasive	adj	\N	\N	1	C2	\N
6346	pervert	v	\N	\N	1	C2	\N
6347	pessimism	n	\N	\N	1	C2	\N
6348	petulant	adj	\N	\N	1	C2	\N
6349	philanthropic	adj	\N	\N	1	C2	\N
6350	philanthropist	n	\N	\N	1	C2	\N
6351	philistine	n	\N	\N	1	C2	\N
6352	phlegmatic	adj	\N	\N	1	C2	\N
6353	phoenix	n	\N	\N	1	C2	\N
6354	piety	n	\N	\N	1	C2	\N
6355	pillage	v	\N	\N	1	C2	\N
6356	pinnacle	n	\N	\N	1	C2	\N
6357	pioneering	adj	\N	\N	1	C2	\N
6358	pious	adj	\N	\N	1	C2	\N
6359	pique	n	\N	\N	1	C2	\N
6360	piracy	n	\N	\N	1	C2	\N
6361	pitfall	n	\N	\N	1	C2	\N
6362	pithy	adj	\N	\N	1	C2	\N
6363	pittance	n	\N	\N	1	C2	\N
6364	placate	v	\N	\N	1	C2	\N
6365	placebo	n	\N	\N	1	C2	\N
6366	placid	adj	\N	\N	1	C2	\N
6367	plagiarism	n	\N	\N	1	C2	\N
6368	plaintiff	n	\N	\N	1	C2	\N
6369	plasticity	n	\N	\N	1	C2	\N
6370	platitude	n	\N	\N	1	C2	\N
6371	playwright	n	\N	\N	1	C2	\N
6372	plebiscite	n	\N	\N	1	C2	\N
6373	plethora	n	\N	\N	1	C2	\N
6374	plight	n	\N	\N	1	C2	\N
6375	ploy	n	\N	\N	1	C2	\N
6376	plunder	v	\N	\N	1	C2	\N
6377	podium	n	\N	\N	1	C2	\N
6378	poignancy	n	\N	\N	1	C2	\N
6379	poignant	adj	\N	\N	1	C2	\N
6380	poise	n	\N	\N	1	C2	\N
6381	polemic	n	\N	\N	1	C2	\N
6382	polyglot	n	\N	\N	1	C2	\N
6383	pomp	n	\N	\N	1	C2	\N
6384	pompous	adj	\N	\N	1	C2	\N
6385	ponder	v	\N	\N	1	C2	\N
6386	ponderous	adj	\N	\N	1	C2	\N
6387	pontificate	v	\N	\N	1	C2	\N
6388	populace	n	\N	\N	1	C2	\N
6389	populism	n	\N	\N	1	C2	\N
6390	portend	v	\N	\N	1	C2	\N
6391	portent	n	\N	\N	1	C2	\N
6392	portentous	adj	\N	\N	1	C2	\N
6393	posterity	n	\N	\N	1	C2	\N
6394	posthumous	adj	\N	\N	1	C2	\N
6395	postmortem	n	\N	\N	1	C2	\N
6396	postulate	v	\N	\N	1	C2	\N
6397	pragmatism	n	\N	\N	1	C2	\N
6398	pragmatist	n	\N	\N	1	C2	\N
6399	preamble	n	\N	\N	1	C2	\N
6400	precarious	adj	\N	\N	1	C2	\N
6401	precedence	n	\N	\N	1	C2	\N
6402	precipice	n	\N	\N	1	C2	\N
6403	precipitate	v	\N	\N	1	C2	\N
6404	precipitous	adj	\N	\N	1	C2	\N
6405	preclude	v	\N	\N	1	C2	\N
6406	precocious	adj	\N	\N	1	C2	\N
6407	precursor	n	\N	\N	1	C2	\N
6408	predilection	n	\N	\N	1	C2	\N
6409	predominance	n	\N	\N	1	C2	\N
6410	preeminent	adj	\N	\N	1	C2	\N
6411	preempt	v	\N	\N	1	C2	\N
6412	prelude	n	\N	\N	1	C2	\N
6413	premonition	n	\N	\N	1	C2	\N
6414	preponderance	n	\N	\N	1	C2	\N
6415	preposterous	adj	\N	\N	1	C2	\N
6416	prerequisite	n	\N	\N	1	C2	\N
6417	prerogative	n	\N	\N	1	C2	\N
6418	presumption	n	\N	\N	1	C2	\N
6419	presumptuous	adj	\N	\N	1	C2	\N
6420	pretence	n	\N	\N	1	C2	\N
6421	pretender	n	\N	\N	1	C2	\N
6422	pretentious	adj	\N	\N	1	C2	\N
6423	pretext	n	\N	\N	1	C2	\N
6424	prevalent	adj	\N	\N	1	C2	\N
6425	prevaricate	v	\N	\N	1	C2	\N
6426	primacy	n	\N	\N	1	C2	\N
6427	primeval	adj	\N	\N	1	C2	\N
6428	pristine	adj	\N	\N	1	C2	\N
6429	privation	n	\N	\N	1	C2	\N
6430	probity	n	\N	\N	1	C2	\N
6431	proclamation	n	\N	\N	1	C2	\N
6432	proclivity	n	\N	\N	1	C2	\N
6433	procrastinate	v	\N	\N	1	C2	\N
6434	procure	v	\N	\N	1	C2	\N
6435	procurement	n	\N	\N	1	C2	\N
6436	prodigal	adj	\N	\N	1	C2	\N
6437	prodigious	adj	\N	\N	1	C2	\N
6438	prodigy	n	\N	\N	1	C2	\N
6439	profane	adj	\N	\N	1	C2	\N
6440	profanity	n	\N	\N	1	C2	\N
6441	profess	v	\N	\N	1	C2	\N
6442	proffer	v	\N	\N	1	C2	\N
6443	proficiency	n	\N	\N	1	C2	\N
6444	profligate	adj	\N	\N	1	C2	\N
6445	profusion	n	\N	\N	1	C2	\N
6446	progeny	n	\N	\N	1	C2	\N
6447	prognosis	n	\N	\N	1	C2	\N
6448	prohibitive	adj	\N	\N	1	C2	\N
6449	proliferation	n	\N	\N	1	C2	\N
6450	prolific	adj	\N	\N	1	C2	\N
6451	prologue	n	\N	\N	1	C2	\N
6452	promiscuity	n	\N	\N	1	C2	\N
6453	propagandist	n	\N	\N	1	C2	\N
6454	propensity	n	\N	\N	1	C2	\N
6455	prophecy	n	\N	\N	1	C2	\N
6456	propitious	adj	\N	\N	1	C2	\N
6457	proponent	n	\N	\N	1	C2	\N
6458	proprietor	n	\N	\N	1	C2	\N
6459	propriety	n	\N	\N	1	C2	\N
6460	prosaic	adj	\N	\N	1	C2	\N
6461	proscribe	v	\N	\N	1	C2	\N
6462	protagonist	n	\N	\N	1	C2	\N
6463	prototype	n	\N	\N	1	C2	\N
6464	protract	v	\N	\N	1	C2	\N
6465	protégé	n	\N	\N	1	C2	\N
6466	provenance	n	\N	\N	1	C2	\N
6467	proverb	n	\N	\N	1	C2	\N
6468	providence	n	\N	\N	1	C2	\N
6469	proviso	n	\N	\N	1	C2	\N
6470	prowess	n	\N	\N	1	C2	\N
6471	proximity	n	\N	\N	1	C2	\N
6472	proxy	n	\N	\N	1	C2	\N
6473	prudence	n	\N	\N	1	C2	\N
6474	prudent	adj	\N	\N	1	C2	\N
6475	pseudonym	n	\N	\N	1	C2	\N
6476	psyche	n	\N	\N	1	C2	\N
6477	puerile	adj	\N	\N	1	C2	\N
6478	pugnacious	adj	\N	\N	1	C2	\N
6479	pulpit	n	\N	\N	1	C2	\N
6480	punctilious	adj	\N	\N	1	C2	\N
6481	pundit	n	\N	\N	1	C2	\N
6482	pungency	n	\N	\N	1	C2	\N
6483	pungent	adj	\N	\N	1	C2	\N
6484	purge	n	\N	\N	1	C2	\N
6485	purist	n	\N	\N	1	C2	\N
6486	purport	v	\N	\N	1	C2	\N
6487	purveyor	n	\N	\N	1	C2	\N
6488	pusillanimous	adj	\N	\N	1	C2	\N
6489	quack	n	\N	\N	1	C2	\N
6490	quadrant	n	\N	\N	1	C2	\N
6491	quagmire	n	\N	\N	1	C2	\N
6492	quaint	adj	\N	\N	1	C2	\N
6493	qualm	n	\N	\N	1	C2	\N
6494	quandary	n	\N	\N	1	C2	\N
6495	quarantine	n	\N	\N	1	C2	\N
6496	quarry	n	\N	\N	1	C2	\N
6497	quartet	n	\N	\N	1	C2	\N
6498	quash	v	\N	\N	1	C2	\N
6499	quaver	n	\N	\N	1	C2	\N
6500	quell	v	\N	\N	1	C2	\N
6501	querulous	adj	\N	\N	1	C2	\N
6502	quibble	n	\N	\N	1	C2	\N
6503	quicksand	n	\N	\N	1	C2	\N
6504	quiescent	adj	\N	\N	1	C2	\N
6505	quintessence	n	\N	\N	1	C2	\N
6506	quintessential	adj	\N	\N	1	C2	\N
6507	quintet	n	\N	\N	1	C2	\N
6508	quip	n	\N	\N	1	C2	\N
6509	quiver	n	\N	\N	1	C2	\N
6510	quixotic	adj	\N	\N	1	C2	\N
6511	quorum	n	\N	\N	1	C2	\N
6512	rabble	n	\N	\N	1	C2	\N
6513	radiance	n	\N	\N	1	C2	\N
6514	radicalism	n	\N	\N	1	C2	\N
6515	rambunctious	adj	\N	\N	1	C2	\N
6516	ramification	n	\N	\N	1	C2	\N
6517	rancour	n	\N	\N	1	C2	\N
6518	ransom	n	\N	\N	1	C2	\N
6519	rapacious	adj	\N	\N	1	C2	\N
6520	rapacity	n	\N	\N	1	C2	\N
6521	rapport	n	\N	\N	1	C2	\N
6522	rapture	n	\N	\N	1	C2	\N
6523	rascal	n	\N	\N	1	C2	\N
6524	rashness	n	\N	\N	1	C2	\N
6525	ratification	n	\N	\N	1	C2	\N
6526	ratify	v	\N	\N	1	C2	\N
6527	rationale	n	\N	\N	1	C2	\N
6528	rationalism	n	\N	\N	1	C2	\N
6529	raucous	adj	\N	\N	1	C2	\N
6530	ravage	n	\N	\N	1	C2	\N
6531	ravine	n	\N	\N	1	C2	\N
6532	rebuff	v	\N	\N	1	C2	\N
6533	rebuke	v	\N	\N	1	C2	\N
6534	rebuttal	n	\N	\N	1	C2	\N
6535	recalcitrance	n	\N	\N	1	C2	\N
6536	recalcitrant	adj	\N	\N	1	C2	\N
6537	recant	v	\N	\N	1	C2	\N
6538	recidivism	n	\N	\N	1	C2	\N
6539	reciprocal	adj	\N	\N	1	C2	\N
6540	reciprocate	v	\N	\N	1	C2	\N
6541	reciprocity	n	\N	\N	1	C2	\N
6542	recklessness	n	\N	\N	1	C2	\N
6543	reclamation	n	\N	\N	1	C2	\N
6544	recluse	n	\N	\N	1	C2	\N
6545	reclusive	adj	\N	\N	1	C2	\N
6546	reconcile	v	\N	\N	1	C2	\N
6547	recondite	adj	\N	\N	1	C2	\N
6548	reconnaissance	n	\N	\N	1	C2	\N
6549	recourse	n	\N	\N	1	C2	\N
6550	recrimination	n	\N	\N	1	C2	\N
6551	rectification	n	\N	\N	1	C2	\N
6552	rectify	v	\N	\N	1	C2	\N
6553	rectitude	n	\N	\N	1	C2	\N
6554	redeem	v	\N	\N	1	C2	\N
6555	redemption	n	\N	\N	1	C2	\N
6556	redress	n	\N	\N	1	C2	\N
6557	refinery	n	\N	\N	1	C2	\N
6558	reformation	n	\N	\N	1	C2	\N
6559	refractory	adj	\N	\N	1	C2	\N
6560	refutation	n	\N	\N	1	C2	\N
6561	refute	v	\N	\N	1	C2	\N
6562	regent	n	\N	\N	1	C2	\N
6563	registrar	n	\N	\N	1	C2	\N
6564	regression	n	\N	\N	1	C2	\N
6565	reimbursement	n	\N	\N	1	C2	\N
6566	reincarnation	n	\N	\N	1	C2	\N
6567	reiteration	n	\N	\N	1	C2	\N
6568	relegate	v	\N	\N	1	C2	\N
6569	relegation	n	\N	\N	1	C2	\N
6570	relic	n	\N	\N	1	C2	\N
6571	relinquish	v	\N	\N	1	C2	\N
6572	relish	v	\N	\N	1	C2	\N
6573	reluctance	n	\N	\N	1	C2	\N
6574	remembrance	n	\N	\N	1	C2	\N
6575	reminiscent	adj	\N	\N	1	C2	\N
6576	remiss	adj	\N	\N	1	C2	\N
6577	remission	n	\N	\N	1	C2	\N
6578	remit	v	\N	\N	1	C2	\N
6579	remnant	n	\N	\N	1	C2	\N
6580	remorse	n	\N	\N	1	C2	\N
6581	remuneration	n	\N	\N	1	C2	\N
6582	renaissance	n	\N	\N	1	C2	\N
6583	rendition	n	\N	\N	1	C2	\N
6584	renegade	n	\N	\N	1	C2	\N
6585	renege	v	\N	\N	1	C2	\N
6586	renounce	v	\N	\N	1	C2	\N
6587	renown	n	\N	\N	1	C2	\N
6588	reparation	n	\N	\N	1	C2	\N
6589	repatriation	n	\N	\N	1	C2	\N
6590	repeal	v	\N	\N	1	C2	\N
6591	repentance	n	\N	\N	1	C2	\N
6592	repercussion	n	\N	\N	1	C2	\N
6593	repertoire	n	\N	\N	1	C2	\N
6594	replenish	v	\N	\N	1	C2	\N
6595	replete	adj	\N	\N	1	C2	\N
6596	repository	n	\N	\N	1	C2	\N
6597	reprehensible	adj	\N	\N	1	C2	\N
6598	repression	n	\N	\N	1	C2	\N
6599	reprieve	n	\N	\N	1	C2	\N
6600	reprimand	n	\N	\N	1	C2	\N
6601	reprisal	n	\N	\N	1	C2	\N
6602	reproach	v	\N	\N	1	C2	\N
6603	repudiate	v	\N	\N	1	C2	\N
6604	repudiation	n	\N	\N	1	C2	\N
6605	repugnance	n	\N	\N	1	C2	\N
6606	repugnant	adj	\N	\N	1	C2	\N
6607	repute	n	\N	\N	1	C2	\N
6608	requisite	n	\N	\N	1	C2	\N
6609	requisition	n	\N	\N	1	C2	\N
6610	rescind	v	\N	\N	1	C2	\N
6611	residual	adj	\N	\N	1	C2	\N
6612	resilience	n	\N	\N	1	C2	\N
6613	resilient	adj	\N	\N	1	C2	\N
6614	resolute	adj	\N	\N	1	C2	\N
6615	resolutely	adv	\N	\N	1	C2	\N
6616	resonance	n	\N	\N	1	C2	\N
6617	respite	n	\N	\N	1	C2	\N
6618	resplendent	adj	\N	\N	1	C2	\N
6619	restitution	n	\N	\N	1	C2	\N
6620	restive	adj	\N	\N	1	C2	\N
6621	resurgence	n	\N	\N	1	C2	\N
6622	resurrection	n	\N	\N	1	C2	\N
6623	retaliate	v	\N	\N	1	C2	\N
6624	reticence	n	\N	\N	1	C2	\N
6625	reticent	adj	\N	\N	1	C2	\N
6626	retort	n	\N	\N	1	C2	\N
6627	retract	v	\N	\N	1	C2	\N
6628	retraction	n	\N	\N	1	C2	\N
6629	retribution	n	\N	\N	1	C2	\N
6630	retrospection	n	\N	\N	1	C2	\N
6631	revelry	n	\N	\N	1	C2	\N
6632	reverberation	n	\N	\N	1	C2	\N
6633	revere	v	\N	\N	1	C2	\N
6634	reverent	adj	\N	\N	1	C2	\N
6635	reverential	adj	\N	\N	1	C2	\N
6636	reverie	n	\N	\N	1	C2	\N
6637	revisionism	n	\N	\N	1	C2	\N
6638	revocation	n	\N	\N	1	C2	\N
6639	revoke	v	\N	\N	1	C2	\N
6640	rift	n	\N	\N	1	C2	\N
6641	righteousness	n	\N	\N	1	C2	\N
6642	rigmarole	n	\N	\N	1	C2	\N
6643	rigorous	adj	\N	\N	1	C2	\N
6644	rigour	n	\N	\N	1	C2	\N
6645	ringleader	n	\N	\N	1	C2	\N
6646	rite	n	\N	\N	1	C2	\N
6647	rogue	n	\N	\N	1	C2	\N
6648	rostrum	n	\N	\N	1	C2	\N
6649	rout	n	\N	\N	1	C2	\N
6650	rubric	n	\N	\N	1	C2	\N
6651	ruckus	n	\N	\N	1	C2	\N
6652	rudiment	n	\N	\N	1	C2	\N
6653	ruination	n	\N	\N	1	C2	\N
6654	ruminate	v	\N	\N	1	C2	\N
6655	rumination	n	\N	\N	1	C2	\N
6656	rupture	v	\N	\N	1	C2	\N
6657	ruse	n	\N	\N	1	C2	\N
6658	sabotage	n	\N	\N	1	C2	\N
6659	saboteur	n	\N	\N	1	C2	\N
6660	sacrilege	n	\N	\N	1	C2	\N
6661	sacrosanct	adj	\N	\N	1	C2	\N
6662	safeguard	v	\N	\N	1	C2	\N
6663	saga	n	\N	\N	1	C2	\N
6664	sagacious	adj	\N	\N	1	C2	\N
6665	sage	n	\N	\N	1	C2	\N
6666	sainthood	n	\N	\N	1	C2	\N
6667	salacious	adj	\N	\N	1	C2	\N
6668	salient	adj	\N	\N	1	C2	\N
6669	salubrious	adj	\N	\N	1	C2	\N
6670	salutation	n	\N	\N	1	C2	\N
6671	salvation	n	\N	\N	1	C2	\N
6672	sanctimonious	adj	\N	\N	1	C2	\N
6673	sanctity	n	\N	\N	1	C2	\N
6674	sanctuary	n	\N	\N	1	C2	\N
6675	sanguine	adj	\N	\N	1	C2	\N
6676	sarcasm	n	\N	\N	1	C2	\N
6677	sardonic	adj	\N	\N	1	C2	\N
6678	satiate	v	\N	\N	1	C2	\N
6679	satire	n	\N	\N	1	C2	\N
6680	satirist	n	\N	\N	1	C2	\N
6681	savagery	n	\N	\N	1	C2	\N
6682	savant	n	\N	\N	1	C2	\N
6683	scaffold	n	\N	\N	1	C2	\N
6684	scapegoat	n	\N	\N	1	C2	\N
6685	scarcity	n	\N	\N	1	C2	\N
6686	scathing	adj	\N	\N	1	C2	\N
6687	schism	n	\N	\N	1	C2	\N
6688	scion	n	\N	\N	1	C2	\N
6689	scorn	v	\N	\N	1	C2	\N
6690	scoundrel	n	\N	\N	1	C2	\N
6691	scourge	n	\N	\N	1	C2	\N
6692	scruple	n	\N	\N	1	C2	\N
6693	scrupulous	adj	\N	\N	1	C2	\N
6694	scrutinise	v	\N	\N	1	C2	\N
6695	scurrilous	adj	\N	\N	1	C2	\N
6696	secession	n	\N	\N	1	C2	\N
6697	seclusion	n	\N	\N	1	C2	\N
6698	secretariat	n	\N	\N	1	C2	\N
6699	sedentary	adj	\N	\N	1	C2	\N
6700	sediment	n	\N	\N	1	C2	\N
6701	seditious	adj	\N	\N	1	C2	\N
6702	sedulous	adj	\N	\N	1	C2	\N
6703	seer	n	\N	\N	1	C2	\N
6704	segregation	n	\N	\N	1	C2	\N
6705	seizure	n	\N	\N	1	C2	\N
6706	semantics	n	\N	\N	1	C2	\N
6707	semblance	n	\N	\N	1	C2	\N
6708	seminal	adj	\N	\N	1	C2	\N
6709	senility	n	\N	\N	1	C2	\N
6710	sequel	n	\N	\N	1	C2	\N
6711	sequestration	n	\N	\N	1	C2	\N
6712	serendipitous	adj	\N	\N	1	C2	\N
6713	serenity	n	\N	\N	1	C2	\N
6714	serfdom	n	\N	\N	1	C2	\N
6715	servile	adj	\N	\N	1	C2	\N
6716	servility	n	\N	\N	1	C2	\N
6717	servitude	n	\N	\N	1	C2	\N
6718	severance	n	\N	\N	1	C2	\N
6719	severity	n	\N	\N	1	C2	\N
6720	shackle	n	\N	\N	1	C2	\N
6721	shambles	n	\N	\N	1	C2	\N
6722	shard	n	\N	\N	1	C2	\N
6723	sheen	n	\N	\N	1	C2	\N
6724	shirk	v	\N	\N	1	C2	\N
6725	shoddy	adj	\N	\N	1	C2	\N
6726	shrewdness	n	\N	\N	1	C2	\N
6727	shrine	n	\N	\N	1	C2	\N
6728	shroud	n	\N	\N	1	C2	\N
6729	shrouded	adj	\N	\N	1	C2	\N
6732	silhouette	n	\N	\N	1	C2	\N
6733	simile	n	\N	\N	1	C2	\N
6734	simpleton	n	\N	\N	1	C2	\N
6735	sinecure	n	\N	\N	1	C2	\N
6736	singular	adj	\N	\N	1	C2	\N
6737	singularity	n	\N	\N	1	C2	\N
6738	siren	n	\N	\N	1	C2	\N
6739	skirmish	n	\N	\N	1	C2	\N
6740	skullduggery	n	\N	\N	1	C2	\N
6741	slander	n	\N	\N	1	C2	\N
6742	sloth	n	\N	\N	1	C2	\N
6743	slumber	n	\N	\N	1	C2	\N
6744	smattering	n	\N	\N	1	C2	\N
6745	snare	n	\N	\N	1	C2	\N
6746	snooty	adj	\N	\N	1	C2	\N
6747	snub	n	\N	\N	1	C2	\N
6748	sobriety	n	\N	\N	1	C2	\N
6749	sojourn	n	\N	\N	1	C2	\N
6750	solace	n	\N	\N	1	C2	\N
6751	solemn	adj	\N	\N	1	C2	\N
6752	solemnity	n	\N	\N	1	C2	\N
6753	solicitor	n	\N	\N	1	C2	\N
6754	solicitous	adj	\N	\N	1	C2	\N
6755	soliloquy	n	\N	\N	1	C2	\N
6756	solitary	adj	\N	\N	1	C2	\N
6757	solitude	n	\N	\N	1	C2	\N
6758	solstice	n	\N	\N	1	C2	\N
6759	sombre	adj	\N	\N	1	C2	\N
6760	sophistry	n	\N	\N	1	C2	\N
6761	sophomore	n	\N	\N	1	C2	\N
6762	sordid	adj	\N	\N	1	C2	\N
6763	sovereign	n	\N	\N	1	C2	\N
6764	sow	v	\N	\N	1	C2	\N
6765	spasm	n	\N	\N	1	C2	\N
6766	spate	n	\N	\N	1	C2	\N
6767	spawn	v	\N	\N	1	C2	\N
6768	specious	adj	\N	\N	1	C2	\N
6769	spectre	n	\N	\N	1	C2	\N
6770	speculator	n	\N	\N	1	C2	\N
6771	spinster	n	\N	\N	1	C2	\N
6772	splendour	n	\N	\N	1	C2	\N
6773	spontaneity	n	\N	\N	1	C2	\N
6774	sprawl	n	\N	\N	1	C2	\N
6775	spur	n	\N	\N	1	C2	\N
6776	spurious	adj	\N	\N	1	C2	\N
6777	spurn	v	\N	\N	1	C2	\N
6778	squadron	n	\N	\N	1	C2	\N
6779	squalid	adj	\N	\N	1	C2	\N
6780	squalor	n	\N	\N	1	C2	\N
6781	squander	v	\N	\N	1	C2	\N
6782	stagnant	adj	\N	\N	1	C2	\N
6783	staid	adj	\N	\N	1	C2	\N
6784	stalemate	n	\N	\N	1	C2	\N
6785	stalwart	n	\N	\N	1	C2	\N
6786	stamina	n	\N	\N	1	C2	\N
6787	stampede	n	\N	\N	1	C2	\N
6788	standoff	n	\N	\N	1	C2	\N
6789	standstill	n	\N	\N	1	C2	\N
6790	stanza	n	\N	\N	1	C2	\N
6791	stasis	n	\N	\N	1	C2	\N
6792	stately	adj	\N	\N	1	C2	\N
6793	statesmanship	n	\N	\N	1	C2	\N
6794	statute	n	\N	\N	1	C2	\N
6795	staunch	adj	\N	\N	1	C2	\N
6796	steadfastness	n	\N	\N	1	C2	\N
6797	stealth	n	\N	\N	1	C2	\N
6798	stench	n	\N	\N	1	C2	\N
6799	steward	n	\N	\N	1	C2	\N
6800	stewardship	n	\N	\N	1	C2	\N
6801	stickler	n	\N	\N	1	C2	\N
6802	stifle	v	\N	\N	1	C2	\N
6803	stigma	n	\N	\N	1	C2	\N
6804	stint	n	\N	\N	1	C2	\N
6805	stipulate	v	\N	\N	1	C2	\N
6806	stoic	adj	\N	\N	1	C2	\N
6807	stoicism	n	\N	\N	1	C2	\N
6808	stolid	adj	\N	\N	1	C2	\N
6809	stopgap	n	\N	\N	1	C2	\N
6810	stowaway	n	\N	\N	1	C2	\N
6811	stratagem	n	\N	\N	1	C2	\N
6812	strategist	n	\N	\N	1	C2	\N
6813	stratification	n	\N	\N	1	C2	\N
6814	stratum	n	\N	\N	1	C2	\N
6815	stricture	n	\N	\N	1	C2	\N
6816	strident	adj	\N	\N	1	C2	\N
6817	strife	n	\N	\N	1	C2	\N
6818	stringency	n	\N	\N	1	C2	\N
6819	stringent	adj	\N	\N	1	C2	\N
6820	stronghold	n	\N	\N	1	C2	\N
6821	stupor	n	\N	\N	1	C2	\N
6822	subconscious	n	\N	\N	1	C2	\N
6823	subdue	v	\N	\N	1	C2	\N
6824	subjugate	v	\N	\N	1	C2	\N
6825	sublime	adj	\N	\N	1	C2	\N
6826	subordinate	adj	\N	\N	1	C2	\N
6827	subordination	n	\N	\N	1	C2	\N
6828	subpoena	n	\N	\N	1	C2	\N
6829	subservience	n	\N	\N	1	C2	\N
6830	subsistence	n	\N	\N	1	C2	\N
6831	substantiate	v	\N	\N	1	C2	\N
6832	substantiation	n	\N	\N	1	C2	\N
6833	subterfuge	n	\N	\N	1	C2	\N
6834	subtlety	n	\N	\N	1	C2	\N
6835	subversion	n	\N	\N	1	C2	\N
6836	subversive	adj	\N	\N	1	C2	\N
6837	subvert	v	\N	\N	1	C2	\N
6838	succinct	adj	\N	\N	1	C2	\N
6839	succumb	v	\N	\N	1	C2	\N
6840	sufficiency	n	\N	\N	1	C2	\N
6841	suffrage	n	\N	\N	1	C2	\N
6842	suffragette	n	\N	\N	1	C2	\N
6843	sullen	adj	\N	\N	1	C2	\N
6844	summation	n	\N	\N	1	C2	\N
6845	summons	n	\N	\N	1	C2	\N
6846	sumptuous	adj	\N	\N	1	C2	\N
6847	superficial	adj	\N	\N	1	C2	\N
6848	superfluous	adj	\N	\N	1	C2	\N
6849	supersede	v	\N	\N	1	C2	\N
6850	superstition	n	\N	\N	1	C2	\N
6851	supine	adj	\N	\N	1	C2	\N
6852	supplant	v	\N	\N	1	C2	\N
6853	supple	adj	\N	\N	1	C2	\N
6854	supremacist	n	\N	\N	1	C2	\N
6855	supremacy	n	\N	\N	1	C2	\N
6856	surfeit	n	\N	\N	1	C2	\N
6857	surmise	v	\N	\N	1	C2	\N
6858	surmount	v	\N	\N	1	C2	\N
6859	surpass	v	\N	\N	1	C2	\N
6860	surreptitious	adj	\N	\N	1	C2	\N
6861	surrogate	n	\N	\N	1	C2	\N
6862	susceptibility	n	\N	\N	1	C2	\N
6863	susceptible	adj	\N	\N	1	C2	\N
6864	sustenance	n	\N	\N	1	C2	\N
6865	swathe	n	\N	\N	1	C2	\N
6866	swindle	n	\N	\N	1	C2	\N
6867	sycophancy	n	\N	\N	1	C2	\N
6868	sycophant	n	\N	\N	1	C2	\N
6869	sycophantic	adj	\N	\N	1	C2	\N
6870	syllabus	n	\N	\N	1	C2	\N
6871	symbiosis	n	\N	\N	1	C2	\N
6872	symbolism	n	\N	\N	1	C2	\N
6873	symposium	n	\N	\N	1	C2	\N
6874	syndicate	n	\N	\N	1	C2	\N
6875	synergy	n	\N	\N	1	C2	\N
6876	synopsis	n	\N	\N	1	C2	\N
6877	tableau	n	\N	\N	1	C2	\N
6878	tabloid	n	\N	\N	1	C2	\N
6879	taboo	n	\N	\N	1	C2	\N
6880	tacit	adj	\N	\N	1	C2	\N
6881	taciturn	adj	\N	\N	1	C2	\N
6882	tact	n	\N	\N	1	C2	\N
6883	tactician	n	\N	\N	1	C2	\N
6884	taint	n	\N	\N	1	C2	\N
6885	talisman	n	\N	\N	1	C2	\N
6886	tangential	adj	\N	\N	1	C2	\N
6887	tangible	adj	\N	\N	1	C2	\N
6888	tantamount	adj	\N	\N	1	C2	\N
6889	tantrum	n	\N	\N	1	C2	\N
6890	tariff	n	\N	\N	1	C2	\N
6891	tarnish	v	\N	\N	1	C2	\N
6892	taskmaster	n	\N	\N	1	C2	\N
6893	tawdry	adj	\N	\N	1	C2	\N
6894	tedious	adj	\N	\N	1	C2	\N
6895	tedium	n	\N	\N	1	C2	\N
6896	telepathy	n	\N	\N	1	C2	\N
6897	temerity	n	\N	\N	1	C2	\N
6898	temperament	n	\N	\N	1	C2	\N
6899	temperance	n	\N	\N	1	C2	\N
6900	tempestuous	adj	\N	\N	1	C2	\N
6901	tempo	n	\N	\N	1	C2	\N
6902	temporal	adj	\N	\N	1	C2	\N
6903	tenacious	adj	\N	\N	1	C2	\N
6904	tenacity	n	\N	\N	1	C2	\N
6905	tenet	n	\N	\N	1	C2	\N
6906	tenor	n	\N	\N	1	C2	\N
6907	tentative	adj	\N	\N	1	C2	\N
6908	tenuous	adj	\N	\N	1	C2	\N
6909	termination	n	\N	\N	1	C2	\N
6910	terminology	n	\N	\N	1	C2	\N
6911	terminus	n	\N	\N	1	C2	\N
6912	terse	adj	\N	\N	1	C2	\N
6913	testament	n	\N	\N	1	C2	\N
6914	testimonial	n	\N	\N	1	C2	\N
6915	tether	n	\N	\N	1	C2	\N
6916	theatricality	n	\N	\N	1	C2	\N
6917	theologian	n	\N	\N	1	C2	\N
6918	theorem	n	\N	\N	1	C2	\N
6919	thesaurus	n	\N	\N	1	C2	\N
6920	thicket	n	\N	\N	1	C2	\N
6921	th thoroughfare	n	\N	\N	1	C2	\N
6922	thrall	n	\N	\N	1	C2	\N
6923	thrift	n	\N	\N	1	C2	\N
6924	throwback	n	\N	\N	1	C2	\N
6925	thwart	v	\N	\N	1	C2	\N
6926	timbre	n	\N	\N	1	C2	\N
6927	timidity	n	\N	\N	1	C2	\N
6928	timorous	adj	\N	\N	1	C2	\N
6929	tipster	n	\N	\N	1	C2	\N
6930	tirade	n	\N	\N	1	C2	\N
6931	titan	n	\N	\N	1	C2	\N
6932	tithe	n	\N	\N	1	C2	\N
6933	token	n	\N	\N	1	C2	\N
6934	tokenism	n	\N	\N	1	C2	\N
6935	tombstone	n	\N	\N	1	C2	\N
6936	tome	n	\N	\N	1	C2	\N
6937	tonnage	n	\N	\N	1	C2	\N
6938	topography	n	\N	\N	1	C2	\N
6939	torment	n	\N	\N	1	C2	\N
6940	tornado	n	\N	\N	1	C2	\N
6941	torpid	adj	\N	\N	1	C2	\N
6942	torpor	n	\N	\N	1	C2	\N
6943	torque	n	\N	\N	1	C2	\N
6944	torrent	n	\N	\N	1	C2	\N
6945	torrid	adj	\N	\N	1	C2	\N
6946	tortuous	adj	\N	\N	1	C2	\N
6947	totalitarian	adj	\N	\N	1	C2	\N
6948	touchstone	n	\N	\N	1	C2	\N
6949	tourniquet	n	\N	\N	1	C2	\N
6950	toxicity	n	\N	\N	1	C2	\N
6951	tract	n	\N	\N	1	C2	\N
6952	tractable	adj	\N	\N	1	C2	\N
6953	tradesman	n	\N	\N	1	C2	\N
6954	traditionalism	n	\N	\N	1	C2	\N
6955	trafficker	n	\N	\N	1	C2	\N
6956	trailblazer	n	\N	\N	1	C2	\N
6957	trajectory	n	\N	\N	1	C2	\N
6958	trance	n	\N	\N	1	C2	\N
6959	tranquil	adj	\N	\N	1	C2	\N
6960	tranquillity	n	\N	\N	1	C2	\N
6961	transcend	v	\N	\N	1	C2	\N
6962	transcendence	n	\N	\N	1	C2	\N
6963	transcribe	v	\N	\N	1	C2	\N
6964	transgress	v	\N	\N	1	C2	\N
6965	transgression	n	\N	\N	1	C2	\N
6966	transient	adj	\N	\N	1	C2	\N
6967	translucent	adj	\N	\N	1	C2	\N
6968	travesty	n	\N	\N	1	C2	\N
6969	treacherous	adj	\N	\N	1	C2	\N
6970	treachery	n	\N	\N	1	C2	\N
6971	treason	n	\N	\N	1	C2	\N
6972	treatise	n	\N	\N	1	C2	\N
6973	tremor	n	\N	\N	1	C2	\N
6974	trenchant	adj	\N	\N	1	C2	\N
6975	trepidation	n	\N	\N	1	C2	\N
6976	tribalism	n	\N	\N	1	C2	\N
6977	tribulation	n	\N	\N	1	C2	\N
6978	tribunal	n	\N	\N	1	C2	\N
6979	tribune	n	\N	\N	1	C2	\N
6980	tributary	n	\N	\N	1	C2	\N
6981	trickery	n	\N	\N	1	C2	\N
6982	trickster	n	\N	\N	1	C2	\N
6983	trifle	n	\N	\N	1	C2	\N
6984	trilogy	n	\N	\N	1	C2	\N
6985	trinket	n	\N	\N	1	C2	\N
6986	trite	adj	\N	\N	1	C2	\N
6987	troupe	n	\N	\N	1	C2	\N
6988	truculent	adj	\N	\N	1	C2	\N
6989	trudge	n	\N	\N	1	C2	\N
6990	truism	n	\N	\N	1	C2	\N
6991	truncate	v	\N	\N	1	C2	\N
6992	trusteeship	n	\N	\N	1	C2	\N
6993	tumult	n	\N	\N	1	C2	\N
6994	tumultuous	adj	\N	\N	1	C2	\N
6995	tundra	n	\N	\N	1	C2	\N
6996	turbulence	n	\N	\N	1	C2	\N
6997	turbulent	adj	\N	\N	1	C2	\N
6998	turmoil	n	\N	\N	1	C2	\N
6999	turncoat	n	\N	\N	1	C2	\N
7000	turpitude	n	\N	\N	1	C2	\N
7001	tutelage	n	\N	\N	1	C2	\N
7002	twilight	n	\N	\N	1	C2	\N
7003	tycoon	n	\N	\N	1	C2	\N
7004	typhoon	n	\N	\N	1	C2	\N
7005	tyranny	n	\N	\N	1	C2	\N
7006	tyrant	n	\N	\N	1	C2	\N
7007	ubiquitous	adj	\N	\N	1	C2	\N
7008	ubiquity	n	\N	\N	1	C2	\N
7009	ultimatum	n	\N	\N	1	C2	\N
7010	umbrage	n	\N	\N	1	C2	\N
7011	umpire	n	\N	\N	1	C2	\N
7012	unanimity	n	\N	\N	1	C2	\N
7013	unanimous	adj	\N	\N	1	C2	\N
7014	unctuous	adj	\N	\N	1	C2	\N
7015	undaunted	adj	\N	\N	1	C2	\N
7016	undercurrent	n	\N	\N	1	C2	\N
7017	underdog	n	\N	\N	1	C2	\N
7018	underling	n	\N	\N	1	C2	\N
7019	underpinning	n	\N	\N	1	C2	\N
7020	understatement	n	\N	\N	1	C2	\N
7021	understudy	n	\N	\N	1	C2	\N
7022	undertaker	n	\N	\N	1	C2	\N
7023	undertaking	n	\N	\N	1	C2	\N
7024	undertone	n	\N	\N	1	C2	\N
7025	underworld	n	\N	\N	1	C2	\N
7026	underwriter	n	\N	\N	1	C2	\N
7027	undoing	n	\N	\N	1	C2	\N
7028	unease	n	\N	\N	1	C2	\N
7029	unenviable	adj	\N	\N	1	C2	\N
7030	unequivocal	adj	\N	\N	1	C2	\N
7031	unfathomable	adj	\N	\N	1	C2	\N
7032	unification	n	\N	\N	1	C2	\N
7033	uniformity	n	\N	\N	1	C2	\N
7034	unison	n	\N	\N	1	C2	\N
7035	universality	n	\N	\N	1	C2	\N
7036	unpalatable	adj	\N	\N	1	C2	\N
7037	unpretentious	adj	\N	\N	1	C2	\N
7038	unremitting	adj	\N	\N	1	C2	\N
7039	unrivalled	adj	\N	\N	1	C2	\N
7040	unruly	adj	\N	\N	1	C2	\N
7041	unsullied	adj	\N	\N	1	C2	\N
7042	untenable	adj	\N	\N	1	C2	\N
7043	unthinkable	adj	\N	\N	1	C2	\N
7044	untrodden	adj	\N	\N	1	C2	\N
7045	unwieldy	adj	\N	\N	1	C2	\N
7046	unwitting	adj	\N	\N	1	C2	\N
7047	upbraid	v	\N	\N	1	C2	\N
7048	upheaval	n	\N	\N	1	C2	\N
7049	upkeep	n	\N	\N	1	C2	\N
7050	uprising	n	\N	\N	1	C2	\N
7051	uproar	n	\N	\N	1	C2	\N
7052	uproarious	adj	\N	\N	1	C2	\N
7053	upshot	n	\N	\N	1	C2	\N
7054	upsurge	n	\N	\N	1	C2	\N
7055	upturn	n	\N	\N	1	C2	\N
7056	urbane	adj	\N	\N	1	C2	\N
7057	urgency	n	\N	\N	1	C2	\N
7058	usher	n	\N	\N	1	C2	\N
7059	usurp	v	\N	\N	1	C2	\N
7060	usurpation	n	\N	\N	1	C2	\N
7061	utensil	n	\N	\N	1	C2	\N
7062	utilitarianism	n	\N	\N	1	C2	\N
7063	utmost	adj	\N	\N	1	C2	\N
7064	utopia	n	\N	\N	1	C2	\N
7065	utopianism	n	\N	\N	1	C2	\N
7066	utterance	n	\N	\N	1	C2	\N
7067	vacancy	n	\N	\N	1	C2	\N
7068	vacillate	v	\N	\N	1	C2	\N
7069	vacillation	n	\N	\N	1	C2	\N
7070	vacuous	adj	\N	\N	1	C2	\N
7071	vagary	n	\N	\N	1	C2	\N
7072	vagrant	n	\N	\N	1	C2	\N
7073	vain	adj	\N	\N	1	C2	\N
7074	validate	v	\N	\N	1	C2	\N
7075	valour	n	\N	\N	1	C2	\N
7076	valuation	n	\N	\N	1	C2	\N
7077	vandal	n	\N	\N	1	C2	\N
7078	vandalism	n	\N	\N	1	C2	\N
7079	vanguard	n	\N	\N	1	C2	\N
7080	vanity	n	\N	\N	1	C2	\N
7081	vanquish	v	\N	\N	1	C2	\N
7082	vanquished	adj	\N	\N	1	C2	\N
7083	vapid	adj	\N	\N	1	C2	\N
7084	variance	n	\N	\N	1	C2	\N
7085	variegated	adj	\N	\N	1	C2	\N
7086	vastness	n	\N	\N	1	C2	\N
7087	vault	n	\N	\N	1	C2	\N
7088	vehemence	n	\N	\N	1	C2	\N
7089	vehemently	adv	\N	\N	1	C2	\N
7090	velocity	n	\N	\N	1	C2	\N
7091	velvet	n	\N	\N	1	C2	\N
7092	venal	adj	\N	\N	1	C2	\N
7093	vendetta	n	\N	\N	1	C2	\N
7094	veneer	n	\N	\N	1	C2	\N
7095	venerable	adj	\N	\N	1	C2	\N
7096	veneration	n	\N	\N	1	C2	\N
7097	vengeance	n	\N	\N	1	C2	\N
7098	venom	n	\N	\N	1	C2	\N
7099	vent	n	\N	\N	1	C2	\N
7100	veracity	n	\N	\N	1	C2	\N
7101	verbatim	adv	\N	\N	1	C2	\N
7102	verbose	adj	\N	\N	1	C2	\N
7103	verdant	adj	\N	\N	1	C2	\N
7104	verge	n	\N	\N	1	C2	\N
7105	verification	n	\N	\N	1	C2	\N
7106	verisimilitude	n	\N	\N	1	C2	\N
7107	vermin	n	\N	\N	1	C2	\N
7108	vernacular	n	\N	\N	1	C2	\N
7109	versatility	n	\N	\N	1	C2	\N
7110	vertex	n	\N	\N	1	C2	\N
7111	vertigo	n	\N	\N	1	C2	\N
7112	verve	n	\N	\N	1	C2	\N
7113	vestige	n	\N	\N	1	C2	\N
7114	veto	n	\N	\N	1	C2	\N
7115	vexation	n	\N	\N	1	C2	\N
7116	vexatious	adj	\N	\N	1	C2	\N
7117	viability	n	\N	\N	1	C2	\N
7118	vicarious	adj	\N	\N	1	C2	\N
7119	vicinity	n	\N	\N	1	C2	\N
7120	vicissitude	n	\N	\N	1	C2	\N
7121	victor	n	\N	\N	1	C2	\N
7122	vigil	n	\N	\N	1	C2	\N
7123	vigilance	n	\N	\N	1	C2	\N
7124	vigilante	n	\N	\N	1	C2	\N
7125	vigour	n	\N	\N	1	C2	\N
7126	vile	adj	\N	\N	1	C2	\N
7127	vilification	n	\N	\N	1	C2	\N
7128	vilify	v	\N	\N	1	C2	\N
7129	villain	n	\N	\N	1	C2	\N
7130	villainy	n	\N	\N	1	C2	\N
7131	vindicate	v	\N	\N	1	C2	\N
7132	vindication	n	\N	\N	1	C2	\N
7133	vindictive	adj	\N	\N	1	C2	\N
7134	vindictiveness	n	\N	\N	1	C2	\N
7135	vintage	n	\N	\N	1	C2	\N
7136	viper	n	\N	\N	1	C2	\N
7137	virtuosity	n	\N	\N	1	C2	\N
7138	virtuoso	n	\N	\N	1	C2	\N
7139	virulence	n	\N	\N	1	C2	\N
7140	virulent	adj	\N	\N	1	C2	\N
7141	visage	n	\N	\N	1	C2	\N
7142	visceral	adj	\N	\N	1	C2	\N
7143	visionary	n	\N	\N	1	C2	\N
7144	vista	n	\N	\N	1	C2	\N
7145	vitality	n	\N	\N	1	C2	\N
7146	vitriolic	adj	\N	\N	1	C2	\N
7147	vituperate	v	\N	\N	1	C2	\N
7148	vivacious	adj	\N	\N	1	C2	\N
7149	vivacity	n	\N	\N	1	C2	\N
7150	vocation	n	\N	\N	1	C2	\N
7151	vociferous	adj	\N	\N	1	C2	\N
7152	vogue	n	\N	\N	1	C2	\N
7153	void	n	\N	\N	1	C2	\N
7154	volatile	adj	\N	\N	1	C2	\N
7155	volatility	n	\N	\N	1	C2	\N
7156	volition	n	\N	\N	1	C2	\N
7157	volley	n	\N	\N	1	C2	\N
7158	voracious	adj	\N	\N	1	C2	\N
7159	vortex	n	\N	\N	1	C2	\N
7160	voucher	n	\N	\N	1	C2	\N
7161	voyeur	n	\N	\N	1	C2	\N
7162	vulgarity	n	\N	\N	1	C2	\N
7164	waiver	n	\N	\N	1	C2	\N
7165	walkout	n	\N	\N	1	C2	\N
7166	wane	v	\N	\N	1	C2	\N
7167	wanton	adj	\N	\N	1	C2	\N
7168	wantonness	n	\N	\N	1	C2	\N
7169	warden	n	\N	\N	1	C2	\N
7170	warlord	n	\N	\N	1	C2	\N
7171	warranty	n	\N	\N	1	C2	\N
7172	wasteland	n	\N	\N	1	C2	\N
7173	watchdog	n	\N	\N	1	C2	\N
7174	watchword	n	\N	\N	1	C2	\N
7175	watershed	n	\N	\N	1	C2	\N
7176	waver	v	\N	\N	1	C2	\N
7177	wayward	adj	\N	\N	1	C2	\N
7178	waywardness	n	\N	\N	1	C2	\N
7179	weaponry	n	\N	\N	1	C2	\N
7180	weariness	n	\N	\N	1	C2	\N
7181	wedlock	n	\N	\N	1	C2	\N
7182	wharf	n	\N	\N	1	C2	\N
7183	wheedling	adj	\N	\N	1	C2	\N
7184	whereby	adv	\N	\N	1	C2	\N
7185	wherewithal	n	\N	\N	1	C2	\N
7186	whim	n	\N	\N	1	C2	\N
7187	whimsical	adj	\N	\N	1	C2	\N
7188	whimsy	n	\N	\N	1	C2	\N
7189	whirlpool	n	\N	\N	1	C2	\N
7190	whirlwind	n	\N	\N	1	C2	\N
7191	whistleblower	n	\N	\N	1	C2	\N
7192	whitewash	n	\N	\N	1	C2	\N
7193	wickedness	n	\N	\N	1	C2	\N
7194	wield	v	\N	\N	1	C2	\N
7195	wilderness	n	\N	\N	1	C2	\N
7196	wildfire	n	\N	\N	1	C2	\N
7197	willfulness	n	\N	\N	1	C2	\N
7198	windfall	n	\N	\N	1	C2	\N
7199	wisp	n	\N	\N	1	C2	\N
7200	wistful	adj	\N	\N	1	C2	\N
7201	wistfulness	n	\N	\N	1	C2	\N
7202	witchcraft	n	\N	\N	1	C2	\N
7203	withstand	v	\N	\N	1	C2	\N
7204	witticism	n	\N	\N	1	C2	\N
7205	wizardry	n	\N	\N	1	C2	\N
7206	wizened	adj	\N	\N	1	C2	\N
7207	woe	n	\N	\N	1	C2	\N
7208	wordiness	n	\N	\N	1	C2	\N
7209	workmanship	n	\N	\N	1	C2	\N
7210	wrath	n	\N	\N	1	C2	\N
7211	wreckage	n	\N	\N	1	C2	\N
7212	wretched	adj	\N	\N	1	C2	\N
7213	wrongdoer	n	\N	\N	1	C2	\N
7214	wry	adj	\N	\N	1	C2	\N
7215	xenophobe	n	\N	\N	1	C2	\N
7216	xenophobia	n	\N	\N	1	C2	\N
7217	yardstick	n	\N	\N	1	C2	\N
7218	yarn	n	\N	\N	1	C2	\N
7219	yearning	n	\N	\N	1	C2	\N
7220	yoke	n	\N	\N	1	C2	\N
7221	yokel	n	\N	\N	1	C2	\N
7222	youngster	n	\N	\N	1	C2	\N
7223	zeal	n	\N	\N	1	C2	\N
7224	zealot	n	\N	\N	1	C2	\N
7225	zealotry	n	\N	\N	1	C2	\N
7226	zealous	adj	\N	\N	1	C2	\N
7227	zeitgeist	n	\N	\N	1	C2	\N
7228	zenith	n	\N	\N	1	C2	\N
7229	zest	n	\N	\N	1	C2	\N
7230	zigzag	n	\N	\N	1	C2	\N
7231	zodiac	n	\N	\N	1	C2	\N
7232	zoology	n	\N	\N	1	C2	\N
0	a	letter	\N	\N	1	N	\N
1	b	letter	\N	\N	1	N	\N
2	c	letter	\N	\N	1	N	\N
3	d	letter	\N	\N	1	N	\N
4	e	letter	\N	\N	1	N	\N
5	f	letter	\N	\N	1	N	\N
6	g	letter	\N	\N	1	N	\N
7	h	letter	\N	\N	1	N	\N
8	i	letter	\N	\N	1	N	\N
9	j	letter	\N	\N	1	N	\N
10	k	letter	\N	\N	1	N	\N
11	l	letter	\N	\N	1	N	\N
12	m	letter	\N	\N	1	N	\N
13	n	letter	\N	\N	1	N	\N
14	o	letter	\N	\N	1	N	\N
15	p	letter	\N	\N	1	N	\N
16	q	letter	\N	\N	1	N	\N
17	r	letter	\N	\N	1	N	\N
18	s	letter	\N	\N	1	N	\N
19	t	letter	\N	\N	1	N	\N
20	u	letter	\N	\N	1	N	\N
21	v	letter	\N	\N	1	N	\N
22	w	letter	\N	\N	1	N	\N
23	x	letter	\N	\N	1	N	\N
24	y	letter	\N	\N	1	N	\N
25	z	letter	\N	\N	1	N	\N
7237	affix	noun	\N	\N	1	B2	\N
7238	afraid of s.th	adjective	\N	\N	1	A1	\N
7239	airplane	noun	\N	\N	1	A1	\N
7240	a little	adverb	\N	\N	1	A1	\N
7241	armchair	noun	\N	\N	1	A1	\N
7242	around s.th	preposition	\N	\N	1	A1	\N
7243	at the beginning	phrase	\N	\N	1	A2	\N
7244	at the end of	phrase	\N	\N	1	A2	\N
7245	backpack	noun	\N	\N	1	A1	\N
7246	bad-tempred	adjective	\N	\N	1	B1	\N
7247	bazaar	noun	\N	\N	1	A2	\N
7248	be able to	verb	\N	\N	1	A2	\N
7249	beauty salon	noun	\N	\N	1	A2	\N
7250	be bad for	phrase	\N	\N	1	A2	\N
7251	be born	verb	\N	\N	1	A1	\N
7252	be changed	verb	\N	\N	1	B1	\N
7253	be different	phrase	\N	\N	1	A1	\N
7254	bedroll	noun	\N	\N	1	B1	\N
7255	be late	phrase	\N	\N	1	A1	\N
7256	bell pepper	noun	\N	\N	1	A2	\N
7257	be located	verb	\N	\N	1	B1	\N
7258	belong to s.b.	verb	\N	\N	1	A2	\N
7259	be placed	verb	\N	\N	1	B1	\N
7260	be put	verb	\N	\N	1	A2	\N
7261	be related to	phrase	\N	\N	1	B1	\N
7262	be there	phrase	\N	\N	1	A1	\N
7263	be used	verb	\N	\N	1	A2	\N
7264	be windy	phrase	\N	\N	1	A1	\N
7265	bike	noun	\N	\N	1	A1	\N
7266	biking	noun	\N	\N	1	A1	\N
7267	bird	noun	\N	\N	1	A1	\N
7268	birthday	noun	\N	\N	1	A1	\N
7269	black	adjective	\N	\N	1	A1	\N
7270	blouse	noun	\N	\N	1	A2	\N
7271	blue	adjective	\N	\N	1	A1	\N
7272	body building	noun	\N	\N	1	A2	\N
7273	booklet	noun	\N	\N	1	B1	\N
7274	book store	noun	\N	\N	1	A1	\N
7275	boot	noun	\N	\N	1	A1	\N
7276	boot chukka	noun	\N	\N	1	B2	\N
7277	boring	adjective	\N	\N	1	A1	\N
7278	bottle	noun	\N	\N	1	A1	\N
7279	box	noun	\N	\N	1	A1	\N
7280	boy	noun	\N	\N	1	A1	\N
7281	bread	noun	\N	\N	1	A1	\N
7282	brother	noun	\N	\N	1	A1	\N
7283	brown	adjective	\N	\N	1	A1	\N
7284	brunette	noun	\N	\N	1	B1	\N
7285	building	noun	\N	\N	1	A1	\N
7286	bulb	noun	\N	\N	1	A2	\N
7287	bus	noun	\N	\N	1	A1	\N
7288	business card	noun	\N	\N	1	B1	\N
7289	butter	noun	\N	\N	1	A1	\N
7290	buy	verb	\N	\N	1	A1	\N
7291	by the way	adverb	\N	\N	1	A2	\N
7292	cable-car	noun	\N	\N	1	B1	\N
7293	café	noun	\N	\N	1	A1	\N
7294	cage	noun	\N	\N	1	A2	\N
7295	calender	noun	\N	\N	1	A1	\N
7296	capital	noun	\N	\N	1	A2	\N
7297	cardboard	noun	\N	\N	1	B1	\N
7298	carpentry	noun	\N	\N	1	B1	\N
7299	cast a shadow on s.th	verb	\N	\N	1	B2	\N
7300	cellphone	noun	\N	\N	1	A1	\N
7301	cherry	noun	\N	\N	1	A1	\N
7302	circle s.th	verb	\N	\N	1	A2	\N
7303	clap	verb	\N	\N	1	A2	\N
7304	classmate	noun	\N	\N	1	A1	\N
7305	cloudy	adjective	\N	\N	1	A1	\N
7306	coffeeshop	noun	\N	\N	1	A1	\N
7307	color	noun	\N	\N	1	A1	\N
7308	come and go	verb	\N	\N	1	A2	\N
7309	come in	verb	\N	\N	1	A1	\N
7310	come over	verb	\N	\N	1	A2	\N
7311	communicate with	verb	\N	\N	1	B1	\N
7312	comparative adjective	noun	\N	\N	1	A2	\N
7313	comprehension	noun	\N	\N	1	B1	\N
7314	counting	noun	\N	\N	1	A1	\N
7315	crossing	noun	\N	\N	1	A2	\N
7316	crossroads	noun	\N	\N	1	A2	\N
7317	crowded	adjective	\N	\N	1	A2	\N
7318	cube	noun	\N	\N	1	B1	\N
7319	curly	adjective	\N	\N	1	A2	\N
7320	customer	noun	\N	\N	1	A2	\N
7321	cut	verb	\N	\N	1	A1	\N
7322	cylindrical	adjective	\N	\N	1	B2	\N
7323	demonstrative pronoun	noun	\N	\N	1	B1	\N
7324	descriptive compound	noun	\N	\N	1	C1	\N
7325	dim	adjective	\N	\N	1	B1	\N
7326	dish/platter	noun	\N	\N	1	A2	\N
7327	divide into	verb	\N	\N	1	B1	\N
7328	doll	noun	\N	\N	1	A1	\N
7329	dormitory	noun	\N	\N	1	B1	\N
7330	dotted	adjective	\N	\N	1	A2	\N
7331	drawer	noun	\N	\N	1	A2	\N
7332	drive s.th out	verb	\N	\N	1	B2	\N
7333	dulcimer	noun	\N	\N	1	B2	\N
7334	duster	noun	\N	\N	1	A2	\N
7335	dusting	noun	\N	\N	1	A2	\N
7336	each other	pronoun	\N	\N	1	A2	\N
7337	edible	adjective	\N	\N	1	B2	\N
7338	education consultant	noun	\N	\N	1	B2	\N
7339	elementary school	noun	\N	\N	1	A1	\N
7340	evening meal	noun	\N	\N	1	A1	\N
7341	excuse-me!	phrase	\N	\N	1	A1	\N
7342	fair-haired	adjective	\N	\N	1	B1	\N
7343	familiarity	noun	\N	\N	1	B2	\N
7344	family name	noun	\N	\N	1	A1	\N
7345	far away	adverb	\N	\N	1	A2	\N
7346	far from	preposition	\N	\N	1	A2	\N
7347	fatigue	noun	\N	\N	1	B2	\N
7348	fill in	verb	\N	\N	1	A1	\N
7349	five hundred	number	\N	\N	1	A1	\N
7350	footboard	noun	\N	\N	1	B2	\N
7351	footstool	noun	\N	\N	1	B1	\N
7352	fried eggs	noun	\N	\N	1	A1	\N
7353	fruit seller	noun	\N	\N	1	A2	\N
7354	fruit shop	noun	\N	\N	1	A1	\N
7355	garbage	noun	\N	\N	1	A2	\N
7356	get lost	verb	\N	\N	1	A2	\N
7357	get off s.th	verb	\N	\N	1	A2	\N
7358	get on s.th	verb	\N	\N	1	A2	\N
7359	get ready	verb	\N	\N	1	A2	\N
7360	give time	phrase	\N	\N	1	B1	\N
7361	glasses	noun	\N	\N	1	A1	\N
7362	gloves	noun	\N	\N	1	A1	\N
7363	go mount climbing	verb	\N	\N	1	A2	\N
7364	good....	adjective	\N	\N	1	A1	\N
7365	go out	verb	\N	\N	1	A1	\N
7366	gram	noun	\N	\N	1	A2	\N
7367	grandchild	noun	\N	\N	1	A2	\N
7368	gray	adjective	\N	\N	1	A1	\N
7369	greeting	noun	\N	\N	1	A1	\N
7370	grouping	noun	\N	\N	1	B1	\N
7371	guinness	noun	\N	\N	1	B1	\N
7372	gum	noun	\N	\N	1	A2	\N
7373	hair dresser	noun	\N	\N	1	A2	\N
7374	hair dressing	noun	\N	\N	1	B1	\N
7375	hairdryer	noun	\N	\N	1	A2	\N
7376	hairstyle	noun	\N	\N	1	A2	\N
7377	handicapped	adjective	\N	\N	1	B1	\N
7378	harm s.th or s.b	verb	\N	\N	1	B1	\N
7379	have breakfast	verb	\N	\N	1	A1	\N
7380	have dinner	verb	\N	\N	1	A1	\N
7381	have time	phrase	\N	\N	1	A1	\N
7382	heat up	verb	\N	\N	1	A2	\N
7383	here you are	phrase	\N	\N	1	A1	\N
7384	he/she	pronoun	\N	\N	1	A1	\N
7385	highschool	noun	\N	\N	1	A2	\N
7386	hive	noun	\N	\N	1	B1	\N
7387	hot and humid	adjective	\N	\N	1	B1	\N
7388	household chores	noun	\N	\N	1	A2	\N
7389	housekeeping	noun	\N	\N	1	B1	\N
7390	housewife	noun	\N	\N	1	A1	\N
7391	how much	phrase	\N	\N	1	A1	\N
7392	ice-cream	noun	\N	\N	1	A1	\N
7393	imitate	verb	\N	\N	1	B1	\N
7394	imitation	noun	\N	\N	1	B2	\N
7395	impretive verb	noun	\N	\N	1	B1	\N
7396	in a hurry	phrase	\N	\N	1	A2	\N
7397	infinitive	noun	\N	\N	1	B2	\N
7398	intelligence test	noun	\N	\N	1	B1	\N
7399	intonation	noun	\N	\N	1	B2	\N
7400	islands	noun	\N	\N	1	A2	\N
7401	join all	verb	\N	\N	1	B1	\N
7402	kilo	noun	\N	\N	1	A1	\N
7403	kilometer	noun	\N	\N	1	A2	\N
7404	kitchen cabinet	noun	\N	\N	1	A2	\N
7405	kiwi	noun	\N	\N	1	A1	\N
7406	laugh at	verb	\N	\N	1	A2	\N
7407	little boy	noun	\N	\N	1	A1	\N
7408	look after	verb	\N	\N	1	A2	\N
7409	look at	verb	\N	\N	1	A1	\N
7410	looking after	noun	\N	\N	1	A2	\N
7411	lotion	noun	\N	\N	1	B1	\N
7412	low	adjective	\N	\N	1	A2	\N
7413	manteau	noun	\N	\N	1	B1	\N
7414	members	noun	\N	\N	1	A2	\N
7415	(men's) coat	noun	\N	\N	1	A1	\N
7416	meter	noun	\N	\N	1	A2	\N
7417	middle-east	noun	\N	\N	1	B1	\N
7418	mom	noun	\N	\N	1	A1	\N
7419	money purse	noun	\N	\N	1	A2	\N
7420	most of the time	adverb	\N	\N	1	A2	\N
7421	mother tongue	noun	\N	\N	1	B1	\N
7422	mr.	noun	\N	\N	1	A1	\N
7423	myna	noun	\N	\N	1	B2	\N
7424	nap	noun	\N	\N	1	A2	\N
7425	nationality	noun	\N	\N	1	A2	\N
7426	navy blue	adjective	\N	\N	1	A2	\N
7427	negative imperative	noun	\N	\N	1	B2	\N
7428	neighbor	noun	\N	\N	1	A2	\N
7429	nephew	noun	\N	\N	1	A2	\N
7430	niece	noun	\N	\N	1	A2	\N
7431	nominative compound	noun	\N	\N	1	C1	\N
7432	noun \\ name	noun	\N	\N	1	A1	\N
7433	nowruz	noun	\N	\N	1	A2	\N
7434	numbers	noun	\N	\N	1	A1	\N
7435	nurse	noun	\N	\N	1	A1	\N
7436	only child	noun	\N	\N	1	A2	\N
7437	ophthalmology	noun	\N	\N	1	C1	\N
7438	ordinal	adjective	\N	\N	1	B1	\N
7439	other than	preposition	\N	\N	1	B1	\N
7440	outside of s.th	preposition	\N	\N	1	A2	\N
7441	overcoat	noun	\N	\N	1	B1	\N
7442	pairs	noun	\N	\N	1	A1	\N
7443	parents	noun	\N	\N	1	A1	\N
7444	parking lot	noun	\N	\N	1	A1	\N
7445	part/section	noun	\N	\N	1	A2	\N
7446	pay for s.th	verb	\N	\N	1	A2	\N
7447	pencilcase	noun	\N	\N	1	A1	\N
7448	penguin	noun	\N	\N	1	A1	\N
7449	persian language	noun	\N	\N	1	A1	\N
7450	personal belongings	noun	\N	\N	1	B1	\N
7451	personal ending	noun	\N	\N	1	B2	\N
7452	picnic	noun	\N	\N	1	A1	\N
7453	pictures	noun	\N	\N	1	A1	\N
7454	pilates	noun	\N	\N	1	A2	\N
7455	pineapple	noun	\N	\N	1	A1	\N
7456	ping-pong	noun	\N	\N	1	A1	\N
7457	pizza	noun	\N	\N	1	A1	\N
7458	pleased to meet you!	phrase	\N	\N	1	A1	\N
7459	plural	adjective	\N	\N	1	A2	\N
7460	polluted	adjective	\N	\N	1	B1	\N
7461	populated	adjective	\N	\N	1	B1	\N
7462	populous	adjective	\N	\N	1	B2	\N
7463	possessive	adjective	\N	\N	1	A2	\N
7464	preposition	noun	\N	\N	1	A2	\N
7465	previous	adjective	\N	\N	1	B1	\N
7466	pronunciation	noun	\N	\N	1	B1	\N
7467	properly	adverb	\N	\N	1	B1	\N
7468	protecting	verb	\N	\N	1	B1	\N
7469	provide	verb	\N	\N	1	B1	\N
7470	public place	noun	\N	\N	1	A2	\N
7471	quarter	noun	\N	\N	1	A2	\N
7472	question word	noun	\N	\N	1	A1	\N
7473	rail way	noun	\N	\N	1	A2	\N
7474	rain	noun	\N	\N	1	A1	\N
7475	rain	verb	\N	\N	1	A1	\N
7476	read	verb	\N	\N	1	A1	\N
7477	reading	noun	\N	\N	1	A1	\N
7478	really	adverb	\N	\N	1	A2	\N
7479	red	adjective	\N	\N	1	A1	\N
7480	remain	verb	\N	\N	1	B1	\N
7481	repairer	noun	\N	\N	1	B1	\N
7482	repairman	noun	\N	\N	1	A2	\N
7483	repeat	verb	\N	\N	1	A1	\N
7484	research institution	noun	\N	\N	1	B2	\N
7485	residents	noun	\N	\N	1	B1	\N
7486	respond	verb	\N	\N	1	B1	\N
7487	restaurant	noun	\N	\N	1	A1	\N
7488	return	verb	\N	\N	1	A2	\N
7489	riddle	noun	\N	\N	1	B1	\N
7490	right	adjective	\N	\N	1	A1	\N
7491	room	noun	\N	\N	1	A1	\N
7492	rule	noun	\N	\N	1	B1	\N
7493	ruler	noun	\N	\N	1	A1	\N
7494	sales clerk	noun	\N	\N	1	A2	\N
7495	saturday	noun	\N	\N	1	A1	\N
7496	sauna	noun	\N	\N	1	B1	\N
7497	say	verb	\N	\N	1	A1	\N
7498	scales	noun	\N	\N	1	B1	\N
7499	scarf	noun	\N	\N	1	A1	\N
7500	scarf (men & women)	noun	\N	\N	1	A1	\N
7501	school	noun	\N	\N	1	A1	\N
7502	sea	noun	\N	\N	1	A1	\N
7503	security guard	noun	\N	\N	1	A2	\N
7504	see	verb	\N	\N	1	A1	\N
7505	sentence	noun	\N	\N	1	A1	\N
7506	set (an alarm)	verb	\N	\N	1	A2	\N
7507	seven	number	\N	\N	1	A1	\N
7508	shawl (women)	noun	\N	\N	1	A2	\N
7509	shirt	noun	\N	\N	1	A1	\N
7510	shoe	noun	\N	\N	1	A1	\N
7511	shop	noun	\N	\N	1	A1	\N
7512	shopping	noun	\N	\N	1	A1	\N
7513	shop window	noun	\N	\N	1	A2	\N
7514	short	adjective	\N	\N	1	A1	\N
7515	shower	noun	\N	\N	1	A1	\N
7516	sing	verb	\N	\N	1	A1	\N
7517	singer	noun	\N	\N	1	A2	\N
7518	sister	noun	\N	\N	1	A1	\N
7519	sit	verb	\N	\N	1	A1	\N
7520	situation	noun	\N	\N	1	B1	\N
7521	six	number	\N	\N	1	A1	\N
7522	skirt	noun	\N	\N	1	A1	\N
7523	sleep	verb	\N	\N	1	A1	\N
7524	sleep	noun	\N	\N	1	A1	\N
7525	slow	adjective	\N	\N	1	A1	\N
7526	small	adjective	\N	\N	1	A1	\N
7527	sneakers	noun	\N	\N	1	A1	\N
7528	socks	noun	\N	\N	1	A1	\N
7529	some times	adverb	\N	\N	1	A1	\N
7530	sore throat	noun	\N	\N	1	A2	\N
7531	souvenir	noun	\N	\N	1	B1	\N
7532	specially	adverb	\N	\N	1	B1	\N
7533	spoken language	noun	\N	\N	1	B1	\N
7534	sponge	noun	\N	\N	1	A2	\N
7535	sportsman	noun	\N	\N	1	A1	\N
7536	stay alive	verb	\N	\N	1	B1	\N
7537	stay at home	verb	\N	\N	1	A1	\N
7538	stove	noun	\N	\N	1	A2	\N
7539	studying	noun	\N	\N	1	A1	\N
7540	subject pronoun	noun	\N	\N	1	B1	\N
7541	subway	noun	\N	\N	1	A1	\N
7542	sun cap	noun	\N	\N	1	A1	\N
7543	sunglasses	noun	\N	\N	1	A1	\N
7544	sun hat	noun	\N	\N	1	A1	\N
7545	sunny	adjective	\N	\N	1	A1	\N
7546	sunrise	noun	\N	\N	1	A2	\N
7547	sunset	noun	\N	\N	1	A2	\N
7548	superlative adjective	noun	\N	\N	1	A2	\N
7549	surfing the net	noun	\N	\N	1	A2	\N
7550	surf the net	verb	\N	\N	1	A2	\N
7551	tailoring	noun	\N	\N	1	B1	\N
7552	take a shower	verb	\N	\N	1	A1	\N
7553	take part	verb	\N	\N	1	B1	\N
7554	take time	verb	\N	\N	1	A2	\N
7555	talk to s.o	verb	\N	\N	1	A1	\N
7556	tense	noun	\N	\N	1	B1	\N
7557	thanks!	phrase	\N	\N	1	A1	\N
7558	thanks god!	phrase	\N	\N	1	A1	\N
7559	thank you	phrase	\N	\N	1	A1	\N
7560	thank you!	phrase	\N	\N	1	A1	\N
7561	theater	noun	\N	\N	1	A2	\N
7562	the eighth month	noun	\N	\N	1	B1	\N
7563	the eleventh month	noun	\N	\N	1	B1	\N
7564	the fifth month	noun	\N	\N	1	B1	\N
7565	the first month	noun	\N	\N	1	B1	\N
7566	the following	adjective	\N	\N	1	B1	\N
7567	the fourth month	noun	\N	\N	1	B1	\N
7568	the last month	noun	\N	\N	1	B1	\N
7569	the ninth month	noun	\N	\N	1	B1	\N
7570	the other	pronoun	\N	\N	1	A2	\N
7571	these	pronoun	\N	\N	1	A1	\N
7572	the second month	noun	\N	\N	1	B1	\N
7573	the seventh month	noun	\N	\N	1	B1	\N
7574	the sixth month	noun	\N	\N	1	B1	\N
7575	the tenth month	noun	\N	\N	1	B1	\N
7576	the third	adjective	\N	\N	1	A1	\N
7577	the third month	noun	\N	\N	1	B1	\N
7578	things	noun	\N	\N	1	A1	\N
7579	throw s.th away	verb	\N	\N	1	A2	\N
7580	tidy up	verb	\N	\N	1	A2	\N
7581	time-consuming	adjective	\N	\N	1	B2	\N
7582	tiring	adjective	\N	\N	1	A2	\N
7583	(to be) worried	adjective	\N	\N	1	A2	\N
7584	toman	noun	\N	\N	1	A1	\N
7585	tools	noun	\N	\N	1	A2	\N
7586	toothbrush	noun	\N	\N	1	A1	\N
7587	toothpaste	noun	\N	\N	1	A1	\N
7588	translator	noun	\N	\N	1	A2	\N
7589	transportation	noun	\N	\N	1	B1	\N
7590	traveler	noun	\N	\N	1	A2	\N
7591	triangle	noun	\N	\N	1	A2	\N
7592	underline s.th	verb	\N	\N	1	A1	\N
7593	university student	noun	\N	\N	1	A2	\N
7594	untidy	adjective	\N	\N	1	A2	\N
7595	vacuum cleaner	noun	\N	\N	1	A2	\N
7596	vase	noun	\N	\N	1	A2	\N
7597	verb	noun	\N	\N	1	A1	\N
7598	villa	noun	\N	\N	1	B1	\N
7599	wake up	verb	\N	\N	1	A1	\N
7600	wardrobe	noun	\N	\N	1	A2	\N
7601	wheelchair	noun	\N	\N	1	A2	\N
7602	which one	phrase	\N	\N	1	A1	\N
7603	white skinned	adjective	\N	\N	1	B1	\N
7604	wordmaking	noun	\N	\N	1	B2	\N
7605	yoga	noun	\N	\N	1	A2	\N
7606	yoghurt	noun	\N	\N	1	A1	\N
7607	you're welcome	phrase	\N	\N	1	A1	\N
7608	proper	adjective	\N	\N	1	B1	\N
7609	instruments	noun	\N	\N	1	A2	\N
7610	things	noun	\N	\N	1	A1	\N
7611	transportation	noun	\N	\N	1	B1	\N
200000	الف	letter	\N	\N	3	N	\N
200001	ب	letter	\N	\N	3	N	\N
200002	پ	letter	\N	\N	3	N	\N
200003	ت	letter	\N	\N	3	N	\N
200004	ث	letter	\N	\N	3	N	\N
200005	ج	letter	\N	\N	3	N	\N
200006	چ	letter	\N	\N	3	N	\N
200007	ح	letter	\N	\N	3	N	\N
200008	خ	letter	\N	\N	3	N	\N
200009	د	letter	\N	\N	3	N	\N
200010	ذ	letter	\N	\N	3	N	\N
200011	ر	letter	\N	\N	3	N	\N
200012	ز	letter	\N	\N	3	N	\N
200013	ژ	letter	\N	\N	3	N	\N
200014	س	letter	\N	\N	3	N	\N
200015	ش	letter	\N	\N	3	N	\N
200016	ص	letter	\N	\N	3	N	\N
200017	ض	letter	\N	\N	3	N	\N
200018	ط	letter	\N	\N	3	N	\N
200019	ظ	letter	\N	\N	3	N	\N
200020	ع	letter	\N	\N	3	N	\N
200021	غ	letter	\N	\N	3	N	\N
200022	ف	letter	\N	\N	3	N	\N
200023	ق	letter	\N	\N	3	N	\N
200024	ک	letter	\N	\N	3	N	\N
200025	گ	letter	\N	\N	3	N	\N
200026	ل	letter	\N	\N	3	N	\N
200027	م	letter	\N	\N	3	N	\N
200028	ن	letter	\N	\N	3	N	\N
200029	و	letter	\N	\N	3	N	\N
200030	ه	letter	\N	\N	3	N	\N
200031	ی	letter	\N	\N	3	N	\N
200400	اِبتِدا	noun	\N	\N	3	AB	\N
200401	اِبتِدایِ	preposition	\N	\N	3	AB	\N
200402	آب	noun	\N	\N	3	AB	\N
200403	آبان	noun	\N	\N	3	AB	\N
200404	آب‌میوه	noun	\N	\N	3	AB	\N
200405	آب‌وهوا	noun	\N	\N	3	AB	\N
200406	آبی	adjective	\N	\N	3	AB	\N
200407	آخَر	adjective	\N	\N	3	AB	\N
200408	آداس	noun	\N	\N	3	AB	\N
200409	آدرِس	noun	\N	\N	3	AB	\N
200410	آذَر	noun	\N	\N	3	AB	\N
200411	آرایِشگاه	noun	\N	\N	3	AB	\N
200412	آرایِشگَر	noun	\N	\N	3	AB	\N
200413	آرایِشگَری	noun	\N	\N	3	AB	\N
200414	آره	adverb	\N	\N	3	AB	\N
200415	آزمایش	noun	\N	\N	3	AB	\N
200416	آزمون	noun	\N	\N	3	AB	\N
200417	آژانس	noun	\N	\N	3	AB	\N
200418	آسیب زَدَن به	verb	\N	\N	3	AB	\N
200419	آشپَزخانه	noun	\N	\N	3	AB	\N
200420	آشپَزی کَردَن	verb	\N	\N	3	AB	\N
200421	آشنایی	noun	\N	\N	3	AB	\N
200422	آشیانه	noun	\N	\N	3	AB	\N
200423	آفتاب	noun	\N	\N	3	AB	\N
200424	آفتابی	adjective	\N	\N	3	AB	\N
200425	آقا	noun	\N	\N	3	AB	\N
200426	آلبوم	noun	\N	\N	3	AB	\N
200427	آلوده	adjective	\N	\N	3	AB	\N
200428	آماده شُدَن	verb	\N	\N	3	AB	\N
200429	آمَدَن	verb	\N	\N	3	AB	\N
200430	آن	pronoun	\N	\N	3	AB	\N
200431	آناناس	noun	\N	\N	3	AB	\N
200432	آنها	pronoun	\N	\N	3	AB	\N
200433	آوازخواندَن	verb	\N	\N	3	AB	\N
200434	آوریل	noun	\N	\N	3	AB	\N
200435	آهِسته	adverb	\N	\N	3	AB	\N
200436	آهن	noun	\N	\N	3	AB	\N
200437	آهنگ	noun	\N	\N	3	AB	\N
200438	آینه	noun	\N	\N	3	AB	\N
200439	اَبر	noun	\N	\N	3	AB	\N
200440	اَبری	adjective	\N	\N	3	AB	\N
200441	اِتاق	noun	\N	\N	3	AB	\N
200442	اُتو	noun	\N	\N	3	AB	\N
200443	اُتوبوس	noun	\N	\N	3	AB	\N
200444	اُتو کَردَن	verb	\N	\N	3	AB	\N
200445	اُجاق گاز	noun	\N	\N	3	AB	\N
200446	اِجتِماعی	adjective	\N	\N	3	AB	\N
200447	اِحتِرام	noun	\N	\N	3	AB	\N
200448	اَحوال‌پُرسی	noun	\N	\N	3	AB	\N
200449	اِداره	noun	\N	\N	3	AB	\N
200450	اِدامه	noun	\N	\N	3	AB	\N
200451	اِدامه دادَن	verb	\N	\N	3	AB	\N
200452	اَدَبیّات	noun	\N	\N	3	AB	\N
200453	اِرتِباط بَرقَرار کَردَن	verb	\N	\N	3	AB	\N
200454	اُردیبِهِشت	noun	\N	\N	3	AB	\N
200455	اَرزان	adjective	\N	\N	3	AB	\N
200456	اَز آشنایی‌تون خوشوَقتَم	phrase	\N	\N	3	AB	\N
200457	اَز چیزی ترسیدَن	verb	\N	\N	3	AB	\N
200458	اَساسی	adjective	\N	\N	3	AB	\N
200459	اَسباب‌بازی	noun	\N	\N	3	AB	\N
200460	اُستاد	noun	\N	\N	3	AB	\N
200461	اُستان	noun	\N	\N	3	AB	\N
200462	اِستَخر	noun	\N	\N	3	AB	\N
200463	اِستِراحَت کَردَن	verb	\N	\N	3	AB	\N
200464	اِستِفاده	noun	\N	\N	3	AB	\N
200465	اِستِفاده شُدَن	verb	\N	\N	3	AB	\N
200466	اِستِمراری	adjective	\N	\N	3	AB	\N
200467	استوانه‌ای	adjective	\N	\N	3	AB	\N
200468	اِسفَند	noun	\N	\N	3	AB	\N
200469	اِسکاج	noun	\N	\N	3	AB	\N
200470	اِسکی	noun	\N	\N	3	AB	\N
200471	اِسم	noun	\N	\N	3	AB	\N
200472	اِشتِباه	noun	\N	\N	3	AB	\N
200473	اَشک	noun	\N	\N	3	AB	\N
200474	اَشیاء	noun	\N	\N	3	AB	\N
200475	اِضافه کَردَن	verb	\N	\N	3	AB	\N
200476	اَطرافِ	preposition	\N	\N	3	AB	\N
200477	اِطّلاعات	noun	\N	\N	3	AB	\N
200478	اَعداد	noun	\N	\N	3	AB	\N
200479	اَعضا	noun	\N	\N	3	AB	\N
200480	اَغلَب	adverb	\N	\N	3	AB	\N
200481	اَفراد	noun	\N	\N	3	AB	\N
200482	اُکتُبر	noun	\N	\N	3	AB	\N
200483	اَگَر	conjunction	\N	\N	3	AB	\N
200484	اَلان	adverb	\N	\N	3	AB	\N
200485	اَلگو	noun	\N	\N	3	AB	\N
200486	اَمّا	conjunction	\N	\N	3	AB	\N
200487	اِمتِحان	noun	\N	\N	3	AB	\N
200488	اِمتیاز	noun	\N	\N	3	AB	\N
200489	اِمروز	noun	\N	\N	3	AB	\N
200490	اَمن	adjective	\N	\N	3	AB	\N
200491	اِنتِخاب کَردَن	verb	\N	\N	3	AB	\N
200492	اِنتِهایِ	preposition	\N	\N	3	AB	\N
200493	اَنجام‌دادَن	verb	\N	\N	3	AB	\N
200494	اَندازه‌گیری	noun	\N	\N	3	AB	\N
200495	اِنسان	noun	\N	\N	3	AB	\N
200496	اِنشا	noun	\N	\N	3	AB	\N
200497	او	pronoun	\N	\N	3	AB	\N
200498	اَوَّل	adjective	\N	\N	3	AB	\N
200499	اَهلی	adjective	\N	\N	3	AB	\N
200500	ایروبیک	noun	\N	\N	3	AB	\N
200501	ایستگاه	noun	\N	\N	3	AB	\N
200502	ایشان	pronoun	\N	\N	3	AB	\N
200503	ایمِنی	noun	\N	\N	3	AB	\N
200504	ایمِیل	noun	\N	\N	3	AB	\N
200505	این	pronoun	\N	\N	3	AB	\N
200506	اینتِرنِت	noun	\N	\N	3	AB	\N
200507	اینجا	adverb	\N	\N	3	AB	\N
200508	اینها	pronoun	\N	\N	3	AB	\N
200509	با هَم	adverb	\N	\N	3	AB	\N
200510	باد	noun	\N	\N	3	AB	\N
200511	باد آمَدَن	verb	\N	\N	3	AB	\N
200512	بار	noun	\N	\N	3	AB	\N
200513	باران	noun	\N	\N	3	AB	\N
200514	باران آمَدَن	verb	\N	\N	3	AB	\N
200515	بازار	noun	\N	\N	3	AB	\N
200516	بازی	noun	\N	\N	3	AB	\N
200517	باشگاه	noun	\N	\N	3	AB	\N
200518	باعَجَله	adverb	\N	\N	3	AB	\N
200519	باغ	noun	\N	\N	3	AB	\N
200520	باقی ماندَن	verb	\N	\N	3	AB	\N
200521	بالایِ	preposition	\N	\N	3	AB	\N
200522	بالِغ	adjective	\N	\N	3	AB	\N
200523	بانِک	noun	\N	\N	3	AB	\N
200524	باهوش	adjective	\N	\N	3	AB	\N
200525	بَبخشید!	phrase	\N	\N	3	AB	\N
200526	بَچّگی	noun	\N	\N	3	AB	\N
200527	بَچّه	noun	\N	\N	3	AB	\N
200528	بَخش	noun	\N	\N	3	AB	\N
200529	بَد اَخلاق	adjective	\N	\N	3	AB	\N
200530	بَدَن‌سازی	noun	\N	\N	3	AB	\N
200531	بِدون	preposition	\N	\N	3	AB	\N
200532	بَرادَر	noun	\N	\N	3	AB	\N
200533	بَرادَرزاده	noun	\N	\N	3	AB	\N
200534	بَراساسِ	preposition	\N	\N	3	AB	\N
200535	بَررِسی کَردَن	verb	\N	\N	3	AB	\N
200536	بُرِس	noun	\N	\N	3	AB	\N
200537	بُرش دادَن	verb	\N	\N	3	AB	\N
200538	بَرف	noun	\N	\N	3	AB	\N
200539	بَرف آمَدَن	verb	\N	\N	3	AB	\N
200540	بَرق	noun	\N	\N	3	AB	\N
200541	بَرگَشتَن	verb	\N	\N	3	AB	\N
200542	بَرگه	noun	\N	\N	3	AB	\N
200543	بَرنامه	noun	\N	\N	3	AB	\N
200544	بُزُرگ	adjective	\N	\N	3	AB	\N
200545	بُزُرگ کَردَن	verb	\N	\N	3	AB	\N
200546	بَستَنی	noun	\N	\N	3	AB	\N
200547	بَسته	noun	\N	\N	3	AB	\N
200548	بُشقاب	noun	\N	\N	3	AB	\N
200549	شُستَن	verb	\N	\N	3	AB	\N
200550	بُطری	noun	\N	\N	3	AB	\N
200551	بَعد	adverb	\N	\N	3	AB	\N
200552	بَعد اَز	preposition	\N	\N	3	AB	\N
200553	بَعد اَظُهر	noun	\N	\N	3	AB	\N
200554	بَعضی	adjective	\N	\N	3	AB	\N
200555	بَعضی وَقتها	adverb	\N	\N	3	AB	\N
200556	بَفَرمایید	phrase	\N	\N	3	AB	\N
200557	بُلَند	adjective	\N	\N	3	AB	\N
200558	بُلَند شُدَن	verb	\N	\N	3	AB	\N
200559	بُلوز	noun	\N	\N	3	AB	\N
200560	بَله	adverb	\N	\N	3	AB	\N
200561	بلیط	noun	\N	\N	3	AB	\N
200562	بَند (پارارگراف)	noun	\N	\N	3	AB	\N
200563	بَنَفش	adjective	\N	\N	3	AB	\N
200564	بودَن	verb	\N	\N	3	AB	\N
200565	بور	adjective	\N	\N	3	AB	\N
200566	به پیکنیک رَفتَن	verb	\N	\N	3	AB	\N
200567	به خِیر	phrase	\N	\N	3	AB	\N
200568	به سَمتِ	preposition	\N	\N	3	AB	\N
200569	به کوه رَفتَن	verb	\N	\N	3	AB	\N
200570	بَهار	noun	\N	\N	3	AB	\N
200571	به دُرُستی	adverb	\N	\N	3	AB	\N
200572	به دُنیا آمَدَن	verb	\N	\N	3	AB	\N
200573	بَهمَن	noun	\N	\N	3	AB	\N
200574	به نُدرَت	adverb	\N	\N	3	AB	\N
200575	بی‌اَدَب	adjective	\N	\N	3	AB	\N
200576	بیان کَردَن	verb	\N	\N	3	AB	\N
200577	بیدار شُدَن	verb	\N	\N	3	AB	\N
200578	بیرونِ	preposition	\N	\N	3	AB	\N
200579	بیرون آمَدَن	verb	\N	\N	3	AB	\N
200580	بیرون رَفتَن	verb	\N	\N	3	AB	\N
200581	بیرون کَردَن	verb	\N	\N	3	AB	\N
200582	بیست	number	\N	\N	3	AB	\N
200583	بیشتَر	adjective	\N	\N	3	AB	\N
200584	بیشتَرِ اوقات	adverb	\N	\N	3	AB	\N
200585	بیمارِستان	noun	\N	\N	3	AB	\N
200586	بیمه	noun	\N	\N	3	AB	\N
200587	بَینِ	preposition	\N	\N	3	AB	\N
200588	پَر	noun	\N	\N	3	AB	\N
200589	پُر	adjective	\N	\N	3	AB	\N
200590	پُر کَردَن	verb	\N	\N	3	AB	\N
200591	پارچه	noun	\N	\N	3	AB	\N
200592	پارک	noun	\N	\N	3	AB	\N
200593	پارک کَردَن	verb	\N	\N	3	AB	\N
200594	پارکینگ	noun	\N	\N	3	AB	\N
200595	پاساژ	noun	\N	\N	3	AB	\N
200596	پاسُخ	noun	\N	\N	3	AB	\N
200597	پاسُخ دادَن	verb	\N	\N	3	AB	\N
200598	پالتو	noun	\N	\N	3	AB	\N
200599	پانزده	number	\N	\N	3	AB	\N
200600	پانصَد	number	\N	\N	3	AB	\N
200601	پایتَخت	noun	\N	\N	3	AB	\N
200602	پاییز	noun	\N	\N	3	AB	\N
200603	پِدَر	noun	\N	\N	3	AB	\N
200604	پِدَربُزُرگ	noun	\N	\N	3	AB	\N
200605	پَدیده	noun	\N	\N	3	AB	\N
200606	پُرتِقال	noun	\N	\N	3	AB	\N
200607	پُرجمعیت	adjective	\N	\N	3	AB	\N
200608	پَرْده	noun	\N	\N	3	AB	\N
200609	پَرَستار	noun	\N	\N	3	AB	\N
200610	پُرسِش	noun	\N	\N	3	AB	\N
200611	پُرسِش‌واژه	noun	\N	\N	3	AB	\N
200612	پُرسیدَن	verb	\N	\N	3	AB	\N
200613	پُرطَرَفدار	adjective	\N	\N	3	AB	\N
200614	پَرَنده	noun	\N	\N	3	AB	\N
200615	پُرنور	adjective	\N	\N	3	AB	\N
200616	پِزِشک	noun	\N	\N	3	AB	\N
200617	پِسَر	noun	\N	\N	3	AB	\N
200618	پِسَر (فرزند)	noun	\N	\N	3	AB	\N
200619	پِسَرچّه	noun	\N	\N	3	AB	\N
200620	پُشتِ	preposition	\N	\N	3	AB	\N
200621	پُشتِ‌بام	noun	\N	\N	3	AB	\N
200622	پِلاک	noun	\N	\N	3	AB	\N
200623	پلیس	noun	\N	\N	3	AB	\N
200624	پَنج	number	\N	\N	3	AB	\N
200625	پَنجاه	number	\N	\N	3	AB	\N
200626	پَنجِره	noun	\N	\N	3	AB	\N
200627	پَنج‌شَنبه	noun	\N	\N	3	AB	\N
200628	پَنجُم	adjective	\N	\N	3	AB	\N
200629	پَنگوئن	noun	\N	\N	3	AB	\N
200630	پَنیر	noun	\N	\N	3	AB	\N
200631	پوتین	noun	\N	\N	3	AB	\N
200632	پوست	noun	\N	\N	3	AB	\N
200633	پوشاک	noun	\N	\N	3	AB	\N
200634	پوشیدَن	verb	\N	\N	3	AB	\N
200635	پول	noun	\N	\N	3	AB	\N
200636	پَهْن	adjective	\N	\N	3	AB	\N
200637	پیاده‌رَفتَن	verb	\N	\N	3	AB	\N
200638	پیاده‌شُدَن اَز	verb	\N	\N	3	AB	\N
200639	پیاز	noun	\N	\N	3	AB	\N
200640	پیانو	noun	\N	\N	3	AB	\N
200641	پیتزا	noun	\N	\N	3	AB	\N
200642	پیچیدَن	verb	\N	\N	3	AB	\N
200643	پیدا کَردَن	verb	\N	\N	3	AB	\N
200644	پیر	adjective	\N	\N	3	AB	\N
200645	پیراهَن	noun	\N	\N	3	AB	\N
200646	پیش اَز	preposition	\N	\N	3	AB	\N
200647	پیشخِدمَت	noun	\N	\N	3	AB	\N
200648	پیلاتِس	noun	\N	\N	3	AB	\N
200649	پینگ‌پُنگ	noun	\N	\N	3	AB	\N
200650	پِیوَسته	adjective	\N	\N	3	AB	\N
200651	تِئاتر	noun	\N	\N	3	AB	\N
200652	تابِستان	noun	\N	\N	3	AB	\N
200653	تابلو	noun	\N	\N	3	AB	\N
200654	تاجِر	noun	\N	\N	3	AB	\N
200655	تاریخ	noun	\N	\N	3	AB	\N
200656	تاریک	adjective	\N	\N	3	AB	\N
200657	تاکسی	noun	\N	\N	3	AB	\N
200658	تَبدیل	noun	\N	\N	3	AB	\N
200659	تَبدیل شُدَن	verb	\N	\N	3	AB	\N
200660	تَبدیل کَردَن	verb	\N	\N	3	AB	\N
200661	تَجرُبه	noun	\N	\N	3	AB	\N
200662	تَختِخواب	noun	\N	\N	3	AB	\N
200663	تَخته	noun	\N	\N	3	AB	\N
200664	تُخمِ‌مُرغ	noun	\N	\N	3	AB	\N
200665	تَدریس کَردَن	verb	\N	\N	3	AB	\N
200666	ترازو	noun	\N	\N	3	AB	\N
200667	ترافیک	noun	\N	\N	3	AB	\N
200668	تَرتیبی (عَدَد)	adjective	\N	\N	3	AB	\N
200669	تَرکیب اِضافی	noun	\N	\N	3	AB	\N
200670	تَرکیب وَصفی	noun	\N	\N	3	AB	\N
200671	تِستِ هوش	noun	\N	\N	3	AB	\N
200672	تَشَکُّر! مِرسی!	phrase	\N	\N	3	AB	\N
200673	تَصاویر	noun	\N	\N	3	AB	\N
200674	تَصویر	noun	\N	\N	3	AB	\N
200675	تِعداد	noun	\N	\N	3	AB	\N
200676	تَعطیل	adjective	\N	\N	3	AB	\N
200677	تَعلیم‌دادَن	verb	\N	\N	3	AB	\N
200678	تَعمیرکار	noun	\N	\N	3	AB	\N
200679	تَعین کَردَن	verb	\N	\N	3	AB	\N
200680	تَفاوُت	noun	\N	\N	3	AB	\N
200681	تَفاوُت داشتَن	verb	\N	\N	3	AB	\N
200682	تَقدیم کَردَن	verb	\N	\N	3	AB	\N
200683	تَقسیم شُدَن	verb	\N	\N	3	AB	\N
200684	تَقلید	noun	\N	\N	3	AB	\N
200685	تَقلید کَردَن	verb	\N	\N	3	AB	\N
200686	تَقویم	noun	\N	\N	3	AB	\N
200687	تِکرار کَردَن	verb	\N	\N	3	AB	\N
200688	تَک‌فَرزَند	noun	\N	\N	3	AB	\N
200689	تَکلیف	noun	\N	\N	3	AB	\N
200690	تِکنیک	noun	\N	\N	3	AB	\N
200691	تِکّه	noun	\N	\N	3	AB	\N
200692	تَلَفُّظ	noun	\N	\N	3	AB	\N
200693	تِلِفُن	noun	\N	\N	3	AB	\N
200694	تِلِکابین	noun	\N	\N	3	AB	\N
200695	تِلِویزیون	noun	\N	\N	3	AB	\N
200696	تماشا کَردَن	verb	\N	\N	3	AB	\N
200697	تَمرین	noun	\N	\N	3	AB	\N
200698	تَمـیز	adjective	\N	\N	3	AB	\N
200699	تَمـیز کَردَن	verb	\N	\N	3	AB	\N
200700	تَنها	adjective	\N	\N	3	AB	\N
200701	تَنها / فَقَط	adverb	\N	\N	3	AB	\N
200702	تُو	pronoun	\N	\N	3	AB	\N
200703	تَوانایی	noun	\N	\N	3	AB	\N
200704	تَوانِستَن	verb	\N	\N	3	AB	\N
200705	توپ	noun	\N	\N	3	AB	\N
200706	تَوَجُّه	noun	\N	\N	3	AB	\N
200707	توسی	adjective	\N	\N	3	AB	\N
200708	تَوصیف	noun	\N	\N	3	AB	\N
200709	تَوصیف کَردَن	verb	\N	\N	3	AB	\N
200710	تَوصیه کَردَن	verb	\N	\N	3	AB	\N
200711	طوفان (توفان)	noun	\N	\N	3	AB	\N
200712	تَوَلُّد	noun	\N	\N	3	AB	\N
200713	تُومان	noun	\N	\N	3	AB	\N
200714	تویِ	preposition	\N	\N	3	AB	\N
200715	تَهیِه کَردَن	verb	\N	\N	3	AB	\N
200716	تیر	noun	\N	\N	3	AB	\N
200717	تی‌شِرت	noun	\N	\N	3	AB	\N
200718	ثانیِه	noun	\N	\N	3	AB	\N
200719	جاروبرقی	noun	\N	\N	3	AB	\N
200720	جاروکِشیدَن	verb	\N	\N	3	AB	\N
200721	جالِب	adjective	\N	\N	3	AB	\N
200722	جامِدادی	noun	\N	\N	3	AB	\N
200723	جاندار	adjective	\N	\N	3	AB	\N
200724	جایِ خالی	noun	\N	\N	3	AB	\N
200725	جُدا	adjective	\N	\N	3	AB	\N
200726	جِدّاً	adverb	\N	\N	3	AB	\N
200727	جُدا کَردَن	verb	\N	\N	3	AB	\N
200728	جَدول	noun	\N	\N	3	AB	\N
200729	جَدید	adjective	\N	\N	3	AB	\N
200730	جَزایِر	noun	\N	\N	3	AB	\N
200731	جِسم	noun	\N	\N	3	AB	\N
200732	جَعبه	noun	\N	\N	3	AB	\N
200733	جُفت	noun	\N	\N	3	AB	\N
200734	جِلویِ	preposition	\N	\N	3	AB	\N
200735	جَمع	noun	\N	\N	3	AB	\N
200736	جَمع کَردَن	verb	\N	\N	3	AB	\N
200737	جَمع‌بَستَن	verb	\N	\N	3	AB	\N
200738	جُمعِه	noun	\N	\N	3	AB	\N
200739	جَمعیَّت	noun	\N	\N	3	AB	\N
200740	جُملِه	noun	\N	\N	3	AB	\N
200741	جَنگَل	noun	\N	\N	3	AB	\N
200742	جَنوب	noun	\N	\N	3	AB	\N
200743	جَواب	noun	\N	\N	3	AB	\N
200744	جَوان	adjective	\N	\N	3	AB	\N
200745	جوجه	noun	\N	\N	3	AB	\N
200746	جوراب	noun	\N	\N	3	AB	\N
200747	جَهان	noun	\N	\N	3	AB	\N
200748	جَهانی	adjective	\N	\N	3	AB	\N
200749	جِهَت	noun	\N	\N	3	AB	\N
200750	جِیب	noun	\N	\N	3	AB	\N
200751	جین	noun	\N	\N	3	AB	\N
200752	چادُرزَدَن	verb	\N	\N	3	AB	\N
200753	چاق	adjective	\N	\N	3	AB	\N
200754	چای	noun	\N	\N	3	AB	\N
200755	چَتر	noun	\N	\N	3	AB	\N
200756	چِراغ	noun	\N	\N	3	AB	\N
200757	چُرت‌زَدَن	verb	\N	\N	3	AB	\N
200758	چَشم	noun	\N	\N	3	AB	\N
200759	چَشم‌پِزِشکی	noun	\N	\N	3	AB	\N
200760	چِطور	adverb	\N	\N	3	AB	\N
200761	چِقَدر	adverb	\N	\N	3	AB	\N
200762	چِک‌کَردَن	verb	\N	\N	3	AB	\N
200763	چِگونه	adverb	\N	\N	3	AB	\N
200764	چوب	noun	\N	\N	3	AB	\N
200765	چوبی	adjective	\N	\N	3	AB	\N
200766	چه/ چی	pronoun	\N	\N	3	AB	\N
200767	چَهار	number	\N	\N	3	AB	\N
200768	چَهارراه	noun	\N	\N	3	AB	\N
200769	چَهارشَنبِه	noun	\N	\N	3	AB	\N
200770	چَهارُم	adjective	\N	\N	3	AB	\N
200771	چیدَن	verb	\N	\N	3	AB	\N
200772	چیز	noun	\N	\N	3	AB	\N
200773	حالا	adverb	\N	\N	3	AB	\N
200774	حَتماً	adverb	\N	\N	3	AB	\N
200775	حَدس	noun	\N	\N	3	AB	\N
200776	حَدس‌زَدَن	verb	\N	\N	3	AB	\N
200777	حُدود	adverb	\N	\N	3	AB	\N
200778	حَرف	noun	\N	\N	3	AB	\N
200779	حَرفِ اِضافه	noun	\N	\N	3	AB	\N
200780	حَرف‌زَدَن با	verb	\N	\N	3	AB	\N
200781	حِسابدار	noun	\N	\N	3	AB	\N
200782	حَسّاس	adjective	\N	\N	3	AB	\N
200783	حَشَره	noun	\N	\N	3	AB	\N
200784	حُکومت	noun	\N	\N	3	AB	\N
200785	حَمّام	noun	\N	\N	3	AB	\N
200786	حوله	noun	\N	\N	3	AB	\N
200787	حَیاط	noun	\N	\N	3	AB	\N
200788	خارِج	noun	\N	\N	3	AB	\N
200789	خارِجی	adjective	\N	\N	3	AB	\N
200790	خاص	adjective	\N	\N	3	AB	\N
200791	خاله	noun	\N	\N	3	AB	\N
200792	خالی	adjective	\N	\N	3	AB	\N
200793	خانُم	noun	\N	\N	3	AB	\N
200794	خانِوادِگی	adjective	\N	\N	3	AB	\N
200795	خانِواده	noun	\N	\N	3	AB	\N
200796	خانه	noun	\N	\N	3	AB	\N
200797	خانه‌دار	noun	\N	\N	3	AB	\N
200798	خانه‌داری	noun	\N	\N	3	AB	\N
200799	خاورمیانِه	noun	\N	\N	3	AB	\N
200800	خُب	adverb	\N	\N	3	AB	\N
200801	خَبَرنگار	noun	\N	\N	3	AB	\N
200802	خُدا رو شُکر	phrase	\N	\N	3	AB	\N
200803	خُداحافظ	phrase	\N	\N	3	AB	\N
200804	خُرداد	noun	\N	\N	3	AB	\N
200805	خَرید	noun	\N	\N	3	AB	\N
200806	خَریدار	noun	\N	\N	3	AB	\N
200807	خَرید کَردَن	verb	\N	\N	3	AB	\N
200808	خَریدَن	verb	\N	\N	3	AB	\N
200809	خَستِگی	noun	\N	\N	3	AB	\N
200810	خَسته	adjective	\N	\N	3	AB	\N
200811	خَسته‌کُننده	adjective	\N	\N	3	AB	\N
200812	خَط	noun	\N	\N	3	AB	\N
200813	خَط کِشیدَن	verb	\N	\N	3	AB	\N
200814	خَطَرناک	adjective	\N	\N	3	AB	\N
200815	خَط‌کِش	noun	\N	\N	3	AB	\N
200816	خَلَبان	noun	\N	\N	3	AB	\N
200817	خَلوَت	adjective	\N	\N	3	AB	\N
200818	خَمیردَندان	noun	\N	\N	3	AB	\N
200819	خَنیدَن به	verb	\N	\N	3	AB	\N
200820	خُنَک	adjective	\N	\N	3	AB	\N
200821	خواب	noun	\N	\N	3	AB	\N
200822	خوابگاه	noun	\N	\N	3	AB	\N
200823	خوابیدَن	verb	\N	\N	3	AB	\N
200824	خواستَن	verb	\N	\N	3	AB	\N
200825	خواستَن (درخواست)	verb	\N	\N	3	AB	\N
200826	خواندَن	verb	\N	\N	3	AB	\N
200827	خواننده	noun	\N	\N	3	AB	\N
200828	خواهر	noun	\N	\N	3	AB	\N
200829	خواهِش می‌کُنم	phrase	\N	\N	3	AB	\N
200830	خوب (صِفَت)	adjective	\N	\N	3	AB	\N
200831	خوب (قِید)	adverb	\N	\N	3	AB	\N
200832	خود	pronoun	\N	\N	3	AB	\N
200833	خودرو	noun	\N	\N	3	AB	\N
200834	خودکار	noun	\N	\N	3	AB	\N
200835	خوراکی	noun	\N	\N	3	AB	\N
200836	خورشید	noun	\N	\N	3	AB	\N
200837	خورشیدی	adjective	\N	\N	3	AB	\N
200838	خوش آمَدید!	phrase	\N	\N	3	AB	\N
200839	خوشحال	adjective	\N	\N	3	AB	\N
200840	خوشمزه	adjective	\N	\N	3	AB	\N
200841	خیابان	noun	\N	\N	3	AB	\N
200842	خیاطی	noun	\N	\N	3	AB	\N
200843	دَر	noun	\N	\N	3	AB	\N
200844	دَه	number	\N	\N	3	AB	\N
200845	داخِل	noun	\N	\N	3	AB	\N
200846	دادَن	verb	\N	\N	3	AB	\N
200847	داشتَن	verb	\N	\N	3	AB	\N
200848	دامَن	noun	\N	\N	3	AB	\N
200849	دانِستَن	verb	\N	\N	3	AB	\N
200850	دانش‌آموز	noun	\N	\N	3	AB	\N
200851	دانشجو	noun	\N	\N	3	AB	\N
200852	دانشکده	noun	\N	\N	3	AB	\N
200853	دانشگاه	noun	\N	\N	3	AB	\N
200854	دایی	noun	\N	\N	3	AB	\N
200855	دبیرستان	noun	\N	\N	3	AB	\N
200856	دُختَر	noun	\N	\N	3	AB	\N
200857	دُختَر (فرزند)	noun	\N	\N	3	AB	\N
200858	در پایانِ ...	preposition	\N	\N	3	AB	\N
200859	در خانه ماندَن	verb	\N	\N	3	AB	\N
200860	در موردِ	preposition	\N	\N	3	AB	\N
200861	دَرآمَد	noun	\N	\N	3	AB	\N
200862	دَرباره	preposition	\N	\N	3	AB	\N
200863	دَرخت	noun	\N	\N	3	AB	\N
200864	دَرس	noun	\N	\N	3	AB	\N
200865	دُرُست	adjective	\N	\N	3	AB	\N
200866	دُرُست کَردَن	verb	\N	\N	3	AB	\N
200867	دَرس خواندَن	verb	\N	\N	3	AB	\N
200868	دَرس دادَن	verb	\N	\N	3	AB	\N
200869	دَرکِ مَطلَب	noun	\N	\N	3	AB	\N
200870	دَرون	preposition	\N	\N	3	AB	\N
200871	دَریا	noun	\N	\N	3	AB	\N
200872	دَست	noun	\N	\N	3	AB	\N
200873	دَست زَدَن به	verb	\N	\N	3	AB	\N
200874	دَست زَدَن برای	verb	\N	\N	3	AB	\N
200875	دَستکِش	noun	\N	\N	3	AB	\N
200876	دَستمال	noun	\N	\N	3	AB	\N
200877	دَسته	noun	\N	\N	3	AB	\N
200878	دَسته‌بَندی	noun	\N	\N	3	AB	\N
200879	دَشت	noun	\N	\N	3	AB	\N
200880	دَفتَر	noun	\N	\N	3	AB	\N
200881	دَفتَرچه	noun	\N	\N	3	AB	\N
200882	دَفتَرِ کار	noun	\N	\N	3	AB	\N
200883	دقیقاً	adverb	\N	\N	3	AB	\N
200884	دقیقه	noun	\N	\N	3	AB	\N
200885	دُکتُر	noun	\N	\N	3	AB	\N
200886	دُنیا	noun	\N	\N	3	AB	\N
200887	دو	number	\N	\N	3	AB	\N
200888	دوباره	adverb	\N	\N	3	AB	\N
200889	دوچَرخه	noun	\N	\N	3	AB	\N
200890	دوچَرخه‌سَواری	noun	\N	\N	3	AB	\N
200891	دور اَز	preposition	\N	\N	3	AB	\N
200892	دور اَنداختَن	verb	\N	\N	3	AB	\N
200893	دور ریختَن	verb	\N	\N	3	AB	\N
200894	دورِ چیزی خَط کِشیدَن	verb	\N	\N	3	AB	\N
200895	دوست	noun	\N	\N	3	AB	\N
200896	دوستانه	adjective	\N	\N	3	AB	\N
200897	دوست داشتَن	verb	\N	\N	3	AB	\N
200898	دوش	noun	\N	\N	3	AB	\N
200899	دوش گِرِفتَن	verb	\N	\N	3	AB	\N
200900	دوشَنبه	noun	\N	\N	3	AB	\N
200901	دوقُلو	noun	\N	\N	3	AB	\N
200902	دُوُم	adjective	\N	\N	3	AB	\N
200903	دونَفره	adjective	\N	\N	3	AB	\N
200904	دوییدَن	verb	\N	\N	3	AB	\N
200905	دی	noun	\N	\N	3	AB	\N
200906	دیدَن	verb	\N	\N	3	AB	\N
200907	دیر رَسیدَن	verb	\N	\N	3	AB	\N
200908	دیس	noun	\N	\N	3	AB	\N
200909	دیگر	adjective	\N	\N	3	AB	\N
200910	دیگری	pronoun	\N	\N	3	AB	\N
200911	دیوار	noun	\N	\N	3	AB	\N
200912	ذَخیره کَردَن	verb	\N	\N	3	AB	\N
200913	راحَت	adjective	\N	\N	3	AB	\N
200914	راستی	adverb	\N	\N	3	AB	\N
200915	راضی	adjective	\N	\N	3	AB	\N
200916	رانَندگی	noun	\N	\N	3	AB	\N
200917	رانَندگی کَردَن	verb	\N	\N	3	AB	\N
200918	راننده	noun	\N	\N	3	AB	\N
200919	راه‌آهَن	noun	\N	\N	3	AB	\N
200920	راهنما	noun	\N	\N	3	AB	\N
200921	رُبع	noun	\N	\N	3	AB	\N
200922	رَختِخواب	noun	\N	\N	3	AB	\N
200923	رِستوران	noun	\N	\N	3	AB	\N
200924	رَسمی	adjective	\N	\N	3	AB	\N
200925	رَسیدَن	verb	\N	\N	3	AB	\N
200926	رِشته	noun	\N	\N	3	AB	\N
200927	رَفتَن	verb	\N	\N	3	AB	\N
200928	رَفت‌وآمَد	noun	\N	\N	3	AB	\N
200929	رِکورد	noun	\N	\N	3	AB	\N
200930	رَنگ	noun	\N	\N	3	AB	\N
200931	روان‌شِناسی	noun	\N	\N	3	AB	\N
200932	روبه‌رویِ	preposition	\N	\N	3	AB	\N
200933	روز	noun	\N	\N	3	AB	\N
200934	روزانه	adjective	\N	\N	3	AB	\N
200935	روزنامه	noun	\N	\N	3	AB	\N
200936	روستا	noun	\N	\N	3	AB	\N
200937	روسَری	noun	\N	\N	3	AB	\N
200938	روشَن	adjective	\N	\N	3	AB	\N
200939	رویِ	preposition	\N	\N	3	AB	\N
200940	رویداد	noun	\N	\N	3	AB	\N
200941	ریاضی	noun	\N	\N	3	AB	\N
200942	ریشه	noun	\N	\N	3	AB	\N
200943	زُباله	noun	\N	\N	3	AB	\N
200944	زَبان	noun	\N	\N	3	AB	\N
200945	زَبانِ فارسی	noun	\N	\N	3	AB	\N
200946	زَبانِ گُفتار	noun	\N	\N	3	AB	\N
200947	زَبانِ مادری	noun	\N	\N	3	AB	\N
200948	زِبِر	adjective	\N	\N	3	AB	\N
200949	زَرد	adjective	\N	\N	3	AB	\N
200950	زِشت	adjective	\N	\N	3	AB	\N
200951	زَمان	noun	\N	\N	3	AB	\N
200952	زِمِستان	noun	\N	\N	3	AB	\N
200953	زَمـین	noun	\N	\N	3	AB	\N
200954	زَن	noun	\N	\N	3	AB	\N
200955	زَنبورِعَسَل	noun	\N	\N	3	AB	\N
200956	زِندگی	noun	\N	\N	3	AB	\N
200957	زِندگی کَردَن	verb	\N	\N	3	AB	\N
200958	زِنده مـاندَن	verb	\N	\N	3	AB	\N
200959	زَنگ زَدَن	verb	\N	\N	3	AB	\N
200960	زَنگ (ساعَت)	noun	\N	\N	3	AB	\N
200961	زود (صِفَت)	adjective	\N	\N	3	AB	\N
200962	زود (قِید)	adverb	\N	\N	3	AB	\N
200963	زیبا	adjective	\N	\N	3	AB	\N
200964	زیر	preposition	\N	\N	3	AB	\N
200965	زیرپایی	noun	\N	\N	3	AB	\N
200966	زیرِچیزی‌خَط کِشیدَن	verb	\N	\N	3	AB	\N
200967	زیستگاه	noun	\N	\N	3	AB	\N
200968	ژاکِت	noun	\N	\N	3	AB	\N
200969	سُؤال	noun	\N	\N	3	AB	\N
200970	ساخْتِمان	noun	\N	\N	3	AB	\N
200971	ساخْتَن	verb	\N	\N	3	AB	\N
200972	ساعَت	noun	\N	\N	3	AB	\N
200973	ساعَت دیواری	noun	\N	\N	3	AB	\N
200974	ساعَت مُچی	noun	\N	\N	3	AB	\N
200975	ساکِنان	noun	\N	\N	3	AB	\N
200976	سال	noun	\N	\N	3	AB	\N
200977	سالُنِ وَرزِشی	noun	\N	\N	3	AB	\N
200978	سایز	noun	\N	\N	3	AB	\N
200979	سایه	noun	\N	\N	3	AB	\N
200980	سایه‌اَنداخْتَن رویِ	verb	\N	\N	3	AB	\N
200981	سَبز	adjective	\N	\N	3	AB	\N
200982	سَبزه	noun	\N	\N	3	AB	\N
200983	سَبزی	noun	\N	\N	3	AB	\N
200984	سَبُک	adjective	\N	\N	3	AB	\N
200985	سِپَس	adverb	\N	\N	3	AB	\N
200986	سُتون	noun	\N	\N	3	AB	\N
200987	سَخت	adjective	\N	\N	3	AB	\N
200988	سَرد	adjective	\N	\N	3	AB	\N
200989	سَرزِنده	adjective	\N	\N	3	AB	\N
200990	سَرگَرمی	noun	\N	\N	3	AB	\N
200991	سُرمِه‌ای	adjective	\N	\N	3	AB	\N
200992	سَر‌وصِدا	noun	\N	\N	3	AB	\N
200993	سِرویس	noun	\N	\N	3	AB	\N
200994	سَریع	adjective	\N	\N	3	AB	\N
200995	سِشوار	noun	\N	\N	3	AB	\N
200996	سَطْل	noun	\N	\N	3	AB	\N
200997	سَفَر	noun	\N	\N	3	AB	\N
200998	سَفید	adjective	\N	\N	3	AB	\N
200999	سَفید‌پوسْت	adjective	\N	\N	3	AB	\N
201000	سِکّه	noun	\N	\N	3	AB	\N
201001	سَلام	noun	\N	\N	3	AB	\N
201002	سَلامَت	noun	\N	\N	3	AB	\N
201003	سِن	noun	\N	\N	3	AB	\N
201004	سَنتور	noun	\N	\N	3	AB	\N
201005	سَنگین	adjective	\N	\N	3	AB	\N
201006	سَوارشُدَن	verb	\N	\N	3	AB	\N
201007	سوپ	noun	\N	\N	3	AB	\N
201008	سوپِرمارکِت	noun	\N	\N	3	AB	\N
201009	سوراخ	noun	\N	\N	3	AB	\N
201010	سوغاتی	noun	\N	\N	3	AB	\N
201011	سِوُّم	adjective	\N	\N	3	AB	\N
201012	سونا	noun	\N	\N	3	AB	\N
201013	سه	number	\N	\N	3	AB	\N
201014	سه‌شَنبه	noun	\N	\N	3	AB	\N
201015	سیاه	adjective	\N	\N	3	AB	\N
201016	سیب	noun	\N	\N	3	AB	\N
201017	سیب‌زَمـینی	noun	\N	\N	3	AB	\N
201018	سی‌دی	noun	\N	\N	3	AB	\N
201019	سیگارکِشیدَن	verb	\N	\N	3	AB	\N
201020	سینِما	noun	\N	\N	3	AB	\N
201021	شَدید	adjective	\N	\N	3	AB	\N
201022	شاد	adjective	\N	\N	3	AB	\N
201023	شاگِرد(وَردَسْت)	noun	\N	\N	3	AB	\N
201024	شال	noun	\N	\N	3	AB	\N
201025	شالِ گَردَن	noun	\N	\N	3	AB	\N
201026	شام	noun	\N	\N	3	AB	\N
201027	شام‌خوردَن	verb	\N	\N	3	AB	\N
201028	شَب	noun	\N	\N	3	AB	\N
201029	شَبَکه	noun	\N	\N	3	AB	\N
201030	شَبیه	adjective	\N	\N	3	AB	\N
201031	شُدَن	verb	\N	\N	3	AB	\N
201032	شَرجی	adjective	\N	\N	3	AB	\N
201033	شَرق	noun	\N	\N	3	AB	\N
201034	شِرکَت	noun	\N	\N	3	AB	\N
201035	شِرکَت کَردَن	verb	\N	\N	3	AB	\N
201036	شُروع	noun	\N	\N	3	AB	\N
201037	شُروع‌شُدَن	verb	\N	\N	3	AB	\N
201038	شُستَشو	noun	\N	\N	3	AB	\N
201039	شُستَن	verb	\N	\N	3	AB	\N
201040	شِش	number	\N	\N	3	AB	\N
201041	شِعر	noun	\N	\N	3	AB	\N
201042	شُغل	noun	\N	\N	3	AB	\N
201043	شِکَر	noun	\N	\N	3	AB	\N
201044	شِکل	noun	\N	\N	3	AB	\N
201045	شُکُلات	noun	\N	\N	3	AB	\N
201046	شَلْوار	noun	\N	\N	3	AB	\N
201047	شُلوغ	adjective	\N	\N	3	AB	\N
201048	شُما	pronoun	\N	\N	3	AB	\N
201049	شُمارِش	noun	\N	\N	3	AB	\N
201050	شُماره	noun	\N	\N	3	AB	\N
201051	شُمال	noun	\N	\N	3	AB	\N
201052	شِمُردَن	verb	\N	\N	3	AB	\N
201053	شَمسی	adjective	\N	\N	3	AB	\N
201054	شَن	noun	\N	\N	3	AB	\N
201055	شِناخْتَن	verb	\N	\N	3	AB	\N
201056	شِناسه	noun	\N	\N	3	AB	\N
201057	شَنبه	noun	\N	\N	3	AB	\N
201058	شِنیدَن	verb	\N	\N	3	AB	\N
201059	شوهَر	noun	\N	\N	3	AB	\N
201060	شَهْر	noun	\N	\N	3	AB	\N
201061	شَهْریوَر	noun	\N	\N	3	AB	\N
201062	شیر(نوشیدنی)	noun	\N	\N	3	AB	\N
201063	شیمیایی	adjective	\N	\N	3	AB	\N
201064	صاف	adjective	\N	\N	3	AB	\N
201065	صُبْح	noun	\N	\N	3	AB	\N
201066	صُبْحانه‌خوردَن	verb	\N	\N	3	AB	\N
201067	صَبْرکَردَن	verb	\N	\N	3	AB	\N
201068	صُحْبَت	noun	\N	\N	3	AB	\N
201069	صُحْبَت کَردَن	verb	\N	\N	3	AB	\N
201070	صَد	number	\N	\N	3	AB	\N
201071	صِدا	noun	\N	\N	3	AB	\N
201072	صِفَت	noun	\N	\N	3	AB	\N
201073	صِفَتِ بَرتَر	noun	\N	\N	3	AB	\N
201074	صِفَتِ بَرتَرین	noun	\N	\N	3	AB	\N
201075	صَفْحه	noun	\N	\N	3	AB	\N
201076	صَنْدَلی	noun	\N	\N	3	AB	\N
201077	صورَت	noun	\N	\N	3	AB	\N
201078	صورَتی	adjective	\N	\N	3	AB	\N
201079	ضَرَر داشتَن بَرایِ	verb	\N	\N	3	AB	\N
201080	ضَعیف(نورِضَعیف)	adjective	\N	\N	3	AB	\N
201081	ضَمیرِاِشاره	noun	\N	\N	3	AB	\N
201082	ضَمیرِفاعِلی	noun	\N	\N	3	AB	\N
201083	طِبْقِ	preposition	\N	\N	3	AB	\N
201084	طَبَقه	noun	\N	\N	3	AB	\N
201085	طَبیعَت	noun	\N	\N	3	AB	\N
201086	طُلوع	noun	\N	\N	3	AB	\N
201087	طول	noun	\N	\N	3	AB	\N
201088	ظَرف	noun	\N	\N	3	AB	\N
201089	ظُهْر	noun	\N	\N	3	AB	\N
201090	عادَت	noun	\N	\N	3	AB	\N
201091	عِبارَت	noun	\N	\N	3	AB	\N
201092	عُبور	noun	\N	\N	3	AB	\N
201093	عَجَله	noun	\N	\N	3	AB	\N
201094	عَدَد	noun	\N	\N	3	AB	\N
201095	عَرْض	noun	\N	\N	3	AB	\N
201096	عَروسَک	noun	\N	\N	3	AB	\N
201097	عَروسی	noun	\N	\N	3	AB	\N
201098	عِشْق	noun	\N	\N	3	AB	\N
201099	عَصَبانی	adjective	\N	\N	3	AB	\N
201100	عَصْرانه	noun	\N	\N	3	AB	\N
201101	عُضْو	noun	\N	\N	3	AB	\N
201102	عَکْس	noun	\N	\N	3	AB	\N
201103	عَلاقه	noun	\N	\N	3	AB	\N
201104	علاقه‌مَنْد	adjective	\N	\N	3	AB	\N
201105	عَلامَت	noun	\N	\N	3	AB	\N
201106	عَلامَت‌زَدَن	verb	\N	\N	3	AB	\N
201107	عُمْر کَردَن	verb	\N	\N	3	AB	\N
201108	عَمـو	noun	\N	\N	3	AB	\N
201109	عَمّه	noun	\N	\N	3	AB	\N
201110	عُنْوان	noun	\N	\N	3	AB	\N
201111	عِینَک	noun	\N	\N	3	AB	\N
201112	عِینَکِ آفتابی	noun	\N	\N	3	AB	\N
201113	غِذا	noun	\N	\N	3	AB	\N
201114	غَرْب	noun	\N	\N	3	AB	\N
201115	غُروب	noun	\N	\N	3	AB	\N
201116	غَریبه	noun	\N	\N	3	AB	\N
201117	غِیر اَز	preposition	\N	\N	3	AB	\N
201118	فِر(مویِ فِر)	noun	\N	\N	3	AB	\N
201119	فَراغَت	noun	\N	\N	3	AB	\N
201120	فَرد	noun	\N	\N	3	AB	\N
201121	فَردا	noun	\N	\N	3	AB	\N
201122	فَرْزَنْد	noun	\N	\N	3	AB	\N
201123	فَرْش	noun	\N	\N	3	AB	\N
201124	فُرصَت	noun	\N	\N	3	AB	\N
201125	فَرْض کَردَن	verb	\N	\N	3	AB	\N
201126	فَرْق	noun	\N	\N	3	AB	\N
201127	فُروخْتَن	verb	\N	\N	3	AB	\N
201128	فُرودگاه	noun	\N	\N	3	AB	\N
201129	فَرْوَرْدین	noun	\N	\N	3	AB	\N
201130	فُروشگاه	noun	\N	\N	3	AB	\N
201131	فُروشَنْده	noun	\N	\N	3	AB	\N
201132	فَرْهَنْگ	noun	\N	\N	3	AB	\N
201133	فَصْل	noun	\N	\N	3	AB	\N
201134	فَعالیَّت	noun	\N	\N	3	AB	\N
201135	فِعْل	noun	\N	\N	3	AB	\N
201136	فِعْلِ اَمْر	noun	\N	\N	3	AB	\N
201137	فَقَط	adverb	\N	\N	3	AB	\N
201138	فِکْر کَردَن	verb	\N	\N	3	AB	\N
201139	فِلفِل	noun	\N	\N	3	AB	\N
201140	فِلفِل‌دُلمه‌ای	noun	\N	\N	3	AB	\N
201141	فِنجان	noun	\N	\N	3	AB	\N
201142	فوریه	noun	\N	\N	3	AB	\N
201143	فِهْرِست کَردَن	verb	\N	\N	3	AB	\N
201144	فیزیک	noun	\N	\N	3	AB	\N
201145	قارِه	noun	\N	\N	3	AB	\N
201146	قاضی	noun	\N	\N	3	AB	\N
201147	قاعدِه	noun	\N	\N	3	AB	\N
201148	قَبْل	adjective	\N	\N	3	AB	\N
201149	قَبْل اَز	preposition	\N	\N	3	AB	\N
201150	قَد	noun	\N	\N	3	AB	\N
201151	قَدبُلَند	adjective	\N	\N	3	AB	\N
201152	قَدکوتاه	adjective	\N	\N	3	AB	\N
201153	قَدَم	noun	\N	\N	3	AB	\N
201154	قَدَم‌زَدَن	verb	\N	\N	3	AB	\N
201155	قَدیمـی	adjective	\N	\N	3	AB	\N
201156	قَرار دادَن	verb	\N	\N	3	AB	\N
201157	قَرار داشتَن	verb	\N	\N	3	AB	\N
201158	قَرار گِرِفتَن	verb	\N	\N	3	AB	\N
201159	قِرمِز	adjective	\N	\N	3	AB	\N
201160	قِطار	noun	\N	\N	3	AB	\N
201161	قَفَس	noun	\N	\N	3	AB	\N
201162	قَفَسه	noun	\N	\N	3	AB	\N
201163	قَول‌دادَن	verb	\N	\N	3	AB	\N
201164	قَهوه	noun	\N	\N	3	AB	\N
201165	قهوه‌ای	adjective	\N	\N	3	AB	\N
201166	قِید	noun	\N	\N	3	AB	\N
201167	قیمَت	noun	\N	\N	3	AB	\N
201168	کَرِه	noun	\N	\N	3	AB	\N
201169	کِرِم	noun	\N	\N	3	AB	\N
201170	کِرْم	noun	\N	\N	3	AB	\N
201171	کِشو	noun	\N	\N	3	AB	\N
201172	کابینِت	noun	\N	\N	3	AB	\N
201173	کار	noun	\N	\N	3	AB	\N
201174	کارت	noun	\N	\N	3	AB	\N
201175	کارتِ ویزیت	noun	\N	\N	3	AB	\N
201176	کارخانه	noun	\N	\N	3	AB	\N
201177	کارشِناس	noun	\N	\N	3	AB	\N
201178	کارکَردَن	verb	\N	\N	3	AB	\N
201179	کارگَر	noun	\N	\N	3	AB	\N
201180	کارمَنْد	noun	\N	\N	3	AB	\N
201181	کارهایِ خانه	noun	\N	\N	3	AB	\N
201182	کافه	noun	\N	\N	3	AB	\N
201183	کافی شاپ	noun	\N	\N	3	AB	\N
201184	کامپیوتر	noun	\N	\N	3	AB	\N
201185	کامِل	adjective	\N	\N	3	AB	\N
201186	کامِل کَردَن	verb	\N	\N	3	AB	\N
201187	کُت	noun	\N	\N	3	AB	\N
201188	کِتاب	noun	\N	\N	3	AB	\N
201189	کِتاب‌فُروشی	noun	\N	\N	3	AB	\N
201190	کَتانی	noun	\N	\N	3	AB	\N
201191	کَثیف	adjective	\N	\N	3	AB	\N
201192	کُجا	adverb	\N	\N	3	AB	\N
201193	کُد	noun	\N	\N	3	AB	\N
201194	کُدام/که	pronoun	\N	\N	3	AB	\N
201195	کُدام‌یِک	pronoun	\N	\N	3	AB	\N
201196	کِشتی	noun	\N	\N	3	AB	\N
201197	کَشْف	noun	\N	\N	3	AB	\N
201198	کِشوَر	noun	\N	\N	3	AB	\N
201199	کَفْش	noun	\N	\N	3	AB	\N
201200	کِلاس	noun	\N	\N	3	AB	\N
201201	کُلاه	noun	\N	\N	3	AB	\N
201202	کُلاهِ آفتابی	noun	\N	\N	3	AB	\N
201203	کِلید	noun	\N	\N	3	AB	\N
201204	کَم	adjective	\N	\N	3	AB	\N
201205	کُمُد	noun	\N	\N	3	AB	\N
201206	کَمَربَند	noun	\N	\N	3	AB	\N
201207	کُمُک	noun	\N	\N	3	AB	\N
201208	کَمـی	adverb	\N	\N	3	AB	\N
201209	کِنار	preposition	\N	\N	3	AB	\N
201210	کَندو	noun	\N	\N	3	AB	\N
201211	کوتاه	adjective	\N	\N	3	AB	\N
201212	کوچَک	adjective	\N	\N	3	AB	\N
201213	کودَک	noun	\N	\N	3	AB	\N
201214	کوک‌کَردَن(ساعَت)	verb	\N	\N	3	AB	\N
201215	کوله‌پُشتی	noun	\N	\N	3	AB	\N
201216	کَویر	noun	\N	\N	3	AB	\N
201217	کُهنه	adjective	\N	\N	3	AB	\N
201218	کیف	noun	\N	\N	3	AB	\N
201219	کیفِ پول	noun	\N	\N	3	AB	\N
201220	کِیک	noun	\N	\N	3	AB	\N
201221	کیلو	noun	\N	\N	3	AB	\N
201222	کیلومِتر	noun	\N	\N	3	AB	\N
201223	کیوی	noun	\N	\N	3	AB	\N
201224	گَرْم	adjective	\N	\N	3	AB	\N
201225	گُل	noun	\N	\N	3	AB	\N
201226	گَرَم	noun	\N	\N	3	AB	\N
201227	گُذَرگاه	noun	\N	\N	3	AB	\N
201228	گِران	adjective	\N	\N	3	AB	\N
201229	گَرد و غُبار	noun	\N	\N	3	AB	\N
201230	گَردگیری	noun	\N	\N	3	AB	\N
201231	گَردگیری کَردَن	verb	\N	\N	3	AB	\N
201232	گَردَن	noun	\N	\N	3	AB	\N
201233	گِرِفتَن	verb	\N	\N	3	AB	\N
201234	گَرْم کَردَن	verb	\N	\N	3	AB	\N
201235	گُروه	noun	\N	\N	3	AB	\N
201236	گُزینه	noun	\N	\N	3	AB	\N
201237	گُفتاری	adjective	\N	\N	3	AB	\N
201238	گُفتُگو	noun	\N	\N	3	AB	\N
201239	گُفتُگوکَردَن	verb	\N	\N	3	AB	\N
201240	گُفتَن	verb	\N	\N	3	AB	\N
201241	گُلدان	noun	\N	\N	3	AB	\N
201242	گَلودَرد	noun	\N	\N	3	AB	\N
201243	گُم‌شُدَن	verb	\N	\N	3	AB	\N
201244	گوجه‌فَرَنگی	noun	\N	\N	3	AB	\N
201245	گوش	noun	\N	\N	3	AB	\N
201246	گوش‌دادَن	verb	\N	\N	3	AB	\N
201247	گوش‌کَردَن	verb	\N	\N	3	AB	\N
201248	گوشی	noun	\N	\N	3	AB	\N
201249	گیتار	noun	\N	\N	3	AB	\N
201250	گیج	adjective	\N	\N	3	AB	\N
201251	گیلاس	noun	\N	\N	3	AB	\N
201252	گینِس	noun	\N	\N	3	AB	\N
201253	لاغَر	adjective	\N	\N	3	AB	\N
201254	لامپ	noun	\N	\N	3	AB	\N
201255	لانه	noun	\N	\N	3	AB	\N
201256	لِباس	noun	\N	\N	3	AB	\N
201257	لَبَنیات	noun	\N	\N	3	AB	\N
201258	لَپ‌تاپ	noun	\N	\N	3	AB	\N
201259	لُطْفاً	adverb	\N	\N	3	AB	\N
201260	لیوان	noun	\N	\N	3	AB	\N
201261	مُؤدَبانه	adverb	\N	\N	3	AB	\N
201262	مُؤسَسۀ‌تَحقـیقاتی	noun	\N	\N	3	AB	\N
201263	مادَر	noun	\N	\N	3	AB	\N
201264	مادَربُزُرگ	noun	\N	\N	3	AB	\N
201265	مادّه	noun	\N	\N	3	AB	\N
201266	ماژیک	noun	\N	\N	3	AB	\N
201267	ماست	noun	\N	\N	3	AB	\N
201268	ماشین	noun	\N	\N	3	AB	\N
201269	مالِ کِسی بودَن	verb	\N	\N	3	AB	\N
201270	مالِکیَّت	noun	\N	\N	3	AB	\N
201271	مالیدَن	verb	\N	\N	3	AB	\N
201272	مامان	noun	\N	\N	3	AB	\N
201273	مانتو	noun	\N	\N	3	AB	\N
201274	مانندِ	preposition	\N	\N	3	AB	\N
201275	ماه	noun	\N	\N	3	AB	\N
201276	مبل	noun	\N	\N	3	AB	\N
201277	متأهل	adjective	\N	\N	3	AB	\N
201278	متر	noun	\N	\N	3	AB	\N
201279	مترجم	noun	\N	\N	3	AB	\N
201280	مترو	noun	\N	\N	3	AB	\N
201281	متشکرم	phrase	\N	\N	3	AB	\N
201282	متن	noun	\N	\N	3	AB	\N
201283	متنفر بودن	verb	\N	\N	3	AB	\N
201284	مثال	noun	\N	\N	3	AB	\N
201285	مثبت	adjective	\N	\N	3	AB	\N
201286	مثل	preposition	\N	\N	3	AB	\N
201287	مثلث	noun	\N	\N	3	AB	\N
201288	مجرد	adjective	\N	\N	3	AB	\N
201289	مجری	noun	\N	\N	3	AB	\N
201290	محافظت	noun	\N	\N	3	AB	\N
201291	محل کار	noun	\N	\N	3	AB	\N
201292	مختلف	adjective	\N	\N	3	AB	\N
201293	مخصوصاً	adverb	\N	\N	3	AB	\N
201294	مدرسه	noun	\N	\N	3	AB	\N
201295	مدرسه ابتدایی	noun	\N	\N	3	AB	\N
201296	مدرک	noun	\N	\N	3	AB	\N
201297	مدل (مدل مو)	noun	\N	\N	3	AB	\N
201298	مدیر	noun	\N	\N	3	AB	\N
201299	مراقبت	noun	\N	\N	3	AB	\N
201300	مربوط	adjective	\N	\N	3	AB	\N
201301	مربی	noun	\N	\N	3	AB	\N
201302	مرتب	adjective	\N	\N	3	AB	\N
201303	مرتب کردن	verb	\N	\N	3	AB	\N
201304	مرحله	noun	\N	\N	3	AB	\N
201305	مرد	noun	\N	\N	3	AB	\N
201306	مرداد	noun	\N	\N	3	AB	\N
201307	مرغ مینا	noun	\N	\N	3	AB	\N
201308	مسابقه	noun	\N	\N	3	AB	\N
201309	مسافر	noun	\N	\N	3	AB	\N
201310	مسافرت	noun	\N	\N	3	AB	\N
201311	مسافرت رفتن	verb	\N	\N	3	AB	\N
201312	مستقیم	adjective	\N	\N	3	AB	\N
201313	مستند	noun	\N	\N	3	AB	\N
201314	مسجد	noun	\N	\N	3	AB	\N
201315	مسواک	noun	\N	\N	3	AB	\N
201316	مسیر	noun	\N	\N	3	AB	\N
201317	مشاور تحصیلی	noun	\N	\N	3	AB	\N
201318	مشتری	noun	\N	\N	3	AB	\N
201319	مشخص کردن	verb	\N	\N	3	AB	\N
201320	مشکی	adjective	\N	\N	3	AB	\N
201321	مشهور	adjective	\N	\N	3	AB	\N
201322	مصدر	noun	\N	\N	3	AB	\N
201323	مضر	adjective	\N	\N	3	AB	\N
201324	مطالعه	noun	\N	\N	3	AB	\N
201325	مطالعه کردن	verb	\N	\N	3	AB	\N
201326	مطب	noun	\N	\N	3	AB	\N
201327	معتدل	adjective	\N	\N	3	AB	\N
201328	معرفی	noun	\N	\N	3	AB	\N
201329	معرفی کردن	verb	\N	\N	3	AB	\N
201330	معروف	adjective	\N	\N	3	AB	\N
201331	معلم	noun	\N	\N	3	AB	\N
201332	معلول	adjective	\N	\N	3	AB	\N
201333	معما	noun	\N	\N	3	AB	\N
201334	معمولاً	adverb	\N	\N	3	AB	\N
201335	معمولی	adjective	\N	\N	3	AB	\N
201336	مغازه	noun	\N	\N	3	AB	\N
201337	مفرد	adjective	\N	\N	3	AB	\N
201338	مفصل	adjective	\N	\N	3	AB	\N
201339	مفید	adjective	\N	\N	3	AB	\N
201340	مقاله	noun	\N	\N	3	AB	\N
201341	مقایسه	noun	\N	\N	3	AB	\N
201342	مقایسه کردن	verb	\N	\N	3	AB	\N
201343	مقصد	noun	\N	\N	3	AB	\N
201344	مقوایی	adjective	\N	\N	3	AB	\N
201345	مکالمه	noun	\N	\N	3	AB	\N
201346	مکان	noun	\N	\N	3	AB	\N
201347	مکان عمومی	noun	\N	\N	3	AB	\N
201348	مکعب	noun	\N	\N	3	AB	\N
201349	ملکی	adjective	\N	\N	3	AB	\N
201350	ملی	adjective	\N	\N	3	AB	\N
201351	ملیت	noun	\N	\N	3	AB	\N
201352	ممنون!	phrase	\N	\N	3	AB	\N
201353	من	pronoun	\N	\N	3	AB	\N
201354	مناسب	adjective	\N	\N	3	AB	\N
201355	منزل	noun	\N	\N	3	AB	\N
201356	منشی	noun	\N	\N	3	AB	\N
201357	منفی	adjective	\N	\N	3	AB	\N
201358	مو	noun	\N	\N	3	AB	\N
201359	مواد	noun	\N	\N	3	AB	\N
201360	موبایل (تلفن همراه)	noun	\N	\N	3	AB	\N
201361	موجود	noun	\N	\N	3	AB	\N
201362	موز	noun	\N	\N	3	AB	\N
201363	موسیقی	noun	\N	\N	3	AB	\N
201364	موضوع	noun	\N	\N	3	AB	\N
201365	موقع	noun	\N	\N	3	AB	\N
201366	موقعیت	noun	\N	\N	3	AB	\N
201367	مهر	noun	\N	\N	3	AB	\N
201368	مهربان	adjective	\N	\N	3	AB	\N
201369	مهم	adjective	\N	\N	3	AB	\N
201370	مهمان	noun	\N	\N	3	AB	\N
201371	مهمانی	noun	\N	\N	3	AB	\N
201372	مهندس	noun	\N	\N	3	AB	\N
201373	میدان	noun	\N	\N	3	AB	\N
201374	میز	noun	\N	\N	3	AB	\N
201375	میزبان	noun	\N	\N	3	AB	\N
201376	میز تحریر	noun	\N	\N	3	AB	\N
201377	میلیون	number	\N	\N	3	AB	\N
201378	میوه	noun	\N	\N	3	AB	\N
201379	میوه فروش	noun	\N	\N	3	AB	\N
201380	میوه فروشی	noun	\N	\N	3	AB	\N
201381	نابغه	noun	\N	\N	3	AB	\N
201382	نابینا	adjective	\N	\N	3	AB	\N
201383	نادرست	adjective	\N	\N	3	AB	\N
201384	نارنجی	adjective	\N	\N	3	AB	\N
201385	نام	noun	\N	\N	3	AB	\N
201386	نام خانوادگی	noun	\N	\N	3	AB	\N
201387	نامرتب	adjective	\N	\N	3	AB	\N
201388	نان	noun	\N	\N	3	AB	\N
201389	ناهار	noun	\N	\N	3	AB	\N
201390	نبش	noun	\N	\N	3	AB	\N
201391	نجاری	noun	\N	\N	3	AB	\N
201392	نرم	adjective	\N	\N	3	AB	\N
201393	نرمال	adjective	\N	\N	3	AB	\N
201394	نزدیک	adjective	\N	\N	3	AB	\N
201395	نزدیک شدن	verb	\N	\N	3	AB	\N
201396	نسبت	noun	\N	\N	3	AB	\N
201397	نسبت داشتن با	verb	\N	\N	3	AB	\N
201398	نشانه	noun	\N	\N	3	AB	\N
201399	نشانی	noun	\N	\N	3	AB	\N
201400	نشستن	verb	\N	\N	3	AB	\N
201401	نظر	noun	\N	\N	3	AB	\N
201402	نفت	noun	\N	\N	3	AB	\N
201403	نفر	noun	\N	\N	3	AB	\N
201404	نقشه	noun	\N	\N	3	AB	\N
201405	نقطه	noun	\N	\N	3	AB	\N
201406	نقطه چین	noun	\N	\N	3	AB	\N
201407	نگاه کردن	verb	\N	\N	3	AB	\N
201408	نگران (بودن)	verb	\N	\N	3	AB	\N
201409	نگهبان	noun	\N	\N	3	AB	\N
201410	نگهبانی	noun	\N	\N	3	AB	\N
201411	نگهبانی دادن	verb	\N	\N	3	AB	\N
201412	نگهداری کردن	verb	\N	\N	3	AB	\N
201413	نماد	noun	\N	\N	3	AB	\N
201414	نمره	noun	\N	\N	3	AB	\N
201415	نمونه	noun	\N	\N	3	AB	\N
201416	نوبت	noun	\N	\N	3	AB	\N
201417	نور	noun	\N	\N	3	AB	\N
201418	نوروز	noun	\N	\N	3	AB	\N
201419	نوشابه	noun	\N	\N	3	AB	\N
201420	نوشتاری	adjective	\N	\N	3	AB	\N
201421	نوشتن	verb	\N	\N	3	AB	\N
201422	نوشیدنی	noun	\N	\N	3	AB	\N
201423	نوه	noun	\N	\N	3	AB	\N
201424	نویسنده	noun	\N	\N	3	AB	\N
201425	نه	number	\N	\N	3	AB	\N
201426	نهایی	adjective	\N	\N	3	AB	\N
201427	نهی	noun	\N	\N	3	AB	\N
201428	نیاز	noun	\N	\N	3	AB	\N
201429	نیم	noun	\N	\N	3	AB	\N
201430	نیمرو	noun	\N	\N	3	AB	\N
201431	نیمه شب	noun	\N	\N	3	AB	\N
201432	وارد کردن	verb	\N	\N	3	AB	\N
201433	واژه	noun	\N	\N	3	AB	\N
201434	واژه سازی	noun	\N	\N	3	AB	\N
201435	والدین	noun	\N	\N	3	AB	\N
201436	وبگردی	noun	\N	\N	3	AB	\N
201437	وبگردی کردن	verb	\N	\N	3	AB	\N
201438	وجود داشتن	verb	\N	\N	3	AB	\N
201439	وحشی	adjective	\N	\N	3	AB	\N
201440	ورزش	noun	\N	\N	3	AB	\N
201441	ورزشکار	noun	\N	\N	3	AB	\N
201442	ورزش کردن	verb	\N	\N	3	AB	\N
201443	وزن	noun	\N	\N	3	AB	\N
201444	وسایل	noun	\N	\N	3	AB	\N
201445	وسایل شخصی	noun	\N	\N	3	AB	\N
201446	وسط	noun	\N	\N	3	AB	\N
201447	وسیله	noun	\N	\N	3	AB	\N
201448	وسیله نقلیه	noun	\N	\N	3	AB	\N
201449	وصل کردن	verb	\N	\N	3	AB	\N
201450	وقت	noun	\N	\N	3	AB	\N
201451	وقت دادن	verb	\N	\N	3	AB	\N
201452	وقت داشتن	verb	\N	\N	3	AB	\N
201453	وقت گرفتن	verb	\N	\N	3	AB	\N
201454	وقت گیر	adjective	\N	\N	3	AB	\N
201455	وقتی	conjunction	\N	\N	3	AB	\N
201456	وکیل	noun	\N	\N	3	AB	\N
201457	ولی	conjunction	\N	\N	3	AB	\N
201458	ویترین	noun	\N	\N	3	AB	\N
201459	ویژگی	noun	\N	\N	3	AB	\N
201460	ویلا	noun	\N	\N	3	AB	\N
201461	ویلچر	noun	\N	\N	3	AB	\N
201462	هتل	noun	\N	\N	3	AB	\N
201463	هرگز	adverb	\N	\N	3	AB	\N
201464	هزار	number	\N	\N	3	AB	\N
201465	هشت	number	\N	\N	3	AB	\N
201466	هفت	number	\N	\N	3	AB	\N
201467	هفتگی	adjective	\N	\N	3	AB	\N
201468	هفته	noun	\N	\N	3	AB	\N
201469	همچنین	adverb	\N	\N	3	AB	\N
201470	همدیگر	pronoun	\N	\N	3	AB	\N
201471	همسایه	noun	\N	\N	3	AB	\N
201472	همسر	noun	\N	\N	3	AB	\N
201473	همکار	noun	\N	\N	3	AB	\N
201474	هم کلاسی	noun	\N	\N	3	AB	\N
201475	همه	pronoun	\N	\N	3	AB	\N
201476	همه چیز	noun	\N	\N	3	AB	\N
201477	همیشه	adverb	\N	\N	3	AB	\N
201478	همین طور	adverb	\N	\N	3	AB	\N
201479	هنر	noun	\N	\N	3	AB	\N
201480	هوا	noun	\N	\N	3	AB	\N
201481	هواپیما	noun	\N	\N	3	AB	\N
201482	هویج	noun	\N	\N	3	AB	\N
201483	هیچ کس	pronoun	\N	\N	3	AB	\N
201484	هیچ وقت	adverb	\N	\N	3	AB	\N
201485	یاد گرفتن	verb	\N	\N	3	AB	\N
201486	یادگیری	noun	\N	\N	3	AB	\N
201487	یک/یکی	number	\N	\N	3	AB	\N
201488	یکشنبه	noun	\N	\N	3	AB	\N
201489	یوگا	noun	\N	\N	3	AB	\N
201490	یک	det	\N	\N	3	A1	\N
201491	یک	det	\N	\N	3	A1	\N
201492	درباره	prep	\N	\N	3	A1	\N
201493	بالای	prep	\N	\N	3	A1	\N
201494	آن طرف	prep	\N	\N	3	A1	\N
201495	عمل	n	\N	\N	3	A1	\N
201496	فعالیت	n	\N	\N	3	A1	\N
201497	بازیگر	n	\N	\N	3	A1	\N
201498	بازیگر زن	n	\N	\N	3	A1	\N
201499	اضافه کردن	v	\N	\N	3	A1	\N
201500	آدرس	n	\N	\N	3	A1	\N
201501	بزرگسال	n	\N	\N	3	A1	\N
201502	ترسیده	adj	\N	\N	3	A1	\N
201503	بعد از	prep	\N	\N	3	A1	\N
201504	بعد از ظهر	n	\N	\N	3	A1	\N
201505	دوباره	adv	\N	\N	3	A1	\N
201506	سن	n	\N	\N	3	A1	\N
201507	پیش	adv	\N	\N	3	A1	\N
201508	هوا	n	\N	\N	3	A1	\N
201509	فرودگاه	n	\N	\N	3	A1	\N
201510	همه	det	\N	\N	3	A1	\N
201511	خوب است	adj	\N	\N	3	A1	\N
201512	همچنین	adv	\N	\N	3	A1	\N
201513	همیشه	adv	\N	\N	3	A1	\N
201514	شگفت‌انگیز	adj	\N	\N	3	A1	\N
201515	و	conj	\N	\N	3	A1	\N
201516	عصبانی	adj	\N	\N	3	A1	\N
201517	حیوان	n	\N	\N	3	A1	\N
201518	دیگری	det	\N	\N	3	A1	\N
201519	جواب	n	\N	\N	3	A1	\N
201520	هر	det	\N	\N	3	A1	\N
201521	هر کسی	pron	\N	\N	3	A1	\N
201522	هر چیزی	pron	\N	\N	3	A1	\N
201523	آپارتمان	n	\N	\N	3	A1	\N
201524	سیب	n	\N	\N	3	A1	\N
201525	آوریل	n	\N	\N	3	A1	\N
201526	منطقه	n	\N	\N	3	A1	\N
201527	بازو	n	\N	\N	3	A1	\N
201528	اطراف	prep	\N	\N	3	A1	\N
201529	رسیدن	v	\N	\N	3	A1	\N
201530	هنر	n	\N	\N	3	A1	\N
201531	مقاله	n	\N	\N	3	A1	\N
201532	هنرمند	n	\N	\N	3	A1	\N
201533	مثل	prep	\N	\N	3	A1	\N
201534	پرسیدن	v	\N	\N	3	A1	\N
201535	در	prep	\N	\N	3	A1	\N
201536	اوت	n	\N	\N	3	A1	\N
201537	عمه	n	\N	\N	3	A1	\N
201538	پاییز	n	\N	\N	3	A1	\N
201539	دور	adv	\N	\N	3	A1	\N
201540	نوزاد	n	\N	\N	3	A1	\N
201541	پشت	adv	\N	\N	3	A1	\N
201542	بد	adj	\N	\N	3	A1	\N
201543	کیف	n	\N	\N	3	A1	\N
201544	توپ	n	\N	\N	3	A1	\N
201545	موز	n	\N	\N	3	A1	\N
201546	گروه موسیقی	n	\N	\N	3	A1	\N
201547	بانک	n	\N	\N	3	A1	\N
201548	بار	n	\N	\N	3	A1	\N
201549	حمام	n	\N	\N	3	A1	\N
201550	دستشویی	n	\N	\N	3	A1	\N
201551	بودن	v	\N	\N	3	A1	\N
201552	ساحل	n	\N	\N	3	A1	\N
201553	زیبا	adj	\N	\N	3	A1	\N
201554	چون	conj	\N	\N	3	A1	\N
201555	شدن	v	\N	\N	3	A1	\N
201556	تخت	n	\N	\N	3	A1	\N
201557	اتاق خواب	n	\N	\N	3	A1	\N
201558	آبجو	n	\N	\N	3	A1	\N
201559	قبل از	prep	\N	\N	3	A1	\N
201560	شروع کردن	v	\N	\N	3	A1	\N
201561	ابتدا	n	\N	\N	3	A1	\N
201562	پشت سر	prep	\N	\N	3	A1	\N
201563	باور کردن	v	\N	\N	3	A1	\N
201564	زیر	prep	\N	\N	3	A1	\N
201565	بهترین	adj	\N	\N	3	A1	\N
201566	بهتر	adj	\N	\N	3	A1	\N
201567	بین	prep	\N	\N	3	A1	\N
201568	دوچرخه	n	\N	\N	3	A1	\N
201569	بزرگ	adj	\N	\N	3	A1	\N
201570	کافه	n	\N	\N	3	A1	\N
201571	کیک	n	\N	\N	3	A1	\N
201572	زنگ زدن	v	\N	\N	3	A1	\N
201573	دوربین	n	\N	\N	3	A1	\N
201574	توانستن	v	\N	\N	3	A1	\N
201575	ماشین	n	\N	\N	3	A1	\N
201576	کارت	n	\N	\N	3	A1	\N
201577	هویج	n	\N	\N	3	A1	\N
201578	حمل کردن	v	\N	\N	3	A1	\N
201579	گربه	n	\N	\N	3	A1	\N
201580	سی‌دی	n	\N	\N	3	A1	\N
201581	سنت	n	\N	\N	3	A1	\N
201582	مرکز	n	\N	\N	3	A1	\N
201583	صندلی	n	\N	\N	3	A1	\N
201584	تغییر دادن	v	\N	\N	3	A1	\N
201585	نمودار	n	\N	\N	3	A1	\N
201586	ارزان	adj	\N	\N	3	A1	\N
201587	بررسی کردن	v	\N	\N	3	A1	\N
201588	پنیر	n	\N	\N	3	A1	\N
201589	مرغ	n	\N	\N	3	A1	\N
201590	بچه	n	\N	\N	3	A1	\N
201591	شکلات	n	\N	\N	3	A1	\N
201592	انتخاب کردن	v	\N	\N	3	A1	\N
201593	سینما	n	\N	\N	3	A1	\N
201594	شهر	n	\N	\N	3	A1	\N
201595	کلاس	n	\N	\N	3	A1	\N
201596	کلاس درس	n	\N	\N	3	A1	\N
201597	تمیز	adj	\N	\N	3	A1	\N
201598	بالا رفتن	v	\N	\N	3	A1	\N
201599	ساعت	n	\N	\N	3	A1	\N
201600	بستن	v	\N	\N	3	A1	\N
201601	لباس	n	\N	\N	3	A1	\N
201602	باشگاه	n	\N	\N	3	A1	\N
201603	کت	n	\N	\N	3	A1	\N
201604	قهوه	n	\N	\N	3	A1	\N
201605	سرد	adj	\N	\N	3	A1	\N
201606	دانشکده	n	\N	\N	3	A1	\N
201607	رنگ	n	\N	\N	3	A1	\N
201608	آمدن	v	\N	\N	3	A1	\N
201609	شرکت	n	\N	\N	3	A1	\N
201610	تکمیل کردن	v	\N	\N	3	A1	\N
201611	کامپیوتر	n	\N	\N	3	A1	\N
201612	کنسرت	n	\N	\N	3	A1	\N
201613	آشپزی کردن	v	\N	\N	3	A1	\N
201614	آشپزی	n	\N	\N	3	A1	\N
201615	خنک	adj	\N	\N	3	A1	\N
201616	درست	adj	\N	\N	3	A1	\N
201617	قیمت داشتن	v	\N	\N	3	A1	\N
201618	می‌توانست	v	\N	\N	3	A1	\N
201619	کشور	n	\N	\N	3	A1	\N
201620	دوره	n	\N	\N	3	A1	\N
201621	پسرعمو	n	\N	\N	3	A1	\N
201622	گاو	n	\N	\N	3	A1	\N
201623	خامه	n	\N	\N	3	A1	\N
201624	فنجان	n	\N	\N	3	A1	\N
201625	بابا	n	\N	\N	3	A1	\N
201626	روزانه	adj	\N	\N	3	A1	\N
201627	رقصیدن	v	\N	\N	3	A1	\N
201628	رقصنده	n	\N	\N	3	A1	\N
201629	رقص	n	\N	\N	3	A1	\N
201630	خطرناک	adj	\N	\N	3	A1	\N
201631	تاریک	adj	\N	\N	3	A1	\N
201632	تاریخ	n	\N	\N	3	A1	\N
201633	دختر	n	\N	\N	3	A1	\N
201634	روز	n	\N	\N	3	A1	\N
201635	عزیز	adj	\N	\N	3	A1	\N
201636	دسامبر	n	\N	\N	3	A1	\N
201637	تصمیم گرفتن	v	\N	\N	3	A1	\N
201638	خوشمزه	adj	\N	\N	3	A1	\N
201639	میز	n	\N	\N	3	A1	\N
201640	جزئیات	n	\N	\N	3	A1	\N
201641	گفتگو	n	\N	\N	3	A1	\N
201642	فرهنگ لغت	n	\N	\N	3	A1	\N
201643	مردن	v	\N	\N	3	A1	\N
201644	رژیم غذایی	n	\N	\N	3	A1	\N
201645	متفاوت	adj	\N	\N	3	A1	\N
201646	دشوار	adj	\N	\N	3	A1	\N
201647	شام	n	\N	\N	3	A1	\N
201648	کثیف	adj	\N	\N	3	A1	\N
201649	ظرف	n	\N	\N	3	A1	\N
201650	انجام دادن	v	\N	\N	3	A1	\N
201651	دکتر	n	\N	\N	3	A1	\N
201652	سگ	n	\N	\N	3	A1	\N
201653	دلار	n	\N	\N	3	A1	\N
201654	در	n	\N	\N	3	A1	\N
201655	پایین	adv	\N	\N	3	A1	\N
201656	طبقه پایین	adv	\N	\N	3	A1	\N
201657	کشیدن	v	\N	\N	3	A1	\N
201658	لباس	n	\N	\N	3	A1	\N
201659	نوشیدن	v	\N	\N	3	A1	\N
201660	رانندگی کردن	v	\N	\N	3	A1	\N
201661	راننده	n	\N	\N	3	A1	\N
201662	رانندگی	n	\N	\N	3	A1	\N
201663	در طول	prep	\N	\N	3	A1	\N
201664	دی‌وی‌دی	n	\N	\N	3	A1	\N
201665	هر	det	\N	\N	3	A1	\N
201666	گوش	n	\N	\N	3	A1	\N
201667	زود	adj	\N	\N	3	A1	\N
201668	شرق	n	\N	\N	3	A1	\N
201669	آسان	adj	\N	\N	3	A1	\N
201670	خوردن	v	\N	\N	3	A1	\N
201671	تخم مرغ	n	\N	\N	3	A1	\N
201672	هشت	num	\N	\N	3	A1	\N
201673	هجده	num	\N	\N	3	A1	\N
201674	هشتاد	num	\N	\N	3	A1	\N
201675	فیل	n	\N	\N	3	A1	\N
201676	یازده	num	\N	\N	3	A1	\N
201677	دیگر	adv	\N	\N	3	A1	\N
201678	ایمیل	n	\N	\N	3	A1	\N
201679	پایان	n	\N	\N	3	A1	\N
201680	لذت بردن	v	\N	\N	3	A1	\N
201681	کافی	det	\N	\N	3	A1	\N
201682	یورو	n	\N	\N	3	A1	\N
201683	حتی	adv	\N	\N	3	A1	\N
201684	عصر	n	\N	\N	3	A1	\N
201685	تا به حال	adv	\N	\N	3	A1	\N
201686	هر	det	\N	\N	3	A1	\N
201687	همه کس	pron	\N	\N	3	A1	\N
201688	همه	pron	\N	\N	3	A1	\N
201689	همه چیز	pron	\N	\N	3	A1	\N
201690	امتحان	n	\N	\N	3	A1	\N
201691	مثال	n	\N	\N	3	A1	\N
201692	هیجان‌زده	adj	\N	\N	3	A1	\N
201693	هیجان‌انگیز	adj	\N	\N	3	A1	\N
201694	تمرین	n	\N	\N	3	A1	\N
201695	گران	adj	\N	\N	3	A1	\N
201696	توضیح دادن	v	\N	\N	3	A1	\N
201697	اضافه	adj	\N	\N	3	A1	\N
201698	چشم	n	\N	\N	3	A1	\N
201699	صورت	n	\N	\N	3	A1	\N
201700	افتادن	v	\N	\N	3	A1	\N
201701	غلط	adj	\N	\N	3	A1	\N
201702	خانواده	n	\N	\N	3	A1	\N
201703	مشهور	adj	\N	\N	3	A1	\N
201704	فوق‌العاده	adj	\N	\N	3	A1	\N
201705	دور	adv	\N	\N	3	A1	\N
201706	مزرعه	n	\N	\N	3	A1	\N
201707	کشاورز	n	\N	\N	3	A1	\N
201708	سریع	adj	\N	\N	3	A1	\N
201709	چاق	adj	\N	\N	3	A1	\N
201710	پدر	n	\N	\N	3	A1	\N
201711	مورد علاقه	adj	\N	\N	3	A1	\N
201712	فوریه	n	\N	\N	3	A1	\N
201713	احساس کردن	v	\N	\N	3	A1	\N
201714	جشنواره	n	\N	\N	3	A1	\N
201715	چند	det	\N	\N	3	A1	\N
201716	پانزده	num	\N	\N	3	A1	\N
201717	پنجم	num	\N	\N	3	A1	\N
201718	پنجاه	num	\N	\N	3	A1	\N
201719	پر کردن	v	\N	\N	3	A1	\N
201720	فیلم	n	\N	\N	3	A1	\N
201721	نهایی	adj	\N	\N	3	A1	\N
201722	پیدا کردن	v	\N	\N	3	A1	\N
201723	خوب	adj	\N	\N	3	A1	\N
201724	تمام کردن	v	\N	\N	3	A1	\N
201725	آتش	n	\N	\N	3	A1	\N
201726	اول	num	\N	\N	3	A1	\N
201727	ماهی	n	\N	\N	3	A1	\N
201728	پنج	num	\N	\N	3	A1	\N
201729	درست کردن	v	\N	\N	3	A1	\N
201730	آپارتمان	n	\N	\N	3	A1	\N
201731	پرواز	n	\N	\N	3	A1	\N
201732	کف	n	\N	\N	3	A1	\N
201733	گل	n	\N	\N	3	A1	\N
201734	پرواز کردن	v	\N	\N	3	A1	\N
201735	دنبال کردن	v	\N	\N	3	A1	\N
201736	غذا	n	\N	\N	3	A1	\N
201737	پا	n	\N	\N	3	A1	\N
201738	فوتبال	n	\N	\N	3	A1	\N
201739	برای	prep	\N	\N	3	A1	\N
201740	فراموش کردن	v	\N	\N	3	A1	\N
201741	فرم	n	\N	\N	3	A1	\N
201742	چهل	num	\N	\N	3	A1	\N
201743	چهار	num	\N	\N	3	A1	\N
201744	چهارده	num	\N	\N	3	A1	\N
201745	چهارم	num	\N	\N	3	A1	\N
201746	رایگان	adj	\N	\N	3	A1	\N
201747	جمعه	n	\N	\N	3	A1	\N
201748	دوست	n	\N	\N	3	A1	\N
201749	دوستانه	adj	\N	\N	3	A1	\N
201750	از	prep	\N	\N	3	A1	\N
201751	جلو	n	\N	\N	3	A1	\N
201752	میوه	n	\N	\N	3	A1	\N
201753	پر	adj	\N	\N	3	A1	\N
201754	سرگرمی	n	\N	\N	3	A1	\N
201755	خنده‌دار	adj	\N	\N	3	A1	\N
201756	آینده	n	\N	\N	3	A1	\N
201757	بازی	n	\N	\N	3	A1	\N
201758	باغ	n	\N	\N	3	A1	\N
201759	جغرافیا	n	\N	\N	3	A1	\N
201760	گرفتن	v	\N	\N	3	A1	\N
201761	دختر	n	\N	\N	3	A1	\N
201762	دوست دختر	n	\N	\N	3	A1	\N
201763	دادن	v	\N	\N	3	A1	\N
201764	لیوان	n	\N	\N	3	A1	\N
201765	رفتن	v	\N	\N	3	A1	\N
201766	خوب	adj	\N	\N	3	A1	\N
201767	خداحافظ	interj	\N	\N	3	A1	\N
201768	پدربزرگ	n	\N	\N	3	A1	\N
201769	مادربزرگ	n	\N	\N	3	A1	\N
201770	پدر یا مادربزرگ	n	\N	\N	3	A1	\N
201771	عالی	adj	\N	\N	3	A1	\N
201772	سبز	adj	\N	\N	3	A1	\N
201773	خاکستری	adj	\N	\N	3	A1	\N
201774	گروه	n	\N	\N	3	A1	\N
201775	رشد کردن	v	\N	\N	3	A1	\N
201776	حدس زدن	v	\N	\N	3	A1	\N
201777	گیتار	n	\N	\N	3	A1	\N
201778	باشگاه	n	\N	\N	3	A1	\N
201779	مو	n	\N	\N	3	A1	\N
201780	نصف	n	\N	\N	3	A1	\N
201781	دست	n	\N	\N	3	A1	\N
201782	اتفاق افتادن	v	\N	\N	3	A1	\N
201783	خوشحال	adj	\N	\N	3	A1	\N
201784	سخت	adj	\N	\N	3	A1	\N
201785	کلاه	n	\N	\N	3	A1	\N
201786	متنفر بودن	v	\N	\N	3	A1	\N
201787	داشتن	v	\N	\N	3	A1	\N
201788	باید	v	\N	\N	3	A1	\N
201789	او	pron	\N	\N	3	A1	\N
201790	سر	n	\N	\N	3	A1	\N
201791	سلامت	n	\N	\N	3	A1	\N
201792	سالم	adj	\N	\N	3	A1	\N
201793	شنیدن	v	\N	\N	3	A1	\N
201794	سلام	interj	\N	\N	3	A1	\N
201795	کمک کردن	v	\N	\N	3	A1	\N
201796	او را	pron	\N	\N	3	A1	\N
201797	اینجا	adv	\N	\N	3	A1	\N
201798	هی	interj	\N	\N	3	A1	\N
201799	سلام	interj	\N	\N	3	A1	\N
201800	بلند	adj	\N	\N	3	A1	\N
201801	به او	pron	\N	\N	3	A1	\N
201802	مال او	det	\N	\N	3	A1	\N
201803	تاریخ	n	\N	\N	3	A1	\N
201804	سرگرمی	n	\N	\N	3	A1	\N
201805	تعطیلات	n	\N	\N	3	A1	\N
201806	خانه	n	\N	\N	3	A1	\N
201807	تکلیف	n	\N	\N	3	A1	\N
201808	امیدوار بودن	v	\N	\N	3	A1	\N
201809	اسب	n	\N	\N	3	A1	\N
201810	بیمارستان	n	\N	\N	3	A1	\N
201811	گرم	adj	\N	\N	3	A1	\N
201812	هتل	n	\N	\N	3	A1	\N
201813	ساعت	n	\N	\N	3	A1	\N
201814	خانه	n	\N	\N	3	A1	\N
201815	چطور	adv	\N	\N	3	A1	\N
201816	صد	num	\N	\N	3	A1	\N
201817	گرسنه	adj	\N	\N	3	A1	\N
201818	شوهر	n	\N	\N	3	A1	\N
201819	من	pron	\N	\N	3	A1	\N
201820	یخ	n	\N	\N	3	A1	\N
201821	بستنی	n	\N	\N	3	A1	\N
201822	ایده	n	\N	\N	3	A1	\N
201823	اگر	conj	\N	\N	3	A1	\N
201824	مهم	adj	\N	\N	3	A1	\N
201825	در	prep	\N	\N	3	A1	\N
201826	شامل بودن	v	\N	\N	3	A1	\N
201827	اطلاعات	n	\N	\N	3	A1	\N
201828	علاقه	n	\N	\N	3	A1	\N
201829	علاقه‌مند	adj	\N	\N	3	A1	\N
201830	جالب	adj	\N	\N	3	A1	\N
201831	اینترنت	n	\N	\N	3	A1	\N
201832	مصاحبه	n	\N	\N	3	A1	\N
201833	داخل	prep	\N	\N	3	A1	\N
201834	معرفی کردن	v	\N	\N	3	A1	\N
201835	جزیره	n	\N	\N	3	A1	\N
201836	آن	pron	\N	\N	3	A1	\N
201837	مال آن	det	\N	\N	3	A1	\N
201838	ژاکت	n	\N	\N	3	A1	\N
201839	ژانویه	n	\N	\N	3	A1	\N
201840	شلوار جین	n	\N	\N	3	A1	\N
201841	شغل	n	\N	\N	3	A1	\N
201842	پیوستن	v	\N	\N	3	A1	\N
201843	سفر	n	\N	\N	3	A1	\N
201844	آب میوه	n	\N	\N	3	A1	\N
201845	نگه داشتن	v	\N	\N	3	A1	\N
201846	کلید	n	\N	\N	3	A1	\N
201847	کیلومتر	n	\N	\N	3	A1	\N
201848	نوع	n	\N	\N	3	A1	\N
201849	آشپزخانه	n	\N	\N	3	A1	\N
201850	دانستن	v	\N	\N	3	A1	\N
201851	زمین	n	\N	\N	3	A1	\N
201852	زبان	n	\N	\N	3	A1	\N
201853	بزرگ	adj	\N	\N	3	A1	\N
201854	آخر	adj	\N	\N	3	A1	\N
201855	دیر	adj	\N	\N	3	A1	\N
201856	بعداً	adv	\N	\N	3	A1	\N
201857	خندیدن	v	\N	\N	3	A1	\N
201858	یاد گرفتن	v	\N	\N	3	A1	\N
201859	رفتن	v	\N	\N	3	A1	\N
201860	چپ	adj	\N	\N	3	A1	\N
201861	پا	n	\N	\N	3	A1	\N
201862	درس	n	\N	\N	3	A1	\N
201863	اجازه دادن	v	\N	\N	3	A1	\N
201864	نامه	n	\N	\N	3	A1	\N
201865	کتابخانه	n	\N	\N	3	A1	\N
201866	دروغ گفتن	v	\N	\N	3	A1	\N
201867	زندگی	n	\N	\N	3	A1	\N
201868	نور	n	\N	\N	3	A1	\N
201869	دوست داشتن	v	\N	\N	3	A1	\N
201870	خط	n	\N	\N	3	A1	\N
201871	شیر	n	\N	\N	3	A1	\N
201872	لیست	n	\N	\N	3	A1	\N
201873	گوش دادن	v	\N	\N	3	A1	\N
201874	کوچک	adj	\N	\N	3	A1	\N
201875	زندگی کردن	v	\N	\N	3	A1	\N
201876	طولانی	adj	\N	\N	3	A1	\N
201877	نگاه کردن	v	\N	\N	3	A1	\N
201878	گم کردن	v	\N	\N	3	A1	\N
201879	زیاد	n	\N	\N	3	A1	\N
201880	عاشق بودن	v	\N	\N	3	A1	\N
201881	ناهار	n	\N	\N	3	A1	\N
201882	ماشین	n	\N	\N	3	A1	\N
201883	مجله	n	\N	\N	3	A1	\N
201884	اصلی	adj	\N	\N	3	A1	\N
201885	ساختن	v	\N	\N	3	A1	\N
201886	مرد	n	\N	\N	3	A1	\N
201887	خیلی	det	\N	\N	3	A1	\N
201888	نقشه	n	\N	\N	3	A1	\N
201889	مارس	n	\N	\N	3	A1	\N
201890	بازار	n	\N	\N	3	A1	\N
201891	متاهل	adj	\N	\N	3	A1	\N
201892	مسابقه	n	\N	\N	3	A1	\N
201893	مه	n	\N	\N	3	A1	\N
201894	شاید	adv	\N	\N	3	A1	\N
201895	من را	pron	\N	\N	3	A1	\N
201896	وعده غذایی	n	\N	\N	3	A1	\N
201897	معنی داشتن	v	\N	\N	3	A1	\N
201898	معنی	n	\N	\N	3	A1	\N
201899	گوشت	n	\N	\N	3	A1	\N
201900	ملاقات کردن	v	\N	\N	3	A1	\N
201901	جلسه	n	\N	\N	3	A1	\N
201902	عضو	n	\N	\N	3	A1	\N
201903	منو	n	\N	\N	3	A1	\N
201904	پیام	n	\N	\N	3	A1	\N
201905	متر	n	\N	\N	3	A1	\N
201906	نیمه شب	n	\N	\N	3	A1	\N
201907	مایل	n	\N	\N	3	A1	\N
201908	شیر	n	\N	\N	3	A1	\N
201909	میلیون	num	\N	\N	3	A1	\N
201910	دقیقه	n	\N	\N	3	A1	\N
201911	دلتنگ شدن	v	\N	\N	3	A1	\N
201912	اشتباه	n	\N	\N	3	A1	\N
201913	مدل	n	\N	\N	3	A1	\N
201914	مدرن	adj	\N	\N	3	A1	\N
201915	لحظه	n	\N	\N	3	A1	\N
201916	دوشنبه	n	\N	\N	3	A1	\N
201917	پول	n	\N	\N	3	A1	\N
201918	ماه	n	\N	\N	3	A1	\N
201919	بیشتر	det	\N	\N	3	A1	\N
201920	صبح	n	\N	\N	3	A1	\N
201921	بیشترین	det	\N	\N	3	A1	\N
201922	مادر	n	\N	\N	3	A1	\N
201923	کوه	n	\N	\N	3	A1	\N
201924	موش	n	\N	\N	3	A1	\N
201925	دهان	n	\N	\N	3	A1	\N
201926	حرکت کردن	v	\N	\N	3	A1	\N
201927	فیلم	n	\N	\N	3	A1	\N
201928	خیلی	det	\N	\N	3	A1	\N
201929	مامان	n	\N	\N	3	A1	\N
201930	موزه	n	\N	\N	3	A1	\N
201931	موسیقی	n	\N	\N	3	A1	\N
201932	باید	v	\N	\N	3	A1	\N
201933	مال من	det	\N	\N	3	A1	\N
201934	نام	n	\N	\N	3	A1	\N
201935	نزدیک	prep	\N	\N	3	A1	\N
201936	نیاز داشتن	v	\N	\N	3	A1	\N
201937	همسایه	n	\N	\N	3	A1	\N
201938	هرگز	adv	\N	\N	3	A1	\N
201939	جدید	adj	\N	\N	3	A1	\N
201940	اخبار	n	\N	\N	3	A1	\N
201941	روزنامه	n	\N	\N	3	A1	\N
201942	بعدی	adj	\N	\N	3	A1	\N
201943	کنار	prep	\N	\N	3	A1	\N
201944	خوب	adj	\N	\N	3	A1	\N
201945	شب	n	\N	\N	3	A1	\N
201946	نه	num	\N	\N	3	A1	\N
201947	نوزده	num	\N	\N	3	A1	\N
201948	نود	num	\N	\N	3	A1	\N
201949	نه	det	\N	\N	3	A1	\N
201950	هیچ کس	pron	\N	\N	3	A1	\N
201951	هیچ کس	pron	\N	\N	3	A1	\N
201952	ظهر	n	\N	\N	3	A1	\N
201953	شمال	n	\N	\N	3	A1	\N
201954	بینی	n	\N	\N	3	A1	\N
201955	نه	adv	\N	\N	3	A1	\N
201956	یادداشت	n	\N	\N	3	A1	\N
201957	هیچ چیز	pron	\N	\N	3	A1	\N
201958	نوامبر	n	\N	\N	3	A1	\N
201959	الان	adv	\N	\N	3	A1	\N
201960	شماره	n	\N	\N	3	A1	\N
201961	ساعت	adv	\N	\N	3	A1	\N
201962	اکتبر	n	\N	\N	3	A1	\N
201963	از	prep	\N	\N	3	A1	\N
201964	خاموش	adv	\N	\N	3	A1	\N
201965	دفتر	n	\N	\N	3	A1	\N
201966	اغلب	adv	\N	\N	3	A1	\N
201967	اوه	interj	\N	\N	3	A1	\N
201968	باشه	adj	\N	\N	3	A1	\N
201969	پیر	adj	\N	\N	3	A1	\N
201970	روی	prep	\N	\N	3	A1	\N
201971	یک بار	adv	\N	\N	3	A1	\N
201972	یک	num	\N	\N	3	A1	\N
201973	پیاز	n	\N	\N	3	A1	\N
201974	آنلاین	adj	\N	\N	3	A1	\N
201975	فقط	adv	\N	\N	3	A1	\N
201976	باز کردن	v	\N	\N	3	A1	\N
201977	روبرو	adj	\N	\N	3	A1	\N
201978	یا	conj	\N	\N	3	A1	\N
201979	پرتقال	n	\N	\N	3	A1	\N
201980	سفارش دادن	v	\N	\N	3	A1	\N
201981	دیگر	adj	\N	\N	3	A1	\N
201982	مال ما	det	\N	\N	3	A1	\N
201983	بیرون	adv	\N	\N	3	A1	\N
201984	بیرون	adv	\N	\N	3	A1	\N
201985	بالای	prep	\N	\N	3	A1	\N
201986	داشتن	v	\N	\N	3	A1	\N
201987	صفحه	n	\N	\N	3	A1	\N
201988	رنگ آمیزی کردن	v	\N	\N	3	A1	\N
201989	نقاشی	n	\N	\N	3	A1	\N
201990	جفت	n	\N	\N	3	A1	\N
201991	کاغذ	n	\N	\N	3	A1	\N
201992	پاراگراف	n	\N	\N	3	A1	\N
201993	والدین	n	\N	\N	3	A1	\N
201994	پارک	n	\N	\N	3	A1	\N
201995	قسمت	n	\N	\N	3	A1	\N
201996	شریک	n	\N	\N	3	A1	\N
201997	مهمانی	n	\N	\N	3	A1	\N
201998	پاسپورت	n	\N	\N	3	A1	\N
201999	گذشته	adj	\N	\N	3	A1	\N
202000	پرداخت کردن	v	\N	\N	3	A1	\N
202001	خودکار	n	\N	\N	3	A1	\N
202002	مداد	n	\N	\N	3	A1	\N
202003	مردم	n	\N	\N	3	A1	\N
202004	فلفل	n	\N	\N	3	A1	\N
202005	کامل	adj	\N	\N	3	A1	\N
202006	دوره	n	\N	\N	3	A1	\N
202007	شخص	n	\N	\N	3	A1	\N
202008	شخصی	adj	\N	\N	3	A1	\N
202009	تلفن	n	\N	\N	3	A1	\N
202010	عکس	n	\N	\N	3	A1	\N
202011	عکس	n	\N	\N	3	A1	\N
202012	عبارت	n	\N	\N	3	A1	\N
202013	پیانو	n	\N	\N	3	A1	\N
202014	تصویر	n	\N	\N	3	A1	\N
202015	تکه	n	\N	\N	3	A1	\N
202016	خوک	n	\N	\N	3	A1	\N
202017	صورتی	adj	\N	\N	3	A1	\N
202018	مکان	n	\N	\N	3	A1	\N
202019	برنامه	n	\N	\N	3	A1	\N
202020	هواپیما	n	\N	\N	3	A1	\N
202021	گیاه	n	\N	\N	3	A1	\N
202022	بازی کردن	v	\N	\N	3	A1	\N
202023	بازیکن	n	\N	\N	3	A1	\N
202024	لطفاً	interj	\N	\N	3	A1	\N
202025	نقطه	n	\N	\N	3	A1	\N
202026	پلیس	n	\N	\N	3	A1	\N
202027	پلیس	n	\N	\N	3	A1	\N
202028	استخر	n	\N	\N	3	A1	\N
202029	فقیر	adj	\N	\N	3	A1	\N
202030	پاپ	n	\N	\N	3	A1	\N
202031	محبوب	adj	\N	\N	3	A1	\N
202032	ممکن	adj	\N	\N	3	A1	\N
202033	پست	n	\N	\N	3	A1	\N
202034	سیب زمینی	n	\N	\N	3	A1	\N
202035	پوند	n	\N	\N	3	A1	\N
202036	تمرین	n	\N	\N	3	A1	\N
202037	تمرین کردن	v	\N	\N	3	A1	\N
202038	هدیه	n	\N	\N	3	A1	\N
202039	قشنگ	adj	\N	\N	3	A1	\N
202040	قیمت	n	\N	\N	3	A1	\N
202041	مشکل	n	\N	\N	3	A1	\N
202042	برنامه	n	\N	\N	3	A1	\N
202043	پروژه	n	\N	\N	3	A1	\N
202044	بنفش	adj	\N	\N	3	A1	\N
202045	گذاشتن	v	\N	\N	3	A1	\N
202046	مار	n	\N	\N	3	A1	\N
202047	برف	n	\N	\N	3	A1	\N
202048	پس	conj	\N	\N	3	A1	\N
202049	کمی	det	\N	\N	3	A1	\N
202050	یک نفر	pron	\N	\N	3	A1	\N
202051	کسی	pron	\N	\N	3	A1	\N
202052	چیزی	pron	\N	\N	3	A1	\N
202053	گاهی	adv	\N	\N	3	A1	\N
202054	پسر	n	\N	\N	3	A1	\N
202055	آهنگ	n	\N	\N	3	A1	\N
202056	به زودی	adv	\N	\N	3	A1	\N
202057	متاسف	adj	\N	\N	3	A1	\N
202058	صدا	n	\N	\N	3	A1	\N
202059	سوپ	n	\N	\N	3	A1	\N
202060	جنوب	n	\N	\N	3	A1	\N
202061	فضا	n	\N	\N	3	A1	\N
202062	صحبت کردن	v	\N	\N	3	A1	\N
202063	خاص	adj	\N	\N	3	A1	\N
202064	هجی کردن	v	\N	\N	3	A1	\N
202065	هجی	n	\N	\N	3	A1	\N
202066	خرج کردن	v	\N	\N	3	A1	\N
202067	ورزش	n	\N	\N	3	A1	\N
202068	بهار	n	\N	\N	3	A1	\N
202069	ایستادن	v	\N	\N	3	A1	\N
202070	شروع کردن	v	\N	\N	3	A1	\N
202071	ایستگاه	n	\N	\N	3	A1	\N
202072	متوقف کردن	v	\N	\N	3	A1	\N
202073	داستان	n	\N	\N	3	A1	\N
202074	خیابان	n	\N	\N	3	A1	\N
202075	قوی	adj	\N	\N	3	A1	\N
202076	دانش آموز	n	\N	\N	3	A1	\N
202077	درس خواندن	v	\N	\N	3	A1	\N
202078	سبک	n	\N	\N	3	A1	\N
202079	موضوع	n	\N	\N	3	A1	\N
202080	شکر	n	\N	\N	3	A1	\N
202081	تابستان	n	\N	\N	3	A1	\N
202082	خورشید	n	\N	\N	3	A1	\N
202083	یکشنبه	n	\N	\N	3	A1	\N
202084	سوپرمارکت	n	\N	\N	3	A1	\N
202085	مطمئن	adj	\N	\N	3	A1	\N
202086	ژاکت	n	\N	\N	3	A1	\N
202087	شنا کردن	v	\N	\N	3	A1	\N
202088	شنا	n	\N	\N	3	A1	\N
202089	میز	n	\N	\N	3	A1	\N
202090	گرفتن	v	\N	\N	3	A1	\N
202091	صحبت کردن	v	\N	\N	3	A1	\N
202092	بلند قد	adj	\N	\N	3	A1	\N
202093	تاکسی	n	\N	\N	3	A1	\N
202094	چای	n	\N	\N	3	A1	\N
202095	تدریس کردن	v	\N	\N	3	A1	\N
202096	معلم	n	\N	\N	3	A1	\N
202097	تیم	n	\N	\N	3	A1	\N
202098	نوجوان	n	\N	\N	3	A1	\N
202099	تلفن	n	\N	\N	3	A1	\N
202100	تلویزیون	n	\N	\N	3	A1	\N
202101	گفتن	v	\N	\N	3	A1	\N
202102	ده	num	\N	\N	3	A1	\N
202103	تنیس	n	\N	\N	3	A1	\N
202104	وحشتناک	adj	\N	\N	3	A1	\N
202105	آزمون	n	\N	\N	3	A1	\N
202106	متن	n	\N	\N	3	A1	\N
202107	از	conj	\N	\N	3	A1	\N
202108	تشکر کردن	v	\N	\N	3	A1	\N
202109	ممنون	interj	\N	\N	3	A1	\N
202110	آن	det	\N	\N	3	A1	\N
202111	ـ	det	\N	\N	3	A1	\N
202112	تئاتر	n	\N	\N	3	A1	\N
202113	مال آنها	det	\N	\N	3	A1	\N
202114	آنها را	pron	\N	\N	3	A1	\N
202115	سپس	adv	\N	\N	3	A1	\N
202116	آنجا	adv	\N	\N	3	A1	\N
202117	آنها	pron	\N	\N	3	A1	\N
202118	چیز	n	\N	\N	3	A1	\N
202119	فکر کردن	v	\N	\N	3	A1	\N
202120	سوم	num	\N	\N	3	A1	\N
202121	تشنه	adj	\N	\N	3	A1	\N
202122	سیزده	num	\N	\N	3	A1	\N
202123	سی	num	\N	\N	3	A1	\N
202124	این	det	\N	\N	3	A1	\N
202125	هزار	num	\N	\N	3	A1	\N
202126	سه	num	\N	\N	3	A1	\N
202127	از طریق	prep	\N	\N	3	A1	\N
202128	پنجشنبه	n	\N	\N	3	A1	\N
202129	بلیط	n	\N	\N	3	A1	\N
202130	زمان	n	\N	\N	3	A1	\N
202131	خسته	adj	\N	\N	3	A1	\N
202132	عنوان	n	\N	\N	3	A1	\N
202133	به	prep	\N	\N	3	A1	\N
202134	امروز	adv	\N	\N	3	A1	\N
202135	با هم	adv	\N	\N	3	A1	\N
202136	توالت	n	\N	\N	3	A1	\N
202137	گوجه فرنگی	n	\N	\N	3	A1	\N
202138	فردا	adv	\N	\N	3	A1	\N
202139	امشب	adv	\N	\N	3	A1	\N
202140	هم	adv	\N	\N	3	A1	\N
202141	بالا	n	\N	\N	3	A1	\N
202142	دندان	n	\N	\N	3	A1	\N
202143	توریست	n	\N	\N	3	A1	\N
202144	شهر کوچک	n	\N	\N	3	A1	\N
202145	ترافیک	n	\N	\N	3	A1	\N
202146	قطار	n	\N	\N	3	A1	\N
202147	سفر کردن	v	\N	\N	3	A1	\N
202148	درخت	n	\N	\N	3	A1	\N
202149	سفر	n	\N	\N	3	A1	\N
202150	شلوار	n	\N	\N	3	A1	\N
202151	درست	adj	\N	\N	3	A1	\N
202152	تلاش کردن	v	\N	\N	3	A1	\N
202153	تی‌شرت	n	\N	\N	3	A1	\N
202154	سه‌شنبه	n	\N	\N	3	A1	\N
202155	چرخیدن	v	\N	\N	3	A1	\N
202156	تلویزیون	n	\N	\N	3	A1	\N
202157	دوازده	num	\N	\N	3	A1	\N
202158	بیست	num	\N	\N	3	A1	\N
202159	دو بار	adv	\N	\N	3	A1	\N
202160	دو	num	\N	\N	3	A1	\N
202161	نوع	n	\N	\N	3	A1	\N
202162	چتر	n	\N	\N	3	A1	\N
202163	عمو	n	\N	\N	3	A1	\N
202164	زیر	prep	\N	\N	3	A1	\N
202165	فهمیدن	v	\N	\N	3	A1	\N
202166	دانشگاه	n	\N	\N	3	A1	\N
202167	تا	conj	\N	\N	3	A1	\N
202168	بالا	adv	\N	\N	3	A1	\N
202169	طبقه بالا	adv	\N	\N	3	A1	\N
202170	ما را	pron	\N	\N	3	A1	\N
202171	استفاده کردن	v	\N	\N	3	A1	\N
202172	معمولاً	adv	\N	\N	3	A1	\N
202173	تعطیلات	n	\N	\N	3	A1	\N
202174	سبزیجات	n	\N	\N	3	A1	\N
202175	خیلی	adv	\N	\N	3	A1	\N
202176	ویدئو	n	\N	\N	3	A1	\N
202177	روستا	n	\N	\N	3	A1	\N
202178	بازدید کردن	v	\N	\N	3	A1	\N
202179	بازدیدکننده	n	\N	\N	3	A1	\N
202180	صبر کردن	v	\N	\N	3	A1	\N
202181	گارسون	n	\N	\N	3	A1	\N
202182	بیدار شدن	v	\N	\N	3	A1	\N
202183	پیاده روی کردن	v	\N	\N	3	A1	\N
202184	دیوار	n	\N	\N	3	A1	\N
202185	خواستن	v	\N	\N	3	A1	\N
202186	گرم	adj	\N	\N	3	A1	\N
202187	شستن	v	\N	\N	3	A1	\N
202188	تماشا کردن	v	\N	\N	3	A1	\N
202189	آب	n	\N	\N	3	A1	\N
202190	راه	n	\N	\N	3	A1	\N
202191	ما	pron	\N	\N	3	A1	\N
202192	پوشیدن	v	\N	\N	3	A1	\N
202193	آب و هوا	n	\N	\N	3	A1	\N
202194	وب‌سایت	n	\N	\N	3	A1	\N
202195	چهارشنبه	n	\N	\N	3	A1	\N
202196	هفته	n	\N	\N	3	A1	\N
202197	آخر هفته	n	\N	\N	3	A1	\N
202198	خوش آمدید	interj	\N	\N	3	A1	\N
202199	خوب	adv	\N	\N	3	A1	\N
202200	غرب	n	\N	\N	3	A1	\N
202201	چه	pron	\N	\N	3	A1	\N
202202	چه وقت	adv	\N	\N	3	A1	\N
202203	کجا	adv	\N	\N	3	A1	\N
202204	کدام	pron	\N	\N	3	A1	\N
202205	سفید	adj	\N	\N	3	A1	\N
202206	که	pron	\N	\N	3	A1	\N
202207	چرا	adv	\N	\N	3	A1	\N
202208	همسر	n	\N	\N	3	A1	\N
202209	خواهد	v	\N	\N	3	A1	\N
202210	برنده شدن	v	\N	\N	3	A1	\N
202211	پنجره	n	\N	\N	3	A1	\N
202212	شراب	n	\N	\N	3	A1	\N
202213	زمستان	n	\N	\N	3	A1	\N
202214	با	prep	\N	\N	3	A1	\N
202215	بدون	prep	\N	\N	3	A1	\N
202216	زن	n	\N	\N	3	A1	\N
202217	شگفت‌انگیز	adj	\N	\N	3	A1	\N
202218	کلمه	n	\N	\N	3	A1	\N
202219	کار	n	\N	\N	3	A1	\N
202220	کارگر	n	\N	\N	3	A1	\N
202221	جهان	n	\N	\N	3	A1	\N
202222	می‌خواست	v	\N	\N	3	A1	\N
202223	نوشتن	v	\N	\N	3	A1	\N
202224	نویسنده	n	\N	\N	3	A1	\N
202225	نوشتن	n	\N	\N	3	A1	\N
202226	اشتباه	adj	\N	\N	3	A1	\N
202227	آره	interj	\N	\N	3	A1	\N
202228	سال	n	\N	\N	3	A1	\N
202229	زرد	adj	\N	\N	3	A1	\N
202230	بله	interj	\N	\N	3	A1	\N
202231	دیروز	adv	\N	\N	3	A1	\N
202232	تو	pron	\N	\N	3	A1	\N
202233	جوان	adj	\N	\N	3	A1	\N
202234	مال تو	det	\N	\N	3	A1	\N
202235	خودت	pron	\N	\N	3	A1	\N
202236	او	pron	\N	\N	3	A1	\N
202237	مال من	pron	\N	\N	3	A1	\N
202238	مال تو	pron	\N	\N	3	A1	\N
202239	مال او	pron	\N	\N	3	A1	\N
202240	مال ما	pron	\N	\N	3	A1	\N
202241	مال آنها	pron	\N	\N	3	A1	\N
202242	هستم	v	\N	\N	3	A1	\N
202243	است	v	\N	\N	3	A1	\N
202244	هستند	v	\N	\N	3	A1	\N
202245	بود	v	\N	\N	3	A1	\N
202246	بودند	v	\N	\N	3	A1	\N
202247	بوده	v	\N	\N	3	A1	\N
202248	بودن	v	\N	\N	3	A1	\N
202249	دارد	v	\N	\N	3	A1	\N
202250	داشت	v	\N	\N	3	A1	\N
202251	خواهم	v	\N	\N	3	A1	\N
202252	ممکن است	v	\N	\N	3	A1	\N
202253	شاید	v	\N	\N	3	A1	\N
202254	من هستم	contr	\N	\N	3	A1	\N
202255	تو هستی	contr	\N	\N	3	A1	\N
202256	او هست	contr	\N	\N	3	A1	\N
202257	او هست	contr	\N	\N	3	A1	\N
202258	آن هست	contr	\N	\N	3	A1	\N
202259	ما هستیم	contr	\N	\N	3	A1	\N
202260	آنها هستند	contr	\N	\N	3	A1	\N
202261	من داشتم	contr	\N	\N	3	A1	\N
202262	تو داشتی	contr	\N	\N	3	A1	\N
202263	ما داشتیم	contr	\N	\N	3	A1	\N
202264	آنها داشتند	contr	\N	\N	3	A1	\N
202265	من خواهم	contr	\N	\N	3	A1	\N
202266	تو خواهی	contr	\N	\N	3	A1	\N
202267	او خواهد	contr	\N	\N	3	A1	\N
202268	او خواهد	contr	\N	\N	3	A1	\N
202269	ما خواهیم	contr	\N	\N	3	A1	\N
202270	آنها خواهند	contr	\N	\N	3	A1	\N
202271	نمی‌کنم	contr	\N	\N	3	A1	\N
202272	نمی‌کند	contr	\N	\N	3	A1	\N
202273	نکرد	contr	\N	\N	3	A1	\N
202274	نمی‌توانم	contr	\N	\N	3	A1	\N
202275	نمی‌توانست	contr	\N	\N	3	A1	\N
202276	نخواهم	contr	\N	\N	3	A1	\N
202277	نباید	contr	\N	\N	3	A1	\N
202278	نمی‌خواست	contr	\N	\N	3	A1	\N
202279	نیست	contr	\N	\N	3	A1	\N
202280	نیستند	contr	\N	\N	3	A1	\N
202281	نبود	contr	\N	\N	3	A1	\N
202282	نبودند	contr	\N	\N	3	A1	\N
202283	نداشتم	contr	\N	\N	3	A1	\N
202284	ندارد	contr	\N	\N	3	A1	\N
202285	نداشت	contr	\N	\N	3	A1	\N
202286	کنار	prep	\N	\N	3	A1	\N
202287	جلوی	prep	\N	\N	3	A1	\N
202288	روی	prep	\N	\N	3	A1	\N
202289	در حالی که	conj	\N	\N	3	A1	\N
202290	فقط	adv	\N	\N	3	A1	\N
\.


--
-- Name: dialogue_sentences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.dialogue_sentences_id_seq', 79, true);


--
-- Name: dialogues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.dialogues_id_seq', 1, true);


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

SELECT pg_catalog.setval('public.reel_interactions_id_seq', 2, true);


--
-- Name: reels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.reels_id_seq', 1, true);


--
-- Name: sentence_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentence_tokens_id_seq', 1, false);


--
-- Name: sentence_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentence_translations_id_seq', 62, true);


--
-- Name: sentences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sentences_id_seq', 124, true);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.translations_id_seq', 9906, true);


--
-- Name: user_languages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_languages_id_seq', 127, true);


--
-- Name: user_vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_vocabulary_id_seq', 17915, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.users_id_seq', 153, true);


--
-- Name: words_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.words_id_seq', 60, true);


--
-- Name: dialogue_sentences dialogue_sentences_dialogue_id_position_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogue_sentences
    ADD CONSTRAINT dialogue_sentences_dialogue_id_position_key UNIQUE (dialogue_id, "position");


--
-- Name: dialogue_sentences dialogue_sentences_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogue_sentences
    ADD CONSTRAINT dialogue_sentences_pkey PRIMARY KEY (id);


--
-- Name: dialogues dialogues_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogues
    ADD CONSTRAINT dialogues_pkey PRIMARY KEY (id);


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: letters letters_letter_sign_language_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.letters
    ADD CONSTRAINT letters_letter_sign_language_id_key UNIQUE (letter_sign, language_id);


--
-- Name: letters letters_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.letters
    ADD CONSTRAINT letters_pkey PRIMARY KEY (id);


--
-- Name: reel_interactions reel_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reel_interactions
    ADD CONSTRAINT reel_interactions_pkey PRIMARY KEY (id);


--
-- Name: reel_interactions reel_interactions_reel_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reel_interactions
    ADD CONSTRAINT reel_interactions_reel_id_user_id_key UNIQUE (reel_id, user_id);


--
-- Name: reels reels_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reels
    ADD CONSTRAINT reels_pkey PRIMARY KEY (id);


--
-- Name: sentence_tokens sentence_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_tokens
    ADD CONSTRAINT sentence_tokens_pkey PRIMARY KEY (id);


--
-- Name: sentence_tokens sentence_tokens_sentence_id_position_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_tokens
    ADD CONSTRAINT sentence_tokens_sentence_id_position_key UNIQUE (sentence_id, "position");


--
-- Name: sentence_translations sentence_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_translations
    ADD CONSTRAINT sentence_translations_pkey PRIMARY KEY (id);


--
-- Name: sentence_translations sentence_translations_sentence_id_translation_sentence_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_translations
    ADD CONSTRAINT sentence_translations_sentence_id_translation_sentence_id_key UNIQUE (sentence_id, translation_sentence_id);


--
-- Name: sentences sentences_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentences
    ADD CONSTRAINT sentences_pkey PRIMARY KEY (id);


--
-- Name: word_translations translations_from_word_id_to_word_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.word_translations
    ADD CONSTRAINT translations_from_word_id_to_word_id_key UNIQUE (word_id, translation_word_id);


--
-- Name: word_translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.word_translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: user_languages user_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_pkey PRIMARY KEY (id);


--
-- Name: user_vocabulary user_vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_pkey PRIMARY KEY (id);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: words words_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_pkey PRIMARY KEY (id);


--
-- Name: idx_words_language_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_words_language_id ON public.words USING btree (language_id);


--
-- Name: users_email_unique_idx; Type: INDEX; Schema: public; Owner: root
--

CREATE UNIQUE INDEX users_email_unique_idx ON public.users USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: users trigger_update_last_login; Type: TRIGGER; Schema: public; Owner: root
--

CREATE TRIGGER trigger_update_last_login BEFORE UPDATE OF refresh_token ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_last_login_on_refresh_token();


--
-- Name: TRIGGER trigger_update_last_login ON users; Type: COMMENT; Schema: public; Owner: root
--

COMMENT ON TRIGGER trigger_update_last_login ON public.users IS 'Updates last_login to NOW() when refresh_token is updated';


--
-- Name: dialogue_sentences dialogue_sentences_dialogue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogue_sentences
    ADD CONSTRAINT dialogue_sentences_dialogue_id_fkey FOREIGN KEY (dialogue_id) REFERENCES public.dialogues(id) ON DELETE CASCADE;


--
-- Name: dialogue_sentences dialogue_sentences_sentence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogue_sentences
    ADD CONSTRAINT dialogue_sentences_sentence_id_fkey FOREIGN KEY (sentence_id) REFERENCES public.sentences(id);


--
-- Name: dialogues dialogues_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.dialogues
    ADD CONSTRAINT dialogues_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id);


--
-- Name: user_vocabulary fk_user_vocabulary_user_languages; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT fk_user_vocabulary_user_languages FOREIGN KEY (user_languages_id) REFERENCES public.user_languages(id) ON DELETE CASCADE;


--
-- Name: letters letters_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.letters
    ADD CONSTRAINT letters_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON DELETE CASCADE;


--
-- Name: reel_interactions reel_interactions_reel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reel_interactions
    ADD CONSTRAINT reel_interactions_reel_id_fkey FOREIGN KEY (reel_id) REFERENCES public.reels(id) ON DELETE CASCADE;


--
-- Name: reel_interactions reel_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reel_interactions
    ADD CONSTRAINT reel_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reels reels_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reels
    ADD CONSTRAINT reels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reels reels_dialogue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reels
    ADD CONSTRAINT reels_dialogue_id_fkey FOREIGN KEY (dialogue_id) REFERENCES public.dialogues(id) ON DELETE SET NULL;


--
-- Name: reels reels_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.reels
    ADD CONSTRAINT reels_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id);


--
-- Name: sentence_tokens sentence_tokens_sentence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_tokens
    ADD CONSTRAINT sentence_tokens_sentence_id_fkey FOREIGN KEY (sentence_id) REFERENCES public.sentences(id) ON DELETE CASCADE;


--
-- Name: sentence_tokens sentence_tokens_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_tokens
    ADD CONSTRAINT sentence_tokens_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id);


--
-- Name: sentence_translations sentence_translations_sentence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_translations
    ADD CONSTRAINT sentence_translations_sentence_id_fkey FOREIGN KEY (sentence_id) REFERENCES public.sentences(id) ON DELETE CASCADE;


--
-- Name: sentence_translations sentence_translations_translation_sentence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentence_translations
    ADD CONSTRAINT sentence_translations_translation_sentence_id_fkey FOREIGN KEY (translation_sentence_id) REFERENCES public.sentences(id) ON DELETE CASCADE;


--
-- Name: sentences sentences_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sentences
    ADD CONSTRAINT sentences_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id);


--
-- Name: word_translations translations_translation_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.word_translations
    ADD CONSTRAINT translations_translation_word_id_fkey FOREIGN KEY (translation_word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: word_translations translations_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.word_translations
    ADD CONSTRAINT translations_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: user_languages user_languages_base_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_base_language_id_fkey FOREIGN KEY (native_language_id) REFERENCES public.languages(id) ON DELETE RESTRICT;


--
-- Name: user_languages user_languages_learning_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_learning_language_id_fkey FOREIGN KEY (learning_language_id) REFERENCES public.languages(id) ON DELETE RESTRICT;


--
-- Name: user_languages user_languages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_vocabulary user_vocabulary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_vocabulary user_vocabulary_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: words words_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.words
    ADD CONSTRAINT words_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GHMBG3hv2JhNAty2jJdjRFmPGvTrApXNuDmCfCPYIv5jduAwXr7lQ2Rqyh59wES

