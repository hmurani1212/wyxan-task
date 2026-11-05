import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { PublishSiteDto } from './dto/publish-site.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { SitePage, SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  list() {
    return this.sites.list();
  }

  @Get(':address')
  async find(
    @Param('address') address: string,
    @Query('personId') personId?: string,
  ): Promise<SitePage> {
    const page = await this.sites.findByAddress(address, personId);
    if (!page.found) throw new NotFoundException(page);
    return page;
  }

  @Post()
  publish(@Body() dto: PublishSiteDto): Promise<SitePage> {
    return this.sites.publish(dto);
  }
}

@Controller('search')
export class SearchController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.sites.search(query.q);
  }
}
