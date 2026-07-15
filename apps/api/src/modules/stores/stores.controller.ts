import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListPublicStoresQueryDto } from './dto/list-stores-query.dto';
import { UpsertRatingDto } from './dto/rating.dto';
import { StoresService } from './stores.service';

@ApiTags('stores')
@ApiBearerAuth()
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @Roles(Role.NORMAL_USER, Role.ADMIN)
  @ApiOperation({
    summary: 'List stores with average rating and current user rating',
  })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListPublicStoresQueryDto,
  ) {
    return this.storesService.listStores(user.id, query);
  }

  @Post(':id/ratings')
  @Roles(Role.NORMAL_USER)
  @ApiOperation({ summary: 'Submit a 1–5 rating for a store' })
  createRating(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) storeId: string,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.storesService.createRating(user.id, storeId, dto);
  }

  @Patch(':id/ratings')
  @Roles(Role.NORMAL_USER)
  @ApiOperation({ summary: 'Update own rating for a store' })
  updateRating(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) storeId: string,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.storesService.updateRating(user.id, storeId, dto);
  }
}
