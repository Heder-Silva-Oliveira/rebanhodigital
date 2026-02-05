import { Notification } from '../notification/model/Notification.model.js';
import { Animal } from '../animal/model/Animal.model.js';
import { Financial } from '../financial/model/Financial.model.js';
import { Planning } from '../planning/model/Planning.model.js';
import { Pasture } from '../pasture/model/Pasture.model.js';

// Função para criar uma notificação
export const createNotification = async (notificationData) => {
  try {
    // Verificar se já existe uma notificação similar recente (últimas 24h)
    const existingNotification = await Notification.findOne({
      tenantId: notificationData.tenantId,
      type: notificationData.type,
      category: notificationData.category,
      relatedEntity: notificationData.relatedEntity,
      relatedEntityId: notificationData.relatedEntityId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingNotification) {
      console.log('Notificação similar já existe, pulando criação');
      return existingNotification;
    }

    const notification = await Notification.create(notificationData);
    console.log(`✅ Notificação criada: ${notification.title}`);
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

// Gerar alertas para animais prontos para venda
export const generateAnimalSaleAlerts = async (tenantId) => {
  try {
    const animalsReadyForSale = await Animal.find({
      tenantId,
      status: 'ativo',
      weight: { $gte: 450 }
    });

    for (const animal of animalsReadyForSale) {
      await createNotification({
        title: 'Animal Pronto para Venda',
        message: `O animal ${animal.name || animal.id} atingiu ${animal.weight}kg e está pronto para venda.`,
        type: 'alerta',
        category: 'planejamento',
        priority: 'alta',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'animal',
        relatedEntityId: animal.id,
        actionRequired: true,
        actionUrl: '/animals',
        metadata: {
          animalWeight: animal.weight,
          animalId: animal.id,
          animalName: animal.name
        }
      });
    }

    return animalsReadyForSale.length;
  } catch (error) {
    console.error('Erro ao gerar alertas de venda:', error);
    return 0;
  }
};

// Gerar alertas para atividades de planejamento atrasadas
export const generateOverduePlanningAlerts = async (tenantId) => {
  try {
    const overduePlans = await Planning.find({
      tenantId,
      status: { $ne: 'concluido' },
      endDate: { $lt: new Date() }
    });

    for (const plan of overduePlans) {
      await createNotification({
        title: 'Atividade Atrasada',
        message: `A atividade "${plan.title}" estava prevista para ${new Date(plan.endDate).toLocaleDateString('pt-BR')} e ainda não foi concluída.`,
        type: 'urgente',
        category: 'planejamento',
        priority: 'critica',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'planning',
        relatedEntityId: plan.id,
        actionRequired: true,
        actionUrl: '/planning',
        metadata: {
          planTitle: plan.title,
          planEndDate: plan.endDate,
          daysOverdue: Math.floor((new Date() - new Date(plan.endDate)) / (1000 * 60 * 60 * 24))
        }
      });
    }

    return overduePlans.length;
  } catch (error) {
    console.error('Erro ao gerar alertas de planejamento:', error);
    return 0;
  }
};

// Gerar alertas para próximas vacinações
export const generateVaccinationAlerts = async (tenantId) => {
  try {
    const upcomingVaccinations = await Planning.find({
      tenantId,
      type: 'vacinacao',
      status: { $ne: 'concluido' },
      endDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Próximos 7 dias
      }
    });

    for (const vaccination of upcomingVaccinations) {
      const daysUntil = Math.ceil((new Date(vaccination.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      await createNotification({
        title: 'Vacinação Próxima',
        message: `A vacinação "${vaccination.title}" está agendada para ${new Date(vaccination.endDate).toLocaleDateString('pt-BR')} (${daysUntil} dias).`,
        type: 'lembrete',
        category: 'saude_animal',
        priority: daysUntil <= 2 ? 'alta' : 'media',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'planning',
        relatedEntityId: vaccination.id,
        actionRequired: true,
        actionUrl: '/planning',
        metadata: {
          vaccinationTitle: vaccination.title,
          vaccinationDate: vaccination.endDate,
          daysUntil
        }
      });
    }

    return upcomingVaccinations.length;
  } catch (error) {
    console.error('Erro ao gerar alertas de vacinação:', error);
    return 0;
  }
};

// Gerar alertas para taxa de lotação alta
export const generatePastureAlerts = async (tenantId) => {
  try {
    const pastures = await Pasture.find({ tenantId });
    const animals = await Animal.find({ tenantId, status: 'ativo' });
    
    let alertsGenerated = 0;
    
    for (const pasture of pastures) {
      const animalsInPasture = animals.filter(animal => animal.pastureId === pasture.id);
      const totalWeight = animalsInPasture.reduce((sum, animal) => sum + (animal.weight || 0), 0);
      const totalUA = totalWeight / 450; // Unidade Animal
      const lotationRate = pasture.area > 0 ? totalUA / pasture.area : 0;
      
      if (lotationRate > 1.5) { // Taxa crítica
        await createNotification({
          title: 'Taxa de Lotação Alta',
          message: `O pasto "${pasture.name}" está com taxa de lotação de ${lotationRate.toFixed(2)} UA/ha, acima do recomendado (1.5 UA/ha).`,
          type: 'alerta',
          category: 'planejamento',
          priority: lotationRate > 2.0 ? 'critica' : 'alta',
          targetUser: tenantId,
          tenantId,
          relatedEntity: 'pasture',
          relatedEntityId: pasture.id,
          actionRequired: true,
          actionUrl: '/pastures',
          metadata: {
            pastureName: pasture.name,
            lotationRate: lotationRate.toFixed(2),
            animalsCount: animalsInPasture.length,
            pastureArea: pasture.area
          }
        });
        alertsGenerated++;
      }
    }

    return alertsGenerated;
  } catch (error) {
    console.error('Erro ao gerar alertas de pastagem:', error);
    return 0;
  }
};

// Gerar alertas financeiros
export const generateFinancialAlerts = async (tenantId) => {
  try {
    const pendingTransactions = await Financial.find({
      tenantId,
      status: 'pendente',
      dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Próximos 7 dias
    });

    let alertsGenerated = 0;

    for (const transaction of pendingTransactions) {
      const daysUntilDue = Math.ceil((new Date(transaction.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysUntilDue < 0;
      
      await createNotification({
        title: isOverdue ? 'Pagamento em Atraso' : 'Pagamento Próximo do Vencimento',
        message: `${transaction.type === 'despesa' ? 'Despesa' : 'Receita'} "${transaction.description}" ${isOverdue ? 'venceu há' : 'vence em'} ${Math.abs(daysUntilDue)} dias. Valor: R$ ${transaction.amount.toFixed(2)}`,
        type: isOverdue ? 'urgente' : 'lembrete',
        category: 'financeiro',
        priority: isOverdue ? 'critica' : 'media',
        targetUser: tenantId,
        tenantId,
        relatedEntity: 'financial',
        relatedEntityId: transaction.id,
        actionRequired: true,
        actionUrl: '/financial',
        metadata: {
          transactionType: transaction.type,
          amount: transaction.amount,
          dueDate: transaction.dueDate,
          daysUntilDue: daysUntilDue,
          isOverdue
        }
      });
      alertsGenerated++;
    }

    return alertsGenerated;
  } catch (error) {
    console.error('Erro ao gerar alertas financeiros:', error);
    return 0;
  }
};

// Função principal para gerar todos os alertas de um tenant
export const generateAllAlerts = async (tenantId) => {
  try {
    console.log(`🔔 Gerando alertas para tenant: ${tenantId}`);
    
    const results = await Promise.all([
      generateAnimalSaleAlerts(tenantId),
      generateOverduePlanningAlerts(tenantId),
      generateVaccinationAlerts(tenantId),
      generatePastureAlerts(tenantId),
      generateFinancialAlerts(tenantId)
    ]);

    const totalAlerts = results.reduce((sum, count) => sum + count, 0);
    
    console.log(`✅ ${totalAlerts} alertas gerados para tenant ${tenantId}`);
    return {
      totalAlerts,
      animalSaleAlerts: results[0],
      overduePlanningAlerts: results[1],
      vaccinationAlerts: results[2],
      pastureAlerts: results[3],
      financialAlerts: results[4]
    };
  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    throw error;
  }
};

// Limpar notificações antigas (mais de 30 dias)
export const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      status: { $in: ['lida', 'resolvida', 'arquivada'] }
    });

    console.log(`🧹 ${result.deletedCount} notificações antigas removidas`);
    return result.deletedCount;
  } catch (error) {
    console.error('Erro ao limpar notificações antigas:', error);
    return 0;
  }
};