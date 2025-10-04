"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/db-light.js";

export default function ApprovalSequenceConfig({ user, company }) {
  const [sequences, setSequences] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    steps: [{ role: "manager", userId: "", isRequired: true }],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyUsers = await db.getUsersByCompany(company.id);
        setUsers(companyUsers);
        
        // Load approval sequences (we'll store these in the database)
        const sequences = await db.getApprovalSequencesByCompany(company.id);
        setSequences(sequences);
      } catch (error) {
        console.error('Error loading approval sequence data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [company.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSequence) {
        // Update existing sequence
        const updatedSequence = {
          ...editingSequence,
          name: formData.name,
          steps: formData.steps.filter(step => step.role && step.userId),
          updatedAt: new Date(),
        };

        await db.updateApprovalSequence(editingSequence.id, updatedSequence);
        setEditingSequence(null);
      } else {
        // Create new sequence
        const newSequence = {
          id: uuidv4(),
          companyId: company.id,
          name: formData.name,
          steps: formData.steps.filter(step => step.role && step.userId),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.createApprovalSequence(newSequence);
      }

      // Refresh sequences list
      const updatedSequences = await db.getApprovalSequencesByCompany(company.id);
      setSequences(updatedSequences);

      // Reset form
      setFormData({
        name: "",
        steps: [{ role: "manager", userId: "", isRequired: true }],
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving approval sequence:", error);
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { role: "manager", userId: "", isRequired: true }],
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleEditSequence = (sequence) => {
    setEditingSequence(sequence);
    setFormData({
      name: sequence.name,
      steps: sequence.steps.length > 0 ? sequence.steps : [{ role: "manager", userId: "", isRequired: true }],
    });
    setShowForm(true);
  };

  const handleDeleteSequence = async (sequenceId) => {
    if (window.confirm("Are you sure you want to delete this approval sequence?")) {
      try {
        await db.deleteApprovalSequence(sequenceId);
        const updatedSequences = await db.getApprovalSequencesByCompany(company.id);
        setSequences(updatedSequences);
      } catch (error) {
        console.error("Error deleting approval sequence:", error);
        alert("An error occurred while deleting the sequence");
      }
    }
  };

  const getRoleUsers = (role) => {
    return users.filter(user => user.role === role);
  };

  const getStepDescription = (step) => {
    const user = users.find(u => u.id === step.userId);
    const roleName = step.role.charAt(0).toUpperCase() + step.role.slice(1);
    return `${roleName}: ${user?.name || 'Not selected'} ${step.isRequired ? '(Required)' : '(Optional)'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading approval sequences...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Approval Sequence Configuration
            </h3>
            <button
              onClick={() => {
                setEditingSequence(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Sequence
            </button>
          </div>

          {/* Add/Edit Sequence Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingSequence ? "Edit Approval Sequence" : "Create New Approval Sequence"}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Sequence Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., High Value Approval Flow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Steps
                  </label>
                  <div className="space-y-3">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600">Role</label>
                              <select
                                value={step.role}
                                onChange={(e) => handleStepChange(index, 'role', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                                <option value="employee">Employee</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">User</label>
                              <select
                                value={step.userId}
                                onChange={(e) => handleStepChange(index, 'userId', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="">Select User</option>
                                {getRoleUsers(step.role).map(user => (
                                  <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={step.isRequired}
                                onChange={(e) => handleStepChange(index, 'isRequired', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-xs text-gray-600">Required</label>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Step
                  </button>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSequence(null);
                      setShowForm(false);
                      setFormData({
                        name: "",
                        steps: [{ role: "manager", userId: "", isRequired: true }],
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {editingSequence ? "Update Sequence" : "Create Sequence"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sequences List */}
          {sequences.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                No approval sequences found
              </div>
              <p className="text-gray-400">
                Create your first approval sequence to define approval workflows.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sequences.map((sequence) => (
                <div key={sequence.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {sequence.name}
                      </h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Steps:</span>
                        </p>
                        <div className="mt-1 space-y-1">
                          {sequence.steps.map((step, index) => (
                            <div key={index} className="text-sm text-gray-500">
                              Step {index + 1}: {getStepDescription(step)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-1">
                      <button
                        onClick={() => handleEditSequence(sequence)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                        title="Edit sequence"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSequence(sequence.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        title="Delete sequence"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
