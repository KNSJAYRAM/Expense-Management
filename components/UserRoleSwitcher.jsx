"use client";

import { useState } from "react";

export default function UserRoleSwitcher({ currentUser, onUserSwitch }) {
  const [isOpen, setIsOpen] = useState(false);

  const demoUsers = [
    {
      id: "admin-user-id",
      email: "admin@company.com",
      name: "Demo Admin",
      role: "admin",
      companyId: "demo-company-id",
    },
    {
      id: "manager-user-id",
      email: "manager@company.com",
      name: "Demo Manager",
      role: "manager",
      companyId: "demo-company-id",
      managerId: "admin-user-id",
    },
    {
      id: "employee-user-id",
      email: "employee@company.com",
      name: "Demo Employee",
      role: "employee",
      companyId: "demo-company-id",
      managerId: "manager-user-id",
    },
  ];

  const handleUserSwitch = (user) => {
    // Update localStorage with new user data
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(
      "company",
      JSON.stringify({
        id: "demo-company-id",
        name: "Demo Company",
        currency: "USD",
        country: "US",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    // Reload the page to apply the new user
    window.location.reload();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 border border-white border-opacity-20 hover:border-opacity-40"
      >
        <span className="text-white text-xs font-medium">Switch User</span>
        <span className="text-white font-semibold">{currentUser.name}</span>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(
            currentUser.role
          )}`}
        >
          {currentUser.role}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Demo Users</h3>
            <p className="text-xs text-gray-500 mt-1">
              Switch between different user roles to test the approval workflow
            </p>
          </div>
          <div className="py-2">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSwitch(user)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  user.id === currentUser.id
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                {user.id === currentUser.id && (
                  <div className="text-xs text-blue-600 mt-1">Current User</div>
                )}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Role Permissions:</div>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Admin:</span> Full system access, manage users, configure approval rules
                </div>
                <div>
                  <span className="font-medium">Manager:</span> Approve/reject expenses, view team expenses
                </div>
                <div>
                  <span className="font-medium">Employee:</span> Submit expenses, view own expenses
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
