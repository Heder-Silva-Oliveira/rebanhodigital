import nodemailer from 'nodemailer';
import { EMAIL_USERNAME, EMAIL_PASSWORD } from './env.js';

if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
  console.warn("⚠️ AVISO: Variáveis de ambiente EMAIL_USERNAME ou EMAIL_PASSWORD estão ausentes. Funcionalidades de email serão limitadas.");
}

export const transporter = EMAIL_USERNAME && EMAIL_PASSWORD ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
}) : null;