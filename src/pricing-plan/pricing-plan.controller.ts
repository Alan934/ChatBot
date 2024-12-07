import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { PricingPlanService } from './pricing-plan.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Pricing-Plan')
@Controller('pricingplan')
export class PricingPlanController {
  constructor(private readonly pricingPlanService: PricingPlanService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Post()
  @ApiBody({
    type: CreatePricingPlanDto,
  examples: {
    example: {
      value: {
        name: "PricingPlan name",
        description: "Description PricingPlan",
        price: 1500
      }
    }
  }})
  async create(@Body() createPricingPlanDto: CreatePricingPlanDto) {
    try {
      return await this.pricingPlanService.create(createPricingPlanDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Get()
  async getAll() {
    try {
      return await this.pricingPlanService.getAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Get(':id')
  async getOne(@Param('id') id: string) {
    try {
      return await this.pricingPlanService.getOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Patch(':id')
  @ApiBody({
    type: CreatePricingPlanDto,
  examples: {
    example: {
      value: {
        name: "PricingPlan name",
        description: "Description PricingPlan",
        price: 1500
      }
    }
  }})
  async update(@Param('id') id: string, @Body() updatePricingPlanDto: UpdatePricingPlanDto) {
    try {
      return await this.pricingPlanService.update(id, updatePricingPlanDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    try {
      await this.pricingPlanService.softDelete(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearerAuth')
  @Patch('/recover/:id')
  async recover(@Param('id') id: string) {
    try {
      return await this.pricingPlanService.recover(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}