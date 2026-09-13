import { TemplateLoaderService } from './template-loader.service';
import * as path from 'path';

describe('TemplateLoaderService', () => {
  let service: TemplateLoaderService;

  beforeEach(() => {
    service = new TemplateLoaderService();
    service.onModuleInit();
  });

  it('should load default email templates into memory on init', () => {
    const templateNames = service.getTemplateNames();
    expect(templateNames).toContain('otp-verification');
    expect(templateNames).toContain('password-reset');
    expect(templateNames).toContain('welcome');
  });

  it('should get raw template content', () => {
    const template = service.getTemplate('otp-verification');
    expect(template).toBeDefined();
    expect(template).toContain('{{otp}}');
  });

  it('should render template with replaced variables', () => {
    const rendered = service.render('otp-verification', {
      appName: 'VibeU',
      otp: '123456',
      expiryMinutes: 10,
    });

    expect(rendered).toContain('123456');
    expect(rendered).toContain('10');
    expect(rendered).not.toContain('{{otp}}');
  });

  it('should throw informative error if template is not found', () => {
    expect(() => {
      service.render('non-existent-template', {});
    }).toThrow(/Template not found: non-existent-template/);
  });

  it('should handle custom EMAIL_TEMPLATES_DIR environment variable if it exists', () => {
    const originalEnv = process.env.EMAIL_TEMPLATES_DIR;
    const testDir = path.resolve(process.cwd(), 'templates', 'emails');
    process.env.EMAIL_TEMPLATES_DIR = testDir;

    const customService = new TemplateLoaderService();
    customService.onModuleInit();

    expect(customService.getTemplateNames()).toContain('otp-verification');

    if (originalEnv) {
      process.env.EMAIL_TEMPLATES_DIR = originalEnv;
    } else {
      delete process.env.EMAIL_TEMPLATES_DIR;
    }
  });

  it('should gracefully fallback if EMAIL_TEMPLATES_DIR does not exist', () => {
    const originalEnv = process.env.EMAIL_TEMPLATES_DIR;
    process.env.EMAIL_TEMPLATES_DIR = '/non/existent/path/for/test';

    const customService = new TemplateLoaderService();
    customService.onModuleInit();

    expect(customService.getTemplateNames()).toContain('otp-verification');

    if (originalEnv) {
      process.env.EMAIL_TEMPLATES_DIR = originalEnv;
    } else {
      delete process.env.EMAIL_TEMPLATES_DIR;
    }
  });
});
