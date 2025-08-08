/**
 * ========================================
 * SISTEMA DE NOTIFICAÇÕES AVANÇADO v3.0
 * ========================================
 */

/**
 * Configurações globais de notificação
 */
const NOTIFICATION_CONFIG = {
  EMAIL_TEMPLATES: {
    appointment_created: 'template_appointment_created',
    appointment_updated: 'template_appointment_updated', 
    appointment_cancelled: 'template_appointment_cancelled',
    appointment_confirmed: 'template_appointment_confirmed',
    reminder_today: 'template_reminder_today',
    reminder_tomorrow: 'template_reminder_tomorrow',
    reminder_week: 'template_reminder_week',
    patient_birthday: 'template_patient_birthday',
    system_backup: 'template_system_backup',
    system_error: 'template_system_error'
  },
  
  SMS_PROVIDER: {
    name: 'none', 
    apiKey: '',
    endpoint: '',
    enabled: false
  },
  
  WEBHOOK_URLS: {
    slack: '',
    discord: '', 
    teams: '',
    zapier: '',
    custom: ''
  },
  
  WHATSAPP_CONFIG: {
    businessId: '',
    accessToken: '',
    phoneNumberId: '',
    webhookVerifyToken: '',
    enabled: false
  },
  
  NOTIFICATION_RULES: {
    maxRetries: 3,
    retryDelay: 5000,
    batchSize: 10,
    cooldownPeriod: 60000,
    enableRateLimiting: true,
    maxPerHour: 100
  },
  
  PRIORITY_LEVELS: {
    LOW: 1,
    NORMAL: 2, 
    HIGH: 3,
    URGENT: 4,
    CRITICAL: 5
  }
};

/**
 * Gerenciador principal de notificações
 */
const NotificationManager = {
  
  /**
   * Enviar notificação com sistema de filas
   */
  async send(type, data, recipients = [], options = {}) {
    try {
      const notificationId = this.generateNotificationId();
      const priority = options.priority || NOTIFICATION_CONFIG.PRIORITY_LEVELS.NORMAL;
      
      logActivity('NOTIFICATION', `Iniciando envio: ${type}`, {
        id: notificationId,
        recipients,
        priority
      });
      
      // Validar dados obrigatórios
      const validation = this.validateNotificationData(type, data);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }
      
      // Verificar rate limiting
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
      }
      
      const results = [];
      const errors = [];
      
      // Processar cada tipo de destinatário
      for (const recipientType of (recipients.length > 0 ? recipients : ['email'])) {
        try {
          let result;
          
          switch (recipientType) {
            case 'email':
              result = await this.sendEmail(type, data, options);
              break;
            case 'sms':
              result = await this.sendSMS(type, data, options);
              break;
            case 'whatsapp':
              result = await this.sendWhatsApp(type, data, options);
              break;
            case 'webhook':
              result = await this.sendWebhook(type, data, options);
              break;
            case 'push':
              result = await this.sendPushNotification(type, data, options);
              break;
            default:
              throw new Error(`Tipo de destinatário não suportado: ${recipientType}`);
          }
          
          results.push({ 
            type: recipientType, 
            success: result.success,
            message: result.message,
            data: result.data || {}
          });
          
        } catch (error) {
          errors.push({
            type: recipientType,
            error: error.message
          });
          
          logError('NotificationManager.send', error, {
            notificationId,
            recipientType,
            notificationType: type
          });
        }
      }
      
      // Registrar resultado
      this.logNotificationResult(notificationId, type, results, errors);
      
      const successCount = results.filter(r => r.success).length;
      const totalSent = results.length;
      
      return {
        success: successCount > 0,
        notificationId,
        results,
        errors,
        summary: {
          sent: successCount,
          failed: errors.length,
          total: totalSent
        }
      };
      
    } catch (error) {
      logError('NotificationManager.send', error, { type, data });
      return {
        success: false,
        error: error.message,
        notificationId: null
      };
    }
  },
  
  /**
   * Enviar notificação por email com templates avançados
   */
  async sendEmail(type, data, options = {}) {
    try {
      const template = EmailTemplates[type];
      
      if (!template) {
        throw new Error(`Template de email não encontrado: ${type}`);
      }
      
      const emailData = template(data);
      
      // Determinar destinatários
      let recipients = [];
      
      // Adicionar email do paciente
      if (data.patientEmail && this.isValidEmail(data.patientEmail)) {
        recipients.push(data.patientEmail);
      }
      
      // Adicionar emails de administradores
      if (this.shouldNotifyAdmin(type)) {
        const adminEmails = this.getAdminEmails();
        recipients.push(...adminEmails);
      }
      
      // Adicionar destinatários personalizados
      if (options.customRecipients) {
        recipients.push(...options.customRecipients.filter(email => this.isValidEmail(email)));
      }
      
      // Remover duplicatas
      recipients = [...new Set(recipients)];
      
      if (recipients.length === 0) {
        return { 
          success: false, 
          message: 'Nenhum destinatário válido encontrado' 
        };
      }
      
      // Configurar opções do email
      const emailOptions = {
        to: recipients.join(','),
        subject: emailData.subject,
        htmlBody: emailData.htmlBody,
        attachments: emailData.attachments || [],
        replyTo: ConfigUtils.getSetting('reply_to_email', ''),
        name: ConfigUtils.getSetting('sender_name', 'Sistema Dental')
      };
      
      // Adicionar headers personalizados
      if (options.trackingEnabled !== false) {
        emailOptions.headers = {
          'X-Notification-Type': type,
          'X-Notification-ID': this.generateNotificationId(),
          'X-System-Version': CONFIG.VERSION || '3.0.0'
        };
      }
      
      // Enviar email
      MailApp.sendEmail(emailOptions);
      
      logActivity('EMAIL', 'Email enviado com sucesso', {
        type,
        recipients: recipients.length,
        subject: emailData.subject
      });
      
      return {
        success: true,
        message: `Email enviado para ${recipients.length} destinatário(s)`,
        data: {
          recipients: recipients,
          subject: emailData.subject,
          type: type
        }
      };
      
    } catch (error) {
      logError('NotificationManager.sendEmail', error, { type, data });
      return {
        success: false,
        message: `Erro ao enviar email: ${error.message}`
      };
    }
  },
  
  /**
   * Enviar SMS (integração com provedores)
   */
  async sendSMS(type, data, options = {}) {
    try {
      if (!NOTIFICATION_CONFIG.SMS_PROVIDER.enabled) {
        return {
          success: false,
          message: 'Provedor de SMS não configurado'
        };
      }
      
      const phoneNumber = this.normalizePhoneNumber(data.phone || data.patientPhone);
      if (!phoneNumber) {
        throw new Error('Número de telefone inválido');
      }
      
      const message = this.generateSMSMessage(type, data);
      
      // Simular envio por enquanto - implementar integração real
      console.log(`SMS enviado para ${phoneNumber}: ${message}`);
      
      logActivity('SMS', 'SMS enviado (simulado)', {
        type,
        phone: phoneNumber,
        message: message.substring(0, 50) + '...'
      });
      
      return {
        success: true,
        message: 'SMS enviado com sucesso',
        data: {
          phone: phoneNumber,
          provider: NOTIFICATION_CONFIG.SMS_PROVIDER.name
        }
      };
      
    } catch (error) {
      logError('NotificationManager.sendSMS', error, { type, data });
      return {
        success: false,
        message: `Erro ao enviar SMS: ${error.message}`
      };
    }
  },
  
  /**
   * Enviar mensagem via WhatsApp Business API
   */
  async sendWhatsApp(type, data, options = {}) {
    try {
      if (!NOTIFICATION_CONFIG.WHATSAPP_CONFIG.enabled) {
        return {
          success: false,
          message: 'WhatsApp Business API não configurado'
        };
      }
      
      const phoneNumber = this.normalizePhoneNumber(data.phone || data.patientPhone);
      if (!phoneNumber) {
        throw new Error('Número de telefone inválido');
      }
      
      const message = this.generateWhatsAppMessage(type, data);
      
      // Implementar chamada real da API do WhatsApp Business
      const whatsappResult = await this.callWhatsAppAPI(phoneNumber, message, type);
      
      if (whatsappResult.success) {
        logActivity('WHATSAPP', 'WhatsApp enviado', {
          type,
          phone: phoneNumber,
          messageId: whatsappResult.messageId
        });
        
        return {
          success: true,
          message: 'WhatsApp enviado com sucesso',
          data: whatsappResult
        };
      } else {
        throw new Error(whatsappResult.error);
      }
      
    } catch (error) {
      logError('NotificationManager.sendWhatsApp', error, { type, data });
      return {
        success: false,
        message: `Erro ao enviar WhatsApp: ${error.message}`
      };
    }
  },
  
  /**
   * Enviar webhook para integrações
   */
  async sendWebhook(type, data, options = {}) {
    try {
      const webhookUrl = options.webhookUrl || 
                        NOTIFICATION_CONFIG.WEBHOOK_URLS.slack ||
                        NOTIFICATION_CONFIG.WEBHOOK_URLS.custom;
      
      if (!webhookUrl) {
        return {
          success: false,
          message: 'URL do webhook não configurada'
        };
      }
      
      const payload = this.buildWebhookPayload(type, data, options);
      
      const response = UrlFetchApp.fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Sistema-Dental-v${CONFIG.VERSION || '3.0.0'}`,
          ...options.headers
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode >= 200 && responseCode < 300) {
        logActivity('WEBHOOK', 'Webhook enviado', {
          type,
          url: webhookUrl,
          responseCode
        });
        
        return {
          success: true,
          message: 'Webhook enviado com sucesso',
          data: {
            responseCode,
            responseText: responseText.substring(0, 200)
          }
        };
      } else {
        throw new Error(`Webhook falhou: ${responseCode} - ${responseText}`);
      }
      
    } catch (error) {
      logError('NotificationManager.sendWebhook', error, { type, data });
      return {
        success: false,
        message: `Erro ao enviar webhook: ${error.message}`
      };
    }
  },
  
  /**
   * Enviar push notification
   */
  async sendPushNotification(type, data, options = {}) {
    try {
      // Implementação futura para push notifications
      return {
        success: false,
        message: 'Push notifications não implementado ainda'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao enviar push: ${error.message}`
      };
    }
  },
  
  /**
   * Validar dados da notificação
   */
  validateNotificationData(type, data) {
    const errors = [];
    
    if (!type) {
      errors.push('Tipo de notificação é obrigatório');
    }
    
    if (!data || typeof data !== 'object') {
      errors.push('Dados da notificação são obrigatórios');
    }
    
    // Validações específicas por tipo
    switch (type) {
      case 'appointment_created':
      case 'appointment_updated':
      case 'appointment_cancelled':
        if (!data.patientName) errors.push('Nome do paciente é obrigatório');
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.time) errors.push('Horário é obrigatório');
        break;
        
      case 'reminder_today':
      case 'reminder_tomorrow':
        if (!data.patientName) errors.push('Nome do paciente é obrigatório');
        if (!data.phone && !data.patientEmail) {
          errors.push('Telefone ou email é obrigatório para lembretes');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Verificar rate limiting
   */
  checkRateLimit() {
    try {
      if (!NOTIFICATION_CONFIG.NOTIFICATION_RULES.enableRateLimiting) {
        return true;
      }
      
      const cache = CacheService.getScriptCache();
      const key = 'notification_rate_limit';
      const currentCount = parseInt(cache.get(key) || '0');
      
      if (currentCount >= NOTIFICATION_CONFIG.NOTIFICATION_RULES.maxPerHour) {
        return false;
      }
      
      cache.put(key, String(currentCount + 1), 3600); // 1 hora
      return true;
      
    } catch (error) {
      logError('checkRateLimit', error);
      return true; // Em caso de erro, permitir envio
    }
  },
  
  /**
   * Utilitários auxiliares
   */
  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  normalizePhoneNumber(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 ? cleaned : null;
  },
  
  shouldNotifyAdmin(type) {
    const adminTypes = [
      'appointment_created',
      'system_backup',
      'system_error'
    ];
    return adminTypes.includes(type);
  },
  
  getAdminEmails() {
    const adminEmail = ConfigUtils.getSetting('admin_email', '');
    const additionalEmails = ConfigUtils.getSetting('notification_emails', '');
    
    const emails = [adminEmail, ...additionalEmails.split(',')]
      .map(email => email.trim())
      .filter(email => email && this.isValidEmail(email));
    
    return [...new Set(emails)];
  },
  
  generateSMSMessage(type, data) {
    const messages = {
      'appointment_created': `🦷 Agendamento confirmado!\nPaciente: ${data.patientName}\nData: ${DataFormatter.formatDate(data.date)} às ${data.time}\nTipo: ${data.type}`,
      'reminder_today': `🔔 Lembrete: Sua consulta é HOJE às ${data.time}. ${data.patientName}, nos vemos em breve!`,
      'reminder_tomorrow': `📅 Lembrete: Sua consulta é AMANHÃ às ${data.time}. ${data.patientName}, não se esqueça!`
    };
    
    return messages[type] || `Notificação: ${type}`;
  },
  
  generateWhatsAppMessage(type, data) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Clínica Dental');
    
    const messages = {
      'appointment_created': `🦷 *${clinicName}*\n\n✅ *Agendamento Confirmado!*\n\n👤 Paciente: ${data.patientName}\n📅 Data: ${DataFormatter.formatDate(data.date)}\n🕐 Horário: ${data.time}\n🔍 Tipo: ${data.type}\n\nObrigado por escolher nossos serviços! 😊`,
      
      'reminder_today': `🔔 *Lembrete - ${clinicName}*\n\nOlá ${data.patientName}!\n\nSua consulta é *HOJE* às *${data.time}*.\n\n⏰ Chegue 15 minutos antes\n📋 Traga documento com foto\n\nNos vemos em breve! 😊`,
      
      'reminder_tomorrow': `📅 *Lembrete - ${clinicName}*\n\nOlá ${data.patientName}!\n\nSua consulta é *AMANHÃ* às *${data.time}*.\n\n⏰ Não se esqueça!\n📋 Traga documento com foto\n\nTe esperamos! 😊`
    };
    
    return messages[type] || `📢 Notificação do ${clinicName}`;
  },
  
  buildWebhookPayload(type, data, options) {
    const basePayload = {
      event: type,
      timestamp: new Date().toISOString(),
      source: 'sistema-dental',
      version: CONFIG.VERSION || '3.0.0',
      data: data
    };
    
    // Payload específico para Slack
    if (options.platform === 'slack' || NOTIFICATION_CONFIG.WEBHOOK_URLS.slack) {
      return {
        text: `🦷 Sistema de Agendamento`,
        attachments: [{
          color: this.getColorByType(type),
          title: this.getWebhookTitle(type),
          fields: [
            {
              title: 'Paciente',
              value: data.patientName,
              short: true
            },
            {
              title: 'Data/Hora',
              value: `${DataFormatter.formatDate(data.date)} às ${data.time}`,
              short: true
            },
            {
              title: 'Tipo',
              value: data.type,
              short: true
            },
            {
              title: 'Status',
              value: data.status,
              short: true
            }
          ],
          timestamp: new Date().toISOString()
        }]
      };
    }
    
    return basePayload;
  },
  
  async callWhatsAppAPI(phoneNumber, message, type) {
    try {
      // Implementação da API do WhatsApp Business
      // Por enquanto simulado
      return {
        success: true,
        messageId: 'wa_' + Date.now(),
        status: 'sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  getColorByType(type) {
    const colors = {
      appointment_created: '#36a64f',
      appointment_updated: '#ffaa00',
      appointment_cancelled: '#ff0000',
      appointment_confirmed: '#36a64f',
      reminder_today: '#0099cc',
      reminder_tomorrow: '#9966cc',
      system_backup: '#2eb886',
      system_error: '#ff4444'
    };
    
    return colors[type] || '#cccccc';
  },
  
  getWebhookTitle(type) {
    const titles = {
      appointment_created: '✅ Novo Agendamento Criado',
      appointment_updated: '📝 Agendamento Atualizado',
      appointment_cancelled: '❌ Agendamento Cancelado',
      appointment_confirmed: '✅ Agendamento Confirmado',
      reminder_today: '🔔 Lembrete: Consulta Hoje',
      reminder_tomorrow: '📅 Lembrete: Consulta Amanhã',
      system_backup: '💾 Backup do Sistema',
      system_error: '🚨 Erro do Sistema'
    };
    
    return titles[type] || '📢 Notificação';
  },
  
  logNotificationResult(notificationId, type, results, errors) {
    try {
      logActivity('NOTIFICATION_RESULT', 'Resultado do envio', {
        notificationId,
        type,
        successCount: results.filter(r => r.success).length,
        errorCount: errors.length,
        results,
        errors
      });
    } catch (error) {
      console.error('Erro ao registrar resultado da notificação:', error);
    }
  }
};

/**
 * Templates de email expandidos e responsivos
 */
const EmailTemplates = {
  
  /**
   * Template para novo agendamento
   */
  appointment_created(data) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Clínica Dental Premium');
    const clinicAddress = ConfigUtils.getSetting('clinic_address', '');
    const clinicPhone = ConfigUtils.getSetting('clinic_phone', '');
    
    return {
      subject: `✅ Agendamento Confirmado - ${clinicName}`,
      htmlBody: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agendamento Confirmado</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .appointment-card { background: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .info-item { padding: 15px; background: #f8fafc; border-radius: 6px; }
                .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
                .btn { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 10px; }
                @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🦷 ${clinicName}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Agendamento Confirmado</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Olá, ${data.patientName}!</h2>
                    
                    <p style="font-size: 18px; line-height: 1.6; color: #374151;">
                        Seu agendamento foi <strong>confirmado com sucesso</strong>! Aqui estão os detalhes:
                    </p>
                    
                    <div class="appointment-card">
                        <h3 style="margin-top: 0; color: #10b981; font-size: 20px;">📋 Detalhes do Agendamento</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>📅 Data:</strong><br>${DataFormatter.formatDate(data.date)}
                            </div>
                            <div class="info-item">
                                <strong>🕐 Horário:</strong><br>${data.time}
                            </div>
                            <div class="info-item">
                                <strong>🔍 Tipo:</strong><br>${data.type}
                            </div>
                            <div class="info-item">
                                <strong>⏱️ Duração:</strong><br>${DataFormatter.formatDuration(data.duration)}
                            </div>
                        </div>
                        ${data.notes ? `<p><strong>📝 Observações:</strong><br>${data.notes}</p>` : ''}
                    </div>
                    
                    <div style="background: #dbeafe; padding: 25px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #1e40af;">📝 Importante - Leia com Atenção:</h3>
                        <ul style="line-height: 1.8; color: #1e40af;">
                            <li>Chegue <strong>15 minutos antes</strong> do horário marcado</li>
                            <li>Traga <strong>documento com foto</strong> (RG, CNH ou Passaporte)</li>
                            <li>Informe sobre medicamentos em uso ou alergias</li>
                            <li>Em caso de cancelamento, avise com <strong>24h de antecedência</strong></li>
                            <li>Para reagendamento, entre em contato conosco</li>
                        </ul>
                    </div>
                    
                    ${clinicAddress ? `
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #374151;">📍 Localização:</h4>
                        <p style="margin: 0; color: #6b7280;">${clinicAddress}</p>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 40px 0;">
                        ${clinicPhone ? `
                        <a href="tel:${clinicPhone}" class="btn" style="color: white;">
                            📞 Ligar para Clínica
                        </a>
                        ` : ''}
                        ${data.phone ? `
                        <a href="https://wa.me/55${data.phone.replace(/\D/g, '')}" class="btn" style="color: white; background: #25d366;">
                            💬 WhatsApp
                        </a>
                        ` : ''}
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>${clinicName}</strong></p>
                    <p>Agendado em ${new Date().toLocaleString('pt-BR')}</p>
                    <p style="font-size: 12px; opacity: 0.7;">Este é um email automático. Por favor, não responda.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      attachments: []
    };
  },
  
  /**
   * Template para agendamento atualizado
   */
  appointment_updated(data) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Clínica Dental Premium');
    
    return {
      subject: `📝 Agendamento Atualizado - ${clinicName}`,
      htmlBody: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agendamento Atualizado</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fffbeb; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .update-card { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .changes-list { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🦷 ${clinicName}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Agendamento Atualizado</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Olá, ${data.patientName}!</h2>
                    
                    <p style="font-size: 18px; line-height: 1.6;">
                        Seu agendamento foi <strong>atualizado</strong>. Confira os novos detalhes:
                    </p>
                    
                    <div class="update-card">
                        <h3 style="margin-top: 0; color: #f59e0b;">📋 Novos Detalhes:</h3>
                        <ul style="line-height: 1.8; font-size: 16px;">
                            <li><strong>📅 Data:</strong> ${DataFormatter.formatDate(data.date)}</li>
                            <li><strong>🕐 Horário:</strong> ${data.time}</li>
                            <li><strong>🔍 Tipo:</strong> ${data.type}</li>
                            <li><strong>📊 Status:</strong> ${data.status}</li>
                            <li><strong>⏱️ Duração:</strong> ${DataFormatter.formatDuration(data.duration)}</li>
                            ${data.notes ? `<li><strong>📝 Observações:</strong> ${data.notes}</li>` : ''}
                        </ul>
                    </div>
                    
                    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #1e40af; margin: 0; font-weight: 600;">
                            💡 Se você tiver dúvidas sobre as alterações, entre em contato conosco.
                        </p>
                    </div>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px;">
                    <p><strong>${clinicName}</strong></p>
                    <p>Atualizado em ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  },
  
  /**
   * Template para agendamento cancelado
   */
  appointment_cancelled(data) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Clínica Dental Premium');
    const clinicPhone = ConfigUtils.getSetting('clinic_phone', '');
    
    return {
      subject: `❌ Agendamento Cancelado - ${clinicName}`,
      htmlBody: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agendamento Cancelado</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fef2f2; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .cancel-card { background: #fef2f2; border-left: 4px solid #ef4444; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .reschedule-section { background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🦷 ${clinicName}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Agendamento Cancelado</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Olá, ${data.patientName}</h2>
                    
                    <p style="font-size: 18px; line-height: 1.6;">
                        Informamos que seu agendamento foi <strong>cancelado</strong>:
                    </p>
                    
                    <div class="cancel-card">
                        <h3 style="margin-top: 0; color: #ef4444;">📋 Agendamento Cancelado:</h3>
                        <ul style="line-height: 1.8; font-size: 16px;">
                            <li><strong>📅 Data:</strong> ${DataFormatter.formatDate(data.date)}</li>
                            <li><strong>🕐 Horário:</strong> ${data.time}</li>
                            <li><strong>🔍 Tipo:</strong> ${data.type}</li>
                            <li><strong>📅 Cancelado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</li>
                        </ul>
                        ${data.cancelReason ? `<p><strong>Motivo:</strong> ${data.cancelReason}</p>` : ''}
                    </div>
                    
                    <div class="reschedule-section">
                        <h3 style="color: #059669; margin-top: 0;">💚 Gostaria de Reagendar?</h3>
                        <p style="font-size: 16px; margin-bottom: 25px;">
                            Estamos aqui para atendê-lo! Entre em contato para marcar uma nova consulta.
                        </p>
                        ${clinicPhone ? `
                        <a href="tel:${clinicPhone}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                            📞 Ligar Agora
                        </a>
                        ` : ''}
                        ${data.phone ? `
                        <a href="https://wa.me/55${data.phone.replace(/\D/g, '')}" style="display: inline-block; background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                            💬 WhatsApp
                        </a>
                        ` : ''}
                    </div>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px;">
                    <p><strong>${clinicName}</strong></p>
                    <p>Cancelado em ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  },
  
  /**
   * Template para lembrete do dia
   */
  reminder_today(data) {
    const clinicName = ConfigUtils.getSetting('clinic_name', 'Clínica Dental Premium');
    const clinicAddress = ConfigUtils.getSetting('clinic_address', '');
    
    return {
      subject: `🔔 Lembrete: Sua consulta é HOJE - ${clinicName}`,
      htmlBody: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lembrete - Consulta Hoje</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #eff6ff; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .reminder-card { background: #dbeafe; border-left: 4px solid #0ea5e9; padding: 25px; border-radius: 8px; margin: 25px 0; }
                .urgent-notice { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 32px;">🔔 LEMBRETE</h1>
                    <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold;">Sua consulta é HOJE!</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">${clinicName}</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Olá, ${data.patientName}!</h2>
                    
                    <div class="urgent-notice">
                        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #d97706; text-align: center;">
                            ⏰ SUA CONSULTA É HOJE ÀS ${data.time}
                        </p>
                    </div>
                    
                    <div class="reminder-card">
                        <h3 style="margin-top: 0; color: #0ea5e9;">📋 Detalhes da Consulta:</h3>
                        <ul style="line-height: 1.8; font-size: 18px; font-weight: 500;">
                            <li><strong>📅 Data:</strong> HOJE (${DataFormatter.formatDate(data.date)})</li>
                            <li><strong>🕐 Horário:</strong> ${data.time}</li>
                            <li><strong>🔍 Tipo:</strong> ${data.type}</li>
                            <li><strong>⏱️ Duração:</strong> ${DataFormatter.formatDuration(data.duration)}</li>
                        </ul>
                    </div>
                    
                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #059669;">✅ Checklist Importante:</h3>
                        <ul style="line-height: 1.8; color: #065f46; font-size: 16px;">
                            <li>✓ Chegue <strong>15 minutos antes</strong> (às ${this.calculateArrivalTime(data.time)})</li>
                            <li>✓ Traga <strong>documento com foto</strong></li>
                            <li>✓ Informe sobre medicamentos ou alergias</li>
                            <li>✓ Confirme sua presença</li>
                        </ul>
                    </div>
                    
                    ${clinicAddress ? `
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #374151;">📍 Localização:</h4>
                        <p style="margin: 0; color: #6b7280; font-size: 16px;">${clinicAddress}</p>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <p style="font-size: 18px; margin-bottom: 20px; color: #374151;">
                            <strong>Alguma dúvida? Entre em contato:</strong>
                        </p>
                        <a href="tel:${data.phone}" style="display: inline-block; background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
                            📞 Ligar para Clínica
                        </a>
                    </div>
                </div>
                
                <div style="background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px;">
                    <p><strong>${clinicName}</strong></p>
                    <p>Te esperamos hoje! 😊</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
  },
  
  /**
   * Calcular horário de chegada (15 minutos antes)
   */
  calculateArrivalTime(timeStr) {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 15;
      const arrivalHours = Math.floor(totalMinutes / 60);
      const arrivalMinutes = totalMinutes % 60;
      return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
    } catch (error) {
      return timeStr;
    }
  }
};

/**
 * Configurar sistema de notificações
 */
function setupNotifications() {
  try {
    console.log('🔔 Configurando sistema de notificações...');
    
    // Verificar configurações obrigatórias
    const requiredSettings = {
      'admin_email': 'Email do administrador',
      'clinic_name': 'Nome da clínica',
      'notifications_enabled': 'Notificações habilitadas',
      'email_notifications_enabled': 'Notificações por email habilitadas'
    };
    
    const missingSettings = [];
    
    Object.keys(requiredSettings).forEach(key => {
      const value = ConfigUtils.getSetting(key);
      if (!value) {
        missingSettings.push(requiredSettings[key]);
      }
    });
    
    // Configurar valores padrão
    const defaultSettings = [
      ['notifications_enabled', 'true', 'Notificações habilitadas'],
      ['email_notifications_enabled', 'true', 'Notificações por email'],
      ['sms_notifications_enabled', 'false', 'Notificações por SMS'],
      ['whatsapp_notifications_enabled', 'false', 'Notificações por WhatsApp'],
      ['webhook_notifications_enabled', 'false', 'Notificações via webhook'],
      ['notification_rate_limit', '100', 'Limite de notificações por hora'],
      ['notification_retry_attempts', '3', 'Tentativas de reenvio'],
      ['sender_name', 'Sistema Dental', 'Nome do remetente'],
      ['reply_to_email', '', 'Email para resposta']
    ];
    
    defaultSettings.forEach(([key, value, description]) => {
      if (!ConfigUtils.getSetting(key)) {
        ConfigUtils.setSetting(key, value, description);
      }
    });
    
    if (missingSettings.length > 0) {
      console.warn('⚠️ Configurações faltando:', missingSettings);
    }
    
    console.log('✅ Sistema de notificações configurado');
    
    return {
      success: true,
      missingSettings: missingSettings,
      message: 'Sistema de notificações configurado com sucesso'
    };
    
  } catch (error) {
    logError('setupNotifications', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Testar sistema de notificações
 */
function testNotifications() {
  try {
    console.log('🧪 Testando sistema de notificações...');
    
    const testData = {
      patientName: 'Paciente Teste',
      patientEmail: ConfigUtils.getSetting('admin_email', ''),
      phone: '11987654321',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'Consulta Teste',
      duration: '60',
      status: 'Confirmado',
      notes: 'Teste automático do sistema de notificações'
    };
    
    const result = NotificationManager.send('appointment_created', testData, ['email']);
    
    console.log('📧 Resultado do teste:', result);
    
    logActivity('TEST', 'Teste de notificações executado', {
      success: result.success,
      testData: testData
    });
    
    return result;
    
  } catch (error) {
    logError('testNotifications', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Processar fila de notificações (para uso com triggers)
 */
function processNotificationQueue() {
  try {
    // Implementar sistema de filas para grandes volumes
    console.log('📤 Processando fila de notificações...');
    
    // Por enquanto apenas log
    logActivity('QUEUE', 'Fila de notificações processada');
    
    return {
      success: true,
      processed: 0,
      failed: 0
    };
    
  } catch (error) {
    logError('processNotificationQueue', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter estatísticas de notificações
 */
function getNotificationStats() {
  try {
    const cache = CacheService.getScriptCache();
    const rateLimitCount = parseInt(cache.get('notification_rate_limit') || '0');
    
    return {
      success: true,
      stats: {
        rateLimitCount: rateLimitCount,
        maxPerHour: NOTIFICATION_CONFIG.NOTIFICATION_RULES.maxPerHour,
        remainingQuota: NOTIFICATION_CONFIG.NOTIFICATION_RULES.maxPerHour - rateLimitCount,
        providersEnabled: {
          email: ConfigUtils.getSetting('email_notifications_enabled', 'true') === 'true',
          sms: ConfigUtils.getSetting('sms_notifications_enabled', 'false') === 'true',
          whatsapp: ConfigUtils.getSetting('whatsapp_notifications_enabled', 'false') === 'true',
          webhook: ConfigUtils.getSetting('webhook_notifications_enabled', 'false') === 'true'
        }
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exportar configurações do sistema de notificações
 */
function exportNotificationConfig() {
  try {
    const config = {
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION || '3.0.0',
      settings: {
        notifications_enabled: ConfigUtils.getSetting('notifications_enabled'),
        email_enabled: ConfigUtils.getSetting('email_notifications_enabled'),
        sms_enabled: ConfigUtils.getSetting('sms_notifications_enabled'),
        whatsapp_enabled: ConfigUtils.getSetting('whatsapp_notifications_enabled'),
        webhook_enabled: ConfigUtils.getSetting('webhook_notifications_enabled'),
        rate_limit: ConfigUtils.getSetting('notification_rate_limit'),
        retry_attempts: ConfigUtils.getSetting('notification_retry_attempts'),
        sender_name: ConfigUtils.getSetting('sender_name'),
        admin_email: ConfigUtils.getSetting('admin_email')
      },
      templates: Object.keys(EmailTemplates),
      providers: NOTIFICATION_CONFIG.SMS_PROVIDER,
      webhooks: NOTIFICATION_CONFIG.WEBHOOK_URLS
    };
    
    return {
      success: true,
      config: config,
      exportedAt: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}