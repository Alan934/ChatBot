import { HttpException, Injectable, OnModuleInit, HttpStatus } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaClient } from '@prisma/client';
import { RoleDto } from './dto/update-role.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async findAllProfiles(idEnterprise: string) {
    try {
      const profiles = await this.profiles.findMany({
        where: { enterpriseId: idEnterprise, available: true },
        include: { enterprise: true },
      });
    
      return profiles;
    } catch (error) {
      throw new HttpException('Failed to fetch profiles', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findProfileById(id: string) {
    try {
      const profile = await this.profiles.findUnique({
        where: { id: id, available: true },
        include: { enterprise: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      return profile;
    } catch (error) {
      throw new HttpException('Failed to fetch profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createProfile(createProfileDto: CreateProfileDto, enterpriseID: string) {
    try {
      const existingProfile = await this.profiles.findFirst({
        where: { email: createProfileDto.email, available: true },
      });
  
      if (existingProfile) {
        throw new HttpException('Profile with this email already exists', HttpStatus.CONFLICT);
      }
  
      const enterprise = await this.enterprises.findUnique({
        where: { id: enterpriseID, available: true },
      });
  
      if (!enterprise) {
        throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
      }
  
      createProfileDto.enterpriseId = enterprise.id;
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createProfileDto.password, saltRounds);
      createProfileDto.password = hashedPassword;
  
      const deleted: Date = new Date('9999-12-12');
      const { enterpriseId, google, ...profilesData } = createProfileDto;
  
      const profile = await this.profiles.create({
        data: {
          ...profilesData,
          deletedAt: deleted,
          enterpriseId: enterprise.id,
          google: google ?? false,
        },
      });
  
      const { password, ...data } = profile;
      return data;
    } catch (error) {
      throw new HttpException('Failed to create profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findProfileByMail(mail: string): Promise<any> {
    try {
      const profile = await this.profiles.findFirst({
        where: { email: mail, available: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      return profile;
    } catch (error) {
      console.error('Error al buscar perfil por correo:', error.message);
      throw new HttpException('Failed to fetch profile by email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findEnterpriseByProfileId(profileId: string) {
    try {
      const profile = await this.profiles.findUnique({
        where: { id: profileId, available: true },
        include: { enterprise: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      const enterID: string = profile.enterpriseId;
      return enterID;
    } catch (error) {
      throw new HttpException('Failed to fetch enterprise by profile ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    try {
      const { id: __, ...data } = updateProfileDto;

      const profile = await this.profiles.findUnique({
        where: { id: __, available: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      const update = await this.profiles.update({
        where: { id: profile.id, available: true },
        data: data,
      });

      const { password, ...info } = update;

      return info;
    } catch (error) {
      throw new HttpException('Failed to update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDeleteById(id: string) {
    try {
      const profile = await this.profiles.findUnique({
        where: { id: id, available: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      const dateDelete = new Date(Date.now());

      await this.profiles.update({
        where: { id: id },
        data: { deletedAt: dateDelete, available: false },
      });

      return 'Profile deleted successfully';
    } catch (error) {
      throw new HttpException('Failed to delete profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateRole(id: string, role: RoleDto) {
    try {
      const profile = await this.profiles.findUnique({
        where: { id: id, available: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      if (profile.role === role.role) return profile;

      const update = await this.profiles.update({
        where: { id: id },
        data: { role: role.role },
      });

      return update;
    } catch (error) {
      throw new HttpException('Failed to update role', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getQrUrl(): Promise<string> {
    const url = 'https://apichatbotdev.medprouno.com/';

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      // ... your selector logic here
      const qrImageUrl = $('img[alt="QR"]').attr('src');

      if (!qrImageUrl) {
        throw new HttpException('QR URL not found', HttpStatus.NOT_FOUND);
      }

      return qrImageUrl;
    } catch (error) {
      throw new HttpException('Failed to fetch QR URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findEmailGoogle(email: string, fullName: string) {
    try {
      const profile = await this.profiles.findFirst({
        where: { email: email,name: fullName, google: true },
      });

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      return profile;
    } catch (error) {
      throw new HttpException('Failed to fetch profile by email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
