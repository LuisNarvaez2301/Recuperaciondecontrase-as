const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { forgotPassword, resetPassword } = require('../controllers/authController');

const router = Router();

// Configuración de Rate Limit para recuperación de contraseña
// 5 solicitudes cada 15 minutos por IP
const recoveryRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, 
    message: {
        message: 'Demasiadas solicitudes de recuperación desde esta IP. Intente nuevamente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/recuperar-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: >
 *       Envía un correo electrónico con un enlace de recuperación de contraseña
 *       al usuario registrado con el correo proporcionado.
 *       Límite: 5 solicitudes cada 15 minutos por IP.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Correo electrónico del usuario registrado
 *     responses:
 *       200:
 *         description: Enlace de recuperación enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Se ha enviado un enlace de recuperación a tu correo electrónico.
 *       403:
 *         description: Cuenta bloqueada por múltiples intentos fallidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se encontró un usuario con ese correo electrónico.
 *       429:
 *         description: Demasiadas solicitudes (Rate Limit)
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor.
 */
router.post('/recuperar-password', recoveryRateLimit, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: >
 *       Restablecer la contraseña del usuario utilizando el token de recuperación
 *       recibido por correo electrónico.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - nuevaPassword
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *                 description: Token de recuperación recibido por correo
 *               nuevaPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NuevaContraseña123!
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: La contraseña se ha restablecido exitosamente.
 *       403:
 *         description: Cuenta bloqueada por múltiples intentos fallidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor.
 */
router.post('/reset-password', resetPassword);

module.exports = router;
