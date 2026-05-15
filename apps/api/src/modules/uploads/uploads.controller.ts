import { Body, Controller, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  createPresign(@Body() body: { key: string; contentType: string }) {
    return this.uploadsService.createPresignedUrl(body.key, body.contentType);
  }
}
