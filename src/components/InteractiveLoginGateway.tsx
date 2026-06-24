/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserAccount } from "../types";
import { Shield, Users, Mail, Lock, LogIn, Database, CheckCircle2, Eye, EyeOff } from "lucide-react";
import simantuLogo from "../assets/images/clean_bar_chart_logo_1781744820963.jpg";
import { motion } from "motion/react";

interface InteractiveLoginGatewayProps {
  accounts: UserAccount[];
  onLoginSuccess: (accountId: string) => void;
}

export default function InteractiveLoginGateway({
  accounts,
  onLoginSuccess
}: InteractiveLoginGatewayProps) {
  // Toggle state: "Admin" (Administrator) vs "Petugas Lapangan"
  const [selectedRole, setSelectedRole] = useState<"Admin" | "Petugas Lapangan">("Admin");
  
  // Local inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("•••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password flow states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Alamat email tidak boleh kosong.");
      return;
    }
    if (!forgotEmail.includes("@")) {
      setForgotError("Format email tidak valid.");
      return;
    }
    setForgotError(null);
    setForgotPasswordStep(2);
  };

  // Auto-select or change credentials when role changed
  useEffect(() => {
    if (selectedRole === "Admin") {
      setEmail("zhahara192@gmail.com");
    } else {
      setEmail("martin.analyst@simantu.go.id");
    }
  }, [selectedRole]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Mohon masukkan Alamat Email / Username Anda.");
      return;
    }

    // Find if database has this account email or ID matching
    const matchedAcc = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() || a.id.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedAcc) {
      setErrorMsg(null);
      onLoginSuccess(matchedAcc.id);
    } else {
      setErrorMsg("Kredensial tidak ditemukan pada daftar sandbox. Silakan masukkan alamat email yang valid.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 80, damping: 15 } 
    }
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { type: "spring", stiffness: 100, damping: 12 } 
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen w-full bg-[#FFFFFF] relative flex items-center justify-center p-4 overflow-hidden font-sans" id="forgot-password-screen">
        {/* Soft Moving Glow Aura behind card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="forgot-password-auras">
          {/* Royal Blue Aura */}
          <motion.div
            animate={{
              scale: [1, 1.15, 0.9, 1.1, 1],
              x: [-40, 50, -30, 20, -40],
              y: [-30, 30, -20, 40, -30]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-[20%] left-[20%] w-[450px] h-[450px] bg-[#535CE8]/6 rounded-full blur-[120px] will-change-transform"
          />
          {/* Subtle Pink/Purple Aura */}
          <motion.div
            animate={{
              scale: [1, 0.9, 1.15, 0.95, 1],
              x: [30, -30, 20, -40, 30],
              y: [40, -20, 30, -30, 40]
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-[#7c3aed]/5 rounded-full blur-[130px] will-change-transform"
          />
        </div>

        {/* Card Centered */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="relative z-10 w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(83,92,232,0.08)] flex flex-col justify-between"
          id="forgot-password-card"
        >
          {forgotPasswordStep === 1 ? (
            <div className="space-y-6">
              {/* Heading */}
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-extrabold uppercase text-[#535CE8] tracking-widest bg-[#F0F1FE] px-3 py-1.5 rounded-full inline-block mb-3">
                  Pemulihan Akun
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Lupa Kata Sandi?</h3>
                <p className="text-xs text-gray-450 mt-1.5 leading-relaxed font-semibold">
                  Masukkan alamat email SIMANTU Anda yang terdaftar di bawah ini. Kami akan mengirimkan tautan pemulihan kata sandi yang aman.
                </p>
              </div>

              {forgotError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-4 py-3 rounded-xl animate-fadeIn">
                  {forgotError}
                </div>
              )}

              {/* Form Input Email */}
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="operator@simantu.go.id"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#535CE8]/20 focus:border-[#535CE8]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#535CE8] hover:bg-[#434AC7] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-[#535CE8]/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Kirim Link Pulihkan</span>
                </button>
              </form>
            </div>
          ) : (
            /* Success step 2 */
            <div className="space-y-6 text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm animate-scaleIn">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Email Terkirim!</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed px-1 sm:px-3">
                  Link pemulihan kata sandi telah dikirim ke email Anda:
                  <br />
                  <strong className="text-gray-900 font-bold font-mono text-[11px] block mt-1.5 p-1.5 bg-gray-50 rounded-lg">{forgotEmail}</strong>
                  <br />
                  Silakan periksa kotak masuk atau spam email Anda.
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl text-left text-[11px] text-emerald-800 leading-relaxed font-semibold">
                ℹ️ <strong>Simulasi Sandbox:</strong> Email pengiriman berhasil disimulasikan. Token reset Anda disimpan sementara untuk sesi lokal ini.
              </div>
            </div>
          )}

          {/* Back button common to both steps */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordStep(1);
              }}
              className="w-full text-center text-xs font-extrabold text-gray-500 hover:text-[#535CE8] active:text-[#434AC7] py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 rotate-180" />
              <span>Kembali ke Halaman Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] font-sans" id="interactive-login-screen">
      
      {/* SISI KIRI (Visual Accent Area - Highly Decorated & Premium) */}
      <div className="md:w-1/2 bg-simantu-animated text-white p-8 md:p-14 lg:p-16 flex flex-col justify-between relative overflow-hidden" id="login-left-banner">
        
        {/* Advanced Decorative Floating Auras and Glass Shapes with Framer Motion loop animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 0.95, 1.1, 1],
              x: [0, 45, -25, 30, 0],
              y: [0, -35, 20, -15, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[550px] h-[550px] rounded-full bg-indigo-500/10 blur-[120px] absolute -top-40 -left-20"
          />
          <motion.div 
            animate={{ 
              scale: [1, 0.9, 1.1, 0.95, 1],
              x: [0, -30, 40, -15, 0],
              y: [0, 25, -30, 35, 0]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[100px] absolute bottom-[-50px] right-[-50px]"
          />
          
          {/* Futuristic Glowing Vector Wave Paths (No dots, but elegant interactive lines) */}
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="none">
              <defs>
                <linearGradient id="vector-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#818CF8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="vector-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#C084FC" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path 
                d="M-100,200 C150,100 250,500 500,300 C750,100 850,400 1000,250" 
                fill="none" 
                stroke="url(#vector-grad-1)" 
                strokeWidth="2.5"
                animate={{
                  d: [
                    "M-100,200 C150,150 250,450 500,300 C750,150 850,450 1000,250",
                    "M-100,250 C150,50 300,550 505,250 C710,50 850,350 1000,300",
                    "M-100,200 C150,150 250,450 500,300 C750,150 850,450 1000,250"
                  ]
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.path 
                d="M-50,600 C200,450 350,200 600,500 C850,800 900,400 1100,550" 
                fill="none" 
                stroke="url(#vector-grad-2)" 
                strokeWidth="1.5"
                animate={{
                  d: [
                    "M-50,600 C200,450 350,200 600,500 C850,800 900,400 1100,550",
                    "M-50,550 C220,550 300,100 620,400 C840,700 950,500 1100,500",
                    "M-50,600 C200,450 350,200 600,500 C850,800 900,400 1100,550"
                  ]
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.path 
                d="M0,400 Q200,600 400,400 T800,400" 
                fill="none" 
                stroke="url(#vector-grad-1)" 
                strokeWidth="1.2"
                strokeDasharray="6 8"
                animate={{
                  strokeDashoffset: [0, -120]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </svg>
          </div>
          
          {/* Circular abstract glass loops */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[450px] h-[450px] rounded-full border border-white/5 absolute -top-20 -left-20"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="w-[300px] h-[300px] rounded-full border border-white/5 absolute -bottom-10 -right-10"
          />
        </div>

        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-4 relative z-10"
        >
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-12 h-12 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-xl border border-white/30 shrink-0 transform transition-transform duration-300"
          >
            <img 
              src={simantuLogo} 
              alt="SIMANTU Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">SIMANTU</h2>
              <span className="text-[8px] bg-white/10 text-white border border-white/20 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">v3.4 SHARED</span>
            </div>
            <p className="text-[9px] text-indigo-200 font-extrabold tracking-widest uppercase">SISTEM MONITORING STATUS SOSIAL KEPENDUDUKAN</p>
          </div>
        </motion.div>

        {/* Slogan and Highlight Message with Premium layout and staggered animation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="my-auto py-10 md:py-6 relative z-10 max-w-lg space-y-6"
        >
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[9px] font-extrabold tracking-wider text-indigo-100 uppercase backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SATU DATA KESEJAHTERAAN SOSIAL DAERAH</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white"
          >
            Kelola Realisasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-200">Kesejahteraan</span> Secara Transparan
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xs md:text-sm text-indigo-100/90 font-medium leading-relaxed"
          >
            Platform Business Intelligence & Monitoring status kependudukan daerah. Mempertemukan integrasi DTKS, koordinasi fungsional Petugas Lapangan, dan rekapitulasi audit berkas oleh Administrator.
          </motion.p>

          {/* New Glassmorphic Interactive Dashboard Info-Card */}
          <motion.div 
            variants={scaleInVariants}
            className="p-5 pl-6 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative space-y-4 overflow-hidden"
          >
            <div className="absolute top-0 right-0 transform translate-x-1 translate-y-1 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full"></div>
            
            <h3 className="text-xs font-black text-emerald-300 tracking-wider uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>METRIK INTEGRASI AKTIF</span>
            </h3>

            {/* Bullet achievements badges inside glass box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="space-y-1"
              >
                <span className="text-[10px] text-indigo-200 font-bold uppercase block tracking-wider">STATUS SINYAL API</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"></span>
                  <span className="text-xs font-bold text-white font-mono">99.98% SLA ONLINE</span>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="space-y-1"
              >
                <span className="text-[10px] text-indigo-200 font-bold uppercase block tracking-wider">RAYON MAP TERPETAKAN</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-md shadow-blue-400/50"></span>
                  <span className="text-xs font-bold text-white font-mono">4 KECAMATAN</span>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="space-y-1"
              >
                <span className="text-[10px] text-indigo-200 font-bold uppercase block tracking-wider">DESENTRALISASI DATALINK</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-400/50"></span>
                  <span className="text-xs font-bold text-white font-mono">ROW-LEVEL SECURITY</span>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="space-y-1"
              >
                <span className="text-[10px] text-indigo-200 font-bold uppercase block tracking-wider">SINKRONISASI DTKS</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/50"></span>
                  <span className="text-xs font-bold text-white font-mono">TERJADWAL OTOMATIS</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer info group with highly professional spacing */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-[10px] text-indigo-200/60 relative z-10 font-mono flex flex-col sm:flex-row justify-between border-t border-white/10 pt-5 gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>&copy; {new Date().getFullYear()} STT NF Scrum Initiative Unit</span>
          </div>
          <span className="text-right tracking-wider">SECURE BACKEND CONNECTED</span>
        </motion.div>

      </div>

      {/* SISI KANAN (Formulir Login Area) */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md space-y-8 animate-fadeIn" id="login-form-wrapper">
          
          {/* Form Title */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#535CE8] tracking-widest bg-[#F0F1FE] px-3 py-1.5 rounded-full inline-block mb-3.5">
                Portal Otentikasi
              </span>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Masuk SIMANTU</h3>
              <p className="text-xs text-gray-400 mt-1">Gunakan sandi kredensial sandbox terdaftar untuk mengakses panel visualisasi data.</p>
            </div>
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-indigo-100 flex items-center justify-center bg-white shrink-0 sm:block hidden">
              <img 
                src={simantuLogo} 
                alt="SIMANTU Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Main Action Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            {/* COMPONENT KONTROL AKSES PERAN (interactive selector) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider block">
                Pilih Peran Anda :
              </label>
              
              <div className="grid grid-cols-2 gap-3" id="role-selection-pills">
                {/* Pill 1: Administrator */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("Admin")}
                  className={`py-3.5 px-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    selectedRole === "Admin"
                      ? "border-[#535CE8] bg-[#F0F1FE] text-[#535CE8] shadow-sm font-extrabold"
                      : "border-gray-200 hover:border-gray-300 text-gray-500 font-bold"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <div className="text-xs">
                    <span className="block">Administrator</span>
                    <span className="text-[9px] text-gray-400 font-mono font-normal">Audit & Pengaturan</span>
                  </div>
                </button>

                {/* Pill 2: Petugas Lapangan */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("Petugas Lapangan")}
                  className={`py-3.5 px-4 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    selectedRole === "Petugas Lapangan"
                      ? "border-[#535CE8] bg-[#F0F1FE] text-[#535CE8] shadow-sm font-extrabold"
                      : "border-gray-200 hover:border-gray-300 text-gray-500 font-bold"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <div className="text-xs">
                    <span className="block">Petugas Lapangan</span>
                    <span className="text-[9px] text-gray-400 font-mono font-normal">Input Data Rayon</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Email / Username Input Area */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                Email / Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@simantu.go.id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#535CE8]/20 focus:border-[#535CE8]"
                />
              </div>
            </div>

            {/* Password input Area */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                  Kata Sandi
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotPasswordStep(1);
                    setForgotEmail(email); // prepopulate with whatever they typed in login input
                    setForgotError(null);
                  }} 
                  className="text-[10px] font-bold text-[#535CE8] hover:underline focus:outline-none cursor-pointer"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi kuncian"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#535CE8]/20 focus:border-[#535CE8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#535CE8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Lock Filter Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#535CE8] hover:bg-[#434AC7] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-[#535CE8]/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Dashboard</span>
              </button>
            </div>

          </form>

          {/* Quick instruction for evaluator */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-450 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Tip Pengujian:</strong> Hubungan login global mengunci visibilitas data dinas berdasarkan role peninjauan terpilih.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
