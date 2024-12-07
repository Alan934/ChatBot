import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClientService extends PrismaClient implements OnModuleInit {

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async getAllClientsForEnterprise(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: {
          id: idEnterprise,
          available: true,
        }
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const clients = await this.clients.findMany({
        where: {
          enterpriseId: enterprise.id,
          available: true,
        }
      });
  
      if (clients.length === 0) {
        throw new HttpException(`Clients not found for Enterprise with id: ${enterprise.id}`, HttpStatus.NOT_FOUND);
      }
  
      return clients;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getClientById(id: string, idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: {
          id: idEnterprise,
          available: true,
        }
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const client = await this.clients.findUnique({
        where: {
          id,
          enterpriseId: enterprise.id,
          available: true,
        }
      });
  
      if (!client) {
        throw new HttpException(`Client not found for Enterprise with id: ${enterprise.id}`, HttpStatus.NOT_FOUND);
      }
  
      return client;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createClient(createClientDto: CreateClientDto) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: {
          id: createClientDto.enterpriseId,
          available: true,
        }
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const client = await this.clients.create({
        data: {
          username: createClientDto.username,
          phone: createClientDto.phone,
          enterpriseId: enterprise.id,
          available: true,
        },
        include: {
          enterprise: true,
        }
      });
  
      return client;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllDeletedClients(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: {
          id: idEnterprise,
          available: true,
        }
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const clients = await this.clients.findMany({
        where: {
          enterpriseId: enterprise.id,
          available: false,
        }
      });
  
      if (clients.length === 0) {
        throw new HttpException(`Deleted Clients not found for Enterprise with id: ${enterprise.id}`, HttpStatus.NOT_FOUND);
      }
  
      return clients;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateClient(id: string, updateClientDto: UpdateClientDto) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: {
          id: updateClientDto.enterpriseId,
          available: true,
        }
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
      
      const client = await this.clients.findUnique({
        where: {
          id,
          enterpriseId: enterprise.id,
          available: true,
        }
      });
  
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
  
      const updatedClient = await this.clients.update({
        where: {
          id,
        },
        data: {
          username: updateClientDto.username,
          phone: updateClientDto.phone,
          enterpriseId: enterprise.id,
        },
        include: {
          enterprise: true,
        }
      });
  
      return updatedClient;      
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: string) {
    try {
      const client = await this.clients.findUnique({
        where: {
          id,
          available: true,
        }
      });
  
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
  
      const deletedClient = await this.clients.update({
        where: {
          id,
        },
        data: {
          available: false,
        },
        include: {
          enterprise: true,
        }
      });
  
      return { message: `Client with ID ${deletedClient.id} has been deleted successfully` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async restoreClient(id: string) {
    try {
      const client = await this.clients.findUnique({
        where: {
          id,
          available: false,
        }
      });
  
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
  
      const restoredClient = await this.clients.update({
        where: {
          id,
        },
        data: {
          available: true,
        },
        include: {
          enterprise: true,
        }
      });
  
      return { message: `Client with ID ${restoredClient.id} has been restored successfully` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
