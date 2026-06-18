/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserAccount } from "../types";
import { 
  Settings, Key, ShieldAlert, Cpu, Heart, Database, Save, UserPlus, Trash, Check, 
  Edit2, Trash2, X, AlertTriangle
} from "lucide-react";

interface AdminSettingsViewProps {
  accounts: UserAccount[];
  onAddAccount: (newAcct: Omit<UserAccount, "totalInputs">) => void;
  onUpdateAccount: (updatedAcct: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  currentAccountId: string;
}

export default function AdminSettingsView({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  currentAccountId
}: AdminSettingsViewProps) {
  // Input states for adding new officer credentials
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Admin" | "Petugas Lapangan">("Petugas Lapangan");
  const [newRegion, setNewRegion] = useState("Kecamatan Sukamaju");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for Editing existing user accounts (CRUD)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"Admin" | "Petugas Lapangan">("Petugas Lapangan");
  const [editRegion, setEditRegion] = useState("");

  // State for Custom delete confirmation modal instead of blocking window.confirm!
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserAccount | null>(null);

  // Security preferences states
  const [twoFactorToken, setTwoFactorToken] = useState(true);
  const [sessionSaveCheck, setSessionSaveCheck] = useState(true);

  // System notification preferences
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Handle addition of a new user
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setSuccessMsg("Peringatan: Mohon isi Nama Lengkap dan Email dengan benar.");
      return;
    }

    const randomColors = [
      "bg-[#535CE8]", "bg-rose-500", "bg-emerald-500", 
      "bg-amber-500", "bg-purple-500", "bg-pink-600", "bg-teal-600"
    ];
    const pickedColor = randomColors[Math.floor(Math.random() * randomColors.length)];

    const idNum = accounts.length + 1;
    const generatedId = `PB${String(idNum).padStart(2, "0")}`;

    onAddAccount({
      id: generatedId,
      name: newName,
      role: newRole,
      email: newEmail,
      region: newRole === "Admin" ? "Pusat Kabupaten" : newRegion,
      avatarColor: pickedColor
    });

    setSuccessMsg(`Sukses menambahkan akun ${newName} sebagai ${newRole}!`);
    setNewName("");
    setNewEmail("");

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  // Start inline editing of an existing user account
  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditRegion(user.region);
    setErrorMsg(null);
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setErrorMsg(null);
  };

  // Save edited account info
  const handleSaveEdit = (user: UserAccount) => {
    if (!editName.trim() || !editEmail.trim()) {
      setErrorMsg("Nama Lengkap dan Alamat Email wajib diisi.");
      return;
    }

    onUpdateAccount({
      ...user,
      name: editName,
      email: editEmail,
      role: editRole,
      region: editRole === "Admin" ? "Pusat Kabupaten" : editRegion
    });

    setEditingUserId(null);
    setErrorMsg(null);
    setSuccessMsg(`Informasi akun ${editName} berhasil diperbarui.`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  // Delete user account trigger
  const handleDeleteUserClick = (user: UserAccount) => {
    if (user.id === currentAccountId) {
      setErrorMsg("Galat Keamanan: Anda tidak dapat menghapus akun administrator yang sedang Anda gunakan saat ini.");
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }
    setConfirmDeleteUser(user);
  };

  // Perform actual deletion from confirmation popup
  const handleConfirmDelete = () => {
    if (!confirmDeleteUser) return;
    onDeleteAccount(confirmDeleteUser.id);
    setSuccessMsg(`Sukses menghapus akun ${confirmDeleteUser.name}.`);
    setConfirmDeleteUser(null);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="view-admin-settings">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Konfigurasi Pengaturan</h2>
        <p className="text-xs text-gray-500 font-medium">Pengelolaan otentikasi server, rekam penugasan, dan manajemen role.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Split Grid: Left is Info profile with Security / Right is server health & checkmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Profile Info & Security toggles */}
        <div className="space-y-6">
          
          {/* Form: Profil Informasi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Settings className="w-4.5 h-4.5 text-[#535CE8]" />
              <h4 className="text-xs font-black text-gray-900 uppercase">Profil Informasi</h4>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 text-[#535CE8] rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-150">
                ZS
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-sm text-gray-900">Zhahara N. Sukirman</h5>
                <span className="text-[10px] text-[#535CE8] bg-[#F0F1FE] px-2 py-0.5 rounded-full font-bold font-mono">
                  ROLE: ADMINISTRATOR (Scrum Master)
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Dinas Kependudukan Pusat Kabupaten</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Korespensi</label>
                <input
                  type="text"
                  readOnly
                  value="zhahara192@gmail.com"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Unit Kerja / Department</label>
                <input
                  type="text"
                  readOnly
                  value="Liaison Officer STT NF"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Security Preferences */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:border-gray-250">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Key className="w-4.5 h-4.5 text-[#535CE8]" />
              <h4 className="text-xs font-black text-gray-900 uppercase">Security Preferences</h4>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-800 block">Autentikasi 2-FA (Dua Faktor)</span>
                  <span className="text-[10px] text-gray-400">Gunakan OTP Google/Kemenkeu saat verifikasi.</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.checked)}
                  className="w-4 h-4 text-[#535CE8] border-gray-300 rounded focus:ring-[#535CE8] cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-800 block">Simpan Enskripsi Sesi Token</span>
                  <span className="text-[10px] text-gray-400">Pertahankan database login selama 12 jam.</span>
                </div>
                <input
                  type="checkbox"
                  checked={sessionSaveCheck}
                  onChange={(e) => setSessionSaveCheck(e.target.checked)}
                  className="w-4 h-4 text-[#535CE8] border-gray-300 rounded focus:ring-[#535CE8] cursor-pointer"
                />
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Server Health Graphs & Config checks */}
        <div className="space-y-6">
          
          {/* Server Health Metric info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:border-gray-250">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Cpu className="w-4.5 h-4.5 text-[#535CE8]" />
              <h4 className="text-xs font-black text-gray-900 uppercase">Kesehatan Integrasi Sistem</h4>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Metric Card 1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">API Koneksi Otomatis (Tax/DTKS)</span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded font-bold">OPTIMAL</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[95%]"></div>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">Kecepatan Database Response</span>
                  <span className="font-mono font-bold text-[#535CE8]">12 ms (Sangat Cepat)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#535CE8] h-full w-[88%]"></div>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">Persentase Penyimpanan Cloud</span>
                  <span className="font-mono font-bold text-gray-500">42.5 GB / 100 GB</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-300 h-full w-[43%]"></div>
                </div>
              </div>

            </div>
          </div>

          {/* Notifikasi Konfigurasi checkmarks */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 transition-all duration-300 hover:shadow-md hover:border-gray-250">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Heart className="w-4.5 h-4.5 text-[#535CE8]" />
              <h4 className="text-xs font-black text-gray-900 uppercase">Notifikasi Konfigurasi</h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="w-4 h-4 text-[#535CE8] border-gray-300 rounded focus:ring-[#535CE8]"
                />
                <div>
                  <span className="font-semibold text-gray-800 block">Kirim Notifikasi SMS Ke Petugas</span>
                  <span className="text-[10px] text-gray-400">Kirim pemberitahuan instan saat berkas disetujui/ditolak.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4 text-[#535CE8] border-gray-300 rounded focus:ring-[#535CE8]"
                />
                <div>
                  <span className="font-semibold text-gray-800 block">Kirim Rekapitulasi Email Harian</span>
                  <span className="text-[10px] text-gray-400 font-medium">Beban kerja dinas dikonstruksi ke Dukcapil Pusat.</span>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM ROW: User & Role Management (interactive append list with custom form) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-250">
        
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-extrabold text-gray-900">User & Role Management</h3>
          <p className="text-xs text-gray-400 font-medium">Tambah, edit petugas kabupaten, dan petakan rayon tugas koordinasi.</p>
        </div>

        {/* Input Form to add user */}
        <form onSubmit={handleAddNewUser} className="p-5 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          
          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Nama Operator Baru</label>
            <input
              type="text"
              placeholder="Contoh: Rian Hidayat"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#535CE8]"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Alamat Email (.go.id)</label>
            <input
              type="email"
              placeholder="rian.hidayat@simantu.id"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#535CE8]"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Hak Akses Sistem</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "Admin" | "Petugas Lapangan")}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="Petugas Lapangan">Petugas Lapangan</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>

          {newRole === "Petugas Lapangan" ? (
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Rayon Penugasan Kerja</label>
              <select
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="Kecamatan Sukamaju">Kecamatan Sukamaju</option>
                <option value="Kecamatan Sukaresmi">Kecamatan Sukaresmi</option>
                <option value="Kecamatan Jatisari">Kecamatan Jatisari</option>
                <option value="Kecamatan Mekarsari">Kecamatan Mekarsari</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Rayon Penugasan Kerja</label>
              <input
                type="text"
                readOnly
                value="Pusat Kabupaten"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-[#535CE8] hover:bg-[#434AC7] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#535CE8]/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambahkan</span>
            </button>
          </div>

        </form>

        {/* List of active account cards table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 font-mono">
                <th className="px-5 py-4">ID & Anggota Operator</th>
                <th className="px-5 py-4">Status Role</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Rayon Kerja Terpetakan</th>
                <th className="px-5 py-4 text-center">Tally Input Rekam</th>
                <th className="px-5 py-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
              {accounts.map((user) => {
                const isEditing = editingUserId === user.id;
                return (
                  <tr key={user.id} className={`${isEditing ? "bg-amber-50/40 hover:bg-amber-50/50" : "hover:bg-gray-50/70"} transition-colors`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${user.avatarColor || "bg-indigo-600"} text-white flex items-center justify-center font-bold text-[10px] uppercase overflow-hidden shrink-0`}>
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            user.id
                          )}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold text-gray-950 focus:outline-none focus:ring-1 focus:ring-[#535CE8]"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-950 flex items-center gap-1">
                              {user.name} 
                              {user.id === currentAccountId && (
                                <span className="text-[10px] bg-[#F0F1FE] text-[#535CE8] px-1.5 py-0.2 rounded font-semibold font-mono">Anda</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => {
                            const role = e.target.value as "Admin" | "Petugas Lapangan";
                            setEditRole(role);
                            if (role === "Admin") {
                              setEditRegion("Pusat Kabupaten");
                            }
                          }}
                          className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Petugas Lapangan">Petugas Lapangan</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold font-mono ${
                          user.role === "Admin"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-medium font-mono text-gray-700 w-44 focus:outline-none focus:ring-1 focus:ring-[#535CE8]"
                        />
                      ) : (
                        <span className="font-medium font-mono text-gray-500">{user.email}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        editRole === "Admin" ? (
                          <span className="text-gray-400 italic text-[10px]">Pusat Kabupaten</span>
                        ) : (
                          <select
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                          >
                            <option value="Kecamatan Sukamaju">Kecamatan Sukamaju</option>
                            <option value="Kecamatan Sukaresmi">Kecamatan Sukaresmi</option>
                            <option value="Kecamatan Jatisari">Kecamatan Jatisari</option>
                            <option value="Kecamatan Mekarsari">Kecamatan Mekarsari</option>
                          </select>
                        )
                      ) : (
                        <span className="font-semibold text-gray-700">{user.region}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-extrabold text-slate-800">{user.totalInputs || 0} Draft</td>
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(user)}
                            className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1.5 px-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-[10px] border border-gray-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(user)}
                            className="p-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#535CE8] font-bold text-[10px] border border-indigo-150 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={user.id === currentAccountId}
                            onClick={() => handleDeleteUserClick(user)}
                            className={`p-1.5 px-2.5 rounded-lg font-bold text-[10px] border transition-all flex items-center gap-1 cursor-pointer ${
                              user.id === currentAccountId 
                                ? "bg-gray-50 text-gray-300 border-gray-150 cursor-not-allowed"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="delete-confirmation-modal">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 uppercase">Konfirmasi Hapus Akun</h3>
                <p className="text-[10px] text-gray-400">Tindakan ini tidak dapat diurungkan</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun operator <strong className="text-gray-950 font-bold">{confirmDeleteUser.name}</strong> ({confirmDeleteUser.email})? 
              <br />
              Seluruh statistik biodata dan rekam tugas tetap tersimpan, namun hak akses sistem akan segera dicabut.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold py-2.5 px-4 rounded-xl border border-gray-250 cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
