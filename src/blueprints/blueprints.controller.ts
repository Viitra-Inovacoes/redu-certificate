import {
  Body,
  Controller,
  UseGuards,
  Post,
  Param,
  Patch,
} from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { BlueprintFilesInterceptor } from './decorators/blueprint-files-interceptor.decorator';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { BlueprintSchema } from 'src/blueprints/dto/blueprint-schema';
import { ManageBlueprintGuard } from './guards/manage.guard';
import { ClientService } from 'src/client/client.service';
import { BlueprintGuard } from 'src/blueprints/guards/blueprint-guard.decorator';
import { Ability } from 'src/redu-api/authorization.service';
import { BlueprintFiles } from 'src/blueprints/decorators/blueprint-files.decorator';
import { ApiSecurity } from 'src/decorators/swagger';

@Controller('blueprints')
@ApiSecurity()
export class BlueprintsController {
  constructor(
    private readonly blueprintsService: BlueprintsService,
    private readonly clientService: ClientService,
  ) {}

  @Post()
  @BlueprintFilesInterceptor()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BlueprintSchema })
  @BlueprintGuard(Ability.MANAGE)
  async create(
    @Body() body: CreateBlueprintDto,
    @BlueprintFiles() files: BlueprintFiles,
  ) {
    return this.blueprintsService.create(files, body);
  }

  @Patch(':id/default')
  @UseGuards(ManageBlueprintGuard)
  setDefault(@Param('id') id: string) {
    return this.clientService.setDefaultBlueprint(id);
  }
}
