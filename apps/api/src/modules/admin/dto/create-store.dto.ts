import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/password.validator';

export class CreateStoreOwnerDto {
  @ApiProperty({
    example: 'New Store Owner Full Name XX',
    minLength: 20,
    maxLength: 60,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 'new.owner@store-rating.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Owner@123', minLength: 8, maxLength: 16 })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    example: '88 Owner Lane, Business District, City 60001',
    maxLength: 400,
  })
  @IsString()
  @MaxLength(400)
  address!: string;
}

export class CreateStoreDto {
  @ApiProperty({
    example: 'Admin Created Corner Store',
    minLength: 20,
    maxLength: 60,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 'corner@stores.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '99 Commerce Blvd, Retail Park, City 60002',
    maxLength: 400,
  })
  @IsString()
  @MaxLength(400)
  address!: string;

  @ApiPropertyOptional({
    description:
      'Existing STORE_OWNER user id. Required if owner is not provided.',
  })
  @ValidateIf((o: CreateStoreDto) => !o.owner)
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    type: CreateStoreOwnerDto,
    description:
      'Create a new STORE_OWNER and assign them. Used when ownerId is omitted.',
  })
  @ValidateIf((o: CreateStoreDto) => !o.ownerId)
  @ValidateNested()
  @Type(() => CreateStoreOwnerDto)
  @IsOptional()
  owner?: CreateStoreOwnerDto;
}
