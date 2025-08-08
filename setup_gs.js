/**
 * ========================================
 * SISTEMA DE CONFIGURAÇÃO E INSTALAÇÃO v3.0
 * ========================================
 */

// Configurações específicas da instalação
const INSTALLATION_CONFIG = {
  SPREADSHEET_NAME: 'Sistema de Agendamento Dental Premium v3.0',
  FOLDER_NAME: 'Sistema Dental - Dados e Backups',
  ADMIN_EMAIL: 'admin@clinica.com.br', // ALTERE ESTE EMAIL
  TIMEZONE: 'America/Sao_Paulo',
  LOCALE: 'pt_BR',
  
  // Configurações avançadas
  SYSTEM_VERSION: '3.0.0',
  BUILD_DATE: new Date().toISOString(),
  ENVIRONMENT: 'production',
  
  // Configurações de segurança
  ENABLE_AUDIT_LOG: true,
  ENABLE_DATA_VALIDATION: true,
  ENABLE_BACKUP_ENCRYPTION: false,
  
  // Configurações de performance
  CACHE_DURATION: 300, // 5 minutos
  BATCH_SIZE: 50,
  MAX_RECORDS_PER_SHEET: 10000,
  
  // Configurações de notificação
  SEND_WELCOME_EMAIL: true,
  SEND_SETUP_REPORT: true,
  NOTIFY_ON_ERRORS: true
};

/**
 * Classe principal para instalação do sistema
 */
const SystemInstaller = {
  
  /**
   * Criar nova instalação completa
   */
  async createNewInstallation(options = {}) {
    const installationId = this.generateInstallationId();
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando nova instalação do sistema...');
      
      const config = {
        adminEmail: options.adminEmail || INSTALLATION_CONFIG.ADMIN_EMAIL,
        clinicName: options.clinicName || 'Clínica Dental Premium',
        skipWelcomeEmail: options.skipWelcomeEmail || false,
        createSampleData: options.createSampleData || false,
        ...options
      };
      
      const steps = [];
      const errors = [];
      
      // Etapa 1: Validações iniciais
      try {
        console.log('📋 Executando validações iniciais...');
        const validation = this.validateInstallationRequirements();
        steps.push({
          name: 'Validações Iniciais',
          success: validation.success,
          duration: 0,
          data: validation
        });
        
        if (!validation.success) {
          throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push({ step: 'Validações', error: error.message });
        throw error;
      }
      
      // Etapa 2: Criar estrutura de pastas
      let folder;
      try {
        console.log('📁 Criando estrutura de pastas...');
        folder = this.createFolderStructure(config);
        steps.push({
          name: 'Estrutura de Pastas',
          success: true,
          data: { folderId: folder.getId(), folderUrl: folder.getUrl() }
        });
      } catch (error) {
        errors.push({ step: 'Pastas', error: error.message });
        throw error;
      }
      
      // Etapa 3: Criar planilha principal
      let spreadsheet;
      try {
        console.log('📊 Criando planilha principal...');
        spreadsheet = this.createMainSpreadsheet(config, folder);
        steps.push({
          name: 'Planilha Principal',
          success: true,
          data: { 
            spreadsheetId: spreadsheet.getId(), 
            spreadsheetUrl: spreadsheet.getUrl() 
          }
        });
      } catch (error) {
        errors.push({ step: 'Planilha', error: error.message });
        throw error;
      }
      
      // Etapa 4: Configurar estrutura de abas
      try {
        console.log('🗂️ Configurando estrutura de abas...');
        const sheetsResult = this.setupSpreadsheetStructure(spreadsheet, config);
        steps.push({
          name: 'Estrutura de Abas',
          success: true,
          data: sheetsResult
        });
      } catch (error) {
        errors.push({ step: 'Abas', error: error.message });
        throw error;
      }
      
      // Etapa 5: Configurações iniciais
      try {
        console.log('⚙️ Definindo configurações iniciais...');
        const configResult = this.addInitialSettings(spreadsheet, config);
        steps.push({
          name: 'Configurações Iniciais',
          success: true,
          data: configResult
        });
      } catch (error) {
        errors.push({ step: 'Configurações', error: error.message });
        throw error;
      }
      
      // Etapa 6: Configurar triggers
      try {
        console.log('⚡ Configurando triggers automáticos...');
        const triggersResult = this.createTimeTriggers();
        steps.push({
          name: 'Triggers Automáticos',
          success: triggersResult.success,
          data: triggersResult
        });
      } catch (error) {
        errors.push({ step: 'Triggers', error: error.message });
        // Não é crítico, continuar
        steps.push({
          name: 'Triggers Automáticos',
          success: false,
          error: error.message
        });
      }
      
      // Etapa 7: Criar dados de exemplo (opcional)
      if (config.createSampleData) {
        try {
          console.log('📄 Criando dados de exemplo...');
          const sampleResult = this.createSampleData(spreadsheet);
          steps.push({
            name: 'Dados de Exemplo',
            success: true,
            data: sampleResult
          });
        } catch (error) {
          errors.push({ step: 'Dados Exemplo', error: error.message });
          steps.push({
            name: 'Dados de Exemplo',
            success: false,
            error: error.message
          });
        }
      }
      
      // Etapa 8: Configurar permissões
      try {
        console.log('🔐 Configurando permissões...');
        const permissionsResult = this.setupPermissions(spreadsheet, config);
        steps.push({
          name: 'Permissões',
          success: true,
          data: permissionsResult
        });
      } catch (error) {
        errors.push({ step: 'Permissões', error: error.message });
        steps.push({
          name: 'Permissões',
          success: false,
          error: error.message
        });
      }
      
      // Etapa 9: Backup inicial
      try {
        console.log('💾 Criando backup inicial...');
        const backupResult = this.createInitialBackup(spreadsheet);
        steps.push({
          name: 'Backup Inicial',
          success: backupResult.success,
          data: backupResult
        });
      } catch (error) {
        errors.push({ step: 'Backup', error: error.message });
        steps.push({
          name: 'Backup Inicial',
          success: false,
          error: error.message
        });
      }
      
      // Etapa 10: Finalização
      try {
        console.log('🎯 Finalizando instalação...');
        const webAppUrl = this.getWebAppUrl();
        const finalResult = this.finalizeInstallation(installationId, spreadsheet, config);
        steps.push({
          name: 'Finalização',
          success: true,
          data: { ...finalResult, webAppUrl }
        });
      } catch (error) {
        errors.push({ step: 'Finalização', error: error.message });
        steps.push({
          name: 'Finalização',
          success: false,
          error: error.message
        });
      }
      
      const duration = Date.now() - startTime;
      const successCount = steps.filter(s => s.success).length;
      
      // Enviar email de configuração
      if (!config.skipWelcomeEmail && config.adminEmail) {
        try {
          this.sendSetupEmail(config.adminEmail, spreadsheet, folder, {
            installationId,
            duration,
            steps,
            errors
          });
        } catch (error) {
          console.warn('Erro ao enviar email de configuração:', error);
        }
      }
      
      const result = {
        success: errors.length === 0,
        installationId,
        duration,
        spreadsheetId: spreadsheet?.getId(),
        spreadsheetUrl: spreadsheet?.getUrl(),
        folderUrl: folder?.getUrl(),
        webAppUrl: this.getWebAppUrl(),
        steps,
        errors,
        summary: {
          totalSteps: steps.length,
          successfulSteps: successCount,
          failedSteps: steps.length - successCount,
          completionRate: Math.round((successCount / steps.length) * 100)
        }
      };
      
      console.log(`✅ Instalação ${errors.length === 0 ? 'concluída' : 'parcialmente concluída'} em ${duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro crítico na instalação:', error);
      return {
        success: false,
        installationId,
        error: error.message,
        duration: Date.now() - startTime,
        steps: [],
        errors: [{ step: 'Critical', error: error.message }]
      };
    }
  },
  
  /**
   * Validar requisitos de instalação
   */
  validateInstallationRequirements() {
    const errors = [];
    const warnings = [];
    
    try {
      // Verificar permissões básicas
      try {
        DriveApp.getRootFolder();
      } catch (error) {
        errors.push('Sem permissão para acessar o Google Drive');
      }
      
      try {
        SpreadsheetApp.create('Teste');
        DriveApp.getFilesByName('Teste').next().setTrashed(true);
      } catch (error) {
        errors.push('Sem permissão para criar planilhas');
      }
      
      // Verificar quota de armazenamento
      try {
        const storageUsed = DriveApp.getStorageUsed();
        const storageLimit = DriveApp.getStorageLimit();
        
        if (storageUsed > storageLimit * 0.9) {
          warnings.push('Pouco espaço disponível no Google Drive');
        }
      } catch (error) {
        warnings.push('Não foi possível verificar quota de armazenamento');
      }
      
      // Verificar configurações do Apps Script
      try {
        const user = Session.getActiveUser().getEmail();
        if (!user) {
          errors.push('Usuário não identificado');
        }
      } catch (error) {
        errors.push('Erro ao verificar usuário ativo');
      }
      
      return {
        success: errors.length === 0,
        errors,
        warnings,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [`Erro na validação: ${error.message}`],
        warnings
      };
    }
  },
  
  /**
   * Criar estrutura de pastas
   */
  createFolderStructure(config) {
    try {
      const mainFolder = DriveApp.createFolder(INSTALLATION_CONFIG.FOLDER_NAME);
      
      // Subpastas
      const subfolders = [
        'Backups',
        'Relatórios',
        'Documentos',
        'Templates',
        'Logs'
      ];
      
      subfolders.forEach(folderName => {
        try {
          mainFolder.createFolder(folderName);
        } catch (error) {
          console.warn(`Erro ao criar subfolder ${folderName}:`, error);
        }
      });
      
      return mainFolder;
    } catch (error) {
      throw new Error(`Erro ao criar estrutura de pastas: ${error.message}`);
    }
  },
  
  /**
   * Criar planilha principal
   */
  createMainSpreadsheet(config, folder) {
    try {
      const spreadsheet = SpreadsheetApp.create(INSTALLATION_CONFIG.SPREADSHEET_NAME);
      const file = DriveApp.getFileById(spreadsheet.getId());
      
      // Mover para a pasta criada
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      
      // Definir descrição
      file.setDescription(`Sistema de Agendamento Dental - Criado em ${new Date().toLocaleString('pt-BR')}`);
      
      return spreadsheet;
    } catch (error) {
      throw new Error(`Erro ao criar planilha: ${error.message}`);
    }
  },
  
  /**
   * Configurar estrutura das abas
   */
  setupSpreadsheetStructure(spreadsheet, config) {
    try {
      console.log('🔧 Configurando estrutura da planilha...');
      
      // Remover planilha padrão
      const defaultSheet = spreadsheet.getSheets()[0];
      if (defaultSheet.getName() === 'Planilha1') {
        defaultSheet.setName('Temp');
      }
      
      // Configuração das abas
      const sheetsConfig = {
        'Agendamentos': {
          headers: [
            'id', 'patientName', 'phone', 'email', 'cpf', 'date', 'time', 
            'type', 'duration', 'status', 'notes', 'priority', 'reminder', 
            'source', 'createdAt', 'updatedAt', 'version'
          ],
          frozen: 1,
          color: '#4285f4',
          description: 'Registro de todos os agendamentos'
        },
        'Pacientes': {
          headers: [
            'name', 'phone', 'email', 'cpf', 'birthDate', 'address', 
            'totalAppointments', 'lastAppointment', 'firstAppointment',
            'status', 'notes', 'createdAt', 'updatedAt'
          ],
          frozen: 1,
          color: '#34a853',
          description: 'Cadastro de pacientes'
        },
        'Tipos_Consulta': {
          headers: [
            'type', 'description', 'defaultDuration', 'defaultPrice', 
            'color', 'isActive', 'category', 'requiresPrep'
          ],
          frozen: 1,
          color: '#ff9800',
          description: 'Tipos de consulta disponíveis'
        },
        'Horarios_Funcionamento': {
          headers: [
            'dayOfWeek', 'startTime', 'endTime', 'isWorkingDay', 
            'breakStartTime', 'breakEndTime', 'maxAppointments'
          ],
          frozen: 1,
          color: '#9c27b0',
          description: 'Horários de funcionamento'
        },
        'Feriados': {
          headers: [
            'date', 'name', 'isRecurring', 'description', 'isActive'
          ],
          frozen: 1,
          color: '#f44336',
          description: 'Feriados e dias não úteis'
        },
        'Logs': {
          headers: [
            'timestamp', 'level', 'category', 'action', 'description', 
            'userId', 'userAgent', 'ip', 'data', 'sessionId'
          ],
          frozen: 1,
          color: '#fbbc05',
          description: 'Log de atividades do sistema'
        },
        'Configuracoes': {
          headers: [
            'key', 'value', 'description', 'category', 'dataType', 
            'isRequired', 'updatedAt', 'updatedBy'
          ],
          frozen: 1,
          color: '#ea4335',
          description: 'Configurações do sistema'
        },
        'Backup': {
          headers: [
            'backupId', 'timestamp', 'dataType', 'recordCount', 
            'fileSizeKB', 'status', 'metadata', 'restorePoint'
          ],
          frozen: 1,
          color: '#607d8b',
          description: 'Controle de backups'
        },
        'Auditoria': {
          headers: [
            'timestamp', 'userId', 'action', 'entityType', 'entityId', 
            'oldValues', 'newValues', 'ip', 'userAgent', 'sessionId'
          ],
          frozen: 1,
          color: '#795548',
          description: 'Auditoria de alterações'
        },
        'Notificacoes': {
          headers: [
            'notificationId', 'type', 'recipient', 'subject', 'status', 
            'sentAt', 'deliveredAt', 'attempts', 'errorMessage', 'metadata'
          ],
          frozen: 1,
          color: '#3f51b5',
          description: 'Log de notificações enviadas'
        }
      };
      
      const createdSheets = [];
      
      Object.keys(sheetsConfig).forEach(sheetName => {
        try {
          const config = sheetsConfig[sheetName];
          
          // Criar aba
          const sheet = spreadsheet.insertSheet(sheetName);
          
          // Configurar cabeçalhos
          const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
          headerRange.setValues([config.headers]);
          headerRange.setFontWeight('bold');
          headerRange.setFontColor('#ffffff');
          headerRange.setBackground(config.color);
          headerRange.setHorizontalAlignment('center');
          headerRange.setVerticalAlignment('middle');
          
          // Congelar primeira linha
          if (config.frozen) {
            sheet.setFrozenRows(config.frozen);
          }
          
          // Ajustar largura das colunas
          sheet.autoResizeColumns(1, config.headers.length);
          
          // Configurar cor da aba
          sheet.setTabColor(config.color);
          
          // Adicionar proteção aos cabeçalhos
          const protection = headerRange.protect();
          protection.setDescription(`Cabeçalhos da aba ${sheetName}`);
          protection.setWarningOnly(true);
          
          createdSheets.push({
            name: sheetName,
            headers: config.headers.length,
            color: config.color,
            description: config.description
          });
          
          console.log(`📋 Aba "${sheetName}" criada e configurada`);
          
        } catch (error) {
          console.error(`Erro ao criar aba ${sheetName}:`, error);
          throw error;
        }
      });
      
      // Remover aba temporária
      const tempSheet = spreadsheet.getSheetByName('Temp');
      if (tempSheet) {
        spreadsheet.deleteSheet(tempSheet);
      }
      
      // Adicionar dados iniciais específicos
      this.populateInitialData(spreadsheet);
      
      return {
        sheetsCreated: createdSheets.length,
        sheets: createdSheets
      };
      
    } catch (error) {
      throw new Error(`Erro ao configurar estrutura: ${error.message}`);
    }
  },
  
  /**
   * Adicionar dados iniciais específicos
   */
  populateInitialData(spreadsheet) {
    try {
      // Tipos de consulta padrão
      const tiposSheet = spreadsheet.getSheetByName('Tipos_Consulta');
      const tiposData = [
        ['Primeira Consulta', 'Consulta inicial de avaliação', 60, 150, '#4285f4', true, 'Avaliação', false],
        ['Retorno', 'Consulta de retorno/revisão', 30, 80, '#34a853', true, 'Acompanhamento', false],
        ['Limpeza', 'Limpeza dental (profilaxia)', 45, 120, '#00bcd4', true, 'Preventivo', false],
        ['Tratamento', 'Tratamento dental geral', 90, 200, '#ff9800', true, 'Curativo', false],
        ['Emergência', 'Atendimento de emergência', 30, 180, '#f44336', true, 'Urgência', false],
        ['Ortodontia', 'Consulta ortodôntica', 60, 300, '#9c27b0', true, 'Especializada', true],
        ['Implante', 'Procedimento de implante', 120, 800, '#795548', true, 'Cirúrgica', true],
        ['Cirurgia', 'Procedimento cirúrgico', 180, 500, '#607d8b', true, 'Cirúrgica', true],
        ['Prótese', 'Serviços de prótese', 90, 600, '#e91e63', true, 'Reabilitação', true],
        ['Extração', 'Extração dental', 45, 150, '#ff5722', true, 'Cirúrgica', false],
        ['Avaliação', 'Avaliação especializada', 45, 100, '#3f51b5', true, 'Avaliação', false],
        ['Manutenção', 'Manutenção de tratamento', 30, 60, '#8bc34a', true, 'Acompanhamento', false]
      ];
      
      if (tiposData.length > 0) {
        tiposSheet.getRange(2, 1, tiposData.length, tiposData[0].length).setValues(tiposData);
      }
      
      // Horários de funcionamento padrão
      const horariosSheet = spreadsheet.getSheetByName('Horarios_Funcionamento');
      const horariosData = [
        [1, '08:00', '18:00', true, '12:00', '13:00', 10], // Segunda
        [2, '08:00', '18:00', true, '12:00', '13:00', 10], // Terça
        [3, '08:00', '18:00', true, '12:00', '13:00', 10], // Quarta
        [4, '08:00', '18:00', true, '12:00', '13:00', 10], // Quinta
        [5, '08:00', '17:00', true, '12:00', '13:00', 8],  // Sexta
        [6, '08:00', '12:00', false, '', '', 0],           // Sábado
        [0, '', '', false, '', '', 0]                      // Domingo
      ];
      
      if (horariosData.length > 0) {
        horariosSheet.getRange(2, 1, horariosData.length, horariosData[0].length).setValues(horariosData);
      }
      
      // Feriados nacionais básicos
      const feriadosSheet = spreadsheet.getSheetByName('Feriados');
      const currentYear = new Date().getFullYear();
      const feriadosData = [
        [`${currentYear}-01-01`, 'Confraternização Universal', true, 'Feriado Nacional', true],
        [`${currentYear}-04-21`, 'Tiradentes', true, 'Feriado Nacional', true],
        [`${currentYear}-05-01`, 'Dia do Trabalhador', true, 'Feriado Nacional', true],
        [`${currentYear}-09-07`, 'Independência do Brasil', true, 'Feriado Nacional', true],
        [`${currentYear}-10-12`, 'Nossa Senhora Aparecida', true, 'Feriado Nacional', true],
        [`${currentYear}-11-02`, 'Finados', true, 'Feriado Nacional', true],
        [`${currentYear}-11-15`, 'Proclamação da República', true, 'Feriado Nacional', true],
        [`${currentYear}-12-25`, 'Natal', true, 'Feriado Nacional', true]
      ];
      
      if (feriadosData.length > 0) {
        feriadosSheet.getRange(2, 1, feriadosData.length, feriadosData[0].length).setValues(feriadosData);
      }
      
    } catch (error) {
      console.warn('Erro ao popular dados iniciais:', error);
    }
  },
  
  /**
   * Adicionar configurações iniciais
   */
  addInitialSettings(spreadsheet, config) {
    try {
      const settingsSheet = spreadsheet.getSheetByName('Configuracoes');
      
      const initialSettings = [
        // Configurações básicas
        ['clinic_name', config.clinicName || 'Clínica Dental Premium', 'Nome da clínica', 'Básico', 'string', true, new Date().toISOString(), config.adminEmail],
        ['admin_email', config.adminEmail, 'Email do administrador', 'Básico', 'email', true, new Date().toISOString(), config.adminEmail],
        ['timezone', INSTALLATION_CONFIG.TIMEZONE, 'Fuso horário', 'Básico', 'string', true, new Date().toISOString(), config.adminEmail],
        ['locale', INSTALLATION_CONFIG.LOCALE, 'Localização', 'Básico', 'string', true, new Date().toISOString(), config.adminEmail],
        ['system_version', INSTALLATION_CONFIG.SYSTEM_VERSION, 'Versão do sistema', 'Sistema', 'string', false, new Date().toISOString(), 'system'],
        ['installation_date', new Date().toISOString(), 'Data de instalação', 'Sistema', 'datetime', false, new Date().toISOString(), 'system'],
        ['installation_id', this.generateInstallationId(), 'ID da instalação', 'Sistema', 'string', false, new Date().toISOString(), 'system'],
        
        // Configurações de funcionamento
        ['working_hours_start', '08:00', 'Início do horário de trabalho', 'Funcionamento', 'time', true, new Date().toISOString(), config.adminEmail],
        ['working_hours_end', '18:00', 'Fim do horário de trabalho', 'Funcionamento', 'time', true, new Date().toISOString(), config.adminEmail],
        ['lunch_break_start', '12:00', 'Início do almoço', 'Funcionamento', 'time', true, new Date().toISOString(), config.adminEmail],
        ['lunch_break_end', '13:00', 'Fim do almoço', 'Funcionamento', 'time', true, new Date().toISOString(), config.adminEmail],
        ['max_appointments_per_day', '20', 'Máximo de agendamentos por dia', 'Funcionamento', 'number', true, new Date().toISOString(), config.adminEmail],
        ['appointment_duration_default', '60', 'Duração padrão de consulta (minutos)', 'Funcionamento', 'number', true, new Date().toISOString(), config.adminEmail],
        ['min_advance_booking_hours', '24', 'Mínimo de horas para agendamento', 'Funcionamento', 'number', true, new Date().toISOString(), config.adminEmail],
        ['max_advance_booking_days', '90', 'Máximo de dias para agendamento', 'Funcionamento', 'number', true, new Date().toISOString(), config.adminEmail],
        
        // Configurações de contato
        ['clinic_phone', '', 'Telefone da clínica', 'Contato', 'phone', false, new Date().toISOString(), config.adminEmail],
        ['clinic_address', '', 'Endereço da clínica', 'Contato', 'text', false, new Date().toISOString(), config.adminEmail],
        ['clinic_website', '', 'Site da clínica', 'Contato', 'url', false, new Date().toISOString(), config.adminEmail],
        ['whatsapp_number', '', 'WhatsApp para contato', 'Contato', 'phone', false, new Date().toISOString(), config.adminEmail],
        
        // Configurações de notificação
        ['notifications_enabled', 'true', 'Notificações habilitadas', 'Notificações', 'boolean', true, new Date().toISOString(), config.adminEmail],
        ['email_notifications', 'true', 'Notificações por email', 'Notificações', 'boolean', true, new Date().toISOString(), config.adminEmail],
        ['sms_notifications', 'false', 'Notificações por SMS', 'Notificações', 'boolean', false, new Date().toISOString(), config.adminEmail],
        ['whatsapp_notifications', 'false', 'Notificações por WhatsApp', 'Notificações', 'boolean', false, new Date().toISOString(), config.adminEmail],
        ['reminder_hours_before', '24', 'Horas antes para lembrete', 'Notificações', 'number', true, new Date().toISOString(), config.adminEmail],
        
        // Configurações de backup
        ['auto_backup_enabled', 'true', 'Backup automático habilitado', 'Backup', 'boolean', true, new Date().toISOString(), config.adminEmail],
        ['backup_frequency_hours', '24', 'Frequência de backup (horas)', 'Backup', 'number', true, new Date().toISOString(), config.adminEmail],
        ['max_backup_retention_days', '30', 'Dias para manter backups', 'Backup', 'number', true, new Date().toISOString(), config.adminEmail],
        ['backup_include_logs', 'false', 'Incluir logs no backup', 'Backup', 'boolean', false, new Date().toISOString(), config.adminEmail],
        
        // Configurações de segurança
        ['audit_log_enabled', INSTALLATION_CONFIG.ENABLE_AUDIT_LOG.toString(), 'Log de auditoria habilitado', 'Segurança', 'boolean', true, new Date().toISOString(), config.adminEmail],
        ['data_validation_enabled', INSTALLATION_CONFIG.ENABLE_DATA_VALIDATION.toString(), 'Validação de dados habilitada', 'Segurança', 'boolean', true, new Date().toISOString(), config.adminEmail],
        ['session_timeout_minutes', '480', 'Timeout de sessão (minutos)', 'Segurança', 'number', true, new Date().toISOString(), config.adminEmail],
        ['max_login_attempts', '5', 'Máximo tentativas de login', 'Segurança', 'number', true, new Date().toISOString(), config.adminEmail],
        
        // Configurações de interface
        ['theme', 'light', 'Tema da interface', 'Interface', 'string', false, new Date().toISOString(), config.adminEmail],
        ['language', 'pt-BR', 'Idioma do sistema', 'Interface', 'string', true, new Date().toISOString(), config.adminEmail],
        ['date_format', 'DD/MM/YYYY', 'Formato de data', 'Interface', 'string', true, new Date().toISOString(), config.adminEmail],
        ['time_format', 'HH:mm', 'Formato de hora', 'Interface', 'string', true, new Date().toISOString(), config.adminEmail],
        ['currency', 'BRL', 'Moeda padrão', 'Interface', 'string', true, new Date().toISOString(), config.adminEmail],
        
        // Configurações avançadas
        ['cache_enabled', 'true', 'Cache habilitado', 'Avançado', 'boolean', false, new Date().toISOString(), config.adminEmail],
        ['cache_duration_minutes', '5', 'Duração do cache (minutos)', 'Avançado', 'number', false, new Date().toISOString(), config.adminEmail],
        ['debug_mode', 'false', 'Modo debug habilitado', 'Avançado', 'boolean', false, new Date().toISOString(), config.adminEmail],
        ['log_level', 'INFO', 'Nível de log', 'Avançado', 'string', false, new Date().toISOString(), config.adminEmail],
        ['performance_monitoring', 'true', 'Monitoramento de performance', 'Avançado', 'boolean', false, new Date().toISOString(), config.adminEmail]
      ];
      
      // Inserir configurações
      if (initialSettings.length > 0) {
        const range = settingsSheet.getRange(2, 1, initialSettings.length, initialSettings[0].length);
        range.setValues(initialSettings);
        
        // Formatar coluna de data
        settingsSheet.getRange(2, 7, initialSettings.length, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
      }
      
      console.log('⚙️ Configurações iniciais adicionadas');
      
      return {
        settingsCount: initialSettings.length,
        categories: [...new Set(initialSettings.map(s => s[3]))]
      };
      
    } catch (error) {
      throw new Error(`Erro ao adicionar configurações: ${error.message}`);
    }
  },
  
  /**
   * Criar dados de exemplo
   */
  createSampleData(spreadsheet) {
    try {
      const agendamentosSheet = spreadsheet.getSheetByName('Agendamentos');
      const pacientesSheet = spreadsheet.getSheetByName('Pacientes');
      
      // Dados de exemplo de pacientes
      const samplePatients = [
        ['João Silva Santos', '11987654321', 'joao.silva@email.com', '12345678901', '1985-05-15', 'Rua das Flores, 123', 3, '2024-01-15', '2023-08-10', 'ativo', 'Paciente regular', new Date().toISOString(), new Date().toISOString()],
        ['Maria Oliveira Costa', '11976543210', 'maria.costa@email.com', '98765432109', '1990-03-22', 'Av. Brasil, 456', 2, '2024-01-10', '2023-12-05', 'ativo', 'Tratamento ortodôntico', new Date().toISOString(), new Date().toISOString()],
        ['Pedro Santos Lima', '11965432109', 'pedro.lima@email.com', '', '1978-11-08', 'Rua da Paz, 789', 1, '2023-12-20', '2023-12-20', 'ativo', 'Primeira consulta', new Date().toISOString(), new Date().toISOString()]
      ];
      
      if (samplePatients.length > 0) {
        pacientesSheet.getRange(2, 1, samplePatients.length, samplePatients[0].length).setValues(samplePatients);
      }
      
      // Dados de exemplo de agendamentos
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const sampleAppointments = [
        ['apt_' + Date.now() + '_1', 'João Silva Santos', '11987654321', 'joao.silva@email.com', '12345678901', tomorrow.toISOString().split('T')[0], '09:00', 'Retorno', '60', 'Confirmado', 'Revisão do tratamento', 'normal', '24hours', 'phone', new Date().toISOString(), new Date().toISOString(), 1],
        ['apt_' + Date.now() + '_2', 'Maria Oliveira Costa', '11976543210', 'maria.costa@email.com', '98765432109', nextWeek.toISOString().split('T')[0], '14:00', 'Ortodontia', '90', 'Pendente', 'Ajuste do aparelho', 'normal', '24hours', 'whatsapp', new Date().toISOString(), new Date().toISOString(), 1],
        ['apt_' + Date.now() + '_3', 'Pedro Santos Lima', '11965432109', 'pedro.lima@email.com', '', tomorrow.toISOString().split('T')[0], '16:00', 'Limpeza', '45', 'Confirmado', 'Limpeza de rotina', 'normal', '24hours', 'phone', new Date().toISOString(), new Date().toISOString(), 1]
      ];
      
      if (sampleAppointments.length > 0) {
        agendamentosSheet.getRange(2, 1, sampleAppointments.length, sampleAppointments[0].length).setValues(sampleAppointments);
      }
      
      return {
        patients: samplePatients.length,
        appointments: sampleAppointments.length
      };
      
    } catch (error) {
      throw new Error(`Erro ao criar dados de exemplo: ${error.message}`);
    }
  },
  
  /**
   * Configurar permissões
   */
  setupPermissions(spreadsheet, config) {
    try {
      // Adicionar editor administrativo
      if (config.adminEmail && config.adminEmail !== Session.getActiveUser().getEmail()) {
        try {
          spreadsheet.addEditor(config.adminEmail);
        } catch (error) {
          console.warn('Não foi possível adicionar editor administrativo:', error);
        }
      }
      
      // Proteger abas críticas
      const criticalSheets = ['Configuracoes', 'Logs', 'Backup', 'Auditoria'];
      const protections = [];
      
      criticalSheets.forEach(sheetName => {
        try {
          const sheet = spreadsheet.getSheetByName(sheetName);
          if (sheet) {
            const protection = sheet.protect();
            protection.setDescription(`Proteção da aba ${sheetName}`);
            protection.setWarningOnly(true);
            protections.push(sheetName);
          }
        } catch (error) {
          console.warn(`Erro ao proteger aba ${sheetName}:`, error);
        }
      });
      
      return {
        protectedSheets: protections.length,
        sheets: protections
      };
      
    } catch (error) {
      throw new Error(`Erro ao configurar permissões: ${error.message}`);
    }
  },
  
  /**
   * Criar backup inicial
   */
  createInitialBackup(spreadsheet) {
    try {
      const backupSheet = spreadsheet.getSheetByName('Backup');
      const backupId = 'initial_' + Date.now();
      
      // Registrar backup inicial
      const backupData = [
        backupId,
        new Date().toISOString(),
        'initial_setup',
        0,
        0,
        'completed',
        JSON.stringify({ type: 'installation', version: INSTALLATION_CONFIG.SYSTEM_VERSION }),
        true
      ];
      
      backupSheet.appendRow(backupData);
      
      return {
        success: true,
        backupId: backupId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Configurar triggers automáticos
   */
  createTimeTriggers() {
    try {
      // Remover triggers existentes
      const existingTriggers = ScriptApp.getProjectTriggers();
      existingTriggers.forEach(trigger => {
        try {
          ScriptApp.deleteTrigger(trigger);
        } catch (error) {
          console.warn('Erro ao remover trigger:', error);
        }
      });
      
      const triggers = [];
      const errors = [];
      
      // Backup diário às 2h
      try {
        const backupTrigger = ScriptApp.newTrigger('dailyBackup')
          .timeBased()
          .everyDays(1)
          .atHour(2)
          .create();
        triggers.push({ name: 'Daily Backup', id: backupTrigger.getUniqueId() });
      } catch (error) {
        errors.push({ name: 'Daily Backup', error: error.message });
      }
      
      // Limpeza semanal aos domingos às 3h
      try {
        const cleanupTrigger = ScriptApp.newTrigger('weeklyCleanup')
          .timeBased()
          .everyWeeks(1)
          .onWeekDay(ScriptApp.WeekDay.SUNDAY)
          .atHour(3)
          .create();
        triggers.push({ name: 'Weekly Cleanup', id: cleanupTrigger.getUniqueId() });
      } catch (error) {
        errors.push({ name: 'Weekly Cleanup', error: error.message });
      }
      
      // Health check a cada 6 horas
      try {
        const healthTrigger = ScriptApp.newTrigger('systemHealthCheck')
          .timeBased()
          .everyHours(6)
          .create();
        triggers.push({ name: 'Health Check', id: healthTrigger.getUniqueId() });
      } catch (error) {
        errors.push({ name: 'Health Check', error: error.message });
      }
      
      // Lembretes diários às 8h
      try {
        const reminderTrigger = ScriptApp.newTrigger('dailyReminders')
          .timeBased()
          .everyDays(1)
          .atHour(8)
          .create();
        triggers.push({ name: 'Daily Reminders', id: reminderTrigger.getUniqueId() });
      } catch (error) {
        errors.push({ name: 'Daily Reminders', error: error.message });
      }
      
      // Monitoramento de performance a cada 2 horas
      try {
        const monitoringTrigger = ScriptApp.newTrigger('performanceMonitoring')
          .timeBased()
          .everyHours(2)
          .create();
        triggers.push({ name: 'Performance Monitoring', id: monitoringTrigger.getUniqueId() });
      } catch (error) {
        errors.push({ name: 'Performance Monitoring', error: error.message });
      }
      
      return {
        success: errors.length === 0,
        triggersCreated: triggers.length,
        triggersFailed: errors.length,
        triggers,
        errors
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        triggersCreated: 0
      };
    }
  },
  
  /**
   * Finalizar instalação
   */
  finalizeInstallation(installationId, spreadsheet, config) {
    try {
      // Registrar instalação na auditoria
      const auditoriaSheet = spreadsheet.getSheetByName('Auditoria');
      const auditData = [
        new Date().toISOString(),
        config.adminEmail,
        'INSTALLATION_COMPLETED',
        'SYSTEM',
        installationId,
        '{}',
        JSON.stringify({
          version: INSTALLATION_CONFIG.SYSTEM_VERSION,
          spreadsheetId: spreadsheet.getId(),
          adminEmail: config.adminEmail
        }),
        '',
        'System Installer',
        'install_' + Date.now()
      ];
      
      auditoriaSheet.appendRow(auditData);
      
      // Registrar log de instalação
      const logsSheet = spreadsheet.getSheetByName('Logs');
      const logData = [
        new Date().toISOString(),
        'INFO',
        'INSTALLATION',
        'SYSTEM_INSTALLED',
        `Sistema instalado com sucesso. ID: ${installationId}`,
        'system',
        'System Installer',
        '',
        JSON.stringify({ installationId, version: INSTALLATION_CONFIG.SYSTEM_VERSION }),
        'install_' + Date.now()
      ];
      
      logsSheet.appendRow(logData);
      
      return {
        installationId,
        timestamp: new Date().toISOString(),
        version: INSTALLATION_CONFIG.SYSTEM_VERSION,
        status: 'completed'
      };
      
    } catch (error) {
      throw new Error(`Erro na finalização: ${error.message}`);
    }
  },
  
  /**
   * Enviar email de configuração
   */
  sendSetupEmail(adminEmail, spreadsheet, folder, installationData) {
    try {
      const subject = `🦷 Sistema de Agendamento Dental - Instalação Concluída v${INSTALLATION_CONFIG.SYSTEM_VERSION}`;
      
      const htmlBody = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Instalação Concluída</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .success-card { background: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
                .link-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0; }
                .steps-list { background: #e0f2fe; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .warning-box { background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
                .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px; }
                @media (max-width: 600px) { .links-grid { grid-template-columns: 1fr; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 2.5rem;">🦷 Sistema de Agendamento</h1>
                    <p style="margin: 15px 0 0 0; font-size: 1.2rem; opacity: 0.9;">Instalação Concluída com Sucesso!</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.8;">Versão ${INSTALLATION_CONFIG.SYSTEM_VERSION}</p>
                </div>
                
                <div class="content">
                    <div class="success-card">
                        <h2 style="margin-top: 0; color: #059669; font-size: 1.5rem;">✅ Parabéns! Sistema Instalado</h2>
                        <p style="margin: 0; font-size: 1.1rem; line-height: 1.6;">
                            Seu sistema de agendamento dental foi configurado com sucesso e está pronto para uso!
                        </p>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <h3 style="color: #1f2937; margin-bottom: 20px;">📊 Resumo da Instalação:</h3>
                        <ul style="line-height: 1.8; font-size: 1rem;">
                            <li><strong>ID da Instalação:</strong> ${installationData.installationId}</li>
                            <li><strong>Duração:</strong> ${Math.round(installationData.duration / 1000)} segundos</li>
                            <li><strong>Etapas Concluídas:</strong> ${installationData.steps.filter(s => s.success).length}/${installationData.steps.length}</li>
                            <li><strong>Taxa de Sucesso:</strong> ${Math.round((installationData.steps.filter(s => s.success).length / installationData.steps.length) * 100)}%</li>
                            <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                        </ul>
                    </div>
                    
                    <div class="links-grid">
                        <div class="link-card">
                            <h4 style="margin-top: 0; color: #1f2937;">📊 Planilha Principal</h4>
                            <p style="font-size: 0.9rem; color: #6b7280;">Acesse e gerencie todos os dados</p>
                            <a href="${spreadsheet.getUrl()}" class="btn">Abrir Planilha</a>
                        </div>
                        <div class="link-card">
                            <h4 style="margin-top: 0; color: #1f2937;">📁 Pasta no Drive</h4>
                            <p style="font-size: 0.9rem; color: #6b7280;">Arquivos e backups do sistema</p>
                            <a href="${folder.getUrl()}" class="btn">Abrir Pasta</a>
                        </div>
                    </div>
                    
                    <div class="steps-list">
                        <h3 style="margin-top: 0; color: #0277bd;">🔧 Próximos Passos Recomendados:</h3>
                        <ol style="line-height: 1.8; color: #0277bd;">
                            <li><strong>Revise as Configurações:</strong> Acesse a aba "Configurações" e personalize os dados da clínica</li>
                            <li><strong>Configure Horários:</strong> Ajuste os horários de funcionamento na aba "Horários_Funcionamento"</li>
                            <li><strong>Teste o Sistema:</strong> Crie agendamentos de teste para verificar o funcionamento</li>
                            <li><strong>Configure Notificações:</strong> Defina emails e contatos para receber notificações</li>
                            <li><strong>Treine a Equipe:</strong> Apresente o sistema para sua equipe e defina responsabilidades</li>
                            <li><strong>Backup Regular:</strong> Configure backups automáticos e verifique periodicamente</li>
                        </ol>
                    </div>
                    
                    <div class="warning-box">
                        <h3 style="margin-top: 0; color: #856404;">⚠️ Importante - Segurança:</h3>
                        <ul style="line-height: 1.8; color: #856404;">
                            <li><strong>Mantenha a planilha segura:</strong> Não compartilhe publicamente</li>
                            <li><strong>Configure permissões:</strong> Adicione apenas usuários autorizados</li>
                            <li><strong>Faça backups regulares:</strong> Os dados são valiosos e únicos</li>
                            <li><strong>Monitore o sistema:</strong> Verifique logs e atividades periodicamente</li>
                            <li><strong>Atualize regularmente:</strong> Mantenha o sistema sempre atualizado</li>
                        </ul>
                    </div>
                    
                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #059669;">💡 Dicas de Uso:</h3>
                        <ul style="line-height: 1.8; color: #065f46;">
                            <li>Use filtros na planilha para encontrar informações rapidamente</li>
                            <li>Exporte dados regularmente para relatórios externos</li>
                            <li>Configure lembretes automáticos para melhorar a experiência do paciente</li>
                            <li>Utilize as abas de análise para acompanhar métricas da clínica</li>
                            <li>Mantenha os dados de pacientes sempre atualizados</li>
                        </ul>
                    </div>
                    
                    ${installationData.errors.length > 0 ? `
                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #dc2626;">⚠️ Atenção - Alguns Problemas Detectados:</h4>
                        <ul style="color: #dc2626;">
                            ${installationData.errors.map(error => `<li><strong>${error.step}:</strong> ${error.error}</li>`).join('')}
                        </ul>
                        <p style="color: #dc2626; font-weight: 500;">
                            Estes problemas não afetam o funcionamento básico, mas recomendamos verificar.
                        </p>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <h3 style="color: #1f2937;">🎉 Sistema Pronto para Uso!</h3>
                        <p style="font-size: 1.1rem; color: #6b7280;">
                            Agora você pode começar a agendar consultas e gerenciar sua clínica com eficiência.
                        </p>
                        <a href="${spreadsheet.getUrl()}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; margin-top: 20px;">
                            🚀 Começar a Usar Agora
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Sistema de Agendamento Dental Premium</strong></p>
                    <p>Versão ${INSTALLATION_CONFIG.SYSTEM_VERSION} - Instalado em ${new Date().toLocaleString('pt-BR')}</p>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 15px;">
                        Este email foi gerado automaticamente pelo sistema de instalação.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      
      console.log('📧 Email de configuração enviado para:', adminEmail);
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de configuração:', error);
    }
  },
  
  /**
   * Utilitários
   */
  generateInstallationId() {
    return 'install_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  getWebAppUrl() {
    try {
      return ScriptApp.getService().getUrl();
    } catch (error) {
      return 'URL será gerada após o deploy do Web App';
    }
  }
};

/**
 * Função principal para criar nova instalação
 */
function createNewInstallation(options = {}) {
  return SystemInstaller.createNewInstallation(options);
}

/**
 * Atualizar sistema existente
 */
function updateExistingSystem() {
  try {
    console.log('🔄 Iniciando atualização do sistema...');
    
    // Verificar se sistema já existe
    try {
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      console.log('✅ Sistema existente encontrado');
    } catch (error) {
      throw new Error('Sistema não encontrado. Execute uma nova instalação primeiro.');
    }
    
    // Fazer backup antes da atualização
    const backupResult = createBackup();
    if (!backupResult.success) {
      throw new Error('Falha ao criar backup: ' + backupResult.error);
    }
    
    // Verificar versão atual
    const currentVersion = getCurrentVersion();
    console.log('📊 Versão atual:', currentVersion);
    console.log('📊 Nova versão:', INSTALLATION_CONFIG.SYSTEM_VERSION);
    
    if (currentVersion === INSTALLATION_CONFIG.SYSTEM_VERSION) {
      console.log('✅ Sistema já está na versão mais recente');
      return { 
        success: true, 
        message: 'Sistema já está atualizado',
        currentVersion: currentVersion
      };
    }
    
    // Aplicar migrações necessárias
    const migrationResult = applyMigrations(currentVersion, INSTALLATION_CONFIG.SYSTEM_VERSION);
    if (!migrationResult.success) {
      throw new Error('Falha na migração: ' + migrationResult.error);
    }
    
    // Atualizar versão
    updateSystemVersion(INSTALLATION_CONFIG.SYSTEM_VERSION);
    
    // Recriar triggers
    SystemInstaller.createTimeTriggers();
    
    console.log('✅ Sistema atualizado com sucesso!');
    
    return {
      success: true,
      previousVersion: currentVersion,
      newVersion: INSTALLATION_CONFIG.SYSTEM_VERSION,
      backupId: backupResult.backupId,
      migrationsApplied: migrationResult.migrationsApplied || 0
    };
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter versão atual do sistema
 */
function getCurrentVersion() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.SETTINGS || 'Configuracoes');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'system_version') {
        return data[i][1];
      }
    }
    
    return '1.0.0'; // Versão padrão se não encontrada
  } catch (error) {
    return '1.0.0';
  }
}

/**
 * Atualizar versão do sistema
 */
function updateSystemVersion(newVersion) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.SETTINGS || 'Configuracoes');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'system_version') {
        sheet.getRange(i + 1, 2).setValue(newVersion);
        sheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // updatedAt
        return;
      }
    }
    
    // Se não encontrou, adicionar nova linha
    sheet.appendRow([
      'system_version', 
      newVersion, 
      'Versão atual do sistema',
      'Sistema',
      'string',
      false,
      new Date().toISOString(),
      'system'
    ]);
    
  } catch (error) {
    console.error('Erro ao atualizar versão:', error);
  }
}

/**
 * Aplicar migrações entre versões
 */
function applyMigrations(fromVersion, toVersion) {
  try {
    console.log(`🔄 Aplicando migrações de ${fromVersion} para ${toVersion}`);
    
    const migrations = [];
    
    // Definir migrações específicas aqui
    if (fromVersion === '1.0.0' && toVersion !== '1.0.0') {
      migrations.push(() => {
        console.log('Aplicando migração 1.0.0 -> 2.0.0+');
        // Adicionar colunas novas se necessário
        // Migrar dados existentes
        return true;
      });
    }
    
    if (fromVersion < '3.0.0' && toVersion === '3.0.0') {
      migrations.push(() => {
        console.log('Aplicando migração para 3.0.0');
        // Implementar migrações específicas para v3.0
        return true;
      });
    }
    
    // Executar migrações
    let migrationsApplied = 0;
    for (const migration of migrations) {
      try {
        if (migration()) {
          migrationsApplied++;
        }
      } catch (error) {
        console.error('Erro na migração:', error);
        return { success: false, error: error.message };
      }
    }
    
    return { 
      success: true, 
      migrationsApplied: migrationsApplied 
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Diagnóstico completo do sistema
 */
function diagnoseSystem() {
  try {
    console.log('🔍 Iniciando diagnóstico completo do sistema...');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      version: INSTALLATION_CONFIG.SYSTEM_VERSION,
      systemHealth: 'unknown',
      components: {},
      issues: [],
      recommendations: [],
      performance: {},
      security: {}
    };
    
    // Verificar componentes principais
    const components = [
      'spreadsheet',
      'sheets_structure', 
      'triggers',
      'permissions',
      'configuration',
      'data_integrity'
    ];
    
    components.forEach(component => {
      try {
        diagnosis.components[component] = diagnosisComponent(component);
      } catch (error) {
        diagnosis.components[component] = {
          status: 'error',
          error: error.message
        };
        diagnosis.issues.push(`Componente ${component}: ${error.message}`);
      }
    });
    
    // Determinar saúde geral do sistema
    const healthyComponents = Object.values(diagnosis.components)
      .filter(c => c.status === 'healthy').length;
    const totalComponents = components.length;
    const healthPercentage = (healthyComponents / totalComponents) * 100;
    
    if (healthPercentage === 100) {
      diagnosis.systemHealth = 'healthy';
    } else if (healthPercentage >= 80) {
      diagnosis.systemHealth = 'degraded';
    } else {
      diagnosis.systemHealth = 'unhealthy';
    }
    
    // Gerar recomendações
    if (diagnosis.issues.length > 0) {
      diagnosis.recommendations.push('Execute reparo dos componentes com problemas');
    }
    
    if (diagnosis.systemHealth !== 'healthy') {
      diagnosis.recommendations.push('Execute atualização do sistema');
    }
    
    diagnosis.recommendations.push('Configure backup automático regular');
    diagnosis.recommendations.push('Monitore logs de atividade periodicamente');
    
    console.log('📊 Diagnóstico concluído:', diagnosis.systemHealth);
    
    return diagnosis;
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Diagnosticar componente específico
 */
function diagnosisComponent(componentName) {
  switch (componentName) {
    case 'spreadsheet':
      try {
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        return {
          status: 'healthy',
          message: `Planilha acessível: ${spreadsheet.getName()}`,
          details: {
            id: spreadsheet.getId(),
            name: spreadsheet.getName(),
            url: spreadsheet.getUrl()
          }
        };
      } catch (error) {
        return {
          status: 'error',
          message: `Erro ao acessar planilha: ${error.message}`
        };
      }
      
    case 'sheets_structure':
      try {
        const requiredSheets = [
          'Agendamentos', 'Pacientes', 'Configuracoes', 'Logs', 'Backup'
        ];
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        const existingSheets = spreadsheet.getSheets().map(s => s.getName());
        const missingSheets = requiredSheets.filter(s => !existingSheets.includes(s));
        
        return {
          status: missingSheets.length === 0 ? 'healthy' : 'degraded',
          message: missingSheets.length === 0 ? 
            'Todas as abas obrigatórias estão presentes' : 
            `Abas faltando: ${missingSheets.join(', ')}`,
          details: {
            required: requiredSheets.length,
            existing: existingSheets.length,
            missing: missingSheets
          }
        };
      } catch (error) {
        return {
          status: 'error',
          message: `Erro ao verificar estrutura: ${error.message}`
        };
      }
      
    case 'triggers':
      try {
        const triggers = ScriptApp.getProjectTriggers();
        return {
          status: triggers.length > 0 ? 'healthy' : 'degraded',
          message: `${triggers.length} triggers configurados`,
          details: {
            count: triggers.length,
            functions: triggers.map(t => t.getHandlerFunction())
          }
        };
      } catch (error) {
        return {
          status: 'error',
          message: `Erro ao verificar triggers: ${error.message}`
        };
      }
      
    default:
      return {
        status: 'unknown',
        message: 'Componente não implementado no diagnóstico'
      };
  }
}

/**
 * Reparar sistema automaticamente
 */
function repairSystem() {
  try {
    console.log('🔧 Iniciando reparo automático do sistema...');
    
    const repairs = [];
    const errors = [];
    
    // Verificar e reparar estrutura de abas
    try {
      const structureResult = repairSheetsStructure();
      repairs.push({
        component: 'sheets_structure',
        success: structureResult.success,
        message: structureResult.message,
        details: structureResult
      });
    } catch (error) {
      errors.push({
        component: 'sheets_structure',
        error: error.message
      });
    }
    
    // Verificar e reparar triggers
    try {
      const triggersResult = SystemInstaller.createTimeTriggers();
      repairs.push({
        component: 'triggers',
        success: triggersResult.success,
        message: `${triggersResult.triggersCreated} triggers configurados`,
        details: triggersResult
      });
    } catch (error) {
      errors.push({
        component: 'triggers',
        error: error.message
      });
    }
    
    // Verificar e reparar configurações
    try {
      const configResult = repairConfigurations();
      repairs.push({
        component: 'configurations',
        success: configResult.success,
        message: configResult.message,
        details: configResult
      });
    } catch (error) {
      errors.push({
        component: 'configurations',
        error: error.message
      });
    }
    
    const successfulRepairs = repairs.filter(r => r.success).length;
    
    console.log(`🔧 Reparo concluído: ${successfulRepairs}/${repairs.length} reparos bem-sucedidos`);
    
    return {
      success: errors.length === 0,
      repairsAttempted: repairs.length,
      repairsSuccessful: successfulRepairs,
      repairsFailed: errors.length,
      repairs,
      errors,
      message: `Sistema reparado: ${successfulRepairs}/${repairs.length} componentes`
    };
    
  } catch (error) {
    console.error('❌ Erro no reparo do sistema:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reparar estrutura de abas
 */
function repairSheetsStructure() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const existingSheets = spreadsheet.getSheets().map(s => s.getName());
    const requiredSheets = [
      'Agendamentos', 'Pacientes', 'Configuracoes', 'Logs', 'Backup'
    ];
    
    const missingSheets = requiredSheets.filter(s => !existingSheets.includes(s));
    
    if (missingSheets.length === 0) {
      return {
        success: true,
        message: 'Estrutura de abas íntegra',
        sheetsCreated: 0
      };
    }
    
    // Implementar criação de abas faltantes
    const created = [];
    missingSheets.forEach(sheetName => {
      try {
        const sheet = spreadsheet.insertSheet(sheetName);
        // Configurar cabeçalhos básicos
        initializeSheet(sheet, sheetName);
        created.push(sheetName);
      } catch (error) {
        console.warn(`Erro ao criar aba ${sheetName}:`, error);
      }
    });
    
    return {
      success: true,
      message: `${created.length} abas reparadas`,
      sheetsCreated: created.length,
      sheetsRepaired: created
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reparar configurações
 */
function repairConfigurations() {
  try {
    const requiredConfigs = [
      'system_version',
      'clinic_name',
      'admin_email',
      'timezone',
      'working_hours_start',
      'working_hours_end'
    ];
    
    const missing = [];
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const configSheet = spreadsheet.getSheetByName('Configuracoes');
    
    if (!configSheet) {
      throw new Error('Aba de configurações não encontrada');
    }
    
    const data = configSheet.getDataRange().getValues();
    const existingConfigs = data.slice(1).map(row => row[0]);
    
    requiredConfigs.forEach(config => {
      if (!existingConfigs.includes(config)) {
        missing.push(config);
      }
    });
    
    if (missing.length === 0) {
      return {
        success: true,
        message: 'Configurações íntegras'
      };
    }
    
    // Adicionar configurações faltantes com valores padrão
    const defaultValues = {
      'system_version': INSTALLATION_CONFIG.SYSTEM_VERSION,
      'clinic_name': 'Clínica Dental',
      'admin_email': '',
      'timezone': 'America/Sao_Paulo',
      'working_hours_start': '08:00',
      'working_hours_end': '18:00'
    };
    
    missing.forEach(config => {
      const value = defaultValues[config] || '';
      configSheet.appendRow([
        config,
        value,
        `Configuração reparada automaticamente`,
        'Sistema',
        'string',
        true,
        new Date().toISOString(),
        'system_repair'
      ]);
    });
    
    return {
      success: true,
      message: `${missing.length} configurações reparadas`,
      configsRepaired: missing
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Resetar sistema (use com cuidado!)
 */
function resetSystem() {
  try {
    const confirm = Browser.msgBox(
      'Resetar Sistema',
      'Esta ação irá DELETAR TODOS OS DADOS do sistema. Esta ação é IRREVERSÍVEL. Deseja continuar?',
      Browser.Buttons.YES_NO
    );
    
    if (confirm !== Browser.Buttons.YES) {
      return { 
        success: false, 
        message: 'Operação cancelada pelo usuário' 
      };
    }
    
    console.log('⚠️ Iniciando reset do sistema...');
    
    // Criar backup final antes do reset
    const backupResult = createBackup();
    console.log('📦 Backup final criado:', backupResult.backupId);
    
    // Limpar todas as abas (exceto cabeçalhos)
    const sheetsToClean = [
      'Agendamentos', 'Pacientes', 'Logs', 'Backup', 'Auditoria', 'Notificacoes'
    ];
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    sheetsToClean.forEach(sheetName => {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (sheet) {
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
          }
          console.log(`🧹 Aba "${sheetName}" limpa`);
        }
      } catch (error) {
        console.error(`Erro ao limpar aba ${sheetName}:`, error);
      }
    });
    
    // Remover todos os triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    
    // Limpar cache
    try {
      const cache = CacheService.getScriptCache();
      cache.removeAll(['appointments', 'patients', 'stats', 'settings']);
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
    
    // Reconfigurar sistema básico
    const setupResult = SystemInstaller.createTimeTriggers();
    
    console.log('✅ Sistema resetado com sucesso!');
    
    return {
      success: true,
      message: 'Sistema resetado com sucesso',
      backupId: backupResult.backupId,
      sheetsCleared: sheetsToClean.length,
      triggersRecreated: setupResult.triggersCreated
    };
    
  } catch (error) {
    console.error('❌ Erro no reset:', error);
    return {
      success: false,
      error: error.message
    };
  }
}