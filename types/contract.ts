export type DeadlineType = "renewal" | "cancellation" | "payment";

export interface ExtractedContractDates {
  renewalDate: string | null;
  cancellationDate: string | null;
  paymentDate: string | null;
  summary: string;
  confidence: number;
  keyClauses: string[];
}

export interface ContractRecord {
  id: string;
  title: string;
  vendor: string | null;
  fileName: string;
  notificationEmail: string;
  uploadedAt: string;
  renewalDate: string | null;
  cancellationDate: string | null;
  paymentDate: string | null;
  nextDeadline: string | null;
  rawText: string;
  extracted: ExtractedContractDates;
}

export interface NotificationRecord {
  id: string;
  contractId: string;
  email: string;
  sendAt: string;
  kind: DeadlineType;
  status: "scheduled" | "sent";
  sentAt: string | null;
}
