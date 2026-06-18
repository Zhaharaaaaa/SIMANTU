/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Submission, UserAccount, ApiSyncLog, SprintPerformance } from "./types";

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: "PB01",
    name: "Martin (Senior Analyst)",
    role: "Petugas Lapangan",
    email: "martin.analyst@simantu.go.id",
    region: "Kecamatan Sukamaju",
    avatarColor: "bg-blue-500",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    totalInputs: 14
  },
  {
    id: "PB02",
    name: "James (UI/UX Rep)",
    role: "Petugas Lapangan",
    email: "james.design@simantu.go.id",
    region: "Kecamatan Sukaresmi",
    avatarColor: "bg-emerald-500",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    totalInputs: 11
  },
  {
    id: "PB03",
    name: "Juhoon (Dev Officer)",
    role: "Petugas Lapangan",
    email: "juhoon.coder@simantu.go.id",
    region: "Kecamatan Jatisari",
    avatarColor: "bg-amber-500",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    totalInputs: 9
  },
  {
    id: "PB04",
    name: "Sean (Tester Field)",
    role: "Petugas Lapangan",
    email: "sean.qa@simantu.go.id",
    region: "Kecamatan Mekarsari",
    avatarColor: "bg-purple-500",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    totalInputs: 8
  },
  {
    id: "PB05",
    name: "Zhahara N. Sukirman (Scrum Master)",
    role: "Admin",
    email: "zhahara192@gmail.com", // Matches the user's email perfectly!
    region: "Pusat Kabupaten",
    avatarColor: "bg-indigo-600",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    totalInputs: 0
  },
  {
    id: "PB06",
    name: "Keonho (DevOps Lead)",
    role: "Admin",
    email: "keonho.ops@simantu.go.id",
    region: "Pusat Kabupaten",
    avatarColor: "bg-pink-600",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    totalInputs: 0
  },
  {
    id: "PB07",
    name: "Dukcapil Admin Pusat",
    role: "Admin",
    email: "admin.dukcapil@simantu.go.id",
    region: "Dinas Kependudukan",
    avatarColor: "bg-teal-600",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    totalInputs: 0
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-001",
    officerId: "PB01",
    officerName: "Martin (Senior Analyst)",
    date: "2026-05-20",
    nik: "3273012304910002",
    citizenName: "Budi Santoso",
    changeType: "Perubahan Kelas Pendapatan",
    details: "Pendapatan turun drastis dari Kelas Menengah (Rp 7jt/bln) ke Kelas Rentan Miskin (Rp 1.8jt/bln) akibat PHK usaha tekstil regional.",
    region: "Kecamatan Sukamaju",
    evidenceType: "PNG",
    evidenceUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60",
    status: "Approved",
    adminComment: "Persetujuan sistem otomatis divalidasi dengan surat PHK resmi dari disnakertrans setempat.",
    previousValue: "Kelas Menengah",
    newValue: "Kelas Rentan Miskin"
  },
  {
    id: "SUB-002",
    officerId: "PB01",
    officerName: "Martin (Senior Analyst)",
    date: "2026-05-22",
    nik: "3273010512880005",
    citizenName: "Siti Rahmawati",
    changeType: "Penerima Bansos",
    details: "Pengusulan penerimaan bantuan PKH Kategori Ibu Hamil & Lansia setelah status sosial terdaftar DTKS.",
    region: "Kecamatan Sukamaju",
    evidenceType: "PDF",
    evidenceUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=60",
    status: "Approved",
    adminComment: "Sesuai dengan hasil musyawarah kelurahan terakhir. Verifikasi pusat sinkron.",
    previousValue: "Non-Bansos",
    newValue: "Penerima PKH"
  },
  {
    id: "SUB-003",
    officerId: "PB02",
    officerName: "James (UI/UX Rep)",
    date: "2026-05-25",
    nik: "3273021908950001",
    citizenName: "Hendra Wijaya",
    changeType: "Status Pekerjaan",
    details: "Perubahan status pekerjaan dari 'Pegawai Swasta' menjadi 'Wiraswasta Mandiri' (Buka kios kelontong paska pensiun dini).",
    region: "Kecamatan Sukaresmi",
    evidenceType: "JPG",
    evidenceUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60",
    status: "Approved",
    adminComment: "Dokumen NIB (Nomor Induk Berusaha) tervalidasi di sistem OSS.",
    previousValue: "Pegawai Swasta",
    newValue: "Wiraswasta Mandiri"
  },
  {
    id: "SUB-004",
    officerId: "PB02",
    officerName: "James (UI/UX Rep)",
    date: "2026-05-28",
    nik: "3273022204760004",
    citizenName: "Dewi Lestari",
    changeType: "Status Sosial",
    details: "Pembaruan status kependudukan dari Kawin menjadi Cerai Mati (Suami wafat pada April 2026). Diusulkan bansos janda miskin.",
    region: "Kecamatan Sukaresmi",
    evidenceType: "PNG",
    evidenceUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=60",
    status: "Rejected",
    adminComment: "Foto akta kematian kurang jelas dan resolusi sangat rendah. Silakan upload ulang dengan pemindaian scanner yang tajam.",
    previousValue: "Kawin",
    newValue: "Cerai Mati"
  },
  {
    id: "SUB-005",
    officerId: "PB03",
    officerName: "Juhoon (Dev Officer)",
    date: "2026-06-02",
    nik: "3273031010990003",
    citizenName: "Rian Hidayat",
    changeType: "Status Pekerjaan",
    details: "Mendapatkan pekerjaan tetap sebagai 'Karyawan Swasta' di sektor logistik, sebelumnya 'Buruh Harian Lepas'.",
    region: "Kecamatan Jatisari",
    evidenceType: "PDF",
    evidenceUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=60",
    status: "Approved",
    adminComment: "Persetujuan sistem. Data BPJS Ketenagakerjaan sinkron dengan pendaftaran perusahaan paska kontrak baru.",
    previousValue: "Buruh Harian Lepas",
    newValue: "Karyawan Swasta"
  },
  {
    id: "SUB-006",
    officerId: "PB03",
    officerName: "Juhoon (Dev Officer)",
    date: "2026-06-05",
    nik: "3273030307840008",
    citizenName: "Aminah Yusuf",
    changeType: "Perubahan Kelas Pendapatan",
    details: "Pendapatan meningkat signifikan dari Kelas Rentan ke Kelas Menengah setelah usaha katering rumahannya berkembang pesat.",
    region: "Kecamatan Jatisari",
    evidenceType: "JPG",
    evidenceUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Rentan Miskin",
    newValue: "Kelas Menengah"
  },
  {
    id: "SUB-007",
    officerId: "PB04",
    officerName: "Sean (Tester Field)",
    date: "2026-06-08",
    nik: "3273041411800002",
    citizenName: "Slamet Riyadi",
    changeType: "Penerima Bansos",
    details: "Pengajuan penghentian bansos secara mandiri (Graduasi Mandiri) karena kondisi ekonomi keluarga sudah mapan & mandiri.",
    region: "Kecamatan Mekarsari",
    evidenceType: "PNG",
    evidenceUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=60",
    status: "Approved",
    adminComment: "Apresiasi atas kejujuran dan graduasi mandiri warga. Surat pernyataan graduasi diarsipkan.",
    previousValue: "Penerima Bansos Tunai",
    newValue: "Non-Bansos (Graduasi Mandiri)"
  },
  {
    id: "SUB-008",
    officerId: "PB04",
    officerName: "Sean (Tester Field)",
    date: "2026-06-10",
    nik: "3273040103920005",
    citizenName: "Kartika Sari",
    changeType: "Perubahan Kelas Pendapatan",
    details: "Usulan penurunan kelas karena suami sakit stroke permanen, kehilangan tumpuan pencari nafkah utama.",
    region: "Kecamatan Mekarsari",
    evidenceType: "PDF",
    evidenceUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Kelas Menengah",
    newValue: "Rentan Miskin"
  },
  {
    id: "SUB-009",
    officerId: "PB01",
    officerName: "Martin (Senior Analyst)",
    date: "2026-06-11",
    nik: "3273010903730006",
    citizenName: "Agus Setiawan",
    changeType: "Status Pekerjaan",
    details: "Beralih pekerjaan dari pengojek pangkalan konvensional menjadi Mitra Driver Ojek Online terdaftar.",
    region: "Kecamatan Sukamaju",
    evidenceType: "JPG",
    evidenceUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Pekerja Lepas",
    newValue: "Mitra Driver Online"
  },
  {
    id: "SUB-010",
    officerId: "PB02",
    officerName: "James (UI/UX Rep)",
    date: "2026-06-12",
    nik: "3273022510820003",
    citizenName: "Ratna Sari",
    changeType: "Status Sosial",
    details: "Status dari Gadis/Belum Kawin menjadi Kawin. Suami merupakan PNS Kecamatan Sukaresmi.",
    region: "Kecamatan Sukaresmi",
    evidenceType: "JPG",
    evidenceUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Belum Kawin",
    newValue: "Kawin"
  },
  {
    id: "SUB-011",
    officerId: "PB03",
    officerName: "Juhoon (Dev Officer)",
    date: "2026-06-13",
    nik: "3273033112890001",
    citizenName: "Eko Prasetyo",
    changeType: "Penerima Bansos",
    details: "Pengajuan baru KIP Kuliah (Kartu Indonesia Pintar) untuk anak sulung yang lolos seleksi perguruan tinggi negeri.",
    region: "Kecamatan Jatisari",
    evidenceType: "PDF",
    evidenceUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Bukan Penerima KIP",
    newValue: "Penerima KIP Kuliah"
  },
  {
    id: "SUB-012",
    officerId: "PB04",
    officerName: "Sean (Tester Field)",
    date: "2026-06-14",
    nik: "3273040310860007",
    citizenName: "Aris Munandar",
    changeType: "Perubahan Kelas Pendapatan",
    details: "Laporan data kemiskinan ekstrem baru. Kondisi lansia sebatang kara tdk berdaya scr fisik.",
    region: "Kecamatan Mekarsari",
    evidenceType: "PNG",
    evidenceUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&auto=format&fit=crop&q=60",
    status: "Pending",
    adminComment: "",
    previousValue: "Rentan Miskin",
    newValue: "Miskin Ekstrem"
  }
];

export const API_SYNC_LOGS: ApiSyncLog[] = [
  { id: "S-101", apiName: "DTKS Bansos API", date: "2026-06-14", recordsSynced: 124, status: "Success", latencyMs: 145, syncType: "Automatic Scheduled" },
  { id: "S-102", apiName: "Kemenkeu Pajak API", date: "2026-06-14", recordsSynced: 89, status: "Success", latencyMs: 210, syncType: "Automatic Scheduled" },
  { id: "S-103", apiName: "Dukcapil Pusat API", date: "2026-06-14", recordsSynced: 562, status: "Success", latencyMs: 95, syncType: "Automatic Scheduled" },
  
  { id: "S-104", apiName: "DTKS Bansos API", date: "2026-06-13", recordsSynced: 98, status: "Success", latencyMs: 122, syncType: "Automatic Scheduled" },
  { id: "S-105", apiName: "Kemenkeu Pajak API", date: "2026-06-13", recordsSynced: 40, status: "Failed", latencyMs: 3500, syncType: "Automatic Scheduled" },
  { id: "S-106", apiName: "Dukcapil Pusat API", date: "2026-06-13", recordsSynced: 411, status: "Success", latencyMs: 88, syncType: "Automatic Scheduled" },
  
  { id: "S-107", apiName: "Kemenkeu Pajak API", date: "2026-06-13", recordsSynced: 40, status: "Success", latencyMs: 190, syncType: "Manual Sync" },
  
  { id: "S-108", apiName: "DTKS Bansos API", date: "2026-06-12", recordsSynced: 115, status: "Success", latencyMs: 130, syncType: "Automatic Scheduled" },
  { id: "S-109", apiName: "Kemenkeu Pajak API", date: "2026-06-12", recordsSynced: 76, status: "Success", latencyMs: 204, syncType: "Automatic Scheduled" },
  { id: "S-110", apiName: "Dukcapil Pusat API", date: "2026-06-12", recordsSynced: 603, status: "Success", latencyMs: 110, syncType: "Automatic Scheduled" },
  
  { id: "S-111", apiName: "DTKS Bansos API", date: "2026-06-11", recordsSynced: 142, status: "Success", latencyMs: 155, syncType: "Automatic Scheduled" },
  { id: "S-112", apiName: "Kemenkeu Pajak API", date: "2026-06-11", recordsSynced: 93, status: "Success", latencyMs: 198, syncType: "Automatic Scheduled" },
  { id: "S-113", apiName: "Dukcapil Pusat API", date: "2026-06-11", recordsSynced: 498, status: "Success", latencyMs: 102, syncType: "Automatic Scheduled" },
  
  { id: "S-114", apiName: "DTKS Bansos API", date: "2026-06-10", recordsSynced: 88, status: "Success", latencyMs: 118, syncType: "Automatic Scheduled" },
  { id: "S-115", apiName: "Kemenkeu Pajak API", date: "2026-06-10", recordsSynced: 54, status: "Success", latencyMs: 240, syncType: "Automatic Scheduled" },
  { id: "S-116", apiName: "Dukcapil Pusat API", date: "2026-06-10", recordsSynced: 512, status: "Success", latencyMs: 91, syncType: "Automatic Scheduled" }
];

export const SCRUM_PERFORMANCES: SprintPerformance[] = [
  // Sprint 1
  { sprint: "Sprint 1", role: "Developer", estimasi: 9, realisasi: 10 }, // PB01, PB02, PB05 roles
  { sprint: "Sprint 1", role: "UI/UX", estimasi: 5, realisasi: 4 },
  { sprint: "Sprint 1", role: "DevOps", estimasi: 3, realisasi: 5 }, // CORS blocker on staging
  { sprint: "Sprint 1", role: "Tester", estimasi: 4, realisasi: 3 },

  // Sprint 2
  { sprint: "Sprint 2", role: "Developer", estimasi: 8, realisasi: 7 },
  { sprint: "Sprint 2", role: "UI/UX", estimasi: 3, realisasi: 3 },
  { sprint: "Sprint 2", role: "DevOps", estimasi: 3, realisasi: 2 },
  { sprint: "Sprint 2", role: "Tester", estimasi: 5, realisasi: 6 },

  // Sprint 3
  { sprint: "Sprint 3", role: "Developer", estimasi: 12, realisasi: 11 },
  { sprint: "Sprint 3", role: "UI/UX", estimasi: 7, realisasi: 6 },
  { sprint: "Sprint 3", role: "DevOps", estimasi: 4, realisasi: 4 },
  { sprint: "Sprint 3", role: "Tester", estimasi: 5, realisasi: 5 },

  // Sprint 4
  { sprint: "Sprint 4", role: "Developer", estimasi: 10, realisasi: 9 },
  { sprint: "Sprint 4", role: "UI/UX", estimasi: 5, realisasi: 5 },
  { sprint: "Sprint 4", role: "DevOps", estimasi: 7, realisasi: 6 },
  { sprint: "Sprint 4", role: "Tester", estimasi: 6, realisasi: 5 }
];
