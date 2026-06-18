/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Submission, UserAccount, ChangeCategory } from "../types";
import { 
  FileText, CheckCircle2, XCircle, Clock, Plus, ExternalLink, 
  MapPin, Send, AlertCircle, Eye, FileInput
} from "lucide-react";

interface OfficerDashboardProps {
  currentOfficer: UserAccount;
  submissions: Submission[];
  onSubmitNewSubmission: (submission: Omit<Submission, "id" | "officerId" | "officerName" | "region" | "status" | "adminComment">) => void;
}

export default function OfficerDashboard({
  currentOfficer,
  submissions,
  onSubmitNewSubmission
}: OfficerDashboardProps) {
  // Filter submissions belonging to this officer
  const mySubmissions = submissions.filter((s) => s.officerId === currentOfficer.id);

  // States for stats
  const totalMyInputs = mySubmissions.length;
  const totalApproved = mySubmissions.filter((s) => s.status === "Approved").length;
  const totalRejected = mySubmissions.filter((s) => s.status === "Rejected").length;
  const totalPending = mySubmissions.filter((s) => s.status === "Pending").length;

  // Form states for new entry
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [nik, setNik] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [changeType, setChangeType] = useState<ChangeCategory>("Perubahan Kelas Pendapatan");
  const [previousValue, setPreviousValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [details, setDetails] = useState("");
  const [evidenceType, setEvidenceType] = useState<"PDF" | "JPG" | "PNG">("JPG");
  const [evidenceUrl, setEvidenceUrl] = useState("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Validate
    if (nik.length !== 16 || isNaN(Number(nik))) {
      setFormError("NIK harus tepat 16 digit angka.");
      return;
    }
    if (!citizenName.trim()) {
      setFormError("Nama warga wajib diisi.");
      return;
    }
    if (!previousValue.trim() || !newValue.trim()) {
      setFormError("Status sebelum dan sesudah perubahan harus diisi.");
      return;
    }
    if (!details.trim() || details.length < 15) {
      setFormError("Keterangan perubahan harus diisi minimal 15 karakter.");
      return;
    }

    // Submit
    onSubmitNewSubmission({
      date: new Date().toISOString().split("T")[0],
      nik,
      citizenName,
      changeType,
      details,
      evidenceType,
      evidenceUrl,
      previousValue,
      newValue
    });

    // Reset Form
    setNik("");
    setCitizenName("");
    setPreviousValue("");
    setNewValue("");
    setDetails("");
    setFormSuccess("Laporan perubahan berhasil diajukan! Menunggu verifikasi admin.");
    
    // Auto collapse after a short period
    setTimeout(() => {
      setFormSuccess("");
      setIsFormOpen(false);
    }, 3000);
  };

  // Image bank for fast testing
  const SAMPLE_IMAGES = [
    { name: "Berkas Pendapatan (Slip / Surat)", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60" },
    { name: "Surat Kematian / Cerai", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=60" },
    { name: "Bukti Penerimaan Bansos / KIP", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=60" },
    { name: "Foto Kondisi Lapangan", url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop&q=60" }
  ];

  return (
    <div className="space-y-6" id="officer-dashboard-layout">
      {/* Officer Header Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-gray-400">Wilayah Tugas:</span>
            <span className="bg-[#EAF2F8] text-[#0F4C81] text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1 font-mono">
              <MapPin className="w-3 h-3 mr-1" /> {currentOfficer.region}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1" id="officer-welcome-title">
            Dashboard Riwayat {currentOfficer.name}
          </h1>
          <p className="text-sm text-[#4A5568] mt-0.5">
            Berikut adalah laporan perubahan kependudukan mandiri yang telah Anda input untuk wilayah kerja Anda.
          </p>
        </div>

        {/* Create new button */}
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-[#0F4C81] text-white hover:bg-[#0c3d68] transition-colors px-4 py-2 rounded-md shadow-sm font-medium text-sm flex items-center space-x-2"
          id="toggle-input-form-btn"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? "Tutup Formulir" : "Ajukan Perubahan Baru"}</span>
        </button>
      </div>

      {/* Scorecards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="officer-scorecards">
        {/* Card 1: Total Inputs */}
        <div className="bg-[#EAF2F8] border border-blue-200/60 p-5 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-blue-900/70 uppercase tracking-wider font-mono">Total Pengajuan Saya</p>
            <h3 className="text-3xl font-extrabold text-[#0F4C81] mt-1 font-sans">{totalMyInputs}</h3>
            <p className="text-[10px] text-blue-800/60 mt-1 font-mono">Seluruh data yang diinput</p>
          </div>
          <div className="bg-white/80 p-3 rounded-full text-[#0F4C81]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-emerald-900/70 uppercase tracking-wider font-mono">Disetujui Admin</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-sans">{totalApproved}</h3>
            <p className="text-[10px] text-emerald-800/60 mt-1 font-mono">Validasi tersimpan ke pusat</p>
          </div>
          <div className="bg-white/80 p-3 rounded-full text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-rose-50 border border-rose-200/60 p-5 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-rose-900/70 uppercase tracking-wider font-mono">Ditolak Admin</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1 font-sans">{totalRejected}</h3>
            <p className="text-[10px] text-rose-800/60 mt-1 font-mono">Perlu perbaikan berkas</p>
          </div>
          <div className="bg-white/80 p-3 rounded-full text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pending */}
        <div className="bg-amber-50 border border-amber-200/60 p-5 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-amber-900/70 uppercase tracking-wider font-mono">Menunggu Verifikasi</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1 font-sans">{totalPending}</h3>
            <p className="text-[10px] text-amber-800/60 mt-1 font-mono">Dalam antrean persetujuan</p>
          </div>
          <div className="bg-white/80 p-3 rounded-full text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* New Submission Collapsed Form (PB02 Story Feature) */}
      {isFormOpen && (
        <form 
          onSubmit={handleFormSubmit}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-md space-y-4 animate-fadeIn"
          id="new-submission-form"
        >
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FileInput className="w-5 h-5 text-[#0F4C81] mr-2" />
              Formulir Input Perubahan Sosial & Kependudukan Warga
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lengkapi berkas data dukcapil di bawah. Laporan akan ditransmisikan ke dasbor admin seketika.
            </p>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 text-sm rounded flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm rounded flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NIK */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                NIK Warga (16 Digit)
              </label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Contoh: 3273012304910002"
                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none font-mono"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                Nama Lengkap Warga
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
              />
            </div>

            {/* Change Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                Kategori Perubahan Sosial
              </label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value as ChangeCategory)}
                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none bg-white font-medium"
              >
                <option value="Perubahan Kelas Pendapatan">Perubahan Kelas Pendapatan</option>
                <option value="Status Pekerjaan">Status Pekerjaan</option>
                <option value="Status Sosial">Status Sosial</option>
                <option value="Penerima Bansos">Penerima Bansos</option>
              </select>
            </div>

            {/* Evidence Document Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                Format Berkas Pendukung
              </label>
              <div className="flex space-x-3 mt-1">
                {["JPG", "PNG", "PDF"].map((fmt) => (
                  <label key={fmt} className="flex items-center space-x-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="evidenceType"
                      checked={evidenceType === fmt}
                      onChange={() => setEvidenceType(fmt as any)}
                      className="border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="font-mono text-xs">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Previous Value */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                Kondisi Lama (Sebelum Perubahan)
              </label>
              <input
                type="text"
                value={previousValue}
                onChange={(e) => setPreviousValue(e.target.value)}
                placeholder="Contoh: Pegawai Harian, Kelas Menengah"
                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
              />
            </div>

            {/* New Value */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
                Kondisi Baru (Hasil Pemantauan)
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Contoh: Wiraswasta Mandiri, Rentan Miskin"
                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
              />
            </div>
          </div>

          {/* Details / Justification */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 font-mono">
              Justifikasi & Keterangan Lapangan (Min. 15 Karakter)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Jelaskan kondisi riil warga dan kelayakan dokumen pendukung yang diverifikasi lapangan..."
              className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
            />
          </div>

          {/* Quick Evidence Simulator Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0F4C81] uppercase tracking-wide mb-1.5 font-mono">
              Simulasi Unggahan Berkas Dokumen (Pilih Template Bukti):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => setEvidenceUrl(img.url)}
                  className={`p-2 rounded text-left border text-xs transition-all ${
                    evidenceUrl === img.url 
                      ? "border-[#0F4C81] bg-[#EAF2F8] font-semibold text-[#0F4C81]" 
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <p className="truncate">{img.name}</p>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-3">
              <span className="text-[11px] text-gray-400 font-mono">URL Terunggah:</span>
              <span className="text-[10px] text-[#4A5568] font-mono select-all bg-gray-100 px-2 py-0.5 rounded max-w-lg truncate">
                {evidenceUrl}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded transition-colors flex items-center space-x-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pengajuan</span>
            </button>
          </div>
        </form>
      )}

      {/* Interactive Personal Audit Trail Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" id="personal-audit-trail-card">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Riwayat Mandiri Petugas (Personal Audit Trail)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar pelacakan berkas berdasarkan tanggal pemasukan oleh {currentOfficer.name}.
            </p>
          </div>
          <span className="bg-blue-100 text-[#0F4C81] text-xs font-mono font-bold px-3 py-1 rounded">
            {mySubmissions.length} DATA DITEMUKAN
          </span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">Belum Ada Pengajuan</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Anda belum memasukkan data formulir di wilayah {currentOfficer.region}. Klik "Ajukan Perubahan Baru" untuk memulai.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#EAF2F8]/70 border-b border-gray-200 text-xs font-bold text-[#0F4C81] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Tanggal Input</th>
                  <th className="px-6 py-3.5">NIK / Warga</th>
                  <th className="px-6 py-3.5">Jenis Perubahan</th>
                  <th className="px-6 py-3.5">Detail Kondisi (Lama → Baru)</th>
                  <th className="px-6 py-3.5 text-center">Tautan Bukti</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Catatan Verifikasi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mySubmissions.map((sub) => {
                  return (
                    <tr 
                      key={sub.id} 
                      className="hover:bg-gray-50/50 transition-colors"
                      id={`row-sub-${sub.id}`}
                    >
                      {/* Date */}
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-gray-600">
                        {sub.date}
                      </td>

                      {/* NIK / Name */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{sub.citizenName}</div>
                        <div className="font-mono text-[11px] text-gray-400 mt-0.5">{sub.nik}</div>
                      </td>

                      {/* Change Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                          {sub.changeType}
                        </span>
                      </td>

                      {/* Detail Kondisi */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-xs text-[#4A5568] flex items-center space-x-1.5 mb-1 bg-gray-50 p-1 rounded font-mono">
                          <span className="text-gray-400 truncate max-w-[80px]" title={sub.previousValue}>
                            {sub.previousValue}
                          </span>
                          <span className="text-gray-400">&rarr;</span>
                          <span className="text-[#0F4C81] font-bold truncate max-w-[100px]" title={sub.newValue}>
                            {sub.newValue}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2" title={sub.details}>
                          {sub.details}
                        </div>
                      </td>

                      {/* Evidence */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center">
                          <a
                            href={sub.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0F4C81] hover:underline flex items-center text-xs font-medium space-x-0.5"
                          >
                            <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border text-gray-600 mr-1">
                              {sub.evidenceType}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          
                          {/* Image Thumbnail Tooltip preview */}
                          {sub.evidenceUrl && (
                            <img 
                              src={sub.evidenceUrl} 
                              alt="Thumbnail" 
                              className="w-8 h-8 rounded object-cover border border-gray-200 mt-1 shadow-sm opacity-90"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub.status === "Approved" ? (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>APPROVED</span>
                          </span>
                        ) : sub.status === "Rejected" ? (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>REJECTED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Note / Alasan */}
                      <td className="px-6 py-4 max-w-xs text-xs text-gray-600 italic">
                        {sub.status === "Pending" ? (
                          <span className="text-gray-400">Sedang ditinjau oleh administrator...</span>
                        ) : sub.adminComment ? (
                          <div className="bg-gray-50 border border-gray-100 p-2 rounded">
                            <span className="font-bold text-gray-500 not-italic font-mono block text-[10px] mb-0.5">Catatan Admin:</span>
                            <span>{sub.adminComment}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Tidak ada catatan kelayakan.</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
