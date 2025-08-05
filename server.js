const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const moment = require('moment');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs')
const path = require('path');
const os = require('os');
const { file } = require('pdfkit');
const port = 8080;
const PDFDocument = require('pdfkit');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/imagesBarbero', express.static(path.join(__dirname, './uploads/imagesBarbero')));
app.use('/ImagesInventario', express.static(path.join(__dirname, './uploads/ImagesInventario')));
app.use('/perfil', express.static(path.join(__dirname, './uploads/perfil')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
app.use(requestLogger);


const db = new Pool({
    host: process.env.DM_HOST || 'localhost',
    user: process.env.DM_USER || 'master_barber',
    password: process.env.DM_PASSWORD || '',
    database: process.env.DM_DATABASE || 'master_barber',
    ssl: process.env.DM_SSL === 'true' ? { rejectUnauthorized: false } : false
});

db.connect()
    .then(() => console.log("✅ Conectado a PostgreSQL"))
    .catch((err) => console.error("❌ Error al conectar a PostgreSQL:", err.message));


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



// Configuración de transporte de nodemailer para enviar correos electrónicos
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'cristianrueda0313@gmail.com',
        pass: 'mzze gnmy ydng jvdk',
    }
});

// LOGIN para PostgreSQL
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "El usuario no existe, por favor registrese" });
        }

        const usuario = result.rows[0];

        bcrypt.compare(password, usuario.contrasena, (err, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error al verificar la contraseña" });
            }

            if (isMatch) {
                const secretKey = 'miClaveSecreta';
                const token = jwt.sign(
                    { id: usuario.id_usuario, email: usuario.email, role: usuario.id_rol },
                    secretKey,
                    { expiresIn: '1h' }
                );

                return res.status(200).json({
                    message: "Inicio de sesión exitoso",
                    token: token,
                    user: {
                        id: usuario.id_usuario,
                        email: usuario.email,
                        role: usuario.id_rol
                    }
                });
            } else {
                return res.status(400).json({ error: "Contraseña incorrecta" });
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error del servidor" });
    }
});


//FIN LOGIN


// Middleware para verificar el token
app.get('/validarToken', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ error: 'Token no proporcionado' });

    jwt.verify(token, 'miClaveSecreta', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });

        return res.status(200).json({
            user: {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            },
        });
    });
});





// Registro
app.post('/registrar', async (req, res) => {
    const { nombre_usuario, email, nit, telefono, contraseña, confirmar_contraseña } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com)$/;

    if (contraseña !== confirmar_contraseña) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    if (!/[a-z]/.test(contraseña) && !/[A-Z]/.test(contraseña)) {
        return res.status(400).send('La contraseña debe contener al menos una letra');
    }

    if (contraseña.length < 8) {
        return res.status(400).send('La contraseña debe tener al menos 8 caracteres');
    }

    if (nombre_usuario.length < 3) {
        return res.status(400).send('El nombre debe tener al menos 3 caracteres');
    }

    if (nit.length < 8 || nit.length > 10) {
        return res.status(400).send('Tu número de documento debe tener como mínimo 8 y máximo 10 caracteres');
    }

    if (telefono.length !== 10) {
        return res.status(400).send('Tu número de teléfono debe tener 10 caracteres');
    }

    if (email.length < 5 || !emailRegex.test(email)) {
        return res.status(400).send('El email debe ser válido y pertenecer a gmail.com, hotmail.com o outlook.com');
    }

    try {
        const checkQuery = "SELECT * FROM usuarios WHERE email = $1 OR nit = $2";
        const checkResult = await db.query(checkQuery, [email, nit]);

        if (checkResult.rows.length > 0) {
            return res.status(400).send("El usuario ya existe");
        }

        const hashpassword = bcrypt.hashSync(contraseña, 10);

        const insertQuery = `
            INSERT INTO usuarios (nombre_usuario, email, nit, telefono, contrasena, id_rol)
            VALUES ($1, $2, $3, $4, $5, 3)
        `;
        await db.query(insertQuery, [nombre_usuario, email, nit, telefono, hashpassword]);

        return res.status(200).send("Usuario creado con éxito");

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error al registrar el usuario");
    }
});

//Fin Registro



// Enviar correo de restablecimiento de contraseña
app.post('/EnvEmail', async (req, res) => {
    const email = req.body.email;

    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const user = result.rows[0];
        const verificationCode = generateVerificationCode();
        const expirationDate = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

        await db.query(
            'UPDATE usuarios SET user_reset_code = $1, user_reset_code_expiration = $2 WHERE id_usuario = $3',
            [verificationCode, expirationDate, user.id_usuario]
        );

        const mailOptions = {
            from: 'cristianrueda0313@gmail.com',
            to: email,
            subject: 'Código De Verificación Para Restablecer Tu Contraseña',
            html: `
            <div class="container" style="background-color: #212529; color: #fff; padding: 80px;">
                <div style="text-align: center;">
                    <img src="https://scontent.fbog2-3.fna.fbcdn.net/v/t39.30808-6/274008068_101632669118983_8097378443996989775_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeG-vCPQgzoU3oKbCugF2pADRoqglXlLsSFGiqCVeUuxIQH8czFUHqI1WXYwEkWzhBJvHvzjQ5yuVTtPWXnbfyHV&_nc_ohc=l8zKdCrkEwoQ7kNvwFQRh5t&_nc_oc=AdmaKjultVGulBzfkXhp1Umc4P-Ed1U-fS20y3dir1ehS02H5XM60QmNtejO4T-kd26enx-rfw6QW22az1XQ6hYI&_nc_zt=23&_nc_ht=scontent.fbog2-3.fna&_nc_gid=QwYbBw7a45rY0ll452tWbQ&oh=00_AfJHR3VqU5pzz8Y5xshgTghYLNlj0FGLiKW9CAA59mHSew&oe=68456320"
                        style="width: 20%; height: 20%;" alt="Logo">
                </div>
                <h1 style="color:#e9c706; text-align: center; font-weight: bold; font-size: 40px;">Recuperación De Contraseña</h1>
                <p style="font-size: 20px; text-align: center;">Tu Código Para Restablecer La Contraseña Es</p>
                <h2 style="font-size: 50px; font-weight: bolder; color: #ff2f2f ; text-align: center;">${verificationCode}</h2>
                <h3 style="text-align: center;">El Código De Verificación Fue Enviado A Las: <b>${expirationDate}</b></h3>
                <h3 style="text-align: center;">Este Código Caducará En 1 Hora.</h3>
                <h3 style="text-align: center;">Gracias Por Confiar En Master Barber</h3>
            </div>
            `
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
            }
            res.status(200).json({ message: 'Código de verificación enviado por correo electrónico' });
        });

    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).send('Error en el servidor');
    }
});

//FIN CambiarPassword







//INVENTARIO

const storageInventario = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'inventario',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const uploadInventario = multer({ storage: storageInventario });


// Obtener todo el inventario
app.get('/GetInventario', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id_producto, nombre, descripcion_P, cantidad, id_categoria_producto, proveedor, preciounitario, foto, 
                   TO_CHAR(fecha_venta, 'YYYY-MM-DD HH24:MI') AS fecha_venta 
            FROM inventario
        `);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Obtener un producto específico
app.get('/GetInventario/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM inventario WHERE id_producto = $1', [id]);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.post('/CreateInventario', uploadInventario.single('foto'), async (req, res) => {
    const { nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, fecha_venta, preciounitario } = req.body;
    const fotoName = req.file.filename;

    const q = `
        INSERT INTO inventario (nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, fecha_venta, foto, preciounitario) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, fecha_venta, fotoName, preciounitario];

    try {
        await db.query(q, values);
        res.status(200).send('Producto creado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Eliminar imagen del servidor
const borrarFotoInventario = async (foto) => {
    try {
        const filePath = path.resolve(__dirname, `${foto}`);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error eliminando imagen:', err);
    }
};

app.put('/UpdateInventario/:id', uploadInventario.single('foto'), async (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, fecha_venta, preciounitario } = req.body;
    const fotoName = req.file ? req.file.filename : null;

    try {
        const result = await db.query('SELECT foto FROM inventario WHERE id_producto = $1', [id]);
        const fotoActual = result.rows[0]?.foto;

        if (fotoName && fotoActual) {
            await borrarFotoInventario(fotoActual);
        }

        const q = `
            UPDATE inventario 
            SET nombre = $1, descripcion_p = $2, cantidad = $3, id_categoria_producto = $4, 
                proveedor = $5, fecha_venta = $6, foto = $7, preciounitario = $8 
            WHERE id_producto = $9
        `;
        const values = [nombre, descripcion_p, cantidad, id_categoria_producto, proveedor, fecha_venta, fotoName || fotoActual, preciounitario, id];

        await db.query(q, values);
        res.status(200).send('Producto actualizado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.delete('/DeleteInventario/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM inventario WHERE id_producto = $1', [id]);
        res.status(200).send('Producto eliminado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.put('/RestarInventario/:id', async (req, res) => {
    const id = req.params.id;
    const cantidad = req.body.cantidad;

    try {
        await db.query('UPDATE inventario SET cantidad = cantidad - $1 WHERE id_producto = $2', [cantidad, id]);
        res.status(200).send('Inventario actualizado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/categorias', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categoria_producto');
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});
// FIN INVENTARIO




// CAMBIO DE CONTRASEÑA

app.post('/Cambiarpasscod', async (req, res) => {
    console.log(req.body);
    const { newContrasena, confirmContra, verificaCode } = req.body;

    const fecha = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!newContrasena || !confirmContra || !verificaCode) {
        return res.status(400).send('Faltan datos para restablecer la contraseña');
    }

    if (newContrasena !== confirmContra) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    if (newContrasena.length < 8) {
        return res.status(400).send('La contraseña debe tener al menos 8 caracteres');
    }

    try {
        const result = await db.query(
            'SELECT * FROM usuarios WHERE user_reset_code = $1 AND user_reset_code_expiration > $2',
            [verificaCode, fecha]
        );

        if (result.rows.length === 0) {
            return res.status(400).send('Código de verificación inválido o expirado');
        }

        const user = result.rows[0];
        const hashPassword = bcrypt.hashSync(newContrasena, 10);

        await db.query(
            'UPDATE usuarios SET contrasena = $1, user_reset_code = NULL, user_reset_code_expiration = NULL WHERE id_usuario = $2',
            [hashPassword, user.id_usuario]
        );

        res.status(200).send('Contraseña restablecida con éxito');
    } catch (err) {
        console.error('Error en la operación:', err);
        res.status(500).send('Error en el servidor');
    }
});

// FIN CAMBIO DE CONTRASEÑA









// CRUD DEL BARBERO
const storageBarbero = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberos',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const uploadBarbero = multer({ storage: storageBarbero });


app.get('/GetBarberos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE id_rol = 2');
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/GetBarberos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE id_usuario = $1 AND id_rol = 2', [id]);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.post('/CreateBarberos', uploadBarbero.single('foto'), async (req, res) => {
    const { nombre_usuario, email, contrasena, descripcion } = req.body;
    const fotoUrl = req.file?.path || null;

    // Validar contraseña
    if (!contrasena || contrasena.length < 8) {
        console.log('❌ Contraseña muy corta o vacía');
        return res.status(400).send('La contraseña debe tener al menos 8 caracteres');
    }

    const hashPassword = bcrypt.hashSync(contrasena, 10);

    const q = `
        INSERT INTO usuarios (nombre_usuario, email, contrasena, descripcion, foto, id_rol) 
        VALUES ($1, $2, $3, $4, $5, 2)
    `;
    const values = [nombre_usuario, email, hashPassword, descripcion, fotoUrl];

    console.log('📤 Valores a insertar:', values);

    try {
        await db.query(q, values);
        console.log('✅ Barbero insertado correctamente');
        res.status(200).send('Barbero creado exitosamente');
    } catch (err) {
        console.error('❌ ERROR AL INSERTAR BARBERO:', err);
        res.status(500).send('Error en el servidor');
    }
});



const borrarFotoBarbero = async (foto) => {
    try {
        const filePath = path.resolve(__dirname, `./uploads/imagesBarbero/${foto}`);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error eliminando imagen:', err);
    }
};

app.put('/UpdateBarberos/:id', uploadBarbero.single('foto'), async (req, res) => {
    const id = req.params.id;
    const { nombre_usuario, email, descripcion } = req.body;
    const nuevaFoto = req.file ? req.file.filename : null;
    console.log(req.body);

    try {
        const resultFoto = await db.query('SELECT foto FROM usuarios WHERE id_usuario = $1 AND id_rol = 2', [id]);

        if (resultFoto.rows.length === 0) {
            return res.status(404).send('Barbero no encontrado');
        }

        const fotoActual = resultFoto.rows[0].foto;

        if (nuevaFoto && fotoActual) {
            await borrarFotoBarbero(fotoActual);
        }

        const q = `
            UPDATE usuarios 
            SET nombre_usuario = $1, email = $2, descripcion = $3, foto = $4 
            WHERE id_usuario = $5 AND id_rol = 2
        `;
        const values = [nombre_usuario, email, descripcion, nuevaFoto || fotoActual, id];

        await db.query(q, values);
        res.status(200).send('Barbero actualizado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.delete('/DeleteBarberos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM usuarios WHERE id_usuario = $1 AND id_rol = 2', [id]);
        res.status(200).send('Barbero eliminado exitosamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});


// FIN CRUD BARBERO








//Perfil USUARIO
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'perfiles',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const upload = multer({ storage: storage });

app.post('/actualizarUsuario/:email', upload.single('file'), async (req, res) => {
    const file = req.file;
    const email = req.params.email;
    const nombre = req.body.nombre;

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        let queryValues = [];
        let queryString = 'UPDATE usuarios SET ';
        let setParts = [];

        if (nombre) {
            setParts.push('nombre_usuario = $' + (queryValues.length + 1));
            queryValues.push(nombre);
        }

        if (file) {
            setParts.push('foto = $' + (queryValues.length + 1));
            queryValues.push(file.filename);
        }

        if (setParts.length === 0) {
            return res.status(400).send('No hay campos para actualizar');
        }

        queryString += setParts.join(', ');
        queryValues.push(email);
        queryString += ' WHERE email = $' + queryValues.length;

        await db.query(queryString, queryValues);
        res.status(200).send('Perfil actualizado exitosamente');
    } catch (err) {
        console.error('Error en actualizarUsuario:', err);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/traerUsuarios', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios');
        res.status(200).send(result.rows);
    } catch (err) {
        console.error("Error en traerUsuarios:", err);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/traerUsuario/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const result = await db.query(`
  SELECT 
    id_usuario, 
    nombre_usuario, 
    email, 
    nit, 
    telefono, 
    contrasena, 
    id_rol, 
    user_reset_code, 
    user_reset_code_expiration, 
     foto,
    descripcion 
  FROM usuarios 
  WHERE email = $1
`, [email]);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

//Fin Perfil


//INICIODELPERFILDELBARBERO
const uploadBarberoPerfil = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/imagesBarbero/');
        },
        filename: function (req, file, cb) {
            cb(null, `barbero_${Date.now()}-${file.originalname}`);
        },
    }),
});

const borrarFotoAnteriorBarbero = async (foto) => {
    try {
        const filePath = path.resolve(__dirname, `./uploads/imagesBarbero/${foto}`);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error al eliminar la foto anterior del barbero:', err);
    }
};

app.post('/actualizarBarbero/:email', uploadBarberoPerfil.single('file'), async (req, res) => {
    const file = req.file;
    const email = req.params.email;
    const nombre = req.body.nombre;

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1 AND id_rol = 2', [email]);

        if (result.rows.length === 0) {
            return res.status(404).send('Barbero no encontrado');
        }

        const usuario = result.rows[0];
        const fotoAnterior = usuario.foto;

        let queryValues = [];
        let setParts = [];

        if (nombre) {
            setParts.push(`nombre_usuario = $${queryValues.length + 1}`);
            queryValues.push(nombre);
        }

        if (file) {
            setParts.push(`foto = $${queryValues.length + 1}`);
            queryValues.push(file.filename);
        }

        if (setParts.length === 0) {
            return res.status(400).send('No hay datos para actualizar');
        }

        // Agregamos el email para el WHERE
        queryValues.push(email);
        const updateQuery = `
            UPDATE usuarios 
            SET ${setParts.join(', ')} 
            WHERE email = $${queryValues.length} AND id_rol = 2
        `;

        await db.query(updateQuery, queryValues);

        if (file && fotoAnterior) {
            await borrarFotoAnteriorBarbero(fotoAnterior);
        }

        return res.status(200).send('Perfil del barbero actualizado exitosamente');

    } catch (err) {
        console.error('Error en actualizarBarbero:', err);
        return res.status(500).send('Error en el servidor');
    }
});
//PERFILDELBARBERO






// CALIFICACIONES

app.get('/traerCalificaciones', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM calificaciones');
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: "Error en el servidor" });
    }
});

app.get('/traerCalificacionesUsuario/:id', async (req, res) => {
    const idUsuario = req.params.id;
    try {
        const result = await db.query('SELECT * FROM calificaciones WHERE usuario_id = $1', [idUsuario]);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: "Error en el servidor" });
    }
});

app.post('/Createcalificaciones', async (req, res) => {
    const { comentario, puntuacion, id } = req.body;

    try {
        await db.query(
            'INSERT INTO calificaciones (comentario, puntuacion, usuario_id) VALUES ($1, $2, $3)',
            [comentario, puntuacion, id]
        );
        return res.status(200).json({ message: "Calificación registrada exitosamente" });
    } catch (err) {
        return res.status(500).json({ error: `Error al registrar la calificación: ${err.message}` });
    }
});

app.delete('/DeleteCalificaciones/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM calificaciones WHERE id = $1', [id]);
        return res.status(200).json({ message: "Calificación eliminada exitosamente" });
    } catch (err) {
        return res.status(500).json({ error: `Error al eliminar la calificación: ${err.message}` });
    }
});

app.put('/CancelarReservaCliente/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await db.query('SELECT estado FROM reservas WHERE id_reserva = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const estadoActual = result.rows[0].estado;

        if (estadoActual !== 'Aceptada') {
            return res.status(400).json({ error: 'Solo puedes cancelar reservas aceptadas.' });
        }

        await db.query('UPDATE reservas SET estado = $1 WHERE id_reserva = $2', ['Cancelada', id]);

        return res.status(200).json({ message: 'Reserva cancelada exitosamente.' });
    } catch (err) {
        return res.status(500).json({ error: 'Error al cancelar la reserva' });
    }
});

// FIN   CALIFICACIONES







// RESERVAS

app.get('/GetServicios', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tipo_servicio');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.post('/CrearReservas', async (req, res) => {
    const { cliente_id, barbero_id, fecha, estado, servicio, observacion } = req.body;
    try {
        const fechaSoloDia = moment(fecha).format('YYYY-MM-DD');
        const q1 = `
            SELECT COUNT(*) FROM reservas 
            WHERE cliente_id = $1 AND DATE(fecha) = $2 AND (LOWER(estado) = 'pendiente' OR LOWER(estado) = 'confirmada')
        `;
        const r1 = await db.query(q1, [cliente_id, fechaSoloDia]);

        if (parseInt(r1.rows[0].count) >= 3) {
            return res.status(400).json({ message: 'Solo puedes hacer 3 reservas por día.' });
        }

        const r2 = await db.query('SELECT * FROM reservas WHERE barbero_id = $1 AND fecha = $2', [barbero_id, fecha]);
        if (r2.rows.length > 0) {
            return res.status(400).json({ message: 'La hora seleccionada ya está ocupada.' });
        }

        await db.query(
            'INSERT INTO reservas (cliente_id, barbero_id, servicio, fecha, estado, observacion) VALUES ($1, $2, $3, $4, $5, $6)',
            [cliente_id, barbero_id, servicio, fecha, estado, observacion]
        );
        res.status(201).json({ message: 'Reserva creada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la reserva.' });
    }
});

app.get('/GetReservas', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservas');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.get('/GetReservas/barbero/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservas WHERE barbero_id = $1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.get('/GetReservas/cliente/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservas WHERE cliente_id = $1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/GetReservas/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservas WHERE id_reserva = $1', [req.params.id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.put('/UpdateReservas/:id', async (req, res) => {
    const { cliente_id, barbero_id, servicio, fecha, estado } = req.body;
    try {
        await db.query(
            'UPDATE reservas SET cliente_id = $1, barbero_id = $2, servicio = $3, fecha = $4, estado = $5 WHERE id_reserva = $6',
            [cliente_id, barbero_id, servicio, fecha, estado, req.params.id]
        );
        res.status(200).json({ message: 'Reserva actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: `Error al actualizar la reserva: ${err.message}` });
    }
});

app.delete('/DeleteReservas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM reservas WHERE id_reserva = $1', [req.params.id]);
        res.status(200).json({ message: 'Reserva eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: `Error al eliminar la reserva: ${err.message}` });
    }
});

app.put('/UpdateReservasEstado/:id', async (req, res) => {
    const id = req.params.id;
    const nuevoEstado = req.body.estado;

    try {
        const estadoRes = await db.query('SELECT estado FROM reservas WHERE id_reserva = $1', [id]);
        if (estadoRes.rows.length === 0) return res.status(400).json({ error: 'Reserva no encontrada' });

        const estadoActual = estadoRes.rows[0].estado;
        if (estadoActual === nuevoEstado) {
            return res.status(200).json({ message: 'El estado de la reserva ya es el mismo' });
        }

        await db.query('UPDATE reservas SET estado = $1 WHERE id_reserva = $2', [nuevoEstado, id]);

        const result = await db.query(
            `SELECT r.*, u.email, u.id_usuario AS cliente_id, s.nombre AS servicio_nombre 
            FROM reservas r 
            JOIN usuarios u ON r.cliente_id = u.id_usuario 
            JOIN tipo_servicio s ON r.servicio = s.id_tipo_servicio 
            WHERE r.id_reserva = $1`,
            [id]
        );

        if (result.rows.length === 0) return res.status(400).send('Reserva no encontrada');

        const reserva = result.rows[0];
        const email = reserva.email;
        const clienteId = reserva.cliente_id;
        const servicioNombre = reserva.servicio_nombre;

        const mailOptions = {
            from: 'cristianrueda0313@gmail.com',
            to: email,
            subject: 'Actualización del estado de tu reserva',
            html: `
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
  <h2 style="color: #2c3e50; margin-bottom: 20px;">✨ Actualización de tu Reserva</h2>

  <p style="font-size: 16px; margin-bottom: 15px;">Hola,</p>

  <p style="font-size: 16px; margin-bottom: 20px;">
    Te informamos que el estado de tu reserva ha sido actualizado a:
    <strong style="color: #27ae60;">${nuevoEstado}</strong>.
  </p>

  <div style="background-color: #f4f6f8; border-left: 4px solid #27ae60; padding: 15px 20px; margin-bottom: 20px; border-radius: 5px;">
    <p style="margin: 0; font-size: 15px;">
      <strong>🛠 Servicio:</strong> ${servicioNombre}<br>
      <strong>📅 Fecha:</strong> ${new Date(reserva.fecha).toLocaleString()}
    </p>
  </div>

  <p style="font-size: 15px; margin-bottom: 10px;">Gracias por confiar en <strong>Master Barber</strong>.</p>
  <p style="font-size: 16px; font-weight: bold; color: #2c3e50;">¡Te esperamos!</p>

  <div style="text-align: center; margin-top: 20px;">
    <a href="https://tusitio.com/reservas" target="_blank" style="display: inline-block; background-color: #27ae60; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
      Ver mis reservas
    </a>
  </div>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />

  <p style="font-size: 12px; text-align: center; color: #999;">
    Este mensaje fue enviado automáticamente. Por favor, no respondas a este correo.
  </p>
</div>


                    `
        };

        transporter.sendMail(mailOptions, async (error) => {
            if (error) return res.status(500).json({ message: 'Error al enviar el correo electrónico' });

            const mensaje = `El estado de tu reserva ha sido actualizado a: ${nuevoEstado}. Servicio: ${servicioNombre}, Fecha:${new Date(reserva.fecha).toLocaleString()}`;
            await db.query(
                'INSERT INTO notificaciones (cliente_id, mensaje, fecha) VALUES ($1, $2, $3)',
                [clienteId, mensaje, new Date(reserva.fecha).toISOString()]
            );
            res.status(200).json({ message: 'Reserva actualizada y notificación enviada por correo electrónico' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/VerificarDisponibilidad', async (req, res) => {
    const { barbero_id, fecha } = req.body;
    try {
        const result = await db.query('SELECT * FROM reservas WHERE barbero_id = $1 AND fecha = $2', [barbero_id, fecha]);
        res.status(200).json({ disponible: result.rows.length === 0 });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/GetClientes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE id_rol = 3');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.delete('/DeleteReserva/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM reservas WHERE id_reserva = $1', [req.params.id]);
        res.status(200).send('Reserva eliminada correctamente');
    } catch (err) {
        res.status(500).send('Error al eliminar la reserva');
    }
});
// Fin Reservas



// Notificaciones
app.get('/GetNotificaciones/:cliente_id', (req, res) => {
    const cliente_id = req.params.cliente_id;

    db.query(
        'SELECT * FROM notificaciones WHERE cliente_id = $1 ORDER BY fecha DESC',
        [cliente_id],
        (err, result) => {
            if (err) {
                console.error('Error al obtener notificaciones:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.status(200).json(result.rows);
        }
    );
});

app.delete('/DeleteNotificacion/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM notificaciones WHERE id_notificacion = $1', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
        }
        return res.status(200).send('Notificación eliminada exitosamente');
    });
});

app.delete('/DeleteNotificacionReserva/:id', (req, res) => {
    const reservaId = req.params.id;
    db.query('DELETE FROM notificaciones WHERE reserva_id = $1', [reservaId], (err) => {
        if (err) {
            console.error('Error al eliminar la notificación:', err);
            return res.status(500).json({ error: 'Error al eliminar la notificación' });
        }
        res.status(200).json({ message: 'Notificación eliminada correctamente' });
    });
});
// Fin Notificaciones




// VENTAS
// Obtener ventas según rango
app.get('/GetVentas', async (req, res) => {
    const { rango } = req.query;

    let q = 'SELECT * FROM ventas';
    const params = [];

    if (rango === 'diario') {
        q += ` WHERE DATE(fecha) = CURRENT_DATE`;
    } else if (rango === 'semanal') {
        q += ` WHERE DATE_TRUNC('week', fecha) = DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (rango === 'mensual') {
        q += ` WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)`;
    } else if (rango === 'anual') {
        q += ` WHERE DATE_TRUNC('year', fecha) = DATE_TRUNC('year', CURRENT_DATE)`;
    }

    try {
        const result = await db.query(q, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener las ventas:', err);
        res.status(500).json({ error: 'Error al obtener las ventas' });
    }
});

// Guardar ventas
app.post('/GuardarVentas', async (req, res) => {
    const ventas = req.body;

    if (!Array.isArray(ventas)) {
        return res.status(400).json({ error: 'Las ventas deben ser un array' });
    }

    const values = ventas.map((v, index) =>
        `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
    ).join(', ');

    const flatParams = ventas.flatMap(v => [
        v.id_producto,
        v.cantidad,
        v.fecha,
        v.preciounitario,
        v.nombre
    ]);

    const query = `INSERT INTO ventas (id_producto, cantidad, fecha, preciounitario, nombre) VALUES ${values}`;

    try {
        await db.query(query, flatParams);
        res.status(200).json({ message: 'Ventas guardadas exitosamente' });
    } catch (err) {
        console.error('Error al guardar las ventas:', err);
        res.status(500).json({ error: 'Error al guardar las ventas' });
    }
});

// FIN VENTAS




app.get('/generarFactura/:id_reserva', (req, res) => {
    const id = req.params.id_reserva;
    const numeroFactura = `MB-${id}`;

    const q = `
        SELECT r.*, 
               u.nombre_usuario AS nombre_cliente, 
               u.email AS email,
               s.nombre AS servicio_nombre,
               s.precio AS precio_servicio,
               b.nombre_usuario AS nombre_barbero
        FROM reservas r 
        JOIN usuarios u ON r.cliente_id = u.id_usuario
        JOIN tipo_servicio s ON r.servicio = s.id_tipo_servicio
        JOIN usuarios b ON r.barbero_id = b.id_usuario
        WHERE r.id_reserva = $1
    `;

    db.query(q, [id], (err, result) => {
        if (err || result.rows.length === 0) {
            console.error(err);
            return res.status(500).send("Error al generar la factura");
        }

        const reserva = result.rows[0];
        const nombreCliente = reserva.nombre_cliente.replace(/[^a-zA-Z0-9]/g, '_');
        const nombreArchivo = `Reserva_de_${nombreCliente}.pdf`;

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#000');

        const logoPath = path.join(__dirname, './uploads/LOGO.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 50, 20, { width: 100 });
        }

        doc.fillColor('#fff');
        doc.moveDown(8);

        doc.fontSize(22).font('Helvetica-Bold')
            .text('Master Barber - Factura de Reserva', {
                align: 'center'
            });

        doc.moveDown(1.5);
        doc.strokeColor('#d4af37').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(13).font('Helvetica');

        const info = [
            [`Factura Nº:`, numeroFactura],
            [`Cliente:`, reserva.nombre_cliente],
            [`Email:`, reserva.email],
            [`Barbero:`, reserva.nombre_barbero],
            [`Servicio:`, reserva.servicio_nombre],
            [`Precio:`, `${Number(reserva.precio_servicio).toLocaleString('es-CO')}`],
            [`FECHA Y HORA DE LA RESERVA:`, new Date(reserva.fecha).toLocaleString('es-CO')],
            [`Estado:`, reserva.estado]
        ];

        info.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(` ${value}`);
        });

        doc.moveDown(2);
        doc.fontSize(15).font('Helvetica-Bold')
            .text('¡Gracias por confiar en Master Barber!', { align: 'center' });

        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica')
            .text('Master Barber - Calle 123 #45-67 - Bogotá, Colombia', { align: 'center' });
        doc.text('Tel: +57 300 123 4567 | Email: contacto@masterbarber.com', { align: 'center' });

        doc.end();
    });
});


















app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Master Barber</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

                body {
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    font-family: 'Montserrat', sans-serif;
                    color: white;
                    background: linear-gradient(-45deg, #ff512f, #dd2476, #24c6dc, #514a9d);
                    background-size: 400% 400%;
                    animation: gradient 12s ease infinite;
                    text-align: center;
                }

                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                h1 {
                    font-size: 3rem;
                    text-shadow: 2px 2px 8px rgba(0,0,0,0.6);
                    margin-bottom: 20px;
                }

                p {
                    font-size: 1.3rem;
                    max-width: 700px;
                    line-height: 1.6;
                    text-shadow: 1px 1px 5px rgba(0,0,0,0.5);
                }

                .emoji {
                    font-size: 2rem;
                    margin-top: 15px;
                    animation: bounce 1.5s infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            </style>
        </head>
        <body>
            <h1>Estamos Al Aire 🎉</h1>
            <p>
                Bobo Hp, revise y verá que todo está bien.<br>
                Si no, pues cagada, mani... no sabes programar, no sabes administrar, no sabes nada.<br>
                Que te vaya bien, gracias por usar <strong>Master Barber</strong>.
            </p>
            <div class="emoji">👍👍👍👍👍👍👍👍👍👍</div>
        </body>
        </html>
    `);
});


function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Iniciar el servidor
app.listen(port, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log("Conexión exitosa :)");
    console.log(`Servidor ejecutando en:`);
    console.log(`- Local:    http://localhost:${port}`);
    console.log(`- Red:      http://${localIP}:${port}`);
});


