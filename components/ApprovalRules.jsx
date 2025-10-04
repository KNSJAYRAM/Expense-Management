<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/db-light.js";
=======
'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48

export default function ApprovalRules({ user, company }) {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
<<<<<<< HEAD
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    minAmount: 0,
    maxAmount: 1000,
    percentage: 60,
    approverIds: [],
    specificApproverId: "",
    ruleType: "percentage", // 'percentage', 'specific', 'hybrid', 'auto-approve'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyRules = await db.getApprovalRulesByCompany(company.id);
        const companyUsers = await db.getUsersByCompany(company.id);
        setRules(companyRules);
        setUsers(
          companyUsers.filter((u) => u.role === "manager" || u.role === "admin")
        );
      } catch (error) {
        console.error('Error loading approval rules data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
=======
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 60,
    approverIds: [],
  });

  useEffect(() => {
    const companyRules = db.getApprovalRulesByCompany(company.id);
    const companyUsers = db.getUsersByCompany(company.id);
    setRules(companyRules);
    setUsers(companyUsers.filter(u => u.role === 'manager' || u.role === 'admin'));
    setLoading(false);
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
  }, [company.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    try {
      if (editingRule) {
        // Update existing rule
        const updatedRule = {
          ...editingRule,
          name: formData.name,
          minAmount: parseFloat(formData.minAmount),
          maxAmount: parseFloat(formData.maxAmount),
          percentage:
            formData.ruleType === "percentage" || formData.ruleType === "hybrid"
              ? formData.percentage
              : 0,
          approverIds: formData.ruleType === "auto-approve" ? [] : formData.approverIds,
          specificApproverId:
            formData.ruleType === "specific" || formData.ruleType === "hybrid"
              ? formData.specificApproverId
              : null,
          updatedAt: new Date(),
        };

        await db.updateApprovalRule(editingRule.id, updatedRule);
        setEditingRule(null);
      } else {
        // Create new rule
        const newRule = {
          id: uuidv4(),
          companyId: company.id,
          name: formData.name,
          minAmount: parseFloat(formData.minAmount),
          maxAmount: parseFloat(formData.maxAmount),
          percentage:
            formData.ruleType === "percentage" || formData.ruleType === "hybrid"
              ? formData.percentage
              : 0,
          approverIds: formData.ruleType === "auto-approve" ? [] : formData.approverIds,
          specificApproverId:
            formData.ruleType === "specific" || formData.ruleType === "hybrid"
              ? formData.specificApproverId
              : null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.createApprovalRule(newRule);
      }

      // Refresh rules list
      const updatedRules = await db.getApprovalRulesByCompany(company.id);
      setRules(updatedRules);

      // Reset form
      setFormData({
        name: "",
        minAmount: 0,
        maxAmount: 1000,
        percentage: 60,
        approverIds: [],
        specificApproverId: "",
        ruleType: "percentage",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving approval rule:", error);
=======
    
    try {
      const newRule = {
        id: uuidv4(),
        companyId: company.id,
        name: formData.name,
        type: 'percentage',
        percentage: formData.percentage,
        approverIds: formData.approverIds,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.createApprovalRule(newRule);
      
      // Refresh rules list
      const updatedRules = db.getApprovalRulesByCompany(company.id);
      setRules(updatedRules);
      
      // Reset form
      setFormData({
        name: '',
        percentage: 60,
        approverIds: [],
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating approval rule:', error);
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
    }
  };

  const handleApproverToggle = (approverId) => {
    const newApproverIds = formData.approverIds.includes(approverId)
<<<<<<< HEAD
      ? formData.approverIds.filter((id) => id !== approverId)
      : [...formData.approverIds, approverId];

    setFormData({ ...formData, approverIds: newApproverIds });
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      minAmount: rule.minAmount,
      maxAmount: rule.maxAmount,
      percentage: rule.percentage || 60,
      approverIds: rule.approverIds || [],
      specificApproverId: rule.specificApproverId || "",
      ruleType: rule.percentage === 0 && rule.approverIds.length === 0 && !rule.specificApproverId 
        ? "auto-approve" 
        : rule.percentage > 0 && rule.specificApproverId 
          ? "hybrid"
          : rule.percentage > 0 
            ? "percentage"
            : "specific"
    });
    setShowForm(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm("Are you sure you want to delete this approval rule?")) {
      try {
        await db.deleteApprovalRule(ruleId);
        const updatedRules = await db.getApprovalRulesByCompany(company.id);
        setRules(updatedRules);
      } catch (error) {
        console.error("Error deleting approval rule:", error);
        alert("An error occurred while deleting the rule");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setShowForm(false);
    setFormData({
      name: "",
      minAmount: 0,
      maxAmount: 1000,
      percentage: 60,
      approverIds: [],
      specificApproverId: "",
      ruleType: "percentage",
    });
  };

  const getRuleTypeDescription = (rule) => {
    const amountRange = `${rule.minAmount} - ${rule.maxAmount} ${company.currency}`;

    // Check if this is an auto-approve rule
    if (rule.percentage === 0 && rule.approverIds.length === 0 && !rule.specificApproverId) {
      return `Auto-approve: No approval required (${amountRange})`;
    }

    if (rule.percentage > 0 && rule.specificApproverId) {
      const specificApprover = users.find(
        (u) => u.id === rule.specificApproverId
      );
      return `Hybrid: ${rule.percentage}% of approvers OR ${specificApprover?.name} approves (${amountRange})`;
    } else if (rule.percentage > 0) {
      return `Percentage: ${rule.percentage}% of approvers must approve (${amountRange})`;
    } else if (rule.specificApproverId) {
      const specificApprover = users.find(
        (u) => u.id === rule.specificApproverId
      );
      return `Specific: ${specificApprover?.name} must approve (${amountRange})`;
    }

    return `Amount range: ${amountRange}`;
=======
      ? formData.approverIds.filter(id => id !== approverId)
      : [...formData.approverIds, approverId];
    
    setFormData({ ...formData, approverIds: newApproverIds });
  };

  const getRuleTypeDescription = (rule) => {
    return `${rule.percentage}% of approvers must approve`;
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading approval rules...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Approval Rules
            </h3>
            <button
<<<<<<< HEAD
              onClick={() => {
                setEditingRule(null);
                setShowForm(true);
              }}
=======
              onClick={() => setShowForm(true)}
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Rule
            </button>
          </div>

          {/* Add Rule Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
<<<<<<< HEAD
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingRule ? "Edit Approval Rule" : "Create New Approval Rule"}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rule Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., High Value Expenses"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ruleType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rule Type
                    </label>
                    <select
                      id="ruleType"
                      value={formData.ruleType}
                      onChange={(e) =>
                        setFormData({ ...formData, ruleType: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="percentage">Percentage Rule</option>
                      <option value="specific">Specific Approver Rule</option>
                      <option value="hybrid">Hybrid Rule (Both)</option>
                      <option value="auto-approve">Auto-approve Rule</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="minAmount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Minimum Amount ({company.currency})
                    </label>
                    <input
                      type="number"
                      id="minAmount"
                      step="0.01"
                      value={formData.minAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, minAmount: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="maxAmount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Maximum Amount ({company.currency})
                    </label>
                    <input
                      type="number"
                      id="maxAmount"
                      step="0.01"
                      value={formData.maxAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAmount: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {(formData.ruleType === "percentage" ||
                  formData.ruleType === "hybrid") && (
                  <div>
                    <label
                      htmlFor="percentage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Approval Percentage
                    </label>
                    <input
                      type="number"
                      id="percentage"
                      min="1"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          percentage: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                {(formData.ruleType === "specific" ||
                  formData.ruleType === "hybrid") && (
                  <div>
                    <label
                      htmlFor="specificApprover"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specific Approver
                    </label>
                    <select
                      id="specificApprover"
                      value={formData.specificApproverId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specificApproverId: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Specific Approver</option>
                      {users.map((approver) => (
                        <option key={approver.id} value={approver.id}>
                          {approver.name} ({approver.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

=======
              <h4 className="text-md font-medium text-gray-900 mb-4">Create New Approval Rule</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., High Value Expenses"
                  />
                </div>

                <div>
                  <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">
                    Approval Percentage
                  </label>
                  <input
                    type="number"
                    id="percentage"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approvers
                  </label>
                  <div className="space-y-2">
<<<<<<< HEAD
                    {users.map((approver) => (
=======
                    {users.map(approver => (
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                      <label key={approver.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.approverIds.includes(approver.id)}
                          onChange={() => handleApproverToggle(approver.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {approver.name} ({approver.role})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
<<<<<<< HEAD
                    onClick={handleCancelEdit}
=======
                    onClick={() => setShowForm(false)}
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
<<<<<<< HEAD
                    {editingRule ? "Update Rule" : "Create Rule"}
=======
                    Create Rule
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rules List */}
          {rules.length === 0 ? (
            <div className="text-center py-12">
<<<<<<< HEAD
              <div className="text-gray-500 text-lg mb-2">
                No approval rules found
              </div>
              <p className="text-gray-400">
                Create your first approval rule to get started.
              </p>
=======
              <div className="text-gray-500 text-lg mb-2">No approval rules found</div>
              <p className="text-gray-400">Create your first approval rule to get started.</p>
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
<<<<<<< HEAD
                <div
                  key={rule.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
=======
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {rule.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {getRuleTypeDescription(rule)}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
<<<<<<< HEAD
                          <span className="font-medium">Approvers:</span>{" "}
                          {rule.approverIds
                            .map((id) => users.find((u) => u.id === id)?.name)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                          title="Edit rule"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          title="Delete rule"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
=======
                          <span className="font-medium">Approvers:</span>{' '}
                          {rule.approverIds.map(id => users.find(u => u.id === id)?.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
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
