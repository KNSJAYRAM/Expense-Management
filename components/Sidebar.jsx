"use client";

export default function Sidebar({ activeTab, setActiveTab, userRole }) {
  const menuItems = [
    { id: "expenses", label: "My Expenses", icon: "📋", roles: ["admin", "manager", "employee"] },
    { id: "submit", label: "Submit Expense", icon: "➕", roles: ["admin", "manager", "employee"] },
    { id: "approvals", label: "Pending Approvals", icon: "✅", roles: ["admin", "manager"] },
    { id: "approvals", label: "Pending Requests", icon: "✅", roles: ["employee"] },
    { id: "users", label: "Manage Users", icon: "👥", roles: ["admin"] },
    { id: "rules", label: "Approval Rules", icon: "⚙️", roles: ["admin"] },
    { id: "sequences", label: "Approval Sequences", icon: "🔄", roles: ["admin"] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-gradient-sidebar shadow-lg border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-3 space-y-2">
          <h2 className="text-lg font-bold gradient-text-glow mb-4 text-center animate-slideInUp">
            🧭 Navigation
          </h2>
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
