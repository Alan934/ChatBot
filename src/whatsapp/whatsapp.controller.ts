import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendMessageDto, MessageResponseDto } from './dto/send-message.dto';
import { StatusResponseDto } from './dto/status-response.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de la conexión' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la conexión obtenido correctamente',
    type: StatusResponseDto,
  })
  getStatus(): StatusResponseDto {
    return this.whatsappService.getConnectionStatus();
  }

  @Get('qr')
async getQR(
  @Res() res: Response, 
  @Query('force') force?: boolean,
  @Query('profileId') profileId?: string,
) {
  try {
    if (!profileId) {
      return res.status(400).json({ message: 'Se requiere un profileId' });
    }

    if (force) {
      await this.whatsappService.forceQRRegeneration(profileId);
    }

    const qr = await this.whatsappService.getCurrentQR(profileId);
    if (qr) {
      return res.json({ qr, source: 'service' });
    }

    return res.status(404).json({ message: 'QR no disponible' });
  } catch (error) {
    console.error(`Error al obtener QR para perfil ${profileId}: ${error.message}`);
    return res.status(500).json({ message: 'Error crítico al obtener el código QR' });
  }
}


  @Post('send')
  @ApiOperation({ summary: 'Enviar mensaje de WhatsApp' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Mensaje enviado correctamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error al enviar el mensaje',
    type: MessageResponseDto,
  })
  async sendMessage(@Body() body: SendMessageDto): Promise<MessageResponseDto> {
    return this.whatsappService.sendMessage(body.number, body.message);
  }

  @Post('assign-flow')
  @ApiOperation({ summary: 'Asignar un flujo a un perfil' })
  async assignFlow(
    @Body('profileId') profileId: string,
    @Body('flowId') flowId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.whatsappService.assignFlowToProfile(profileId, flowId);
  }

}
