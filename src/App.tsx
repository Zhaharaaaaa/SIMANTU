/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { INITIAL_SUBMISSIONS, USER_ACCOUNTS } from "./data";
import { Submission, UserAccount } from "./types";
import LoginGateway from "./components/LoginGateway";
import InteractiveLoginGateway from "./components/InteractiveLoginGateway";

// Import all modularized Looker Studio views
import AdminDashboardView from "./components/AdminDashboardView";
import AdminMonitoringView from "./components/AdminMonitoringView";
import AdminVerificationView from "./components/AdminVerificationView";
import AdminReportsView from "./components/AdminReportsView";
import AdminSettingsView from "./components/AdminSettingsView";

import OfficerDashboardView from "./components/OfficerDashboardView";
import OfficerInputView from "./components/OfficerInputView";
import OfficerStatusView from "./components/OfficerStatusView";
import AiAssistantWidget from "./components/AiAssistantWidget";
import { playSound } from "./utils/audio";

// Icons from lucide-react
import { 
  LayoutDashboard, Eye, ClipboardCheck, FileText, Settings, 
  PlusCircle, ListTodo, Shield, MapPin, Globe, LogOut, Menu, X
} from "lucide-react";

export default function App() {
  // Live states for cross-role synchronized sandbox
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const persisted = localStorage.getItem("simantu_submissions_v1");
      return persisted ? JSON.parse(persisted) : INITIAL_SUBMISSIONS;
    } catch (e) {
      return INITIAL_SUBMISSIONS;
    }
  });
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const persisted = localStorage.getItem("simantu_accounts_v1");
      return persisted ? JSON.parse(persisted) : USER_ACCOUNTS;
    } catch (e) {
      return USER_ACCOUNTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("simantu_submissions_v1", JSON.stringify(submissions));
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem("simantu_accounts_v1", JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>("PB05"); // Default to Zhahara Sukirman (Admin)
  const [activeTab, setActiveTab] = useState<string>("dashboard"); // "dashboard", "monitoring", etc.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Start at the login gateway page!
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Fetch current user details
  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const isAdmin = currentAccount.role === "Admin";

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return isAdmin ? "Dashboard Admin" : "Dashboard Ringkasan";
      case "monitoring":
        return "Monitoring Sosial";
      case "verifikasi":
        return "Verifikasi Berkas";
      case "laporan":
        return "Laporan Statistik";
      case "pengaturan":
        return "Pengaturan Sesi";
      case "input-data":
        return "Input Data Lapangan";
      case "status-pengajuan":
        return "Status Pengajuan";
      default:
        return tab;
    }
  };

  // Reset tab route back to "dashboard" automatically when changing logged-in role
  useEffect(() => {
    setActiveTab("dashboard");
    setIsMobileMenuOpen(false);
  }, [selectedAccountId, isAdmin]);

  // Global click listener to automatically trigger pleasant feedback sound on all buttons, tabs & links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        const tagName = target.tagName.toLowerCase();
        const role = target.getAttribute("role");
        const hasCursorPointer = target.classList.contains("cursor-pointer");
        const hasButtonClass = target.className && typeof target.className === "string" && (
          target.className.includes("btn") || 
          target.className.includes("button")
        );
        
        if (
          tagName === "button" || 
          tagName === "a" || 
          role === "button" || 
          hasCursorPointer ||
          hasButtonClass
        ) {
          // Play clean mechanical click/tap sound
          playSound("click");
          break;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  // Method 1: Field officer submits new social status changes
  const handleSubmitNewSubmission = (newSub: Omit<Submission, "id" | "officerId" | "officerName" | "region" | "status" | "adminComment">) => {
    const nextIdNum = submissions.length + 1;
    const formattedId = "SUB-" + String(nextIdNum).padStart(3, "0");

    const fullSubmission: Submission = {
      ...newSub,
      id: formattedId,
      officerId: currentAccount.id,
      officerName: currentAccount.name,
      region: currentAccount.region,
      status: "Pending", // Always starts as pending for admin checklist audit
      adminComment: ""
    };

    setSubmissions([fullSubmission, ...submissions]);

    // Update active user total count
    setAccounts(prevAccts => 
      prevAccts.map(acc => 
        acc.id === currentAccount.id 
          ? { ...acc, totalInputs: acc.totalInputs + 1 }
          : acc
      )
    );
    playSound("success");
  };

  // Method 2: System Admin approves/rejects pending submissions with explanations
  const handleVerifySubmission = (id: string, status: "Approved" | "Rejected", comment: string) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id 
          ? { ...sub, status, adminComment: comment }
          : sub
      )
    );
    playSound(status === "Approved" ? "success" : "tap");
  };

  // Method 3: Administrator creates an entirely new user account
  const handleAddAccount = (newAcct: Omit<UserAccount, "totalInputs">) => {
    const fullAccount: UserAccount = {
      ...newAcct,
      totalInputs: 0
    };
    setAccounts([...accounts, fullAccount]);
    playSound("success");
  };

  // Method 3.1: Update existing account
  const handleUpdateAccount = (updatedAcct: UserAccount) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAcct.id ? updatedAcct : acc));
  };

  // Method 3.2: Delete existing account
  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  // Method 4: Reset sandbox variables back to initial state
  const handleResetData = () => {
    setSubmissions(INITIAL_SUBMISSIONS);
    setAccounts(USER_ACCOUNTS);
    setSelectedAccountId("PB05");
    setActiveTab("dashboard");
    playSound("tap");
  };

  if (!isLoggedIn) {
    return (
      <InteractiveLoginGateway
        accounts={accounts}
        onLoginSuccess={(accountId) => {
          setSelectedAccountId(accountId);
          setIsLoggedIn(true);
          playSound("success");
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FFFFFF] overflow-x-hidden flex flex-col font-sans text-slate-750 selection:bg-[#535CE8]/10 selection:text-[#535CE8]" id="simantu-applet-root">
      
      {/* ====================================================================
          LAPISAN BG: CAHAYA/AURA GRADASI YANG BERGERAK DI BELAKANG (z-0)
         ==================================================================== */}
      {/* LAYAR LATAR BELAKANG CAHAYA */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none" id="background-aura-container">
        {/* Cahaya Biru - Tambahkan class 'will-change-transform' */}
        <div className="absolute top-[-50px] left-[10%] w-[550px] h-[550px] bg-[#535CE8]/8 rounded-full blur-[140px] animate-aura-1 will-change-transform"></div>
        
        {/* Cahaya Ungu - Tambahkan class 'will-change-transform' */}
        <div className="absolute bottom-[-50px] right-[15%] w-[600px] h-[600px] bg-[#7c3aed]/6 rounded-full blur-[150px] animate-aura-2 will-change-transform"></div>
      </div>

      {/* Top filter menu bar */}
      <LoginGateway
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onResetData={handleResetData}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsMobileMenuOpen(false);
        }}
      />

      {/* ====================================================================
          1. HEADER/NAVBAR MOBILE TERPADU (Hanya muncul di layar HP/Tablet < 1024px)
         ==================================================================== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white opacity-100 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm" id="mobile-navigation-trigger-bar">
        {/* SISI KIRI: Foto Profil (Avatar) + Badge Role, Sejajar Tanpa Logo "SIMANTU" */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Foto profil lingkaran mini */}
          <div className={`w-7 h-7 rounded-full ${currentAccount.avatarColor || "bg-indigo-600"} text-white flex items-center justify-center font-extrabold text-[10px] uppercase overflow-hidden ring-1 ring-gray-100 shadow-xs shrink-0`}>
            {currentAccount.avatarUrl ? (
              <img 
                src={currentAccount.avatarUrl} 
                alt={currentAccount.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              currentAccount.id
            )}
          </div>
          
          <span className="text-[9px] px-2 py-1 bg-[#535CE8]/10 text-[#535CE8] rounded-md font-mono uppercase font-black tracking-widest leading-none shrink-0 border border-[#535CE8]/20">
            {isAdmin ? "DASHBOARD ADMIN" : "PETUGAS"}
          </span>
        </div>
        
        {/* SISI KANAN: Tombol Hamburger Menu */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            /* Ikon Silang (X) saat menu terbuka */
            <svg className="w-6 h-6 text-[#535CE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            /* Ikon Garis Tiga (Hamburger) saat menu tertutup */
            <svg className="w-6 h-6 text-[#535CE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>

        {/* MEKANISME MENU JATUH (Dropdown Navigation) */}
        {isMobileMenuOpen && (
          <div 
            className="absolute top-full left-0 right-0 bg-white opacity-100 border-b border-gray-200 shadow-xl flex flex-col p-4 gap-1.5 z-40 transition-all duration-200"
            id="mobile-dropdown-navigation"
          >
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "dashboard"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Admin</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("monitoring");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "monitoring"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Monitoring Sosial</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("verifikasi");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "verifikasi"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Verifikasi Berkas</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("laporan");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "laporan"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Laporan Statistik</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("pengaturan");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "pengaturan"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan Sesi</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "dashboard"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("input-data");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "input-data"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Data</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("status-pengajuan");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeTab === "status-pengajuan"
                      ? "bg-[#F0F1FE] text-[#535CE8]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ListTodo className="w-4 h-4" />
                  <span>Status Pengajuan</span>
                </button>
              </>
            )}

            {/* Separator & Logout option */}
            <div className="pt-2 border-t border-gray-100 my-1"></div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar / Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Backdrop to close mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main split dashboard canvas */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 lg:p-6 gap-6 z-10 relative">
        
        {/* ====================================================================
            2. SIDEBAR UTAMA (Desktop: Standar, Mobile: Sembunyi)
           ==================================================================== */}
        <aside 
          className="hidden lg:flex lg:flex-col lg:w-64 lg:static lg:bg-white/75 lg:border lg:border-gray-100 lg:rounded-2xl lg:p-5 lg:justify-between lg:flex-shrink-0 lg:shadow-sm lg:overflow-y-visible"
          id="looker-studio-vertical-sidebar"
        >
          <div className="space-y-6">
            
            {/* Mobile Header within Sidebar */}
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-gray-100">
              <span className="font-extrabold text-xs tracking-wider text-[#535CE8] uppercase font-mono">MENU UTAMA</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active User profile card widget */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className={`w-9 h-9 rounded-xl ${currentAccount.avatarColor} text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm overflow-hidden shrink-0`}>
                {currentAccount.avatarUrl ? (
                  <img 
                    src={currentAccount.avatarUrl} 
                    alt={currentAccount.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentAccount.id
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider font-mono">AKTIF LOGIN:</span>
                <h4 className="text-xs font-bold text-gray-950 truncate" title={currentAccount.name}>
                  {currentAccount.name.split(" ")[0]} 
                  <span className="font-normal text-gray-400"> ({currentAccount.id})</span>
                </h4>
                <p className="text-[9px] text-gray-400 truncate">{currentAccount.region}</p>
              </div>
            </div>

            {/* Navigation Lists */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2.5">
                MENU ANALITIK
              </h5>
              
              <nav className="space-y-1" id="navigation-sidebar-container">
                {isAdmin ? (
                  /* ADMINISTRATOR NAVIGATION LINKS (5 items) */
                  <>
                    <button
                      onClick={() => {
                        setActiveTab("dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "dashboard"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Admin</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("monitoring");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "monitoring"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Monitoring</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("verifikasi");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "verifikasi"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Verifikasi</span>
                      </div>
                      {submissions.filter(s => s.status === "Pending").length > 0 && (
                        <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                          {submissions.filter(s => s.status === "Pending").length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("laporan");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "laporan"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Laporan</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("pengaturan");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "pengaturan"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Pengaturan</span>
                    </button>
                  </>
                ) : (
                  /* OFFICER FIELD LAPANGAN NAVIGATION LINKS (3 items) */
                  <>
                    <button
                      onClick={() => {
                        setActiveTab("dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "dashboard"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("input-data");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "input-data"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Input Data</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("status-pengajuan");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "status-pengajuan"
                          ? "bg-[#F0F1FE] text-[#535CE8]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <ListTodo className="w-4 h-4" />
                      <span>Status Pengajuan</span>
                    </button>
                  </>
                )}

                {/* Separator & Logout Button within Navigation */}
                <div className="pt-2 border-t border-gray-100 my-2"></div>
                <button
                  onClick={() => {
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Log Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Metadata */}
          <div className="border-t border-gray-100 pt-5 mt-6 space-y-4 text-xs">
            <div>
              <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                Wilayah Kerja & SLA
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-[10px]">Rayon Terpeta</span>
                  <span className="font-bold text-gray-700">4 Kecamatan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-[10px]">Terverifikasi</span>
                  <span className="font-bold text-emerald-600">
                    {submissions.filter(s => s.status === "Approved").length} / {submissions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status matching Design HTML */}
            <div className="pt-3 border-t border-gray-50">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1.5">Status System</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-gray-400 font-mono font-medium">API Connected & Live</span>
              </div>
            </div>

            {/* Attribution branding footer metadata */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[9px] text-gray-400 leading-relaxed font-mono">
              <span className="font-bold text-[10px] text-[#535CE8] block mb-0.5">STT Nurul Fikri</span>
              Kelompok SIMANTU 2026. Laporan otomatis terintegrasi.
            </div>
          </div>

        </aside>

        {/* RIGHT LIVE RENDERING ACTION CANVAS */}
        <main className={`flex-1 space-y-6 overflow-y-auto pt-[70px] lg:pt-0 ${!isAdmin ? "pb-24 lg:pb-0" : ""}`} id="dashboard-canvas-content">
          
          {/* Dynamically Render selected Looker Studio Page for Admin/Officer */}
          {isAdmin ? (
            /* ADMIN PAGE CHANNELS */
            <>
              {activeTab === "dashboard" && (
                <AdminDashboardView 
                  submissions={submissions} 
                  onNavigateToTab={setActiveTab} 
                />
              )}
              {activeTab === "monitoring" && (
                <AdminMonitoringView 
                  submissions={submissions} 
                />
              )}
              {activeTab === "verifikasi" && (
                <AdminVerificationView 
                  submissions={submissions} 
                  onVerifySubmission={handleVerifySubmission} 
                />
              )}
              {activeTab === "laporan" && (
                <AdminReportsView submissions={submissions} accounts={accounts} />
              )}
              {activeTab === "pengaturan" && (
                <AdminSettingsView 
                  accounts={accounts} 
                  onAddAccount={handleAddAccount} 
                  onUpdateAccount={handleUpdateAccount}
                  onDeleteAccount={handleDeleteAccount}
                  currentAccountId={selectedAccountId}
                />
              )}
            </>
          ) : (
            /* OFFICER PAGE CHANNELS (Row-level security automatically enforced inside them) */
            <>
              {activeTab === "dashboard" && (
                <OfficerDashboardView 
                  currentOfficer={currentAccount} 
                  submissions={submissions} 
                  onNavigateToTab={setActiveTab} 
                />
              )}
              {activeTab === "input-data" && (
                <OfficerInputView 
                  onSubmitNewSubmission={handleSubmitNewSubmission} 
                  onNavigateToTab={setActiveTab} 
                />
              )}
              {activeTab === "status-pengajuan" && (
                <OfficerStatusView 
                  currentOfficer={currentAccount} 
                  submissions={submissions} 
                />
              )}
            </>
          )}

          {/* Shared design footer */}
          <footer className="mt-12 pt-6 pb-6 border-t border-slate-100 text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs tracking-wider text-slate-800">SIMANTU</span>
                <span className="bg-indigo-50 text-indigo-600 font-mono text-[8px] font-black px-1.5 py-0.5 rounded-md border border-gray-250 uppercase">BI v2.1</span>
              </div>
              <span className="hidden sm:inline text-slate-200">|</span>
              <span className="text-[11px] text-slate-500">
                Sistem Informasi Manajemen Bantuan Terpadu &copy; 2026. Hak Cipta Dilindungi.
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="text-slate-600">Sistem Terverifikasi & Sinkron</span>
              </span>
              <span className="text-slate-200">|</span>
              <span className="text-slate-500">STT Terpadu Nurul Fikri</span>
            </div>
          </footer>

        </main>

      </div>

      {/* MODAL POPUP LOGOUT */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          
          {/* Modal Box */}
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full mx-auto transform transition-all scale-100 z-10 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Circular Red Out Icon */}
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <LogOut className="w-6 h-6 animate-pulse" />
            </div>
            
            <h3 className="text-gray-900 font-extrabold text-base mb-2">
              Konfirmasi Keluar
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin keluar dari sistem SIMANTU? Anda akan dikembalikan ke halaman awal login.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setIsLoggedIn(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-rose-600/15 cursor-pointer"
              >
                Ya, Keluar
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          BOTTOM NAVIGATION BAR FOR FIELD OFFICERS (Petugas Lapangan)
          Hanya aktif jika role bukan Admin, tersemat di resolusi tablet/mobile (< 1024px)
         ==================================================================== */}
      {!isAdmin && (
        <nav 
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-slate-150 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] flex items-center justify-around px-3 py-1.5 pb-safe"
          id="field-officer-bottom-nav"
        >
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center flex-1 h-12 py-1 transition-all rounded-xl cursor-pointer min-h-[44px] ${
              activeTab === "dashboard"
                ? "text-[#535CE8] font-black scale-103"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold">Dasbor</span>
          </button>

          <button
            onClick={() => setActiveTab("input-data")}
            className={`flex flex-col items-center justify-center flex-1 h-12 py-1 transition-all rounded-xl cursor-pointer min-h-[44px] ${
              activeTab === "input-data"
                ? "text-[#535CE8] font-black scale-103"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold">Input Data</span>
          </button>

          <button
            onClick={() => setActiveTab("status-pengajuan")}
            className={`flex flex-col items-center justify-center flex-1 h-12 py-1 transition-all rounded-xl cursor-pointer min-h-[44px] ${
              activeTab === "status-pengajuan"
                ? "text-[#535CE8] font-black scale-103"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ListTodo className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold">Status</span>
          </button>
        </nav>
      )}

      {/* FLOAT AI CHAT ASSISTANT WIDGET */}
      <AiAssistantWidget currentAccount={currentAccount} />

    </div>
  );
}
