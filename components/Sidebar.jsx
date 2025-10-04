'use client';


export default function Sidebar({ activeTab, setActiveTab, userRole }) {
  const menuItems = [
    { id: 'expenses', label: 'My Expenses', icon: '📋', roles: ['admin', 'manager', 'employee'] },
    { id: 'submit', label: 'Submit Expense', icon: '➕', roles: ['admin', 'manager', 'employee'] },
    { id: 'approvals', label: 'Pending Approvals', icon: '✅', roles: ['admin', 'manager'] },
    { id: 'users', label: 'Manage Users', icon: '👥', roles: ['admin'] },
    { id: 'rules', label: 'Approval Rules', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
