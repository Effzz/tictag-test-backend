import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from 'src/enum/role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;
}
