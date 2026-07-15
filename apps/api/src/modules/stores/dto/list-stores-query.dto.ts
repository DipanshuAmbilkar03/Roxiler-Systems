import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListPublicStoresQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['name', 'address', 'createdAt'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'address', 'createdAt'])
  sortBy?: 'name' | 'address' | 'createdAt' = 'name';

  @ApiPropertyOptional({ description: 'Search name or address' })
  @IsOptional()
  @IsString()
  search?: string;
}
