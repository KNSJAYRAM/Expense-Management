'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default function ApprovalRules({ user, company }) {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
  }, [company.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    }
  };

  const handleApproverToggle = (approverId) => {
    const newApproverIds = formData.approverIds.includes(approverId)
      ? formData.approverIds.filter(id => id !== approverId)
      : [...formData.approverIds, approverId];
    
    setFormData({ ...formData, approverIds: newApproverIds });
  };

  const getRuleTypeDescription = (rule) => {
    return `${rule.percentage}% of approvers must approve`;
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
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Rule
            </button>
          </div>

          {/* Add Rule Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approvers
                  </label>
                  <div className="space-y-2">
                    {users.map(approver => (
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
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Rule
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rules List */}
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No approval rules found</div>
              <p className="text-gray-400">Create your first approval rule to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
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
