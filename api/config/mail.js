import nodemailer from 'nodemailer';
import { EMAIL_USERNAME, EMAIL_PASSWORD } from './env.js';

if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
  console.error("❌ ERRO CRÍTICO DE EMAIL: Variáveis de ambiente EMAIL_USERNAME ou EMAIL_PASSWORD estão ausentes. Verifique o arquivo .env.");
}

export const transporter = nodemailer.createTransport({
  service: 'gmail', // Certifique-se de que o Gmail está configurado
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD, // Deve ser a senha de aplicativo
  },
  // Adicionado debug opcional para inspecionar o envio em detalhes
  // debug: true,
  // logger: true,
});