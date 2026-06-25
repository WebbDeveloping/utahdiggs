import type { MlsInputFormValues } from "./schema";

export type MlsDraftState = {
  listingId?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: boolean;
};

export type MlsSubmitState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type MlsInputWizardProps = {
  user: {
    name?: string | null;
    email: string;
    phone?: string | null;
  };
  initialValues?: Partial<MlsInputFormValues> & {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  draftListingId?: string;
  initialStep?: number;
  initialData?: Record<string, unknown>;
};
