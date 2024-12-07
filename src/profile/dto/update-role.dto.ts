import { Rol } from "@prisma/client";
import { IsEnum } from "class-validator";

export class RoleDto {
    @IsEnum(Rol, {
        message: `Invalid role. The valid roles are ${Object.values(Rol)}`,
    })
    role: Rol;
}