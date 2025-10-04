'use client';

import React, { useState } from 'react';
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default function ExpenseForm({ user, company }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Meals & Entertainment',
    'Travel',
    'Office Supplies',
    'Software',
    'Training',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-approve admin expenses, others need approval
      const initialStatus = user.role === 'admin' ? 'approved' : 'pending';
      
      const expense = {
        id: uuidv4(),
        userId: user.id,
        companyId: user.companyId,
        amount: parseFloat(formData.amount),
        currency: 'USD',
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        status: initialStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createExpense(expense);
      
      // If admin expense, create auto-approval record
      if (user.role === 'admin') {
        const approval = {
          id: uuidv4(),
          expenseId: expense.id,
          approverId: user.id,
          status: 'approved',
          comment: 'Auto-approved (Admin)',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.createApproval(approval);
      } else {
        // Create approval workflow for non-admin users
        const approvalChain = [];
        
        // Add manager to approval chain if user has a manager
        const manager = db.getManager(user.id);
        if (manager) {
          approvalChain.push(manager.id);
        }
        
        // Add admin as final approver
        const admins = db.getUsersByCompany(user.companyId).filter(u => u.role === 'admin');
        if (admins.length > 0) {
          approvalChain.push(admins[0].id);
        }
        
        // Create the approval workflow
        if (approvalChain.length > 0) {
          db.createApprovalWorkflow(expense.id, approvalChain);
        }
      }
      
      setSuccess(true);
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Expense Submitted Successfully!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                {user.role === 'admin' 
                  ? 'Your expense has been automatically approved.' 
                  : 'Your expense has been submitted and is waiting for approval.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Submit New Expense
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                id="amount"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe the expense..."
              />
            </div>


            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
