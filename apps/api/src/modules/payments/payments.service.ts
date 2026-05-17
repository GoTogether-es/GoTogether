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

  async capturePayment(paymentIntentId: string) {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async releasePayment(paymentIntentId: string) {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET no configurado');

    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
