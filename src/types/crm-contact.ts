import type { ContactRoleLabel } from "@/lib/crm/contact-roles";
import type { ListingStatusValue } from "@/lib/crm/listing-status";

export type CrmContactListingLink = {
  role: ContactRoleLabel;
  listing: {
    id: string;
    address: string;
    city: string;
    status: ListingStatusValue;
    listingSlug: string;
    assignedAgentId: string | null;
  };
};

export type CrmContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  listings: CrmContactListingLink[];
  totalListingCount: number;
};
