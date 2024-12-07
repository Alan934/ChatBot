import { Injectable, NotFoundException, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PricingPlanService extends PrismaClient implements OnModuleInit {

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async create(createPricingPlanDto: CreatePricingPlanDto) {
    try {
      return await this.pricing_plans.create({
        data: createPricingPlanDto,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll() {
    try {
      return await this.pricing_plans.findMany({
        where: { available: true, deletedAt: { gte: new Date() } },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(id: string) {
    try {
      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id },
      });
  
      if (!pricingPlan || !pricingPlan.available || pricingPlan.deletedAt < new Date()) {
        throw new NotFoundException('Pricing Plan not found');
      }
  
      return pricingPlan;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updatePricingPlanDto: UpdatePricingPlanDto) {
    try {
      const existing = await this.getOne(id);

      return await this.pricing_plans.update({
        where: { id: existing.id },
        data: updatePricingPlanDto,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: string) {
    try {
      const existing = await this.getOne(id);

      await this.pricing_plans.update({
        where: { id: existing.id },
        data: { available: false, deletedAt: new Date() },
      });
      return { message: `Pricing Plan with ID ${id} has been soft deleted successfully.` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async recover(id: string) {
    try {
      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id },
      });
  
      if (!pricingPlan || pricingPlan.available === true) {
        throw new NotFoundException('Pricing Plan not found or already active');
      }
  
      return await this.pricing_plans.update({
        where: { id },
        data: { available: true, deletedAt: new Date('9999-12-12T00:00:00.000Z') },
      });
      
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
