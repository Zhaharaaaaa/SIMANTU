/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Submission, UserAccount } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Search, Eye, Filter, CheckCircle, Info, X, Download, Check } from "lucide-react";

interface AdminMonitoringViewProps {
  submissions: Submission[];
}

export default function AdminMonitoringView({ submissions }: AdminMonitoringViewProps) {
  // Filters local states
  const [isRendered, setIsRendered] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("Semua");

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("Semua");
  const [selectedStatusPill, setSelectedStatusPill] = useState("Semua"); // "Aktif" (Approved), "Tertunda" (Pending), "Tidak Aktif" (Rejected), or "Semua"
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmed applied state (so the user clicks "Terapkan Filter" to apply!)
  const [appliedRegion, setAppliedRegion] = useState("Semua");
  const [appliedAgeGroup, setAppliedAgeGroup] = useState("Semua");
  const [appliedStatusPill, setAppliedStatusPill] = useState("Semua");

  // Selected Citizen for detail viewing
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Hardcoded mockup population that aligns with Looker Studio
  const baseCitizens = [
    { id: "ID-9082", avatar: "👨", name: "Ahmad Suherman", region: "Kecamatan Sukamaju", age: 42, socialStatus: "Bekerja", verified: "Terverifikasi", rawStatus: "Approved", notes: "Perubahan kelas pendapatan tervalidasi" },
    { id: "ID-1102", avatar: "👩", name: "Siti Rahmawati", region: "Kecamatan Sukamaju", age: 31, socialStatus: "Pelajar/Mahasiswa", verified: "Terverifikasi", rawStatus: "Approved", notes: "Penerima bansos terdaftar DTKS" },
    { id: "ID-3401", avatar: "👨", name: "Hendra Wijaya", region: "Kecamatan Sukaresmi", age: 49, socialStatus: "Bekerja", verified: "Terverifikasi", rawStatus: "Approved", notes: "Wiraswasta mandiri terdaftar NIB" },
    { id: "ID-7721", avatar: "👩", name: "Dewi Lestari", region: "Kecamatan Sukaresmi", age: 26, socialStatus: "Lainnya", verified: "Tertunda", rawStatus: "Pending", notes: "Dalam review dokumen kematian" },
    { id: "ID-4029", avatar: "👨", name: "Rian Hidayat", region: "Kecamatan Jatisari", age: 24, socialStatus: "Bekerja", verified: "Terverifikasi", rawStatus: "Approved", notes: "Karyawan swasta logistik teridentifikasi" },
    { id: "ID-6204", avatar: "👩", name: "Aminah Yusuf", region: "Kecamatan Jatisari", age: 38, socialStatus: "Lainnya", verified: "Tertunda", rawStatus: "Pending", notes: "Dalam pengajuan perubahan domisili" },
    { id: "ID-1678", avatar: "👨", name: "Slamet Riyadi", region: "Kecamatan Mekarsari", age: 53, socialStatus: "Bekerja", verified: "Terverifikasi", rawStatus: "Approved", notes: "Warga graduasi mandiri bansos" },
    { id: "ID-8865", avatar: "👩", name: "Kartika Sari", region: "Kecamatan Mekarsari", age: 35, socialStatus: "Bekerja", verified: "Tertunda", rawStatus: "Pending", notes: "Menunggu pembuktian surat rawat medis" },
    { id: "ID-4190", avatar: "👨", name: "Agus Setiawan", region: "Kecamatan Sukamaju", age: 50, socialStatus: "Lainnya", verified: "Tertunda", rawStatus: "Pending", notes: "Berkas surat pernyataan terlampir" },
    { id: "ID-8302", avatar: "👩", name: "Ratna Sari", region: "Kecamatan Sukaresmi", age: 22, socialStatus: "Pelajar/Mahasiswa", verified: "Tertunda", rawStatus: "Pending", notes: "Menunggu kartu nikah KUA" },
    { id: "ID-2253", avatar: "👨", name: "Eko Prasetyo", region: "Kecamatan Jatisari", age: 19, socialStatus: "Pelajar/Mahasiswa", verified: "Tertunda", rawStatus: "Pending", notes: "Sedang diproses verifikasi KIP Kuliah" },
    { id: "ID-5104", avatar: "👨", name: "Aris Munandar", region: "Kecamatan Mekarsari", age: 67, socialStatus: "Lainnya", verified: "Tertunda", rawStatus: "Pending", notes: "Verifikasi lapangan kondisi fisik lansia" }
  ];

  // Dynamically add live elements from submissions state
  const liveCitizens = submissions.map((sub, idx) => {
    const avatars = ["👨", "👩", "👴", "👵", "👶", "👧", "👦"];
    return {
      id: `ID-${sub.id.replace("SUB-", "")}`,
      avatar: avatars[idx % avatars.length],
      name: sub.citizenName,
      region: sub.region,
      age: 20 + (idx * 4) % 60,
      socialStatus: sub.changeType.includes("Pendidikan") || sub.changeType.includes("Siswa") ? "Pelajar/Mahasiswa" : sub.changeType.includes("Pekerjaan") ? "Bekerja" : "Lainnya",
      verified: sub.status === "Approved" ? "Terverifikasi" : "Tertunda",
      rawStatus: sub.status,
      notes: sub.details
    };
  });

  // Consolidate list for Looker view
  const allCitizens = [...liveCitizens, ...baseCitizens].filter(
    (c, index, self) => self.findIndex(t => t.id === c.id) === index // remove duplicates
  );

  // Apply lookup filter variables
  const handleApplyFilter = () => {
    setAppliedRegion(selectedRegion);
    setAppliedAgeGroup(selectedAgeGroup);
    setAppliedStatusPill(selectedStatusPill);
  };

  const filteredCitizens = allCitizens.filter(citizen => {
    const matchesSearch = citizen.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          citizen.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = appliedRegion === "Semua" || citizen.region === appliedRegion;
    
    let matchesAge = true;
    if (appliedAgeGroup === "Under 30") matchesAge = citizen.age < 30;
    else if (appliedAgeGroup === "30 - 50") matchesAge = citizen.age >= 30 && citizen.age <= 50;
    else if (appliedAgeGroup === "Above 50") matchesAge = citizen.age > 50;

    let matchesStatus = true;
    if (appliedStatusPill === "Aktif") matchesStatus = citizen.rawStatus === "Approved";
    else if (appliedStatusPill === "Tertunda") matchesStatus = citizen.rawStatus === "Pending";
    else if (appliedStatusPill === "Tidak Aktif") matchesStatus = citizen.rawStatus === "Rejected";

    return matchesSearch && matchesRegion && matchesAge && matchesStatus;
  });

  // Calculate stats based on listed entities
  const totalPopCount = filteredCitizens.length;
  const verifiedCount = filteredCitizens.filter(c => c.verified === "Terverifikasi").length;
  const complianceRate = totalPopCount > 0 ? Math.round((verifiedCount / totalPopCount) * 100) : 0;

  // Donut chart distributions
  const bekerjaCount = filteredCitizens.filter(c => c.socialStatus === "Bekerja").length;
  const pelajarCount = filteredCitizens.filter(c => c.socialStatus === "Pelajar/Mahasiswa").length;
  const lainnyaCount = filteredCitizens.filter(c => c.socialStatus === "Lainnya").length;

  const donutData = [
    { name: "Bekerja", value: bekerjaCount },
    { name: "Pelajar/Mahasiswa", value: pelajarCount },
    { name: "Lainnya", value: lainnyaCount }
  ].filter(d => d.value > 0);

  const DONUT_COLORS = ["#535CE8", "#F59E0B", "#94A3B8"];

  const activeCitizen = allCitizens.find(c => c.id === selectedCitizenId);

  const handleDownloadMonitoringData = (type: "CSV" | "JSON") => {
    setDownloadSuccess(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Data_Monitoring_Penduduk_${appliedRegion.replace(/\s+/g, "_")}_${dateStr}.${type.toLowerCase()}`;
    
    let content = "";
    let mimeType = "text/plain";
    
    if (type === "JSON") {
      mimeType = "application/json";
      content = JSON.stringify({
        source: "SIMANTU Sistem Monitoring Status Sosial Kependudukan",
        filterApplied: {
          region: appliedRegion,
          ageGroup: appliedAgeGroup,
          verificationStatus: appliedStatusPill
        },
        totalCount: filteredCitizens.length,
        timestamp: new Date().toISOString(),
        data: filteredCitizens
      }, null, 2);
    } else {
      mimeType = "text/csv";
      const headers = ["ID", "Nama Warga", "Wilayah/Kecamatan", "Usia", "Kategori Sosial", "Status Verifikasi", "Catatan"];
      const rows = filteredCitizens.map(c => [
        c.id,
        c.name,
        c.region,
        c.age,
        c.socialStatus,
        c.verified,
        c.notes || ""
      ]);
      content = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadSuccess(`Sukses! ${filteredCitizens.length} data terpeta berhasil diunduh ke file "${fileName}".`);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="view-admin-monitoring">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Monitoring Penduduk</h2>
        <p className="text-xs text-gray-500 font-medium">Laporan segmentasi distrik & status kepatuhan terverifikasi.</p>
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

      {/* Top 3 Scorecards including Donut chart on right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SCORECARD 1: POPULASI TERCONVERGE */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL POPULASI TERPANTAU</span>
            <h3 className="text-4xl font-extrabold text-[#535CE8] mt-3 font-sans">{totalPopCount}</h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            Jumlah warga terdaftar dalam lingkup koordinasi wilayah kerja terpeta.
          </p>
        </div>

        {/* SCORECARD 2: KEPATUHAN VERIFIKASI */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AKTIF TERVERIFIKASI</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{complianceRate}%</span>
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-3 font-sans">
              {verifiedCount} <span className="text-sm text-gray-400 font-normal">/ {totalPopCount}</span>
            </h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${complianceRate}%` }}></div>
            </div>
            <p className="text-[9px] text-gray-400 font-medium mt-1.5">Tingkat akurasi kesesuaian dokumen terjamin</p>
          </div>
        </div>

        {/* SCORECARD 3: DONUT CHART MINI - DISTRIBUSI STATUS SOSIAL */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between min-h-[140px] transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">DISTRIBUSI STATUS SOSIAL</span>
            
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#535CE8]" />
                <span>Bekerja {bekerjaCount > 0 ? `(${Math.round(bekerjaCount/totalPopCount*100)}%)` : "(0%)"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Pelajar {pelajarCount > 0 ? `(${Math.round(pelajarCount/totalPopCount*100)}%)` : "(0%)"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span>Lainnya {lainnyaCount > 0 ? `(${Math.round(lainnyaCount/totalPopCount*100)}%)` : "(0%)"}</span>
              </div>
            </div>
          </div>

          <div className="w-24 h-24 relative min-w-0 flex-shrink-0">
            {donutData.length === 0 ? (
              <div className="w-full h-full rounded-full border-4 border-gray-100 flex items-center justify-center text-[10px] text-gray-400">N/A</div>
            ) : !isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height={96}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {isRendered && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-gray-800">{totalPopCount}</span>
                <span className="text-[7px] text-gray-400 uppercase font-bold tracking-tighter">Warga</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#535CE8]" />
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight">KONTROL FILTER SEKTORAL</h4>
          </div>
          <div className="text-[10px] text-gray-400 font-medium">Klik "Terapkan Filter" untuk memperbarui visualisasi</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Dropdown 1: Wilayah */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Kecamatan / Wilayah</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white"
            >
              <option value="Semua">Semua Kecamatan</option>
              <option value="Kecamatan Sukamaju">Kecamatan Sukamaju</option>
              <option value="Kecamatan Sukaresmi">Kecamatan Sukaresmi</option>
              <option value="Kecamatan Jatisari">Kecamatan Jatisari</option>
              <option value="Kecamatan Mekarsari">Kecamatan Mekarsari</option>
            </select>
          </div>

          {/* Dropdown 2: Usia */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Kelompok Usia</label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white"
            >
              <option value="Semua">Semua Usia</option>
              <option value="Under 30">Di bawah 30 thn</option>
              <option value="30 - 50">30 s/d 50 thn</option>
              <option value="Above 50">Di atas 50 thn</option>
            </select>
          </div>

          {/* Dropdown 3: Status (Horizontal Pill style - but inside this row as elegant selectors) */}
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status Verifikasi Data</label>
            <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-150">
              {["Semua", "Aktif", "Tertunda", "Tidak Aktif"].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSelectedStatusPill(pill)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatusPill === pill
                      ? "bg-[#535CE8] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Button: Apply */}
          <button
            onClick={handleApplyFilter}
            className="w-full bg-[#535CE8] hover:bg-[#434AC7] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#535CE8]/10 cursor-pointer active:scale-95"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* Main Citizens Table view list layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-250">
        
        {/* Table Title and Text query Search bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span>Daftar Monitoring Penduduk</span>
              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                Terfilter: {filteredCitizens.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-medium">Berdasarkan parameter filter kognitif yang diterapkan di atas.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Download Buttons */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-150">
              <button
                onClick={() => handleDownloadMonitoringData("CSV")}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 border border-emerald-200/50"
                title="Unduh data terfilter ke format CSV (Excel)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={() => handleDownloadMonitoringData("JSON")}
                className="flex items-center gap-1 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 border border-amber-200/40"
                title="Unduh data terfilter ke format JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh JSON</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari warga atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl pl-9 pr-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Real Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 font-mono">
                <th className="px-5 py-4">Warga & ID</th>
                <th className="px-5 py-4">Wilayah Kerja</th>
                <th className="px-5 py-4 text-center">Usia</th>
                <th className="px-5 py-4">Kategori Sosial</th>
                <th className="px-5 py-4 text-center">Verifikasi</th>
                <th className="px-5 py-4 text-center">Aksi Detil</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50 text-gray-600">
              {filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 font-medium italic">
                    Warga tidak ditemukan untuk variabel filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-1 bg-gray-50 rounded-lg">{citizen.avatar}</span>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{citizen.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{citizen.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{citizen.region}</td>
                    <td className="px-5 py-3.5 text-center font-semibold font-mono">{citizen.age} thn</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        citizen.socialStatus === "Bekerja"
                          ? "bg-indigo-50 text-indigo-600"
                          : citizen.socialStatus === "Pelajar/Mahasiswa"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-50 text-slate-600"
                      }`}>
                        {citizen.socialStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold ${
                        citizen.verified === "Terverifikasi"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          citizen.verified === "Terverifikasi" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                        {citizen.verified.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedCitizenId(citizen.id)}
                        className="p-1 px-2 inline-flex items-center bg-gray-50 text-gray-500 hover:text-[#535CE8] hover:bg-[#F0F1FE] rounded-lg transition-colors border border-gray-200 cursor-pointer text-[10px] font-semibold gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detil</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Detail Overlay Drawer (Interactive popup) */}
      {selectedCitizenId && activeCitizen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="citizen-detail-overlay">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="p-6 bg-gradient-to-r from-[#535CE8] to-[#6366F1] text-white relative">
              <button 
                onClick={() => setSelectedCitizenId(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <span className="text-4xl p-2 bg-white/10 rounded-2xl">{activeCitizen.avatar}</span>
                <div>
                  <h4 className="text-lg font-bold tracking-tight">{activeCitizen.name}</h4>
                  <p className="text-xs text-indigo-100 font-mono mt-0.5">ID KEPENDUDUKAN: {activeCitizen.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Wilayah Kerja</span>
                  <span className="text-gray-800 font-bold mt-1 block">{activeCitizen.region}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Kelayakan Usia</span>
                  <span className="text-gray-800 font-bold mt-1 block">{activeCitizen.age} Tahun</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Status Sosial Saat Ini</span>
                <span className="text-gray-800 font-bold mt-1 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#535CE8]"></span>
                  {activeCitizen.socialStatus}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block font-mono">DOKUMEN CATATAN SISTEM</span>
                <p className="text-gray-600 mt-1.5 italic leading-relaxed">
                  "{activeCitizen.notes || "Tidak ada rincian rekam histori tambahan terkait status sosial kependudukan."}"
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold">SLA Validasi Status: {activeCitizen.verified === "Terverifikasi" ? "Selesai Audit" : "Antrean Menunggu Evaluasi"}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedCitizenId(null)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs py-2 px-4 rounded-xl border border-gray-200 transition-colors cursor-pointer active:scale-95"
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
