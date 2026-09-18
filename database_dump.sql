--
-- PostgreSQL database dump
--

\restrict jTldPe6Vw0IkA6GuslJMAJ1aTtykc0WclJRMajUaopreYWb0cSKMHHjbGGDnGWg

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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
-- Name: listingcondition; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.listingcondition AS ENUM (
    'new',
    'good',
    'worn'
);


ALTER TYPE public.listingcondition OWNER TO rebook;

--
-- Name: listingstatus; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.listingstatus AS ENUM (
    'active',
    'completed',
    'withdrawn'
);


ALTER TYPE public.listingstatus OWNER TO rebook;

--
-- Name: listingtype; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.listingtype AS ENUM (
    'exchange',
    'sale',
    'donation'
);


ALTER TYPE public.listingtype OWNER TO rebook;

--
-- Name: proposalstatus; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.proposalstatus AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE public.proposalstatus OWNER TO rebook;

--
-- Name: proposaltype; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.proposaltype AS ENUM (
    'exchange',
    'sale',
    'donation'
);


ALTER TYPE public.proposaltype OWNER TO rebook;

--
-- Name: reportstatus; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.reportstatus AS ENUM (
    'open',
    'resolved'
);


ALTER TYPE public.reportstatus OWNER TO rebook;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: rebook
--

CREATE TYPE public.userrole AS ENUM (
    'student',
    'admin'
);


ALTER TYPE public.userrole OWNER TO rebook;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO rebook;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying NOT NULL,
    department_id integer NOT NULL
);


ALTER TABLE public.courses OWNER TO rebook;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO rebook;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.departments OWNER TO rebook;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO rebook;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: listing_photos; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.listing_photos (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    url character varying NOT NULL
);


ALTER TABLE public.listing_photos OWNER TO rebook;

--
-- Name: listing_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.listing_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listing_photos_id_seq OWNER TO rebook;

--
-- Name: listing_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.listing_photos_id_seq OWNED BY public.listing_photos.id;


--
-- Name: listings; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    course_id integer,
    title character varying NOT NULL,
    isbn character varying,
    edition character varying,
    condition public.listingcondition NOT NULL,
    type public.listingtype NOT NULL,
    price double precision,
    status public.listingstatus NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.listings OWNER TO rebook;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO rebook;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    proposal_id integer NOT NULL,
    sender_id integer NOT NULL,
    content character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO rebook;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO rebook;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content character varying NOT NULL,
    is_read boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    listing_id integer
);


ALTER TABLE public.notifications OWNER TO rebook;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO rebook;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: proposal_offered_books; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.proposal_offered_books (
    proposal_id integer NOT NULL,
    listing_id integer NOT NULL
);


ALTER TABLE public.proposal_offered_books OWNER TO rebook;

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.proposals (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    requester_id integer NOT NULL,
    type public.proposaltype NOT NULL,
    status public.proposalstatus NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.proposals OWNER TO rebook;

--
-- Name: proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposals_id_seq OWNER TO rebook;

--
-- Name: proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.proposals_id_seq OWNED BY public.proposals.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    reporter_id integer NOT NULL,
    reported_user_id integer NOT NULL,
    reason character varying NOT NULL,
    status public.reportstatus NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reports OWNER TO rebook;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO rebook;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    proposal_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    reviewee_id integer NOT NULL,
    rating integer NOT NULL,
    comment character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO rebook;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO rebook;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: suggested_books; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.suggested_books (
    id integer NOT NULL,
    title character varying NOT NULL,
    isbn character varying,
    course_id integer NOT NULL
);


ALTER TABLE public.suggested_books OWNER TO rebook;

--
-- Name: suggested_books_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.suggested_books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suggested_books_id_seq OWNER TO rebook;

--
-- Name: suggested_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.suggested_books_id_seq OWNED BY public.suggested_books.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.users (
    id integer NOT NULL,
    institutional_email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    full_name character varying NOT NULL,
    role public.userrole NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO rebook;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO rebook;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: rebook
--

CREATE TABLE public.wishlist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer,
    title character varying,
    isbn character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wishlist_items OWNER TO rebook;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: rebook
--

CREATE SEQUENCE public.wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_items_id_seq OWNER TO rebook;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rebook
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: listing_photos id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listing_photos ALTER COLUMN id SET DEFAULT nextval('public.listing_photos_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: proposals id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposals ALTER COLUMN id SET DEFAULT nextval('public.proposals_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: suggested_books id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.suggested_books ALTER COLUMN id SET DEFAULT nextval('public.suggested_books_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.alembic_version (version_num) FROM stdin;
143fc26e2603
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.courses (id, name, department_id) FROM stdin;
1	Τεχνητή Νοημοσύνη	1
2	Αλγόριθμοι και Πολυπλοκότητα	1
3	Δομές Δεδομένων	1
4	Αναγνώριση Προτύπων	1
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.departments (id, name) FROM stdin;
1	Τμήμα Πληροφορικής
\.


--
-- Data for Name: listing_photos; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.listing_photos (id, listing_id, url) FROM stdin;
1	1	/uploads/d2bc2d67f072417bb292778548d9d0ba.jpg
2	2	/uploads/aa99200b6b1e447b92a347a6dcc253bb.jpg
3	3	/uploads/9629487f834a41adb4ba9cf2864d1740.jpg
4	4	/uploads/553a008d12b443baac3207f084cb6959.jpg
5	6	/uploads/aa99200b6b1e447b92a347a6dcc253bb.jpg
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.listings (id, owner_id, course_id, title, isbn, edition, condition, type, price, status, created_at) FROM stdin;
1	2	1	Τεχνητή Νοημοσύνη - Ι. Βλαχάβας κ.ά.	978-618-5196-44-8	4η Έκδοση (Εκδόσεις Πανεπιστημίου Μακεδονίας)	good	exchange	\N	active	2026-09-18 11:18:10.332823+00
2	3	2	Εισαγωγή στους Αλγορίθμους - Cormen et al.	978-960-524-473-6	2η Έκδοση (Πανεπιστημιακές Εκδόσεις Κρήτης)	new	sale	25	active	2026-09-18 11:18:10.332823+00
3	4	3	Δομές Δεδομένων, Αλγόριθμοι και Εφαρμογές στη C++ - S. Sahni	978-960-418-030-1	1η Έκδοση (Εκδόσεις Τζιόλα)	worn	donation	\N	active	2026-09-18 11:18:10.332823+00
4	5	4	Αναγνώριση Προτύπων - Σ. Θεοδωρίδης, Κ. Κουτρούμπας	978-960-489-145-0	1η Έκδοση (Broken Hill / Πασχαλίδη)	good	exchange	\N	active	2026-09-18 11:18:10.332823+00
5	5	3	Δομές Δεδομένων - συμπληρωματικό αντίτυπο	978-960-418-030-1	2η Έκδοση	good	exchange	\N	active	2026-09-18 11:18:10.332823+00
6	3	2	Βάσεις Δεδομένων - Elmasri	978-0000000010	6η Έκδοση	good	sale	18	completed	2026-09-18 11:18:10.332823+00
7	4	1	Εισαγωγή στην Τεχνητή Νοημοσύνη	978-0000000011	1η Έκδοση	worn	donation	\N	completed	2026-09-18 11:18:10.332823+00
8	2	3	Προγραμματισμός σε Python - αποσυρμένη αγγελία	978-0000000012	3η Έκδοση	good	sale	12	withdrawn	2026-09-18 11:18:10.332823+00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.messages (id, proposal_id, sender_id, content, created_at) FROM stdin;
1	1	5	Γεια σου Μαρία! Ενδιαφέρομαι για την Τεχνητή Νοημοσύνη και σου προσφέρω την Αναγνώριση Προτύπων.	2026-09-18 11:18:10.395605+00
2	1	2	Τέλεια! Μπορούμε να βρεθούμε αύριο στη γραμματεία μετά το μάθημα;	2026-09-18 11:18:10.395605+00
3	4	2	Καλησπέρα! Θα ήθελα να αγοράσω το βιβλίο. Μπορούμε να συναντηθούμε στη σχολή;	2026-09-18 11:18:10.395605+00
4	4	3	Βεβαίως, θα το έχω μαζί μου αύριο μετά το μάθημα.	2026-09-18 11:18:10.395605+00
5	5	3	Ευχαριστώ πολύ για τη δωρεά του βιβλίου!	2026-09-18 11:18:10.395605+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.notifications (id, user_id, content, is_read, created_at, listing_id) FROM stdin;
1	4	Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Εισαγωγή στους Αλγορίθμους - Cormen et al.'	f	2026-09-18 11:18:10.440392+00	2
2	3	Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Τεχνητή Νοημοσύνη - Ι. Βλαχάβας κ.ά.'	t	2026-09-18 11:18:10.440392+00	1
3	2	Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: 'Εισαγωγή στους Αλγορίθμους - Cormen et al.'	f	2026-09-18 11:18:10.440392+00	2
\.


--
-- Data for Name: proposal_offered_books; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.proposal_offered_books (proposal_id, listing_id) FROM stdin;
1	4
1	5
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.proposals (id, listing_id, requester_id, type, status, created_at) FROM stdin;
1	1	5	exchange	accepted	2026-09-18 11:18:10.369935+00
2	2	2	sale	pending	2026-09-18 11:18:10.369935+00
3	3	3	donation	rejected	2026-09-18 11:18:10.369935+00
4	6	2	sale	accepted	2026-09-18 11:18:10.369935+00
5	7	3	donation	accepted	2026-09-18 11:18:10.369935+00
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.reports (id, reporter_id, reported_user_id, reason, status, created_at) FROM stdin;
1	2	3	Δεν εμφανίστηκε στο ραντεβού παράδοσης.	open	2026-09-18 11:18:10.452541+00
2	4	5	Η περιγραφή της αγγελίας δεν αντιστοιχούσε στο βιβλίο.	resolved	2026-09-18 11:18:10.452541+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.reviews (id, proposal_id, reviewer_id, reviewee_id, rating, comment, created_at) FROM stdin;
1	1	2	5	5	Πολύ καλή κατάσταση το βιβλίο της Αναγνώρισης Προτύπων και άμεση συνεννόηση!	2026-09-18 11:18:10.412155+00
2	1	5	2	5	Ευχαριστώ πολύ! Άψογη συνεργασία και το βιβλίο ΤΝ ήταν σαν καινούργιο.	2026-09-18 11:18:10.412155+00
3	4	2	3	4	Γρήγορη συνεννόηση και το βιβλίο ήταν σε πολύ καλή κατάσταση.	2026-09-18 11:18:10.412155+00
4	5	3	4	5	Ευχαριστώ για τη δωρεά και την άμεση παράδοση.	2026-09-18 11:18:10.412155+00
\.


--
-- Data for Name: suggested_books; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.suggested_books (id, title, isbn, course_id) FROM stdin;
1	Τεχνητή Νοημοσύνη (Ι. Βλαχάβας, Π. Κεφαλάς κ.ά.)	978-618-5196-44-8	1
2	Εισαγωγή στους Αλγορίθμους (T. Cormen, C. Leiserson κ.ά.)	978-960-524-473-6	2
3	Δομές Δεδομένων, Αλγόριθμοι και Εφαρμογές στη C++ (S. Sahni)	978-960-418-030-1	3
4	Αναγνώριση Προτύπων (Σ. Θεοδωρίδης, Κ. Κουτρούμπας)	978-960-489-145-0	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.users (id, institutional_email, hashed_password, full_name, role, is_blocked, created_at) FROM stdin;
1	admin@unipi.gr	$2b$12$nn.8TnMAmKQKJT/.j1Yh5OfQECadnwiRGjM7Zju65vyJRhyczxlcq	Διαχειριστής Συστήματος	admin	f	2026-09-18 11:18:10.28801+00
2	maria@unipi.gr	$2b$12$QAiYuGl9YAZQ.iDgeuzVB.6hGuSi2GchrDSCH42ZKTtQ97XWXIrYq	Μαρία Παπαδοπούλου	student	f	2026-09-18 11:18:10.28801+00
3	giannis@unipi.gr	$2b$12$lTc7s9a5zEnbJJSvCYVtx.oeFGLujACn.dN9DNTN5LumWWDwTgDR2	Γιάννης Κωνσταντίνου	student	f	2026-09-18 11:18:10.28801+00
4	eleni@unipi.gr	$2b$12$bZmZRO01OkRhMpCFB1.SUeuLHcZ/H4pIHeFMaHDJlft8XAStTunMm	Ελένη Δημητρίου	student	f	2026-09-18 11:18:10.28801+00
5	kostas@unipi.gr	$2b$12$HkCHxbHxfnPJ0kbuzosXTuDnW47XLrpQMcyf.0BnCkL.I0eEnKnVu	Κώστας Αντωνίου	student	f	2026-09-18 11:18:10.28801+00
6	nikos@unipi.gr	$2b$12$0AR8W7El7v3ba64kmZ/abuH/WM9FFxS4nUjaB0g35MAS8SvO34mEm	Νίκος Γεωργίου	student	t	2026-09-18 11:18:10.28801+00
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: rebook
--

COPY public.wishlist_items (id, user_id, course_id, title, isbn, created_at) FROM stdin;
1	4	2	\N	\N	2026-09-18 11:18:10.428813+00
2	3	\N	\N	978-618-5196-44-8	2026-09-18 11:18:10.428813+00
3	2	\N	Αλγορίθμους	\N	2026-09-18 11:18:10.428813+00
\.


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.courses_id_seq', 4, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.departments_id_seq', 1, true);


--
-- Name: listing_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.listing_photos_id_seq', 5, true);


--
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.listings_id_seq', 8, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.messages_id_seq', 5, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.notifications_id_seq', 3, true);


--
-- Name: proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.proposals_id_seq', 5, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.reports_id_seq', 2, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.reviews_id_seq', 4, true);


--
-- Name: suggested_books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.suggested_books_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebook
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 3, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: listing_photos listing_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listing_photos
    ADD CONSTRAINT listing_photos_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: proposal_offered_books proposal_offered_books_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposal_offered_books
    ADD CONSTRAINT proposal_offered_books_pkey PRIMARY KEY (proposal_id, listing_id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: suggested_books suggested_books_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.suggested_books
    ADD CONSTRAINT suggested_books_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: ix_users_institutional_email; Type: INDEX; Schema: public; Owner: rebook
--

CREATE UNIQUE INDEX ix_users_institutional_email ON public.users USING btree (institutional_email);


--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: listing_photos listing_photos_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listing_photos
    ADD CONSTRAINT listing_photos_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: listings listings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: listings listings_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: messages messages_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: proposal_offered_books proposal_offered_books_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposal_offered_books
    ADD CONSTRAINT proposal_offered_books_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: proposal_offered_books proposal_offered_books_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposal_offered_books
    ADD CONSTRAINT proposal_offered_books_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: proposals proposals_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: proposals proposals_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: reports reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.users(id);


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: suggested_books suggested_books_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.suggested_books
    ADD CONSTRAINT suggested_books_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: wishlist_items wishlist_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: rebook
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict jTldPe6Vw0IkA6GuslJMAJ1aTtykc0WclJRMajUaopreYWb0cSKMHHjbGGDnGWg

