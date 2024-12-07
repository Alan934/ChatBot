import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleDto } from './dto/update-role.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @Get('allProfiles')
  @ApiBearerAuth('bearerAuth')
  async findAllProfiles(@Request() req) {
    try {
      console.log(req.profile.sub);
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return await this.profileService.findAllProfiles(idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('signUp')
  @ApiBody({
    type: CreateProfileDto,
  examples: {
    example: {
      value: {
        email: 'test@gmail.com',
        name: 'Nicolas Velasco',
        phone: '1234567890',
        password: 'password',
        role: 'ADMIN'
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async createProfile(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    try {
      const idEnterprise = await this.profileService.findEnterpriseByProfileId(req.profile.sub);
      return await this.profileService.createProfile(createProfileDto, idEnterprise);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getById/:id')
  @ApiBearerAuth('bearerAuth')
  async findProfileById(@Param('id') id: string) {
    try {
      return await this.profileService.findProfileById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('deleteProfile/:id')
  @ApiBearerAuth('bearerAuth')
  async softDelete(@Param('id') id: string) {
    try {
      return await this.profileService.softDeleteById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('updateRole/:id')
  @ApiBody({
    type: CreateProfileDto,
  examples: {
    example: {
      value: {
        role: 'ADMIN'
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async updateRole(@Param('id') id: string, @Body() roleDto: RoleDto) {
    try {
      return await this.profileService.updateRole(id, roleDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('updateProfile/:id')
  @ApiBody({
    type: CreateProfileDto,
  examples: {
    example: {
      value: {
        email: 'test@gmail.com',
        name: 'Nicolas Velasco',
        phone: '1234567890',
        password: 'password',
        role: 'ADMIN'
      }
    }
  }})
  @ApiBearerAuth('bearerAuth')
  async updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      return await this.profileService.updateProfile({id: id, ...updateProfileDto});
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getQRUrl')
  @ApiBearerAuth('bearerAuth')
  async getQRUrl() {
    try {
      return await this.profileService.getQrUrl();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
