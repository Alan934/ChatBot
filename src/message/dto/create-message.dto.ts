import { Option, TypeMessage } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { OptionList } from "../enum/option.enum";
import { TypeMessageList } from "../enum/typeMessage.enum";

export class CreateMessageDto {

    @IsNumber()
    @IsNotEmpty()
    numOrder: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsEnum(OptionList, {
        message: `valid options are: ${OptionList}`
    })
    option: Option;

    @IsEnum(TypeMessageList, {
        message: `valid types are: ${TypeMessageList}`
    })
    typeMessage: TypeMessage;

    @IsBoolean()
    @IsNotEmpty()
    showName: boolean;

    @IsOptional()
    enterpriseId?: string;

    @IsString()
    @IsNotEmpty()
    flowId: string;

    @IsOptional()
    parentMessageId?: string;
}
