import { Module, Global } from '@nestjs/common';
import { TemplateLoaderService } from './template-loader.service';

/**
 * Global template module.
 *
 * Making this module global allows any service to inject TemplateLoaderService
 * without importing the module explicitly.
 */
@Global()
@Module({
  providers: [TemplateLoaderService],
  exports: [TemplateLoaderService],
})
export class TemplateModule {}
