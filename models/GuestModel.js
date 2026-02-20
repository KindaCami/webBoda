const pool = require('../db');

const GuestModel = {
    async getByGroupId(groupId) {
        try {
            const [rows] = await pool.query('SELECT * FROM guests WHERE group_id = ?', [groupId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async updateAttendance(id, ceremony_2026, friday_2027, saturday_2027, sunday_2027,
                           acc_friday, acc_saturday, acc_sunday, needs_accommodation,
                           menu_type, allergies, observations, email) {
        try {
            const [result] = await pool.query(
                `UPDATE guests SET
                    attending_ceremony_2026   = ?,
                    attending_friday_2027     = ?,
                    attending_saturday_2027   = ?,
                    attending_sunday_2027     = ?,
                    accommodation_friday      = ?,
                    accommodation_saturday    = ?,
                    accommodation_sunday      = ?,
                    needs_accommodation       = ?,
                    menu_type                 = ?,
                    allergies_specifications  = ?,
                    observations              = ?,
                    email                     = COALESCE(NULLIF(?, ''), email),
                    confirmed_at              = NOW()
                WHERE id = ?`,
                [ceremony_2026, friday_2027, saturday_2027, sunday_2027,
                 acc_friday, acc_saturday, acc_sunday, needs_accommodation,
                 menu_type, allergies, observations, email, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = GuestModel;
