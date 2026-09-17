import { Injectable, Logger } from "@nestjs/common";

// ponytail: logs instead of sending — swap the body for a real provider call
// (Postmark/SES, per 04-architecture.md's External integrations) once one is
// provisioned; every call site already goes through this one method.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`[stub email] to=${to} subject="${subject}" body="${body}"`);
  }
}
