import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Counts of users, stores, and ratings (cached)' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('users')
  @ApiOperation({
    summary: 'Create a user (ADMIN / NORMAL_USER / STORE_OWNER)',
  })
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (paginated, sortable, filterable)' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'User detail; includes average rating when role is STORE_OWNER',
  })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('stores')
  @ApiOperation({
    summary: 'Create a store (assign existing ownerId or create owner inline)',
  })
  createStore(@Body() dto: CreateStoreDto) {
    return this.adminService.createStore(dto);
  }

  @Get('stores')
  @ApiOperation({ summary: 'List stores (paginated, sortable, filterable)' })
  listStores(@Query() query: ListStoresQueryDto) {
    return this.adminService.listStores(query);
  }
}
