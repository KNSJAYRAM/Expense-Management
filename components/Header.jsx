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
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg border-b border-gray-200 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">
                  Expense Management
                </h1>
                <p className="text-xs text-white text-opacity-80 hidden sm:block">Streamline your workflow</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <span className="px-3 py-1 text-xs font-medium bg-white bg-opacity-15 text-white rounded-full">
                🏢 {company.name}
              </span>
            </div>
          </div>

          {/* Right Section - User Controls */}
          <div className="flex items-center space-x-2">
            <UserRoleSwitcher currentUser={user} />
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 rounded-lg">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <div className="text-white">
                <div className="text-xs font-medium">{user.name}</div>
                <div className="text-xs text-white text-opacity-80 capitalize">{user.role}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearData}
                className="px-3 py-2 text-sm font-medium text-white hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 border border-white border-opacity-20 hover:border-red-300"
              >
                Clear Data
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 border border-white border-opacity-20 hover:border-opacity-40"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
