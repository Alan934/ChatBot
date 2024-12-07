import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";


export class CreateFlowDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ArrayMinSize(1)
    PricingPlan: string[];
}
