export {
  ResendEmailService,
  createEmailServiceFromEnv,
} from './service.js';
export type { EmailService, ResendEmailServiceConfig } from './service.js';
export { BUILT_IN_TEMPLATES, SimpleTemplateRenderer } from './template.js';
export type {
  BatchEmailParams,
  BatchResult,
  EmailResult,
  EmailTemplateId,
  SendEmailParams,
  TemplateData,
  TemplateRenderer,
} from './types.js';
