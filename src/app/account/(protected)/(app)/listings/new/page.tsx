import { redirect } from "next/navigation";
import { LISTING_INTAKE_PATH } from "@/lib/consumer/listing-prefill";

export default function NewAccountListingPage() {
  redirect(LISTING_INTAKE_PATH);
}
