/**
 * Interface for template loader and renderer service.
 */
export interface ITemplateLoaderService {
  render(
    templateName: string,
    variables: Record<string, string | number>,
  ): string;
  getTemplate(templateName: string): string | undefined;
  getTemplateNames(): string[];
}
