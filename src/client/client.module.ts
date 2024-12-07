import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, ProfileService],
})
export class ClientModule {}
