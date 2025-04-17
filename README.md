# NestJS Real-Time Chat Application

Una aplicación de chat en tiempo real construida con NestJS y Socket.IO.

## 🚀 Características

- Comunicación en tiempo real
- Notificaciones de usuarios (entrada/salida)
- Mensajes con marca de tiempo
- Interfaz de usuario simple e intuitiva
- Soporte para múltiples usuarios
- Sistema de salas de chat

## 📋 Prerrequisitos

- Node.js (v14 o superior)
- npm o yarn
- Git

## 🔧 Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/nest-chat-app.git
cd nest-chat-app
```
## Instalar dependencias

```bash
npm install
```
## Iniciar el servidor de desarrollo

```bash
npm run start:dev
```
## 📦 Dependencias Principales
@nestjs/websockets

@nestjs/platform-socket.io

socket.io

## 🛠️ Tecnologías Utilizadas
NestJS - Framework de backend

Socket.IO - Biblioteca para comunicación en tiempo real

TypeScript - Lenguaje de programación

HTML/CSS - Frontend básico

## 🔌 Uso de WebSockets
### Eventos del Cliente
join: Conectar un usuario al chat
message: Enviar un mensaje
disconnect: Desconectar un usuario
### Eventos del Servidor
userJoined: Notifica cuando un usuario se une
message: Transmite mensajes a todos los usuarios
userLeft: Notifica cuando un usuario abandona el chat

## 📝 Ejemplo de Uso
Abrir index.html en el navegador

Ingresar un nombre de usuario

Comenzar a chatear

typescript
// Ejemplo de conexión desde el cliente
const socket = io('http://localhost:3000');

// Enviar un mensaje
socket.emit('message', 'Hola mundo!');

// Recibir mensajes
socket.on('message', (data) => {
    console.log(`${data.username}: ${data.message}`);
});
## 🔄 Estructura del Proyecto
```plain text
nest-chat-app/
├── src/
│   ├── chat/
│   │   ├── chat.gateway.ts
│   │   └── chat.module.ts
│   ├── app.module.ts
│   └── main.ts
├── public/
│   └── index.html
├── package.json
└── README.md
```
## 🚀 Mejoras Futuras
Implementar autenticación de usuarios

Agregar persistencia de mensajes con base de datos

Soporte para mensajes privados

Indicador de escritura

Lista de usuarios en línea

Soporte para compartir archivos

Interfaz de usuario mejorada

## 👥 Contribuir
Fork el proyecto

Crea tu rama de características (git checkout -b feature/AmazingFeature)

Commit tus cambios (git commit -m 'Add some AmazingFeature')

Push a la rama (git push origin feature/AmazingFeature)

Abre un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo  para más detalles.

## 📞 Contacto
Tu Nombre - Kevin Toledo
⌨️ con ❤️ Giok3r