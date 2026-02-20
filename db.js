const mysql = require('mysql2/promise');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

// Crear el Pool de conexiones
// Usamos un Pool porque es más eficiente: mantiene varias conexiones abiertas
// listas para usarse, en lugar de abrir y cerrar una cada vez.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prueba de conexión inicial (solo para ver en consola que todo va bien)
pool.getConnection()
    .then(connection => {
        console.log('Base de datos conectada correctamente a: ' + process.env.DB_NAME);
        connection.release();
    })
    .catch(error => {
        console.error('Error al conectar con la Base de Datos:', error.message);
    });

module.exports = pool;
