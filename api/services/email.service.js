import { transporter } from '../config/mail.js';
import { EMAIL_USERNAME, BACKEND_URL, FRONTEND_URL } from '../config/env.js';

export const sendVerificationEmail = async (toEmail, token) => {
  if (!transporter) {
    console.warn(`⚠️ Email não configurado. Pulando envio para ${toEmail}`);
    return;
  }

  const verificationLink = `${BACKEND_URL}/api/verify-email?token=${token}`;
  
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: toEmail,
    subject: 'Verifique seu Email - Rebanho Digital',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #00875e;">Bem-vindo ao Rebanho Digital!</h2>
        <p>Obrigado por se cadastrar! Para ativar sua conta e começar a gerenciar seu rebanho, por favor, clique no botão abaixo:</p>
        
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #00875e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Ativar Minha Conta
        </a>
        
        <p style="margin-top: 20px; font-size: 14px; color: #333;">
          Se o botão não funcionar, copie e cole o seguinte link no seu navegador: 
          <a href="${verificationLink}" style="color: #00875e; word-break: break-all;">${verificationLink}</a>
        </p>
        
        <p style="margin-top: 10px; font-size: 12px; color: #777;">
          Este link é válido por 1 hora. Se você não solicitou esta ação, ignore este email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de verificação enviado para ${toEmail}`);
  } catch (error) {
    console.error(`❌ ERRO NO ENVIO DE EMAIL para ${toEmail}:`, error.message);
  }
};

export const sendPasswordResetEmail = async (toEmail, token) => {
  if (!transporter) {
    console.warn(`⚠️ Email não configurado. Pulando envio de redefinição para ${toEmail}`);
    return;
  }

  // O link agora aponta para o FRONTEND (onde o usuário digita a nova senha)
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`; 
  
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: toEmail,
    subject: 'Redefinição de Senha - Rebanho Digital',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #00875e;">Redefinição de Senha Solicitada</h2>
        <p>Você solicitou a redefinição de sua senha. Para continuar, clique no botão abaixo:</p>
        
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Redefinir Senha
        </a>
        
        <p style="margin-top: 20px; font-size: 14px; color: #333;">
          Este link só pode ser usado uma vez e expira em 15 minutos. Se você não solicitou a redefinição, ignore este e-mail.
        </p>
        
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de redefinição enviado para ${toEmail}`);
  } catch (error) {
    console.error(`❌ ERRO NO ENVIO DE REDEFINIÇÃO para ${toEmail}:`, error.message);
    throw new Error("Falha ao enviar e-mail de redefinição.");
  }
};