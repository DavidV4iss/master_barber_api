-- Crear base de datos (opcional)
-- CREATE DATABASE master_barber;
-- \c master_barber;

-- Tabla: rol
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(55) NOT NULL
);

INSERT INTO rol (id_rol, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Barbero'),
(3, 'Cliente');

-- Tabla: usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(255) NOT NULL,
    email VARCHAR(55) NOT NULL,
    nit INTEGER NOT NULL,
    telefono VARCHAR(55) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES rol(id_rol),
    user_reset_code VARCHAR(7),
    user_reset_code_expiration TIMESTAMP,
    Foto VARCHAR(255),
    descripcion VARCHAR(255) NOT NULL
);

-- Tabla: calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    puntuacion INTEGER,
    comentario TEXT
);

INSERT INTO calificaciones (id, usuario_id, puntuacion, comentario) VALUES
(1, 103, 5, ''),
(2, 103, 5, ''),
(3, 103, 5, ''),
(4, 103, 0, ''),
(5, 103, 5, '');

-- Tabla: categoria_producto
CREATE TABLE categoria_producto (
    id_categoria_producto SERIAL PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL
);

INSERT INTO categoria_producto (id_categoria_producto, categoria) VALUES
(1, 'Ropa'),
(2, 'Accesorios'),
(3, 'Productos de cuidado personal');

-- Tabla: inventario
CREATE TABLE inventario (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion_P VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    id_categoria_producto INTEGER NOT NULL REFERENCES categoria_producto(id_categoria_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    proveedor VARCHAR(255) NOT NULL,
    PrecioUnitario INTEGER NOT NULL,
    fecha_venta TIMESTAMP,
    Foto VARCHAR(255)
);

-- Tabla: tipo_servicio
CREATE TABLE tipo_servicio (
    id_tipo_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion_S VARCHAR(255) NOT NULL,
    precio VARCHAR(255) NOT NULL
);

INSERT INTO tipo_servicio (id_tipo_servicio, nombre, descripcion_S, precio) VALUES
(1, 'Corte basico', 'Solo corte, sin mascarillas, sin barba y ninguno de otros', '20.000'),
(2, 'Corte premium', 'Incluye corte, barba, cejas, lineas dependiendo el gusto y mascarillas ', '60.000');

-- Tabla: reservas
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    barbero_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    servicio INTEGER NOT NULL REFERENCES tipo_servicio(id_tipo_servicio),
    fecha TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,
    observacion VARCHAR(255) NOT NULL
);

-- Tabla: notificaciones
CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES inventario(id_producto),
    cantidad INTEGER NOT NULL,
    fecha TIMESTAMP,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    nombre VARCHAR(255) NOT NULL
);


-- Insertar datos en inventario
INSERT INTO inventario (id_producto, nombre, descripcion_P, cantidad, id_categoria_producto, proveedor, PrecioUnitario, fecha_venta, Foto) VALUES
(90, 'Atomizador', 'Atomizador', 100, 3, 'Versace', 700000, '2025-06-02 20:24:00', 'inventario_1748916245963-Atomizadorjpg.jpg'),
(91, 'Locion Desinfectante', 'Desinfecta', 100, 3, 'Versace', 700000, '2025-06-02 21:05:00', 'inventario_1748916320603-LOCION-REFRESCANTEjpg.jpg'),
(92, 'Gel Para Afeitar', 'Afeitar', 100, 3, 'Coca cola', 700000, '2025-06-02 21:05:00', 'inventario_1748916347177-GEL_PARA_AFEITAR.jpg'),
(93, 'Maquina Para Barberia', 'Corte Fino', 100, 3, 'Versace', 700000, '2025-06-02 21:06:00', 'inventario_1748916401970-Maquina.jpg'),
(94, 'Porta Cuchillas', 'Corte Fino', 100, 3, 'Versace', 700000, '2025-06-02 21:07:00', 'inventario_1748916439591-Porta Navajas.jpg'),
(95, 'Polvos Texturizantes', 'Un Corte Texturizado', 100, 3, 'Versace', 700000, '2025-06-02 21:07:00', 'inventario_1748916480041-texturizante.jpg');

-- Insertar datos en notificaciones
INSERT INTO notificaciones (id_notificacion, cliente_id, mensaje, fecha) VALUES
(78, 64, 'El estado de tu reserva ha sido actualizado a: finalizada. Servicio: Corte premium, Fecha:18/7/2025, 8:00:28', CURRENT_TIMESTAMP);

-- Insertar datos en usuarios
INSERT INTO usuarios (id_usuario, nombre_usuario, email, nit, telefono, contrasena, id_rol, user_reset_code, user_reset_code_expiration, Foto, descripcion) VALUES
(6, 'ADMINISTRADOR', 'Admin@gmail.com', 1028662004, '3142758305', '$2a$10$gKkjGOeNlRvXzyePlVJq1.r/9Y.F6.f.UROSSUNuM7Sjv1xkZyRo.', 1, NULL, NULL, '1749472486072-MB3.JPG', ''),
(64, 'Usuario 1', 'Usuario@gmail.com', 1028662003, '3107877174', '$2a$10$T8tSncl7F6gquU0V2FJ1HO/dSe5XUH9nZmT8KmuHqJJPSY4w7ta4S', 3, '157515', '2025-05-14 20:20:34', NULL, ''),
(103, 'Fidel', 'fideljoseespi10@gmail.com', 1028662008, '3142758305', '$2a$10$XlUPDnbS9Wwz.PLSy5rLk.1ETw/UNrZqdWJnpajM2jYxUqUpdwJiK', 3, NULL, NULL, '1753807170920-LOGO.png', ''),
(111, 'DEIBY', 'barbero@gmail.com', 0, '', '$2a$10$ZWUAq4p0hH4N5jGj9FhdLucnHPBSmylzQBrZORspKW.YylI5RVqti', 2, NULL, NULL, 'barbero_1753807050469-Corte8.jpg', 'Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte'),
(124, 'NIXXON', 'nixon@gmail.com', 0, '', '$2a$10$ZUr/KeJuDfiVzIj4Xxmm3uLXoRzjq9rg/tXjXFsQn8sXEZP/DTMyS', 2, NULL, NULL, 'barbero_1753807097120-MB2.JPG', 'Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte'),
(125, 'Dilan', 'dilan@gmail.com', 1024336532, '3138975212', '$2a$10$33gCV7QWIQ/s2dAfTP39bOkKQs1Xa/ZsGa0pIX5e0D8gAxSV4Pmja', 3, NULL, NULL, NULL, '');

-- Insertar datos en ventas
INSERT INTO ventas (id, id_producto, cantidad, fecha, PrecioUnitario, nombre) VALUES
(163, 90, 1, '2025-06-03 04:18:48', 700000.00, 'Atomizador'),
(164, 91, 1, '2025-06-03 04:18:48', 700000.00, 'Locion Desinfectante'),
(165, 92, 1, '2025-06-03 04:18:48', 700000.00, 'Gel Para Afeitar'),
(166, 93, 1, '2025-06-03 04:18:48', 700000.00, 'Maquina Para Barberia'),
(167, 94, 1, '2025-06-03 04:18:48', 700000.00, 'Porta Cuchillas'),
(168, 95, 1, '2025-06-03 04:18:48', 700000.00, 'Polvos Texturizantes'),
(169, 90, 10, '2025-06-03 04:39:36', 700000.00, 'Atomizador'),
(170, 91, 3, '2025-06-03 04:39:43', 700000.00, 'Locion Desinfectante'),
(171, 92, 2, '2025-06-03 04:39:43', 700000.00, 'Gel Para Afeitar'),
(172, 95, 1, '2025-06-03 04:39:43', 700000.00, 'Polvos Texturizantes'),
(173, 94, 2, '2025-06-03 04:39:43', 700000.00, 'Porta Cuchillas'),
(174, 93, 1, '2025-06-03 04:39:43', 700000.00, 'Maquina Para Barberia'),
(175, 94, 7, '2025-06-03 04:39:49', 700000.00, 'Porta Cuchillas'),
(176, 91, 1, '2025-06-03 04:39:49', 700000.00, 'Locion Desinfectante'),
(177, 92, 1, '2025-06-03 04:39:49', 700000.00, 'Gel Para Afeitar');
