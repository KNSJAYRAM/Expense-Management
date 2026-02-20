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

    const userData = localStorage.getItem("user");
    const companyData = localStorage.getItem("company");

    if (userData && companyData) {
      setUser(JSON.parse(userData));
      setCompany(JSON.parse(companyData));
    } else {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-page">
        <div className="text-center animate-fadeIn">
          <div className="spinner mx-auto mb-6" style={{ width: 80, height: 80 }}></div>
          <div className="text-2xl font-bold gradient-text-glow mb-2">Loading Dashboard...</div>
          <div className="text-lg text-gray-600 animate-pulse">Please wait while we prepare your data</div>
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
        return <ExpenseList user={user} company={company} />;
      case "submit":
        return <ExpenseForm user={user} company={company} />;
      case "approvals":
        return <ApprovalList user={user} company={company} />;
      case "users":
        return <UserManagement user={user} company={company} />;
      case "rules":
        return <ApprovalRules user={user} company={company} />;
      case "sequences":
        return <ApprovalSequenceConfig user={user} company={company} />;
      default:
        return <ExpenseList user={user} company={company} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-page animate-fadeIn">
      <Header user={user} company={company} />
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user.role}
        />
        <main className="flex-1 p-6 animate-slideInUp">
          <div className="hover-lift">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
