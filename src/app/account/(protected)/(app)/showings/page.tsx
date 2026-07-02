import type { Metadata } from "next";
import AccountPageHeader from "@/components/account/AccountPageHeader";
import AccountPlaceholderPanel from "@/components/account/AccountPlaceholderPanel";

export const metadata: Metadata = {
  title: "Showings — Glide RE",
};

export default function AccountShowingsPage() {
  return (
    <>
      <AccountPageHeader
        title="Showings"
        description="See scheduled showings and buyer feedback for your listings."
      />
      <AccountPlaceholderPanel
        title="Showings coming soon"
        description="This page will display upcoming and past showings, buyer agent details, and feedback from each visit."
      />
    </>
  );
}
