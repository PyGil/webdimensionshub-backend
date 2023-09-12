import { InformationTemplate } from './information-template.interface';

export interface VerificationTemplate extends InformationTemplate {
  link: string;
  expireIn: number;
}
