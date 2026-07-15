import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['name', 'email', 'address', 'role', 'createdAt'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'email', 'address', 'role', 'createdAt'])
  sortBy?: 'name' | 'email' | 'address' | 'role' | 'createdAt' = 'name';

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Filter by name (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by address (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
