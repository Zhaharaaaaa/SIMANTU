/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Submission } from "../types";
import { 
  Clock, CheckSquare, Sparkles, FileText, AlertTriangle, 
  Check, X, Search 
} from "lucide-react";

interface AdminVerificationViewProps {
  submissions: Submission[];
  onVerifySubmission: (id: string, status: "Approved" | "Rejected", comment: string) => void;
}

export default function AdminVerificationView({
  submissions,
  onVerifySubmission
}: AdminVerificationViewProps) {
  // Query, search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  // Success Notification state
  const [notification, setNotification] = useState<string | null>(null);

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.nik.includes(searchTerm);
    const matchesStatus = filterStatus === "All" || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Local state for selected item ID
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    filteredSubmissions.length > 0 ? filteredSubmissions[0].id : null
  );

  // Auto-align selected ID is still in list or fallback
  const activeSubId = filteredSubmissions.some((s) => s.id === selectedSubId) 
    ? selectedSubId 
    : (filteredSubmissions.length > 0 ? filteredSubmissions[0].id : null);

  const activeSub = submissions.find((s) => s.id === activeSubId);

  // Form audit comment for selected item
  const [auditComment, setAuditComment] = useState("");

  // Handle verification action (System Admin approves/rejects)
  const handleVerifyAction = (status: "Approved" | "Rejected") => {
    if (!activeSub) return;
    
    onVerifySubmission(activeSub.id, status, auditComment || `Telah diverifikasi sebagai ${status === "Approved" ? "DISETUJUI" : "DITOLAK"} oleh Administrator.`);
    
    setNotification(`Sukses! Pengajuan ${activeSub.citizenName} (${activeSub.id}) telah ${status === "Approved" ? "disetujui" : "ditolak"}.`);
    setAuditComment("");
    
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Metric calculation
  const totalSubCount = submissions.length;
  const approvedCount = submissions.filter(s => s.status === "Approved").length;
  const pendingCount = submissions.filter(s => s.status === "Pending").length;
  const rejectedCount = submissions.filter(s => s.status === "Rejected").length;

  return (
    <div className="space-y-6 animate-fadeIn" id="view-admin-verification">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-950 tracking-tight font-sans">Verifikasi & Manajemen Pengajuan</h2>
          <p className="text-xs text-gray-500 font-semibold font-sans">Validator penilaian kelayakan data, pemutakhiran, dan administrasi database sosial kependudukan.</p>
        </div>
      </div>

      {/* Success notification banner */}
      {notification && (
        <div className="bg-emerald-50 border border-gray-200 text-emerald-800 text-xs font-extrabold px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-bounce" id="verification-banner-notification">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-500 hover:text-emerald-800 font-bold font-mono">OK</button>
        </div>
      )}

      {/* Baris Metrik Real-time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="efficiency-metrics-row">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Total Pengajuan</span>
            <span className="text-2xl font-black text-gray-900 block mt-1 font-sans">{totalSubCount}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-[#535CE8] rounded-xl font-bold font-mono text-[10px]">
            ALL
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Antrean Pending</span>
            <span className="text-2xl font-black text-amber-600 block mt-1 font-sans">{pendingCount}</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Telah Disetujui</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1 font-sans">{approvedCount}</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Telah Ditolak</span>
            <span className="text-2xl font-black text-rose-600 block mt-1 font-sans">{rejectedCount}</span>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <X className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN KIRI (5 unit): Antrean Queue List, Search bar, Filters */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight font-sans">Antrean & Riwayat</h4>
            </div>

            {/* Pencarian dan Penyaringan */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Nama atau NIK penduduk..." 
                  className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#535CE8] focus:border-[#535CE8] placeholder-gray-400 text-gray-800 font-sans"
                />
              </div>

              {/* Status Tabs Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap font-sans ${
                      filterStatus === status 
                        ? "bg-gray-200 text-gray-855" 
                        : "bg-gray-100/50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {status === "All" ? "Semua" : status === "Pending" ? "Pending" : status === "Approved" ? "Disetujui" : "Ditolak"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[500px]">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs italic font-sans animate-fadeIn">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <span>Tidak ada pengajuan yang sesuai dengan filter pencarian.</span>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isActive = activeSubId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubId(sub.id);
                    }}
                    className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                      isActive
                        ? "bg-[#F0F1FE] border-l-4 border-[#535CE8]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-gray-950 truncate font-sans">{sub.citizenName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">NIK: {sub.nik} • {sub.region}</div>
                      
                      <span className="inline-block mt-2 bg-white border border-gray-200 text-[#535CE8] text-[8px] font-black px-2 py-0.5 rounded-md uppercase font-mono tracking-wider shadow-2xs">
                        {sub.changeType}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] text-gray-450 font-mono block mb-1">{sub.date}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border tracking-wider font-mono ${
                        sub.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-gray-250"
                          : sub.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border-gray-250"
                          : "bg-amber-50 text-amber-700 border-gray-250"
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN KANAN (7 unit): DETAIL VIEW */}
        <div className="lg:col-span-7">
          
          {!activeSub ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-400 italic font-sans animate-fadeIn">
              <Sparkles className="w-12 h-12 text-[#535CE8]/30 mx-auto mb-4 animate-pulse" />
              <h4 className="text-sm font-bold text-gray-900 font-sans">Belum Ada Pengajuan Terpilih</h4>
              <p className="text-xs mt-2 max-w-sm mx-auto font-sans">Silakan klik salah satu pemohon di daftar antrean sebelah kiri untuk menguji data atau memverifikasi kriteria kelayakan.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn" id="popup-verification-card">
              
              {/* Header Detail Box */}
              <div className="bg-slate-100 border-b border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[9px] font-bold bg-gray-200 text-gray-700 uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                    REDUNDANCY AUDIT • ID: {activeSub.id}
                  </span>
                  <h3 className="text-base font-extrabold tracking-tight mt-1 text-gray-900 font-sans">
                    Pemohon: {activeSub.citizenName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={activeSub.evidenceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100/70 text-[#535CE8] border border-gray-250 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all font-sans"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Sertifikat</span>
                  </a>
                </div>
              </div>

              {/* Comparing Data Panel Section */}
              <div className="p-6 space-y-6">
                
                {/* Info Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-150 text-xs font-sans">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">NIK</span>
                    <span className="font-mono text-xs font-bold text-gray-800 mt-1 block">{activeSub.nik}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">Operator Lapangan</span>
                    <span className="text-xs font-bold text-gray-800 mt-1 block font-sans">{activeSub.officerName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">Wilayah / Rayon</span>
                    <span className="text-xs font-bold text-gray-800 mt-1 block font-sans">{activeSub.region}</span>
                  </div>
                </div>

                {/* Perbandingan Data */}
                <div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5 font-mono">KOMPARASI MULTI-VARIANS DATA :</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block font-sans">DATA SEBELUMNYA DI DATABASE</span>
                      <div className="mt-2 text-xs font-extrabold text-slate-500 line-through truncate font-sans">
                        {activeSub.previousValue || "Belum terekam klasifikasi"}
                      </div>
                    </div>

                    <div className="bg-indigo-50/40 p-4 rounded-xl border border-gray-200">
                      <span className="text-[9px] text-[#535CE8] font-bold uppercase tracking-widest block font-sans">PERUBAHAN YANG DIAJUKAN</span>
                      <div className="mt-2 text-xs font-black text-[#535CE8] truncate font-sans">
                        {activeSub.newValue || "Data baru kosong"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tanggapan Hasil Investigasi Lapangan */}
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide block font-mono">INVESTIGASI LAPANGAN :</span>
                    <p className="text-xs text-gray-700 mt-1 italic leading-relaxed font-sans">
                      "{activeSub.details}"
                    </p>
                  </div>
                </div>

                {/* State Condition: If status is NOT Pending, display confirmation parameters block */}
                {activeSub.status !== "Pending" ? (
                  <div className={`p-4 rounded-xl border ${
                    activeSub.status === "Approved" 
                      ? "bg-emerald-50/50 border-gray-200 text-emerald-900" 
                      : "bg-rose-50/50 border-gray-200 text-rose-900"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        activeSub.status === "Approved" ? "bg-emerald-500" : "bg-rose-500"
                      }`} />
                      <span className="text-[11px] font-black uppercase tracking-wider font-mono">
                        PENGAJUAN TELAH {activeSub.status === "Approved" ? "DISETUJUI" : "DITOLAK"}
                      </span>
                    </div>
                    {activeSub.adminComment && (
                      <p className="text-xs mt-2 italic text-gray-600 border-t border-gray-200/50 pt-2 font-medium font-sans">
                        Catatan Admin: "{activeSub.adminComment}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* If activeSub IS Pending, display verification comment inputs */
                  <div className="space-y-4 pt-2 border-t border-gray-150">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Tulis Keputusan Audit</label>
                      <textarea
                        rows={2}
                        placeholder="Tulis tanggapan persetujuan/penolakan data..."
                        value={auditComment}
                        onChange={(e) => setAuditComment(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#535CE8] text-gray-700 placeholder-gray-400 font-sans"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleVerifyAction("Rejected")}
                        className="px-4 py-2 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl border border-gray-250 transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak Pengajuan</span>
                      </button>

                      <button
                        onClick={() => handleVerifyAction("Approved")}
                        className="px-5 py-2.5 bg-[#535CE8] hover:bg-[#434AC7] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 font-sans"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui Data</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
