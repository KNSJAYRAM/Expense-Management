"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/db-light.js";

export default function ApprovalList({ user, company }) {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalatingExpense, setEscalatingExpense] = useState(null);
  const [escalationReason, setEscalationReason] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        let expenses = [];
        if (user.role === "employee") {
          const userExpenses = await db.getExpensesByUser(user.id);
          expenses = userExpenses.filter((e) => e.status === "pending");
        } else {
          expenses = await db.getPendingExpensesForApprover(user.id);
          const allPending = await db.getExpensesByCompany(company.id);
          const withoutChain = allPending.filter(
            (e) =>
              e.status === "pending" &&
              (!e.approvalChain || e.approvalChain.length === 0) &&
              e.userId !== user.id
          );
          const ids = new Set(expenses.map((e) => e.id));
          withoutChain.forEach((e) => {
            if (!ids.has(e.id)) expenses.push(e);
          });
        }
        setPendingExpenses(expenses);
        const companyUsers = await db.getUsersByCompany(company.id);
        setUsers(companyUsers);
      } catch (error) {
        console.error("Error loading approval data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id, company.id, user.role]);

  const handleApproval = async (expenseId, status, comment) => {
    try {
      const expense = await db.getExpense(expenseId);
      if (!expense.approvalChain || expense.approvalChain.length === 0) {
        await db.updateExpense(expenseId, { status });
      } else {
        await db.processConditionalApproval(expenseId, user.id, status, comment);
      }
      let expenses = [];
      if (user.role === "employee") {
        const userExpenses = await db.getExpensesByUser(user.id);
        expenses = userExpenses.filter((e) => e.status === "pending");
      } else {
        expenses = await db.getPendingExpensesForApprover(user.id);
        const allPending = await db.getExpensesByCompany(company.id);
        const withoutChain = allPending.filter(
          (e) =>
            e.status === "pending" &&
            (!e.approvalChain || e.approvalChain.length === 0) &&
            e.userId !== user.id
        );
        const ids = new Set(expenses.map((e) => e.id));
        withoutChain.forEach((e) => {
          if (!ids.has(e.id)) expenses.push(e);
        });
      }
      setPendingExpenses(expenses);
    } catch (error) {
      console.error("Error updating approval:", error);
      alert("An error occurred while processing the approval");
    }
  };

  const handleEscalate = async (expenseId, reason) => {
    try {
      const expense = await db.getExpense(expenseId);
      if (!expense || !expense.approvalChain) return;
      const currentStep = expense.currentApprovalStep || 0;
      const nextStep = currentStep + 1;
      if (nextStep < expense.approvalChain.length) {
        await db.updateExpense(expenseId, {
          currentApprovalStep: nextStep,
          escalationReason: reason,
          escalatedBy: user.id,
          escalatedAt: new Date(),
        });
        const expenses = await db.getPendingExpensesForApprover(user.id);
        setPendingExpenses(expenses);
        setEscalatingExpense(null);
        setEscalationReason("");
        alert("Expense escalated successfully");
      } else {
        alert("No more approvers in the chain to escalate to");
      }
    } catch (error) {
      console.error("Error escalating expense:", error);
      alert("An error occurred while escalating the expense");
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
  };

  const getSubmitterName = (expense) => {
    const submitter = users.find((u) => u.id === expense.userId);
    return submitter ? submitter.name : "Unknown User";
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
      <div className="card">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
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
                  : "All expenses have been processed."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExpenses.map((expense) => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{expense.description}</h4>
                      {user.role !== "employee" && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Submitted by:</span> {getSubmitterName(expense)}
                        </div>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Amount:</span> {formatCurrency(expense.amount, expense.currency)}
                          {expense.currency !== company.currency && (
                            <span className="ml-2 text-blue-600">
                              ({formatCurrency(expense.convertedAmount || expense.amount, company.currency)})
                            </span>
                          )}
                        </div>
                        <div><span className="font-medium">Category:</span> {expense.category}</div>
                        <div><span className="font-medium">Date:</span> {new Date(expense.date).toLocaleDateString()}</div>
                        <div><span className="font-medium">Submitted:</span> {new Date(expense.createdAt).toLocaleDateString()}</div>
                        {user.role !== "employee" && (
                          <div className="col-span-2">
                            <span className="font-medium">Approval Step:</span>
                            <span className="ml-2 pill badge-blue">
                              Step {(expense.currentApprovalStep || 0) + 1} of {expense.approvalChain?.length || 1}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {user.role === "employee" ? (
                      <div className="ml-4">
                        <span className="pill badge-yellow">Waiting for Approval</span>
                      </div>
                    ) : (
                      <div className="flex space-x-2 ml-4">
                        <button type="button" onClick={() => handleApproval(expense.id, "approved")} className="btn-green">
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const comment = prompt("Rejection reason (optional):");
                            handleApproval(expense.id, "rejected", comment || undefined);
                          }}
                          className="btn-red"
                        >
                          Reject
                        </button>
                        {expense.approvalChain && expense.approvalChain.length > (expense.currentApprovalStep || 0) + 1 && (
                          <button type="button" onClick={() => setEscalatingExpense(expense)} className="btn-orange">
                            Escalate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {escalatingExpense && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Escalate Expense</h3>
            <p className="text-sm text-gray-600 mb-4">Escalating: {escalatingExpense.description}</p>
            <div className="mb-4">
              <label htmlFor="escalationReason" className="block text-sm font-medium text-gray-700">Escalation Reason</label>
              <textarea
                id="escalationReason"
                rows={3}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="mt-1"
                placeholder="Enter reason for escalation..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setEscalatingExpense(null); setEscalationReason(""); }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleEscalate(escalatingExpense.id, escalationReason)}
                className="btn-orange"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}