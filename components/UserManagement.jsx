'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db-light.js';
=======
import { db } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48

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
<<<<<<< HEAD
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
=======
    const companyUsers = db.getUsersByCompany(company.id);
    setUsers(companyUsers);
    setLoading(false);
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
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

<<<<<<< HEAD
      await db.createUser(newUser);
      
      // Refresh users list
      const updatedUsers = await db.getUsersByCompany(company.id);
=======
      db.createUser(newUser);
      
      // Refresh users list
      const updatedUsers = db.getUsersByCompany(company.id);
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
      setUsers(updatedUsers);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        managerId: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

<<<<<<< HEAD
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await db.updateUser(userId, { role: newRole });
      if (updatedUser) {
        const updatedUsers = await db.getUsersByCompany(company.id);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
=======
  const handleRoleChange = (userId, newRole) => {
    const updatedUser = db.updateUser(userId, { role: newRole });
    if (updatedUser) {
      const updatedUsers = db.getUsersByCompany(company.id);
      setUsers(updatedUsers);
>>>>>>> 12b7366e64d70471407f75f35d1fb0bac42f6b48
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Management
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add User
            </button>
          </div>

          {/* Add User Form */}
          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add New User</h4>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {formData.role === 'employee' && (
                  <div>
                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                      Manager
                    </label>
                    <select
                      id="manager"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 flex justify-end space-x-2">
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
                    Add User
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {userItem.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={userItem.id === user.id}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.id === user.id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
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
