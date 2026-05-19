import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initResend();
  }

  private initResend() {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  private getResend(): Resend {
    if (!this.resend) {
      this.initResend();
    }
    if (!this.resend) {
      throw new InternalServerErrorException('Resend no configurado');
    }
    return this.resend;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.configService.get<string>('RESEND_FROM');
      if (!from) {
        console.error('MailService: RESEND_FROM not configured');
        return;
      }

      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      if (!apiKey) {
        console.warn('MailService: RESEND_API_KEY not configured, skipping email');
        return;
      }

      const { error } = await this.getResend().emails.send({
        from,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('MailService: failed to send email:', error);
      }
    } catch (err) {
      console.error('MailService: error sending email:', err);
    }
  }
}
