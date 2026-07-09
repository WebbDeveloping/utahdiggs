import { prisma } from "@/lib/db";
import {
  brandThemeToVars,
  getEmailBrandSettings,
  type EmailBrandTheme,
} from "@/lib/email/brand-theme";
import {
  getEmailTemplateDefinition,
  isValidEmailTemplateSlug,
  listEmailTemplateDefinitions,
  type EmailTemplateDefinition,
} from "@/lib/email/template-definitions";
import {
  renderEmailContent,
  type RenderedEmail,
} from "@/lib/email/render-template";

export type EmailTemplateRecord = {
  id: string;
  slug: string;
  displayName: string;
  description: string | null;
  subject: string;
  htmlBody: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EmailTemplateListItem = {
  slug: string;
  displayName: string;
  description: string;
  recipientLabel: string;
  subject: string;
  updatedAt: Date | null;
  isCustomized: boolean;
};

export type EmailTemplateDetail = EmailTemplateDefinition & {
  subject: string;
  htmlBody: string;
  updatedAt: Date | null;
  isCustomized: boolean;
};

function toRecord(row: {
  id: string;
  slug: string;
  displayName: string;
  description: string | null;
  subject: string;
  htmlBody: string;
  createdAt: Date;
  updatedAt: Date;
}): EmailTemplateRecord {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    description: row.description,
    subject: row.subject,
    htmlBody: row.htmlBody,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function isTemplateCustomized(
  definition: EmailTemplateDefinition,
  record: EmailTemplateRecord | null,
): boolean {
  if (!record) {
    return false;
  }
  return (
    record.subject !== definition.defaultSubject ||
    record.htmlBody !== definition.defaultHtmlBody
  );
}

function mergeDefinitionWithRecord(
  definition: EmailTemplateDefinition,
  record: EmailTemplateRecord | null,
): EmailTemplateDetail {
  return {
    ...definition,
    subject: record?.subject ?? definition.defaultSubject,
    htmlBody: record?.htmlBody ?? definition.defaultHtmlBody,
    updatedAt: record?.updatedAt ?? null,
    isCustomized: isTemplateCustomized(definition, record),
  };
}

export async function getEmailTemplateRecord(
  slug: string,
): Promise<EmailTemplateRecord | null> {
  const row = await prisma.emailTemplate.findUnique({ where: { slug } });
  return row ? toRecord(row) : null;
}

export async function getEmailTemplateDetail(
  slug: string,
): Promise<EmailTemplateDetail | null> {
  const definition = getEmailTemplateDefinition(slug);
  if (!definition) {
    return null;
  }

  const record = await getEmailTemplateRecord(slug);
  return mergeDefinitionWithRecord(definition, record);
}

export async function listEmailTemplates(): Promise<EmailTemplateListItem[]> {
  const definitions = listEmailTemplateDefinitions();
  const records = await prisma.emailTemplate.findMany({
    where: { slug: { in: definitions.map((definition) => definition.slug) } },
  });
  const recordBySlug = new Map(records.map((record) => [record.slug, record]));

  return definitions.map((definition) => {
    const record = recordBySlug.get(definition.slug);
    return {
      slug: definition.slug,
      displayName: definition.displayName,
      description: definition.description,
      recipientLabel: definition.recipientLabel,
      subject: record?.subject ?? definition.defaultSubject,
      updatedAt: record?.updatedAt ?? null,
      isCustomized: isTemplateCustomized(
        definition,
        record ? toRecord(record) : null,
      ),
    };
  });
}

export async function upsertEmailTemplate(input: {
  slug: string;
  subject: string;
  htmlBody: string;
}): Promise<EmailTemplateRecord> {
  const definition = getEmailTemplateDefinition(input.slug);
  if (!definition) {
    throw new Error(`Unknown email template slug: ${input.slug}`);
  }

  const row = await prisma.emailTemplate.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      displayName: definition.displayName,
      description: definition.description,
      subject: input.subject,
      htmlBody: input.htmlBody,
    },
    update: {
      subject: input.subject,
      htmlBody: input.htmlBody,
    },
  });

  return toRecord(row);
}

export async function resetEmailTemplateToDefault(
  slug: string,
): Promise<EmailTemplateRecord> {
  const definition = getEmailTemplateDefinition(slug);
  if (!definition) {
    throw new Error(`Unknown email template slug: ${slug}`);
  }

  const row = await prisma.emailTemplate.upsert({
    where: { slug },
    create: {
      slug,
      displayName: definition.displayName,
      description: definition.description,
      subject: definition.defaultSubject,
      htmlBody: definition.defaultHtmlBody,
    },
    update: {
      subject: definition.defaultSubject,
      htmlBody: definition.defaultHtmlBody,
    },
  });

  return toRecord(row);
}

export async function renderEmailTemplate(
  slug: string,
  vars: Record<string, string>,
): Promise<RenderedEmail> {
  const definition = getEmailTemplateDefinition(slug);
  if (!definition) {
    throw new Error(`Unknown email template slug: ${slug}`);
  }

  const record = await getEmailTemplateRecord(slug);
  const subject = record?.subject ?? definition.defaultSubject;
  const htmlBody = record?.htmlBody ?? definition.defaultHtmlBody;
  const brandTheme = await getEmailBrandSettings();

  return renderEmailContent(subject, htmlBody, {
    ...brandThemeToVars(brandTheme),
    ...vars,
  });
}

export async function renderEmailTemplatePreview(
  slug: string,
  input?: {
    subject?: string;
    htmlBody?: string;
    brandTheme?: EmailBrandTheme;
  },
): Promise<RenderedEmail> {
  const definition = getEmailTemplateDefinition(slug);
  if (!definition) {
    throw new Error(`Unknown email template slug: ${slug}`);
  }

  let subject = definition.defaultSubject;
  let htmlBody = definition.defaultHtmlBody;

  if (input?.subject !== undefined || input?.htmlBody !== undefined) {
    subject = input.subject ?? subject;
    htmlBody = input.htmlBody ?? htmlBody;
  } else {
    const record = await getEmailTemplateRecord(slug);
    if (record) {
      subject = record.subject;
      htmlBody = record.htmlBody;
    }
  }

  const brandTheme = input?.brandTheme ?? (await getEmailBrandSettings());

  return renderEmailContent(subject, htmlBody, {
    ...brandThemeToVars(brandTheme),
    ...definition.sampleData,
  });
}

export async function seedEmailTemplates(): Promise<void> {
  for (const definition of listEmailTemplateDefinitions()) {
    await prisma.emailTemplate.upsert({
      where: { slug: definition.slug },
      create: {
        slug: definition.slug,
        displayName: definition.displayName,
        description: definition.description,
        subject: definition.defaultSubject,
        htmlBody: definition.defaultHtmlBody,
      },
      update: {},
    });
  }
}

export { isValidEmailTemplateSlug };
