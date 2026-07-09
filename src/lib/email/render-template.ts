const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export function interpolateTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(VARIABLE_PATTERN, (_match, key: string) => {
    return vars[key] ?? "";
  });
}

export type RenderedEmail = {
  subject: string;
  html: string;
};

export function renderEmailContent(
  subject: string,
  htmlBody: string,
  vars: Record<string, string>,
): RenderedEmail {
  return {
    subject: interpolateTemplate(subject, vars),
    html: interpolateTemplate(htmlBody, vars),
  };
}
