import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListStoresQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['name', 'email', 'address', 'createdAt'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'email', 'address', 'createdAt'])
  sortBy?: 'name' | 'email' | 'address' | 'createdAt' = 'name';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
