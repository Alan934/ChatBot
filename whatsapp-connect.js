const makeWASocket = require('@whiskeysockets/baileys');
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');

async function connectToWhatsApp() {
  const profileId = '11e3ba38-912e-43c8-b5c7-f886a4bf5132'; // Cambia esto por tu ID de perfil

  const authPath = path.join(__dirname, `auth_info_${profileId}`); // Ruta de las credenciales

  // Usamos useMultiFileAuthState para manejar las credenciales
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  // Creamos la conexión
  const client = makeWASocket.default({
    auth: state,
    printQRInTerminal: true, // Imprime el QR en la terminal
  });

  // Manejamos la actualización de la conexión
  client.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (connection === 'open') {
      console.log('Conexión exitosa a WhatsApp');
    } else if (connection === 'close') {
      console.log('Conexión cerrada, motivo:', lastDisconnect.error);
      if (lastDisconnect.error.output.statusCode !== 410) {
        console.log('Reconectando...');
        await connectToWhatsApp(); // Reconectar si la conexión se cierra por un error
      }
    }

    if (qr) {
      console.log('Escanea este QR para conectar:', qr); // Si se recibe un QR, imprímelo
    }
  });

  // Guardamos las credenciales actualizadas
  client.ev.on('creds.update', saveCreds);
}

// Llamamos a la función para iniciar la conexión
connectToWhatsApp().catch(console.error);
