interface MailerAuth {
  user: string;
  pass: string;
}

export interface Mailer {
  service: string;
  auth: MailerAuth;
}
