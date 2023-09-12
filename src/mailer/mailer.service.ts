import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Handlebars from 'handlebars';

import { Mailer } from 'src/config/interfaces/mailer.interface';
import { VerificationTemplate } from './interfaces/verification-template.interface';
import { TokenOptions } from 'src/config/interfaces/token-options.interface';
import { secondsToMinutes } from 'src/common/utils/seconds-to-minutes';
import { InformationTemplate } from './interfaces/information-template.interface';

@Injectable()
export class MailerService {
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;
  private readonly tokensOptions: TokenOptions;

  constructor(private readonly configService: ConfigService) {
    const mailerConfig = this.configService.get<Mailer>('mailer');
    this.transport = createTransport(mailerConfig);
    this.emailFrom = mailerConfig.auth.user;
    this.frontendUrl = this.configService.get<string>('frontendUrl');
    this.tokensOptions = this.configService.get<TokenOptions>('tokenOptions');
  }

  parseTemplate<T>(templateName: string): Handlebars.TemplateDelegate<T> {
    const templatesPath = join(__dirname, 'templates', templateName);
    const templateText = readFileSync(templatesPath, 'utf-8');

    return Handlebars.compile<T>(templateText, { strict: true });
  }

  sendResetPasswordEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Reset your password';

    const html = this.parseTemplate<VerificationTemplate>('reset-password.hbs')(
      {
        username,
        link: `${this.frontendUrl}/reset-password?token=${token}`,
        expireIn: secondsToMinutes(this.tokensOptions.resetPassword.expiresIn),
      },
    );

    return this.sendEmail(to, subject, html);
  }

  sendEmailToChangeEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Changing email';

    const html = this.parseTemplate<VerificationTemplate>('change-email.hbs')({
      username,
      link: `${this.frontendUrl}/change-email?token=${token}`,
      expireIn: secondsToMinutes(this.tokensOptions.changeEmail.expiresIn),
    });

    return this.sendEmail(to, subject, html);
  }

  sendDeleteAccountEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Delete your account';

    const html = this.parseTemplate<VerificationTemplate>('delete-account.hbs')(
      {
        username,
        link: `${this.frontendUrl}/remove-account?token=${token}`,
        expireIn: secondsToMinutes(this.tokensOptions.deleteAccount.expiresIn),
      },
    );

    return this.sendEmail(to, subject, html);
  }

  sendUserBlockedEmail(
    to: string,
    username: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Blocked account';

    const html = this.parseTemplate<InformationTemplate>('blocked-account.hbs')(
      {
        username,
      },
    );

    return this.sendEmail(to, subject, html);
  }

  sendUserUnblockedEmail(
    to: string,
    username: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const subject = 'Unblocked account';

    const html = this.parseTemplate<InformationTemplate>(
      'unblocked-account.hbs',
    )({
      username,
    });

    return this.sendEmail(to, subject, html);
  }

  sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    return this.transport.sendMail({ to, subject, html, from: this.emailFrom });
  }
}
