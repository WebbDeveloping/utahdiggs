import Stack from "@mui/material/Stack";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import MlsOpsSettingsForm from "@/components/crm/MlsOpsSettingsForm";
import MlsQueueTable from "@/components/crm/MlsQueueTable";
import { auth } from "@/lib/auth/admin-auth";
import {
  canEditMlsOpsSettings,
  requireCrmUser,
} from "@/lib/crm/access";
import { getActiveAgents } from "@/lib/crm/listing-queries";
import {
  getMlsOpsSettings,
  mlsVaNotificationEmailFromEnv,
} from "@/lib/crm/mls-ops-settings";
import { getMlsQueueListings } from "@/lib/crm/mls-queue-queries";

export default async function CrmMlsQueuePage() {
  const session = await auth();
  const user = requireCrmUser(session);
  const canEditSettings = canEditMlsOpsSettings(user);

  const [listings, settings, agents] = await Promise.all([
    getMlsQueueListings(user),
    canEditSettings ? getMlsOpsSettings() : Promise.resolve(null),
    canEditSettings ? getActiveAgents() : Promise.resolve([]),
  ]);

  return (
    <>
      <CrmPageHeader
        title="MLS Queue"
        description="Submitted MLS intakes ready for Matrix entry. Enter the MLS# to approve and go live."
      />

      <Stack spacing={3}>
        {canEditSettings && settings ? (
          <MlsOpsSettingsForm
            agents={agents}
            defaultVaUserId={settings.defaultVaUserId}
            fallbackEmail={settings.fallbackEmail}
            envDefaultEmail={mlsVaNotificationEmailFromEnv()}
          />
        ) : null}

        <MlsQueueTable listings={listings} />
      </Stack>
    </>
  );
}
