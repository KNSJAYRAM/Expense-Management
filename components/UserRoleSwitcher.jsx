"use client";

import { useState } from "react";

export default function UserRoleSwitcher({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);

  const demoUsers = [
    { id: "admin-user-id", email: "admin@company.com", name: "Demo Admin", role: "admin", companyId: "demo-company-id" },
    { id: "manager-user-id", email: "manager@company.com", name: "Demo Manager", role: "manager", companyId: "demo-company-id", managerId: "admin-user-id" },
    { id: "employee-user-id", email: "employee@company.com", name: "Demo Employee", role: "employee", companyId: "demo-company-id", managerId: "manager-user-id" },
  ];

  const handleUserSwitch = (u) => {
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("company", JSON.stringify({
      id: "demo-company-id",
      name: "Demo Company",
      currency: "USD",
      country: "US",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    window.location.reload();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "pill badge-red";
      case "manager": return "pill badge-blue";
      case "employee": return "pill badge-green";
      default: return "pill badge-gray";
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg border border-white text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
      >
        <span className="text-xs font-medium">Switch User</span>
        <span className="font-semibold">{currentUser.name}</span>
        <span className={getRoleColor(currentUser.role)} style={{ color: 'inherit', background: 'rgba(255,255,255,0.3)' }}>
          {currentUser.role}
        </span>
        <svg className={`w-4 h-4 text-white transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="dropdown-panel">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Demo Users</h3>
            <p className="text-xs text-gray-500 mt-1">Switch between different user roles to test the approval workflow</p>
          </div>
          <div className="py-2">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleUserSwitch(u)}
                className={`dropdown-item ${u.id === currentUser.id ? "active" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                  <span className={getRoleColor(u.role)}>{u.role}</span>
                </div>
                {u.id === currentUser.id && <div className="text-xs text-blue-600 mt-1">Current User</div>}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Role Permissions:</div>
              <div className="space-y-1">
                <div><span className="font-medium">Admin:</span> Full system access, manage users, configure approval rules</div>
                <div><span className="font-medium">Manager:</span> Approve/reject expenses, view team expenses</div>
                <div><span className="font-medium">Employee:</span> Submit expenses, view own expenses</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
