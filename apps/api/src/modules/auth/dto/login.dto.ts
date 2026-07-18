import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@store-rating.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password@1' })
  @IsString()
  @MinLength(1)
  password!: string;
}

