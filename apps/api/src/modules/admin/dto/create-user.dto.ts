import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/password.validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Admin Created Normal User X',
    minLength: 20,
    maxLength: 60,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 'new.user@store-rating.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password@1', minLength: 8, maxLength: 16 })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    example: '12 Admin Created Street, District, City 50001',
    maxLength: 400,
  })
  @IsString()
  @MaxLength(400)
  address!: string;

  @ApiPropertyOptional({
    enum: [Role.ADMIN, Role.NORMAL_USER, Role.STORE_OWNER],
    default: Role.NORMAL_USER,
  })
  @IsEnum(Role)
  role!: Role;
}

