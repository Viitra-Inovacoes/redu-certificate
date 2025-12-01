import { Controller, Param, Delete } from '@nestjs/common';
import { LogosService } from './logos.service';

@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
