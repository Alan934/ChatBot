import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { PrismaClient } from '@prisma/client';
import { MessageService } from '../message/message.service';


@Injectable()
export class FlowService extends PrismaClient implements OnModuleInit {
  constructor(private readonly messageService: MessageService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async findFlowsWithEnterprise(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findFirst({
        where: { id: idEnterprise, available: true },
        include: { pricingPlan: true },
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id: enterprise.pricingPlanId },
        include: { flows: true },
      });
  
      if (!pricingPlan) {
        throw new HttpException(`Enterprise with id ${idEnterprise} has no pricing plan`, HttpStatus.NOT_FOUND);
      }
      const flowx = pricingPlan.flows;
  
      const {flows, ...data} = pricingPlan;
  
      return {Flows: flowx, pricingPlan: data};
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  async findFlowsWithPricingPlanId(pricingPlanId: string) {
    try {
      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id: pricingPlanId, available: true},
        include: { flows: true },
      });
  
      if (!pricingPlan) {
        throw new HttpException(`Pricing plan with id ${pricingPlanId} not found`, HttpStatus.NOT_FOUND);
      }
  
      return pricingPlan.flows;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createFlowDto: CreateFlowDto) {
    try {
      for (const flowDto of createFlowDto.PricingPlan) {
        const pricingPlan = await this.pricing_plans.findUnique({
          where: { id: flowDto, available: true },
        });
        if (!pricingPlan) {
          throw new HttpException(`Pricing plan with id ${flowDto} not found`, HttpStatus.NOT_FOUND);
        }
      }
  
      const flow = await this.flows.create({
        data: {
          ...createFlowDto,
          PricingPlan: {
            connect: createFlowDto.PricingPlan.map((plan) => ({ id: plan })),
          },
        },
        include: { PricingPlan: true },
      });
  
      return flow;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  async update(updateFlowDto: UpdateFlowDto) {
    try {
      const flow = await this.flows.findUnique({
        where: { id: updateFlowDto.id, available: true},
        include: { PricingPlan: true },
      });
  
      if (!flow) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      for (const price of updateFlowDto.PricingPlan) {
        const pricingPlan = await this.pricing_plans.findUnique({
          where: { id: price, available: true },
        });
        if (!pricingPlan) {
          throw new HttpException(`Pricing plan with id ${price} not found`, HttpStatus.NOT_FOUND);
        }
      }
  
      return this.flows.update({
        where: { id: updateFlowDto.id },
        data: {
          name: updateFlowDto.name,
          description: updateFlowDto.description,
          PricingPlan: {
            set: updateFlowDto.PricingPlan.map((plan) => ({ id: plan })),
          },
        },
        include: { PricingPlan: true },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(enterpriseId: string) {
    try {
      const enterprise = await this.enterprises.findFirst({
        where: { id: enterpriseId, available: true },
        include: { pricingPlan: true },
      });
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const pricingPlan = await this.pricing_plans.findUnique({
        where: { id: enterprise.pricingPlanId, available: true },
        include: { flows: true },
      });
  
      if (!pricingPlan) {
        throw new HttpException(`Enterprise with id ${enterpriseId} has no pricing plan`, HttpStatus.NOT_FOUND);
      }
  
      const flows = await this.flows.findMany({
        where: { available: true },
        include: { Message: true },
      });
  
      if (flows.length === 0) {
        return [];
      }
  
      const allMessageWithSub =
        await this.messageService.findMessagesWithMessages(enterprise.id);
  
      for (const flow of flows) {
        flow.Message = allMessageWithSub
          .filter((message) => message.flow && message.flow.id === flow.id)
          .map((message) => {
            const { flow, ...messageWithoutFlow } = message;
            return messageWithoutFlow;
          });
      }
  
      return flows;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  async getOneWithMenuMessagesAndMessages(id: string, idEnterprise: string) {
    try {
      const flow = await this.flows.findUnique({
        where: { id: id, available: true },
        include: { Message: true },
      });
  
      if (!flow) {
        throw new HttpException(`Flow with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
  
      const allMessageWithSub =
        await this.messageService.getMessagesWithMenuMessages(idEnterprise);
  
      flow.Message = allMessageWithSub
        .filter((message) => message.flow && message.flow.id === flow.id)
        .map((message) => {
          const { flow, ...messageWithoutFlow } = message;
          return messageWithoutFlow;
        });
      
      return flow;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  async getAllWithMenu(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findFirst({
        where: { id: idEnterprise, available: true},
        include: { pricingPlan: true },
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const enterprisePlan = this.pricing_plans.findFirst({where: {id: enterprise.pricingPlanId, available: true}});
  
      if (!enterprisePlan) {
        throw new HttpException(`Enterprise with id ${idEnterprise} has no pricing plan`, HttpStatus.NOT_FOUND);
      }
  
      const flows = await this.flows.findMany({
        where: { available: true },
        include: { Message: true },
      });
  
      if (flows.length === 0) {
        return [];
      }
  
      const allMessageWithSubMessages = await this.messageService.getMessagesWithMenuMessages(enterprise.id);
  
      for (const flow of flows) {
        flow.Message = allMessageWithSubMessages
          .filter((message) => message.flow && message.flow.id === flow.id)
          .map((message) => {
            const { flow, ...messageWithoutFlow } = message;
            return messageWithoutFlow;
        });
      }
  
      return flows;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  async softDelete(id: string) {
    try {
      const flow = await this.flows.findUnique({ where: { id, available: true}, include: {Message: true} });

      if (!flow) {
        throw new HttpException(`Flow with id ${id} not found`, HttpStatus.NOT_FOUND);
      }
  
      const message = await this.flows.update({
        where: { id },
        data: { available: false },
        include: { Message: true },
      })
  
      return message;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllFlowsWithMessage(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findFirst({
        where: { id: idEnterprise },
        include: { pricingPlan: true },
      });
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      const enterprisePlanId = enterprise.pricingPlan.id;
  
      if (!enterprisePlanId) {
        throw new HttpException(`Enterprise with id ${idEnterprise} has no pricing plan`, HttpStatus.NOT_FOUND);
      }
  
      const flows = await this.flows.findMany({
        where: {
          PricingPlan: {
            some: {
              id: enterprisePlanId,
              enterprises: {
                some: {
                  id: enterprise.id,
                },
              },
            },
          },
        },
        include: {
          Message: true,
        },
      });
  
      for (const flow of flows) {
        flow.Message = await this.messageService.findAllMainMessagesWithIdFlow(
          idEnterprise,
          flow.id,
        );
      }
  
      return flows;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }
}