# 📬 Guía de Pruebas con Postman — HU-AUTH-03: Recuperación de Contraseña

## Configuración Inicial

### 1. Importar la colección
1. Abre Postman.
2. Crea una nueva **Collection** llamada `HU-AUTH-03 - Recuperación de Contraseña`.
3. Configura la variable de colección `BASE_URL` = `http://localhost:3001`.

### 2. Pre-requisitos
- El servidor debe estar corriendo: `npm run dev`.
- Debe existir al menos un usuario en la tabla `Usuario` de la base de datos con un correo válido.
- Las credenciales SMTP en `.env` deben estar configuradas correctamente.

---

## Prueba 1: Solicitar Recuperación de Contraseña (Forgot Password)

### Request
- **Método:** `POST`
- **URL:** `{{BASE_URL}}/auth/forgot-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "correo": "usuario_existente@ejemplo.com"
}
```

### Respuestas Esperadas

| Escenario | Status | Body |
|-----------|--------|------|
| ✅ Correo existe | `200 OK` | `{ "message": "Se ha enviado un enlace de recuperación a tu correo electrónico." }` |
| ❌ Correo no existe | `404 Not Found` | `{ "message": "No se encontró un usuario con ese correo electrónico." }` |
| ❌ Cuenta bloqueada | `403 Forbidden` | `{ "message": "Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos." }` |
| ❌ Sin correo en body | `400 Bad Request` | `{ "message": "El campo 'correo' es obligatorio." }` |

### Verificación
- Revisar la bandeja de entrada del correo proporcionado.
- El correo debe contener un botón/enlace con formato:
  `http://localhost:3000/reset-password?token=<UUID>`
- **Copiar el token UUID** de la URL para usar en la Prueba 2.

---

## Prueba 2: Restablecer Contraseña (Reset Password)

### Request
- **Método:** `POST`
- **URL:** `{{BASE_URL}}/auth/reset-password`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "token": "PEGAR_TOKEN_DEL_CORREO_AQUÍ",
  "nuevaPassword": "MiNuevaContraseña123!"
}
```

### Respuestas Esperadas

| Escenario | Status | Body |
|-----------|--------|------|
| ✅ Token válido | `200 OK` | `{ "message": "La contraseña se ha restablecido exitosamente." }` |
| ❌ Token inválido | `400 Bad Request` | `{ "message": "El token es inválido o ha expirado." }` |
| ❌ Cuenta bloqueada | `403 Forbidden` | `{ "message": "Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 14 minutos." }` |
| ❌ Contraseña corta (<8) | `400 Bad Request` | `{ "message": "La contraseña debe tener al menos 8 caracteres." }` |
| ❌ Campos faltantes | `400 Bad Request` | `{ "message": "Los campos 'token' y 'nuevaPassword' son obligatorios." }` |

### Verificación
- Intentar iniciar sesión con la nueva contraseña.
- Intentar usar el mismo token de nuevo → debe retornar `400` (token ya usado).

---

## Prueba 3: Endpoint de Salud

### Request
- **Método:** `GET`
- **URL:** `{{BASE_URL}}/health`

### Respuesta Esperada
- **Status:** `200 OK`
- **Body:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-30T17:00:00.000Z"
}
```

---

## Swagger UI
Accede a la documentación interactiva en: **`http://localhost:3001/api-docs`**

Desde aquí puedes probar los endpoints directamente sin Postman.

---

## Flujo Completo de Prueba

```
1. POST /auth/forgot-password  →  Envía correo con token
         ↓
2. Revisar bandeja de entrada  →  Copiar token del enlace
         ↓
3. POST /auth/reset-password   →  Enviar token + nueva contraseña
         ↓
4. Verificar login con nueva contraseña
```

> **Nota para el equipo de pruebas (rama `test`):**
> Asegúrense de que las variables de entorno en `.env` estén correctamente configuradas
> antes de ejecutar las pruebas. Usen `.env.example` como referencia.
