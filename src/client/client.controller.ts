import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ProfileService } from 'src/profile/profile.service';

@Controller('client')
@ApiTags('Client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly profileService: ProfileService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiBearerAuth('bearerAuth')
  async getAllEntitiesForAEnterprise(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.clientService.getAllClientsForEnterprise(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('deleted')
  @ApiBearerAuth('bearerAuth')
  async getAllDeletedEntitiesForAEnterprise(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.clientService.getAllDeletedClients(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':idClient')
  @ApiBearerAuth('bearerAuth')
  async getByIdEntityForAEnterprise(@Req() req, @Param('idClient') idClient: string) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return this.clientService.getClientById(idEnterprise, idClient);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBody({
    type: CreateClientDto,
  examples: {
    example: {
      value: {
        username: "Client name",
        phone: "26121164"
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async createEntityForAEnterprise(@Req() req, @Body() createClientDto: CreateClientDto) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      createClientDto.enterpriseId = idEnterprise;
      return this.clientService.createClient(createClientDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':idClient')
  @ApiBody({
    type: CreateClientDto,
  examples: {
    example: {
      value: {
        username: "Client name",
        phone: "26121164"
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async updateEntityForAEnterprise(
    @Req() req,
    @Param('idClient') idClient: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      updateClientDto.enterpriseId = idEnterprise;
      return this.clientService.updateClient(idClient, updateClientDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('softdelete/:idClient')
  @ApiBearerAuth('bearerAuth')
  async logicDeleteForAEnterprise(@Param('idClient') idClient: string) {
    try {
      return this.clientService.softDelete(idClient);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('restore/:idClient')
  @ApiBearerAuth('bearerAuth')
  async restoreLogicDeletedForAEnterprise(@Param('idClient') idClient: string) {
    try {
      return this.clientService.restoreClient(idClient);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
