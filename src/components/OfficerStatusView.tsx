/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Submission, UserAccount } from "../types";
import { Eye, Clock, CheckCircle2, AlertTriangle, FileText, X, Bookmark, Download, Check } from "lucide-react";

interface OfficerStatusViewProps {
  currentOfficer: UserAccount;
  submissions: Submission[];
}

export default function OfficerStatusView({
  currentOfficer,
  submissions
}: OfficerStatusViewProps) {
  // Row-Level Security: Only load submissions created by this officer
  const mySubmissions = submissions.filter((s) => s.officerId === currentOfficer.id);

  // Selected Submission state for inline detailed modal overlay
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const activeSub = mySubmissions.find((s) => s.id === selectedSubId);

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadMySubmissions = () => {
    setDownloadSuccess(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Data_Usulan_${currentOfficer.name.replace(/\s+/g, "_")}_${dateStr}.csv`;
    
    const headers = ["ID Usulan", "Tanggal", "NIK", "Nama Warga", "Wilayah Tugas", "Jenis Perubahan", "Status SLA", "Catatan Detail", "Komentar Admin"];
    const rows = mySubmissions.map(s => [
      s.id,
      s.date,
      s.nik,
      s.citizenName,
      s.region,
      s.changeType,
      s.status,
      s.details,
      s.adminComment || "-"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadSuccess(`Sukses! ${mySubmissions.length} usulan mandiri Anda berhasil diekspor ke file "${fileName}".`);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="view-officer-status">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Status Pelacakan Mandiri</h2>
        <p className="text-xs text-gray-400 font-medium font-mono">DAFTAR PENGAJUAN SAYA • WILAYAH KERJA: {currentOfficer.region.toUpperCase()}</p>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-500 hover:text-emerald-800 font-bold text-[10px] cursor-pointer">Tutup</button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-250">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Histori Pengusulan Saya</h3>
            <p className="text-xs text-gray-400 font-medium">Lacak status tuntas persetujuan data dari dinas administratif pusat.</p>
          </div>

          <button
            onClick={handleDownloadMySubmissions}
            disabled={mySubmissions.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#535CE8] hover:bg-[#434AC7] disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV ({mySubmissions.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 font-mono">
                <th className="px-5 py-4">Tanggal Input</th>
                <th className="px-5 py-4">Nama Warga</th>
                <th className="px-5 py-4">Wilayah Tugas</th>
                <th className="px-5 py-4">Jenis Perubahan</th>
                <th className="px-5 py-4 text-center">Dokumen Pendukung</th>
                <th className="px-5 py-4 text-center">Status SLA</th>
                <th className="px-5 py-4 text-center">Tinjauan</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
              {mySubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 font-medium italic">
                    Belum mengirim usulan status. Silakan isi form pada menu "Input Data".
                  </td>
                </tr>
              ) : (
                mySubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Tanggal */}
                    <td className="px-5 py-3.5 font-mono">{sub.date}</td>
                    
                    {/* Nama Warga & NIK */}
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-extrabold text-gray-950 block">{sub.citizenName}</span>
                        <span className="text-[9px] text-gray-400 block font-mono">NIK: {sub.nik}</span>
                      </div>
                    </td>

                    {/* Wilayah */}
                    <td className="px-5 py-3.5 font-medium">{sub.region}</td>

                    {/* Jenis Perubahan */}
                    <td className="px-5 py-3.5">
                      <span className="inline-block bg-indigo-50/50 text-[#535CE8] text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-100/50">
                        {sub.changeType}
                      </span>
                    </td>

                    {/* Dokumen */}
                    <td className="px-5 py-3.5 text-center">
                      <a
                        href={sub.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline text-[#535CE8] font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>[.]{sub.evidenceType}</span>
                      </a>
                    </td>

                    {/* Status badge with conditional formatting consistent with guidelines */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold ${
                        sub.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : sub.status === "Rejected"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          sub.status === "Approved" ? "bg-emerald-500" : sub.status === "Rejected" ? "bg-rose-500" : "bg-amber-500"
                        }`} />
                        {sub.status === "Approved" ? "TERVERIFIKASI" : sub.status === "Rejected" ? "DITANDAI" : "TERTUNDA"}
                      </span>
                    </td>

                    {/* Action Eye button */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedSubId(sub.id)}
                        className="p-1 px-2 inline-flex items-center gap-1 bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#535CE8] hover:bg-[#F0F1FE] rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review overlay modal */}
      {selectedSubId && activeSub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="officer-detail-modal">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
            
            <div className="p-5 bg-gradient-to-r from-[#535CE8] to-indigo-600 text-white relative">
              <button 
                onClick={() => setSelectedSubId(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-bold font-mono text-indigo-100">PELACAKAN USULAN • ID: {activeSub.id}</h4>
              <h3 className="text-base font-extrabold tracking-tight mt-1">{activeSub.citizenName}</h3>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold block">TANGGAL SUBMIT</span>
                  <span className="font-mono font-bold text-gray-800 mt-1 block">{activeSub.date}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[9px] text-gray-400 font-bold block">STATUS VERIFIKASI</span>
                  <span className={`font-bold mt-1 block ${
                    activeSub.status === "Approved" ? "text-emerald-600" : activeSub.status === "Rejected" ? "text-rose-600" : "text-amber-600"
                  }`}>
                    {activeSub.status === "Approved" ? "TERVERIFIKASI (Approved)" : activeSub.status === "Rejected" ? "DITANDAI (Rejected)" : "TERTUNDA (Pending)"}
                  </span>
                </div>
              </div>

              {/* Komparasi */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <span className="text-[9px] text-gray-400 font-bold block">DETAIL TRANSAKSI VARIANS:</span>
                <div className="flex items-center justify-between font-bold text-gray-800 text-xs">
                  <span className="line-through text-gray-400 font-semibold">{activeSub.previousValue}</span>
                  <span className="text-gray-400 text-[10px]">➜</span>
                  <span className="text-[#535CE8] font-black">{activeSub.newValue}</span>
                </div>
              </div>

              {/* details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[9px] text-gray-400 font-bold block">DESKRIPSI OPERATOR PENEMUAN:</span>
                <p className="text-gray-600 italic mt-1 leading-relaxed">
                  "{activeSub.details}"
                </p>
              </div>

              {/* Admin Comment feedback if any exists */}
              <div className={`p-4 rounded-xl border flex gap-2.5 ${
                activeSub.status === "Approved"
                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                  : activeSub.status === "Rejected"
                  ? "bg-rose-50/50 border-rose-100 text-rose-900"
                  : "bg-gray-50 border-gray-150 text-gray-500"
              }`}>
                <Bookmark className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  activeSub.status === "Approved" ? "text-emerald-500" : activeSub.status === "Rejected" ? "text-rose-500" : "text-gray-400"
                }`} />
                <div>
                  <span className="text-[9px] font-bold block uppercase tracking-wider font-mono">TANGGAPAN AUDIT DUKCAPIL:</span>
                  <p className="mt-1 italic leading-relaxed">
                    "{activeSub.adminComment || "Pengajuan Anda dalam masa antrean validasi pusat. Pengawas belum meninggalkan catatan."}"
                  </p>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedSubId(null)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs py-2 px-4 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              >
                Tutup Jendela Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
