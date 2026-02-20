const pool = require('../db');

const GroupModel = {
    async getByAccessCode(code) {
        try {
            const [rows] = await pool.query('SELECT * FROM invitation_groups WHERE access_code = ?', [code]);
            return rows[0]; // Devuelve el grupo si existe, o undefined si no
        } catch (error) {
            throw error;
        }
    }
};

module.exports = GroupModel;