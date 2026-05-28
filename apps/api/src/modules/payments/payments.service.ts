import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-04-10',
      typescript: true,
    });
  }

  async createHold(amount: number, companionStripeAccountId: string, currency = 'eur') {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey === 'sk_test_' || stripeKey.includes('mock')) {
      console.log(`[SIMULATED] createHold: preautorización de ${amount / 100} ${currency} para cuenta conectada ${companionStripeAccountId}`);
      return {
        id: `pi_mock_${Math.random().toString(36).substring(2, 11)}`,
        status: 'requires_capture',
        amount,
        currency,
        transfer_data: { destination: companionStripeAccountId },
      } as any;
    }

    return this.stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: 'manual',
      payment_method_types: ['card'],
      transfer_data: {
        destination: companionStripeAccountId,
      },
    });
  }

  async capturePayment(paymentIntentId: string, captureAmount: number, applicationFeeAmount: number) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey === 'sk_test_' || stripeKey.includes('mock') || paymentIntentId.startsWith('pi_mock_')) {
      console.log(`[SIMULATED] capturePayment: capturando pago ${paymentIntentId} por un total de ${captureAmount / 100} eur (fee: ${applicationFeeAmount / 100} eur)`);
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount_captured: captureAmount,
        application_fee_amount: applicationFeeAmount,
      } as any;
    }

    return this.stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: captureAmount,
      application_fee_amount: applicationFeeAmount,
    });
  }

  async releasePayment(paymentIntentId: string) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey === 'sk_test_' || stripeKey.includes('mock') || paymentIntentId.startsWith('pi_mock_')) {
      console.log(`[SIMULATED] releasePayment: cancelando hold para ${paymentIntentId}`);
      return {
        id: paymentIntentId,
        status: 'canceled',
      } as any;
    }

    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const secret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET no configurado');

    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

