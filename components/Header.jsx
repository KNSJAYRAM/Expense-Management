<<<<<<< HEAD
"use client";

import { useRouter } from "next/navigation";
import UserRoleSwitcher from "./UserRoleSwitcher";
=======
'use client';

import { useRouter } from 'next/navigation';
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48

export default function Header({ user, company }) {
  const router = useRouter();

  const handleLogout = () => {
<<<<<<< HEAD
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
=======
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Expense Management System
            </h1>
            <span className="ml-4 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {company.name}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Logout
            </button>
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
          </div>
        </div>
      </div>
    </header>
  );
}
