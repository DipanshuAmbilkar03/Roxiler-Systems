import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;

  @ApiPropertyOptional({
    maxLength: 500,
    example: 'Friendly staff and clean aisles.',
    description: 'Optional written review (max 500 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

