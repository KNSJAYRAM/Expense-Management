"use client";

// Feather-style stroke icons (24x24), rendered inline so no icon font/emoji is needed.
const ICONS = {
  expenses: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  submit: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  approvals: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  rules: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </>
  ),
  navigation: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar({ activeTab, setActiveTab, userRole }) {
  const menuItems = [
    { id: "expenses", label: "My Expenses", roles: ["manager", "employee"] },
    { id: "submit", label: "Submit Expense", roles: ["manager", "employee"] },
    { id: "approvals", label: "Pending Approvals", roles: ["admin", "manager"] },
    { id: "approvals", label: "Pending Requests", roles: ["employee"] },
    { id: "users", label: "Manage Users", roles: ["admin"] },
    { id: "rules", label: "Approval Rules", roles: ["admin"] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-gradient-sidebar shadow-lg border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-3 space-y-2">
          <h2 className="text-lg font-bold gradient-text-glow mb-4 text-center animate-slideInUp flex items-center justify-center">
            <span style={{ color: "#6366f1", marginRight: "0.5rem", display: "inline-flex" }}>
              <Icon name="navigation" size={22} />
            </span>
            Navigation
          </h2>
          {filteredItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
            >
              <Icon name={item.id} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
