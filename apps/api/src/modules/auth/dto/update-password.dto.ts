import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/password.validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'Password@1' })
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @ApiProperty({ example: 'User@5678', minLength: 8, maxLength: 16 })
  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}

