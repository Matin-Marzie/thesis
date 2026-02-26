--
-- PostgreSQL database dump
--

\restrict 6uf7G2lvzRYrdvjQAMcmzs62HLxkoPz8M6DcdVn4JHyMLghojhAshcSnFAzpzAS

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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
-- Name: translations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.translations (
    id bigint NOT NULL,
    word_id bigint NOT NULL,
    translation_word_id bigint NOT NULL,
    level character varying(2),
    CONSTRAINT translations_check CHECK ((word_id <> translation_word_id))
);


ALTER TABLE public.translations OWNER TO root;

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

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


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
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- Name: letters id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.letters ALTER COLUMN id SET DEFAULT nextval('public.letters_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


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
-- Name: words id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.words ALTER COLUMN id SET DEFAULT nextval('public.words_id_seq'::regclass);


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
-- Name: translations translations_from_word_id_to_word_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_from_word_id_to_word_id_key UNIQUE (word_id, translation_word_id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.translations
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
-- Name: translations translations_translation_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_translation_word_id_fkey FOREIGN KEY (translation_word_id) REFERENCES public.words(id) ON DELETE CASCADE;


--
-- Name: translations translations_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.translations
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
    ADD CONSTRAINT user_languages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_vocabulary user_vocabulary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_vocabulary
    ADD CONSTRAINT user_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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

\unrestrict 6uf7G2lvzRYrdvjQAMcmzs62HLxkoPz8M6DcdVn4JHyMLghojhAshcSnFAzpzAS

