import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ITemplateLoaderService } from '../../../core/abstracts/template-loader-service.interface';

export type { ITemplateLoaderService };

/**
 * Template loader service that loads email templates into RAM on startup.
 *
 * This service reads HTML templates from the templates/emails/ directory
 * when the application starts and keeps them in memory.
 */
@Injectable()
export class TemplateLoaderService
  implements ITemplateLoaderService, OnModuleInit
{
  private readonly logger = new Logger(TemplateLoaderService.name);
  private templates: Map<string, string> = new Map();
  private readonly templatesDir: string;

  constructor() {
    this.templatesDir = path.resolve(process.cwd(), 'templates', 'emails');
  }

  /**
   * Called when the module initializes.
   * Loads all HTML templates from the templates/emails/ directory into RAM.
   */
  async onModuleInit() {
    await this.loadTemplates();
  }

  /**
   * Loads all .html files from the templates directory into memory.
   */
  private async loadTemplates(): Promise<void> {
    try {
      if (!fs.existsSync(this.templatesDir)) {
        this.logger.warn(`Templates directory not found: ${this.templatesDir}`);
        return;
      }

      const files = fs.readdirSync(this.templatesDir);
      const htmlFiles = files.filter((file) => file.endsWith('.html'));

      for (const file of htmlFiles) {
        const templateName = path.basename(file, '.html');
        const filePath = path.join(this.templatesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        this.templates.set(templateName, content);
        this.logger.log(`Loaded template: ${templateName}`);
      }

      this.logger.log(`Loaded ${htmlFiles.length} email templates into memory`);
    } catch (error) {
      this.logger.error('Failed to load email templates', error);
    }
  }

  /**
   * Gets a template by name and replaces variables with provided values.
   */
  render(
    templateName: string,
    variables: Record<string, string | number>,
  ): string {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return rendered;
  }

  /**
   * Gets a template by name without rendering variables.
   */
  getTemplate(templateName: string): string | undefined {
    return this.templates.get(templateName);
  }

  /**
   * Lists all available template names.
   */
  getTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }
}
