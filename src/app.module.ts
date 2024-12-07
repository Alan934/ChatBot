import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { ClientModule } from './client/client.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { FlowModule } from './flow/flow.module';
import { MessageModule } from './message/message.module';
import { PricingPlanModule } from './pricing-plan/pricing-plan.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [ProfileModule, ClientModule, EnterpriseModule, FlowModule, MessageModule, PricingPlanModule, AuthModule, WhatsappModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
