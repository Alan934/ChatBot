import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ProfileService } from '../profile/profile.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, ProfileService],
})
export class MessageModule {}
