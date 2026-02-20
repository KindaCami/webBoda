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
    }
};

module.exports = adminController;
