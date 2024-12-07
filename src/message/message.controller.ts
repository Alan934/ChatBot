import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ProfileService } from '../profile/profile.service';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Option, TypeMessage } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('message')
@ApiTags('Message')
export class MessageController {
  constructor(private readonly messageService: MessageService, private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBody({
    type: CreateMessageDto,
  examples: {
    example: {
      value: {
        numOrder: 1,
        name: "Message name",
        body: "Message body",
        option: `${Option.MENU}`,
        typeMessage: `${TypeMessage.NAME}`,
        showName: true,
        enterpriseId: "9a8d897f-699a-454a-978f-789a897f699a",
        flowId: "b517b60e-8360-4578-9087-83604578b517",
        parentMessageId: "517b60e-8360-4578-9087-83604578b517"
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      createMessageDto.enterpriseId = idEnterprise;
      return this.messageService.createMessage(createMessageDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getAllWithFlow')
  @ApiBearerAuth('bearerAuth')
  async findAllMessages(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findAllMessages(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getAllMain')
  @ApiBearerAuth('bearerAuth')
  async findAllMainMessages(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findAllMainMessages(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getAllDeleted')
  @ApiBearerAuth('bearerAuth')
  async getAllDeletedMessages(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.getAllDeletedMessages(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/findJustOne/:id')
  @ApiBearerAuth('bearerAuth')
  async findOne(@Param('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findMessageById(id, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/flow/:flowId')
  @ApiBearerAuth('bearerAuth')
  async findAllMessagesByFlow(@Param('flowId') idFlow: string, @Query('numOrder') numOrder: number, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findAllMessagesByNumOrder(idEnterprise, idFlow, numOrder);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('flowName/:flowName')
  @ApiBearerAuth('bearerAuth')
  async findAllMessagesByNumOrderAndFlowByName(@Param('flowName') flowName: string, @Query('numOrder') numOrder: number, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findAllMessagesByNumOrderAndFlowByName(idEnterprise, flowName, numOrder);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('messagesRecursive')
  @ApiBearerAuth('bearerAuth')
  async getMessagesRecursive(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findMessagesWithMessages(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/messageWithMessages/:id')
  @ApiBearerAuth('bearerAuth')
  async getOneWithMessages(@Query('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.getOneWithMessages(id, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getMessagesWithMenu')
  @ApiBearerAuth('bearerAuth')
  async getMessagesWithMenuMessages(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.getMessagesWithMenuMessages(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getMessageWithMenu/:id')
  @ApiBearerAuth('bearerAuth')
  async getOneWithMenuMessages(@Query('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.getOneWithMenuMessages(id, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBody({
    type: CreateMessageDto,
  examples: {
    example: {
      value: {
        numOrder: 1,
        name: "Message name",
        body: "Message body",
        option: `${Option.MENU}`,
        typeMessage: `${TypeMessage.NAME}`,
        showName: true,
        enterpriseId: "idEnterprise",
        flowId: "idFlow",
        parentMessageId: "null OR parentId"
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      updateMessageDto.enterpriseId = idEnterprise;
      return this.messageService.updateMessage({id:id, ...updateMessageDto});
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async remove(@Param('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      await this.messageService.deleteMessageByEnterprise(id, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('restoreMessage/:id')
  @ApiBearerAuth('bearerAuth')
  async restoreMessage(@Param('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.restoreDeletedMessage(id, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
 
  @UseGuards(AuthGuard)
  @Get('findAllMainMessagesWithIdFlow/:idFlow')
  @ApiBearerAuth('bearerAuth')
  async findAllMainMessagesWithIdFlow(@Param('idFlow') idFlow: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.messageService.findAllMainMessagesWithIdFlow(idEnterprise, idFlow);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
