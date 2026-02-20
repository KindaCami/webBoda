const pool = require('../db');

const AdminModel = {

    // Login
    async getByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        return rows[0];
    },

    // Estadísticas generales
    async getStats() {
        const [[totals]] = await pool.query(`
            SELECT
                COUNT(*) AS total_guests,
                SUM(attending_ceremony_2026)  AS ceremony_2026,
                SUM(attending_friday_2027)    AS friday_2027,
                SUM(attending_saturday_2027)  AS saturday_2027,
                SUM(attending_sunday_2027)    AS sunday_2027,
                SUM(needs_accommodation)      AS needs_acc,
                SUM(accommodation_friday)     AS acc_friday,
                SUM(accommodation_saturday)   AS acc_saturday,
                SUM(accommodation_sunday)     AS acc_sunday,
                SUM(CASE WHEN accommodation_status = 'confirmed_free' THEN 1 ELSE 0 END) AS confirmed_acc,
                SUM(CASE WHEN accommodation_status = 'waiting_list'   THEN 1 ELSE 0 END) AS waiting_acc,
                SUM(CASE WHEN confirmed_at IS NOT NULL THEN 1 ELSE 0 END) AS confirmed_guests
            FROM guests
        `);

        const [[settings]] = await pool.query(
            "SELECT setting_value FROM settings WHERE setting_key = 'max_accommodation_spots'"
        );
        totals.max_spots = settings ? settings.setting_value : 100;
        totals.free_spots = totals.max_spots - (totals.confirmed_acc || 0);

        return totals;
    },

    // Conteo de menús
    async getMenuStats() {
        const [rows] = await pool.query(`
            SELECT menu_type, COUNT(*) AS total
            FROM guests
            GROUP BY menu_type
        `);
        return rows;
    },

    // Todos los grupos con sus invitados
    async getAllGroups() {
        const [rows] = await pool.query(`
            SELECT
                ig.id AS group_id, ig.group_name, ig.access_code, ig.is_vip, ig.max_members,
                g.id, g.fullname, g.email,
                g.attending_ceremony_2026, g.attending_friday_2027,
                g.attending_saturday_2027, g.attending_sunday_2027,
                g.accommodation_friday, g.accommodation_saturday, g.accommodation_sunday,
                g.accommodation_status, g.needs_accommodation,
                g.menu_type, g.allergies_specifications, g.observations,
                g.confirmed_at
            FROM invitation_groups ig
            LEFT JOIN guests g ON g.group_id = ig.id
            ORDER BY ig.id, g.id
        `);

        // Agrupar por grupo
        const groups = {};
        rows.forEach(row => {
            if (!groups[row.group_id]) {
                groups[row.group_id] = {
                    id: row.group_id,
                    group_name: row.group_name,
                    access_code: row.access_code,
                    is_vip: row.is_vip,
                    max_members: row.max_members,
                    members: []
                };
            }
            if (row.id) {
                groups[row.group_id].members.push({
                    id: row.id,
                    fullname: row.fullname,
                    email: row.email,
                    attending_ceremony_2026: row.attending_ceremony_2026,
                    attending_friday_2027: row.attending_friday_2027,
                    attending_saturday_2027: row.attending_saturday_2027,
                    attending_sunday_2027: row.attending_sunday_2027,
                    accommodation_friday: row.accommodation_friday,
                    accommodation_saturday: row.accommodation_saturday,
                    accommodation_sunday: row.accommodation_sunday,
                    accommodation_status: row.accommodation_status,
                    needs_accommodation: row.needs_accommodation,
                    menu_type: row.menu_type,
                    allergies_specifications: row.allergies_specifications,
                    observations: row.observations,
                    confirmed_at: row.confirmed_at
                });
            }
        });
        return Object.values(groups);
    },

    // Invitados con alergias
    async getAllergies() {
        const [rows] = await pool.query(`
            SELECT g.fullname, ig.group_name, g.menu_type, g.allergies_specifications, g.observations
            FROM guests g
            JOIN invitation_groups ig ON g.group_id = ig.id
            WHERE g.allergies_specifications IS NOT NULL AND g.allergies_specifications != ''
               OR g.menu_type != 'estandar'
               OR (g.observations IS NOT NULL AND g.observations != '')
            ORDER BY ig.group_name
        `);
        return rows;
    },

    // Lista de espera
    async getWaitingList() {
        const [rows] = await pool.query(`
            SELECT g.fullname, g.email, ig.group_name,
                   g.accommodation_friday, g.accommodation_saturday, g.accommodation_sunday
            FROM guests g
            JOIN invitation_groups ig ON g.group_id = ig.id
            WHERE g.accommodation_status = 'waiting_list'
            ORDER BY g.confirmed_at ASC
        `);
        return rows;
    },

    // Datos para CSV
    async getAllForCSV() {
        const [rows] = await pool.query(`
            SELECT
                ig.group_name, ig.is_vip,
                g.fullname, g.email,
                g.attending_ceremony_2026, g.attending_friday_2027,
                g.attending_saturday_2027, g.attending_sunday_2027,
                g.accommodation_friday, g.accommodation_saturday, g.accommodation_sunday,
                g.accommodation_status, g.menu_type,
                g.allergies_specifications, g.observations,
                g.confirmed_at
            FROM guests g
            JOIN invitation_groups ig ON g.group_id = ig.id
            ORDER BY ig.group_name, g.fullname
        `);
        return rows;
    },

    // Actualizar invitado
    async updateGuest(id, data) {
        await pool.query(`
            UPDATE guests SET
                fullname = ?, email = ?, menu_type = ?,
                allergies_specifications = ?, observations = ?
            WHERE id = ?
        `, [data.fullname, data.email, data.menu_type, data.allergies, data.observations, id]);
    },

    // Eliminar invitado
    async deleteGuest(id) {
        await pool.query('DELETE FROM guests WHERE id = ?', [id]);
    },

    // Actualizar camas disponibles
    async updateMaxSpots(value) {
        await pool.query(
            "UPDATE settings SET setting_value = ? WHERE setting_key = 'max_accommodation_spots'",
            [value]
        );
    }
};

module.exports = AdminModel;
