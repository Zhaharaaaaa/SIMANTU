/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Submission, ChangeCategory, UserAccount } from "../types";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { 
  Layers, CheckCircle, XCircle, Clock, AlertCircle, FileSpreadsheet, 
  Search, ShieldAlert, Check, X, FileImage, ExternalLink
} from "lucide-react";

interface AdminDashboardProps {
  submissions: Submission[];
  onVerifySubmission: (id: string, status: "Approved" | "Rejected", comment: string) => void;
  isAdmin: boolean;
}

export default function AdminDashboard({
  submissions,
  onVerifySubmission,
  isAdmin
}: AdminDashboardProps) {
  // Navigation protection fallback
  if (!isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center max-w-2xl mx-auto my-12" id="admin-lockout-banner">
        <ShieldAlert className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Akses Terbatas: Peran Khusus Admin</h2>
        <p className="text-sm text-[#4A5568] mt-2">
          Halaman 2 ("Dashboard Utama Administrator") dirancang sebagai laporan Looker Studio berpembatasan akses. Silakan ganti peran Anda menjadi <b>Admin</b> pada dropdown filter di atas untuk melihat seluruh data agregat se-kabupaten.
        </p>
      </div>
    );
  }

  // Interactive filtering states
  const [isRendered, setIsRendered] = useState(false);
  const [filterRegion, setFilterRegion] = useState("Semua");

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // States for verification popup/action inline
  const [selectedVerifyId, setSelectedVerifyId] = useState<string | null>(null);
  const [verifyType, setVerifyType] = useState<"Approved" | "Rejected" | null>(null);
  const [adminCommentInput, setAdminCommentInput] = useState("");

  // KPI Calculations
  const totalSubmissions = submissions.length;
  const totalApproved = submissions.filter((s) => s.status === "Approved").length;
  const totalPending = submissions.filter((s) => s.status === "Pending").length;
  const totalRejected = submissions.filter((s) => s.status === "Rejected").length;

  // 1. DATA FOR TIME-SERIES LINE CHART: Group reports by Date
  // Sort submissions chronologically for the trend
  const sortedSubmissions = [...submissions].sort((a, b) => a.date.localeCompare(b.date));
  const trendMap: { [key: string]: { date: string; Masuk: number; Disetujui: number } } = {};
  
  sortedSubmissions.forEach((sub) => {
    if (!trendMap[sub.date]) {
      trendMap[sub.date] = { date: sub.date, Masuk: 0, Disetujui: 0 };
    }
    trendMap[sub.date].Masuk += 1;
    if (sub.status === "Approved") {
      trendMap[sub.date].Disetujui += 1;
    }
  });
  const trendData = Object.values(trendMap);

  // 2. DATA FOR DONUT CHART: Category Distribution
  const categoryCounts: { [key in ChangeCategory]?: number } = {};
  submissions.forEach((sub) => {
    categoryCounts[sub.changeType] = (categoryCounts[sub.changeType] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map((key) => ({
    name: key,
    value: categoryCounts[key as ChangeCategory] || 0
  }));

  // Corporate Blue Palette Colors matching Looker Studio
  const LOOKER_COLORS = [
    "#0F4C81", // Navy/Corporate
    "#2D80C6", // Med Blue
    "#579FD9", // Sky Blue
    "#8ABCE7", // Light Soft Blue
    "#EAF2F8"  // Background Card Tint
  ];

  // 3. DATA FOR HORIZONTAL BAR CHART: Dynamic Regions
  const regionMap: { [key: string]: number } = {};
  submissions.forEach((sub) => {
    regionMap[sub.region] = (regionMap[sub.region] || 0) + 1;
  });
  // Sort regions descending
  const regionData = Object.keys(regionMap)
    .map((key) => ({ name: key, Jumlah: regionMap[key] }))
    .sort((a, b) => b.Jumlah - a.Jumlah);

  // Perform filtering for verification list
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesRegion = filterRegion === "Semua" || sub.region === filterRegion;
    const matchesCategory = filterCategory === "Semua" || sub.changeType === filterCategory;
    const matchesStatus = filterStatus === "Semua" || sub.status === filterStatus;
    const matchesSearch = 
      sub.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.nik.includes(searchQuery) ||
      sub.officerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesCategory && matchesStatus && matchesSearch;
  });

  // Action methods
  const openVerificationDialog = (id: string, type: "Approved" | "Rejected") => {
    setSelectedVerifyId(id);
    setVerifyType(type);
    setAdminCommentInput(
      type === "Approved" 
        ? "Dokumen terverifikasi lengkap dan data dukcapil dinyatakan tervalidasi." 
        : "Berkas ditolak karena..."
    );
  };

  const submitVerification = () => {
    if (selectedVerifyId && verifyType) {
      onVerifySubmission(selectedVerifyId, verifyType, adminCommentInput);
      setSelectedVerifyId(null);
      setVerifyType(null);
      setAdminCommentInput("");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-dashboard-layout">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded border border-red-100">
              Pengawasan Eksekutif Aktif
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1.5 font-sans" id="admin-dashboard-title">
            Dasbor Konsolidasi Administrator SIMANTU
          </h1>
          <p className="text-sm text-[#4A5568] mt-0.5">
            Agregasi visual, data kependudukan dinamis, dan loket verifikasi pengajuan lapangan se-kabupaten secara langsung.
          </p>
        </div>
      </div>

      {/* KPI Stats Scorecards (Looker Studio Style) - Clean Utility / Minimal Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-scorecards">
        {/* Card 1: Total */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Total Semua Pengajuan</p>
          <h3 className="text-3xl font-bold text-[#0F4C81] font-sans">{totalSubmissions}</h3>
          <p className="text-[10px] text-green-600 font-medium mt-2">+12% dari minggu lalu</p>
        </div>

        {/* Card 2: Disetujui (Sky highlighted theme based on design HTML) */}
        <div className="bg-[#EAF2F8] p-5 rounded-xl shadow-sm border border-[#0F4C81]/5">
          <p className="text-xs font-bold text-[#0F4C81]/60 uppercase tracking-tighter mb-1">Disetujui Admin</p>
          <h3 className="text-3xl font-bold text-[#0F4C81] font-sans">{totalApproved}</h3>
          <p className="text-[10px] text-gray-500 font-medium mt-2">
            {totalSubmissions > 0 ? Math.round((totalApproved / totalSubmissions) * 100) : 0}% Success Rate
          </p>
        </div>

        {/* Card 3: Menunggu Verifikasi */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Menunggu Verifikasi</p>
          <h3 className="text-3xl font-bold text-amber-500 font-sans">{totalPending}</h3>
          <p className="text-[10px] text-gray-500 font-medium mt-2">Antrean dalam 24 jam terakhir</p>
        </div>

        {/* Card 4: Ditolak / Review */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Ditolak / Review</p>
          <h3 className="text-3xl font-bold text-rose-500 font-sans">{totalRejected}</h3>
          <p className="text-[10px] text-gray-500 font-medium mt-2">Perlu kelengkapan dokumen</p>
        </div>
      </div>

      {/* Looker Studio Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="looker-studio-charts-panel">
        
        {/* Chart 1: Line Chart (Trend weekly flutuactive) - Span 2 Columns */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              Trend Fluktuasi Laporan Perubahan Sosial (Time Series)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Grafik analisis frekuensi laporan masuk harian dibandingkan berkas approved.
            </p>
          </div>
          <div className="w-full h-64 mt-4 min-w-0">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontFamily="JetBrains Mono" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "#0F4C81", color: "#fff", borderRadius: "5px", border: "none" }}
                    labelClassName="font-mono text-xs font-bold"
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                  <Line 
                    type="monotone" 
                    dataKey="Masuk" 
                    name="Laporan Masuk" 
                    stroke="#0F4C81" 
                    strokeWidth={2.5} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Disetujui" 
                    name="Disetujui Admin" 
                    stroke="#10b981" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-gray-100 pt-3 mt-2 flex items-center justify-between text-[11px] text-[#4A5568]">
            <span>Metrik: Konsolidasi Harian</span>
            <span className="font-mono bg-[#EAF2F8] text-[#0F4C81] px-2 py-0.5 rounded font-bold">
              Kategori: All-In-One
            </span>
          </div>
        </div>

        {/* Chart 2: Donut Chart - Categories */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              Persentase Kategori Kondisi
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Bauran jenis laporan perubahan kependudukan.
            </p>
          </div>
          <div className="w-full h-56 mt-4 min-w-0 relative flex items-center justify-center">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={LOOKER_COLORS[index % LOOKER_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Inner Absolute Label */}
            {isRendered && (
              <div className="absolute text-center">
                <span className="text-xs text-gray-400 font-mono uppercase block">Total</span>
                <span className="text-2xl font-black text-[#0F4C81]">{submissions.length}</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {categoryData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: LOOKER_COLORS[idx % LOOKER_COLORS.length] }} />
                  <span className="text-gray-700 truncate">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Horizontal Bar Chart - Top Districts dynamic */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              Dinamika Perubahan Tingkat Kecamatan (Wilayah Paling Aktif)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Grafik komparasi frekuensi laporan perubahan sosial antar-kecamatan dari paling dinamis.
            </p>
          </div>
          <div className="w-full h-44 mt-4 min-w-0">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <RechartsBarChart
                  layout="vertical"
                  data={regionData}
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} fontFamily="JetBrains Mono" precision={0} />
                  <YAxis type="category" dataKey="name" stroke="#0F4C81" fontSize={10} fontWeight="600" width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="Jumlah" name="Jumlah Laporan" fill="#0F4C81" radius={[0, 4, 4, 0]}>
                    {regionData.map((entry, index) => (
                      <Cell 
                        key={`region-cell-${index}`} 
                        fill={index === 0 ? "#0F4C81" : index === 1 ? "#2D80C6" : "#579FD9"} 
                      />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Verification Queue Table Container (Interactive Sandbox core) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" id="admin-verification-section">
        {/* Verification Filters toolbar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center">
                <Layers className="w-5 h-5 text-[#0F4C81] mr-2" />
                Antrean Berkas Masuk & Loket Verifikasi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Evaluasi dokumen pendukung dan verifikasi status kependudukan dari lapangan secara langsung.
              </p>
            </div>

            {/* Quick Filter controls in looker style */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Keyword search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari NIK, warga, petugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-gray-300 text-xs rounded pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:border-[#0F4C81] placeholder-gray-400"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              {/* District Filter Selector */}
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="bg-white border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none font-medium text-gray-700"
              >
                <option value="Semua">Semua Kecamatan</option>
                <option value="Kecamatan Sukamaju">Kecamatan Sukamaju</option>
                <option value="Kecamatan Sukaresmi">Kecamatan Sukaresmi</option>
                <option value="Kecamatan Jatisari">Kecamatan Jatisari</option>
                <option value="Kecamatan Mekarsari">Kecamatan Mekarsari</option>
              </select>

              {/* Status Filter Selector */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none font-medium text-gray-700"
              >
                <option value="Semua">Semua Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verification Modal dialogue box (Active inline block) */}
        {selectedVerifyId && verifyType && (
          <div className="bg-[#EAF2F8] border-b border-blue-200 p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fadeIn" id="verification-dialog-box">
            <div className="flex-1 space-y-3">
              <div>
                <span className="bg-blue-100 text-[#0F4C81] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                  {verifyType === "Approved" ? "KONFIRMASI PERSETUJUAN" : "ALASAN PENOLAKAN"}
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-1">
                  Mengevaluasi pengajuan <span className="font-mono text-xs">{selectedVerifyId}</span>: Tulis Catatan Penilaian
                </h3>
              </div>
              <textarea
                rows={2}
                value={adminCommentInput}
                onChange={(e) => setAdminCommentInput(e.target.value)}
                placeholder="Tulis kritik, penugasan lanjut atau apresiasi..."
                className="w-full text-xs p-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
              />
            </div>
            <div className="flex flex-row md:flex-col gap-2 self-end">
              <button
                onClick={submitVerification}
                className={`px-4 py-2 text-xs font-bold text-white rounded shadow-sm flex items-center space-x-1.5 ${
                  verifyType === "Approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Kirim Keputusan</span>
              </button>
              <button
                onClick={() => {
                  setSelectedVerifyId(null);
                  setVerifyType(null);
                  setAdminCommentInput("");
                }}
                className="px-4 py-2 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors text-center"
              >
                Batalkan
              </button>
            </div>
          </div>
        )}

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#EAF2F8]/70 border-b border-gray-200 text-xs font-bold text-[#0F4C81] uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3">ID / Tanggal</th>
                <th className="px-5 py-3">Petugas Lapangan</th>
                <th className="px-5 py-3">Wilayah</th>
                <th className="px-5 py-3">Warga Pemeriksa / NIK</th>
                <th className="px-5 py-3">Jenis Perubahan</th>
                <th className="px-5 py-3">Kondisi (Lama &rarr; Baru)</th>
                <th className="px-5 py-3 text-center">Berkas Bukti</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Tindakan Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Tidak ada berkas pengisian kependudukan yang cocok dengan filter aktif.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    className={`hover:bg-gray-50/50 transition-colors ${sub.status === "Pending" ? "bg-amber-50/10 font-medium" : ""}`}
                    id={`admin-queue-${sub.id}`}
                  >
                    {/* ID & Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-gray-900">{sub.id}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{sub.date}</div>
                    </td>

                    {/* Officer Name */}
                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-gray-700">{sub.officerName}</div>
                      <div className="text-[10px] text-[#4A5568] font-mono">{sub.officerId}</div>
                    </td>

                    {/* Region */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                      {sub.region}
                    </td>

                    {/* Citizen Name & NIK */}
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-gray-900">{sub.citizenName}</div>
                      <div className="font-mono text-[11px] text-gray-400 mt-0.5">{sub.nik}</div>
                    </td>

                    {/* Change type */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {sub.changeType}
                      </span>
                    </td>

                    {/* Conditions */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center text-[10px] bg-gray-100/80 p-1 rounded font-mono text-gray-500 max-w-[170px] truncate">
                        <span className="truncate max-w-[65px]" title={sub.previousValue}>{sub.previousValue}</span>
                        <span className="mx-1">&rarr;</span>
                        <span className="text-[#0F4C81] font-bold truncate max-w-[80px]" title={sub.newValue}>{sub.newValue}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-1" title={sub.details}>{sub.details}</p>
                    </td>

                    {/* Evidence Document thumbnail with active click */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <a 
                          href={sub.evidenceUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0F4C81] hover:underline flex items-center text-[10px] font-mono font-bold"
                        >
                          {sub.evidenceType} <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                        <img 
                          src={sub.evidenceUrl} 
                          alt="Evidence File Thumbnail" 
                          className="w-7 h-7 rounded object-cover border border-gray-200 mt-1 cursor-zoom-in"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {sub.status === "Approved" ? (
                        <span className="inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          APPROVED
                        </span>
                      ) : sub.status === "Rejected" ? (
                        <span className="inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          REJECTED
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions panel */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {sub.status === "Pending" ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openVerificationDialog(sub.id, "Approved")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded transition-colors shadow-sm"
                            title="Setujui Pengajuan"
                            id={`approve-btn-${sub.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openVerificationDialog(sub.id, "Rejected")}
                            className="bg-rose-500 hover:bg-rose-600 text-white p-1 rounded transition-colors shadow-sm"
                            title="Tolak & Minta Perbaikan"
                            id={`reject-btn-${sub.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono italic">
                          Terkonfirmasi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
