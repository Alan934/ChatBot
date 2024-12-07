import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as makeWASocket from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as path from 'path';
import * as fs from 'fs';
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class WhatsappService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private client: any;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private currentQR: string | null = null;
  private qrGenerationAttempts = 0;
  private readonly MAX_QR_ATTEMPTS = 3;

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      qrAvailable: !!this.currentQR,
      qrGenerationAttempts: this.qrGenerationAttempts,
      timestamp: new Date().toISOString(),
    };
  }

  async sendMessage(number: string, message: string) {
    if (!this.client || this.connectionStatus !== 'connected') {
      throw new Error('WhatsApp no está conectado');
    }

    const formattedNumber = number.includes('@s.whatsapp.net')
      ? number
      : `${number.replace(/[^\d]/g, '')}@s.whatsapp.net`;

    try {
      await this.client.sendMessage(formattedNumber, { text: message });
      return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
      this.logger.error(`Error enviando mensaje: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getCurrentQR(profileId: string): Promise<string | null> {
    if (this.qrGenerationAttempts >= this.MAX_QR_ATTEMPTS) {
      this.logger.error('Máximo de intentos de generación de QR alcanzado');
      return null;
    }
  
    if (!this.currentQR) {
      await this.forceQRRegeneration(profileId);
    }
  
    this.qrGenerationAttempts++;
    return this.currentQR;
  }

  private async saveQRCode(profileId: string, qr: string) {
    const chatbot = await this.chatbots.findFirst({
      where: { profiles: { some: { id: profileId } } },
    });
  
    if (!chatbot) throw new Error('Chatbot no encontrado');
  
    await this.chatbots.update({
      where: { id: chatbot.id },
      data: { qrCode: qr },
    });
  }

  private async updateChatbotStatus(profileId: string, connected: boolean) {
    const chatbot = await this.chatbots.findFirst({
      where: { profiles: { some: { id: profileId } } },
    });
  
    if (!chatbot) throw new Error('Chatbot no encontrado');
  
    await this.chatbots.update({
      where: { id: chatbot.id },
      data: { connected },
    });
  }

  async assignFlowToProfile(profileId: string, flowId: string) {
    try {
      const profileWithFlows = await this.profiles.findUnique({
        where: { id: profileId },
        include: { chatbot: { include: { flow: true } } },
      });
    
      if (!profileWithFlows) {
        throw new Error('Perfil no encontrado');
      }
    
      const flowCount = profileWithFlows.chatbot?.flow ? 1 : 0;
      if (flowCount >= 3) {
        throw new Error('El perfil ya tiene el número máximo permitido de flujos asignados (3)');
      }
    
      await this.chatbots.update({
        where: { id: profileWithFlows.chatbot?.id },
        data: { flow: { connect: { id: flowId } } },
      });
    
      return { success: true, message: 'Flujo asignado correctamente' };
    } catch (error) {
      this.logger.error(`Error al asignar un flujo para el chatbot del perfil: ${error.message}`);
      throw error;
    }

  }

  async forceQRRegeneration(profileId: string) {
    try {
      this.logger.log(`Forzando regeneración de QR para perfil ${profileId}`);
  
      const profile = await this.profiles.findUnique({ where: { id: profileId } });
      if (!profile) throw new Error(`Perfil con ID ${profileId} no encontrado`);
  
      if (this.client && this.connectionStatus === 'connected') {
        try {
          this.client.ev.removeAllListeners();
          await this.client.logout();
          this.logger.log(`Sesión anterior cerrada para perfil ${profileId}`);
        } catch (error) {
          this.logger.warn(`Error al cerrar sesión anterior: ${error.message}`);
        }
      }
      
      if (this.qrGenerationAttempts >= this.MAX_QR_ATTEMPTS) {
        this.logger.error('Máximo de intentos de generación de QR alcanzado');
        return null;
      }
  
      const authPath = path.join(process.cwd(), `auth_info_${profileId}`);
      if (fs.existsSync(authPath)) {
        // Eliminamos las credenciales directamente
        fs.rmSync(authPath, { recursive: true });
        this.logger.log(`Credenciales eliminadas para perfil ${profileId}`);
      }
  
      this.connectionStatus = 'disconnected';
      this.currentQR = null;
  
      await this.connectToWhatsApp(profileId);
    } catch (error) {
      this.logger.error(`Error al regenerar QR para perfil ${profileId}: ${error.message}`);
      throw error;
    }
  }
  

  async connectToWhatsApp(profileId: string) {
    try {
      const profile = await this.profiles.findUnique({ where: { id: profileId } });
      if (!profile) throw new Error('Perfil no encontrado');
  
      this.connectionStatus = 'connecting';
      const authPath = path.join(process.cwd(), `auth_info_${profileId}`);
  
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true });
        this.logger.log(`Credenciales eliminadas para perfil ${profileId}`);
      }
  
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
  
      if (this.client) {
        try {
          await this.client.logout();
          this.logger.log('Cliente desconectado correctamente');
        } catch (error) {
          this.logger.error(`Error al desconectar cliente: ${error.message}`);
        } finally {
          this.client = null;
          this.connectionStatus = 'disconnected';
        }
      }
  
      this.client = makeWASocket.default({
        auth: state,
        printQRInTerminal: false,
      });
  
      this.client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
  
        if (qr) {
          this.currentQR = qr;
          await this.saveQRCode(profileId, qr);
        }
  
        if (connection === 'open') {
          this.connectionStatus = 'connected';
          this.currentQR = null;
          await this.updateChatbotStatus(profileId, true);
          this.logger.log(`Conexión establecida para perfil ${profileId}`);
          this.qrGenerationAttempts = 0;
        } else if (connection === 'close') {
          const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
          this.logger.warn(`Conexión cerrada (${reason}) para perfil ${profileId}`);
          
          if (reason === DisconnectReason.loggedOut) {
            this.logger.error('Sesión cerrada manualmente, no se intentará reconectar');
            await this.updateChatbotStatus(profileId, false);
            this.client = null;
            return;
          }
  
          if (this.qrGenerationAttempts < this.MAX_QR_ATTEMPTS) {
            this.logger.log('Intentando reconectar...');
            setTimeout(() => this.connectToWhatsApp(profileId), 5000);
          } else {
            this.logger.error('Reconexión fallida después de múltiples intentos');
            await this.updateChatbotStatus(profileId, false);
          }
        }
      });
  
      this.client.ev.on('creds.update', saveCreds);
    } catch (error) {
      this.logger.error(`Error al conectar con WhatsApp para perfil ${profileId}: ${error.message}`);
      throw error;
    }
  }
  
  
}
