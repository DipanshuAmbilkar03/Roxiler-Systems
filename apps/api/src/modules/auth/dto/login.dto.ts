import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@store-rating.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'User@1234' })
  @IsString()
  @MinLength(1)
  password!: string;
}
