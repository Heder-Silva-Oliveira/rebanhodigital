import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

export const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('❌ ERRO: MONGODB_URI não definida no arquivo .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {});
    console.log('✅ Conectado ao MongoDB!');
  } catch (err) {
    console.error('❌ Erro MongoDB:', err);
    process.exit(1);
  }
};