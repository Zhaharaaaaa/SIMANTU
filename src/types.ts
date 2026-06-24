/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubmissionStatus = "Approved" | "Rejected" | "Pending";

export type ChangeCategory = 
  | "Perubahan Kelas Pendapatan" 
  | "Status Pekerjaan" 
  | "Status Sosial" 
  | "Penerima Bansos";

export interface Submission {
  id: string;
  officerId: string;
  officerName: string;
  date: string;
  nik: string;
  citizenName: string;
  changeType: ChangeCategory;
  details: string;
  region: string;
  evidenceType: "PDF" | "JPG" | "PNG";
  evidenceUrl: string;
  status: SubmissionStatus;
  adminComment: string;
  previousValue: string;
  newValue: string;
}

export interface UserAccount {
  id: string; // "PB01", "PB02", etc.
  name: string;
  role: "Admin" | "Petugas Lapangan";
  email: string;
  region: string;
  avatarColor: string;
  avatarUrl?: string;
  totalInputs: number;
  password?: string;
}

export interface ApiSyncLog {
  id: string;
  apiName: "Kemenkeu Pajak API" | "DTKS Bansos API" | "Dukcapil Pusat API";
  date: string;
  recordsSynced: number;
  status: "Success" | "Failed";
  latencyMs: number;
  syncType: "Automatic Scheduled" | "Manual Sync";
}

export interface SprintPerformance {
  sprint: string; // "Sprint 1", "Sprint 2"...
  role: "Developer" | "UI/UX" | "DevOps" | "Tester";
  estimasi: number; // in Days
  realisasi: number; // in Days
}
