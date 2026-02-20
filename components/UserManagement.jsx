'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db-light.js';
export default function UserManagement({ user, company }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    managerId: '',
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const companyUsers = await db.getUsersByCompany(company.id);
        setUsers(companyUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [company.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        id: uuidv4(),
        email: formData.email,
        name: formData.name,
        role: formData.role,
        companyId: company.id,
        managerId: formData.managerId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.createUser(newUser);
      const updatedUsers = await db.getUsersByCompany(company.id);
      setUsers(updatedUsers);
      setFormData({ name: '', email: '', role: 'employee', managerId: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await db.updateUser(userId, { role: newRole });
      if (updatedUser) {
        const updatedUsers = await db.getUsersByCompany(company.id);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const managers = users.filter((u) => u.role === 'manager');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <button type="button" onClick={() => setShowForm(true)} className="btn-indigo">
              Add User
            </button>
          </div>

          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add New User</h4>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                {formData.role === 'employee' && (
                  <div>
                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager</label>
                    <select id="manager" value={formData.managerId} onChange={(e) => setFormData({ ...formData, managerId: e.target.value })} className="mt-1">
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="sm:col-span-2 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-indigo">Add User</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrap ring-1 overflow-hidden rounded-lg">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id}>
                    <td className="text-sm font-medium text-gray-900">{userItem.name}</td>
                    <td className="text-sm text-gray-500">{userItem.email}</td>
                    <td>
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md"
                        disabled={userItem.id === user.id}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-sm text-gray-500">
                      {userItem.id === user.id && <span className="pill badge-blue">You</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
