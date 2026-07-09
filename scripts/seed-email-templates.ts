import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv();

async function main() {
  const { seedEmailTemplates } = await import("../src/lib/email/template-queries");
  const { seedEmailBrandSettings } = await import("../src/lib/email/brand-theme");

  await seedEmailBrandSettings();
  await seedEmailTemplates();
  console.log("Seeded email brand settings and templates.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db");
    await prisma.$disconnect();
  });
