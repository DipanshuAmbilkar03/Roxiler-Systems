import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/password.validator';

export class SignupDto {
  @ApiProperty({
    example: 'Normal User Alice Johnson',
    minLength: 20,
    maxLength: 60,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 'alice.new@store-rating.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password@1', minLength: 8, maxLength: 16 })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    example: '100 Residential Ave, Suburb North, City 30001',
    maxLength: 400,
  })
  @IsString()
  @MaxLength(400)
  address!: string;
}

