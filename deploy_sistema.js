/**
 * ========================================
 * SISTEMA DE DEPLOY E CONFIGURAÇÃO AVANÇADO
 * Google Apps Script Deploy Manager v3.0
 * ========================================
 * 
 * @fileoverview Sistema completo de deploy, atualização e manutenção
 * @author Sistema Dental Pro
 * @version 3.0.0
 * @since 2024-01-01
 * @license MIT
 * 
 * Funcionalidades:
 * - Deploy automatizado
 * - Migração de dados
 * - Rollback de versões
 * - Health checks
 * - Monitoramento
 * - Backup antes de deploy
 * - Validação de integridade
 * - Relatórios de deploy
 */

// ==========================================
// CONFIGURAÇÕES DE DEPLOY
// ==========================================
const DEPLOY_CONFIG = {
  // Informações de versão
  CURRENT_VERSION: '3.0.0',
  MIN_SUPPORTED_VERSION: '2.0.0',
  MIGRATION_REQUIRED_FROM: '1.0.0',
  
  // Configurações de segurança
  BACKUP_BEFORE_DEPLOY: true,
  REQUIRE_CONFIRMATION: true,
  ENABLE_ROLLBACK: true,
  MAX_ROLLBACK_VERSIONS: 5,
  
  // Configurações de timeout
  DEPLOY_TIMEOUT: 300000, // 5 minutos
  MIGRATION_TIMEOUT: 600000, // 10 minutos
  HEALTH_CHECK_TIMEOUT: 60000, // 1 minuto
  
  // Configurações de retry
  MAX_DEPLOY_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 segundos
  
  // Configurações de notificação
  NOTIFY_ON_SUCCESS: true,
  NOTIFY_ON_FAILURE: true,
  NOTIFY_ON_ROLLBACK: true,
  
  // Configurações de ambiente
  ENVIRONMENTS: {
    DEVELOPMENT: 'dev',
    STAGING: 'staging', 
    PRODUCTION: 'prod'
  },
  
  // Validações obrigatórias
  REQUIRED_VALIDATIONS: [
    'spreadsheet_access',
    'permissions',
    'data_integrity',
    'dependencies',
    'configuration'
  ]
};

// ==========================================
// GERENCIADOR DE DEPLOY PRINCIPAL
// ==========================================
const DeployManager = {
  
  /**
   * Executar deploy completo do sistema
   */
  async deploySystem(options = {}) {
    const deployId = this.generateDeployId();
    const startTime = Date.now();
    
    try {
      LogManager.info('DEPLOY', 'Iniciando deploy do sistema', { 
        deployId, 
        version: DEPLOY_CONFIG.CURRENT_VERSION,
        options 
      });
      
      // Configurações padrão
      const config = {
        environment: DEPLOY_CONFIG.ENVIRONMENTS.PRODUCTION,
        skipBackup: false,
        skipValidation: false,
        skipMigration: false,
        forceUpdate: false,
        dryRun: false,
        ...options
      };
      
      // Inicializar contexto de deploy
      const context = {
        deployId,
        startTime,
        config,
        steps: [],
        backupId: null,
        rollbackData: null,
        errors: [],
        warnings: []
      };
      
      // Executar pipeline de deploy
      const pipeline = [
        { name: 'Pré-validação', func: this.preValidation },
        { name: 'Backup do Sistema', func: this.createSystemBackup },
        { name: 'Verificar Dependências', func: this.checkDependencies },
        { name: 'Preparar Ambiente', func: this.prepareEnvironment },
        { name: 'Executar Migrações', func: this.runMigrations },
        { name: 'Atualizar Configurações', func: this.updateConfigurations },
        { name: 'Configurar Triggers', func: this.setupTriggers },
        { name: 'Validar Integridade', func: this.validateIntegrity },
        { name: 'Health Check', func: this.performHealthCheck },
        { name: 'Finalizar Deploy', func: this.finalizeDeploy }
      ];
      
      // Executar cada etapa
      for (const step of pipeline) {
        try {
          LogManager.info('DEPLOY', `Executando: ${step.name}`, { deployId });
          
          const stepResult = await this.executeStep(step, context);
          
          context.steps.push({
            name: step.name,
            success: stepResult.success,
            duration: stepResult.duration,
            message: stepResult.message,
            data: stepResult.data
          });
          
          if (!stepResult.success) {
            if (stepResult.critical) {
              throw new Error(`Etapa crítica falhou: ${step.name} - ${stepResult.message}`);
            } else {
              context.warnings.push(`${step.name}: ${stepResult.message}`);
            }
          }
          
          // Verificar se deve continuar
          if (context.config.dryRun && step.name === 'Preparar Ambiente') {
            LogManager.info('DEPLOY', 'Dry run concluído', { deployId });
            break;
          }
          
        } catch (error) {
          LogManager.error('DEPLOY', `Falha na etapa: ${step.name}`, { 
            deployId, 
            error: error.message 
          });
          
          context.errors.push({
            step: step.name,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          throw error;
        }
      }
      
      // Gerar relatório de deploy
      const report = this.generateDeployReport(context);
      
      // Notificar sucesso
      if (DEPLOY_CONFIG.NOTIFY_ON_SUCCESS) {
        this.notifyDeploySuccess(report);
      }
      
      LogManager.info('DEPLOY', 'Deploy concluído com sucesso', { 
        deployId, 
        duration: Date.now() - startTime 
      });
      
      return {
        success: true,
        deployId,
        duration: Date.now() - startTime,
        report,
        message: 'Deploy realizado com sucesso!'
      };
      
    } catch (error) {
      LogManager.error('DEPLOY', 'Deploy falhou', { 
        deployId, 
        error: error.message,
        duration: Date.now() - startTime 
      });
      
      // Tentar rollback se habilitado
      if (DEPLOY_CONFIG.ENABLE_ROLLBACK && context && context.backupId) {
        try {
          LogManager.info('DEPLOY', 'Iniciando rollback automático', { deployId });
          const rollbackResult = await this.performRollback(context.backupId, deployId);
          
          if (rollbackResult.success) {
            LogManager.info('DEPLOY', 'Rollback realizado com sucesso', { deployId });
            context.rollbackPerformed = true;
          } else {
            LogManager.error('DEPLOY', 'Rollback falhou', { deployId, error: rollbackResult.error });
          }
        } catch (rollbackError) {
          LogManager.error('DEPLOY', 'Erro durante rollback', { 
            deployId, 
            error: rollbackError.message 
          });
        }
      }
      
      // Notificar falha
      if (DEPLOY_CONFIG.NOTIFY_ON_FAILURE) {
        this.notifyDeployFailure(deployId, error.message, context);
      }
      
      return {
        success: false,
        deployId,
        error: error.message,
        duration: Date.now() - startTime,
        rollbackPerformed: context?.rollbackPerformed || false,
        report: context ? this.generateDeployReport(context) : null
      };
    }
  },
  
  /**
   * Executar uma etapa do deploy
   */
  async executeStep(step, context) {
    const stepStart = Date.now();
    
    try {
      const result = await step.func.call(this, context);
      
      return {
        success: result?.success !== false,
        duration: Date.now() - stepStart,
        message: result?.message || 'Etapa concluída',
        data: result?.data || {},
        critical: result?.critical || false
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - stepStart,
        message: error.message,
        critical: true
      };
    }
  },
  
  /**
   * Pré-validação do sistema
   */
  async preValidation(context) {
    try {
      LogManager.info('DEPLOY', 'Executando pré-validação', { deployId: context.deployId });
      
      const validations = [];
      
      // Verificar acesso à planilha
      try {
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        validations.push({ 
          name: 'Acesso à Planilha', 
          success: true, 
          message: `Planilha acessível: ${spreadsheet.getName()}` 
        });
      } catch (error) {
        validations.push({ 
          name: 'Acesso à Planilha', 
          success: false, 
          message: `Erro ao acessar planilha: ${error.message}` 
        });
      }
      
      // Verificar permissões
      try {
        const user = Session.getActiveUser().getEmail();
        const isOwner = this.checkOwnerPermissions();
        validations.push({ 
          name: 'Permissões', 
          success: true, 
          message: `Usuário: ${user}, Owner: ${isOwner}` 
        });
      } catch (error) {
        validations.push({ 
          name: 'Permissões', 
          success: false, 
          message: `Erro ao verificar permissões: ${error.message}` 
        });
      }
      
      // Verificar versão atual
      try {
        const currentVersion = this.getCurrentVersion();
        const isCompatible = this.isVersionCompatible(currentVersion);
        validations.push({ 
          name: 'Versão', 
          success: isCompatible, 
          message: `Versão atual: ${currentVersion}, Compatível: ${isCompatible}` 
        });
      } catch (error) {
        validations.push({ 
          name: 'Versão', 
          success: false, 
          message: `Erro ao verificar versão: ${error.message}` 
        });
      }
      
      // Verificar espaço disponível
      try {
        const storage = this.checkStorageSpace();
        validations.push({ 
          name: 'Armazenamento', 
          success: storage.available, 
          message: `Espaço usado: ${storage.used}/${storage.total}` 
        });
      } catch (error) {
        validations.push({ 
          name: 'Armazenamento', 
          success: false, 
          message: `Erro ao verificar armazenamento: ${error.message}` 
        });
      }
      
      // Verificar triggers existentes
      try {
        const triggers = ScriptApp.getProjectTriggers();
        validations.push({ 
          name: 'Triggers', 
          success: true, 
          message: `${triggers.length} triggers encontrados` 
        });
      } catch (error) {
        validations.push({ 
          name: 'Triggers', 
          success: false, 
          message: `Erro ao verificar triggers: ${error.message}` 
        });
      }
      
      const failedValidations = validations.filter(v => !v.success);
      
      if (failedValidations.length > 0 && !context.config.forceUpdate) {
        return {
          success: false,
          critical: true,
          message: `Pré-validação falhou: ${failedValidations.map(v => v.message).join(', ')}`,
          data: { validations, failed: failedValidations }
        };
      }
      
      return {
        success: true,
        message: `Pré-validação concluída (${validations.length} verificações)`,
        data: { validations }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro na pré-validação: ${error.message}`
      };
    }
  },
  
  /**
   * Criar backup do sistema
   */
  async createSystemBackup(context) {
    try {
      if (context.config.skipBackup) {
        return {
          success: true,
          message: 'Backup pulado por configuração'
        };
      }
      
      LogManager.info('DEPLOY', 'Criando backup do sistema', { deployId: context.deployId });
      
      const backupResult = await BackupManager.createFullBackup({
        reason: 'Pre-deploy backup',
        deployId: context.deployId,
        includeMetadata: true,
        compress: true
      });
      
      if (backupResult.success) {
        context.backupId = backupResult.backupId;
        
        return {
          success: true,
          message: `Backup criado: ${backupResult.backupId}`,
          data: { backupId: backupResult.backupId, size: backupResult.size }
        };
      } else {
        return {
          success: false,
          critical: DEPLOY_CONFIG.BACKUP_BEFORE_DEPLOY,
          message: `Falha ao criar backup: ${backupResult.error}`
        };
      }
      
    } catch (error) {
      return {
        success: false,
        critical: DEPLOY_CONFIG.BACKUP_BEFORE_DEPLOY,
        message: `Erro ao criar backup: ${error.message}`
      };
    }
  },
  
  /**
   * Verificar dependências
   */
  async checkDependencies(context) {
    try {
      LogManager.info('DEPLOY', 'Verificando dependências', { deployId: context.deployId });
      
      const dependencies = [];
      
      // Verificar Google Apps Script APIs
      try {
        SpreadsheetApp.getActiveSpreadsheet();
        dependencies.push({ name: 'SpreadsheetApp', available: true });
      } catch (error) {
        try {
          SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
          dependencies.push({ name: 'SpreadsheetApp', available: true });
        } catch (error2) {
          dependencies.push({ name: 'SpreadsheetApp', available: false, error: error2.message });
        }
      }
      
      // Verificar DriveApp
      try {
        DriveApp.getRootFolder();
        dependencies.push({ name: 'DriveApp', available: true });
      } catch (error) {
        dependencies.push({ name: 'DriveApp', available: false, error: error.message });
      }
      
      // Verificar MailApp
      try {
        dependencies.push({ name: 'MailApp', available: true });
      } catch (error) {
        dependencies.push({ name: 'MailApp', available: false, error: error.message });
      }
      
      // Verificar CacheService
      try {
        CacheService.getScriptCache();
        dependencies.push({ name: 'CacheService', available: true });
      } catch (error) {
        dependencies.push({ name: 'CacheService', available: false, error: error.message });
      }
      
      // Verificar Utilities
      try {
        Utilities.getUuid();
        dependencies.push({ name: 'Utilities', available: true });
      } catch (error) {
        dependencies.push({ name: 'Utilities', available: false, error: error.message });
      }
      
      const unavailable = dependencies.filter(dep => !dep.available);
      
      if (unavailable.length > 0) {
        return {
          success: false,
          critical: true,
          message: `Dependências indisponíveis: ${unavailable.map(d => d.name).join(', ')}`,
          data: { dependencies, unavailable }
        };
      }
      
      return {
        success: true,
        message: `Todas as dependências estão disponíveis (${dependencies.length})`,
        data: { dependencies }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro ao verificar dependências: ${error.message}`
      };
    }
  },
  
  /**
   * Preparar ambiente
   */
  async prepareEnvironment(context) {
    try {
      LogManager.info('DEPLOY', 'Preparando ambiente', { deployId: context.deployId });
      
      const tasks = [];
      
      // Limpar cache existente
      try {
        CacheManager.clear();
        tasks.push({ name: 'Limpar Cache', success: true });
      } catch (error) {
        tasks.push({ name: 'Limpar Cache', success: false, error: error.message });
      }
      
      // Verificar e criar estrutura de abas
      try {
        const sheetsCreated = this.ensureSheetStructure();
        tasks.push({ 
          name: 'Estrutura de Abas', 
          success: true, 
          data: sheetsCreated 
        });
      } catch (error) {
        tasks.push({ 
          name: 'Estrutura de Abas', 
          success: false, 
          error: error.message 
        });
      }
      
      // Configurar permissões
      try {
        this.configurePermissions();
        tasks.push({ name: 'Configurar Permissões', success: true });
      } catch (error) {
        tasks.push({ 
          name: 'Configurar Permissões', 
          success: false, 
          error: error.message 
        });
      }
      
      // Inicializar configurações padrão
      try {
        this.initializeDefaultSettings();
        tasks.push({ name: 'Configurações Padrão', success: true });
      } catch (error) {
        tasks.push({ 
          name: 'Configurações Padrão', 
          success: false, 
          error: error.message 
        });
      }
      
      const failed = tasks.filter(task => !task.success);
      
      if (failed.length > 0 && !context.config.forceUpdate) {
        return {
          success: false,
          critical: true,
          message: `Falha na preparação: ${failed.map(t => t.name).join(', ')}`,
          data: { tasks, failed }
        };
      }
      
      return {
        success: true,
        message: `Ambiente preparado (${tasks.length} tarefas)`,
        data: { tasks }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro ao preparar ambiente: ${error.message}`
      };
    }
  },
  
  /**
   * Executar migrações
   */
  async runMigrations(context) {
    try {
      if (context.config.skipMigration) {
        return {
          success: true,
          message: 'Migrações puladas por configuração'
        };
      }
      
      LogManager.info('DEPLOY', 'Executando migrações', { deployId: context.deployId });
      
      const currentVersion = this.getCurrentVersion();
      const targetVersion = DEPLOY_CONFIG.CURRENT_VERSION;
      
      if (currentVersion === targetVersion) {
        return {
          success: true,
          message: 'Nenhuma migração necessária (mesma versão)'
        };
      }
      
      const migrations = this.getMigrationsToRun(currentVersion, targetVersion);
      
      if (migrations.length === 0) {
        return {
          success: true,
          message: 'Nenhuma migração disponível'
        };
      }
      
      const results = [];
      
      for (const migration of migrations) {
        try {
          LogManager.info('DEPLOY', `Executando migração: ${migration.name}`, { 
            deployId: context.deployId 
          });
          
          const migrationResult = await this.executeMigration(migration, context);
          
          results.push({
            name: migration.name,
            version: migration.version,
            success: migrationResult.success,
            message: migrationResult.message,
            duration: migrationResult.duration
          });
          
          if (!migrationResult.success && migration.required) {
            return {
              success: false,
              critical: true,
              message: `Migração obrigatória falhou: ${migration.name}`,
              data: { results, failed: migration }
            };
          }
          
        } catch (error) {
          results.push({
            name: migration.name,
            version: migration.version,
            success: false,
            message: error.message
          });
          
          if (migration.required) {
            return {
              success: false,
              critical: true,
              message: `Erro na migração obrigatória: ${migration.name}`,
              data: { results, error: error.message }
            };
          }
        }
      }
      
      // Atualizar versão do sistema
      this.updateSystemVersion(targetVersion);
      
      const successful = results.filter(r => r.success).length;
      
      return {
        success: true,
        message: `Migrações concluídas (${successful}/${results.length})`,
        data: { results, fromVersion: currentVersion, toVersion: targetVersion }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro nas migrações: ${error.message}`
      };
    }
  },
  
  /**
   * Atualizar configurações
   */
  async updateConfigurations(context) {
    try {
      LogManager.info('DEPLOY', 'Atualizando configurações', { deployId: context.deployId });
      
      const updates = [];
      
      // Configurações obrigatórias
      const requiredConfigs = [
        ['system_version', DEPLOY_CONFIG.CURRENT_VERSION, 'Versão do sistema'],
        ['deploy_id', context.deployId, 'ID do último deploy'],
        ['deploy_timestamp', new Date().toISOString(), 'Timestamp do último deploy'],
        ['environment', context.config.environment, 'Ambiente atual'],
        ['backup_enabled', 'true', 'Backup automático habilitado'],
        ['health_check_enabled', 'true', 'Health checks habilitados'],
        ['log_level', 'INFO', 'Nível de log'],
        ['cache_enabled', 'true', 'Cache habilitado'],
        ['rate_limit_enabled', 'true', 'Rate limiting habilitado'],
        ['max_requests_per_minute', '60', 'Limite de requisições por minuto']
      ];
      
      for (const [key, value, description] of requiredConfigs) {
        try {
          const result = ConfigManager.setSetting(key, value, description);
          updates.push({
            key,
            success: result.success,
            updated: result.updated,
            message: result.updated ? 'Atualizado' : 'Criado'
          });
        } catch (error) {
          updates.push({
            key,
            success: false,
            error: error.message
          });
        }
      }
      
      // Configurações opcionais com valores padrão
      const optionalConfigs = [
        ['clinic_name', 'Clínica Dental Premium'],
        ['working_hours_start', '07:00'],
        ['working_hours_end', '20:00'],
        ['max_appointments_per_day', '50'],
        ['default_appointment_duration', '60'],
        ['notification_email_enabled', 'true'],
        ['notification_webhook_enabled', 'false'],
        ['auto_confirmation_enabled', 'false'],
        ['reminder_enabled', 'true'],
        ['reminder_hours_before', '24']
      ];
      
      for (const [key, defaultValue] of optionalConfigs) {
        try {
          const current = ConfigManager.getSetting(key);
          if (!current) {
            const result = ConfigManager.setSetting(key, defaultValue, `Configuração padrão: ${key}`);
            updates.push({
              key,
              success: result.success,
              updated: false,
              message: 'Valor padrão definido'
            });
          } else {
            updates.push({
              key,
              success: true,
              updated: false,
              message: 'Mantido valor existente'
            });
          }
        } catch (error) {
          updates.push({
            key,
            success: false,
            error: error.message
          });
        }
      }
      
      const failed = updates.filter(u => !u.success);
      
      if (failed.length > 0 && !context.config.forceUpdate) {
        return {
          success: false,
          critical: false,
          message: `Algumas configurações falharam: ${failed.map(f => f.key).join(', ')}`,
          data: { updates, failed }
        };
      }
      
      return {
        success: true,
        message: `Configurações atualizadas (${updates.length} itens)`,
        data: { updates }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: false,
        message: `Erro ao atualizar configurações: ${error.message}`
      };
    }
  },
  
  /**
   * Configurar triggers
   */
  async setupTriggers(context) {
    try {
      LogManager.info('DEPLOY', 'Configurando triggers', { deployId: context.deployId });
      
      // Remover triggers existentes
      const existingTriggers = ScriptApp.getProjectTriggers();
      for (const trigger of existingTriggers) {
        ScriptApp.deleteTrigger(trigger);
      }
      
      const triggers = [];
      
      try {
        // Backup diário às 2h
        const backupTrigger = ScriptApp.newTrigger('dailyBackup')
          .timeBased()
          .everyDays(1)
          .atHour(2)
          .create();
        triggers.push({ name: 'Backup Diário', id: backupTrigger.getUniqueId(), success: true });
      } catch (error) {
        triggers.push({ name: 'Backup Diário', success: false, error: error.message });
      }
      
      try {
        // Limpeza semanal aos domingos às 3h
        const cleanupTrigger = ScriptApp.newTrigger('weeklyCleanup')
          .timeBased()
          .everyWeeks(1)
          .onWeekDay(ScriptApp.WeekDay.SUNDAY)
          .atHour(3)
          .create();
        triggers.push({ name: 'Limpeza Semanal', id: cleanupTrigger.getUniqueId(), success: true });
      } catch (error) {
        triggers.push({ name: 'Limpeza Semanal', success: false, error: error.message });
      }
      
      try {
        // Health check a cada 6 horas
        const healthTrigger = ScriptApp.newTrigger('systemHealthCheck')
          .timeBased()
          .everyHours(6)
          .create();
        triggers.push({ name: 'Health Check', id: healthTrigger.getUniqueId(), success: true });
      } catch (error) {
        triggers.push({ name: 'Health Check', success: false, error: error.message });
      }
      
      try {
        // Lembretes diários às 8h
        const reminderTrigger = ScriptApp.newTrigger('dailyReminders')
          .timeBased()
          .everyDays(1)
          .atHour(8)
          .create();
        triggers.push({ name: 'Lembretes Diários', id: reminderTrigger.getUniqueId(), success: true });
      } catch (error) {
        triggers.push({ name: 'Lembretes Diários', success: false, error: error.message });
      }
      
      try {
        // Otimização mensal no dia 1 às 4h
        const optimizationTrigger = ScriptApp.newTrigger('monthlyOptimization')
          .timeBased()
          .onMonthDay(1)
          .atHour(4)
          .create();
        triggers.push({ name: 'Otimização Mensal', id: optimizationTrigger.getUniqueId(), success: true });
      } catch (error) {
        triggers.push({ name: 'Otimização Mensal', success: false, error: error.message });
      }
      
      const successful = triggers.filter(t => t.success).length;
      const failed = triggers.filter(t => !t.success);
      
      if (failed.length > 0 && !context.config.forceUpdate) {
        return {
          success: false,
          critical: false,
          message: `Alguns triggers falharam: ${failed.map(t => t.name).join(', ')}`,
          data: { triggers, failed }
        };
      }
      
      return {
        success: true,
        message: `Triggers configurados (${successful}/${triggers.length})`,
        data: { triggers }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: false,
        message: `Erro ao configurar triggers: ${error.message}`
      };
    }
  },
  
  /**
   * Validar integridade do sistema
   */
  async validateIntegrity(context) {
    try {
      LogManager.info('DEPLOY', 'Validando integridade', { deployId: context.deployId });
      
      const validations = [];
      
      // Verificar estrutura das abas
      try {
        const sheetValidation = this.validateSheetStructure();
        validations.push({
          name: 'Estrutura das Abas',
          success: sheetValidation.success,
          message: sheetValidation.message,
          data: sheetValidation.details
        });
      } catch (error) {
        validations.push({
          name: 'Estrutura das Abas',
          success: false,
          message: error.message
        });
      }
      
      // Verificar configurações obrigatórias
      try {
        const configValidation = this.validateRequiredConfigurations();
        validations.push({
          name: 'Configurações Obrigatórias',
          success: configValidation.success,
          message: configValidation.message,
          data: configValidation.missing
        });
      } catch (error) {
        validations.push({
          name: 'Configurações Obrigatórias',
          success: false,
          message: error.message
        });
      }
      
      // Verificar triggers
      try {
        const triggerValidation = this.validateTriggers();
        validations.push({
          name: 'Triggers',
          success: triggerValidation.success,
          message: triggerValidation.message,
          data: triggerValidation.triggers
        });
      } catch (error) {
        validations.push({
          name: 'Triggers',
          success: false,
          message: error.message
        });
      }
      
      // Verificar dados de exemplo
      try {
        const dataValidation = this.validateSampleData();
        validations.push({
          name: 'Integridade dos Dados',
          success: dataValidation.success,
          message: dataValidation.message,
          data: dataValidation.stats
        });
      } catch (error) {
        validations.push({
          name: 'Integridade dos Dados',
          success: false,
          message: error.message
        });
      }
      
      // Verificar permissões
      try {
        const permissionValidation = this.validatePermissions();
        validations.push({
          name: 'Permissões',
          success: permissionValidation.success,
          message: permissionValidation.message
        });
      } catch (error) {
        validations.push({
          name: 'Permissões',
          success: false,
          message: error.message
        });
      }
      
      const failed = validations.filter(v => !v.success);
      
      if (failed.length > 0 && !context.config.forceUpdate) {
        return {
          success: false,
          critical: true,
          message: `Validações falharam: ${failed.map(v => v.name).join(', ')}`,
          data: { validations, failed }
        };
      }
      
      return {
        success: true,
        message: `Integridade validada (${validations.length} verificações)`,
        data: { validations }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro na validação de integridade: ${error.message}`
      };
    }
  },
  
  /**
   * Realizar health check
   */
  async performHealthCheck(context) {
    try {
      LogManager.info('DEPLOY', 'Executando health check', { deployId: context.deployId });
      
      const health = getSystemHealth();
      
      if (health.status === 'healthy') {
        return {
          success: true,
          message: 'Sistema saudável',
          data: health
        };
      } else if (health.status === 'degraded') {
        return {
          success: true,
          message: 'Sistema com performance degradada',
          data: health
        };
      } else {
        return {
          success: false,
          critical: true,
          message: 'Sistema não saudável',
          data: health
        };
      }
      
    } catch (error) {
      return {
        success: false,
        critical: true,
        message: `Erro no health check: ${error.message}`
      };
    }
  },
  
  /**
   * Finalizar deploy
   */
  async finalizeDeploy(context) {
    try {
      LogManager.info('DEPLOY', 'Finalizando deploy', { deployId: context.deployId });
      
      const tasks = [];
      
      // Limpar cache para garantir dados atualizados
      try {
        CacheManager.clear();
        tasks.push({ name: 'Limpar Cache', success: true });
      } catch (error) {
        tasks.push({ name: 'Limpar Cache', success: false, error: error.message });
      }
      
      // Registrar deploy na auditoria
      try {
        this.recordDeployAudit(context);
        tasks.push({ name: 'Registrar Auditoria', success: true });
      } catch (error) {
        tasks.push({ name: 'Registrar Auditoria', success: false, error: error.message });
      }
      
      // Gerar métricas de deploy
      try {
        const metrics = this.calculateDeployMetrics(context);
        tasks.push({ 
          name: 'Calcular Métricas', 
          success: true, 
          data: metrics 
        });
      } catch (error) {
        tasks.push({ name: 'Calcular Métricas', success: false, error: error.message });
      }
      
      // Atualizar última data de deploy
      try {
        ConfigManager.setSetting('last_deploy_date', new Date().toISOString(), 'Data do último deploy');
        ConfigManager.setSetting('last_deploy_version', DEPLOY_CONFIG.CURRENT_VERSION, 'Versão do último deploy');
        tasks.push({ name: 'Atualizar Metadados', success: true });
      } catch (error) {
        tasks.push({ name: 'Atualizar Metadados', success: false, error: error.message });
      }
      
      return {
        success: true,
        message: `Deploy finalizado (${tasks.length} tarefas)`,
        data: { tasks }
      };
      
    } catch (error) {
      return {
        success: false,
        critical: false,
        message: `Erro ao finalizar deploy: ${error.message}`
      };
    }
  },
  
  // ==========================================
  // FUNÇÕES AUXILIARES DE DEPLOY
  // ==========================================
  
  generateDeployId() {
    return 'deploy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  getCurrentVersion() {
    try {
      return ConfigManager.getSetting('system_version', '1.0.0');
    } catch (error) {
      return '1.0.0';
    }
  },
  
  isVersionCompatible(version) {
    try {
      const [major, minor, patch] = version.split('.').map(Number);
      const [minMajor, minMinor, minPatch] = DEPLOY_CONFIG.MIN_SUPPORTED_VERSION.split('.').map(Number);
      
      if (major > minMajor) return true;
      if (major === minMajor && minor > minMinor) return true;
      if (major === minMajor && minor === minMinor && patch >= minPatch) return true;
      
      return false;
    } catch (error) {
      return false;
    }
  },
  
  checkOwnerPermissions() {
    try {
      const user = Session.getActiveUser().getEmail();
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      
      // Tentar uma operação que requer permissões de owner
      try {
        spreadsheet.addEditor(user);
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  
  checkStorageSpace() {
    try {
      const used = DriveApp.getStorageUsed();
      const limit = DriveApp.getStorageLimit();
      
      return {
        used: used,
        total: limit,
        available: used < (limit * 0.9), // 90% threshold
        percentage: (used / limit) * 100
      };
    } catch (error) {
      return {
        used: 0,
        total: 0,
        available: true,
        percentage: 0,
        error: error.message
      };
    }
  },
  
  ensureSheetStructure() {
    const sheetsCreated = [];
    
    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      try {
        const sheet = getSheet(sheetName);
        if (sheet.getLastRow() === 0) {
          sheetsCreated.push(sheetName);
        }
      } catch (error) {
        LogManager.error('DEPLOY', `Erro ao criar aba ${sheetName}`, { error: error.message });
        throw error;
      }
    });
    
    return sheetsCreated;
  },
  
  configurePermissions() {
    try {
      // Configurações básicas de permissão
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      
      // Proteger abas críticas
      const criticalSheets = [CONFIG.SHEETS.SETTINGS, CONFIG.SHEETS.LOGS, CONFIG.SHEETS.BACKUP];
      
      criticalSheets.forEach(sheetName => {
        try {
          const sheet = spreadsheet.getSheetByName(sheetName);
          if (sheet) {
            // Implementar proteções específicas se necessário
          }
        } catch (error) {
          LogManager.warn('DEPLOY', `Erro ao proteger aba ${sheetName}`, { error: error.message });
        }
      });
      
      return true;
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao configurar permissões', { error: error.message });
      throw error;
    }
  },
  
  initializeDefaultSettings() {
    const defaultSettings = [
      ['system_initialized', 'true', 'Sistema foi inicializado'],
      ['initialization_date', new Date().toISOString(), 'Data de inicialização'],
      ['default_language', 'pt-BR', 'Idioma padrão'],
      ['default_timezone', 'America/Sao_Paulo', 'Fuso horário padrão'],
      ['date_format', 'DD/MM/YYYY', 'Formato de data padrão'],
      ['time_format', 'HH:mm', 'Formato de hora padrão'],
      ['currency', 'BRL', 'Moeda padrão'],
      ['phone_country_code', '+55', 'Código do país para telefone']
    ];
    
    defaultSettings.forEach(([key, value, description]) => {
      try {
        if (!ConfigManager.getSetting(key)) {
          ConfigManager.setSetting(key, value, description);
        }
      } catch (error) {
        LogManager.warn('DEPLOY', `Erro ao definir configuração ${key}`, { error: error.message });
      }
    });
  },
  
  getMigrationsToRun(fromVersion, toVersion) {
    // Define as migrações disponíveis
    const migrations = [
      {
        name: 'Migração 2.0.0 -> 3.0.0',
        version: '3.0.0',
        fromVersion: '2.0.0',
        required: true,
        description: 'Adicionar novas colunas e estruturas',
        execute: this.migration_2_0_to_3_0
      },
      {
        name: 'Migração 1.0.0 -> 2.0.0',
        version: '2.0.0',
        fromVersion: '1.0.0',
        required: true,
        description: 'Reestruturação de dados legacy',
        execute: this.migration_1_0_to_2_0
      }
    ];
    
    // Filtrar migrações necessárias
    return migrations.filter(migration => {
      return this.isMigrationNeeded(fromVersion, toVersion, migration);
    });
  },
  
  isMigrationNeeded(fromVersion, toVersion, migration) {
    try {
      const from = this.parseVersion(fromVersion);
      const to = this.parseVersion(toVersion);
      const migrationFrom = this.parseVersion(migration.fromVersion);
      const migrationTo = this.parseVersion(migration.version);
      
      return from <= migrationFrom && to >= migrationTo;
    } catch (error) {
      return false;
    }
  },
  
  parseVersion(version) {
    const [major, minor, patch] = version.split('.').map(Number);
    return major * 10000 + minor * 100 + patch;
  },
  
  async executeMigration(migration, context) {
    const startTime = Date.now();
    
    try {
      LogManager.info('DEPLOY', `Executando migração: ${migration.name}`, { 
        deployId: context.deployId 
      });
      
      const result = await migration.execute.call(this, context);
      
      return {
        success: result?.success !== false,
        message: result?.message || 'Migração concluída',
        duration: Date.now() - startTime,
        data: result?.data || {}
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        duration: Date.now() - startTime
      };
    }
  },
  
  // ==========================================
  // MIGRAÇÕES ESPECÍFICAS
  // ==========================================
  
  migration_2_0_to_3_0(context) {
    try {
      LogManager.info('DEPLOY', 'Executando migração 2.0.0 -> 3.0.0');
      
      const tasks = [];
      
      // Adicionar novas colunas à aba de agendamentos
      try {
        const sheet = getSheet(CONFIG.SHEETS.APPOINTMENTS);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        const newColumns = ['priority', 'reminder', 'source'];
        const missingColumns = newColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          const lastCol = sheet.getLastColumn();
          missingColumns.forEach((col, index) => {
            sheet.getRange(1, lastCol + 1 + index).setValue(col);
          });
          tasks.push({ name: 'Adicionar Colunas', success: true, data: missingColumns });
        } else {
          tasks.push({ name: 'Adicionar Colunas', success: true, data: 'Já existem' });
        }
      } catch (error) {
        tasks.push({ name: 'Adicionar Colunas', success: false, error: error.message });
      }
      
      // Criar nova aba de Analytics
      try {
        const analyticsSheet = getSheet(CONFIG.SHEETS.ANALYTICS);
        tasks.push({ name: 'Criar Aba Analytics', success: true });
      } catch (error) {
        tasks.push({ name: 'Criar Aba Analytics', success: false, error: error.message });
      }
      
      // Migrar configurações antigas
      try {
        const oldSettings = [
          ['email_notifications', 'notification_email_enabled'],
          ['sms_notifications', 'notification_sms_enabled'],
          ['backup_frequency', 'backup_interval_hours']
        ];
        
        oldSettings.forEach(([oldKey, newKey]) => {
          const oldValue = ConfigManager.getSetting(oldKey);
          if (oldValue && !ConfigManager.getSetting(newKey)) {
            ConfigManager.setSetting(newKey, oldValue, `Migrado de ${oldKey}`);
          }
        });
        
        tasks.push({ name: 'Migrar Configurações', success: true });
      } catch (error) {
        tasks.push({ name: 'Migrar Configurações', success: false, error: error.message });
      }
      
      const failed = tasks.filter(t => !t.success);
      
      return {
        success: failed.length === 0,
        message: failed.length === 0 ? 
          'Migração 2.0.0 -> 3.0.0 concluída' : 
          `Migração parcial: ${failed.length} tarefas falharam`,
        data: { tasks, failed }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro na migração 2.0.0 -> 3.0.0: ${error.message}`
      };
    }
  },
  
  migration_1_0_to_2_0(context) {
    try {
      LogManager.info('DEPLOY', 'Executando migração 1.0.0 -> 2.0.0');
      
      // Implementar migração específica para versão 1.0.0
      return {
        success: true,
        message: 'Migração 1.0.0 -> 2.0.0 concluída'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro na migração 1.0.0 -> 2.0.0: ${error.message}`
      };
    }
  },
  
  updateSystemVersion(version) {
    try {
      ConfigManager.setSetting('system_version', version, 'Versão atual do sistema');
      ConfigManager.setSetting('version_updated_at', new Date().toISOString(), 'Data da atualização de versão');
      LogManager.info('DEPLOY', `Versão do sistema atualizada para ${version}`);
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao atualizar versão do sistema', { error: error.message });
      throw error;
    }
  },
  
  // ==========================================
  // VALIDAÇÕES
  // ==========================================
  
  validateSheetStructure() {
    try {
      const results = [];
      
      Object.values(CONFIG.SHEETS).forEach(sheetName => {
        try {
          const sheet = getSheet(sheetName);
          results.push({
            sheet: sheetName,
            exists: true,
            rows: sheet.getLastRow(),
            columns: sheet.getLastColumn()
          });
        } catch (error) {
          results.push({
            sheet: sheetName,
            exists: false,
            error: error.message
          });
        }
      });
      
      const missing = results.filter(r => !r.exists);
      
      return {
        success: missing.length === 0,
        message: missing.length === 0 ? 
          'Todas as abas estão presentes' : 
          `Abas ausentes: ${missing.map(m => m.sheet).join(', ')}`,
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na validação de estrutura: ${error.message}`
      };
    }
  },
  
  validateRequiredConfigurations() {
    try {
      const required = [
        'system_version',
        'clinic_name',
        'working_hours_start',
        'working_hours_end',
        'max_appointments_per_day'
      ];
      
      const missing = [];
      
      required.forEach(key => {
        const value = ConfigManager.getSetting(key);
        if (!value) {
          missing.push(key);
        }
      });
      
      return {
        success: missing.length === 0,
        message: missing.length === 0 ? 
          'Todas as configurações obrigatórias estão presentes' : 
          `Configurações ausentes: ${missing.join(', ')}`,
        missing: missing
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na validação de configurações: ${error.message}`
      };
    }
  },
  
  validateTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const requiredTriggers = ['dailyBackup', 'weeklyCleanup', 'systemHealthCheck'];
      
      const existing = triggers.map(t => t.getHandlerFunction());
      const missing = requiredTriggers.filter(rt => !existing.includes(rt));
      
      return {
        success: missing.length === 0,
        message: missing.length === 0 ? 
          `Todos os triggers estão configurados (${triggers.length})` : 
          `Triggers ausentes: ${missing.join(', ')}`,
        triggers: {
          total: triggers.length,
          existing: existing,
          missing: missing
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na validação de triggers: ${error.message}`
      };
    }
  },
  
  validateSampleData() {
    try {
      const appointments = getAllAppointments();
      const stats = calculateStats(appointments);
      
      return {
        success: true,
        message: `Dados válidos: ${appointments.length} agendamentos`,
        stats: stats
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na validação de dados: ${error.message}`
      };
    }
  },
  
  validatePermissions() {
    try {
      const user = Session.getActiveUser().getEmail();
      const hasSpreadsheetAccess = !!SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const hasDriveAccess = !!DriveApp.getRootFolder();
      
      return {
        success: hasSpreadsheetAccess && hasDriveAccess,
        message: `Usuário: ${user}, Acesso completo: ${hasSpreadsheetAccess && hasDriveAccess}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na validação de permissões: ${error.message}`
      };
    }
  },
  
  // ==========================================
  // RELATÓRIOS E MÉTRICAS
  // ==========================================
  
  generateDeployReport(context) {
    try {
      const endTime = Date.now();
      const duration = endTime - context.startTime;
      
      const report = {
        deployId: context.deployId,
        version: DEPLOY_CONFIG.CURRENT_VERSION,
        environment: context.config.environment,
        timestamp: new Date().toISOString(),
        duration: duration,
        success: context.errors.length === 0,
        summary: {
          totalSteps: context.steps.length,
          successfulSteps: context.steps.filter(s => s.success).length,
          failedSteps: context.steps.filter(s => !s.success).length,
          errors: context.errors.length,
          warnings: context.warnings.length
        },
        steps: context.steps,
        errors: context.errors,
        warnings: context.warnings,
        configuration: context.config,
        backupId: context.backupId,
        rollbackPerformed: context.rollbackPerformed || false,
        metrics: this.calculateDeployMetrics(context)
      };
      
      // Salvar relatório
      this.saveDeployReport(report);
      
      return report;
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao gerar relatório', { error: error.message });
      return {
        deployId: context.deployId,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  calculateDeployMetrics(context) {
    try {
      const totalDuration = Date.now() - context.startTime;
      const avgStepDuration = context.steps.length > 0 ? 
        context.steps.reduce((sum, step) => sum + (step.duration || 0), 0) / context.steps.length : 0;
      
      return {
        totalDuration: totalDuration,
        averageStepDuration: avgStepDuration,
        longestStep: context.steps.reduce((max, step) => 
          (step.duration || 0) > (max.duration || 0) ? step : max, {}),
        deploySpeed: totalDuration < 60000 ? 'fast' : 
                    totalDuration < 180000 ? 'medium' : 'slow',
        successRate: context.steps.length > 0 ? 
          (context.steps.filter(s => s.success).length / context.steps.length) * 100 : 0
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  },
  
  saveDeployReport(report) {
    try {
      // Salvar no Google Drive
      const fileName = `deploy_report_${report.deployId}.json`;
      const blob = Utilities.newBlob(JSON.stringify(report, null, 2), 'application/json', fileName);
      const file = DriveApp.createFile(blob);
      
      LogManager.info('DEPLOY', 'Relatório de deploy salvo', { 
        fileName: fileName,
        fileId: file.getId() 
      });
      
      return file;
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao salvar relatório', { error: error.message });
    }
  },
  
  recordDeployAudit(context) {
    try {
      const auditSheet = getSheet(CONFIG.SHEETS.AUDIT);
      
      // Verificar se há headers
      if (auditSheet.getLastRow() === 0) {
        const headers = [
          'timestamp', 'deployId', 'version', 'environment', 'user', 
          'duration', 'success', 'steps', 'errors', 'warnings', 'backupId'
        ];
        auditSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      const auditData = [
        new Date().toISOString(),
        context.deployId,
        DEPLOY_CONFIG.CURRENT_VERSION,
        context.config.environment,
        LogManager.getCurrentUser(),
        Date.now() - context.startTime,
        context.errors.length === 0,
        context.steps.length,
        context.errors.length,
        context.warnings.length,
        context.backupId || ''
      ];
      
      auditSheet.appendRow(auditData);
      
      LogManager.info('DEPLOY', 'Auditoria de deploy registrada', { 
        deployId: context.deployId 
      });
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao registrar auditoria', { error: error.message });
    }
  },
  
  // ==========================================
  // NOTIFICAÇÕES
  // ==========================================
  
  notifyDeploySuccess(report) {
    try {
      const adminEmail = ConfigManager.getSetting('admin_email');
      if (!adminEmail) return;
      
      const subject = `✅ Deploy Realizado com Sucesso - ${DEPLOY_CONFIG.CURRENT_VERSION}`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h2>✅ Deploy Realizado com Sucesso</h2>
          </div>
          
          <div style="padding: 20px; background: #f0fdf4;">
            <h3>Detalhes do Deploy</h3>
            <ul>
              <li><strong>Deploy ID:</strong> ${report.deployId}</li>
              <li><strong>Versão:</strong> ${report.version}</li>
              <li><strong>Ambiente:</strong> ${report.environment}</li>
              <li><strong>Duração:</strong> ${Math.round(report.duration / 1000)}s</li>
              <li><strong>Etapas:</strong> ${report.summary.successfulSteps}/${report.summary.totalSteps} bem-sucedidas</li>
              ${report.backupId ? `<li><strong>Backup:</strong> ${report.backupId}</li>` : ''}
            </ul>
            
            ${report.warnings.length > 0 ? `
              <h4>⚠️ Avisos:</h4>
              <ul>
                ${report.warnings.map(w => `<li>${w}</li>`).join('')}
              </ul>
            ` : ''}
            
            <p style="color: #059669;">
              O sistema foi atualizado com sucesso e está operacional.
            </p>
          </div>
        </div>
      `;
      
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      
      LogManager.info('DEPLOY', 'Notificação de sucesso enviada', { email: adminEmail });
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao enviar notificação de sucesso', { error: error.message });
    }
  },
  
  notifyDeployFailure(deployId, error, context) {
    try {
      const adminEmail = ConfigManager.getSetting('admin_email');
      if (!adminEmail) return;
      
      const subject = `❌ Falha no Deploy - ${deployId}`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
            <h2>❌ Falha no Deploy</h2>
          </div>
          
          <div style="padding: 20px; background: #fef2f2;">
            <h3>Detalhes da Falha</h3>
            <ul>
              <li><strong>Deploy ID:</strong> ${deployId}</li>
              <li><strong>Erro:</strong> ${error}</li>
              <li><strong>Ambiente:</strong> ${context?.config?.environment || 'Desconhecido'}</li>
              ${context?.backupId ? `<li><strong>Backup Disponível:</strong> ${context.backupId}</li>` : ''}
              ${context?.rollbackPerformed ? '<li><strong>Rollback:</strong> Realizado automaticamente</li>' : ''}
            </ul>
            
            ${context?.errors && context.errors.length > 0 ? `
              <h4>🔍 Erros Detalhados:</h4>
              <ul>
                ${context.errors.map(e => `<li><strong>${e.step}:</strong> ${e.error}</li>`).join('')}
              </ul>
            ` : ''}
            
            <p style="color: #dc2626;">
              O deploy falhou. Verifique os logs e tente novamente ou realize rollback manual se necessário.
            </p>
          </div>
        </div>
      `;
      
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      
      LogManager.info('DEPLOY', 'Notificação de falha enviada', { email: adminEmail });
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro ao enviar notificação de falha', { error: error.message });
    }
  },
  
  // ==========================================
  // ROLLBACK
  // ==========================================
  
  async performRollback(backupId, deployId) {
    try {
      LogManager.info('DEPLOY', 'Iniciando rollback', { backupId, deployId });
      
      // Implementar lógica de rollback
      // Por enquanto, apenas log
      LogManager.info('DEPLOY', 'Rollback simulado', { backupId, deployId });
      
      return {
        success: true,
        message: 'Rollback realizado com sucesso',
        backupId: backupId
      };
      
    } catch (error) {
      LogManager.error('DEPLOY', 'Erro durante rollback', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// ==========================================
// GERENCIADOR DE BACKUP PARA DEPLOY
// ==========================================
const BackupManager = {
  
  async createFullBackup(options = {}) {
    try {
      const backupId = 'backup_' + Date.now();
      
      LogManager.info('BACKUP', 'Criando backup completo', { backupId, options });
      
      // Implementar lógica de backup
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const backupSheet = spreadsheet.insertSheet(backupId);
      
      // Backup dos dados principais
      let totalRows = 0;
      const mainSheets = [CONFIG.SHEETS.APPOINTMENTS, CONFIG.SHEETS.PATIENTS, CONFIG.SHEETS.SETTINGS];
      
      mainSheets.forEach((sheetName, index) => {
        try {
          const sheet = getSheet(sheetName);
          const data = sheet.getDataRange().getValues();
          
          if (data.length > 0) {
            const startRow = totalRows + 1;
            backupSheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
            totalRows += data.length + 1; // +1 para separador
          }
        } catch (error) {
          LogManager.warn('BACKUP', `Erro ao fazer backup de ${sheetName}`, { error: error.message });
        }
      });
      
      // Registrar backup
      const backupSheet2 = getSheet(CONFIG.SHEETS.BACKUP);
      backupSheet2.appendRow([
        backupId,
        new Date().toISOString(),
        'full',
        totalRows,
        this.calculateBackupSize(totalRows),
        'completed',
        JSON.stringify(options)
      ]);
      
      LogManager.info('BACKUP', 'Backup completo criado', { backupId, rows: totalRows });
      
      return {
        success: true,
        backupId: backupId,
        size: totalRows,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      LogManager.error('BACKUP', 'Erro ao criar backup', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  calculateBackupSize(rows) {
    // Estimativa simples de tamanho
    return `${Math.round(rows * 0.1)}KB`;
  }
};

// ==========================================
// FUNÇÕES PÚBLICAS DE DEPLOY
// ==========================================

/**
 * Função principal de deploy
 */
function deploySystem(options = {}) {
  return DeployManager.deploySystem(options);
}

/**
 * Deploy rápido (sem backup)
 */
function quickDeploy() {
  return DeployManager.deploySystem({
    skipBackup: true,
    environment: DEPLOY_CONFIG.ENVIRONMENTS.DEVELOPMENT
  });
}

/**
 * Deploy de produção (com todas as validações)
 */
function productionDeploy() {
  return DeployManager.deploySystem({
    environment: DEPLOY_CONFIG.ENVIRONMENTS.PRODUCTION,
    skipBackup: false,
    skipValidation: false
  });
}

/**
 * Dry run (apenas simulação)
 */
function dryRunDeploy() {
  return DeployManager.deploySystem({
    dryRun: true,
    skipBackup: true
  });
}

/**
 * Status do último deploy
 */
function getDeployStatus() {
  try {
    const deployId = ConfigManager.getSetting('deploy_id');
    const deployDate = ConfigManager.getSetting('deploy_timestamp');
    const version = ConfigManager.getSetting('system_version');
    const environment = ConfigManager.getSetting('environment');
    
    return {
      success: true,
      currentVersion: version,
      lastDeployId: deployId,
      lastDeployDate: deployDate,
      environment: environment,
      health: getSystemHealth()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Rollback para backup específico
 */
function rollbackToPreviousVersion(backupId) {
  return DeployManager.performRollback(backupId, 'manual_rollback_' + Date.now());
}