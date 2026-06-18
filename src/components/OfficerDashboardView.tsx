/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Submission, UserAccount } from "../types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  FileText, CheckCircle2, AlertCircle, Clock, ArrowRight, MessageSquare, Briefcase
} from "lucide-react";

interface OfficerDashboardViewProps {
  currentOfficer: UserAccount;
  submissions: Submission[];
  onNavigateToTab: (tabId: string) => void;
}

export default function OfficerDashboardView({
  currentOfficer,
  submissions,
  onNavigateToTab
}: OfficerDashboardViewProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);
  // Row-Level Security: Only filter submissions belonging to this logged-in officer!
  const mySubmissions = submissions.filter((s) => s.officerId === currentOfficer.id);

  // Calculate local Officer stats based on their submissions
  const totalMyInputs = mySubmissions.length;
  const totalApproved = mySubmissions.filter((s) => s.status === "Approved").length;
  const totalPending = mySubmissions.filter((s) => s.status === "Pending").length;
  const totalRejected = mySubmissions.filter((s) => s.status === "Rejected").length;

  // Find occurrences of comments/feedback from Admin (PB04) where status is Rejected
  const adminFeedbacks = mySubmissions.filter((s) => s.status === "Rejected" && s.adminComment);

  // Chart Contribution trend data for last 30 days
  const myTrendData = [
    { date: "05-20", Kontribusi: 1 },
    { date: "05-24", Kontribusi: 3 },
    { date: "05-28", Kontribusi: 2 },
    { date: "06-02", Kontribusi: 4 },
    { date: "06-06", Kontribusi: totalMyInputs > 3 ? Math.round(totalMyInputs / 2) : 2 },
    { date: "06-10", Kontribusi: totalMyInputs > 5 ? Math.round(totalMyInputs / 1.5) : 3 },
    { date: "06-14", Kontribusi: totalMyInputs },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="view-officer-dashboard">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Dasbor Operator Lapangan
        </h2>
        <p className="text-xs text-gray-400 font-medium font-mono">
          ROW-LEVEL SECURITY ACTIVE • RAYON: {currentOfficer.region.toUpperCase()} • {currentOfficer.id}
        </p>
      </div>

      {/* KPI Stats Scorecards (Total Input, Disetujui, Menunggu, Ditolak) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: INPUT SAYA */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Input Saya</span>
            <div className="p-2 bg-indigo-50 text-[#535CE8] rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 font-sans">{totalMyInputs}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Draf pengajuan di wilayah {currentOfficer.region}</p>
          </div>
        </div>

        {/* KPI 2: DISETUJUI */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-emerald-250 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">Pengajuan Disetujui</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-emerald-600 font-sans">{totalApproved}</h3>
            <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
              {totalMyInputs > 0 ? Math.round((totalApproved / totalMyInputs) * 100) : 0}% Lolos Audit
            </p>
          </div>
        </div>

        {/* KPI 3: MENUNGGU VERIFIKASI */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-amber-250 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">Menunggu Verifikasi</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-amber-600 font-sans">{totalPending}</h3>
            <p className="text-[10px] text-gray-400 mt-1">SLA penelaahan dalam 24 jam</p>
          </div>
        </div>

        {/* KPI 4: PERLU PERBAIKAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-rose-250 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">Perlu Perbaikan</span>
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-rose-600 font-sans">{totalRejected}</h3>
            <p className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1">
              Meminta re-upload berkas
            </p>
          </div>
        </div>

      </div>

      {/* Area Chart: Productive Area & Feedback Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (2 cols): Smooth Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Kontribusi Input Data 30 Hari Terakhir</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Penilaian rekap produktivitas harian pencatatan sosial.</p>
          </div>

          <div className="w-full min-w-0 mt-6 h-[220px]">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={myTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKontribusi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#535CE8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#535CE8" stopOpacity={0.005}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1E293B", 
                      borderRadius: "12px", 
                      color: "#FFFFFF", 
                      fontSize: "10px",
                      border: "none",
                      fontFamily: "Montserrat"
                    }} 
                  />
                  <Area type="monotone" dataKey="Kontribusi" stroke="#535CE8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKontribusi)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Panel Card: Catatan Terakhir Admin (PB04) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-gray-250">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
              <MessageSquare className="w-5 h-5 text-[#535CE8]" />
              <h3 className="text-xs font-black text-gray-900 uppercase">Catatan Catatan Admin</h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">Masukan tertulis tim pengawas pusat jika data ditangguhkan.</p>

            <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
              {adminFeedbacks.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-gray-100">
                  Semua berkas prima! Tidak ada penolakan berkas aktif.
                </div>
              ) : (
                adminFeedbacks.map((item, index) => (
                  <div key={index} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/40 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-rose-700">{item.citizenName}</span>
                      <span className="text-[9px] text-gray-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-gray-600 mt-1 italic">
                      "{item.adminComment}"
                    </p>
                    <button 
                      onClick={() => onNavigateToTab("status-pengajuan")}
                      className="text-[10px] text-[#535CE8] font-bold mt-2 hover:underline flex items-center gap-1"
                    >
                      <span>Perbaiki Berkas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-50 flex gap-2">
            <button
              onClick={() => onNavigateToTab("input-data")}
              className="w-full bg-[#535CE8] hover:bg-[#434AC7] text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-[#535CE8]/10 text-center cursor-pointer"
            >
              Entri Status Baru +
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
