const bcrypt = require('bcrypt');
const AdminModel = require('../models/AdminModel');

const adminController = {

    // GET /admin
    showLogin: (req, res) => {
        if (req.session.admin) return res.redirect('/admin/dashboard');
        res.render('admin/login', { error: null });
    },

    // POST /admin/login
    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const admin = await AdminModel.getByUsername(username);
            if (admin && await bcrypt.compare(password, admin.password_hash)) {
                req.session.admin = { id: admin.id, username: admin.username };
                return res.redirect('/admin/dashboard');
            }
            res.render('admin/login', { error: 'Usuario o contraseña incorrectos' });
        } catch (err) {
            console.error(err);
            res.render('admin/login', { error: 'Error del servidor' });
        }
    },

    // GET /admin/logout
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin');
    },

    // GET /admin/dashboard
    showDashboard: async (req, res) => {
        try {
            const [stats, menuStats, groups, allergies, waitingList] = await Promise.all([
                AdminModel.getStats(),
                AdminModel.getMenuStats(),
                AdminModel.getAllGroups(),
                AdminModel.getAllergies(),
                AdminModel.getWaitingList()
            ]);
            res.render('admin/dashboard', {
                stats, menuStats, groups, allergies, waitingList,
                success: req.query.success || null,
                error: req.query.error || null
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al cargar el panel: ' + err.message);
        }
    },

    // POST /admin/guest/edit/:id
    editGuest: async (req, res) => {
        try {
            await AdminModel.updateGuest(req.params.id, req.body);
            res.redirect('/admin/dashboard?success=Invitado+actualizado');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/dashboard?error=Error+al+actualizar');
        }
    },

    // POST /admin/guest/delete/:id
    deleteGuest: async (req, res) => {
        try {
            await AdminModel.deleteGuest(req.params.id);
            res.redirect('/admin/dashboard?success=Invitado+eliminado');
        } catch (err) {
            console.error(err);
            res.redirect('/admin/dashboard?error=Error+al+eliminar');
        }
    },

    // POST /admin/settings/spots
    updateSpots: async (req, res) => {
        try {
            const value = parseInt(req.body.max_spots);
            if (isNaN(value) || value < 0) throw new Error('Valor inválido');
            await AdminModel.updateMaxSpots(value);
            res.redirect('/admin/dashboard?success=Camas+actualizadas');
        } catch (err) {
            res.redirect('/admin/dashboard?error=Error+al+actualizar+camas');
        }
    },

    // GET /admin/export/csv
    exportCSV: async (req, res) => {
        try {
            const rows = await AdminModel.getAllForCSV();
            const headers = [
                'Grupo', 'VIP', 'Nombre', 'Email',
                'Ceremonia 2026', 'Viernes 2027', 'Sábado 2027', 'Domingo 2027',
                'Noche Viernes', 'Noche Sábado', 'Noche Domingo',
                'Estado Alojamiento', 'Menú', 'Alergias', 'Observaciones', 'Confirmado el'
            ];

            const csvRows = rows.map(r => [
                r.group_name,
                r.is_vip ? 'Sí' : 'No',
                r.fullname,
                r.email || '',
                r.attending_ceremony_2026 ? 'Sí' : 'No',
                r.attending_friday_2027   ? 'Sí' : 'No',
                r.attending_saturday_2027 ? 'Sí' : 'No',
                r.attending_sunday_2027   ? 'Sí' : 'No',
                r.accommodation_friday    ? 'Sí' : 'No',
                r.accommodation_saturday  ? 'Sí' : 'No',
                r.accommodation_sunday    ? 'Sí' : 'No',
                r.accommodation_status || '',
                r.menu_type || 'estandar',
                (r.allergies_specifications || '').replace(/,/g, ';'),
                (r.observations || '').replace(/,/g, ';'),
                r.confirmed_at ? new Date(r.confirmed_at).toLocaleString('es-ES') : 'Sin confirmar'
            ].map(v => `"${v}"`).join(','));

            const csv = [headers.join(','), ...csvRows].join('\n');
            const bom = '\uFEFF'; // UTF-8 BOM para Excel

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="invitados_boda_${new Date().toISOString().slice(0,10)}.csv"`);
            res.send(bom + csv);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al exportar');
        }
    },

    // POST admin/email/indicaciones2026
    enviarIndicaciones2026: async (req, res) => {
    try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { emailIndicaciones2026 } = require('../services/emailIndicaciones2026');
        const pool = require('../db');
 
        // Obtener emails únicos de grupos con al menos un asistente a la ceremonia 2026
        const [rows] = await pool.query(`
            SELECT DISTINCT g.email
            FROM guests g
            WHERE g.attending_ceremony_2026 = 1
              AND g.email IS NOT NULL
              AND g.email != ''
        `);
 
        if (rows.length === 0) {
            return res.redirect('/admin/dashboard?error=No+hay+emails+para+enviar');
        }
 
        const emails = ['milene.medina12@gmail.com','juanmahr7@gmail.com','aurora.larez@gmail.com','lauravft@gmail.com','thonah25@gmail.com'];
        const html = emailIndicaciones2026();
 
        // Enviar con delay entre emails
        const resultados = [];
        for (const to of emails) {
            const r = await resend.emails.send({
            from: 'Boda Camilo y Víctor <hola@bodacamiloyvictor.com>',
            to,
            subject: 'Boda Camilo y Víctor · Indicaciones Ceremonia 22 Mayo 2026',
            html
        });
    resultados.push(r);
    await new Promise(resolve => setTimeout(resolve, 600));
}
 
        const enviados  = resultados.filter(r => r.status === 'fulfilled').length;
        const fallidos  = resultados.filter(r => r.status === 'rejected').length;
 
        console.log(`Indicaciones 2026: ${enviados} enviados, ${fallidos} fallidos`);
        res.redirect(`/admin/dashboard?success=Emails+enviados:+${enviados}+de+${emails.length}`);
 
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard?error=Error+al+enviar+emails');
    }
}
};

module.exports = adminController;
