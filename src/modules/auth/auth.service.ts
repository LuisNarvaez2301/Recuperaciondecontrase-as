import { AppDataSource } from '../../config/database';
import { Usuario } from '../../entities/Usuario';
import { RecuperacionPassword } from '../../entities/RecuperacionPassword';
import { ConfiguracionSistema } from '../../entities/ConfiguracionSistema';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

const SALT_ROUNDS = 10;

export class AuthService {
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private recuperacionRepo = AppDataSource.getRepository(RecuperacionPassword);
  private configRepo = AppDataSource.getRepository(ConfiguracionSistema);

  /**
   * Obtiene un valor de configuración de la BD o devuelve el valor por defecto
   */
  private async getConfig(clave: string, valorDefault: number): Promise<number> {
    const config = await this.configRepo.findOne({ where: { clave } });
    if (config && config.valor) {
      const parsed = parseInt(config.valor, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return valorDefault;
  }

  /**
   * Verifica si el usuario está bloqueado. Lanza 403 si lo está.
   */
  private verificarBloqueo(usuario: Usuario): void {
    if (usuario.bloqueado_hasta && new Date() < usuario.bloqueado_hasta) {
      const minutosRestantes = Math.ceil((usuario.bloqueado_hasta.getTime() - new Date().getTime()) / 60000);
      throw { 
        status: 403, 
        message: `Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en ${minutosRestantes} minutos.` 
      };
    }
  }

  /**
   * Registra un intento fallido y bloquea la cuenta si supera el máximo
   */
  public async registrarIntentoFallido(usuario: Usuario): Promise<void> {
    const intentosMax = await this.getConfig('intentos_max_login', 5);
    const tiempoBloqueoMin = await this.getConfig('tiempo_bloqueo_minutos', 15);

    usuario.intentos_fallidos += 1;

    if (usuario.intentos_fallidos >= intentosMax) {
      const fechaDesbloqueo = new Date();
      fechaDesbloqueo.setMinutes(fechaDesbloqueo.getMinutes() + tiempoBloqueoMin);
      usuario.bloqueado_hasta = fechaDesbloqueo;
      usuario.intentos_fallidos = 0; // Se resetea para que empiece de 0 luego del bloqueo
    }

    await this.usuarioRepo.save(usuario);
  }

  /**
   * Limpia los intentos fallidos tras un éxito
   */
  private async limpiarIntentosFallidos(usuario: Usuario): Promise<void> {
    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = undefined; // o null, dependiendo de TypeORM, en entity es opcional
    await this.usuarioRepo.update(usuario.id_usuario, {
      intentos_fallidos: 0,
      bloqueado_hasta: null as any,
    });
  }

  /**
   * Proceso de "Olvidé mi contraseña"
   */
  async forgotPassword(correo: string): Promise<{ message: string }> {
    const usuario = await this.usuarioRepo.findOne({ where: { correo } });
    if (!usuario) {
      throw { status: 404, message: 'No se encontró un usuario con ese correo electrónico.' };
    }

    // Verificar si está bloqueado antes de permitir enviar correo
    this.verificarBloqueo(usuario);

    const tokenPlano = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(tokenPlano, SALT_ROUNDS);
    
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 1);

    const recuperacion = this.recuperacionRepo.create({
      id_usuario: usuario.id_usuario,
      token_hash: tokenHash,
      fecha_expiracion: fechaExpiracion,
      estado: 'pendiente',
    });
    await this.recuperacionRepo.save(recuperacion);

    const enlaceRecuperacion = `${process.env.FRONTEND_URL}/reset-password?token=${tokenPlano}`;
    await this.enviarCorreoRecuperacion(correo, enlaceRecuperacion);

    return { message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' };
  }

  /**
   * Proceso de "Restablecer contraseña"
   */
  async resetPassword(token: string, nuevaPassword: string): Promise<{ message: string }> {
    const registros = await this.recuperacionRepo.find({
      where: { estado: 'pendiente' },
      relations: ['usuario'], // Cargar relación para verificar bloqueos
    });

    let registroValido: RecuperacionPassword | null = null;

    for (const registro of registros) {
      if (new Date() > registro.fecha_expiracion) continue;
      
      const coincide = await bcrypt.compare(token, registro.token_hash);
      if (coincide) {
        registroValido = registro;
        break;
      }
    }

    if (!registroValido) {
      // Como no conocemos al usuario exacto porque el token es inválido,
      // no sabemos a quién incrementar intentos_fallidos fácilmente a menos 
      // que cambien el endpoint para recibir correo. 
      // Según arquitectura provista, lanzamos 400.
      throw { status: 400, message: 'El token es inválido o ha expirado.' };
    }

    // Verificar si la cuenta fue bloqueada entre que pidió el correo y ahora
    this.verificarBloqueo(registroValido.usuario);

    // Hashear nueva contraseña
    const nuevoHash = await bcrypt.hash(nuevaPassword, SALT_ROUNDS);

    // Actualizar contraseña y limpiar bloqueos
    await this.usuarioRepo.update(
      { id_usuario: registroValido.id_usuario },
      { password_hash: nuevoHash }
    );
    await this.limpiarIntentosFallidos(registroValido.usuario);

    // Marcar token como usado
    await this.recuperacionRepo.update(
      { id_token: registroValido.id_token },
      { estado: 'usado' }
    );

    return { message: 'La contraseña se ha restablecido exitosamente.' };
  }

  /**
   * Envía correo con Nodemailer
   */
  private async enviarCorreoRecuperacion(destinatario: string, enlace: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Plataforma Adopción de Mascotas" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: 'Recuperación de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${enlace}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p style="color: #666; font-size: 14px;">Este enlace expirará en <strong>1 hora</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
