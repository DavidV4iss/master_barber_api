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
}))





const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use(requestLogger);


let db;

function handleDisconnect() {
    db = mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "master_barber",
    });

    db.connect((err) => {
        if (err) {
            console.error("❌ Error al conectar a la base de datos:", err.message);
            setTimeout(handleDisconnect, 5000); // Reintenta conexión cada 5 segundos
        } else {
            console.log("✅ Conectado a la base de datos");
        }
    });

    db.on("error", (err) => {
        console.error("⚠️ Error de conexión MySQL:", err.code);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.log("🔁 Intentando reconectar...");
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();


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

//LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, userResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error del servidor" });
        }

        if (userResult.length === 0) {
            return res.status(400).json({ error: "El usuario no existe, por favor registrese" });
        }

        const usuario = userResult[0];
        bcrypt.compare(password, usuario.contrasena, (err, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error al verificar la contraseña" });
            }
            if (isMatch) {

                const secretKey = 'miClaveSecreta';

                const token = jwt.sign({ id: usuario.id_usuario, email: usuario.email, role: usuario.id_rol }, secretKey, { expiresIn: '1h' });

                return res.status(200).json({
                    message: "Inicio de sesión exitoso",
                    token: token,
                    user: {
                        id: usuario.id,
                        email: usuario.email,
                        role: usuario.id_rol
                    }
                });
            } else {
                return res.status(400).json({ error: "Contraseña incorrecta" });
            }
        });
    });
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
app.post('/registrar', (req, res) => {
    const nombreusuario = req.body.nombre_usuario;
    const email = req.body.email;
    const nit = req.body.nit;
    const telefono = req.body.telefono;
    const contraseña = req.body.contraseña;
    const confirmar_contraseña = req.body.confirmar_contraseña;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com)$/;

    db.query("SELECT * FROM usuarios WHERE email = ? OR nit = ?", [email, nit], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        else if (result.length > 0) {
            return res.status(400).send("El usuario ya existe");
        }

        else if (contraseña !== confirmar_contraseña) {
            return res.status(400).send('Las contraseñas no coinciden');
        }

        else if (!/[a-z]/.test(contraseña) && !/[A-Z]/.test(contraseña)) {
            return res.status(400).send('La contraseña debe contener al menos una letra');
        }

        else if (contraseña.length < 8) {
            return res.status(400).send('La contraseña debe tener al menos 8 caracteres');
        }
        else if (nombreusuario.length < 3) {
            return res.status(400).send('El nombre debe tener al menos 3 caracteres');
        }
        else if (nit.length < 8 || nit.length > 10) {
            return res.status(400).send('Tu número de documento debe tener como minimo 8 y máximo 10 caracteres');
        }
        else if (telefono.length !== 10) {
            return res.status(400).send('Tu número de teléfono debe tener 10 caracteres');
        }
        else if (email.length < 5) {
            return res.status(400).send('El email debe tener al menos 5 caracteres');
        }
        else if (!emailRegex.test(email)) {
            return res.status(400).send('El email debe ser válido y pertenecer a gmail.com, hotmail.com o outlook.com');
        }
        else {
            const hashpassword = bcrypt.hashSync(contraseña, 10);
            const q = "INSERT INTO usuarios (nombre_usuario, email, nit, telefono, contrasena, id_rol) VALUES (?,?,?,?,?,3)";
            const values = [
                nombreusuario,
                email,
                nit,
                telefono,
                hashpassword
            ];
            db.query(q, values, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).send("Usuario creado con éxito");
            });
        }
    });
});
//Fin Registro



// Enviar correo de restablecimiento de contraseña
app.post('/EnvEmail', (req, res) => {
    const email = req.body.email;

    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const user = results[0];
        const verificationCode = generateVerificationCode();
        const expirationDate = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

        db.query('UPDATE usuarios SET user_reset_code = ?, user_reset_code_expiration = ? WHERE id_usuario = ?', [verificationCode, expirationDate, user.id_usuario], (err) => {
            if (err) return res.status(500).json({ message: 'Error al guardar el código de verificación' + err });

            const mailOptions = {
                from: 'cristianrueda0313@gmail.com',
                to: email,
                subject: 'Código De Verificación Para Restablecer Tu Contraseña',
                html: `
                <div class="container" style="background-color: #212529; color: #fff; padding: 80px;">
                    <div style="text-align: center;">
                        <img src="https://scontent.fbog2-3.fna.fbcdn.net/v/t39.30808-6/274008068_101632669118983_8097378443996989775_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeG-vCPQgzoU3oKbCugF2pADRoqglXlLsSFGiqCVeUuxIQH8czFUHqI1WXYwEkWzhBJvHvzjQ5yuVTtPWXnbfyHV&_nc_ohc=l8zKdCrkEwoQ7kNvwFQRh5t&_nc_oc=AdmaKjultVGulBzfkXhp1Umc4P-Ed1U-fS20y3dir1ehS02H5XM60QmNtejO4T-kd26enx-rfw6QW22az1XQ6hYI&_nc_zt=23&_nc_ht=scontent.fbog2-3.fna&_nc_gid=QwYbBw7a45rY0ll452tWbQ&oh=00_AfJHR3VqU5pzz8Y5xshgTghYLNlj0FGLiKW9CAA59mHSew&oe=68456320" alt=""
                        style="width: 20%; height: 20%;">
                    </div>
                    <h1 style="color:#e9c706; text-align: center; font-weight: bold; font-size: 40px;">Recuperación De Contraseña</h1>
                    <p style="font-size: 20px; text-align: center;">Tu Codigo Para Restalecer La Contraseña Es</p>
                    <h2 style="font-size: 50px; font-weight: bolder; color: #ff2f2f ; text-align: center;">${verificationCode}</h2>
                    <h3 ">El Código De Verificación Fue Enviado A Las: <b>${expirationDate}</b></h3>
                    <h3">Este Código Caducará En 1 Hora.</h3>
                    <h3>Gracias Por Confiar En Master Barber</h2>
                `,
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
                }
                res.status(200).json({ message: 'Código de verificación enviado por correo electrónico' });
            });
        });
    });
});
//FIN CambiarPassword







//INVENTARIO

const storageInventario = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/ImagesInventario')
    },
    filename: function (req, file, cb) {
        cb(null, `inventario_${Date.now()}` + '-' + file.originalname)
    }

})

const uploadInventario = multer({ storage: storageInventario })

app.get('/GetInventario', (req, res) => {
    db.query('SELECT id_producto, nombre, descripcion_P, cantidad, id_categoria_producto, proveedor, PrecioUnitario, Foto,  DATE_FORMAT(fecha_venta, "%Y-%m-%d %H:%i") AS fecha_venta FROM inventario', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})



app.get('/GetInventario/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM inventario WHERE id_producto = ?', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})

app.post('/CreateInventario', uploadInventario.single('foto'), (req, res) => {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion_P;
    const cantidad = req.body.cantidad;
    const categoria = req.body.id_categoria_producto;
    const proveedor = req.body.proveedor;
    const fecha = req.body.fecha_venta;
    const fotoName = req.file.filename;
    const precio = req.body.PrecioUnitario;



    const q = 'INSERT INTO inventario (nombre, descripcion_P, cantidad, id_categoria_producto, proveedor, fecha_venta, Foto, PrecioUnitario) VALUES (?,?,?,?,?,?,?,?)';

    const values = [
        nombre,
        descripcion,
        cantidad,
        categoria,
        proveedor,
        fecha,
        fotoName,
        precio
    ];

    db.query(q, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        } else {
            return res.status(200).send('Producto creado exitosamente');
        }
    });
});

const borrarFotoInventario = async (foto) => {
    try {
        const filePath = path.resolve(__dirname, `./uploads/ImagesInventario/${foto}`);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error eliminando imagen:', err);
    }
};

app.put('/UpdateInventario/:id', uploadInventario.single('foto'), (req, res) => {
    const id = req.params.id;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion_P;
    const cantidad = req.body.cantidad;
    const categoria = req.body.id_categoria_producto;
    const proveedor = req.body.proveedor;
    const fecha = req.body.fecha_venta;
    const fotoName = req.file ? req.file.filename : '';
    const precio = req.body.PrecioUnitario;

    db.query('SELECT Foto FROM inventario WHERE id_producto = ?', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }

        const fotoActual = results[0].Foto;

        if (req.file && fotoActual) {
            borrarFotoInventario(fotoActual);
        }

        const q = 'UPDATE inventario SET nombre = ?, descripcion_P = ?, cantidad = ?, id_categoria_producto = ?, proveedor = ?, fecha_venta = ?, Foto = ?, PrecioUnitario = ? WHERE id_producto = ?';

        const values = [
            nombre,
            descripcion,
            cantidad,
            categoria,
            proveedor,
            fecha,
            fotoName,
            precio,
            id
        ];

        db.query(q, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            } else {
                return res.status(200).send('Producto actualizado exitosamente');
            }
        });
    });
});

app.delete('/DeleteInventario/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM inventario WHERE id_producto = ?', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send('Producto eliminado exitosamente');
        }
    })
});


app.put('/RestarInventario/:id', (req, res) => {
    const id = req.params.id;
    const cantidad = req.body.cantidad;

    db.query('UPDATE inventario SET cantidad = cantidad - ? WHERE id_producto = ?', [cantidad, id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send('Inventario actualizado exitosamente');

        }
    }
    );
});

app.get('/categorias', (req, res) => {
    db.query('SELECT * FROM categoria_producto', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})

// FIN INVENTARIO




// CAMBIO DE CONTRASEÑA

app.post('/Cambiarpasscod', (req, res) => {
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

    db.query(
        'SELECT * FROM usuarios WHERE user_reset_code = ? AND user_reset_code_expiration > ?',
        [verificaCode, fecha],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).send('Error en el servidor');
            }

            if (results.length === 0) {
                return res.status(400).send('Código de verificación inválido o expirado');
            }

            const user = results[0];
            const hashPassword = bcrypt.hashSync(newContrasena, 10);

            db.query(
                'UPDATE usuarios SET contrasena = ?, user_reset_code = NULL, user_reset_code_expiration = NULL WHERE id_usuario = ?',
                [hashPassword, user.id_usuario],
                (err) => {
                    if (err) {
                        console.error('Error al actualizar la contraseña:', err);
                        return res.status(500).send('Error al actualizar la contraseña');
                    }

                    res.status(200).send('Contraseña restablecida con éxito');
                }
            );
        }
    );
});

// FIN CAMBIO DE CONTRASEÑA









// CRUD DEL BARBERO
const storageBarbero = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/imagesBarbero/')
    },
    filename: function (req, file, cb) {
        cb(null, `barbero_${Date.now()}` + '-' + file.originalname)
    }

})

const uploadBarbero = multer({ storage: storageBarbero })

app.get('/GetBarberos', (req, res) => {
    db.query('SELECT * FROM usuarios WHERE id_rol = 2', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})

app.get('/GetBarberos/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM usuarios WHERE id_usuario = ? AND id_rol = 2', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})


app.post('/CreateBarberos', uploadBarbero.single('foto'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido un archivo');
    }
    const nombre = req.body.nombre;
    const email = req.body.email;
    const contrasena = req.body.contrasena;
    const descripcion = req.body.descripcion;
    const fotoName = req.file.filename;



    if (contrasena.length < 8) {
        return res.status(400).send('La contraseña debe tener al menos 8 caracteres');
    }

    const hashPassword = bcrypt.hashSync(contrasena, 10);

    const q = 'INSERT INTO usuarios (nombre_usuario, email, contrasena, descripcion, Foto, id_rol) VALUES (?,?,?,?,?,?)';
    const values = [
        nombre,
        email,
        hashPassword,
        descripcion,
        fotoName,
        2
    ];

    db.query(q, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        } else {
            return res.status(200).send('Barbero creado exitosamente');
        }
    });
});


const borrarFotoBarbero = async (foto) => {
    try {
        const filePath = path.resolve(__dirname, `./uploads/imagesBarbero/${foto}`);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error eliminando imagen:', err);
    }
};


app.put('/UpdateBarberos/:id', uploadBarbero.single('foto'), (req, res) => {

    const id = req.params.id;

    const select = "SELECT * FROM usuarios WHERE id_usuario = ? AND id_rol = 2";

    db.query(select, [req.params.id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }

        const nombre = req.body.nombre
        const email = req.body.email
        const descripcion = req.body.descripcion
        const fotoName = req.file ? req.file.filename : ''

        db.query('SELECT Foto FROM usuarios WHERE id_usuario = ?', [id], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            }

            const fotoActual = results[0].Foto;

            if (req.file && fotoActual) {
                borrarFotoBarbero(fotoActual);
            }
        });

        const q = 'UPDATE usuarios SET nombre_usuario = ?, email = ?, descripcion = ?, Foto = ? WHERE id_usuario = ? AND id_rol = 2'

        const values = [
            nombre,
            email,
            descripcion,
            fotoName,
            id
        ]

        db.query(q, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            }
            else {
                return res.status(200).send('Barbero actualizado exitosamente');
            }
        })
    })
})

app.delete('/DeleteBarberos/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM usuarios  WHERE id_usuario = ? and id_rol = 2', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        } else {
            return res.status(200).send('Barbero eliminado exitosamente');
        }
    })
});

// FIN CRUD BARBERO








//Perfil USUARIO
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/perfil/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }

})

const upload = multer({ storage: storage })



app.post('/actualizarUsuario/:email', upload.single('file'), (req, res) => {
    const file = req.file;
    const email = req.params.email;
    const nombre = req.body.nombre;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }

        let queryValues = [];
        let queryString = 'UPDATE usuarios SET ';
        let setParts = [];

        if (nombre) {
            setParts.push('nombre_usuario = ?');
            queryValues.push(nombre);
        }

        if (file) {
            setParts.push('Foto = ?');
            queryValues.push(file.filename);
        }

        if (setParts.length === 0) {
            return res.status(400).send('No hay campos para actualizar');
        }

        queryString += setParts.join(', ');
        queryString += ' WHERE email = ?';
        queryValues.push(email);

        db.query(queryString, queryValues, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            } else {
                return res.status(200).send('Perfil actualizado exitosamente');
            }
        });
    });
});


app.get('/traerUsuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
}
)

app.get('/traerUsuario/:email', (req, res) => {
    const email = req.params.email
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }
        else {
            return res.status(200).send(results);
        }
    })
})
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

app.post('/actualizarBarbero/:email', uploadBarberoPerfil.single('file'), (req, res) => {
    const file = req.file;
    const email = req.params.email;
    const nombre = req.body.nombre;

    db.query('SELECT * FROM usuarios WHERE email = ? AND id_rol = 2', [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Barbero no encontrado');
        }

        const usuario = results[0];
        const fotoAnterior = usuario.Foto;

        let queryValues = [];
        let queryString = 'UPDATE usuarios SET ';
        let setParts = [];

        if (nombre) {
            setParts.push('nombre_usuario = ?');
            queryValues.push(nombre);
        }

        if (file) {
            setParts.push('Foto = ?');
            queryValues.push(file.filename);
        }

        if (setParts.length === 0) {
            return res.status(400).send('No hay datos para actualizar');
        }

        queryString += setParts.join(', ');
        queryString += ' WHERE email = ? AND id_rol = 2';
        queryValues.push(email);

        db.query(queryString, queryValues, async (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            } else {
                if (file && fotoAnterior) {
                    await borrarFotoAnteriorBarbero(fotoAnterior);
                }
                return res.status(200).send('Perfil del barbero actualizado exitosamente');
            }
        });
    });
});
//PERFILDELBARBERO






// CALIFICACIONES

app.get('/traerCalificaciones', (req, res) => {
    db.query('SELECT * FROM calificaciones', (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.get('/traerCalificacionesUsuario/:id', (req, res) => {
    const idUsuario = req.params.id;
    const q = 'SELECT * FROM calificaciones WHERE usuario_id = ?';
    db.query(q, [idUsuario], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        return res.status(200).json(results);
    });
});

app.put('/CancelarReservaCliente/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT estado FROM reservas WHERE id_reserva = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

        const estadoActual = results[0].estado;
        if (estadoActual !== 'Aceptada') {
            return res.status(400).json({ error: 'Solo puedes cancelar reservas aceptadas.' });
        }

        db.query('UPDATE reservas SET estado = "Cancelada" WHERE id_reserva = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: 'Error al cancelar la reserva' });
            return res.status(200).json({ message: 'Reserva cancelada exitosamente.' });
        });
    });
});




app.post('/Createcalificaciones', (req, res) => {

    const comentario = req.body.comentario;
    const puntuacion = req.body.puntuacion;
    const id_usuario = req.body.id;

    const q = 'INSERT INTO calificaciones (comentario, puntuacion, usuario_id) VALUES (?,?,?)';
    const values = [comentario, puntuacion, id_usuario];

    db.query(q, values, (err, results) => {
        if (err) return res.status(500).json({ error: `Error al registrar la calificación: ${err.message}` });
        console.log(err);
        return res.status(200).json({ message: "Calificación registrada exitosamente" });
    }
    );
});

app.delete('/DeleteCalificaciones/:id', (req, res) => {
    const id = req.params.id;
    const q = 'DELETE FROM calificaciones WHERE id = ?';
    db.query(q, [id], (err, results) => {
        if (err) return res.status(500).json({ error: `Error al eliminar la calificación: ${err.message}` });
        return res.status(200).json({ message: "Calificación eliminada exitosamente" });
    });
})

// FIN   CALIFICACIONES







// RESERVAS

app.get('/GetServicios', (req, res) => {
    db.query('SELECT * FROM tipo_servicio', (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.post('/CrearReservas', async (req, res) => {
    const { cliente_id, barbero_id, fecha, estado, servicio, observacion } = req.body;
    console.log(req.body);

    try {
        const fechaSoloDia = moment(fecha).format('YYYY-MM-DD');
        const q = `
        SELECT COUNT(*) AS total FROM reservas 
        WHERE cliente_id = ? 
        AND DATE(fecha) = ? 
        AND (LOWER(estado) = 'pendiente' OR LOWER(estado) = 'confirmada')
    `;
        const [rows] = await new Promise((resolve, reject) => {
            db.query(q, [cliente_id, fechaSoloDia], (err, results) => {
                if (err) reject(err);
                else resolve([results]);
            });
        });

        if (rows[0].total >= 3) {
            return res.status(400).json({ message: 'Solo puedes hacer 3 reservas por día.' });
        }

        const reservaExistente = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM reservas WHERE barbero_id = ? AND fecha = ?',
                [barbero_id, fecha],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        if (reservaExistente.length > 0) {
            return res.status(400).json({ message: 'La hora seleccionada ya está ocupada. Por favor, elige otra hora.' });
        }

        const reserva = {
            cliente_id,
            barbero_id,
            servicio,
            fecha,
            estado,
            observacion
        };

        db.query('INSERT INTO reservas SET ?', reserva, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al crear la reserva.' });
            }
            res.status(201).json({ message: 'Reserva creada exitosamente.' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la reserva.' });
    }
});

app.get('/GetReservas', (req, res) => {
    db.query('SELECT * FROM reservas', (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.get('/GetReservas/barbero/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM reservas WHERE barbero_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.get('/GetReservas/cliente/:id', (req, res) => {
    const clienteId = req.params.id;

    db.query('SELECT * FROM reservas WHERE cliente_id = ?', [clienteId], (err, results) => {
        if (err) {
            console.error('Error al obtener las reservas del cliente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.status(200).json(results);
    });
});


app.get('/GetReservas/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM reservas WHERE id_reserva = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.put('/UpdateReservas/:id', (req, res) => {
    const id = req.params.id;
    const { cliente_id, barbero_id, servicio, fecha, estado } = req.body;

    const q = 'UPDATE reservas SET cliente_id = ?, barbero_id = ?, servicio = ?, fecha = ?, estado = ? WHERE id_reserva = ?';
    const values = [cliente_id, barbero_id, servicio, fecha, estado, id];

    db.query(q, values, (err, results) => {
        if (err) return res.status(500).json({ error: `Error al actualizar la reserva: ${err.message}` });
        return res.status(200).json({ message: "Reserva actualizada exitosamente" });
    });
});

app.delete('/DeleteReservas/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM reservas WHERE id_reserva = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: `Error al eliminar la reserva: ${err.message}` });
        return res.status(200).json({ message: "Reserva eliminada exitosamente" });
    });
});

app.get('/GetReservasCliente/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM reservas WHERE cliente_id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.put('/UpdateReservasEstado/:id', (req, res) => {
    const id = req.params.id;
    const nuevoEstado = req.body.estado;

    db.query('SELECT estado FROM reservas WHERE id_reserva = ?', [id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Reserva no encontrada' });
        }

        const estadoActual = results[0].estado;

        if (estadoActual === nuevoEstado) {
            return res.status(200).json({ message: 'El estado de la reserva ya es el mismo' });
        }

        const q = 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
        const values = [nuevoEstado, id];

        db.query(q, values, (err, results) => {
            if (err) {
                console.error('Error al actualizar la reserva:', err);
                return res.status(500).json({ error: 'Error al actualizar la reserva' });
            }

            db.query('SELECT r.*, u.email, u.id_usuario AS cliente_id, s.nombre AS servicio_nombre FROM reservas r JOIN usuarios u ON r.cliente_id = u.id_usuario JOIN tipo_servicio s ON r.servicio = s.id_tipo_servicio WHERE r.id_reserva = ?', [id], (err, results) => {
                if (err) {
                    console.error('Error en la consulta:', err);
                    return res.status(500).send('Error en el servidor');
                }

                if (results.length === 0) {
                    return res.status(400).send('Reserva no encontrada');
                }

                const reserva = results[0];
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

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        console.error('Error al enviar el correo electrónico:', error);
                        return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
                    }

                    const mensaje = `El estado de tu reserva ha sido actualizado a: ${nuevoEstado}. Servicio: ${servicioNombre}, Fecha:${new Date(reserva.fecha).toLocaleString()}`;
                    db.query(
                        'INSERT INTO notificaciones (cliente_id, mensaje, fecha) VALUES (?,?,?)',
                        [clienteId, mensaje, new Date(reserva.fecha).toLocaleString()],
                        (err) => {
                            if (err) {
                                console.error('Error al guardar la notificación:', err);
                            }
                        }
                    );

                    res.status(200).json({ message: 'Reserva actualizada y notificación enviada por correo electrónico' });
                });
            });
        });
    });
});

app.post('/VerificarDisponibilidad', (req, res) => {
    const { barbero_id, fecha } = req.body;

    const q = 'SELECT * FROM reservas WHERE barbero_id = ? AND fecha = ?';
    const values = [barbero_id, fecha];

    db.query(q, values, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            return res.status(200).json({ disponible: false });
        } else {
            return res.status(200).json({ disponible: true });
        }
    });
});

app.get('/GetClientes', (req, res) => {
    db.query('SELECT * FROM usuarios WHERE id_rol = 3', (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        return res.status(200).json(results);
    });
});

app.delete('/DeleteReserva/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM reservas WHERE id_reserva = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al eliminar la reserva');
        } else {
            res.send('Reserva eliminada correctamente');
        }
    });
});

// Fin Reservas



// Notificaciones
app.get('/GetNotificaciones/:cliente_id', (req, res) => {
    const cliente_id = req.params.cliente_id;

    db.query(
        'SELECT * FROM notificaciones WHERE cliente_id = ? ORDER BY fecha DESC',
        [cliente_id],
        (err, results) => {
            if (err) {
                console.error('Error al obtener notificaciones:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.status(200).json(results);
        }
    );
});

app.delete('/DeleteNotificacion/:id', async (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM  notificaciones WHERE id_notificacion = ?', [id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error en el servidor');
        } else {
            return res.status(200).send('Notificación eliminada exitosamente');
        }
    })
});

app.delete('/DeleteNotificacionReserva/:id', (req, res) => {
    const reservaId = req.params.id;
    db.query('DELETE FROM notificaciones WHERE reserva_id = ?', [reservaId], (err, results) => {
        if (err) {
            console.error('Error al eliminar la notificación:', err);
            return res.status(500).json({ error: 'Error al eliminar la notificación' });
        }
        res.status(200).json({ message: 'Notificación eliminada correctamente' });
    });
});
// Fin Notificaciones




// VENTAS
app.get('/GetVentas', (req, res) => {
    const { rango } = req.query;

    let q = 'SELECT * FROM ventas';
    const ahora = new Date();

    if (rango === 'diario') {
        q += ` WHERE DATE(fecha) = CURDATE()`;
    } else if (rango === 'semanal') {
        q += ` WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (rango === 'mensual') {
        q += ` WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())`;
    } else if (rango === 'anual') {
        q += ` WHERE YEAR(fecha) = YEAR(CURDATE())`;
    }

    db.query(q, (err, results) => {
        if (err) {
            console.error('Error al obtener las ventas:', err);
            return res.status(500).json({ error: 'Error al obtener las ventas' });
        }
        res.status(200).json(results);
    });
});


app.post('/GuardarVentas', (req, res) => {
    const ventas = req.body;

    if (!Array.isArray(ventas)) {
        return res.status(400).json({ error: 'Las ventas deben ser un array' });
    }

    const q = 'INSERT INTO ventas (id_producto, cantidad, fecha, PrecioUnitario, nombre) VALUES ?';

    const values = ventas.map((venta) => [
        venta.id_producto,
        venta.cantidad,
        venta.fecha,
        venta.PrecioUnitario,
        venta.nombre,
    ]);

    db.query(q, [values], (err, results) => {
        if (err) {
            console.error('Error al guardar las ventas:', err);
            return res.status(500).json({ error: 'Error al guardar las ventas' });
        }
        res.status(200).json({ message: 'Ventas guardadas exitosamente' });
    });
});
// FIN VENTAS



// NOTAS DE VOZ POR SI ACASO
app.use('/notasVoz', express.static(path.join(__dirname, './uploads/notasVoz')));

const storageNotas = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/notasVoz'),
    filename: (req, file, cb) => cb(null, `nota-${Date.now()}-${file.originalname}`),
});
const uploadNota = multer({ storage: storageNotas });

app.post('/uploadNotaVoz', uploadNota.single('audio'), (req, res) => {
    const { usuario_id, reserva_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).send('No se recibió ningún archivo de audio');

    const nombreArchivo = file.filename;
    const q = 'INSERT INTO notas_voz (nombre_archivo, usuario_id, reserva_id) VALUES (?, ?, ?)';
    db.query(q, [nombreArchivo, usuario_id, reserva_id], (err) => {
        if (err) return res.status(500).send('Error al guardar en la base de datos');
        res.status(200).json({ message: 'Nota de voz guardada', filename: nombreArchivo });
    });
});

app.get('/notasVoz/:reserva_id', (req, res) => {
    const { reserva_id } = req.params;
    const q = 'SELECT * FROM notas_voz WHERE reserva_id = ?';
    db.query(q, [reserva_id], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor');
        res.status(200).json(results);
    });
});

app.get('/notasVozUsuario/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;
    const q = 'SELECT * FROM notas_voz WHERE usuario_id = ? ORDER BY fecha DESC';

    db.query(q, [usuario_id], (err, results) => {
        if (err) return res.status(500).send('Error al obtener notas');
        res.status(200).json(results);
    });
});





const borrarArchivoNota = async (filename) => {
    try {
        const filePath = path.join(__dirname, './uploads/notasVoz', filename);
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.error('Error al eliminar el archivo de nota de voz:', err.message);
    }
};

app.delete('/deleteNotaVoz/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT nombre_archivo FROM notas_voz WHERE id = ?', [id], async (err, results) => {
        if (err) return res.status(500).send('Error en el servidor al buscar la nota');

        if (results.length === 0) return res.status(404).send('Nota de voz no encontrada');

        const filename = results[0].nombre_archivo;

        await borrarArchivoNota(filename);

        db.query('DELETE FROM notas_voz WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).send('Error al eliminar la nota de la base de datos');
            return res.status(200).json({ message: 'Nota de voz eliminada correctamente' });
        });
    });
});

//FIN NOTAS DE VOZ






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
        WHERE r.id_reserva = ?
    `;

    db.query(q, [id], (err, results) => {
        if (err || results.length === 0) {
            console.error(err);
            return res.status(500).send("Error al generar la factura");
        }

        const reserva = results[0];
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
                align: 'center',
                underline: false
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
})


















app.get('/', (req, res) => {
    res.send("Api de master barber :)");
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


// CAMBIAR PATCH DE /CancelarReservaCliente/:id Y '/UpdateReservasEstado/:id' A PUT PERO EN EL FRONTEND