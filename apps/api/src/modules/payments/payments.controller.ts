import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('hold')
  hold(@Body() body: { amount: number }) {
    return this.paymentsService.createHold(body.amount);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':paymentIntentId/capture')
  capture(@Body() params: { paymentIntentId: string }) {
    return this.paymentsService.capturePayment(params.paymentIntentId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':paymentIntentId/release')
  release(@Body() params: { paymentIntentId: string }) {
    return this.paymentsService.releasePayment(params.paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    const payload = rawBody
      ? Buffer.isBuffer(rawBody)
        ? rawBody
        : Buffer.from(rawBody)
      : Buffer.from(JSON.stringify(req.body));

    const event = this.paymentsService.constructWebhookEvent(payload, signature);
    return { received: true, type: event.type };
  }
}
