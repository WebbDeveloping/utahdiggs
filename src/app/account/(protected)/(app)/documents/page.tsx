import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Documents — Glide RE",
};

export default function AccountDocumentsPage() {
  return (
    <>
      <AccountPageHeader
        title="Documents"
        description="Access your listing agreements, disclosures, and transaction paperwork."
      />
      <AccountPlaceholderPanel
        title="Documents coming soon"
        description="This page will centralize all your listing and transaction documents in one place for easy viewing and download."
      />
    </>
  );
}
