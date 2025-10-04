"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ExpenseForm from "../../components/ExpenseForm";
import ExpenseList from "../../components/ExpenseList";
import ApprovalList from "../../components/ApprovalList";
import UserManagement from "../../components/UserManagement";
import ApprovalRules from "../../components/ApprovalRules";
import ApprovalSequenceConfig from "../../components/ApprovalSequenceConfig";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Get user and company data from localStorage (set during login)
    const userData = localStorage.getItem("user");
    const companyData = localStorage.getItem("company");

    if (userData && companyData) {
      setUser(JSON.parse(userData));
      setCompany(JSON.parse(companyData));
    } else {
      // Fallback to demo data if localStorage is empty
      const demoUser = {
        id: "1",
        email: "admin@company.com",
        name: "Demo Admin",
        role: "admin",
        companyId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const demoCompany = {
        id: "1",
        name: "Demo Company",
        currency: "USD",
        country: "US",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(demoUser);
      setCompany(demoCompany);
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6 animate-pulse"></div>
          <div className="text-2xl font-bold gradient-text-glow mb-2 animate-bounce">Loading Dashboard...</div>
          <div className="text-lg text-gray-600 animate-pulse">✨ Please wait while we prepare your data ✨</div>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !company) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "expenses":
        return (
          <div className="animate-fadeIn">
            <ExpenseList user={user} company={company} />
          </div>
        );
      case "submit":
        return (
          <div className="animate-fadeIn">
            <ExpenseForm user={user} company={company} />
          </div>
        );
      case "approvals":
        return (
          <div className="animate-fadeIn">
            <ApprovalList user={user} company={company} />
          </div>
        );
      case "users":
        return (
          <div className="animate-fadeIn">
            <UserManagement user={user} company={company} />
          </div>
        );
      case "rules":
        return (
          <div className="animate-fadeIn">
            <ApprovalRules user={user} company={company} />
          </div>
        );
      case "sequences":
        return (
          <div className="animate-fadeIn">
            <ApprovalSequenceConfig user={user} company={company} />
          </div>
        );
      default:
        return (
          <div className="animate-fadeIn">
            <ExpenseList user={user} company={company} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 animate-fadeIn">
      <Header user={user} company={company} />
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user.role}
        />
        <main className="flex-1 p-6 animate-slideInUp">
          <div className="transform transition-all duration-500 ease-in-out hover-lift">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
