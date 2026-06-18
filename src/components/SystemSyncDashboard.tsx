/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ApiSyncLog, UserAccount } from "../types";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Database, RefreshCcw, CheckCircle, AlertTriangle, Key, 
  UserPlus, Mail, ShieldAlert, Cpu, Settings, Edit3
} from "lucide-react";

interface SystemSyncDashboardProps {
  accounts: UserAccount[];
  syncLogs: ApiSyncLog[];
  onAddAccount: (newAcct: Omit<UserAccount, "totalInputs">) => void;
  isAdmin: boolean;
}

export default function SystemSyncDashboard({
  accounts,
  syncLogs,
  onAddAccount,
  isAdmin
}: SystemSyncDashboardProps) {
  // Navigation protection fallback
  if (!isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center max-w-2xl mx-auto my-12" id="sync-lockout-banner">
        <ShieldAlert className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Akses Terbatas: Peran Khusus Admin</h2>
        <p className="text-sm text-[#4A5568] mt-2">
          Halaman 3 ("Sinkronisasi API & Manajemen Sistem") diproteksi khusus untuk Administrator (PB11, PB12). Silakan ganti peran dropdown menjadi <b>Admin</b> di bar atas untuk memantau performa integrasi API eksternal dan berinteraksi dengan manajemen akun pengguna.
        </p>
      </div>
    );
  }

  // Account creation form states (PB11)
  const [isRendered, setIsRendered] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRegion, setNewRegion] = useState("Kecamatan Sukamaju");
  const [newRole, setNewRole] = useState<"Admin" | "Petugas Lapangan">("Petugas Lapangan");
  const [formMsg, setFormMsg] = useState("");

  // Sync simulation triggers (PB12)
  const [localSyncLogs, setLocalSyncLogs] = useState<ApiSyncLog[]>(syncLogs);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newEmail) {
      setFormMsg("Harap isi semua input formulir akun.");
      return;
    }
    onAddAccount({
      id: newId,
      name: newName,
      email: newEmail,
      region: newRole === "Admin" ? "Pusat Kabupaten" : newRegion,
      role: newRole,
      avatarColor: newRole === "Admin" ? "bg-amber-600" : "bg-teal-500"
    });
    setFormMsg(`Akun ${newName} (${newId}) berhasil didaftarkan ke sistem!`);
    setNewId("");
    setNewName("");
    setNewEmail("");
    setTimeout(() => {
      setFormMsg("");
      setShowAddForm(false);
    }, 2500);
  };

  // Simulating an instant manual API pull (PB12)
  const triggerManualSync = (api: "DTKS Bansos API" | "Kemenkeu Pajak API" | "Dukcapil Pusat API") => {
    setIsSyncing(true);
    setTimeout(() => {
      const randomSync: ApiSyncLog = {
        id: "S-" + Math.floor(Math.random() * 900 + 100),
        apiName: api,
        date: new Date().toISOString().split("T")[0],
        recordsSynced: Math.floor(Math.random() * 250 + 40),
        status: "Success",
        latencyMs: Math.floor(Math.random() * 150 + 80),
        syncType: "Manual Sync"
      };
      setLocalSyncLogs([randomSync, ...localSyncLogs]);
      setIsSyncing(false);
    }, 1500);
  };

  // Calculating syncing safety counters
  const totalRecordsToday = localSyncLogs
    .filter((l) => l.date === "2026-06-14")
    .reduce((sum, current) => sum + (current.status === "Success" ? current.recordsSynced : 0), 0);

  const averageLatencyMs = Math.round(
    localSyncLogs.reduce((sum, current) => sum + current.latencyMs, 0) / localSyncLogs.length
  );

  return (
    <div className="space-y-6 animate-fadeIn" id="sync-dashboard-layout">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#0F4C81]" />
              <span className="text-xs font-mono font-bold text-[#0F4C81] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Integrasi Gateway API & Autentikasi
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1.5" id="sync-page-title">
              Sinkronisasi API & Manajemen Sistem
            </h1>
            <p className="text-sm text-[#4A5568] mt-0.5">
              Kelola parameter sinkronisasi sistem pusat kemenkeu/bansos (PB12) serta status akses pengguna (PB11) secara modular.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => triggerManualSync("DTKS Bansos API")}
              disabled={isSyncing}
              className={`bg-[#0F4C81] text-white hover:bg-[#0c3d68] transition-colors text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm flex items-center space-x-1.5 ${
                isSyncing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sinkronisasi..." : "Sinkron DTKS Bansos"}</span>
            </button>
            <button
              onClick={() => triggerManualSync("Kemenkeu Pajak API")}
              disabled={isSyncing}
              className="bg-sky-600 hover:bg-sky-700 text-white transition-colors text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sinkron Pajak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="api-counters">
        <div className="bg-[#EAF2F8] border border-blue-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-blue-900/70 uppercase tracking-widest font-mono">Sinkronisasi Hari Ini</p>
          <h3 className="text-2xl font-black text-[#0F4C81] mt-1 font-sans">{totalRecordsToday} NIK</h3>
          <p className="text-[10px] text-blue-800/60 mt-1 font-mono">Total data eksternal otomatis terupdate</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-emerald-900/70 uppercase tracking-widest font-mono">Average Latency Gateway</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1 font-sans">{averageLatencyMs} ms</h3>
          <p className="text-[10px] text-emerald-800/60 mt-1 font-mono">SLA Sistem Target: &lt;250ms</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Protokol Security</p>
          <h3 className="text-lg font-bold text-gray-800 mt-1.5 flex items-center">
            <Key className="w-4 h-4 text-gray-600 mr-1.5" />
            RBAC + JWT + 2FA
          </h3>
          <p className="text-[9px] text-gray-400 mt-2 font-mono">Autentikasi berlapis aktif secara terpusat</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="api-charts-section">
        {/* Sync Volume Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono mb-3">
            Volume Data Sinkronisasi Harian (Records Synced)
          </h3>
          <div className="w-full h-56 min-w-0">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <BarChart data={localSyncLogs.slice(0, 8).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="recordsSynced" name="Data Terupdate" fill="#0F4C81" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Latency Performance Trackers Line */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono mb-3">
            Analisis Latensi Konektivitas API (Milidetik)
          </h3>
          <div className="w-full h-56 min-w-0">
            {!isRendered ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <LineChart data={localSyncLogs.slice(0, 8).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="id" stroke="#94a3b8" fontSize={9} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="latencyMs" name="SLA Delay (ms)" stroke="#0c81db" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Account Management & System Configuration Panel (PB11) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" id="user-accounts-card">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 text-[#0F4C81] mr-1.5" />
              Daftar Manajemen Pengguna & wilayah Kerja (PB11)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Konfigurasi pembagian rayon tim lapangan dan status hak akses SIMANTU.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#0F4C81] text-white hover:bg-[#0c3d68] transition-colors text-xs font-semibold px-3 py-2 rounded-md shadow-sm flex items-center space-x-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? "Tutup Form" : "Tambah Akun Baru"}</span>
          </button>
        </div>

        {/* Add account dropdown style form */}
        {showAddForm && (
          <form onSubmit={handleCreateAccount} className="p-6 bg-[#EAF2F8]/70 border-b border-blue-100 space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-[#0F4C81] flex items-center">
              <UserPlus className="w-4 h-4 mr-1.5" /> Mendaftarkan Petugas Lapangan Baru
            </h3>
            {formMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded text-xs font-medium">
                {formMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">ID Pengguna (PBXX)</label>
                <input
                  type="text"
                  placeholder="Contoh: PB13"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] bg-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Raymond"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Surel/Email</label>
                <input
                  type="email"
                  placeholder="name@simantu.go.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] bg-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Rayon Wilayah Kerja</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#0F4C81] bg-white font-medium"
                >
                  <option value="Kecamatan Sukamaju">Kecamatan Sukamaju</option>
                  <option value="Kecamatan Sukaresmi">Kecamatan Sukaresmi</option>
                  <option value="Kecamatan Jatisari">Kecamatan Jatisari</option>
                  <option value="Kecamatan Mekarsari">Kecamatan Mekarsari</option>
                  <option value="Kecamatan Cihampelas">Kecamatan Cihampelas</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs text-white bg-[#0F4C81] rounded shadow"
              >
                Simpan & Daftarkan
              </button>
            </div>
          </form>
        )}

        {/* User Account Registry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#EAF2F8]/70 border-b border-gray-200 text-xs font-bold text-[#0F4C81] uppercase tracking-wider font-mono">
              <tr>
                <th className="px-6 py-3">Uraian Akun User (Sprint ID)</th>
                <th className="px-6 py-3">Role Akses</th>
                <th className="px-6 py-3">Email Sistem</th>
                <th className="px-6 py-3">Wilayah Terpeta</th>
                <th className="px-6 py-3">Rencana Data Input Saat Ini</th>
                <th className="px-6 py-3 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {accounts.map((acct) => (
                <tr key={acct.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${acct.avatarColor} flex items-center justify-center text-white text-xs font-black overflow-hidden shrink-0`}>
                        {acct.avatarUrl ? (
                          <img 
                            src={acct.avatarUrl} 
                            alt={acct.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          acct.id
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{acct.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold leading-none mt-0.5">ID: {acct.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs col-span-2">
                    {acct.role === "Admin" ? (
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-100 text-[10px] font-mono inline-flex items-center">
                        ADMINISTRATOR / SM
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 text-[10px] font-mono inline-flex items-center">
                        PETUGAS LAPANGAN
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                    {acct.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                    {acct.region}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#0F4C81] font-mono font-bold">
                    {acct.role === "Admin" ? "-" : `${acct.totalInputs} Berkas`}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <button
                      onClick={() => alert(`Pengaturan kustom lingkup wilayah untuk ${acct.name} berhasil disimulasikan!`)}
                      className="text-[#0F4C81] hover:underline inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>Atur Rayon</span>
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
