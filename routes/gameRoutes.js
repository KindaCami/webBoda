const express = require('express');
const router  = express.Router();
const pool    = require('../db');

const requireUser = (req, res, next) => {
    if (req.session.user) return next();
    req.session.returnTo = '/game';
    res.redirect('/intro');
};

// GET /game — pasar miembros del grupo al frontend
router.get('/', requireUser, async (req, res) => {
    try {
        const [members] = await pool.query(
            'SELECT id, fullname FROM guests WHERE group_id = ? ORDER BY id ASC',
            [req.session.user.id]
        );
        res.render('game', { user: req.session.user, members });
    } catch (err) {
        console.error(err);
        res.render('game', { user: req.session.user, members: [] });
    }
});

// GET /game/check/:guestId — ¿ya jugó este invitado?
router.get('/check/:guestId', requireUser, async (req, res) => {
    try {
        const guestId = parseInt(req.params.guestId);
        const [check] = await pool.query(
            'SELECT id FROM guests WHERE id = ? AND group_id = ?',
            [guestId, req.session.user.id]
        );
        if (!check.length) return res.status(403).json({ error: 'No autorizado' });

        const [results] = await pool.query(
            'SELECT player_name, score, prize_category FROM game_results WHERE guest_id = ? ORDER BY score DESC LIMIT 1',
            [guestId]
        );
        res.json(results.length > 0 ? { yaJugo: true, resultado: results[0] } : { yaJugo: false });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
});

// POST /game/score — guardar por invitado individual
router.post('/score', requireUser, async (req, res) => {
    const { guest_id, player_name, score } = req.body;
    if (!guest_id || !player_name || score === undefined) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    try {
        const [check] = await pool.query(
            'SELECT id FROM guests WHERE id = ? AND group_id = ?',
            [guest_id, req.session.user.id]
        );
        if (!check.length) return res.status(403).json({ error: 'No autorizado' });

        const [existing] = await pool.query(
            'SELECT id FROM game_results WHERE guest_id = ? LIMIT 1',
            [guest_id]
        );
        if (existing.length > 0) {
            return res.json({ ok: false, motivo: 'Este invitado ya ha jugado.' });
        }

        let prize_category = 'participante';
        if (score >= 2000)      prize_category = 'maestro';
        else if (score >= 1200) prize_category = 'experto';
        else if (score >= 600)  prize_category = 'conocedor';

        await pool.query(
            'INSERT INTO game_results (guest_id, player_name, score, prize_category) VALUES (?, ?, ?, ?)',
            [guest_id, player_name, score, prize_category]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error guardando score' });
    }
});

// GET /game/ranking — top 10 (sin autenticación para la landing)
router.get('/ranking', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT player_name, score, prize_category FROM game_results ORDER BY score DESC LIMIT 10'
        );
        res.json(rows);
    } catch (err) {
        res.json([]);
    }
});

module.exports = router;
