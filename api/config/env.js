import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// --- Lógica para carregar o .env (Mantida) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possiblePaths = [path.resolve(__dirname, '../../.env'), path.resolve(__dirname, '../.env'), path.resolve(process.cwd(), '.env')];
let envLoaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  dotenv.config();
}
if (!process.env.MONGODB_URI) {
  console.error("\n❌ ERRO CRÍTICO: MONGODB_URI não encontrada. Verifique o arquivo .env.\n");
}
// --- Fim da Lógica de Carregamento ---

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3002;

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_SEGURO_MUDE_ISTO_REAL';

export const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// ✅ NOVAS VARIÁVEIS PARA WHATSAPP (TWILIO CONCEITUAL)
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// O número de WhatsApp fornecido pela Twilio/Meta (ex: whatsapp:+14155238886)
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;