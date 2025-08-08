/**
 * ========================================
 * SISTEMA DE TRIGGERS E AUTOMAÇÕES v3.0
 * ========================================
 */

/**
 * Configurações globais para triggers
 */
const TRIGGERS_CONFIG = {
  // Configurações de execução
  MAX_EXECUTION_TIME: 270000, // 4.5 minutos (margem de segurança)
  BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  
  // Configurações de agendamento
  BACKUP_HOUR: 2,
  CLEANUP_HOUR: 3,
  REMINDERS_HOUR: 8,
  HEALTH_CHECK_HOURS: 6,
  OPTIMIZATION_DAY: 1,
  OPTIMIZATION_HOUR: 4,
  
  // Configurações de monitoramento
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_NOTIFICATIONS: true,
  LOG_TRIGGER_EXECUTIONS: true,
  
  // Configurações de segurança
  ENABLE_TRIGGER_VALIDATION: true,
  MAX_FAILED_EXECUTIONS: 5,
  COOLDOWN_PERIOD: 3600000, // 1 hora
  
  // Configurações de notificação
  NOTIFY_ADMIN_ON_FAILURE: true,
  NOTIFY_ADMIN_ON_SUCCESS: false,
  ADMIN_NOTIFICATION_THRESHOLD: 3
};

/**
 * Gerenciador principal de triggers
 */
const TriggerManager = {
  
  /**
   * Configurar todos os triggers do sistema
   */
  setupAllTriggers() {
    const setupId = this.generateSetupId();
    const startTime = Date.now();
    
    try {
      logActivity('TRIGGERS', 'Iniciando configuração de triggers', { setupId });
      
      // Limpar triggers existentes
      this.deleteAllTriggers();
      
      const results = [];
      const errors = [];
      
      // Configurar triggers baseados em tempo
      const timeBasedTriggers = [
        {
          name: 'dailyBackup',
          function: 'dailyBackup',
          type: 'daily',
          hour: TRIGGERS_CONFIG.BACKUP_HOUR,
          description: 'Backup automático diário'
        },
        {
          name: 'weeklyCleanup', 
          function: 'weeklyCleanup',
          type: 'weekly',
          weekDay: ScriptApp.WeekDay.SUNDAY,
          hour: TRIGGERS_CONFIG.CLEANUP_HOUR,
          description: 'Limpeza automática semanal'
        },
        {
          name: 'monthlyOptimization',
          function: 'monthlyOptimization', 
          type: 'monthly',
          monthDay: TRIGGERS_CONFIG.OPTIMIZATION_DAY,
          hour: TRIGGERS_CONFIG.OPTIMIZATION_HOUR,
          description: 'Otimização automática mensal'
        },
        {
          name: 'dailyReminders',
          function: 'dailyReminders',
          type: 'daily',
          hour: TRIGGERS_CONFIG.REMINDERS_HOUR,
          description: 'Processamento de lembretes diários'
        },
        {
          name: 'systemHealthCheck',
          function: 'systemHealthCheck',
          type: 'hourly',
          hours: TRIGGERS_CONFIG.HEALTH_CHECK_HOURS,
          description: 'Verificação de integridade do sistema'
        },
        {
          name: 'performanceMonitoring',
          function: 'performanceMonitoring',
          type: 'hourly',
          hours: 2,
          description: 'Monitoramento de performance',
          enabled: TRIGGERS_CONFIG.ENABLE_PERFORMANCE_MONITORING
        },
        {
          name: 'dataIntegrityCheck',
          function: 'dataIntegrityCheck',
          type: 'daily',
          hour: 1,
          description: 'Verificação de integridade dos dados'
        },
        {
          name: 'notificationProcessor',
          function: 'processNotificationQueue',
          type: 'hourly',
          hours: 1,
          description: 'Processamento de fila de notificações'
        },
        {
          name: 'sessionCleanup',
          function: 'cleanupExpiredSessions',
          type: 'hourly',
          hours: 4,
          description: 'Limpeza de sessões expiradas'
        },
        {
          name: 'auditLogRotation',
          function: 'rotateAuditLogs',
          type: 'weekly',
          weekDay: ScriptApp.WeekDay.SATURDAY,
          hour: 23,
          description: 'Rotação de logs de auditoria'
        }
      ];
      
      // Criar cada trigger
      timeBasedTriggers.forEach(triggerConfig => {
        try {
          if (triggerConfig.enabled === false) {
            results.push({
              name: triggerConfig.name,
              success: false,
              message: 'Trigger desabilitado por configuração',
              skipped: true
            });
            return;
          }
          
          const trigger = this.createTimeTrigger(triggerConfig);
          
          results.push({
            name: triggerConfig.name,
            success: true,
            triggerId: trigger.getUniqueId(),
            function: triggerConfig.function,
            description: triggerConfig.description,
            type: triggerConfig.type
          });
          
          logActivity('TRIGGER_CREATED', `Trigger ${triggerConfig.name} criado`, {
            triggerId: trigger.getUniqueId(),
            function: triggerConfig.function
          });
          
        } catch (error) {
          errors.push({
            name: triggerConfig.name,
            error: error.message,
            function: triggerConfig.function
          });
          
          logError('createTrigger', error, { triggerConfig });
        }
      });
      
      // Registrar resultado da configuração
      this.logTriggerSetup(setupId, results, errors);
      
      const successCount = results.filter(r => r.success).length;
      const duration = Date.now() - startTime;
      
      logActivity('TRIGGERS', 'Configuração de triggers concluída', {
        setupId,
        duration,
        successful: successCount,
        failed: errors.length,
        total: timeBasedTriggers.length
      });
      
      // Notificar administrador em caso de falhas
      if (errors.length > 0 && TRIGGERS_CONFIG.NOTIFY_ADMIN_ON_FAILURE) {
        this.notifyTriggerSetupResult(setupId, results, errors);
      }
      
      return {
        success: errors.length === 0,
        setupId,
        duration,
        results,
        errors,
        summary: {
          total: timeBasedTriggers.length,
          successful: successCount,
          failed: errors.length,
          skipped: results.filter(r => r.skipped).length
        }
      };
      
    } catch (error) {
      logError('TriggerManager.setupAllTriggers', error, { setupId });
      return {
        success: false,
        setupId,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  },
  
  /**
   * Criar trigger baseado em tempo
   */
  createTimeTrigger(config) {
    let triggerBuilder = ScriptApp.newTrigger(config.function).timeBased();
    
    switch (config.type) {
      case 'daily':
        triggerBuilder = triggerBuilder.everyDays(1);
        if (config.hour !== undefined) {
          triggerBuilder = triggerBuilder.atHour(config.hour);
        }
        break;
        
      case 'weekly':
        triggerBuilder = triggerBuilder.everyWeeks(1);
        if (config.weekDay) {
          triggerBuilder = triggerBuilder.onWeekDay(config.weekDay);
        }
        if (config.hour !== undefined) {
          triggerBuilder = triggerBuilder.atHour(config.hour);
        }
        break;
        
      case 'monthly':
        if (config.monthDay) {
          triggerBuilder = triggerBuilder.onMonthDay(config.monthDay);
        }
        if (config.hour !== undefined) {
          triggerBuilder = triggerBuilder.atHour(config.hour);
        }
        break;
        
      case 'hourly':
        if (config.hours) {
          triggerBuilder = triggerBuilder.everyHours(config.hours);
        } else {
          triggerBuilder = triggerBuilder.everyHours(1);
        }
        break;
        
      case 'minutes':
        if (config.minutes) {
          triggerBuilder = triggerBuilder.everyMinutes(config.minutes);
        } else {
          triggerBuilder = triggerBuilder.everyMinutes(30);
        }
        break;
        
      default:
        throw new Error(`Tipo de trigger não suportado: ${config.type}`);
    }
    
    return triggerBuilder.create();
  },
  
  /**
   * Remover todos os triggers
   */
  deleteAllTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      let deletedCount = 0;
      
      triggers.forEach(trigger => {
        try {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
        } catch (error) {
          logError('deleteTrigger', error, { 
            triggerId: trigger.getUniqueId(),
            function: trigger.getHandlerFunction()
          });
        }
      });
      
      logActivity('TRIGGERS', `${deletedCount} triggers removidos`);
      
      return {
        success: true,
        deletedCount,
        message: `${deletedCount} triggers removidos`
      };
      
    } catch (error) {
      logError('deleteAllTriggers', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Obter status de todos os triggers
   */
  getTriggersStatus() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      
      const status = triggers.map(trigger => {
        try {
          return {
            id: trigger.getUniqueId(),
            handlerFunction: trigger.getHandlerFunction(),
            triggerSource: trigger.getTriggerSource().toString(),
            eventType: trigger.getEventType().toString(),
            isValid: true
          };
        } catch (error) {
          return {
            id: 'unknown',
            handlerFunction: 'unknown',
            error: error.message,
            isValid: false
          };
        }
      });
      
      const validTriggers = status.filter(t => t.isValid);
      const invalidTriggers = status.filter(t => !t.isValid);
      
      return {
        success: true,
        summary: {
          total: triggers.length,
          valid: validTriggers.length,
          invalid: invalidTriggers.length
        },
        triggers: status,
        lastChecked: new Date().toISOString()
      };
      
    } catch (error) {
      logError('getTriggersStatus', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Validar triggers existentes
   */
  validateTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const issues = [];
      const warnings = [];
      
      // Verificar funções obrigatórias
      const requiredFunctions = [
        'dailyBackup',
        'weeklyCleanup', 
        'systemHealthCheck',
        'dailyReminders'
      ];
      
      const existingFunctions = triggers.map(t => t.getHandlerFunction());
      
      requiredFunctions.forEach(func => {
        if (!existingFunctions.includes(func)) {
          issues.push(`Trigger obrigatório não encontrado: ${func}`);
        }
      });
      
      // Verificar duplicatas
      const functionCounts = {};
      existingFunctions.forEach(func => {
        functionCounts[func] = (functionCounts[func] || 0) + 1;
      });
      
      Object.keys(functionCounts).forEach(func => {
        if (functionCounts[func] > 1) {
          warnings.push(`Função ${func} tem ${functionCounts[func]} triggers (possível duplicata)`);
        }
      });
      
      // Verificar triggers órfãos (funções que não existem)
      existingFunctions.forEach(func => {
        try {
          // Tentar acessar a função para verificar se existe
          if (typeof this[func] !== 'function' && typeof eval(func) !== 'function') {
            warnings.push(`Trigger para função inexistente: ${func}`);
          }
        } catch (error) {
          warnings.push(`Não foi possível verificar função: ${func}`);
        }
      });
      
      const isValid = issues.length === 0;
      
      return {
        success: true,
        isValid,
        issues,
        warnings,
        summary: {
          totalTriggers: triggers.length,
          criticalIssues: issues.length,
          warnings: warnings.length,
          healthScore: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
        },
        recommendations: this.generateRecommendations(issues, warnings)
      };
      
    } catch (error) {
      logError('validateTriggers', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Gerar recomendações baseadas nos problemas encontrados
   */
  generateRecommendations(issues, warnings) {
    const recommendations = [];
    
    if (issues.length > 0) {
      recommendations.push('Execute setupAllTriggers() para recriar triggers obrigatórios');
    }
    
    if (warnings.length > 0) {
      recommendations.push('Verifique triggers duplicados ou órfãos');
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      recommendations.push('Sistema de triggers está funcionando corretamente');
      recommendations.push('Monitore logs de execução regularmente');
    }
    
    recommendations.push('Configure backup antes de modificar triggers');
    recommendations.push('Teste triggers em ambiente de desenvolvimento primeiro');
    
    return recommendations;
  },
  
  /**
   * Registrar configuração de triggers
   */
  logTriggerSetup(setupId, results, errors) {
    try {
      logActivity('TRIGGER_SETUP', 'Configuração de triggers registrada', {
        setupId,
        successful: results.filter(r => r.success).length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      console.error('Erro ao registrar configuração de triggers:', error);
    }
  },
  
  /**
   * Notificar resultado da configuração
   */
  notifyTriggerSetupResult(setupId, results, errors) {
    try {
      const adminEmail = ConfigUtils.getSetting('admin_email');
      if (!adminEmail) return;
      
      const subject = errors.length > 0 ? 
        '⚠️ Problemas na Configuração de Triggers' : 
        '✅ Triggers Configurados com Sucesso';
      
      const htmlBody = this.buildTriggerNotificationEmail(setupId, results, errors);
      
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      
      logActivity('NOTIFICATION', 'Notificação de triggers enviada', {
        setupId,
        recipient: adminEmail,
        type: errors.length > 0 ? 'error' : 'success'
      });
      
    } catch (error) {
      logError('notifyTriggerSetupResult', error);
    }
  },
  
  /**
   * Construir email de notificação
   */
  buildTriggerNotificationEmail(setupId, results, errors) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Sistema Dental');
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; }
              .header { text-align: center; margin-bottom: 30px; }
              .success { color: #10b981; }
              .error { color: #ef4444; }
              .warning { color: #f59e0b; }
              .list { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>${errors.length > 0 ? '⚠️' : '✅'} Configuração de Triggers</h2>
                  <p><strong>${clinicName}</strong></p>
              </div>
              
              <h3>Resumo da Configuração</h3>
              <ul>
                  <li><strong>Setup ID:</strong> ${setupId}</li>
                  <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                  <li><strong>Triggers Configurados:</strong> ${successCount}/${totalCount}</li>
                  <li><strong>Status:</strong> ${errors.length === 0 ? '✅ Sucesso' : '⚠️ Problemas'}</li>
              </ul>
              
              ${results.length > 0 ? `
              <h3>Triggers Configurados</h3>
              <div class="list">
                  ${results.map(r => `
                  <div style="margin: 10px 0;">
                      ${r.success ? '✅' : '❌'} <strong>${r.name}</strong> - ${r.description}
                      ${r.success ? '' : `<br><span class="error">Erro: ${r.error || 'Desconhecido'}</span>`}
                  </div>
                  `).join('')}
              </div>
              ` : ''}
              
              ${errors.length > 0 ? `
              <h3>Problemas Encontrados</h3>
              <div class="list">
                  ${errors.map(e => `
                  <div style="margin: 10px 0;">
                      ❌ <strong>${e.name}</strong>: ${e.error}
                  </div>
                  `).join('')}
              </div>
              
              <h3>Ações Recomendadas</h3>
              <ul>
                  <li>Verifique os logs do sistema para mais detalhes</li>
                  <li>Execute novamente a configuração se necessário</li>
                  <li>Contate o suporte técnico se os problemas persistirem</li>
              </ul>
              ` : `
              <h3 class="success">✅ Todos os Triggers Configurados</h3>
              <p>O sistema de automação está funcionando corretamente.</p>
              `}
              
              <hr style="margin: 30px 0;">
              <p style="text-align: center; color: #666; font-size: 12px;">
                  Sistema de Agendamento Dental - Notificação Automática<br>
                  ${new Date().toLocaleString('pt-BR')}
              </p>
          </div>
      </body>
      </html>
    `;
  },
  
  /**
   * Utilitários
   */
  generateSetupId() {
    return 'setup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  /**
   * Monitorar execução de triggers
   */
  monitorTriggerExecution(functionName, executionResult) {
    try {
      if (!TRIGGERS_CONFIG.LOG_TRIGGER_EXECUTIONS) return;
      
      logActivity('TRIGGER_EXECUTION', `Trigger ${functionName} executado`, {
        functionName,
        success: executionResult.success,
        duration: executionResult.duration || 0,
        error: executionResult.error || null,
        timestamp: new Date().toISOString()
      });
      
      // Verificar se há muitas falhas
      if (!executionResult.success) {
        this.handleTriggerFailure(functionName, executionResult.error);
      }
      
    } catch (error) {
      console.error('Erro no monitoramento de trigger:', error);
    }
  },
  
  /**
   * Tratar falhas de trigger
   */
  handleTriggerFailure(functionName, error) {
    try {
      const cache = CacheService.getScriptCache();
      const failureKey = `trigger_failures_${functionName}`;
      const failures = parseInt(cache.get(failureKey) || '0') + 1;
      
      // Armazenar contador de falhas por 24 horas
      cache.put(failureKey, failures.toString(), 86400);
      
      if (failures >= TRIGGERS_CONFIG.MAX_FAILED_EXECUTIONS) {
        // Notificar administrador sobre falhas excessivas
        this.notifyTriggerFailures(functionName, failures, error);
        
        // Implementar cooldown se necessário
        if (TRIGGERS_CONFIG.COOLDOWN_PERIOD > 0) {
          cache.put(`trigger_cooldown_${functionName}`, 'true', TRIGGERS_CONFIG.COOLDOWN_PERIOD / 1000);
        }
      }
      
    } catch (error) {
      console.error('Erro ao tratar falha de trigger:', error);
    }
  },
  
  /**
   * Notificar falhas excessivas
   */
  notifyTriggerFailures(functionName, failureCount, lastError) {
    try {
      if (!TRIGGERS_CONFIG.NOTIFY_ADMIN_ON_FAILURE) return;
      
      const adminEmail = ConfigUtils.getSetting('admin_email');
      if (!adminEmail) return;
      
      const subject = `🚨 Falhas Excessivas no Trigger: ${functionName}`;
      const htmlBody = `
        <h2>🚨 Alerta de Sistema</h2>
        <p>O trigger <strong>${functionName}</strong> falhou <strong>${failureCount}</strong> vezes.</p>
        <p><strong>Último erro:</strong> ${lastError}</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <p>Ação recomendada: Verifique os logs e corrija o problema.</p>
      `;
      
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      
    } catch (error) {
      console.error('Erro ao notificar falhas:', error);
    }
  }
};

/**
 * ========================================
 * FUNÇÕES DE AUTOMAÇÃO PRINCIPAIS
 * ========================================
 */

/**
 * Backup automático diário
 */
function dailyBackup() {
  const startTime = Date.now();
  const executionId = 'daily_backup_' + Date.now();
  
  try {
    logActivity('AUTO_BACKUP', 'Iniciando backup automático', { executionId });
    
    // Verificar se backup está habilitado
    const backupEnabled = ConfigUtils.getSetting('auto_backup_enabled', 'true');
    if (backupEnabled !== 'true') {
      logActivity('AUTO_BACKUP', 'Backup automático desabilitado', { executionId });
      return {
        success: true,
        message: 'Backup automático está desabilitado',
        skipped: true
      };
    }
    
    // Executar backup
    const result = createBackup({
      type: 'automatic',
      reason: 'Daily automatic backup',
      executionId: executionId
    });
    
    const duration = Date.now() - startTime;
    
    if (result.success) {
      logActivity('AUTO_BACKUP', 'Backup automático concluído', {
        executionId,
        backupId: result.backupId,
        duration
      });
      
      // Notificar administrador se configurado
      const notifyBackup = ConfigUtils.getSetting('notify_backup_success', 'false');
      if (notifyBackup === 'true') {
        NotificationManager.send('system_backup', {
          backupId: result.backupId,
          executionId: executionId,
          duration: duration,
          timestamp: new Date().toISOString()
        });
      }
      
      // Limpar backups antigos
      cleanupOldBackups();
      
    } else {
      logError('dailyBackup', new Error(result.error), { executionId });
      
      // Notificar falha
      NotificationManager.send('system_error', {
        error: result.error,
        function: 'dailyBackup',
        executionId: executionId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Monitorar execução
    TriggerManager.monitorTriggerExecution('dailyBackup', {
      success: result.success,
      duration,
      error: result.error
    });
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('dailyBackup', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('dailyBackup', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * Limpeza automática semanal
 */
function weeklyCleanup() {
  const startTime = Date.now();
  const executionId = 'weekly_cleanup_' + Date.now();
  
  try {
    logActivity('AUTO_CLEANUP', 'Iniciando limpeza automática', { executionId });
    
    const cleanupTasks = [];
    const errors = [];
    
    // Tarefa 1: Limpar logs antigos
    try {
      const logCleanup = MaintenanceUtils.cleanupOldLogs(1000);
      cleanupTasks.push({
        task: 'Limpeza de Logs',
        success: logCleanup.success,
        removed: logCleanup.removed || 0
      });
    } catch (error) {
      errors.push({ task: 'Limpeza de Logs', error: error.message });
    }
    
    // Tarefa 2: Limpar cache
    try {
      const cacheCleanup = MaintenanceUtils.clearCache();
      cleanupTasks.push({
        task: 'Limpeza de Cache',
        success: cacheCleanup.success
      });
    } catch (error) {
      errors.push({ task: 'Limpeza de Cache', error: error.message });
    }
    
    // Tarefa 3: Otimizar planilhas
    try {
      const optimization = MaintenanceUtils.optimizeSheets();
      cleanupTasks.push({
        task: 'Otimização de Planilhas',
        success: optimization.success
      });
    } catch (error) {
      errors.push({ task: 'Otimização de Planilhas', error: error.message });
    }
    
    // Tarefa 4: Limpar sessões expiradas
    try {
      const sessionCleanup = cleanupExpiredSessions();
      cleanupTasks.push({
        task: 'Limpeza de Sessões',
        success: sessionCleanup.success,
        removed: sessionCleanup.removed || 0
      });
    } catch (error) {
      errors.push({ task: 'Limpeza de Sessões', error: error.message });
    }
    
    // Tarefa 5: Remover backups antigos
    try {
      const backupCleanup = cleanupOldBackups();
      cleanupTasks.push({
        task: 'Limpeza de Backups',
        success: backupCleanup.success,
        removed: backupCleanup.removed || 0
      });
    } catch (error) {
      errors.push({ task: 'Limpeza de Backups', error: error.message });
    }
    
    // Tarefa 6: Rotação de logs de auditoria
    try {
      const auditRotation = rotateAuditLogs();
      cleanupTasks.push({
        task: 'Rotação de Logs de Auditoria',
        success: auditRotation.success,
        rotated: auditRotation.rotated || 0
      });
    } catch (error) {
      errors.push({ task: 'Rotação de Auditoria', error: error.message });
    }
    
    const duration = Date.now() - startTime;
    const successfulTasks = cleanupTasks.filter(t => t.success).length;
    
    logActivity('AUTO_CLEANUP', 'Limpeza automática concluída', {
      executionId,
      duration,
      successful: successfulTasks,
      failed: errors.length,
      tasks: cleanupTasks,
      errors
    });
    
    TriggerManager.monitorTriggerExecution('weeklyCleanup', {
      success: errors.length === 0,
      duration,
      error: errors.length > 0 ? errors.map(e => e.error).join('; ') : null
    });
    
    return {
      success: errors.length === 0,
      executionId,
      duration,
      tasks: cleanupTasks,
      errors,
      summary: {
        total: cleanupTasks.length,
        successful: successfulTasks,
        failed: errors.length
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('weeklyCleanup', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('weeklyCleanup', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * Otimização automática mensal
 */
function monthlyOptimization() {
  const startTime = Date.now();
  const executionId = 'monthly_optimization_' + Date.now();
  
  try {
    logActivity('AUTO_OPTIMIZATION', 'Iniciando otimização automática', { executionId });
    
    const optimizationTasks = [];
    const errors = [];
    
    // Tarefa 1: Reindexar dados
    try {
      const reindexResult = reindexData();
      optimizationTasks.push({
        task: 'Reindexação de Dados',
        success: reindexResult.success,
        recordsProcessed: reindexResult.recordsProcessed || 0
      });
    } catch (error) {
      errors.push({ task: 'Reindexação de Dados', error: error.message });
    }
    
    // Tarefa 2: Verificar integridade completa
    try {
      const integrityCheck = dataIntegrityCheck();
      optimizationTasks.push({
        task: 'Verificação de Integridade',
        success: integrityCheck.success,
        issues: integrityCheck.issues || 0
      });
    } catch (error) {
      errors.push({ task: 'Verificação de Integridade', error: error.message });
    }
    
    // Tarefa 3: Gerar relatório mensal
    try {
      const monthlyReport = generateMonthlyReport();
      optimizationTasks.push({
        task: 'Relatório Mensal',
        success: monthlyReport.success,
        reportId: monthlyReport.reportId
      });
    } catch (error) {
      errors.push({ task: 'Relatório Mensal', error: error.message });
    }
    
    // Tarefa 4: Otimizar estrutura da planilha
    try {
      const structureOptimization = optimizeSpreadsheetStructure();
      optimizationTasks.push({
        task: 'Otimização de Estrutura',
        success: structureOptimization.success,
        optimizations: structureOptimization.optimizations || 0
      });
    } catch (error) {
      errors.push({ task: 'Otimização de Estrutura', error: error.message });
    }
    
    // Tarefa 5: Análise de performance
    try {
      const performanceAnalysis = analyzeSystemPerformance();
      optimizationTasks.push({
        task: 'Análise de Performance',
        success: performanceAnalysis.success,
        score: performanceAnalysis.score || 0
      });
    } catch (error) {
      errors.push({ task: 'Análise de Performance', error: error.message });
    }
    
    const duration = Date.now() - startTime;
    const successfulTasks = optimizationTasks.filter(t => t.success).length;
    
    logActivity('AUTO_OPTIMIZATION', 'Otimização automática concluída', {
      executionId,
      duration,
      successful: successfulTasks,
      failed: errors.length,
      tasks: optimizationTasks,
      errors
    });
    
    TriggerManager.monitorTriggerExecution('monthlyOptimization', {
      success: errors.length === 0,
      duration,
      error: errors.length > 0 ? errors.map(e => e.error).join('; ') : null
    });
    
    return {
      success: errors.length === 0,
      executionId,
      duration,
      tasks: optimizationTasks,
      errors,
      summary: {
        total: optimizationTasks.length,
        successful: successfulTasks,
        failed: errors.length
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('monthlyOptimization', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('monthlyOptimization', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * Lembretes automáticos diários
 */
function dailyReminders() {
  const startTime = Date.now();
  const executionId = 'daily_reminders_' + Date.now();
  
  try {
    logActivity('AUTO_REMINDERS', 'Processando lembretes diários', { executionId });
    
    // Verificar se lembretes estão habilitados
    const remindersEnabled = ConfigUtils.getSetting('reminders_enabled', 'true');
    if (remindersEnabled !== 'true') {
      logActivity('AUTO_REMINDERS', 'Lembretes desabilitados', { executionId });
      return {
        success: true,
        message: 'Lembretes estão desabilitados',
        skipped: true
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = DateUtils.getNextBusinessDay().toISOString().split('T')[0];
    
    // Obter agendamentos
    const allAppointments = getAllAppointments();
    
    // Agendamentos de hoje
    const todayAppointments = allAppointments.filter(apt => 
      apt.date === today && apt.status !== 'Cancelado'
    );
    
    // Agendamentos de amanhã
    const tomorrowAppointments = allAppointments.filter(apt => 
      apt.date === tomorrow && apt.status !== 'Cancelado'
    );
    
    const reminderResults = {
      today: { sent: 0, failed: 0, errors: [] },
      tomorrow: { sent: 0, failed: 0, errors: [] }
    };
    
    // Processar lembretes de hoje
    for (const appointment of todayAppointments) {
      try {
        if (appointment.email || appointment.phone) {
          const result = await NotificationManager.send('reminder_today', appointment, ['email']);
          if (result.success) {
            reminderResults.today.sent++;
          } else {
            reminderResults.today.failed++;
            reminderResults.today.errors.push(result.error);
          }
        }
      } catch (error) {
        reminderResults.today.failed++;
        reminderResults.today.errors.push(error.message);
      }
    }
    
    // Processar lembretes de amanhã
    for (const appointment of tomorrowAppointments) {
      try {
        if (appointment.email || appointment.phone) {
          const result = await NotificationManager.send('reminder_tomorrow', appointment, ['email']);
          if (result.success) {
            reminderResults.tomorrow.sent++;
          } else {
            reminderResults.tomorrow.failed++;
            reminderResults.tomorrow.errors.push(result.error);
          }
        }
      } catch (error) {
        reminderResults.tomorrow.failed++;
        reminderResults.tomorrow.errors.push(error.message);
      }
    }
    
    const duration = Date.now() - startTime;
    const totalSent = reminderResults.today.sent + reminderResults.tomorrow.sent;
    const totalFailed = reminderResults.today.failed + reminderResults.tomorrow.failed;
    
    logActivity('AUTO_REMINDERS', 'Lembretes processados', {
      executionId,
      duration,
      todayAppointments: todayAppointments.length,
      tomorrowAppointments: tomorrowAppointments.length,
      totalSent,
      totalFailed,
      results: reminderResults
    });
    
    TriggerManager.monitorTriggerExecution('dailyReminders', {
      success: totalFailed === 0,
      duration,
      error: totalFailed > 0 ? `${totalFailed} lembretes falharam` : null
    });
    
    return {
      success: totalFailed === 0,
      executionId,
      duration,
      results: reminderResults,
      summary: {
        todayAppointments: todayAppointments.length,
        tomorrowAppointments: tomorrowAppointments.length,
        sent: totalSent,
        failed: totalFailed
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('dailyReminders', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('dailyReminders', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * Verificação de integridade do sistema
 */
function systemHealthCheck() {
  const startTime = Date.now();
  const executionId = 'health_check_' + Date.now();
  
  try {
    logActivity('HEALTH_CHECK', 'Iniciando verificação de saúde', { executionId });
    
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      issues: [],
      warnings: [],
      metrics: {},
      components: {}
    };
    
    // Verificar acesso à planilha
    try {
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      health.components.spreadsheet = {
        status: 'ok',
        name: spreadsheet.getName(),
        url: spreadsheet.getUrl()
      };
      health.metrics.spreadsheetAccess = true;
    } catch (error) {
      health.status = 'error';
      health.issues.push('Acesso à planilha principal falhou');
      health.components.spreadsheet = {
        status: 'error',
        error: error.message
      };
    }
    
    // Verificar integridade dos dados
    try {
      const appointments = getAllAppointments();
      health.metrics.appointmentsCount = appointments.length;
      
      // Verificar duplicatas
      const ids = appointments.map(apt => apt.id).filter(id => id);
      const uniqueIds = [...new Set(ids)];
      
      if (ids.length !== uniqueIds.length) {
        health.status = 'warning';
        health.warnings.push('IDs duplicados detectados nos agendamentos');
      }
      
      // Verificar dados órfãos
      const invalidAppointments = appointments.filter(apt => 
        !apt.patientName || !apt.date || !apt.time
      );
      
      if (invalidAppointments.length > 0) {
        health.status = 'warning';
        health.warnings.push(`${invalidAppointments.length} agendamentos com dados incompletos`);
      }
      
      health.components.data = {
        status: 'ok',
        appointments: appointments.length,
        duplicates: ids.length - uniqueIds.length,
        invalid: invalidAppointments.length
      };
      
    } catch (error) {
      health.status = 'error';
      health.issues.push('Erro ao verificar dados de agendamentos');
      health.components.data = {
        status: 'error',
        error: error.message
      };
    }
    
    // Verificar triggers
    const triggers = ScriptApp.getProjectTriggers();
    health.metrics.triggersCount = triggers.length;
    
    if (triggers.length === 0) {
      health.status = 'warning';
      health.warnings.push('Nenhum trigger configurado');
    }
    
    health.components.triggers = {
      status: triggers.length > 0 ? 'ok' : 'warning',
      count: triggers.length,
      functions: triggers.map(t => t.getHandlerFunction())
    };
    
    // Verificar quota de armazenamento
    try {
      const storageUsed = DriveApp.getStorageUsed();
      const storageLimit = DriveApp.getStorageLimit();
      const usagePercentage = (storageUsed / storageLimit) * 100;
      
      health.metrics.storageUsed = storageUsed;
      health.metrics.storageLimit = storageLimit;
      health.metrics.storageUsagePercentage = usagePercentage;
      
      if (usagePercentage > 90) {
        health.status = 'warning';
        health.warnings.push('Armazenamento quase esgotado');
      }
      
      health.components.storage = {
        status: usagePercentage > 90 ? 'warning' : 'ok',
        used: storageUsed,
        limit: storageLimit,
        percentage: usagePercentage
      };
      
    } catch (error) {
      health.warnings.push('Não foi possível verificar quota de armazenamento');
      health.components.storage = {
        status: 'warning',
        error: error.message
      };
    }
    
    // Verificar configurações críticas
    try {
      const criticalSettings = [
        'system_version',
        'clinic_name',
        'admin_email'
      ];
      
      const missingSettings = [];
      criticalSettings.forEach(setting => {
        const value = ConfigUtils.getSetting(setting);
        if (!value) {
          missingSettings.push(setting);
        }
      });
      
      if (missingSettings.length > 0) {
        health.status = 'warning';
        health.warnings.push(`Configurações críticas faltando: ${missingSettings.join(', ')}`);
      }
      
      health.components.configuration = {
        status: missingSettings.length === 0 ? 'ok' : 'warning',
        missing: missingSettings
      };
      
    } catch (error) {
      health.warnings.push('Erro ao verificar configurações');
      health.components.configuration = {
        status: 'error',
        error: error.message
      };
    }
    
    const duration = Date.now() - startTime;
    
    // Log do resultado
    logActivity('HEALTH_CHECK', 'Verificação de saúde concluída', {
      executionId,
      duration,
      status: health.status,
      issuesCount: health.issues.length,
      warningsCount: health.warnings.length,
      health
    });
    
    // Notificar se houver problemas críticos
    if (health.status === 'error' && health.issues.length > 0) {
      try {
        NotificationManager.send('system_error', {
          type: 'health_check',
          issues: health.issues,
          warnings: health.warnings,
          executionId: executionId,
          timestamp: health.timestamp
        });
      } catch (notificationError) {
        logError('healthCheckNotification', notificationError);
      }
    }
    
    TriggerManager.monitorTriggerExecution('systemHealthCheck', {
      success: health.status !== 'error',
      duration,
      error: health.status === 'error' ? health.issues.join('; ') : null
    });
    
    return {
      success: health.status !== 'error',
      executionId,
      duration,
      health
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('systemHealthCheck', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('systemHealthCheck', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * ========================================
 * FUNÇÕES AUXILIARES DE AUTOMAÇÃO
 * ========================================
 */

/**
 * Limpar sessões expiradas
 */
function cleanupExpiredSessions() {
  try {
    logActivity('CLEANUP', 'Limpando sessões expiradas');
    
    // Implementação da limpeza de sessões
    // Por enquanto apenas simular
    const sessionsRemoved = 0;
    
    return {
      success: true,
      removed: sessionsRemoved,
      message: `${sessionsRemoved} sessões expiradas removidas`
    };
    
  } catch (error) {
    logError('cleanupExpiredSessions', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Rotacionar logs de auditoria
 */
function rotateAuditLogs() {
  try {
    logActivity('AUDIT', 'Rotacionando logs de auditoria');
    
    const auditSheet = getSheet(CONFIG.SHEETS.AUDIT || 'Auditoria');
    const maxRows = parseInt(ConfigUtils.getSetting('max_audit_rows', '10000'));
    const currentRows = auditSheet.getLastRow();
    
    if (currentRows > maxRows) {
      const rowsToRemove = currentRows - maxRows;
      auditSheet.deleteRows(2, rowsToRemove);
      
      logActivity('AUDIT', `${rowsToRemove} logs de auditoria rotacionados`);
      
      return {
        success: true,
        rotated: rowsToRemove,
        currentRows: auditSheet.getLastRow()
      };
    }
    
    return {
      success: true,
      rotated: 0,
      message: 'Rotação não necessária'
    };
    
  } catch (error) {
    logError('rotateAuditLogs', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Monitoramento de performance
 */
function performanceMonitoring() {
  const startTime = Date.now();
  const executionId = 'perf_monitoring_' + Date.now();
  
  try {
    if (!TRIGGERS_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      return {
        success: true,
        message: 'Monitoramento de performance desabilitado',
        skipped: true
      };
    }
    
    logActivity('PERFORMANCE', 'Iniciando monitoramento de performance', { executionId });
    
    const metrics = {
      timestamp: new Date().toISOString(),
      executionId,
      measurements: {}
    };
    
    // Medir tempo de carregamento de agendamentos
    const loadStart = Date.now();
    const appointments = getAllAppointments();
    metrics.measurements.appointmentsLoadTime = Date.now() - loadStart;
    metrics.measurements.appointmentsCount = appointments.length;
    
    // Medir tempo de carregamento de pacientes
    const patientsStart = Date.now();
    const patients = getAllPatients();
    metrics.measurements.patientsLoadTime = Date.now() - patientsStart;
    metrics.measurements.patientsCount = patients.length;
    
    // Medir uso de quota
    try {
      const quotaUsed = DriveApp.getStorageUsed();
      const quotaLimit = DriveApp.getStorageLimit();
      metrics.measurements.quotaUsagePercentage = (quotaUsed / quotaLimit) * 100;
    } catch (error) {
      metrics.measurements.quotaError = error.message;
    }
    
    // Calcular score de performance
    let performanceScore = 100;
    
    if (metrics.measurements.appointmentsLoadTime > 5000) {
      performanceScore -= 20;
    }
    
    if (metrics.measurements.patientsLoadTime > 3000) {
      performanceScore -= 15;
    }
    
    if (metrics.measurements.quotaUsagePercentage > 80) {
      performanceScore -= 25;
    }
    
    metrics.performanceScore = Math.max(0, performanceScore);
    
    const duration = Date.now() - startTime;
    
    logActivity('PERFORMANCE', 'Monitoramento concluído', {
      executionId,
      duration,
      metrics
    });
    
    // Alertar se performance estiver baixa
    if (metrics.performanceScore < 60) {
      try {
        NotificationManager.send('system_error', {
          type: 'performance_degradation',
          score: metrics.performanceScore,
          metrics: metrics.measurements,
          executionId: executionId
        });
      } catch (notificationError) {
        logError('performanceNotification', notificationError);
      }
    }
    
    TriggerManager.monitorTriggerExecution('performanceMonitoring', {
      success: true,
      duration,
      score: metrics.performanceScore
    });
    
    return {
      success: true,
      executionId,
      duration,
      metrics
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('performanceMonitoring', error, { executionId });
    
    TriggerManager.monitorTriggerExecution('performanceMonitoring', {
      success: false,
      duration,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message,
      executionId,
      duration
    };
  }
}

/**
 * Verificação de integridade de dados
 */
function dataIntegrityCheck() {
  try {
    logActivity('INTEGRITY', 'Verificando integridade dos dados');
    
    const issues = [];
    const warnings = [];
    
    // Verificar agendamentos
    const appointments = getAllAppointments();
    
    // Verificar IDs únicos
    const ids = appointments.map(apt => apt.id).filter(id => id);
    const uniqueIds = [...new Set(ids)];
    
    if (ids.length !== uniqueIds.length) {
      issues.push({
        type: 'duplicate_ids',
        count: ids.length - uniqueIds.length,
        severity: 'high'
      });
    }
    
    // Verificar dados obrigatórios
    const incompleteAppointments = appointments.filter(apt => 
      !apt.patientName || !apt.date || !apt.time
    );
    
    if (incompleteAppointments.length > 0) {
      warnings.push({
        type: 'incomplete_data',
        count: incompleteAppointments.length,
        severity: 'medium'
      });
    }
    
    // Verificar datas válidas
    const invalidDates = appointments.filter(apt => {
      try {
        return isNaN(new Date(apt.date).getTime());
      } catch (error) {
        return true;
      }
    });
    
    if (invalidDates.length > 0) {
      issues.push({
        type: 'invalid_dates',
        count: invalidDates.length,
        severity: 'high'
      });
    }
    
    // Verificar conflitos de horário
    const conflicts = findTimeConflicts(appointments);
    if (conflicts.length > 0) {
      warnings.push({
        type: 'time_conflicts',
        count: conflicts.length,
        severity: 'medium',
        details: conflicts
      });
    }
    
    const totalIssues = issues.length + warnings.length;
    
    logActivity('INTEGRITY', 'Verificação de integridade concluída', {
      totalRecords: appointments.length,
      issues: issues.length,
      warnings: warnings.length,
      details: { issues, warnings }
    });
    
    return {
      success: issues.length === 0,
      totalRecords: appointments.length,
      issues: issues.length,
      warnings: warnings.length,
      details: { issues, warnings },
      score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
    };
    
  } catch (error) {
    logError('dataIntegrityCheck', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Encontrar conflitos de horário
 */
function findTimeConflicts(appointments) {
  const conflicts = [];
  const groupedByDate = {};
  
  // Agrupar por data
  appointments.forEach(apt => {
    if (!groupedByDate[apt.date]) {
      groupedByDate[apt.date] = [];
    }
    groupedByDate[apt.date].push(apt);
  });
  
  // Verificar conflitos em cada data
  Object.keys(groupedByDate).forEach(date => {
    const dateAppointments = groupedByDate[date];
    
    for (let i = 0; i < dateAppointments.length; i++) {
      for (let j = i + 1; j < dateAppointments.length; j++) {
        const apt1 = dateAppointments[i];
        const apt2 = dateAppointments[j];
        
        if (apt1.time === apt2.time && apt1.status !== 'Cancelado' && apt2.status !== 'Cancelado') {
          conflicts.push({
            date: date,
            time: apt1.time,
            appointments: [apt1.id, apt2.id],
            patients: [apt1.patientName, apt2.patientName]
          });
        }
      }
    }
  });
  
  return conflicts;
}

/**
 * ========================================
 * FUNÇÕES PÚBLICAS DE TRIGGER
 * ========================================
 */

/**
 * Configurar triggers do sistema
 */
function setupTriggers() {
  return TriggerManager.setupAllTriggers();
}

/**
 * Obter status dos triggers
 */
function getTriggersStatus() {
  return TriggerManager.getTriggersStatus();
}

/**
 * Validar triggers
 */
function validateTriggers() {
  return TriggerManager.validateTriggers();
}

/**
 * Remover todos os triggers
 */
function deleteAllTriggers() {
  return TriggerManager.deleteAllTriggers();
}

/**
 * Monitorar execução de trigger
 */
function monitorTriggerExecution(functionName, result) {
  return TriggerManager.monitorTriggerExecution(functionName, result);
}

/**
 * Testar trigger específico
 */
function testTrigger(triggerFunction) {
  const startTime = Date.now();
  
  try {
    logActivity('TRIGGER_TEST', `Testando trigger: ${triggerFunction}`);
    
    let result;
    switch (triggerFunction) {
      case 'dailyBackup':
        result = dailyBackup();
        break;
      case 'weeklyCleanup':
        result = weeklyCleanup();
        break;
      case 'monthlyOptimization':
        result = monthlyOptimization();
        break;
      case 'dailyReminders':
        result = dailyReminders();
        break;
      case 'systemHealthCheck':
        result = systemHealthCheck();
        break;
      case 'performanceMonitoring':
        result = performanceMonitoring();
        break;
      case 'dataIntegrityCheck':
        result = dataIntegrityCheck();
        break;
      default:
        throw new Error(`Função de trigger não reconhecida: ${triggerFunction}`);
    }
    
    const duration = Date.now() - startTime;
    
    logActivity('TRIGGER_TEST', `Teste concluído: ${triggerFunction}`, {
      duration,
      success: result.success,
      result
    });
    
    return {
      success: true,
      triggerFunction,
      duration,
      testResult: result
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('testTrigger', error, { triggerFunction });
    
    return {
      success: false,
      triggerFunction,
      duration,
      error: error.message
    };
  }
}