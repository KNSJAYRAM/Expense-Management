'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default function ApprovalList({ user, company }) {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Only admins and managers can access this component
  if (user.role === 'employee') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
            <p className="mt-2 text-sm text-red-600">
              Employees cannot access pending approvals. Only managers and admins can approve expenses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const expenses = db.getPendingExpensesForApprover(user.id);
    const companyUsers = db.getUsersByCompany(company.id);
    setPendingExpenses(expenses);
    setUsers(companyUsers);
    setLoading(false);
  }, [user.id, company.id]);

  const handleApproval = async (expenseId, status, comment) => {
    try {
      // Use the new sequential approval system
      db.processApproval(expenseId, user.id, status, comment);

      // Refresh the list
      const updatedExpenses = db.getPendingExpensesForApprover(user.id);
      const updatedUsers = db.getUsersByCompany(company.id);
      setPendingExpenses(updatedExpenses);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getSubmitterName = (expense) => {
    const submitter = users.find(u => u.id === expense.userId);
    return submitter ? submitter.name : 'Unknown User';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Pending Approvals
          </h3>
          
          {pendingExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No pending approvals</div>
              <p className="text-gray-400">All expenses have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {expense.description}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Submitted by:</span> {getSubmitterName(expense)}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Amount:</span> {formatCurrency(expense.amount, expense.currency)}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {expense.category}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(expense.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {new Date(expense.createdAt).toLocaleDateString()}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Approval Step:</span> 
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Step {expense.currentApprovalStep + 1} of {expense.approvalChain?.length || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApproval(expense.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt('Rejection reason (optional):');
                          handleApproval(expense.id, 'rejected', comment || undefined);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
