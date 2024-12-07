import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateEnterpriseDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsBoolean()
    @IsNotEmpty()
    connected: boolean;

    @IsString()
    @IsNotEmpty()
    pricingPlanId: string;
}
