import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MessageService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async createMessage(messageDto: CreateMessageDto) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: messageDto.enterpriseId, available: true },
        include: { pricingPlan: true },
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      if (enterprise.pricingPlanId === null) {
        throw new HttpException(
          `Enterprise with id ${messageDto.enterpriseId} has no pricing plan`,
          HttpStatus.NOT_FOUND,
        );
      }

      const flow = await this.flows.findUnique({
        where: { id: messageDto.flowId, available: true },
        include: { PricingPlan: true },
      });

      if (!flow) {
        throw new HttpException(
          `Flow with id ${messageDto.flowId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const price of flow.PricingPlan) {
        if (price.id !== enterprise.pricingPlan.id) {
          throw new HttpException(
            `Flow with id ${messageDto.flowId} does not belong to the same pricing plan as the enterprise`,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const flowPlans = flow.PricingPlan;
      const isFlowEnterprisePlan = flowPlans.some(
        (plan) => plan.id === enterprise.pricingPlan.id,
      );

      if (!isFlowEnterprisePlan) {
        throw new HttpException(
          `Flow with id ${messageDto.flowId} does not belong to the same pricing plan as the enterprise`,
          HttpStatus.NOT_FOUND,
        );
      }

      const message = await this.messages.create({
        data: {
          numOrder: messageDto.numOrder,
          name: messageDto.name,
          body: messageDto.body,
          option: messageDto.option,
          typeMessage: messageDto.typeMessage,
          showName: messageDto.showName,
          enterpriseId: enterprise.id,
          flowId: flow.id,
          parentMessageId: messageDto.parentMessageId,
        },
      });

      return message;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllMessages(idEnterprise: string) {
    try {
      return await this.messages.findMany({
        where: { enterpriseId: idEnterprise, available: true },
        include: { enterprise: true, flow: true },
        orderBy: { numOrder: 'asc' },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllMainMessages(idEnterprise: string) {
    try {
      const messages = await this.messages.findMany({
        where: {
          enterpriseId: idEnterprise,
          parentMessageId: null,
          available: true,
        },
        include: { enterprise: true, childMessages: true },
        orderBy: { numOrder: 'asc' },
      });

      for (const message of messages) {
        (message as any).childMessages.forEach((messagito: any) => {
          messagito.childMessages = this.findChildMessages(message.id);
        });
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllDeletedMessages(idEnterprise: string) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: idEnterprise, available: true },
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      const messages = await this.messages.findMany({
        where: { enterpriseId: idEnterprise, available: false },
        include: { flow: true, enterprise: true },
      });

      if (messages.length <= 0) {
        throw new HttpException(
          `No messages found for enterprise ${idEnterprise}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findMessageById(id: string, idEnterprise: string) {
    try {
      const message = await this.messages.findUnique({
        where: { id, enterpriseId: idEnterprise, available: true },
        include: { enterprise: true },
      });

      if (!message) {
        throw new HttpException(
          `Message with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return message;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllMessagesByNumOrder(
    idEnterprise: string,
    idFlow: string,
    numOrder: number,
  ) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: idEnterprise, available: true },
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      const flow = await this.flows.findUnique({
        where: { id: idFlow, available: true },
      });

      if (!flow) {
        throw new HttpException(
          `Flow with id ${idFlow} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const messages = await this.messages.findMany({
        where: {
          enterpriseId: enterprise.id,
          numOrder: numOrder,
          flowId: flow.id,
          available: true,
        },
      });

      if (messages.length <= 0) {
        throw new HttpException(
          `No messages found for numOrder ${numOrder} in flow ${idFlow}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllMessagesByNumOrderAndFlowByName(
    idEnterprise: string,
    nameFlow: string,
    numOrder: number,
  ) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: idEnterprise, available: true },
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      const flow = await this.flows.findFirst({
        where: { name: nameFlow, available: true },
      });

      if (!flow) {
        throw new HttpException(
          `Flow with name ${nameFlow} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const messages = await this.messages.findMany({
        where: {
          enterpriseId: idEnterprise,
          numOrder: numOrder,
          flowId: flow.id,
          available: true,
        },
      });

      if (messages.length <= 0) {
        throw new HttpException(
          `No messages found for numOrder ${numOrder} in flow ${nameFlow}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findMessagesWithMessages(idEnterprise: string) {
    try {
      const parentMessages = await this.messages.findMany({
        where: {
          enterprise: {
            id: idEnterprise,
          },
          parentMessageId: null,
          available: true,
        },
        include: {
          flow: true,
          childMessages: {
            where: { available: true },
          },
        },
        orderBy: {
          numOrder: 'asc',
        },
      });

      // For each parent message, fetch its child messages recursively:
      for (const parentMessage of parentMessages) {
        const childMessages = await this.messages.findMany({
          where: {
            parentMessageId: parentMessage.id, // Use parentMessage.id for the relation
            available: true,
          },
          include: {
            childMessages: {
              where: { available: true },
              include: {
                childMessages: {
                  where: { available: true },
                  include: {
                    childMessages: {
                      where: { available: true },
                    },
                  }
                },
              },
            },
          },
        });

        // Process the child messages and their children recursively
        parentMessage.childMessages = childMessages;
      }

      if (!parentMessages || parentMessages.length <= 0) {
        throw new HttpException(
          `No messages found for enterprise ${idEnterprise}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // for (const message of parentMessages) {
      //   (message as any).childMessages.forEach((messagito: any) => {
      //     messagito.childMessages = this.findChildMessages(message.id);
      //   });
      // }

      return parentMessages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneWithMessages(id: string, idEnterprise: string) {
    try {
      const parentMessage = await this.messages.findFirst({
        where: {
          enterprise: {
            id: idEnterprise,
          },
          parentMessageId: null,
          available: true,
        },
        include: {
          flow: true,
          childMessages: {
            where: { available: true },
          },
        },
        orderBy: {
          numOrder: 'asc',
        },
      });

      // For each parent message, fetch its child messages recursively:

        const childMessages = await this.messages.findMany({
          where: {
            parentMessageId: parentMessage.id, // Use parentMessage.id for the relation
            available: true,
          },
          include: {
            childMessages: {
              where: { available: true },
              include: {
                childMessages: {
                  where: { available: true },
                  include: {
                    childMessages: {
                      where: { available: true },
                    },
                  }
                },
              },
            },
          },
        });

        // Process the child messages and their children recursively
        parentMessage.childMessages = childMessages;


      if (!parentMessage) {
        throw new HttpException(
          `No message found for enterprise ${idEnterprise}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // for (const message of parentMessages) {
      //   (message as any).childMessages.forEach((messagito: any) => {
      //     messagito.childMessages = this.findChildMessages(message.id);
      //   });
      // }

      return parentMessage;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMessagesWithMenuMessages(idEnterprise: string) {
    try {
      const messages = await this.messages.findMany({
        where: {
          enterprise: {
            id: idEnterprise,
          },
          option: 'MENU',
          available: true,
        },
        include: {
          flow: true,
          childMessages: {
            include: {
              flow: true,
              childMessages: {
                include: {
                  flow: true,
                  childMessages: true,
                },
              },
            },
          },
        },
        orderBy: {
          numOrder: 'asc',
        },
      });

      if (!messages || messages.length <= 0) {
        throw new HttpException(
          `No messages found for enterprise ${idEnterprise}`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const message of messages) {
        (message as any).childMessages.forEach((messagito: any) => {
          messagito.childMessages = this.findChildMessages(message.id);
        });
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneWithMenuMessages(id: string, idEnterprise: string) {
    try {
      const message = await this.messages.findFirst({
        where: {
          enterprise: {
            id: idEnterprise,
          },
          option: 'MENU',
          available: true,
        },
        include: {
          flow: true,
          childMessages: {
            where: {available: true},
            include: {
              childMessages: {
                where: {available: true},
                include: {
                  childMessages: {
                    where: {available: true},
                  }
                },
              },
            },
          },
        },
        orderBy: {
          numOrder: 'asc',
        },
      });

      if (!message) {
        throw new HttpException(
          `No message found for enterprise ${idEnterprise} and message ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return message;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMessage(message: UpdateMessageDto) {
    try {
      const enterprise = await this.enterprises.findUnique({
        where: { id: message.enterpriseId, available: true },
      });

      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }

      const flow = await this.flows.findUnique({
        where: { id: message.flowId, available: true },
      });

      if (!flow) {
        throw new HttpException(
          `Flow with id ${message.flowId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const messageToUpdate = await this.messages.findUnique({
        where: {
          id: message.id,
          enterpriseId: enterprise.id,
          flowId: flow.id,
          available: true,
        },
      });

      if (!messageToUpdate) {
        throw new HttpException(
          `Message with id ${message.id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updated = await this.messages.update({
        where: { id: message.id },
        data: message,
      });

      return updated;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMessageByEnterprise(id: string, idEnterprise: string) {
    try {
      const message = await this.messages.findUnique({
        where: { id, enterpriseId: idEnterprise, available: true },
      });

      if (!message) {
        throw new HttpException(
          `Message with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const deleted = await this.messages.update({
        where: { id, enterpriseId: idEnterprise },
        data: { available: false },
      });

      return 'message deleted successfully';
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async restoreDeletedMessage(id: string, idEnterprise: string) {
    try {
      const message = await this.messages.findUnique({
        where: { id, enterpriseId: idEnterprise, available: false },
      });

      if (!message) {
        throw new HttpException(
          `Message with id ${id} not eliminated or not exist`,
          HttpStatus.NOT_FOUND,
        );
      }

      const restored = await this.messages.update({
        where: { id, enterpriseId: idEnterprise },
        data: { available: true },
      });

      return restored;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllMainMessagesWithIdFlow(idEnterprise: string, idFlow: string) {
    try {
      const messages = await this.messages.findMany({
        where: {
          enterpriseId: idEnterprise,
          flowId: idFlow,
          parentMessageId: null,
          available: true,
        },
        include: {
          flow: true,
          childMessages: {
            include: {
              childMessages: {
                include: {
                  childMessages: true,
                },
              },
            },
          },
        },
      });

      if (messages.length <= 0) {
        throw new HttpException(
          `No messages found for enterprise ${idEnterprise} and flow ${idFlow}`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const message of messages) {
        (message as any).childMessages.forEach((messagito: any) => {
          messagito.childMessages = this.findChildMessages(message.id);
        });
      }

      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Este metodo no necesita tener endpoint
  async findChildMessages(parentMessageId: string) {
    try {
      const childMessages = await this.messages.findMany({
        where: { parentMessageId: parentMessageId, available: true },
        orderBy: { numOrder: 'asc' },
        include: { childMessages: true },
      });

      if (!childMessages) {
        throw new HttpException(
          `No child messages found for parent message with id: ${parentMessageId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const child of childMessages) {
        if (child.childMessages.length > 0) {
          child.childMessages = await this.findChildMessages(child.id);
        }
      }

      return childMessages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
