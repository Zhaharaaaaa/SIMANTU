/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Submission } from "../types";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  Users, Activity, Percent, ShieldCheck, MapPin, ChevronRight, CheckCircle2, Clock
} from "lucide-react";

interface AdminDashboardViewProps {
  submissions: Submission[];
  onNavigateToTab: (tabId: string) => void;
}

export default function AdminDashboardView({
  submissions,
  onNavigateToTab
}: AdminDashboardViewProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const pendingSubmissions = submissions.filter(s => s.status === "Pending");
  const totalPending = pendingSubmissions.length;

  // Regional breakdown of pending statuses
  const regionalPending: { [key: string]: number } = {};
  pendingSubmissions.forEach(s => {
    regionalPending[s.region] = (regionalPending[s.region] || 0) + 1;
  });

  // Regions configuration with coordinates and visual styling info
  const regionConfig = [
    {
      id: "Sukamaju",
      name: "Sukamaju",
      fullName: "Kecamatan Sukamaju",
      cx: 100,
      cy: 90,
      r: 12,
      pathD: "M 40,80 Q 75,45 140,65 L 140,140 Q 90,140 40,110 Z",
      accentColor: "indigo",
      colorClass: "bg-indigo-600",
      textColorClass: "text-indigo-600",
      colorHex: "535CE8",
      leadOfficer: "Martin (Senior Analyst)",
    },
    {
      id: "Sukaresmi",
      name: "Sukaresmi",
      fullName: "Kecamatan Sukaresmi",
      cx: 180,
      cy: 110,
      r: 15,
      pathD: "M 140,65 Q 180,60 220,70 L 220,145 Q 180,148 140,140 Z",
      accentColor: "amber",
      colorClass: "bg-amber-500",
      textColorClass: "text-amber-600",
      colorHex: "F59E0B",
      leadOfficer: "James (UI/UX Rep)",
    },
    {
      id: "Jatisari",
      name: "Jatisari",
      fullName: "Kecamatan Jatisari",
      cx: 260,
      cy: 85,
      r: 10,
      pathD: "M 220,70 Q 255,50 290,65 L 290,130 Q 255,135 220,145 Z",
      accentColor: "emerald",
      colorClass: "bg-emerald-500",
      textColorClass: "text-emerald-600",
      colorHex: "10B981",
      leadOfficer: "Juhoon (Dev Officer)",
    },
    {
      id: "Mekarsari",
      name: "Mekarsari",
      fullName: "Kecamatan Mekarsari",
      cx: 320,
      cy: 120,
      r: 11,
      pathD: "M 290,65 Q 335,55 380,80 L 370,140 Q 330,150 290,130 Z",
      accentColor: "purple",
      colorClass: "bg-purple-500",
      textColorClass: "text-purple-600",
      colorHex: "8B5CF6",
      leadOfficer: "Sean (Tester Field)",
    },
  ];

  // Dynamic statistics computation for each region mapped above
  const regionStats = regionConfig.map((r) => {
    const regionSubmissions = submissions.filter((s) => s.region === r.fullName);
    const total = regionSubmissions.length;
    const pending = regionSubmissions.filter((s) => s.status === "Pending").length;
    const approved = regionSubmissions.filter((s) => s.status === "Approved").length;
    const rejected = regionSubmissions.filter((s) => s.status === "Rejected").length;

    // Determine density status based on pending submissions
    let densityStatus: "Stabil" | "Normal" | "Padat" = "Stabil";
    if (pending >= 2) {
      densityStatus = "Padat";
    } else if (pending === 1) {
      densityStatus = "Normal";
    }

    return {
      ...r,
      total,
      pending,
      approved,
      rejected,
      densityStatus,
    };
  });

  const activeHoveredRegion = regionStats.find(r => r.id === hoveredRegionId);

  // Smooth Area Chart Data based on last 30 days
  const trendData = [
    { date: "05-15", Perubahan: 22 },
    { date: "05-18", Perubahan: 35 },
    { date: "05-21", Perubahan: 48 },
    { date: "05-24", Perubahan: 55 },
    { date: "05-27", Perubahan: 42 },
    { date: "05-30", Perubahan: 68 }, // Peak point!
    { date: "06-02", Perubahan: 50 },
    { date: "06-05", Perubahan: 61 },
    { date: "06-08", Perubahan: 47 },
    { date: "06-11", Perubahan: 58 },
    { date: "06-14", Perubahan: submissions.length * 5 }, // Linked dynamically to submissions data scale
  ];

  // Activities Log list based on recent records
  const recentActivities = submissions.slice(0, 5).map((sub, i) => {
    const times = ["2m yang lalu", "15m yang lalu", "1j yang lalu", "3j yang lalu", "1h yang lalu"];
    return {
      id: sub.id,
      citizenName: sub.citizenName,
      region: sub.region,
      status: sub.status,
      changeType: sub.changeType,
      time: times[i] || "2h yang lalu"
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="view-admin-dashboard">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Executive Summary</h2>
        <p className="text-xs text-gray-500 font-medium">Laporan terpusat SIMANTU dan matriks operasional real-time.</p>
      </div>

      {/* Real-time sync alert showing connection between Field Officer / Petugas and Admin Verification queue */}
      {totalPending > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top duration-300" id="sync-alerts-banner">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
              <Clock className="w-5 h-5 animate-pulse text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Ada {totalPending} Berkas Pengajuan Baru Menunggu Verifikasi
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5 font-medium">
                Petugas Lapangan baru saja melakukan peninjauan dan mengirimkan berkas laporan ke sistem. Silakan lakukan validasi kelayakan data secepatnya.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab("verifikasi")}
            className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 px-4 rounded-xl text-[11px] transition-all shadow-md shadow-amber-600/10 active:scale-95 cursor-pointer self-start sm:self-center"
          >
            Verifikasi Sekarang
          </button>
        </div>
      )}

      {/* KPI Stats Scorecards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SCORECARD 1: TOTAL PENDUDUK */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1" id="kpi-total-penduduk">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL PENDUDUK</span>
            <div className="p-2 bg-blue-50 text-[#535CE8] rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">2,492,084</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">+0.8%</span>
              <span>Bulan ini (Tren Positif)</span>
            </p>
          </div>
        </div>

        {/* SCORECARD 2: KESEHATAN SERVER */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1" id="kpi-server-health">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KESEHATAN SERVER</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">99.9%</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Semua layanan online & stabil</span>
            </p>
          </div>
        </div>

        {/* SCORECARD 3: AKURASI DATA */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1" id="kpi-data-accuracy">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AKURASI DATA</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">98.4%</h3>
            <p className="text-[10px] text-purple-600 font-semibold mt-1.5">
              <span className="bg-purple-50 px-1.5 py-0.5 rounded-md font-bold">Audit kemaren</span>
              <span className="text-gray-400 font-normal ml-1">Lulus Validasi Dukcapil</span>
            </p>
          </div>
        </div>

        {/* SCORECARD 4: ADMIN AKTIF */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1" id="kpi-active-admins">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ADMIN AKTIF</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">12 / 15</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-1.5">Membatalkan SLA</p>
            </div>
            {/* Stacked avatars placeholder */}
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-400 text-[8px] text-white flex items-center justify-center font-bold">ZM</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-purple-400 text-[8px] text-white flex items-center justify-center font-bold">KH</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-pink-400 text-[8px] text-white flex items-center justify-center font-bold">DC</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300 text-[8px] text-gray-600 flex items-center justify-center font-bold">+9</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Dynamic Area Chart & Right Sidebar Waitlist Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Trend Line Smooth Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250" id="chart-total-perubahan">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-bold text-gray-900">Total Perubahan Data</h3>
              <span className="text-[10px] text-[#535CE8] font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/55">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Fluktuasi data masuk selama 30 hari terakhir</p>
          </div>

          <div className="w-full min-w-0 mt-6 relative h-[250px]">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPerubahan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#535CE8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#535CE8" stopOpacity={0.005}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1E293B", 
                      borderRadius: "12px", 
                      color: "#FFFFFF", 
                      fontSize: "11px",
                      border: "none",
                      fontFamily: "Montserrat"
                    }} 
                  />
                  <Area type="monotone" dataKey="Perubahan" stroke="#535CE8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPerubahan)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Simulated peak peak annotation tooltip in area chart */}
            {isRendered && (
              <div className="absolute top-[28%] left-[58%] -translate-x-1/2 -translate-y-1/2 bg-[#535CE8] text-white text-[9px] px-2 py-1 rounded-md shadow-md shadow-indigo-600/30 font-bold flex items-center gap-1.5 animate-bounce z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>Puncak: 68 Perubahan (30 Mei)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Waitlist Queue card */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250" id="card-queue-breakdown">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Menunggu Verifikasi</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Antrean persetujuan perubahan status daerah</p>
            
            <div className="mt-5 text-center py-6 bg-[#F8F9FA] rounded-xl border border-dashed border-gray-200">
              <span className="text-5xl font-black text-[#535CE8] tracking-tight">{totalPending}</span>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-2">DOKUMEN ANTRIAN</p>
            </div>

            <div className="mt-5 space-y-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Wilayah Pendataan:</div>
              {Object.keys(regionalPending).length === 0 ? (
                <div className="text-xs text-gray-400 italic py-1 text-center">Tidak ada antrean tertunda</div>
              ) : (
                Object.keys(regionalPending).map((region, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <span className="font-medium truncate max-w-[200px]">{region}</span>
                    <span className="font-extrabold text-gray-900 bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md min-w-[24px] text-center">
                      {regionalPending[region]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigateToTab("verifikasi")}
            className="w-full mt-6 bg-[#535CE8] hover:bg-[#434AC7] text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-[#535CE8]/15 flex items-center justify-center gap-2 cursor-pointer group active:scale-95"
          >
            <span>Tinjau Semua Pengajuan</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Fully Interactive Regional Geo Map Card & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Beautiful Regional Geo Map Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250" id="card-geo-status">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Peta Status Wilayah</h3>
                <p className="text-xs text-gray-400 font-medium">Distribusi beban kerja verifikasi sosial terpetakan</p>
              </div>
              <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                Interaktif
              </span>
            </div>
          </div>

          <div className="my-5 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-50/50 rounded-2xl p-4 border border-gray-150 relative overflow-hidden h-64 transition-all" id="interactive-svg-map-container">
            
            {/* SVG stylized outline map with individual hoverable sectors */}
            <svg viewBox="0 0 400 200" className="w-full h-full text-gray-300 relative z-10 transition-all">
              
              {/* Background grids */}
              <line x1="0" y1="50" x2="400" y2="50" stroke="#F1F5F9" strokeWidth="0.5" strokeDasharray="5 5" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="5 5" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#F1F5F9" strokeWidth="0.5" strokeDasharray="5 5" />

              {/* Individual regional land sectors */}
              {regionStats.map((reg) => {
                const isHovered = hoveredRegionId === reg.id;
                let sectorFill = "#F1F5F9";
                let sectorStroke = "#CBD5E1";
                let strokeWidth = "1";

                if (isHovered) {
                  strokeWidth = "2.5";
                  if (reg.accentColor === "indigo") {
                    sectorFill = "rgba(83, 92, 232, 0.16)";
                    sectorStroke = "#535CE8";
                  } else if (reg.accentColor === "amber") {
                    sectorFill = "rgba(245, 158, 11, 0.16)";
                    sectorStroke = "#F59E0B";
                  } else if (reg.accentColor === "emerald") {
                    sectorFill = "rgba(16, 185, 129, 0.16)";
                    sectorStroke = "#10B981";
                  } else if (reg.accentColor === "purple") {
                    sectorFill = "rgba(139, 92, 246, 0.16)";
                    sectorStroke = "#8B5CF6";
                  }
                }

                return (
                  <path
                    key={`land-${reg.id}`}
                    d={reg.pathD}
                    fill={sectorFill}
                    stroke={sectorStroke}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredRegionId(reg.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  />
                );
              })}

              {/* Region Nodes & Markers with Pulsing Ring Indicators */}
              {regionStats.map((reg) => {
                const isHovered = hoveredRegionId === reg.id;
                const nodeColor = reg.id === "Sukaresmi" ? "#F59E0B" : "#535CE8";
                
                return (
                  <g 
                    key={`node-${reg.id}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRegionId(reg.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  >
                    {/* Ring Pulse layer 1 */}
                    <circle 
                      cx={reg.cx} 
                      cy={reg.cy} 
                      r={isHovered ? reg.r + 9 : reg.r + 3} 
                      fill={nodeColor} 
                      fillOpacity={isHovered ? "0.25" : "0.1"} 
                      className="transition-all duration-300"
                    />

                    {/* Ring Pulse layer 2 (dynamic glow) */}
                    <circle 
                      cx={reg.cx} 
                      cy={reg.cy} 
                      r={isHovered ? reg.r + 2 : reg.r} 
                      fill={nodeColor} 
                      fillOpacity="0.08" 
                      className={`transition-all duration-300 ${reg.pending > 0 ? "animate-pulse" : ""}`}
                    />

                    {/* Core Solid Dot */}
                    <circle 
                      cx={reg.cx} 
                      cy={reg.cy} 
                      r={isHovered ? 7.5 : 5.5} 
                      fill={nodeColor} 
                      className="transition-all duration-300"
                    />

                    {/* Text Label */}
                    <text 
                      x={reg.cx} 
                      y={reg.cy - 16} 
                      textAnchor="middle" 
                      fill={isHovered ? "#000000" : "#475569"} 
                      fontSize={isHovered ? "10" : "8"} 
                      fontWeight={isHovered ? "bold" : "600"} 
                      fontFamily="Inter"
                      className="transition-all duration-300 select-none pointer-events-none"
                    >
                      {reg.name}
                    </text>
                  </g>
                );
              })}

            </svg>

            {/* Dynamic Hover Detail Popup (Overlay box inside Map Container) */}
            <div className={`absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 z-20 ${
              activeHoveredRegion ? "border-indigo-100 translate-y-0 opacity-100" : "border-gray-150 translate-y-1 opacity-90"
            }`}>
              {activeHoveredRegion ? (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${
                        activeHoveredRegion.densityStatus === "Padat" 
                          ? "bg-amber-500 animate-ping" 
                          : activeHoveredRegion.densityStatus === "Normal" 
                          ? "bg-emerald-500" 
                          : "bg-indigo-500"
                      }`} />
                      <strong className="text-xs font-black text-slate-900">{activeHoveredRegion.fullName}</strong>
                      <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-md uppercase font-mono ${
                        activeHoveredRegion.densityStatus === "Padat" 
                          ? "bg-amber-100 text-amber-800" 
                          : activeHoveredRegion.densityStatus === "Normal" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {activeHoveredRegion.densityStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Analis: <span className="font-bold text-slate-700">{activeHoveredRegion.leadOfficer}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                    <div className="text-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 min-w-[50px]">
                      <span className="block text-[7px] font-extrabold text-slate-400">PENDING</span>
                      <strong className="text-[11px] font-black text-amber-600">{activeHoveredRegion.pending}</strong>
                    </div>
                    <div className="text-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 min-w-[50px]">
                      <span className="block text-[7px] font-extrabold text-slate-400">DISETUJUI</span>
                      <strong className="text-[11px] font-black text-emerald-600">{activeHoveredRegion.approved}</strong>
                    </div>
                    <div className="text-center bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100 min-w-[50px]">
                      <span className="block text-[7px] font-extrabold text-[#535CE8]">TOTAL</span>
                      <strong className="text-[11px] font-black text-[#535CE8]">{activeHoveredRegion.total}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-medium leading-relaxed">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#535CE8] animate-pulse shrink-0" />
                    <span>Arahkan atau sorot kursor di atas land sekat wilayah peta untuk analisis instan.</span>
                  </div>
                  <span className="text-[8px] tracking-widest font-mono text-indigo-400 font-extrabold hidden md:inline">RADAR ON</span>
                </div>
              )}
            </div>

          </div>

          {/* Warning Banner block reacting to hover status */}
          <div className="flex items-start gap-2 text-xs font-bold p-3 rounded-xl border bg-indigo-50/50 border-indigo-100/30 transition-all">
            <MapPin className="w-4 h-4 text-[#535CE8] shrink-0 mt-0.5" />
            <div>
              {activeHoveredRegion ? (
                <span>
                  Memantau <strong className="text-indigo-700">{activeHoveredRegion.fullName}</strong>. Terpantau total {activeHoveredRegion.total} registrasi masuk, dengan rincian {activeHoveredRegion.pending} pending & {activeHoveredRegion.approved} disetujui.
                </span>
              ) : (
                <span>Kecamatan Sukaresmi terpantau memiliki beban antrean review terbanyak hari ini (James UI/UX Rep).</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Activities Audit Trail List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250" id="card-recent-activities">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Aktivitas Terkini</h3>
            <p className="text-xs text-gray-400 font-medium">Log riwayat aksi operator lapangan dan keputusan admin secara berkala</p>
          </div>

          <div className="my-5 divide-y divide-gray-50 flex-1">
            {recentActivities.map((act, index) => (
              <div key={index} className="flex gap-3 py-3 items-start hover:bg-gray-50/70 p-2 rounded-xl transition-all">
                <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                  act.status === "Approved" 
                    ? "bg-emerald-50 text-emerald-600" 
                    : act.status === "Rejected"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-amber-50 text-amber-500"
                }`}>
                  {act.status === "Approved" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : act.status === "Rejected" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-900 truncate">{act.citizenName}</span>
                    <span className="text-[10px] text-gray-400 font-mono font-medium flex-shrink-0 ml-2">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{act.changeType}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-mono">
                    <MapPin className="w-3 h-3 text-gray-300 -mt-0.5" />
                    <span>{act.region}</span>
                    <span>•</span>
                    <span className={`px-1.5 py-0.1 select-none font-bold rounded-md text-[9px] ${
                      act.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : act.status === "Rejected"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {act.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={() => onNavigateToTab("monitoring")}
              className="text-xs font-bold text-[#535CE8] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Visualisasikan riwayat selengkapnya</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
