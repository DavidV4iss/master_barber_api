const mysql = require('mysql');

beforeAll(() => {
    global.db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'master_barber',
    });
    global.db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        }
    });
});

afterAll(() => {
    global.db.end();
});

describe('Calificaciones', () => {
    test('Obtener calificaciones', async () => {
        const query = (sql) => {
            return new Promise((resolve, reject) => {
                global.db.query(sql, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        const results = await query('SELECT * FROM calificaciones');
        expect(results[0].puntuacion).toBe(5);
    });

    test('Insertar calificaciones', async () => {
        const query = (sql) => {
            return new Promise((resolve, reject) => {
                global.db.query(sql, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        const results = await query('INSERT INTO calificaciones (comentario, puntuacion, usuario_id) VALUES ("hola",5,64)');
        expect(results.affectedRows).toBe(1);
    })

    test('Eliminar calificaciones', async () => {
        const query = (sql) => {
            return new Promise((resolve, reject) => {
                global.db.query(sql, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        };

        const results = await query('DELETE FROM calificaciones WHERE id = 102');
        expect(results.affectedRows).toBe(1);
    })


});
