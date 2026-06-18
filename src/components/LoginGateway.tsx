/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserAccount } from "../types";
import { ShieldCheck, UserCheck } from "lucide-react";
import simantuLogo from "../assets/images/clean_bar_chart_logo_1781744820963.jpg";

interface LoginGatewayProps {
  accounts: UserAccount[];
  selectedAccountId: string;
  onResetData: () => void;
  onLogout: () => void;
}

export default function LoginGateway({
  accounts,
  selectedAccountId,
  onResetData,
  onLogout
}: LoginGatewayProps) {
  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <div className="hidden lg:block bg-white border-b border-gray-100 px-6 py-4 z-10 shadow-sm" id="control-gateway-bar">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and System Title matching Design HTML but with new theme color #535CE8 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-[#535CE8]/20 border border-gray-200 flex items-center justify-center bg-white shrink-0">
            <img 
              src={simantuLogo} 
              alt="SIMANTU Logo" 
              className="w-full h-full object-cover animate-pulse-slow" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-[#535CE8] font-extrabold text-xl tracking-tight flex items-center gap-2">
              <span>SIMANTU</span> 
              <span className="font-light text-gray-300">|</span> 
              <span className="font-medium text-sm text-gray-500 tracking-normal hidden sm:inline">Monitoring Sosial</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium -mt-0.5 hidden md:block">
              Sistem Pemantauan Perubahan Status Sosial dan Kependudukan • Looker Studio BI Dashboard
            </p>
          </div>
        </div>

        {/* Display Current User & Role directly with action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Active Operator display (Enhanced & Highly Polished design - Borderless, text right-aligned) */}
          <div className="flex items-center gap-3 bg-transparent px-2 py-1.5 transition-all duration-300">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 leading-none">
                <span className={`text-[8px] font-black tracking-widest font-mono uppercase ${
                  currentAccount.role === "Admin" ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {currentAccount.role === "Admin" ? "SUPERADMIN" : "OPERATOR"}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest font-mono">
                  KERJA SEBAGAI
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mono ${
                  currentAccount.role === "Admin"
                    ? "bg-rose-50 text-rose-700 border border-gray-200"
                    : "bg-emerald-50 text-emerald-700 border border-gray-200"
                }`}>
                  {currentAccount.role === "Admin" ? "ADMINISTRATOR" : `${currentAccount.region}`}
                </span>
                <strong className="text-gray-900 font-extrabold text-xs">
                  {currentAccount.name}
                </strong>
              </div>
            </div>

            <div className="relative">
              {/* Profile Avatar with double rings */}
              <div className={`w-8 h-8 rounded-xl ${currentAccount.avatarColor || "bg-indigo-600"} text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 shadow-sm ring-2 ring-gray-100`}>
                {currentAccount.avatarUrl ? (
                  <img 
                    src={currentAccount.avatarUrl} 
                    alt={currentAccount.name} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentAccount.id
                )}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white border-2 border-white ${
                currentAccount.role === "Admin" ? "bg-rose-500" : "bg-emerald-500"
              }`}>
                {currentAccount.role === "Admin" ? (
                  <ShieldCheck className="w-1.5 h-1.5 text-white" />
                ) : (
                  <UserCheck className="w-1.5 h-1.5 text-white" />
                )}
              </span>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}
