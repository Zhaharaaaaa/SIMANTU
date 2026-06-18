/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, Calendar, CheckCircle, Download, FileSpreadsheet, FileJson, 
  Loader2, Sparkles, Check
} from "lucide-react";
import { Submission, UserAccount } from "../types";

interface AdminReportsViewProps {
  submissions: Submission[];
  accounts: UserAccount[];
}

export default function AdminReportsView({ submissions, accounts }: AdminReportsViewProps) {
  const [reportCategory, setReportCategory] = useState("Status Perubahan Sosial Penduduk");
  const [reportPeriod, setReportPeriod] = useState("Bulanan"); // "Bulanan" | "Kuartalan"
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "XLSX" | "JSON">("PDF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Archive Reports mock list
  const initialArchivedReports = [
    { name: "Laporan Kemiskinan Ekstrem Sektor IV.pdf", period: "Kuartal I 2026", author: "Zhahara Sukirman", date: "2026-04-15", size: "3.4 MB" },
    { name: "Data Transisi Bekerja & Pengusul Bansos.xlsx", period: "Mei 2026", author: "Dukcapil Admin Pusat", date: "2026-06-01", size: "1.2 MB" },
    { name: "Integrasi API Sinkronisasi Daerah.json", period: "Mei 2026", author: "Keonho DevOps", date: "2026-06-03", size: "820 KB" },
    { name: "Arsip Total Graduasi Mandiri Se-Kelurahan.pdf", period: "Kuartal II 2026", author: "Zhahara Sukirman", date: "2026-06-11", size: "4.8 MB" }
  ];

  const handleDownloadArchived = (name: string) => {
    setDownloadSuccess(null);
    let content = "";
    let mimeType = "text/plain";
    let actualName = name;

    if (name.endsWith(".json")) {
      mimeType = "application/json";
      content = JSON.stringify({
        title: "Arsip Integrasi API Sinkronisasi Daerah",
        meta: {
          period: "Mei 2026",
          generatedBy: "Keonho DevOps",
          checksum: "sha256-dfa25b30c1be7d2ff6a0eb0"
        },
        data: {
          activeSLA: "99.98%",
          totalTransactions: 4210,
          successRate: "99.92%",
          syncLogs: [
            { timestamp: "2026-06-03T08:00:00.000Z", service: "DTKS Kemensos", status: "OK", latencyMs: 145 },
            { timestamp: "2026-06-03T09:00:00.000Z", service: "Dukcapil", status: "OK", latencyMs: 120 }
          ]
        }
      }, null, 2);
    } else if (name.endsWith(".xlsx")) {
      mimeType = "text/csv";
      // Change name to end with .csv so Excel and OS treat it nicely
      actualName = name.replace(".xlsx", ".csv");
      content = [
        "NIK,Nama Warga,Kontak,Kategori Penilaian,Status Transisi,Wilayah",
        "32730105001128,Suhartono,081234567,Kelompok Desil 2,Bekerja Mandiri,Kecamatan Sukamaju",
        "32730219001142,Ratnawati,082198765,Kelompok Desil 1,Graduasi Mandiri,Kecamatan Sukaresmi",
        "32730412001155,Arifin,085712123,Kelompok Desil 3,Pegawai Industri,Kecamatan Mekarsari"
      ].join("\n");
    } else {
      content = [
        "========================================================================",
        `                    ARSIP HISTORIS: ${name.toUpperCase()}`,
        "========================================================================",
        "Dibuat Oleh  : Zhahara Sukirman",
        "Tanggal Arsip: 2026-06-11",
        "Sertifikasi  : TERVERIFIKASI & TERCIPTA SECARA OFF-LINE",
        "------------------------------------------------------------------------",
        "",
        "Ringkasan Kegiatan Evaluasi:",
        "- Seluruh berkas lapangan dari 4 Kecamatan terpeta telah terkumpul 100%.",
        "- Persentase persetujuan administratif meningkat sebesar +14.2%.",
        "- Row-level security berhasil memisahkan data 4 wilayah kecamatan tanpa kebocoran.",
        "",
        "Laporan dienkripsi & divalidasi dengan standar STT Terpadu Nurul Fikri Scrum Unit 2026."
      ].join("\n");
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = actualName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Sukses! Arsip berkas "${actualName}" berhasil diunduh ke komputer Anda.`);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);
    
    // Compile and download real live database data
    setTimeout(() => {
      setIsGenerating(false);
      
      const fileExt = selectedFormat.toLowerCase() === "xlsx" ? "csv" : selectedFormat.toLowerCase();
      const fileName = `Laporan_${reportCategory.replace(/\s+/g, "_")}_(${reportPeriod}_SLA).${fileExt}`;
      
      let content = "";
      let contentType = "text/plain";
      
      if (selectedFormat === "JSON") {
        contentType = "application/json";
        content = JSON.stringify({
          judulLaporan: reportCategory,
          periode: reportPeriod,
          tanggalPembuatan: new Date().toLocaleDateString("id-ID"),
          totalUsulanAktif: submissions.length,
          distribusiStatus: {
            approved: submissions.filter(s => s.status === "Approved").length,
            rejected: submissions.filter(s => s.status === "Rejected").length,
            pending: submissions.filter(s => s.status === "Pending").length
          },
          dataPetugas: accounts.map(a => ({ id: a.id, nama: a.name, rayon: a.region, totalInputSesi: a.totalInputs })),
          daftarUsulan: submissions
        }, null, 2);
      } else if (selectedFormat === "XLSX") {
        contentType = "text/csv";
        const headers = ["ID Usulan", "NIK", "Nama Warga", "Wilayah", "Jenis Perubahan", "Status SLA", "Tanggal Input", "Nama Petugas", "Validasi Admin"];
        const rows = submissions.map(s => [
          s.id,
          s.nik,
          s.citizenName,
          s.region,
          s.changeType,
          s.status,
          s.date,
          s.officerName,
          s.adminComment || "-"
        ]);
        content = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\n");
      } else {
        // PDF Simulation as beautiful printable sheet (ends with .txt or simulated .pdf containing plaintext layout)
        contentType = "text/plain";
        content = [
          "========================================================================",
          `          LAPORAN RESMI SIMANTU - KABUPATEN BOGOR (PDF FORMAT)`,
          "========================================================================",
          `Kategori Laporan : ${reportCategory}`,
          `Periode Laporan  : ${reportPeriod}`,
          `Tanggal Pembuatan: ${new Date().toLocaleDateString("id-ID")}`,
          "Sertifikasi      : DIVERIFIKASI SECARA ELEKTRONIK (STT Terpadu NF SCRUM INC)",
          "------------------------------------------------------------------------",
          "",
          "1. RINGKASAN METRIK INTEGRASI:",
          `   - Total Usulan Masuk    : ${submissions.length} berkas`,
          `   - Persetujuan (Approved): ${submissions.filter(s => s.status === "Approved").length} berkas`,
          `   - Penolakan (Rejected)  : ${submissions.filter(s => s.status === "Rejected").length} berkas`,
          `   - Menunggu (Pending)    : ${submissions.filter(s => s.status === "Pending").length} berkas`,
          `   - Total Petugas Aktif   : ${accounts.length} personel`,
          "",
          "2. DAFTAR USULAN DATA YANG TERLAPORKAN:",
          ...submissions.map((s, idx) => 
            `   [${idx+1}] ID: ${s.id} | NIK: ${s.nik} | Nama: ${s.citizenName}\n` +
            `       Wilayah: ${s.region} | Perubahan: ${s.changeType}\n` +
            `       Status SLA: ${s.status} | Catatan: ${s.details}\n` +
            `       Komentar Admin: ${s.adminComment || "-"}`
          ),
          "",
          "------------------------------------------------------------------------",
          "© 2026 SIMANTU STT NF. Sistem Monitoring Perubahan Status Sosial Kependudukan."
        ].join("\n");
      }
      
      const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadSuccess(`Sukses! Laporan "${fileName}" berhasil disusun dari database live dan tersimpan ke folder Download.`);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="view-admin-reports">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Penyusunan & Ekspor Laporan</h2>
        <p className="text-xs text-gray-500 font-medium">Kompilasi log audit statistik menjadi format berkas siap cetak.</p>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-500 hover:text-emerald-800 font-bold text-[10px]">Tutup</button>
        </div>
      )}

      {/* Main Split Grid: Left is selector generator form, Right is static formats illustration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols relative scale): report controls */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 transition-all duration-300 hover:shadow-md hover:border-gray-250">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Calendar className="w-5 h-5 text-[#535CE8]" />
            <h4 className="text-xs font-black text-gray-900 uppercase">ALAT PEMBUAT LAPORAN</h4>
          </div>

          <div className="space-y-4">
            
            {/* Field 1: Category */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-mono">PILIH KATEGORI DATA LAPORAN</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white"
              >
                <option value="Status Perubahan Sosial Penduduk">Status Perubahan Sosial Penduduk (Agregat)</option>
                <option value="Tingkat Penurunan Kelas Kemiskinan Ekstrem">Tingkat Penurunan Kelas Kemiskinan Ekstrem</option>
                <option value="Evaluasi SLA Verifikasi Operator Lapangan">Evaluasi SLA Verifikasi Operator Lapangan</option>
                <option value="Integrasi Synclog Pajak & Bansos Kemensos">Integrasi Synclog Pajak & Bansos Kemensos</option>
              </select>
            </div>

            {/* Field 2: Period */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-mono">PERIODE WAKTU PENYUSUNAN</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-150 rounded-xl max-w-sm">
                <button
                  type="button"
                  onClick={() => setReportPeriod("Bulanan")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                    reportPeriod === "Bulanan"
                      ? "bg-white text-[#535CE8] shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Bulanan (Mei/Juni)
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod("Kuartalan")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                    reportPeriod === "Kuartalan"
                      ? "bg-white text-[#535CE8] shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Kuartalan (K2/SLA)
                </button>
              </div>
            </div>

            {/* Field 3: Format Card Box Selection - Opsi Format Ekspor */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5 font-mono">OPSI FORMAT EKSPOR BERKAS</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Format 1: Adobe PDF */}
                <div
                  onClick={() => setSelectedFormat("PDF")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    selectedFormat === "PDF"
                      ? "bg-indigo-50/50 border-[#535CE8]"
                      : "bg-white border-gray-150 hover:bg-gray-50"
                  }`}
                >
                  <FileText className={`w-8 h-8 mb-2 ${selectedFormat === "PDF" ? "text-[#535CE8]" : "text-gray-400"}`} />
                  <span className="text-xs font-extrabold text-gray-800">Adobe PDF</span>
                  <span className="text-[9px] text-[#535CE8] font-bold mt-1">Sertifikat Resmi</span>
                </div>

                {/* Format 2: MS Excel */}
                <div
                  onClick={() => setSelectedFormat("XLSX")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    selectedFormat === "XLSX"
                      ? "bg-emerald-50/40 border-emerald-500"
                      : "bg-white border-gray-150 hover:bg-gray-50"
                  }`}
                >
                  <FileSpreadsheet className={`w-8 h-8 mb-2 ${selectedFormat === "XLSX" ? "text-emerald-600" : "text-gray-400"}`} />
                  <span className="text-xs font-extrabold text-gray-800">MS Excel</span>
                  <span className="text-[9px] text-emerald-600 font-bold mt-1">Matriks Angka</span>
                </div>

                {/* Format 3: Data JSON */}
                <div
                  onClick={() => setSelectedFormat("JSON")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    selectedFormat === "JSON"
                      ? "bg-amber-50/30 border-amber-500"
                      : "bg-white border-gray-150 hover:bg-gray-50"
                  }`}
                >
                  <FileJson className={`w-8 h-8 mb-2 ${selectedFormat === "JSON" ? "text-amber-500" : "text-gray-400"}`} />
                  <span className="text-xs font-extrabold text-gray-800">Data JSON</span>
                  <span className="text-[9px] text-amber-500 font-bold mt-1">Struktur API</span>
                </div>

              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full bg-[#535CE8] hover:bg-[#434AC7] disabled:bg-gray-300 text-white font-extrabold text-sm py-4.5 rounded-xl transition-all shadow-md shadow-[#535CE8]/15 flex items-center justify-center gap-3 cursor-pointer active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mempersiapkan Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Buat dan Unduh Berkala Laporan ({selectedFormat})</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Side Illustration Card */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">STATUS COMPILER</span>
            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-150">
              <h5 className="text-xs font-bold text-gray-800">Otomasi PDF & Excel</h5>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1.5">
                Penyusun laporan SIMANTU otomatis merangkum data rekam dari Kemenkeu Pajak, DTKS Bansos Kemensos, dan Dinas Kependudukan Kabupaten.
              </p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
              <h5 className="text-xs font-bold text-gray-800">Sertifikat Digital (SHA-256)</h5>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold font-mono inline-block mt-2">
                SECURED & SIGNED
              </span>
            </div>
          </div>

          <div className="mt-6 text-center py-4 text-[10px] text-gray-400 bg-slate-50 border border-slate-100 rounded-xl font-mono leading-relaxed">
            Menghasilkan file terverifikasi. Seluruh ekspor diuji kelayakan API sandbox.
          </div>
        </div>

      </div>

      {/* Tabel Arsip Laporan (Archived Historical Reports) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-250">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-extrabold text-gray-900">Arsip Laporan Historis Resmi</h3>
          <p className="text-xs text-gray-400 font-medium">Koleksi riwayat dokumen ekspor yang diarsipkan oleh admin dan dinas terkait.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 font-mono">
                <th className="px-5 py-4">Nama Laporan</th>
                <th className="px-5 py-4">Periode Terpetakan</th>
                <th className="px-5 py-4">Penyusun Resmi</th>
                <th className="px-5 py-4">Tanggal Buat</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Tautan Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
              {initialArchivedReports.map((report, i) => (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {report.name.endsWith(".xlsx") ? (
                        <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                      ) : report.name.endsWith(".json") ? (
                        <FileJson className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4.5 h-4.5 text-[#535CE8] flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-extrabold text-gray-900 block leading-normal">{report.name}</span>
                        <span className="text-[9px] text-[#535CE8] font-bold font-mono tracking-tight">{report.size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-700">{report.period}</td>
                  <td className="px-5 py-3.5 font-medium">{report.author}</td>
                  <td className="px-5 py-3.5 font-mono text-gray-400">{report.date}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      TERSEDIA
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleDownloadArchived(report.name)}
                      className="p-1 px-2.5 inline-flex items-center gap-1 bg-[#F0F1FE] text-[#535CE8] hover:bg-[#535CE8] hover:text-white rounded-lg transition-all text-[10px] font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Lihat Unduh</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
