"use client";

import { useRouter } from "next/navigation";
import UserRoleSwitcher from "./UserRoleSwitcher";

export default function Header({ user, company }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This will reset the application to its initial state.")) {
      localStorage.removeItem("expense_db");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      window.location.reload();
    }
  };

  return (
    <header className="bg-gradient-header shadow-lg border-b border-gray-200 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 p-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <span className="text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  Expense Management
                </h1>
                <p className="text-xs text-white hidden sm:block" style={{ opacity: 0.8 }}>Streamline your workflow</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <span className="header-pill">🏢 {company.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <UserRoleSwitcher currentUser={user} />
            <div className="hidden md:flex header-user-box">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <span className="text-xs">👤</span>
              </div>
              <div className="text-white">
                <div className="text-xs font-medium">{user.name}</div>
                <div className="text-xs capitalize" style={{ opacity: 0.8 }}>{user.role}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button type="button" onClick={handleClearData} className="header-btn header-btn-danger">
                Clear Data
              </button>
              <button type="button" onClick={handleLogout} className="header-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
