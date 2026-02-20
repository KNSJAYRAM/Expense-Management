'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db-light.js';

export default function ExpenseList({ user, company }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        let userExpenses = [];
        if (user.role === 'admin') {
          userExpenses = await db.getExpensesByCompany(company.id);
        } else {
          userExpenses = await db.getExpensesByUser(user.id);
        }
        setExpenses(userExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, [user, company]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'pill badge-green';
      case 'rejected': return 'pill badge-red';
      case 'pending': return 'pill badge-yellow';
      default: return 'pill badge-gray';
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {user.role === 'admin' ? 'All Expenses' : 'My Expenses'}
          </h3>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No expenses found</div>
              <p className="text-gray-400">Submit your first expense to get started.</p>
            </div>
          ) : (
            <div className="table-wrap ring-1 overflow-hidden rounded-lg">
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-500">{expense.category}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={getStatusColor(expense.status)}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
