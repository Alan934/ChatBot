import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FlowService } from './flow.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../profile/profile.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('flow')
@ApiTags('Flow')
export class FlowController {
  constructor(
    private readonly flowService: FlowService,
    private readonly profileService: ProfileService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('flowsWithEnterprise')
  @ApiBearerAuth('bearerAuth')
  async findAllFlowsWithEnterprise(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(
        req.profile.sub,
      );
      return await this.flowService.findFlowsWithEnterprise(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('flowsWithPricing/:pricingPlanId')
  @ApiBearerAuth('bearerAuth')
  async findAllFlowsWithPricingPlanId(
    @Param('pricingPlanId') pricingPlanId: string,
  ) {
    try {
      return await this.flowService.findFlowsWithPricingPlanId(pricingPlanId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBody({
    type: CreateFlowDto,
    examples: {
      example: {
        value: {
          name: 'Flow name',
          description: 'Flow description',
          PricingPlan: ['id'
          ],
        },
      },
    },
  })
  @ApiBearerAuth('bearerAuth')
  async create(@Body() createFlowDto: CreateFlowDto) {
    try {
      return await this.flowService.create(createFlowDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBody({
    type: UpdateFlowDto,
    examples: {
      example: {
        value: {
          name: 'Flow name',
          description: 'Flow description',
          PricingPlan: [
            'id',
          ],
        },
      },
    },
  })
  @ApiBearerAuth('bearerAuth')
  async update(@Param('id') id: string, @Body() updateFlowDto: UpdateFlowDto) {
    try {
      return await this.flowService.update({ id: id, ...updateFlowDto });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getAll')
  @ApiBearerAuth('bearerAuth')
  async getAll(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(
        req.profile.sub,
      );
      return await this.flowService.getAll(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

   @Post('createQR')
  async getQR(@Req() req) {
    return req.header
  }

  @UseGuards(AuthGuard)
  @Get('OneWithMenu/:id')
  @ApiBearerAuth('bearerAuth')
  async findOneWithMenu(@Param('id') id: string, @Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(
        req.profile.sub,
      );
      return await this.flowService.getOneWithMenuMessagesAndMessages(
        id,
        idEnterprise,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getAllWithMenu')
  @ApiBearerAuth('bearerAuth')
  async getAllWithMenu(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(
        req.profile.sub,
      );
      return await this.flowService.getAllWithMenu(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('bearerAuth')
  async delete(@Param('id') id: string) {
    try {
      return await this.flowService.softDelete(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('BetterGetAll')
  @ApiBearerAuth('bearerAuth')
  async findAllFlowsWithMessage(@Req() req) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(
        req.profile.sub,
      );
      return await this.flowService.findAllFlowsWithMessage(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
