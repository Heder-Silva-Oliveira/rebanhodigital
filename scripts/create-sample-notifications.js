import mongoose from 'mongoose';
import { Notification } from '../api/notification/model/Notification.model.js';
import { MONGODB_URI } from '../api/config/env.js';

const createSampleNotifications = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const tenantId = '1'; // Usando o mesmo tenant do usuário de teste

    // Limpar notificações existentes
    await Notification.deleteMany({ tenantId });
    console.log('🧹 Notificações antigas removidas');

    const sampleNotifications = [
      {
        title: 'Animais Prontos para Venda',
        message: '3 animais atingiram peso ideal (450kg+) e estão prontos para comercialização.',
        type: 'alerta',
        category: 'planejamento',
        priority: 'alta',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'animal',
        actionRequired: true,
        actionUrl: '/animals',
        metadata: {
          animalCount: 3,
          averageWeight: 465
        }
      },
      {
        title: 'Vacinação Próxima',
        message: 'Vacinação contra febre aftosa agendada para 15/02/2026 (13 dias).',
        type: 'lembrete',
        category: 'saude_animal',
        priority: 'media',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'planning',
        actionRequired: true,
        actionUrl: '/planning',
        metadata: {
          vaccinationType: 'Febre Aftosa',
          scheduledDate: '2026-02-15',
          daysUntil: 13
        }
      },
      {
        title: 'Taxa de Lotação Alta',
        message: 'Pasto Norte com 2.3 UA/ha, acima do recomendado. Considere rotacionar os animais.',
        type: 'alerta',
        category: 'planejamento',
        priority: 'critica',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'pasture',
        actionRequired: true,
        actionUrl: '/pastures',
        metadata: {
          pastureName: 'Pasto Norte',
          lotationRate: 2.3,
          recommendedRate: 1.5
        }
      },
      {
        title: 'Pagamento em Atraso',
        message: 'Despesa "Ração Concentrada" venceu há 5 dias. Valor: R$ 2.450,00',
        type: 'urgente',
        category: 'financeiro',
        priority: 'critica',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'financial',
        actionRequired: true,
        actionUrl: '/financial',
        metadata: {
          amount: 2450.00,
          daysOverdue: 5,
          description: 'Ração Concentrada'
        }
      },
      {
        title: 'Relatório Mensal Disponível',
        message: 'Relatório de performance de janeiro/2026 foi gerado e está disponível para visualização.',
        type: 'informacao',
        category: 'sistema',
        priority: 'baixa',
        targetUser: tenantId,
        tenantId,
        actionRequired: false,
        actionUrl: '/reports',
        metadata: {
          reportType: 'monthly',
          period: '2026-01'
        }
      },
      {
        title: 'GMD Abaixo da Meta',
        message: 'Ganho médio diário do rebanho está em 0.65 kg/dia, abaixo da meta de 0.85 kg/dia.',
        type: 'alerta',
        category: 'planejamento',
        priority: 'alta',
        targetUser: tenantId,
        tenantId,
        actionRequired: true,
        actionUrl: '/animals',
        metadata: {
          currentGMD: 0.65,
          targetGMD: 0.85,
          difference: -0.20
        }
      }
    ];

    // Criar notificações
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    
    console.log(`✅ ${createdNotifications.length} notificações de exemplo criadas:`);
    createdNotifications.forEach(notif => {
      console.log(`   - ${notif.title} (${notif.priority})`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificações:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createSampleNotifications();