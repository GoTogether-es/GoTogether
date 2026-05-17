import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('presign')
  createPresign(@Body() body: { key: string; contentType: string }) {
    return this.uploadsService.createPresignedUrl(body.key, body.contentType);
  }
}
