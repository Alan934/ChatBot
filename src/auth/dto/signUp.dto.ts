import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class SignInDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    //@IsStrongPassword()
    pass: string;
}