import type { SignatureMethod } from "@/generated/prisma/client";
import type { UarAgreementResolvedValues } from "@/types/uar-agreement";

export type UarAgreementPdfInput = {
  values: UarAgreementResolvedValues;
  audit: {
    signerName: string;
    signerEmail: string;
    signatureMethod: SignatureMethod;
    signedAt: Date;
    agreementVersion: string;
    agreementHash: string;
    ipAddress: string | null;
    userAgent: string | null;
  };
  seller1SignaturePngBytes: Uint8Array;
  seller1InitialsPngBytes: Uint8Array;
  seller2SignaturePngBytes?: Uint8Array;
  seller2InitialsPngBytes?: Uint8Array;
};
