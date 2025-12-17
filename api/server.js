import { PORT } from './config/env.js';
import { connectDB } from './config/database.js';
import app from './app.js';
// Importa a função para o teste imediato e para o agendamento
import cron from 'node-cron';
import { processScheduledMessages } from '../api/services/whatsapp.service.js';
 

// Conecta ao Banco de Dados
connectDB();
/*
// 💡 FUNÇÃO PARA INICIAR O CRON JOB (Conceitual)
export const startCronJobs = () => {

  /*
    Roda a cada hora, no minuto 0
    Formato CRON:
    ┌───────────── minuto (0 - 59)
    │ ┌───────────── hora (0 - 23)
    │ │ ┌───────────── dia do mês (1 - 31)
    │ │ │ ┌───────────── mês (1 - 12)
    │ │ │ │ ┌───────────── dia da semana (0 - 7) (Domingo = 0 ou 7)
    │ │ │ │ │
    0 * * * *
  */
/*
  const scheduleString = '0 * * * *';

  console.log(`[CRON] Agendando Job de Processamento Horário: ${scheduleString}`);

  cron.schedule(scheduleString, async () => {
    console.log('[CRON] Iniciando processamento de mensagens agendadas...');

    try {
      await processScheduledMessages();
      console.log('[CRON] Processamento finalizado com sucesso.');
    } catch (error) {
      console.error('[CRON] Erro ao processar mensagens:', error.message);
    }
  });

  console.log('✅ Jobs CRON agendados e ativos.');
};

*/
// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐄 Servidor AgroGest rodando em: http://localhost:${PORT}`);
  
  // 💡 TESTE IMEDIATO (Para debug no console) - CHAMADO AQUI

  //processScheduledMessages(); 
  
  // INICIALIZAÇÃO DOS JOBS - CHAMADO AQUI
  //startCronJobs();
  
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});