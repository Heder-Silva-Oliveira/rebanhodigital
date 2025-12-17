import { sendWhatsappMessage } from './services/whatsapp.service.js';

await sendWhatsappMessage(
  '+5543988146622',
  '🚀 TESTE REAL: WhatsApp Twilio Sandbox funcionando!'
);

process.exit();
