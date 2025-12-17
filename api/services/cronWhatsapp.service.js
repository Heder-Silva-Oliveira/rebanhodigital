import { sendWhatsappMessage } from './whatsapp.service.js';
import { User } from '../models/User.model.js';

/**
 * Processa e envia mensagens automáticas
 */
export const processScheduledMessages = async () => {
  console.log('[CRON JOB] Iniciando envio de WhatsApp...');

  const users = await User.find({
    emailVerified: true,
    phone: { $exists: true, $ne: '' }
  });

  if (!users.length) {
    console.log('⚠️ Nenhum usuário encontrado');
    return;
  }

  for (const user of users) {
    const phone = user.phone.startsWith('+')
      ? user.phone
      : `+55${user.phone.replace(/\D/g, '')}`;

    const message = `
📊 *Resumo AgroGest*

Olá ${user.name || 'Produtor'} 👋

📈 Lucro estimado da semana:
R$ ${(Math.random() * 10000).toFixed(2)}

🐂 Continue acompanhando seu rebanho!
`;

    await sendWhatsappMessage(phone, message);
  }

  console.log('[CRON JOB] Finalizado');
};
