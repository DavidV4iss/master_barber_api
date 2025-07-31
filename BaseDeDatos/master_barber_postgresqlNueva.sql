--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-31 11:30:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: master_barber
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO master_barber;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16679)
-- Name: calificaciones; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.calificaciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    puntuacion integer,
    comentario text
);


ALTER TABLE public.calificaciones OWNER TO master_barber;

--
-- TOC entry 220 (class 1259 OID 16678)
-- Name: calificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.calificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calificaciones_id_seq OWNER TO master_barber;

--
-- TOC entry 3456 (class 0 OID 0)
-- Dependencies: 220
-- Name: calificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.calificaciones_id_seq OWNED BY public.calificaciones.id;


--
-- TOC entry 223 (class 1259 OID 16693)
-- Name: categoria_producto; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.categoria_producto (
    id_categoria_producto integer NOT NULL,
    categoria character varying(255) NOT NULL
);


ALTER TABLE public.categoria_producto OWNER TO master_barber;

--
-- TOC entry 222 (class 1259 OID 16692)
-- Name: categoria_producto_id_categoria_producto_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.categoria_producto_id_categoria_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_producto_id_categoria_producto_seq OWNER TO master_barber;

--
-- TOC entry 3457 (class 0 OID 0)
-- Dependencies: 222
-- Name: categoria_producto_id_categoria_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.categoria_producto_id_categoria_producto_seq OWNED BY public.categoria_producto.id_categoria_producto;


--
-- TOC entry 224 (class 1259 OID 16699)
-- Name: inventario; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.inventario (
    id_producto integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion_p character varying(255) NOT NULL,
    cantidad integer NOT NULL,
    id_categoria_producto integer NOT NULL,
    proveedor character varying(255) NOT NULL,
    preciounitario integer NOT NULL,
    fecha_venta timestamp without time zone,
    foto character varying(255)
);


ALTER TABLE public.inventario OWNER TO master_barber;

--
-- TOC entry 234 (class 1259 OID 16771)
-- Name: inventario_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

ALTER TABLE public.inventario ALTER COLUMN id_producto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.inventario_id_producto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16743)
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.notificaciones (
    id_notificacion integer NOT NULL,
    cliente_id integer NOT NULL,
    mensaje text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notificaciones OWNER TO master_barber;

--
-- TOC entry 229 (class 1259 OID 16742)
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.notificaciones_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_notificacion_seq OWNER TO master_barber;

--
-- TOC entry 3458 (class 0 OID 0)
-- Dependencies: 229
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.notificaciones_id_notificacion_seq OWNED BY public.notificaciones.id_notificacion;


--
-- TOC entry 228 (class 1259 OID 16721)
-- Name: reservas; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.reservas (
    id_reserva integer NOT NULL,
    cliente_id integer NOT NULL,
    barbero_id integer NOT NULL,
    servicio integer NOT NULL,
    fecha timestamp without time zone NOT NULL,
    estado character varying(50) NOT NULL,
    observacion character varying(255) NOT NULL
);


ALTER TABLE public.reservas OWNER TO master_barber;

--
-- TOC entry 227 (class 1259 OID 16720)
-- Name: reservas_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.reservas_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_id_reserva_seq OWNER TO master_barber;

--
-- TOC entry 3459 (class 0 OID 0)
-- Dependencies: 227
-- Name: reservas_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.reservas_id_reserva_seq OWNED BY public.reservas.id_reserva;


--
-- TOC entry 218 (class 1259 OID 16660)
-- Name: rol; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    nombre_rol character varying(55) NOT NULL
);


ALTER TABLE public.rol OWNER TO master_barber;

--
-- TOC entry 217 (class 1259 OID 16659)
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_id_rol_seq OWNER TO master_barber;

--
-- TOC entry 3460 (class 0 OID 0)
-- Dependencies: 217
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;


--
-- TOC entry 226 (class 1259 OID 16712)
-- Name: tipo_servicio; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.tipo_servicio (
    id_tipo_servicio integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion_s character varying(255) NOT NULL,
    precio character varying(255) NOT NULL
);


ALTER TABLE public.tipo_servicio OWNER TO master_barber;

--
-- TOC entry 225 (class 1259 OID 16711)
-- Name: tipo_servicio_id_tipo_servicio_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.tipo_servicio_id_tipo_servicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_servicio_id_tipo_servicio_seq OWNER TO master_barber;

--
-- TOC entry 3461 (class 0 OID 0)
-- Dependencies: 225
-- Name: tipo_servicio_id_tipo_servicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.tipo_servicio_id_tipo_servicio_seq OWNED BY public.tipo_servicio.id_tipo_servicio;


--
-- TOC entry 219 (class 1259 OID 16666)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(255) NOT NULL,
    email character varying(55) NOT NULL,
    nit integer,
    telefono character varying(55),
    contrasena character varying(255) NOT NULL,
    id_rol integer NOT NULL,
    user_reset_code character varying(7),
    user_reset_code_expiration timestamp without time zone,
    foto character varying(255),
    descripcion character varying(255) NOT NULL
);


ALTER TABLE public.usuarios OWNER TO master_barber;

--
-- TOC entry 233 (class 1259 OID 16770)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

ALTER TABLE public.usuarios ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16758)
-- Name: ventas; Type: TABLE; Schema: public; Owner: master_barber
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    fecha timestamp without time zone,
    preciounitario numeric(10,2) NOT NULL,
    nombre character varying(255) NOT NULL
);


ALTER TABLE public.ventas OWNER TO master_barber;

--
-- TOC entry 231 (class 1259 OID 16757)
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: master_barber
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_id_seq OWNER TO master_barber;

--
-- TOC entry 3462 (class 0 OID 0)
-- Dependencies: 231
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: master_barber
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- TOC entry 3255 (class 2604 OID 16682)
-- Name: calificaciones id; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.calificaciones ALTER COLUMN id SET DEFAULT nextval('public.calificaciones_id_seq'::regclass);


--
-- TOC entry 3256 (class 2604 OID 16696)
-- Name: categoria_producto id_categoria_producto; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.categoria_producto ALTER COLUMN id_categoria_producto SET DEFAULT nextval('public.categoria_producto_id_categoria_producto_seq'::regclass);


--
-- TOC entry 3259 (class 2604 OID 16746)
-- Name: notificaciones id_notificacion; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificaciones_id_notificacion_seq'::regclass);


--
-- TOC entry 3258 (class 2604 OID 16724)
-- Name: reservas id_reserva; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id_reserva SET DEFAULT nextval('public.reservas_id_reserva_seq'::regclass);


--
-- TOC entry 3254 (class 2604 OID 16663)
-- Name: rol id_rol; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);


--
-- TOC entry 3257 (class 2604 OID 16715)
-- Name: tipo_servicio id_tipo_servicio; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.tipo_servicio ALTER COLUMN id_tipo_servicio SET DEFAULT nextval('public.tipo_servicio_id_tipo_servicio_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 16761)
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- TOC entry 3437 (class 0 OID 16679)
-- Dependencies: 221
-- Data for Name: calificaciones; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.calificaciones (id, usuario_id, puntuacion, comentario) FROM stdin;
1	103	5	
2	103	5	
3	103	5	
4	103	0	
5	103	5	
\.


--
-- TOC entry 3439 (class 0 OID 16693)
-- Dependencies: 223
-- Data for Name: categoria_producto; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.categoria_producto (id_categoria_producto, categoria) FROM stdin;
1	Ropa
2	Accesorios
3	Productos de cuidado personal
\.


--
-- TOC entry 3440 (class 0 OID 16699)
-- Dependencies: 224
-- Data for Name: inventario; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.inventario (id_producto, nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, preciounitario, fecha_venta, foto) FROM stdin;
90	Atomizador	Atomizador	100	3	Versace	700000	2025-06-02 20:24:00	inventario_1748916245963-Atomizadorjpg.jpg
91	Locion Desinfectante	Desinfecta	100	3	Versace	700000	2025-06-02 21:05:00	inventario_1748916320603-LOCION-REFRESCANTEjpg.jpg
92	Gel Para Afeitar	Afeitar	100	3	Coca cola	700000	2025-06-02 21:05:00	inventario_1748916347177-GEL_PARA_AFEITAR.jpg
93	Maquina Para Barberia	Corte Fino	100	3	Versace	700000	2025-06-02 21:06:00	inventario_1748916401970-Maquina.jpg
94	Porta Cuchillas	Corte Fino	100	3	Versace	700000	2025-06-02 21:07:00	inventario_1748916439591-Porta Navajas.jpg
95	Polvos Texturizantes	Un Corte Texturizado	100	3	Versace	700000	2025-06-02 21:07:00	inventario_1748916480041-texturizante.jpg
\.


--
-- TOC entry 3446 (class 0 OID 16743)
-- Dependencies: 230
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.notificaciones (id_notificacion, cliente_id, mensaje, fecha) FROM stdin;
5	103	El estado de tu reserva ha sido actualizado a: Aceptada. Servicio: Corte premium, Fecha:7/31/2025, 10:00:00 PM	2025-07-31 22:00:00
\.


--
-- TOC entry 3444 (class 0 OID 16721)
-- Dependencies: 228
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.reservas (id_reserva, cliente_id, barbero_id, servicio, fecha, estado, observacion) FROM stdin;
4	103	5	2	2025-07-31 22:00:00	Aceptada	
\.


--
-- TOC entry 3434 (class 0 OID 16660)
-- Dependencies: 218
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.rol (id_rol, nombre_rol) FROM stdin;
1	Administrador
2	Barbero
3	Cliente
\.


--
-- TOC entry 3442 (class 0 OID 16712)
-- Dependencies: 226
-- Data for Name: tipo_servicio; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.tipo_servicio (id_tipo_servicio, nombre, descripcion_s, precio) FROM stdin;
1	Corte basico	Solo corte, sin mascarillas, sin barba y ninguno de otros	20.000
2	Corte premium	Incluye corte, barba, cejas, lineas dependiendo el gusto y mascarillas 	60.000
\.


--
-- TOC entry 3435 (class 0 OID 16666)
-- Dependencies: 219
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.usuarios (id_usuario, nombre_usuario, email, nit, telefono, contrasena, id_rol, user_reset_code, user_reset_code_expiration, foto, descripcion) FROM stdin;
5	DEIBY	deiby@gmail.com	\N	\N	$2a$10$DeaU9EpB/MY8Z5SCtDAuWusNgfGmntPlL/53yW0Tq47h3ogLIUsqq	2	\N	\N	https://res.cloudinary.com/dnh1n2jbq/image/upload/v1753971267/barberos/ik7vtgdfihvjp0rejtta.jpg	Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte
6	ADMINISTRADOR	Admin@gmail.com	1028662004	3142758305	$2a$10$gKkjGOeNlRvXzyePlVJq1.r/9Y.F6.f.UROSSUNuM7Sjv1xkZyRo.	1	\N	\N	perfiles/plwfzyac10end41a20x9	
103	Fidel	fideljoseespi10@gmail.com	1028662008	3142758305	$2a$10$XlUPDnbS9Wwz.PLSy5rLk.1ETw/UNrZqdWJnpajM2jYxUqUpdwJiK	3	\N	\N	perfiles/ryv1thnbdicyamawulfw	
7	NIXON	nixon@gmail.com	\N	\N	$2a$10$s3UgIxVFHBDQWLM2bOHpoe0mwSIIv3vXDY44ReM4IJt90xd1Dv.jW	2	\N	\N	https://res.cloudinary.com/dnh1n2jbq/image/upload/v1753978568/barberos/dqv6ys9fu7dadvr4fdae.jpg	Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte
\.


--
-- TOC entry 3448 (class 0 OID 16758)
-- Dependencies: 232
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: master_barber
--

COPY public.ventas (id, id_producto, cantidad, fecha, preciounitario, nombre) FROM stdin;
163	90	1	2025-06-03 04:18:48	700000.00	Atomizador
164	91	1	2025-06-03 04:18:48	700000.00	Locion Desinfectante
165	92	1	2025-06-03 04:18:48	700000.00	Gel Para Afeitar
166	93	1	2025-06-03 04:18:48	700000.00	Maquina Para Barberia
167	94	1	2025-06-03 04:18:48	700000.00	Porta Cuchillas
168	95	1	2025-06-03 04:18:48	700000.00	Polvos Texturizantes
169	90	10	2025-06-03 04:39:36	700000.00	Atomizador
170	91	3	2025-06-03 04:39:43	700000.00	Locion Desinfectante
171	92	2	2025-06-03 04:39:43	700000.00	Gel Para Afeitar
172	95	1	2025-06-03 04:39:43	700000.00	Polvos Texturizantes
173	94	2	2025-06-03 04:39:43	700000.00	Porta Cuchillas
174	93	1	2025-06-03 04:39:43	700000.00	Maquina Para Barberia
175	94	7	2025-06-03 04:39:49	700000.00	Porta Cuchillas
176	91	1	2025-06-03 04:39:49	700000.00	Locion Desinfectante
177	92	1	2025-06-03 04:39:49	700000.00	Gel Para Afeitar
\.


--
-- TOC entry 3463 (class 0 OID 0)
-- Dependencies: 220
-- Name: calificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.calificaciones_id_seq', 1, false);


--
-- TOC entry 3464 (class 0 OID 0)
-- Dependencies: 222
-- Name: categoria_producto_id_categoria_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.categoria_producto_id_categoria_producto_seq', 1, false);


--
-- TOC entry 3465 (class 0 OID 0)
-- Dependencies: 234
-- Name: inventario_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.inventario_id_producto_seq', 3, true);


--
-- TOC entry 3466 (class 0 OID 0)
-- Dependencies: 229
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.notificaciones_id_notificacion_seq', 5, true);


--
-- TOC entry 3467 (class 0 OID 0)
-- Dependencies: 227
-- Name: reservas_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.reservas_id_reserva_seq', 4, true);


--
-- TOC entry 3468 (class 0 OID 0)
-- Dependencies: 217
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 1, false);


--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 225
-- Name: tipo_servicio_id_tipo_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.tipo_servicio_id_tipo_servicio_seq', 1, false);


--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 233
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 7, true);


--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 231
-- Name: ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: master_barber
--

SELECT pg_catalog.setval('public.ventas_id_seq', 1, false);


--
-- TOC entry 3267 (class 2606 OID 16686)
-- Name: calificaciones calificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3269 (class 2606 OID 16698)
-- Name: categoria_producto categoria_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.categoria_producto
    ADD CONSTRAINT categoria_producto_pkey PRIMARY KEY (id_categoria_producto);


--
-- TOC entry 3271 (class 2606 OID 16705)
-- Name: inventario inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_pkey PRIMARY KEY (id_producto);


--
-- TOC entry 3277 (class 2606 OID 16751)
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion);


--
-- TOC entry 3275 (class 2606 OID 16726)
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id_reserva);


--
-- TOC entry 3263 (class 2606 OID 16665)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 3273 (class 2606 OID 16719)
-- Name: tipo_servicio tipo_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.tipo_servicio
    ADD CONSTRAINT tipo_servicio_pkey PRIMARY KEY (id_tipo_servicio);


--
-- TOC entry 3265 (class 2606 OID 16672)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 3279 (class 2606 OID 16763)
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- TOC entry 3281 (class 2606 OID 16687)
-- Name: calificaciones calificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 3282 (class 2606 OID 16706)
-- Name: inventario inventario_id_categoria_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_id_categoria_producto_fkey FOREIGN KEY (id_categoria_producto) REFERENCES public.categoria_producto(id_categoria_producto) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3286 (class 2606 OID 16752)
-- Name: notificaciones notificaciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 3283 (class 2606 OID 16732)
-- Name: reservas reservas_barbero_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_barbero_id_fkey FOREIGN KEY (barbero_id) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 3284 (class 2606 OID 16727)
-- Name: reservas reservas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 3285 (class 2606 OID 16737)
-- Name: reservas reservas_servicio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_servicio_fkey FOREIGN KEY (servicio) REFERENCES public.tipo_servicio(id_tipo_servicio);


--
-- TOC entry 3280 (class 2606 OID 16673)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- TOC entry 3287 (class 2606 OID 16764)
-- Name: ventas ventas_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: master_barber
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.inventario(id_producto);


--
-- TOC entry 2085 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO master_barber;


--
-- TOC entry 2087 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO master_barber;


--
-- TOC entry 2086 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO master_barber;


--
-- TOC entry 2084 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO master_barber;


-- Completed on 2025-07-31 11:31:12

--
-- PostgreSQL database dump complete
--

