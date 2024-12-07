import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EnterpriseService extends PrismaClient implements OnModuleInit {

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
  
  async getEnterpriseWithPricingPlan(enterpriseId: string) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: enterpriseId, available: true },
        include: { pricingPlan: true }
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      return enterprise;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateEnterpriseWithPlan(enterpriseDto: UpdateEnterpriseDto) {
    try {
      const { id, ...data } = enterpriseDto;

      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id: enterpriseDto.pricingPlanId, available: true }
      });

      if (!pricingPlan) {
        throw new HttpException('Pricing plan not found', HttpStatus.NOT_FOUND);
      }

      const enterprise = await this.enterprises.findFirst({
        where: { id: enterpriseDto.id, available: true }
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      return await this.enterprises.update({
        where: { id: enterprise.id },
        data: data
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createEnterpriseDto: CreateEnterpriseDto) {
    try {
      return await this.enterprises.create({ data: createEnterpriseDto });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      return await this.enterprises.findMany({ where: { available: true } });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const enterprise = await this.enterprises.findFirst({ where: { id: id, available: true } });
      
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      return enterprise;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const data = await this.findOne(id);

      if (!data) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      return await this.enterprises.update({
        where: { id: id },
        data: { deletedAt: new Date(Date.now()), available: false }
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
