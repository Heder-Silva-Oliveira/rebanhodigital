import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER
} from '../config/env.js';
import { User } from '../user/model/User.model.js';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * ENV:
 * TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
 */

export const sendWhatsappMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,   // whatsapp:+14155238886 (Sandbox)
      to: `whatsapp:${to.replace(/\s+/g, '')}`,
      body
    });

    console.log(`✅ WHATSAPP ENVIADO PARA ${to}`);
    console.log(`📨 SID: ${message.sid}`);

    return { success: true, sid: message.sid };

  } catch (error) {
    console.error(`❌ ERRO WHATSAPP (${to}):`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * CRON JOB
 */
export const processScheduledMessages = async () => {
  console.log('[CRON] Iniciando processamento de mensagens...');

  const users = await User.find({
    emailVerified: true,
    phone: { $exists: true, $ne: '' }
  });

  let successCount = 0;

  for (const user of users) {
    const message = `📊 *Resumo AgroGest*

Olá ${user.name.split(' ')[0]} 👋

📈 Lucro estimado da semana: R$ ${Math.floor(Math.random() * 50000).toLocaleString('pt-BR')}

Acesse o dashboard para mais detalhes.`;

    const phone = user.phone.startsWith('+')
      ? user.phone
      : `+55${user.phone.replace(/\D/g, '')}`;

    const result = await sendWhatsappMessage(phone, message);
    if (result.success) successCount++;
  }

  console.log(`[CRON] Processamento finalizado. Sucessos: ${successCount}/${users.length}`);
};
