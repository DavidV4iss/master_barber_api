-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Servidor: masterbarber.cy7sgui0w3vd.us-east-1.rds.amazonaws.com
-- Tiempo de generación: 30-07-2025 a las 14:58:37
-- Versión del servidor: 8.0.41
-- Versión de PHP: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `master_barber`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `puntuacion` int DEFAULT NULL,
  `comentario` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id`, `usuario_id`, `puntuacion`, `comentario`) VALUES
(1, 103, 5, ''),
(2, 103, 5, ''),
(3, 103, 5, ''),
(4, 103, 0, ''),
(5, 103, 5, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_producto`
--

CREATE TABLE `categoria_producto` (
  `id_categoria_producto` int NOT NULL,
  `categoria` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_producto`
--

INSERT INTO `categoria_producto` (`id_categoria_producto`, `categoria`) VALUES
(1, 'Ropa'),
(2, 'Accesorios'),
(3, 'Productos de cuidado personal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_producto` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion_P` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int NOT NULL,
  `id_categoria_producto` int NOT NULL,
  `proveedor` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `PrecioUnitario` int NOT NULL,
  `fecha_venta` datetime DEFAULT NULL,
  `Foto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_producto`, `nombre`, `descripcion_P`, `cantidad`, `id_categoria_producto`, `proveedor`, `PrecioUnitario`, `fecha_venta`, `Foto`) VALUES
(90, 'Atomizador', 'Atomizador', 100, 3, 'Versace', 700000, '2025-06-02 20:24:00', 'inventario_1748916245963-Atomizadorjpg.jpg'),
(91, 'Locion Desinfectante', 'Desinfecta', 100, 3, 'Versace', 700000, '2025-06-02 21:05:00', 'inventario_1748916320603-LOCION-REFRESCANTEjpg.jpg'),
(92, 'Gel Para Afeitar', 'Afeitar', 100, 3, 'Coca cola', 700000, '2025-06-02 21:05:00', 'inventario_1748916347177-GEL_PARA_AFEITAR.jpg'),
(93, 'Maquina Para Barberia', 'Corte Fino', 100, 3, 'Versace', 700000, '2025-06-02 21:06:00', 'inventario_1748916401970-Maquina.jpg'),
(94, 'Porta Cuchillas', 'Corte Fino', 100, 3, 'Versace', 700000, '2025-06-02 21:07:00', 'inventario_1748916439591-Porta Navajas.jpg'),
(95, 'Polvos Texturizantes', 'Un Corte Texturizado', 100, 3, 'Versace', 700000, '2025-06-02 21:07:00', 'inventario_1748916480041-texturizante.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL,
  `cliente_id` int NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id_notificacion`, `cliente_id`, `mensaje`) VALUES
(78, 64, 'El estado de tu reserva ha sido actualizado a: finalizada. Servicio: Corte premium, Fecha:18/7/2025, 8:00:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL,
  `cliente_id` int NOT NULL,
  `barbero_id` int NOT NULL,
  `servicio` int NOT NULL,
  `fecha` datetime NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `observacion` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(55) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Barbero'),
(3, 'Cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_servicio`
--

CREATE TABLE `tipo_servicio` (
  `id_tipo_servicio` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion_S` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `precio` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_servicio`
--

INSERT INTO `tipo_servicio` (`id_tipo_servicio`, `nombre`, `descripcion_S`, `precio`) VALUES
(1, 'Corte basico', 'Solo corte, sin mascarillas, sin barba y ninguno de otros', '20.000'),
(2, 'Corte premium', 'Incluye corte, barba, cejas, lineas dependiendo el gusto y mascarillas ', '60.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL,
  `nombre_usuario` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(55) COLLATE utf8mb4_general_ci NOT NULL,
  `nit` int NOT NULL,
  `telefono` varchar(55) COLLATE utf8mb4_general_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `id_rol` int NOT NULL,
  `user_reset_code` varchar(7) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_reset_code_expiration` datetime DEFAULT NULL,
  `Foto` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `email`, `nit`, `telefono`, `contrasena`, `id_rol`, `user_reset_code`, `user_reset_code_expiration`, `Foto`, `descripcion`) VALUES
(6, 'ADMINISTRADOR', 'Admin@gmail.com', 1028662004, '3142758305', '$2a$10$gKkjGOeNlRvXzyePlVJq1.r/9Y.F6.f.UROSSUNuM7Sjv1xkZyRo.', 1, NULL, NULL, '1749472486072-MB3.JPG', ''),
(64, 'Usuario 1', 'Usuario@gmail.com', 1028662003, '3107877174', '$2a$10$T8tSncl7F6gquU0V2FJ1HO/dSe5XUH9nZmT8KmuHqJJPSY4w7ta4S', 3, '157515', '2025-05-14 20:20:34', NULL, ''),
(103, 'Fidel', 'fideljoseespi10@gmail.com', 1028662008, '3142758305', '$2a$10$XlUPDnbS9Wwz.PLSy5rLk.1ETw/UNrZqdWJnpajM2jYxUqUpdwJiK', 3, NULL, NULL, '1753807170920-LOGO.png', ''),
(111, 'DEIBY', 'barbero@gmail.com', 0, '', '$2a$10$ZWUAq4p0hH4N5jGj9FhdLucnHPBSmylzQBrZORspKW.YylI5RVqti', 2, NULL, NULL, 'barbero_1753807050469-Corte8.jpg', 'Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte'),
(124, 'NIXXON', 'nixon@gmail.com', 0, '', '$2a$10$ZUr/KeJuDfiVzIj4Xxmm3uLXoRzjq9rg/tXjXFsQn8sXEZP/DTMyS', 2, NULL, NULL, 'barbero_1753807097120-MB2.JPG', 'Cortes Perfilados , Accesoria En Imagen Buen Uso De Las Maquinas Y El Ambinte'),
(125, 'Dilan', 'dilan@gmail.com', 1024336532, '3138975212', '$2a$10$33gCV7QWIQ/s2dAfTP39bOkKQs1Xa/ZsGa0pIX5e0D8gAxSV4Pmja', 3, NULL, NULL, NULL, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `PrecioUnitario` decimal(10,2) NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `id_producto`, `cantidad`, `fecha`, `PrecioUnitario`, `nombre`) VALUES
(163, 90, 1, '2025-06-03 04:18:48', '700000.00', 'Atomizador'),
(164, 91, 1, '2025-06-03 04:18:48', '700000.00', 'Locion Desinfectante'),
(165, 92, 1, '2025-06-03 04:18:48', '700000.00', 'Gel Para Afeitar'),
(166, 93, 1, '2025-06-03 04:18:48', '700000.00', 'Maquina Para Barberia'),
(167, 94, 1, '2025-06-03 04:18:48', '700000.00', 'Porta Cuchillas'),
(168, 95, 1, '2025-06-03 04:18:48', '700000.00', 'Polvos Texturizantes'),
(169, 90, 10, '2025-06-03 04:39:36', '700000.00', 'Atomizador'),
(170, 91, 3, '2025-06-03 04:39:43', '700000.00', 'Locion Desinfectante'),
(171, 92, 2, '2025-06-03 04:39:43', '700000.00', 'Gel Para Afeitar'),
(172, 95, 1, '2025-06-03 04:39:43', '700000.00', 'Polvos Texturizantes'),
(173, 94, 2, '2025-06-03 04:39:43', '700000.00', 'Porta Cuchillas'),
(174, 93, 1, '2025-06-03 04:39:43', '700000.00', 'Maquina Para Barberia'),
(175, 94, 7, '2025-06-03 04:39:49', '700000.00', 'Porta Cuchillas'),
(176, 91, 1, '2025-06-03 04:39:49', '700000.00', 'Locion Desinfectante'),
(177, 92, 1, '2025-06-03 04:39:49', '700000.00', 'Gel Para Afeitar');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  ADD PRIMARY KEY (`id_categoria_producto`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria_producto` (`id_categoria_producto`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `barbero_id` (`barbero_id`),
  ADD KEY `servicio` (`servicio`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `tipo_servicio`
--
ALTER TABLE `tipo_servicio`
  ADD PRIMARY KEY (`id_tipo_servicio`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  MODIFY `id_categoria_producto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_producto` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;
--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;
--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;
--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;
--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=178;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `producto categoria producto` FOREIGN KEY (`id_categoria_producto`) REFERENCES `categoria_producto` (`id_categoria_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`barbero_id`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `reservas_ibfk_3` FOREIGN KEY (`servicio`) REFERENCES `tipo_servicio` (`id_tipo_servicio`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuario rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
