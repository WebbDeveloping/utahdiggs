import { config as loadEnv } from "dotenv";
import { refuseLiveDatabaseWrite } from "../src/lib/refuse-live-database-write";

loadEnv({ path: ".env.local", override: true });
loadEnv();

async function main() {
  refuseLiveDatabaseWrite("tsx scripts/seed-email-templates.ts");

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
