const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ── MIDDLEWARE: proteger rutas de admin ──
const requireAdmin = (req, res, next) => {
    if (req.session.admin) return next();
    res.redirect('/admin');
};

// Login
router.get('/',         adminController.showLogin);
router.post('/login',   adminController.login);
router.get('/logout',   adminController.logout);

// Panel (protegido)
router.get('/dashboard',              requireAdmin, adminController.showDashboard);
router.get('/export/csv',             requireAdmin, adminController.exportCSV);
router.post('/guest/edit/:id',        requireAdmin, adminController.editGuest);
router.post('/guest/delete/:id',      requireAdmin, adminController.deleteGuest);
router.post('/settings/spots',        requireAdmin, adminController.updateSpots);

module.exports = router;
