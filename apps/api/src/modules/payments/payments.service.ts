import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2024-04-10',
    typescript: true,
  });

  async createHold(amount: number, currency = 'eur') {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: 'manual',
      payment_method_types: ['card'],
    });
  }
}
