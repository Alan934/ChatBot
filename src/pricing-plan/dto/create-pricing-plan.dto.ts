import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreatePricingPlanDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsPositive()
    price: number;
}
