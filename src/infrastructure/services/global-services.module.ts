import { Module, Global } from '@nestjs/common';
import { Argon2Service } from './crypto/argon2.service';
import { SmtpMailService } from './mail/smtp.service';
import { JwtService } from './token/jwt.service';
import { TokenService } from './token/token.service';
import { TemplateLoaderService } from './template/template-loader.service';
import { GeminiAiService } from './gemini-ai.service';

@Global()
@Module({
  providers: [
    TemplateLoaderService,
    {
      provide: 'ITemplateLoaderService',
      useClass: TemplateLoaderService,
    },
    {
      provide: 'ICryptoService',
      useClass: Argon2Service,
    },
    {
      provide: 'IMailService',
      useClass: SmtpMailService,
    },
    {
      provide: 'IJwtService',
      useClass: JwtService,
    },
    {
      provide: 'ITokenService',
      useClass: TokenService,
    },
    GeminiAiService,
    {
      provide: 'IAIService',
      useClass: GeminiAiService,
    },
  ],
  exports: [
    TemplateLoaderService,
    'ITemplateLoaderService',
    'ICryptoService',
    'IMailService',
    'IJwtService',
    'ITokenService',
    GeminiAiService,
    'IAIService',
  ],
})
export class GlobalServicesModule {}
