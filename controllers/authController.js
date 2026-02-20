const GroupModel = require('../models/GroupModel');
const GuestModel = require('../models/GuestModel');
const { enviarEmails } = require('../services/emailService');

const authController = {

    showLogin: (req, res) => {
        const view = req.path === '/login-form' ? 'login-form' : 'login';
        res.render(view, { titulo: 'Bienvenido a la Boda', error: null });
    },

    login: async (req, res) => {
        const { access_code } = req.body;
        try {
            const group = await GroupModel.getByAccessCode(access_code);
            if (group) {
                req.session.user = { id: group.id, name: group.group_name, is_vip: group.is_vip };
                const returnTo = req.session.returnTo || '/dashboard';
                delete req.session.returnTo;
                res.redirect(returnTo);
            } else {
                res.render('login-form', { titulo: 'Bienvenido a la Boda', error: 'Código incorrecto. Inténtalo de nuevo.' });
            }
        } catch (error) {
            console.error(error);
            res.render('login-form', { titulo: 'Error', error: 'Hubo un error en el servidor.' });
        }
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    },

    showDashboard: async (req, res) => {
        if (!req.session.user) return res.redirect('/');
        try {
            const members = await GuestModel.getByGroupId(req.session.user.id);
            const groupEmail = members.find(m => m.email)?.email || '';
            res.render('dashboard', {
                user: req.session.user,
                members,
                groupEmail,
                success: req.query.success === '1'
            });
        } catch (error) {
            console.error("ERROR DASHBOARD:", error);
            res.status(500).send("Error al cargar los invitados: " + error.message);
        }
    },

    confirmAttendance: async (req, res) => {
        if (!req.session.user) return res.redirect('/');
        try {
            const {
                guest_id, group_email,
                ceremony_2026, friday_2027, saturday_2027, sunday_2027,
                acc_friday, acc_saturday, acc_sunday,
                menu_type, allergies, observations
            } = req.body;

            const ids = Array.isArray(guest_id) ? guest_id : [guest_id];

            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];

                const attending_ceremony = ceremony_2026 && ceremony_2026[i] ? 1 : 0;
                const attending_friday   = friday_2027   && friday_2027[i]   ? 1 : 0;
                const attending_saturday = saturday_2027 && saturday_2027[i] ? 1 : 0;
                const attending_sunday   = sunday_2027   && sunday_2027[i]   ? 1 : 0;
                const night_friday       = acc_friday    && acc_friday[i]    ? 1 : 0;
                const night_saturday     = acc_saturday  && acc_saturday[i]  ? 1 : 0;
                const night_sunday       = acc_sunday    && acc_sunday[i]    ? 1 : 0;
                const needs_acc = (night_friday || night_saturday || night_sunday) ? 1 : 0;

                const menuValue    = menu_type    && menu_type[i]    ? menu_type[i]    : 'estandar';
                const allergyValue = allergies    && allergies[i]    ? allergies[i]    : null;
                const obsValue     = observations && observations[i] ? observations[i] : null;
                const emailValue   = group_email  ? group_email.trim() || null : null;

                await GuestModel.updateAttendance(
                    id,
                    attending_ceremony, attending_friday, attending_saturday, attending_sunday,
                    night_friday, night_saturday, night_sunday, needs_acc,
                    menuValue, allergyValue, obsValue, emailValue
                );
            }

            // Obtener datos actualizados y enviar emails
            const members = await GuestModel.getByGroupId(req.session.user.id);

            // Enviar emails sin bloquear la respuesta
            enviarEmails(req.session.user, members).catch(err =>
                console.error('Error enviando emails:', err)
            );

            res.redirect('/dashboard?success=1');

        } catch (error) {
            console.error(error);
            res.status(500).send("Error al guardar la asistencia");
        }
    }
};

module.exports = authController;
