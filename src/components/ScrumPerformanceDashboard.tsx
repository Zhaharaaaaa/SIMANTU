/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SprintPerformance } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import { 
  Trophy, TrendingUp, Users, Calendar, CheckCircle2, 
  HelpCircle, Clock, GanttChartSquare
} from "lucide-react";

interface ScrumPerformanceDashboardProps {
  scrumPerformances: SprintPerformance[];
}

export default function ScrumPerformanceDashboard({
  scrumPerformances
}: ScrumPerformanceDashboardProps) {
  // Sprint Details directly transcribed from the Project Worksheet PDF!
  const SPRINT_METADATA = [
    {
      id: "Sprint 1",
      goal: "Membangun fondasi sistem autentikasi (RBAC) dan fitur input data lapangan + upload bukti pendukung.",
      duration: "19 Mei 2026 s.d. 1 Juni 2026 (2 minggu)",
      stories: [
        { id: "PB01", role: "Petugas", title: "Login Akun Field & Keamanan", est: "5 hari", status: "Done" },
        { id: "PB02", role: "Petugas", title: "Formulir Input Perubahan + Bukti", est: "5:hari-", status: "Done" },
        { id: "PB05", role: "Admin", title: "Sistem Login Admin & RBAC", est: "4 hari", status: "Done" }
      ],
      comment: "Seluruh Sprint Goal tercapai 100%! PB01 dan PB02 rampung tepat waktu. Kendala teknis CORS pada server staging berhasil dikoordinasikan oleh Keonho & Juhoon."
    },
    {
      id: "Sprint 2",
      goal: "Membangun fitur monitoring, notifikasi real-time, dan proses verifikasi (Approve/Reject) pengajuan lapangan.",
      duration: "2 Juni 2026 s.d. 15 Juni 2026 (2 minggu)",
      stories: [
        { id: "PB03", role: "Petugas", title: "Melihat Riwayat & Alur Transaksi", est: "2 hari", status: "Done" },
        { id: "PB04", role: "Petugas", title: "Melihat Hasil & Keterangan Admin", est: "3 hari", status: "Done" },
        { id: "PB07", role: "Admin", title: "Monitor Seluruh Aktivitas Lapangan", est: "3 hari", status: "Done" },
        { id: "PB08", role: "Admin", title: "Menerima Notifikasi Berkas Baru", est: "3 hari", status: "Done" },
        { id: "PB09", role: "Admin", title: "Evaluasi Verifikasi Berkas + Catatan", est: "3 hari", status: "Done" }
      ],
      comment: "Fokus pada interaksi admin-petugas. Berkas tertunda kini langsung termonitor lewat notifikasi instan."
    },
    {
      id: "Sprint 3",
      goal: "Membangun dasbor visualisasi data agregat real-time se-kabupaten dan fitur laporan ekspor resmi.",
      duration: "16 Juni 2026 s.d. 29 Juni 2026 (2 minggu)",
      stories: [
        { id: "PB06", role: "Admin", title: "Dashboard Visualisasi Tren & Distribusi", est: "7 hari", status: "Done" },
        { id: "PB10", role: "Admin", title: "Ekspor Rekap Laporan PDF/Excel", est: "7 hari", status: "In Progress" }
      ],
      comment: "Visualisasi diagram sirkular pencapaian wilayah dan diagram garis penapisan parameter Looker Studio."
    },
    {
      id: "Sprint 4",
      goal: "Menyempurnakan konfigurasi manajemen rayon pengguna serta integrasi API eksternal data Pajak & Bansos.",
      duration: "30 Juni 2026 s.d. 13 Juli 2026 (2 minggu)",
      stories: [
        { id: "PB11", role: "Admin", title: "Manajemen Akun, Rayon & Hak Akses", est: "5 hari", status: "To Do" },
        { id: "PB12", role: "Admin", title: "Sinkronisasi Otomatis API Eksternal", est: "7 hari", status: "To Do" }
      ],
      comment: "Persiapan integrasi final dengan sistem perpajakan Kemenkeu & pangkalan bantuan sosial DTKS."
    }
  ];

  const [selectedSprintTab, setSelectedSprintTab] = useState<string>("Semua");
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Chart Formatting for Stacked Bar Chart comparing Estimasi vs Realisasi
  // We can group of data so that Recharts renders beautifully.
  // We want to compare "Estimasi Hari Kerja" vs "Realisasi Selesai" for each role across the chosen scope.
  const getChartData = () => {
    // Roles list
    const roles: ("Developer" | "UI/UX" | "DevOps" | "Tester")[] = ["Developer", "UI/UX", "DevOps", "Tester"];
    
    return roles.map((role) => {
      // Filter performances
      const filtered = scrumPerformances.filter((p) => {
        const matchesSprint = selectedSprintTab === "Semua" || p.sprint === selectedSprintTab;
        return p.role === role && matchesSprint;
      });

      // Sum estimasi and realisasi
      const totalEstimasi = filtered.reduce((sum, item) => sum + item.estimasi, 0);
      const totalRealisasi = filtered.reduce((sum, item) => sum + item.realisasi, 0);

      return {
        role,
        Estimasi: totalEstimasi,
        Realisasi: totalRealisasi,
        Selisih: totalRealisasi - totalEstimasi
      };
    });
  };

  const chartData = getChartData();

  // Metrics sums
  const totalEstimasiAll = chartData.reduce((sum, d) => sum + d.Estimasi, 0);
  const totalRealisasiAll = chartData.reduce((sum, d) => sum + d.Realisasi, 0);
  const trackingAccuracy = totalEstimasiAll > 0 
    ? Math.round((1 - Math.abs(totalRealisasiAll - totalEstimasiAll) / totalEstimasiAll) * 100) 
    : 100;

  // Active sprint metadata info
  const activeSprintMeta = SPRINT_METADATA.find(s => s.id === selectedSprintTab);

  return (
    <div className="space-y-6 animate-fadeIn" id="scrum-dashboard-layout">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <GanttChartSquare className="w-5 h-5 text-[#0F4C81]" />
              <span className="text-xs font-mono font-bold text-[#0F4C81] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Laporan Agile Kelompok STT Nurul Fikri
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1.5" id="scrum-page-title">
              Scrum Team Velocity & Sprint Analysis
            </h1>
            <p className="text-sm text-[#4A5568] mt-0.5">
              Analisis perbandingan komparatif estimasi hari kerja vs realisasi riil tim pengembang SIMANTU di setiap sprint.
            </p>
          </div>
        </div>
      </div>

      {/* Target Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="scrum-metrics">
        {/* Metric 1 */}
        <div className="bg-[#EAF2F8] border border-blue-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-blue-900/70 uppercase tracking-widest font-mono">Kecepatan Tim (Sum Sprints)</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-[#0F4C81]">{totalRealisasiAll} Hari</span>
            <span className="text-xs text-blue-800/60 font-mono">Realisasi Selesai</span>
          </div>
          <p className="text-[10px] text-blue-800/60 mt-1 font-mono">Batas waktu estimasi awal: {totalEstimasiAll} Hari</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-emerald-950 uppercase tracking-widest font-mono">Akurasi Perencanaan</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{trackingAccuracy}%</span>
            <span className="text-xs text-emerald-600/70 font-mono">Akurasi Estimasi</span>
          </div>
          <p className="text-[10px] text-emerald-800/60 mt-1 font-mono">Semakin mendekati 100% semakin presisi tim</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-900/70 uppercase tracking-widest font-mono">Penyelesaian Backlog</p>
            <h3 className="text-xl font-bold text-amber-900 mt-2 flex items-center">
              <Trophy className="w-5 h-5 text-amber-600 mr-1.5" />
              10 / 12 User Stories
            </h3>
            <p className="text-[9px] text-amber-800/60 mt-1 font-mono">PB01 - PB10 Selesai/On-Going</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector for Sprints */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider font-mono">
          Penyaringan Parameter Looker Studio (Filter Sprint Jangkauan):
        </span>
        <div className="flex space-x-1">
          {["Semua", "Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedSprintTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${
                selectedSprintTab === tab
                  ? "bg-[#0F4C81] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "Semua" ? "Semua Sprint" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="scrum-visualizer-grid">
        {/* Left Side: Stacked Bar Chart Recharts */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              Komparasi Estimasi vs Realisasi Kerja Tim ({selectedSprintTab === "Semua" ? "Seluruh Sprint" : selectedSprintTab})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Grafik balok komparasi stacked bar chart antara rentang durasi estimasi (biru tua) vs realisasi pengerjaan (biru langit).
            </p>
          </div>

          <div className="w-full h-64 mt-4 min-w-0">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="role" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontFamily="JetBrains Mono" label={{ value: 'Hari Kerja', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: '#4A5568'} }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F4C81", color: "#fff", border: "none" }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  
                  {/* Estimasi Bar */}
                  <Bar dataKey="Estimasi" name="Estimasi Awal (Hari)" fill="#0F4C81" radius={[3, 3, 0, 0]} />
                  
                  {/* Realisasi Bar */}
                  <Bar dataKey="Realisasi" name="Realisasi Selesai (Hari)" fill="#579FD9" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-[#4A5568]">
            <span>Metrik: Hari Kerja per Peran</span>
            <span className="font-mono bg-[#EAF2F8] text-[#0F4C81] px-2 py-0.5 rounded font-bold">
              {selectedSprintTab === "Semua" ? "Kompilasi Kerja 4 Sprint" : `Detil ${selectedSprintTab}`}
            </span>
          </div>
        </div>

        {/* Right Side: Backlog & Goals detail card from Worksheet */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
          {selectedSprintTab === "Semua" ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
                Scrum Master Project Overview
              </h3>
              <p className="text-xs text-gray-500">
                Daftar ringkasan tahapan Scrum STT Nurul Fikri untuk proyek SIMANTU. Pilih tab Sprint di atas untuk filter detil.
              </p>

              {/* Collapsed overview list of all sprints */}
              <div className="space-y-3 pt-2">
                {SPRINT_METADATA.map((s) => (
                  <div key={s.id} className="border-l-2 border-[#0F4C81] pl-3 py-1 text-xs">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span>{s.id}</span>
                      <span className="font-mono text-[10px] text-gray-400">{s.duration.split(" (")[0]}</span>
                    </div>
                    <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{s.goal}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            activeSprintMeta && (
              <div className="space-y-4">
                <div>
                  <span className="bg-blue-100 text-[#0F4C81] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                    SITUASI SPRINT AKTIF
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{activeSprintMeta.id}</h3>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1" /> {activeSprintMeta.duration}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 font-mono uppercase tracking-wider">Goal Sprint:</h4>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                    {activeSprintMeta.goal}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 font-mono uppercase tracking-wider mb-1.5">User Stories Terakomodasi:</h4>
                  <div className="space-y-2">
                    {activeSprintMeta.stories.map((st) => (
                      <div key={st.id} className="flex items-start justify-between bg-white border border-gray-100 p-2 rounded text-xs hover:border-blue-100">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-[#0F4C81] font-mono text-[11px]">{st.id}</span>
                            <span className="bg-[#EAF2F8] text-[#0F4C81] text-[9px] px-1.5 py-0.2 rounded font-semibold font-mono">
                              {st.role}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 font-medium">{st.title}</p>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          st.status === "Done" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : st.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-gray-50 text-gray-600 border border-gray-100"
                        }`}>
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Retrospective Summary snippet */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 font-mono uppercase tracking-wider">Hasil Catatan Hindsight:</h4>
                  <p className="text-[11px] text-gray-500 mt-1 italic pl-2 border-l border-amber-400">
                    "{activeSprintMeta.comment}"
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
