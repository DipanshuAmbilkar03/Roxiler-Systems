import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StoreOwnerDashboardQueryDto } from './dto/dashboard-query.dto';
import { StoreOwnerService } from './store-owner.service';

@ApiTags('store-owner')
@ApiBearerAuth()
@Roles(Role.STORE_OWNER)
@Controller('store-owner')
export class StoreOwnerController {
  constructor(private readonly storeOwnerService: StoreOwnerService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Owner dashboard: average rating + paginated raters (own stores only)',
  })
  dashboard(
    @CurrentUser() user: AuthUser,
    @Query() query: StoreOwnerDashboardQueryDto,
  ) {
    return this.storeOwnerService.getDashboard(user.id, query);
  }
}
