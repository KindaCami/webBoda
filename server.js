if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares — PRIMERO los parsers, LUEGO las rutas
app.use(session({
    secret: 'lollipop_wedding_mapper',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 3. Rutas — DESPUÉS de los parsers
app.use('/game',  require('./routes/gameRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/',      require('./routes/authRoutes'));

// Galería post-logout
app.get('/galeria', (req, res) => {
    if (!req.session.visited) return res.redirect('/');
    res.render('galeria');
});

// 4. Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor MVC arrancado en http://localhost:${PORT}`);
});