import { Module } from '@nestjs/common';
import { FlowService } from './flow.service';
import { FlowController } from './flow.controller';
import { ProfileService } from 'src/profile/profile.service';
import { MessageService } from 'src/message/message.service';

@Module({
  controllers: [FlowController],
  providers: [FlowService, ProfileService, MessageService],
})
export class FlowModule {}
