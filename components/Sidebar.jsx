"use client";

export default function Sidebar({ activeTab, setActiveTab, userRole }) {
  const menuItems = [
    {
      id: "expenses",
      label: "My Expenses",
      icon: "📋",
      roles: ["admin", "manager", "employee"],
    },
    {
      id: "submit",
      label: "Submit Expense",
      icon: "➕",
      roles: ["admin", "manager", "employee"],
    },
    {
      id: "approvals",
      label: "Pending Approvals",
      icon: "✅",
      roles: ["admin", "manager", "employee"],
    },
    { id: "users", label: "Manage Users", icon: "👥", roles: ["admin"] },
    { id: "rules", label: "Approval Rules", icon: "⚙️", roles: ["admin"] },
    { id: "sequences", label: "Approval Sequences", icon: "🔄", roles: ["admin"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 shadow-lg border-r border-gray-200 animate-slideInLeft">
      <nav className="mt-6">
        <div className="px-3 space-y-2">
          <h2 className="text-lg font-bold gradient-text-glow mb-4 text-center animate-slideInUp">
            🧭 Navigation
          </h2>
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 animate-slideInRight ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-r-4 border-indigo-300 shadow-lg hover-glow"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover-lift"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="mr-3 text-xl animate-pulse">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
