-- =====================================================================
--  ECORUTA - PWA de horarios de recolección de residuos
--  Script de base de datos MySQL 8.0 (compatible con Clever Cloud)
--  Autora: Liseth Arelis Giraldo Morales
--  Versión: 1.0  |  Fecha: 2026-10-01
-- ---------------------------------------------------------------------
--  IMPORTANTE (Clever Cloud):
--  Clever Cloud crea la base de datos automáticamente al aprovisionar
--  el add-on MySQL y su nombre viene en la variable MYSQL_ADDON_DB.
--  El usuario del add-on NO tiene permiso para CREATE DATABASE, por eso
--  esas líneas están comentadas. Conéctese a la BD asignada y ejecute
--  el script desde la sección 1 (por ejemplo con MySQL Workbench,
--  DBeaver o: mysql -h HOST -P PORT -u USER -p NOMBRE_BD < este_archivo.sql)
--
--  En entorno local sí puede descomentar las dos líneas siguientes.
-- =====================================================================

-- CREATE DATABASE IF NOT EXISTS ecoruta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE ecoruta;

SET NAMES utf8mb4;
SET time_zone = '-05:00';          -- Hora de Colombia (America/Bogota)
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 0. LIMPIEZA (permite re-ejecutar el script en desarrollo)
-- =====================================================================
DROP VIEW IF EXISTS vw_horarios_por_barrio;
DROP VIEW IF EXISTS vw_reportes_pendientes;
DROP PROCEDURE IF EXISTS sp_horarios_por_barrio;
DROP PROCEDURE IF EXISTS sp_proximas_recolecciones;
DROP PROCEDURE IF EXISTS sp_usuarios_a_notificar;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS reportes;
DROP TABLE IF EXISTS novedades;
DROP TABLE IF EXISTS suscripciones_push;
DROP TABLE IF EXISTS preferencias_notificacion;
DROP TABLE IF EXISTS ubicaciones_usuario;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS ruta_barrio;
DROP TABLE IF EXISTS rutas;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS tipos_residuo;
DROP TABLE IF EXISTS barrios;
DROP TABLE IF EXISTS zonas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. SEGURIDAD Y USUARIOS
-- =====================================================================

-- 1.1 Roles del sistema (ciudadano, operador, administrador)
CREATE TABLE roles (
    id_rol          TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(30)       NOT NULL,
    descripcion     VARCHAR(150)      NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id_rol),
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 1.2 Usuarios (la contraseña se guarda como hash bcrypt, 60 caracteres)
CREATE TABLE usuarios (
    id_usuario          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    id_rol              TINYINT UNSIGNED NOT NULL DEFAULT 1,
    nombres             VARCHAR(60)      NOT NULL,
    apellidos           VARCHAR(60)      NOT NULL,
    correo              VARCHAR(120)     NOT NULL,
    contrasena_hash     CHAR(60)         NOT NULL,
    telefono            VARCHAR(15)      NULL,
    acepta_tratamiento  BOOLEAN          NOT NULL DEFAULT FALSE, -- Ley 1581 de 2012
    estado              ENUM('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
    ultimo_acceso       DATETIME         NULL,
    fecha_creacion      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuarios_correo UNIQUE (correo),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol)
        REFERENCES roles (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =====================================================================
-- 2. TERRITORIO
-- =====================================================================

-- 2.1 Zonas operativas del municipio (agrupan barrios y veredas)
CREATE TABLE zonas (
    id_zona       SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(60)       NOT NULL,
    descripcion   VARCHAR(200)      NULL,
    activo        BOOLEAN           NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_zonas PRIMARY KEY (id_zona),
    CONSTRAINT uq_zonas_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2.2 Barrios (zona urbana) y veredas (zona rural)
CREATE TABLE barrios (
    id_barrio     INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    id_zona       SMALLINT UNSIGNED NOT NULL,
    nombre        VARCHAR(80)       NOT NULL,
    tipo          ENUM('barrio','vereda','sector') NOT NULL DEFAULT 'barrio',
    latitud       DECIMAL(9,6)      NULL,
    longitud      DECIMAL(9,6)      NULL,
    activo        BOOLEAN           NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_barrios PRIMARY KEY (id_barrio),
    CONSTRAINT uq_barrios_zona_nombre UNIQUE (id_zona, nombre),
    CONSTRAINT fk_barrios_zonas FOREIGN KEY (id_zona)
        REFERENCES zonas (id_zona) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_barrios_nombre (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =====================================================================
-- 3. OPERACIÓN DE RECOLECCIÓN
-- =====================================================================

-- 3.1 Tipos de residuo (código de colores Resolución 2184 de 2019)
CREATE TABLE tipos_residuo (
    id_tipo_residuo  TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(40)      NOT NULL,
    descripcion      VARCHAR(250)     NULL,
    color_hex        CHAR(7)          NOT NULL,   -- ej. #FFFFFF
    color_bolsa      VARCHAR(20)      NOT NULL,   -- blanca, negra, verde
    icono            VARCHAR(40)      NULL,       -- nombre del ícono en el frontend
    CONSTRAINT pk_tipos_residuo PRIMARY KEY (id_tipo_residuo),
    CONSTRAINT uq_tipos_residuo_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3.2 Vehículos recolectores (camiones compactadores)
CREATE TABLE vehiculos (
    id_vehiculo      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    placa            VARCHAR(7)        NOT NULL,
    codigo_interno   VARCHAR(15)       NULL,
    capacidad_ton    DECIMAL(5,2)      NULL,
    estado           ENUM('operativo','mantenimiento','fuera_servicio')
                                       NOT NULL DEFAULT 'operativo',
    CONSTRAINT pk_vehiculos PRIMARY KEY (id_vehiculo),
    CONSTRAINT uq_vehiculos_placa UNIQUE (placa)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3.3 Rutas de recolección
CREATE TABLE rutas (
    id_ruta          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_vehiculo      SMALLINT UNSIGNED NULL,      -- puede quedar sin vehículo asignado
    codigo           VARCHAR(10)       NOT NULL,  -- ej. R-01
    nombre           VARCHAR(80)       NOT NULL,
    descripcion      VARCHAR(250)      NULL,
    estado           ENUM('activa','suspendida','inactiva') NOT NULL DEFAULT 'activa',
    fecha_creacion   DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_rutas PRIMARY KEY (id_ruta),
    CONSTRAINT uq_rutas_codigo UNIQUE (codigo),
    CONSTRAINT fk_rutas_vehiculos FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculos (id_vehiculo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3.4 Relación N:M ruta - barrio (orden de paso y desfase estimado)
CREATE TABLE ruta_barrio (
    id_ruta            SMALLINT UNSIGNED NOT NULL,
    id_barrio          INT UNSIGNED      NOT NULL,
    orden_paso         TINYINT UNSIGNED  NOT NULL,
    minutos_desde_inicio SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- llegada aprox.
    CONSTRAINT pk_ruta_barrio PRIMARY KEY (id_ruta, id_barrio),
    CONSTRAINT uq_ruta_barrio_orden UNIQUE (id_ruta, orden_paso),
    CONSTRAINT fk_rb_rutas FOREIGN KEY (id_ruta)
        REFERENCES rutas (id_ruta) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rb_barrios FOREIGN KEY (id_barrio)
        REFERENCES barrios (id_barrio) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3.5 Horarios: qué día, a qué hora y qué tipo de residuo recoge cada ruta
--     dia_semana: 1 = lunes ... 7 = domingo (ISO-8601)
CREATE TABLE horarios (
    id_horario       INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    id_ruta          SMALLINT UNSIGNED NOT NULL,
    id_tipo_residuo  TINYINT UNSIGNED  NOT NULL,
    dia_semana       TINYINT UNSIGNED  NOT NULL,
    hora_inicio      TIME              NOT NULL,
    hora_fin         TIME              NOT NULL,
    jornada          ENUM('mañana','tarde','noche') NOT NULL,
    activo           BOOLEAN           NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_horarios PRIMARY KEY (id_horario),
    CONSTRAINT uq_horarios UNIQUE (id_ruta, id_tipo_residuo, dia_semana, hora_inicio),
    CONSTRAINT ck_horarios_dia CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT ck_horarios_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT fk_horarios_rutas FOREIGN KEY (id_ruta)
        REFERENCES rutas (id_ruta) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_horarios_tipos FOREIGN KEY (id_tipo_residuo)
        REFERENCES tipos_residuo (id_tipo_residuo) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_horarios_dia (dia_semana, hora_inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =====================================================================
-- 4. PERSONALIZACIÓN Y NOTIFICACIONES
-- =====================================================================

-- 4.1 Ubicaciones guardadas por el usuario (casa, trabajo, finca...)
CREATE TABLE ubicaciones_usuario (
    id_ubicacion     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_usuario       INT UNSIGNED  NOT NULL,
    id_barrio        INT UNSIGNED  NOT NULL,
    alias            VARCHAR(40)   NOT NULL DEFAULT 'Casa',
    direccion        VARCHAR(150)  NULL,
    es_principal     BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_creacion   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_ubicaciones PRIMARY KEY (id_ubicacion),
    CONSTRAINT uq_ubicaciones_alias UNIQUE (id_usuario, alias),
    CONSTRAINT fk_ubic_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ubic_barrios FOREIGN KEY (id_barrio)
        REFERENCES barrios (id_barrio) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4.2 Preferencias de notificación (relación 1:1 con usuarios)
CREATE TABLE preferencias_notificacion (
    id_usuario            INT UNSIGNED      NOT NULL,
    recordatorio_activo   BOOLEAN           NOT NULL DEFAULT TRUE,
    minutos_antes         SMALLINT UNSIGNED NOT NULL DEFAULT 60,
    recordatorio_noche    BOOLEAN           NOT NULL DEFAULT FALSE, -- aviso la noche anterior
    hora_noche            TIME              NOT NULL DEFAULT '20:00:00',
    avisar_novedades      BOOLEAN           NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_preferencias PRIMARY KEY (id_usuario),
    CONSTRAINT ck_pref_minutos CHECK (minutos_antes BETWEEN 5 AND 720),
    CONSTRAINT fk_pref_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4.3 Suscripciones Web Push (una por dispositivo/navegador)
CREATE TABLE suscripciones_push (
    id_suscripcion   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_usuario       INT UNSIGNED  NOT NULL,
    endpoint         VARCHAR(500)  NOT NULL,
    clave_p256dh     VARCHAR(255)  NOT NULL,
    clave_auth       VARCHAR(100)  NOT NULL,
    user_agent       VARCHAR(255)  NULL,
    activa           BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_suscripciones PRIMARY KEY (id_suscripcion),
    CONSTRAINT uq_suscripciones_endpoint UNIQUE (endpoint(255)),
    CONSTRAINT fk_susc_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4.4 Novedades: cambios de horario, cancelaciones, festivos, avisos
--     id_ruta NULL = novedad general para todo el municipio
CREATE TABLE novedades (
    id_novedad        INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    id_ruta           SMALLINT UNSIGNED NULL,
    id_usuario_autor  INT UNSIGNED      NOT NULL,
    tipo              ENUM('cambio_horario','cancelacion','festivo','informativo')
                                        NOT NULL DEFAULT 'informativo',
    titulo            VARCHAR(100)      NOT NULL,
    descripcion       TEXT              NOT NULL,
    fecha_inicio      DATE              NOT NULL,
    fecha_fin         DATE              NOT NULL,
    publicada         BOOLEAN           NOT NULL DEFAULT TRUE,
    fecha_publicacion DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_novedades PRIMARY KEY (id_novedad),
    CONSTRAINT ck_novedades_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT fk_nov_rutas FOREIGN KEY (id_ruta)
        REFERENCES rutas (id_ruta) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_nov_usuarios FOREIGN KEY (id_usuario_autor)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_novedades_vigencia (fecha_inicio, fecha_fin)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4.5 Reportes ciudadanos (el camión no pasó, retraso, residuos regados...)
CREATE TABLE reportes (
    id_reporte          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    id_usuario          INT UNSIGNED  NOT NULL,
    id_barrio           INT UNSIGNED  NOT NULL,
    tipo                ENUM('no_paso','retraso','residuos_regados','otro') NOT NULL,
    descripcion         VARCHAR(500)  NULL,
    estado              ENUM('pendiente','en_revision','resuelto','descartado')
                                      NOT NULL DEFAULT 'pendiente',
    respuesta           VARCHAR(500)  NULL,
    id_usuario_atiende  INT UNSIGNED  NULL,
    fecha_reporte       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta     DATETIME      NULL,
    CONSTRAINT pk_reportes PRIMARY KEY (id_reporte),
    CONSTRAINT fk_rep_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rep_barrios FOREIGN KEY (id_barrio)
        REFERENCES barrios (id_barrio) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_rep_atiende FOREIGN KEY (id_usuario_atiende)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_reportes_estado (estado, fecha_reporte)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4.6 Historial de notificaciones enviadas (bandeja dentro de la app)
CREATE TABLE notificaciones (
    id_notificacion  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario       INT UNSIGNED    NOT NULL,
    id_horario       INT UNSIGNED    NULL,
    id_novedad       INT UNSIGNED    NULL,
    tipo             ENUM('recordatorio','novedad','respuesta_reporte','sistema') NOT NULL,
    titulo           VARCHAR(100)    NOT NULL,
    mensaje          VARCHAR(300)    NOT NULL,
    leida            BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_envio      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_notificaciones PRIMARY KEY (id_notificacion),
    CONSTRAINT fk_not_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_not_horarios FOREIGN KEY (id_horario)
        REFERENCES horarios (id_horario) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_not_novedades FOREIGN KEY (id_novedad)
        REFERENCES novedades (id_novedad) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_not_usuario_leida (id_usuario, leida, fecha_envio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =====================================================================
-- 5. DATOS INICIALES (SEMILLA)
--  Los horarios y rutas son DATOS DE PRUEBA para desarrollo. Antes de
--  publicar, reemplácelos por la información oficial del prestador del
--  servicio de aseo del municipio.
-- =====================================================================

INSERT INTO roles (nombre, descripcion) VALUES
 ('ciudadano',     'Consulta horarios, recibe recordatorios y crea reportes'),
 ('operador',      'Gestiona horarios, novedades y atiende reportes'),
 ('administrador', 'Control total del sistema, usuarios y catálogos');

-- Contraseña de prueba para los tres usuarios: Eco2026*
-- (hash bcrypt real, 10 rondas). Genere uno nuevo con bcrypt en Node:
--   const hash = await bcrypt.hash('Eco2026*', 10);
INSERT INTO usuarios (id_rol, nombres, apellidos, correo, contrasena_hash, telefono, acepta_tratamiento) VALUES
 (3, 'Admin',  'EcoRuta',  'admin@ecoruta.co',    '$2b$10$IGNQP9dynZ9X5eCVJ3OizOanOmQ8Cnwwg8i3bTLLkUQCU4d6FsGDq', '3000000000', TRUE),
 (2, 'Carlos', 'Operador', 'operador@ecoruta.co', '$2b$10$IGNQP9dynZ9X5eCVJ3OizOanOmQ8Cnwwg8i3bTLLkUQCU4d6FsGDq', '3000000001', TRUE),
 (1, 'Ana',    'Ciudadana','ana@correo.com',      '$2b$10$IGNQP9dynZ9X5eCVJ3OizOanOmQ8Cnwwg8i3bTLLkUQCU4d6FsGDq', '3000000002', TRUE);

INSERT INTO zonas (nombre, descripcion) VALUES
 ('Zona Centro',     'Casco urbano central'),
 ('Zona Sur',        'Sector sur y corredor San Antonio'),
 ('Zona Norte',      'Sector norte urbano'),
 ('Zona Rural',      'Veredas del municipio');

INSERT INTO barrios (id_zona, nombre, tipo, latitud, longitud) VALUES
 (1, 'Centro',                 'barrio', 6.155400, -75.374300),
 (1, 'El Porvenir',            'barrio', 6.150900, -75.381800),
 (1, 'Alto del Medio',         'barrio', 6.158200, -75.370100),
 (2, 'San Antonio de Pereira', 'sector', 6.124700, -75.384100),
 (2, 'Barro Blanco',           'barrio', 6.141600, -75.378900),
 (3, 'Gualanday',              'barrio', 6.166300, -75.373900),
 (3, 'Cuatro Esquinas',        'barrio', 6.163100, -75.379200),
 (4, 'Vereda Abreo',           'vereda', NULL, NULL),
 (4, 'Vereda Cabeceras',       'vereda', NULL, NULL);

-- Código de colores para separación en la fuente (Resolución 2184 de 2019)
INSERT INTO tipos_residuo (nombre, descripcion, color_hex, color_bolsa, icono) VALUES
 ('Aprovechables',       'Plástico, cartón, vidrio, papel y metales limpios y secos', '#E5E7EB', 'blanca', 'recycle'),
 ('No aprovechables',    'Papel higiénico, servilletas, residuos sucios o contaminados', '#1F2937', 'negra',  'trash'),
 ('Orgánicos aprovechables', 'Restos de comida, cáscaras y residuos de jardín',      '#16A34A', 'verde',  'leaf');

INSERT INTO vehiculos (placa, codigo_interno, capacidad_ton, estado) VALUES
 ('OSA123', 'CMP-01', 16.00, 'operativo'),
 ('OSA456', 'CMP-02', 16.00, 'operativo'),
 ('OSA789', 'CMP-03', 10.00, 'mantenimiento');

INSERT INTO rutas (id_vehiculo, codigo, nombre, descripcion) VALUES
 (1, 'R-01', 'Ruta Centro',  'Casco urbano central'),
 (2, 'R-02', 'Ruta Sur',     'Corredor sur y San Antonio de Pereira'),
 (1, 'R-03', 'Ruta Norte',   'Sector norte urbano'),
 (2, 'R-04', 'Ruta Rural',   'Veredas con recolección semanal');

INSERT INTO ruta_barrio (id_ruta, id_barrio, orden_paso, minutos_desde_inicio) VALUES
 (1, 1, 1, 0), (1, 2, 2, 45), (1, 3, 3, 90),
 (2, 5, 1, 0), (2, 4, 2, 60),
 (3, 6, 1, 0), (3, 7, 2, 50),
 (4, 8, 1, 0), (4, 9, 2, 80);

-- dia_semana: 1=lun 2=mar 3=mié 4=jue 5=vie 6=sáb 7=dom
INSERT INTO horarios (id_ruta, id_tipo_residuo, dia_semana, hora_inicio, hora_fin, jornada) VALUES
 -- Ruta Centro: no aprovechables lun-mié-vie noche, aprovechables martes
 (1, 2, 1, '19:00:00', '23:00:00', 'noche'),
 (1, 2, 3, '19:00:00', '23:00:00', 'noche'),
 (1, 2, 5, '19:00:00', '23:00:00', 'noche'),
 (1, 1, 2, '08:00:00', '12:00:00', 'mañana'),
 (1, 3, 4, '08:00:00', '12:00:00', 'mañana'),
 -- Ruta Sur
 (2, 2, 2, '06:00:00', '11:00:00', 'mañana'),
 (2, 2, 4, '06:00:00', '11:00:00', 'mañana'),
 (2, 2, 6, '06:00:00', '11:00:00', 'mañana'),
 (2, 1, 3, '13:00:00', '17:00:00', 'tarde'),
 -- Ruta Norte
 (3, 2, 1, '06:00:00', '10:00:00', 'mañana'),
 (3, 2, 4, '06:00:00', '10:00:00', 'mañana'),
 (3, 1, 5, '13:00:00', '17:00:00', 'tarde'),
 -- Ruta Rural (semanal)
 (4, 2, 6, '07:00:00', '14:00:00', 'mañana');

INSERT INTO ubicaciones_usuario (id_usuario, id_barrio, alias, direccion, es_principal) VALUES
 (3, 1, 'Casa',    'Calle 50 # 50-10', TRUE),
 (3, 4, 'Trabajo', 'Parque de San Antonio', FALSE);

INSERT INTO preferencias_notificacion (id_usuario, minutos_antes, recordatorio_noche) VALUES
 (1, 60, FALSE), (2, 60, FALSE), (3, 30, TRUE);

INSERT INTO novedades (id_ruta, id_usuario_autor, tipo, titulo, descripcion, fecha_inicio, fecha_fin) VALUES
 (NULL, 2, 'festivo', 'Horario especial por festivo',
  'El lunes festivo la recolección de la Ruta Centro se traslada al martes en el mismo horario.',
  '2026-10-12', '2026-10-13'),
 (2, 2, 'cambio_horario', 'Ruta Sur inicia más temprano',
  'Por obras en la vía, la Ruta Sur iniciará a las 5:30 a. m. durante esta semana.',
  '2026-10-05', '2026-10-10');

INSERT INTO reportes (id_usuario, id_barrio, tipo, descripcion) VALUES
 (3, 1, 'no_paso', 'El camión no pasó el miércoles en la noche por la Calle 50.');

INSERT INTO notificaciones (id_usuario, id_novedad, tipo, titulo, mensaje) VALUES
 (3, 1, 'novedad', 'Horario especial por festivo',
  'El lunes festivo la recolección se traslada al martes.');

-- =====================================================================
-- 6. VISTAS
-- =====================================================================

-- 6.1 Horarios legibles por barrio (la consulta principal de la PWA)
CREATE VIEW vw_horarios_por_barrio AS
SELECT
    b.id_barrio,
    b.nombre                                   AS barrio,
    z.nombre                                   AS zona,
    r.codigo                                   AS ruta,
    tr.nombre                                  AS tipo_residuo,
    tr.color_bolsa,
    tr.color_hex,
    h.id_horario,
    h.dia_semana,
    ELT(h.dia_semana, 'Lunes','Martes','Miércoles','Jueves',
                      'Viernes','Sábado','Domingo') AS dia,
    ADDTIME(h.hora_inicio, SEC_TO_TIME(rb.minutos_desde_inicio * 60)) AS hora_estimada,
    h.hora_inicio,
    h.hora_fin,
    h.jornada
FROM horarios h
JOIN rutas r          ON r.id_ruta = h.id_ruta AND r.estado = 'activa'
JOIN ruta_barrio rb   ON rb.id_ruta = r.id_ruta
JOIN barrios b        ON b.id_barrio = rb.id_barrio AND b.activo = TRUE
JOIN zonas z          ON z.id_zona = b.id_zona
JOIN tipos_residuo tr ON tr.id_tipo_residuo = h.id_tipo_residuo
WHERE h.activo = TRUE;

-- 6.2 Reportes pendientes para el panel del operador
CREATE VIEW vw_reportes_pendientes AS
SELECT
    rp.id_reporte, rp.tipo, rp.descripcion, rp.estado, rp.fecha_reporte,
    b.nombre AS barrio,
    CONCAT(u.nombres, ' ', u.apellidos) AS ciudadano,
    u.correo
FROM reportes rp
JOIN barrios b  ON b.id_barrio = rp.id_barrio
JOIN usuarios u ON u.id_usuario = rp.id_usuario
WHERE rp.estado IN ('pendiente','en_revision');

-- =====================================================================
-- 7. PROCEDIMIENTOS ALMACENADOS
--  Nota: si su cliente SQL no reconoce DELIMITER (algunos editores web),
--  ejecute cada procedimiento por separado.
-- =====================================================================
DELIMITER //

-- 7.1 Horarios de un barrio ordenados de lunes a domingo
CREATE PROCEDURE sp_horarios_por_barrio (IN p_id_barrio INT UNSIGNED)
BEGIN
    SELECT dia, hora_estimada, hora_fin, tipo_residuo, color_bolsa, ruta, jornada
    FROM vw_horarios_por_barrio
    WHERE id_barrio = p_id_barrio
    ORDER BY dia_semana, hora_estimada;
END //

-- 7.2 Próximas N recolecciones de un barrio a partir de "ahora"
--     (responde la pregunta: ¿cuándo pasa el camión?)
CREATE PROCEDURE sp_proximas_recolecciones (
    IN p_id_barrio INT UNSIGNED,
    IN p_cantidad  TINYINT UNSIGNED
)
BEGIN
    DECLARE v_hoy   TINYINT;
    DECLARE v_ahora TIME;
    SET v_hoy   = WEEKDAY(NOW()) + 1;   -- 1 = lunes
    SET v_ahora = CURTIME();

    SELECT
        v.dia, v.tipo_residuo, v.color_bolsa, v.hora_estimada, v.hora_fin, v.ruta,
        DATE_ADD(CURDATE(), INTERVAL
            CASE   -- CAST evita desbordamiento al restar enteros UNSIGNED
              WHEN v.dia_semana > v_hoy THEN CAST(v.dia_semana AS SIGNED) - v_hoy
              WHEN v.dia_semana = v_hoy AND v.hora_estimada >= v_ahora THEN 0
              ELSE CAST(v.dia_semana AS SIGNED) - v_hoy + 7
            END DAY) AS fecha
    FROM vw_horarios_por_barrio v
    WHERE v.id_barrio = p_id_barrio
    ORDER BY fecha, v.hora_estimada
    LIMIT p_cantidad;
END //

-- 7.3 Usuarios que deben recibir recordatorio en el minuto actual
--     (lo ejecuta un cron del backend Node cada 5 minutos)
CREATE PROCEDURE sp_usuarios_a_notificar ()
BEGIN
    SELECT
        u.id_usuario, u.nombres, v.id_horario, v.barrio,
        v.tipo_residuo, v.color_bolsa, v.hora_estimada,
        s.endpoint, s.clave_p256dh, s.clave_auth
    FROM usuarios u
    JOIN preferencias_notificacion p ON p.id_usuario = u.id_usuario
                                     AND p.recordatorio_activo = TRUE
    JOIN ubicaciones_usuario uu      ON uu.id_usuario = u.id_usuario
    JOIN vw_horarios_por_barrio v    ON v.id_barrio = uu.id_barrio
                                     AND v.dia_semana = WEEKDAY(NOW()) + 1
    JOIN suscripciones_push s        ON s.id_usuario = u.id_usuario AND s.activa = TRUE
    WHERE u.estado = 'activo'
      AND SUBTIME(v.hora_estimada, SEC_TO_TIME(p.minutos_antes * 60))
          BETWEEN SUBTIME(CURTIME(), '00:05:00') AND CURTIME()
      AND NOT EXISTS (                  -- evita enviar el mismo recordatorio dos veces
          SELECT 1 FROM notificaciones n
          WHERE n.id_usuario = u.id_usuario
            AND n.id_horario = v.id_horario
            AND DATE(n.fecha_envio) = CURDATE());
END //

DELIMITER ;

-- =====================================================================
-- 8. CONSULTAS DE PRUEBA (para validar el script)
-- =====================================================================
-- SELECT * FROM vw_horarios_por_barrio WHERE barrio = 'Centro';
-- CALL sp_horarios_por_barrio(1);
-- CALL sp_proximas_recolecciones(1, 3);
-- CALL sp_usuarios_a_notificar();
-- SELECT * FROM vw_reportes_pendientes;
-- SELECT * FROM novedades WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin AND publicada = TRUE;
-- =====================================================================
--  FIN DEL SCRIPT
-- =====================================================================
