/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Submission, ChangeCategory } from "../types";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Sparkles, Loader2 } from "lucide-react";

interface OfficerInputViewProps {
  onSubmitNewSubmission: (newSub: Omit<Submission, "id" | "officerId" | "officerName" | "region" | "status" | "adminComment">) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function OfficerInputView({
  onSubmitNewSubmission,
  onNavigateToTab
}: OfficerInputViewProps) {
  // Local Form state variables
  const [nik, setNik] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [changeType, setChangeType] = useState<ChangeCategory>("Perubahan Kelas Pendapatan");
  const [previousValue, setPreviousValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [details, setDetails] = useState("");
  const [evidenceType, setEvidenceType] = useState<"PDF" | "JPG" | "PNG">("PNG");
  
  // Simulation for file upload drag and drop states
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side document upload validation and indicator states
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // File zone drag-and-drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);
    setUploadedFileName(null);
    setFilePreviewUrl(null);
    setUploadProgress(0);
    setIsUploadingFile(false);

    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(ext)) {
      setErrorMsg("Gagal mengunggah: Format berkas tidak didukung. Hanya menerima format .jpg, .jpeg, .png, dan .pdf.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      setErrorMsg("Gagal mengunggah: Ukuran berkas terlalu besar (Maksimal 5MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Auto-set correct select evidence type options
    if (ext === "pdf") {
      setEvidenceType("PDF");
    } else if (ext === "png") {
      setEvidenceType("PNG");
    } else {
      setEvidenceType("JPG");
    }

    // Process simulation
    setIsUploadingFile(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploadingFile(false);
          setUploadedFileName(file.name);
          
          if (file.type.startsWith("image/")) {
            try {
              const url = URL.createObjectURL(file);
              setFilePreviewUrl(url);
            } catch (e) {
              setFilePreviewUrl(null);
            }
          } else {
            setFilePreviewUrl("pdf_placeholder");
          }
        }, 150);
      }
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFileZoneManual = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (nik.length !== 16) {
      setErrorMsg("Format Penulisan NIK salah. Harus 16 digit angka lengkap.");
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }
    if (!citizenName || !details || !previousValue || !newValue) {
      setErrorMsg("Mohon lengkapi seluruh formulir data lapangan.");
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    setIsSubmitting(true);

    const mockupUrls = [
      "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60"
    ];
    const pickedUrl = mockupUrls[Math.floor(Math.random() * mockupUrls.length)];

    // Simulate net transport latency
    setTimeout(() => {
      onSubmitNewSubmission({
        date: new Date().toISOString().split("T")[0],
        nik,
        citizenName,
        changeType,
        details,
        evidenceType,
        evidenceUrl: pickedUrl,
        previousValue,
        newValue
      });

      // Clear states
      setIsSubmitting(false);
      setSuccessToast(true);

      setNik("");
      setCitizenName("");
      setPreviousValue("");
      setNewValue("");
      setDetails("");
      setUploadedFileName(null);

      setTimeout(() => {
        setSuccessToast(false);
        // Auto-navigate to trace log
        onNavigateToTab("status-pengajuan");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="view-officer-input">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Formulir Digital Lapangan</h2>
        <p className="text-xs text-gray-400 font-medium">Laporkan temuan perubahan kelas sosial kependudukan real-time di rayon Anda.</p>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Rekam data berhasil terkirim! Sedang mengalihkan Anda ke status pelacakan...</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center gap-2 shadow-sm animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main split row layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Main Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-gray-250">
          
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-gray-100">
            <Sparkles className="w-4.5 h-4.5 text-[#535CE8]" />
            <h4 className="text-xs font-black text-gray-900 uppercase">Input Berkas Lapangan</h4>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* NIK */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="NIK 16 digit: 3271xxxxxxxxxxxx"
                  required
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all"
                />
              </div>

              {/* Nama Warga */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nama Lengkap Warga</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Suherman"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 font-mono">Kategori Perubahan</label>
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value as ChangeCategory)}
                  className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Perubahan Kelas Pendapatan">Perubahan Kelas Pendapatan</option>
                  <option value="Status Pekerjaan">Status Pekerjaan</option>
                  <option value="Status Sosial">Status Sosial</option>
                  <option value="Penerima Bansos">Penerima Bansos</option>
                </select>
              </div>

              {/* Previous Value */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Data Lama (Previous)</label>
                <input
                  type="text"
                  placeholder="Misal: Belum Kawin"
                  required
                  value={previousValue}
                  onChange={(e) => setPreviousValue(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all"
                />
              </div>

              {/* New Value */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Data Baru (Proposed)</label>
                <input
                  type="text"
                  placeholder="Misal: Kawin"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* details description */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Argumentasi Penemuan Lapangan</label>
              <textarea
                rows={3}
                placeholder="Deskripsikan temuan Anda, misal: 'Warga bersangkutan menderita sakit permanen mengakibatkan penurunan kelas ekonomi parah...'."
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full min-h-[100px] bg-gray-50 border border-gray-150 rounded-xl p-4 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white transition-all"
              />
            </div>

            {/* File upload drag and drop zone */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Simulasi Unggah Dokumen Bukti (Maks 5MB)</label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileZoneManual}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[150px] ${
                  isDragActive
                    ? "border-[#535CE8] bg-[#F0F1FE]"
                    : isUploadingFile
                    ? "border-amber-300 bg-amber-50/20"
                    : uploadedFileName
                    ? "border-emerald-400 bg-emerald-50/10"
                    : "border-gray-200 hover:border-[#535CE8] bg-gray-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                {isUploadingFile ? (
                  <div className="w-full flex flex-col items-center py-2">
                    <Loader2 className="w-8 h-8 text-[#535CE8] animate-spin mb-2" />
                    <span className="text-xs font-bold text-gray-700">Mengunggah dan Memvalidasi Berkas...</span>
                    <div className="w-48 bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden border border-gray-100">
                      <div 
                        className="bg-[#535CE8] h-full transition-all duration-150 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 mt-1">{uploadProgress}% Selesai</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {/* Thumbnail Preview or PDF logo */}
                    {filePreviewUrl && filePreviewUrl !== "pdf_placeholder" ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-300/60 shadow-sm">
                        <img 
                          src={filePreviewUrl} 
                          alt="Pratinjau Berkas" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-amber-50 text-amber-600 border border-amber-250/50 flex flex-col items-center justify-center shadow-xs">
                        <FileText className="w-8 h-8" />
                        <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider font-mono">PDF</span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <span className="text-xs font-extrabold text-slate-800 block truncate max-w-xs">{uploadedFileName}</span>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider animate-fadeIn">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        Berkas Siap Diunggah
                      </span>
                    </div>

                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName(null);
                        setFilePreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-250/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Batal / Ganti Berkas
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-10 h-10 mb-2.5 text-gray-400 mx-auto" />
                    <span className="text-xs font-bold text-gray-850 block">Seret & lepas berkas kependudukan di sini</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Atau klik untuk memilih berkas dari komputer (PDF, PNG, JPG, JPEG)</span>
                    <span className="text-[9px] text-[#535CE8] font-bold mt-1.5 block">Format: .pdf, .png, .jpg, .jpeg (Maksimal 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="w-full sm:w-auto h-12 px-8 bg-[#535CE8] hover:bg-[#434AC7] disabled:bg-gray-200 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#535CE8]/10 transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim data...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Ajukan Ke Verifikator</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Instructions */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#535CE8]/20 hover:-translate-y-1">
          <div className="space-y-5 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">STANDAR OPERASIONAL (SOP)</span>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-150">
              <h5 className="font-bold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#535CE8]" />
                <span>Pencocokan NIK</span>
              </h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5">
                Pastikan NIK terdaftar resmi pada data dukcapil lokal sebelum mengajukan varians data kependudukan.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-150">
              <h5 className="font-bold text-gray-800 flex items-center gap-1.5 flex-nowrap">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Pembuktian Berkas</span>
              </h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5">
                Lampiran wajib menyertakan scan tervalidasi maksimal resolusi 5MB. Berkas pudar otomatis ditolak verifikator pusat.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 italic bg-gray-50 border border-gray-100/50 p-2.5 rounded-xl block leading-normal text-center font-mono">
            Sistem Pemrosesan Terenkripsi SLA 15-Mins.
          </div>
        </div>

      </div>

    </div>
  );
}
