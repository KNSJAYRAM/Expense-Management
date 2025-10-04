'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ExpenseForm({ user, company }) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: company.currency || 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    requireManagerApproval: true, // New field for manager approver toggle
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  const categories = [
    'Meals & Entertainment',
    'Travel',
    'Office Supplies',
    'Software',
    'Training',
    'Other'
  ];

  // Load currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await fetch('/api/currency?action=rates&base=USD');
        const data = await response.json();
        const currencyList = Object.keys(data.rates).map(code => ({
          code,
          name: code
        }));
        setCurrencies(currencyList);
      } catch (error) {
        console.error('Error loading currencies:', error);
        // Fallback currencies
        setCurrencies([
          { code: 'USD', name: 'US Dollar' },
          { code: 'EUR', name: 'Euro' },
          { code: 'GBP', name: 'British Pound' },
          { code: 'INR', name: 'Indian Rupee' },
          { code: 'CAD', name: 'Canadian Dollar' },
          { code: 'AUD', name: 'Australian Dollar' }
        ]);
      }
    };

    loadCurrencies();
  }, []);

  // Convert currency when amount or currency changes
  useEffect(() => {
    const convertCurrency = async () => {
      if (formData.amount && formData.currency !== company.currency) {
        try {
          const response = await fetch(
            `/api/currency?action=convert&amount=${formData.amount}&from=${formData.currency}&to=${company.currency}`
          );
          const data = await response.json();
          setConvertedAmount(data.convertedAmount);
        } catch (error) {
          console.error('Currency conversion error:', error);
        }
      } else {
        setConvertedAmount(null);
      }
    };

    convertCurrency();
  }, [formData.amount, formData.currency, company.currency]);

  const handleReceiptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setReceiptImage(file);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData,
            userId: user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          const ocrData = data.ocrResult.extractedData;
          
          // Auto-fill form with OCR data
          setFormData(prev => ({
            ...prev,
            amount: ocrData.amount.toString(),
            currency: ocrData.currency,
            category: ocrData.category,
            description: ocrData.description,
            date: ocrData.date
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR processing error:', error);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { v4: uuidv4 } = await import('uuid');
      
      const expense = {
        id: uuidv4(),
        userId: user.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        companyId: user.companyId,
        companyCurrency: company.currency,
        status: user.role === 'admin' ? 'approved' : 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Import db dynamically to avoid client-side issues
      const { db } = await import('../lib/db-light.js');
      
      // Check if approval is needed based on rules
      let approvalNeeded = true;
      
      if (user.role !== 'admin') {
        // Get approval rules for the company
        const approvalRules = await db.getApprovalRulesByCompany(user.companyId);
        const applicableRules = approvalRules.filter(
          (rule) => rule.minAmount <= expense.amount && rule.maxAmount >= expense.amount
        );
        
        // Check if any rule allows auto-approval
        for (const rule of applicableRules) {
          // For auto-approve rules (percentage = 0, no approvers, no specific approver)
          if (rule.percentage === 0 && rule.approverIds.length === 0 && !rule.specificApproverId) {
            approvalNeeded = false;
            break;
          }
          // For specific approver rules, if the current user is the specific approver, auto-approve
          if (rule.specificApproverId === user.id) {
            approvalNeeded = false;
            break;
          }
        }
        
        // Set the state for the success message
        setNeedsApproval(approvalNeeded);
        
        // If approval is needed, set up approval workflow
        if (approvalNeeded) {
          // Try to get approval sequences first
          const approvalSequences = await db.getApprovalSequencesByCompany(user.companyId);
          let approvers = [];
          
          // Check if there's a matching approval sequence based on amount
          const matchingSequence = approvalSequences.find(sequence => {
            // For now, use the first sequence. In a real app, you'd have logic to match based on amount, category, etc.
            return sequence.steps && sequence.steps.length > 0;
          });
          
          if (matchingSequence) {
            // Use the approval sequence
            approvers = matchingSequence.steps.map(step => step.userId).filter(Boolean);
            expense.approvalSequenceId = matchingSequence.id;
          } else {
            // Fallback to default approval logic
            const companyUsers = await db.getUsersByCompany(user.companyId);
            
            // Check if manager approval is required and user has a manager
            if (formData.requireManagerApproval && user.managerId) {
              approvers.push(user.managerId);
            }
            
            // If no manager approval required or no manager, add admin
            const admins = companyUsers.filter(u => u.role === 'admin' && u.id !== user.id);
            if (admins.length > 0 && !approvers.includes(admins[0].id)) {
              approvers.push(admins[0].id);
            }
            
            // If still no approvers, find any manager
            if (approvers.length === 0) {
              const managers = companyUsers.filter(u => u.role === 'manager' && u.id !== user.id);
              if (managers.length > 0) {
                approvers.push(managers[0].id);
              }
            }
          }
          
          // Set approval chain
          if (approvers.length > 0) {
            expense.approvalChain = approvers;
            expense.currentApprovalStep = 0;
            expense.requireManagerApproval = formData.requireManagerApproval;
          }
        } else {
          // Auto-approve based on rules
          expense.status = 'approved';
        }
      }
      
      await db.createExpense(expense);

      setSuccess(true);
      setFormData({
        amount: '',
        currency: company.currency || 'USD',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        requireManagerApproval: true,
      });
      setConvertedAmount(null);
      setReceiptImage(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('An error occurred while submitting the expense');
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
                  : needsApproval 
                    ? 'Your expense has been submitted and is waiting for approval.'
                    : 'Your expense has been automatically approved based on company rules.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="card-elevated hover-lift">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-3xl leading-6 font-bold gradient-text-glow mb-6 text-center animate-slideInUp">
            ✨ Submit New Expense ✨
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OCR Receipt Upload */}
            <div className="animate-slideInRight">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="mr-2 animate-pulse">📷</span>
                Upload Receipt (OCR)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {ocrLoading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Processing...
                  </div>
                )}
              </div>
              {receiptImage && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Receipt uploaded and processed
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-slideInRight" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2 animate-pulse">💰</span>
                  Amount *
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

              <div className="animate-slideInRight" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2 animate-spin-slow">🌍</span>
                  Currency *
                </label>
                <select
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {convertedAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Converted Amount:</span> {convertedAmount.toFixed(2)} {company.currency}
                </p>
              </div>
            )}

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

            {/* Manager Approval Toggle */}
            {user.role === 'employee' && user.managerId && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireManagerApproval"
                  checked={formData.requireManagerApproval}
                  onChange={(e) => setFormData({ ...formData, requireManagerApproval: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requireManagerApproval" className="ml-2 block text-sm text-gray-700">
                  Require Manager Approval (IS MANAGER APPROVER)
                </label>
              </div>
            )}

            <div className="flex justify-center animate-slideInUp" style={{ animationDelay: '0.5s' }}>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-lg text-lg font-bold rounded-lg text-white btn-primary hover-glow disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-pulse"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">✨</span>
                    Submit Expense
                    <span className="ml-2">✨</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
