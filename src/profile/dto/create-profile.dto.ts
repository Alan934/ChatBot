import { Rol } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, IsBoolean } from "class-validator";


export class CreateProfileDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
   //@IsPhoneNumber()
    @IsNotEmpty()
    phone: string;

    @IsString()
    //@IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsEnum(Rol, {
        message: `Invalid role. The valid roles are ${Object.values(Rol)}`,
    })
    role: Rol;

    @IsString()
    @IsOptional()
    enterpriseId?: string;

    @IsBoolean()
    @IsOptional()
    google: boolean;
}
