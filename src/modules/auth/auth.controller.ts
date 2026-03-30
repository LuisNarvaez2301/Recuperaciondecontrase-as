import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Solicitar recuperación de contraseña
   *     description: >
   *       Envía un correo electrónico con un enlace de recuperación de contraseña
   *       al usuario registrado con el correo proporcionado.
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
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { correo } = req.body;

      if (!correo) {
        res.status(400).json({ message: "El campo 'correo' es obligatorio." });
        return;
      }

      const result = await authService.forgotPassword(correo);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({ message: error.message });
        return;
      }
      console.error('Error en forgotPassword:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Restablecer contraseña
   *     description: >
   *       Restablece la contraseña del usuario utilizando el token de recuperación
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
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, nuevaPassword } = req.body;

      if (!token || !nuevaPassword) {
        res.status(400).json({ message: "Los campos 'token' y 'nuevaPassword' son obligatorios." });
        return;
      }

      if (nuevaPassword.length < 8) {
        res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
        return;
      }

      const result = await authService.resetPassword(token, nuevaPassword);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({ message: error.message });
        return;
      }
      console.error('Error en resetPassword:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
}
