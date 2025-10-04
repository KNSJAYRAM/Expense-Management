<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/db-light.js";
=======
'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48

export default function ApprovalList({ user, company }) {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [escalatingExpense, setEscalatingExpense] = useState(null);
  const [escalationReason, setEscalationReason] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        let expenses = [];
        
        if (user.role === "employee") {
          const userExpenses = await db.getExpensesByUser(user.id);
          expenses = userExpenses.filter(expense => expense.status === "pending");
        } else {
          // Get expenses with approval chain
          expenses = await db.getPendingExpensesForApprover(user.id);
          
          // Also get pending expenses without approval chain (for admin/manager)
          const allPendingExpenses = await db.getExpensesByCompany(company.id);
          const expensesWithoutChain = allPendingExpenses.filter(
            expense => expense.status === "pending" && 
            (!expense.approvalChain || expense.approvalChain.length === 0) &&
            expense.userId !== user.id
          );
          
          // Merge both lists and remove duplicates
          const expenseIds = new Set(expenses.map(e => e.id));
          expensesWithoutChain.forEach(expense => {
            if (!expenseIds.has(expense.id)) {
              expenses.push(expense);
            }
          });
        }

        setPendingExpenses(expenses);
        const companyUsers = await db.getUsersByCompany(company.id);
        setUsers(companyUsers);
      } catch (error) {
        console.error('Error loading approval data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id, company.id, user.role]);

  const handleApproval = async (expenseId, status, comment) => {
    try {
      const expense = await db.getExpense(expenseId);
      
      // If expense has no approval chain, directly update status
      if (!expense.approvalChain || expense.approvalChain.length === 0) {
        await db.updateExpense(expenseId, { status });
      } else {
        // Use the conditional approval process
        await db.processConditionalApproval(expenseId, user.id, status, comment);
      }
      
      // Refresh the list
      let expenses = [];
      if (user.role === "employee") {
        const userExpenses = await db.getExpensesByUser(user.id);
        expenses = userExpenses.filter(expense => expense.status === "pending");
      } else {
        // Get expenses with approval chain
        expenses = await db.getPendingExpensesForApprover(user.id);
        
        // Also get pending expenses without approval chain
        const allPendingExpenses = await db.getExpensesByCompany(company.id);
        const expensesWithoutChain = allPendingExpenses.filter(
          expense => expense.status === "pending" && 
          (!expense.approvalChain || expense.approvalChain.length === 0) &&
          expense.userId !== user.id
        );
        
        // Merge both lists
        const expenseIds = new Set(expenses.map(e => e.id));
        expensesWithoutChain.forEach(expense => {
          if (!expenseIds.has(expense.id)) {
            expenses.push(expense);
          }
        });
      }
      setPendingExpenses(expenses);
    } catch (error) {
      console.error("Error updating approval:", error);
      alert("An error occurred while processing the approval");
    }
  };

  const handleEscalate = async (expenseId, escalationReason) => {
    try {
      // Get the expense and find the next approver in the chain
      const expense = await db.getExpense(expenseId);
      if (!expense || !expense.approvalChain) return;

      const currentStep = expense.currentApprovalStep || 0;
      const nextStep = currentStep + 1;
      
      if (nextStep < expense.approvalChain.length) {
        // Move to next approver
        await db.updateExpense(expenseId, {
          currentApprovalStep: nextStep,
          escalationReason: escalationReason,
          escalatedBy: user.id,
          escalatedAt: new Date()
        });
        
        // Refresh the list
        const expenses = await db.getPendingExpensesForApprover(user.id);
        setPendingExpenses(expenses);
        
        alert("Expense escalated successfully");
      } else {
        alert("No more approvers in the chain to escalate to");
      }
    } catch (error) {
      console.error("Error escalating expense:", error);
      alert("An error occurred while escalating the expense");
=======

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
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
    }
  };

  const formatCurrency = (amount, currency) => {
<<<<<<< HEAD
    return new Intl.NumberFormat("en-US", {
      style: "currency",
=======
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
      currency: currency,
    }).format(amount);
  };

  const getSubmitterName = (expense) => {
<<<<<<< HEAD
    const submitter = users.find((u) => u.id === expense.userId);
    return submitter ? submitter.name : "Unknown User";
=======
    const submitter = users.find(u => u.id === expense.userId);
    return submitter ? submitter.name : 'Unknown User';
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
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
<<<<<<< HEAD
            {user.role === "employee" ? "My Pending Expenses" : "Pending Approvals"}
          </h3>

          {pendingExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {user.role === "employee" ? "No pending expenses" : "No pending approvals"}
              </div>
              <p className="text-gray-400">
                {user.role === "employee" 
                  ? "All your expenses have been processed." 
                  : "All expenses have been processed."
                }
              </p>
=======
            Pending Approvals
          </h3>
          
          {pendingExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No pending approvals</div>
              <p className="text-gray-400">All expenses have been processed.</p>
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
<<<<<<< HEAD
                <div
                  key={expense.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
=======
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {expense.description}
                      </h4>
<<<<<<< HEAD
                      {user.role !== "employee" && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Submitted by:</span>{" "}
                          {getSubmitterName(expense)}
                        </div>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Amount:</span>{" "}
                          {formatCurrency(expense.amount, expense.currency)}
                          {expense.currency !== company.currency && (
                            <span className="ml-2 text-blue-600">
                              (
                              {formatCurrency(
                                expense.convertedAmount || expense.amount,
                                company.currency
                              )}
                              )
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {expense.category}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>{" "}
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </div>
                        {user.role !== "employee" && (
                          <div className="col-span-2">
                            <span className="font-medium">Approval Step:</span>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Step {expense.currentApprovalStep + 1} of{" "}
                              {expense.approvalChain?.length || 1}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {user.role === "employee" ? (
                      <div className="ml-4">
                        <span className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md">
                          Waiting for Approval
                        </span>
                      </div>
                    ) : (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproval(expense.id, "approved")}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const comment = prompt(
                              "Rejection reason (optional):"
                            );
                            handleApproval(
                              expense.id,
                              "rejected",
                              comment || undefined
                            );
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                        {expense.approvalChain && expense.approvalChain.length > (expense.currentApprovalStep || 0) + 1 && (
                          <button
                            onClick={() => setEscalatingExpense(expense)}
                            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    )}
=======
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
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD

      {/* Escalation Modal */}
      {escalatingExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Escalate Expense
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Escalating: {escalatingExpense.description}
              </p>
              <div className="mb-4">
                <label htmlFor="escalationReason" className="block text-sm font-medium text-gray-700">
                  Escalation Reason
                </label>
                <textarea
                  id="escalationReason"
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter reason for escalation..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEscalatingExpense(null);
                    setEscalationReason("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleEscalate(escalatingExpense.id, escalationReason);
                    setEscalatingExpense(null);
                    setEscalationReason("");
                  }}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                >
                  Escalate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
=======
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
    </div>
  );
}
