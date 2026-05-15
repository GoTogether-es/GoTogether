import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('hold')
  hold(@Body() body: { amount: number }) {
    return this.paymentsService.createHold(body.amount);
  }
}
