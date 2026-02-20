const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const botController = require('../controllers/botController');

//Rutas
router.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('landing');
});

router.get('/intro', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    authController.showLogin(req, res);
});
router.get('/login-form', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    authController.showLogin(req, res);
});
router.post('/bot/chat', botController.chat); //Bot
router.post('/login', authController.login);    // Enviar el formulario (La nueva)
router.get('/logout', authController.logout);   // Salir
router.get('/dashboard', authController.showDashboard);
router.post('/confirmar-asistencia', authController.confirmAttendance);

module.exports = router;