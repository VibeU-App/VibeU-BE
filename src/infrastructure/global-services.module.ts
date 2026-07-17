import { Module, Global } from '@nestjs/common';
import { Argon2Service } from './services/crypto/argon2.service';
import { SmtpMailService } from './services/mail/smtp.service';
import { JwtService } from './services/token/jwt.service';
import { TokenService } from './services/token/token.service';
import { TemplateLoaderService } from './services/template/template-loader.service';

@Global()
@Module({
  providers: [
    TemplateLoaderService,
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
  ],
  exports: [
    TemplateLoaderService,
    'ICryptoService',
    'IMailService',
    'IJwtService',
    'ITokenService',
  ],
})
export class GlobalServicesModule {}
