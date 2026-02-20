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
    requireManagerApproval: true,
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

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await fetch('/api/currency?action=rates&base=USD');
        const data = await response.json();
        const currencyList = Object.keys(data.rates || {}).map(code => ({ code, name: code }));
        setCurrencies(currencyList.length ? currencyList : [
          { code: 'USD', name: 'US Dollar' },
          { code: 'EUR', name: 'Euro' },
          { code: 'GBP', name: 'British Pound' },
          { code: 'INR', name: 'Indian Rupee' },
        ]);
      } catch (error) {
        setCurrencies([
          { code: 'USD', name: 'US Dollar' },
          { code: 'EUR', name: 'Euro' },
          { code: 'GBP', name: 'British Pound' },
          { code: 'INR', name: 'Indian Rupee' },
        ]);
      }
    };
    loadCurrencies();
  }, []);

  useEffect(() => {
    const convertCurrency = async () => {
      if (formData.amount && formData.currency !== company.currency) {
        try {
          const response = await fetch(
            `/api/currency?action=convert&amount=${formData.amount}&from=${formData.currency}&to=${company.currency}`
          );
          const data = await response.json();
          setConvertedAmount(data.convertedAmount != null ? data.convertedAmount : null);
        } catch (error) {
          setConvertedAmount(null);
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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData, userId: user.id })
        });
        if (response.ok) {
          const data = await response.json();
          const ocrData = data.ocrResult?.extractedData || {};
          setFormData(prev => ({
            ...prev,
            amount: (ocrData.amount != null ? ocrData.amount : prev.amount).toString(),
            currency: ocrData.currency || prev.currency,
            category: ocrData.category || prev.category,
            description: ocrData.description || prev.description,
            date: ocrData.date || prev.date,
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR error:', error);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { db } = await import('../lib/db-light.js');
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

      let approvalNeeded = true;
      if (user.role !== 'admin') {
        const approvalRules = await db.getApprovalRulesByCompany(user.companyId);
        const applicableRules = approvalRules.filter(
          (rule) => rule.minAmount <= expense.amount && rule.maxAmount >= expense.amount
        );
        for (const rule of applicableRules) {
          if (rule.percentage === 0 && (!rule.approverIds || rule.approverIds.length === 0) && !rule.specificApproverId) {
            approvalNeeded = false;
            break;
          }
          if (rule.specificApproverId === user.id) {
            approvalNeeded = false;
            break;
          }
        }
        setNeedsApproval(approvalNeeded);
        if (approvalNeeded) {
          const approvalSequences = await db.getApprovalSequencesByCompany(user.companyId);
          const matchingSequence = approvalSequences.find(s => s.steps && s.steps.length > 0);
          let approvers = [];
          if (matchingSequence) {
            approvers = (matchingSequence.steps || []).map(step => step.userId).filter(Boolean);
            expense.approvalSequenceId = matchingSequence.id;
          } else {
            const companyUsers = await db.getUsersByCompany(user.companyId);
            if (formData.requireManagerApproval && user.managerId) approvers.push(user.managerId);
            const admins = companyUsers.filter(u => u.role === 'admin' && u.id !== user.id);
            if (admins.length > 0 && !approvers.includes(admins[0].id)) approvers.push(admins[0].id);
            if (approvers.length === 0) {
              const managers = companyUsers.filter(u => u.role === 'manager' && u.id !== user.id);
              if (managers.length > 0) approvers.push(managers[0].id);
            }
          }
          if (approvers.length > 0) {
            expense.approvalChain = approvers;
            expense.currentApprovalStep = 0;
            expense.requireManagerApproval = formData.requireManagerApproval;
          }
        } else {
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
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex">
          <div className="flex-shrink-0">
            <span className="text-xl">✅</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Expense Submitted Successfully!</h3>
            <p className="mt-1 text-sm text-green-700">
              {user.role === 'admin'
                ? 'Your expense has been automatically approved.'
                : needsApproval
                  ? 'Your expense has been submitted and is waiting for approval.'
                  : 'Your expense has been automatically approved based on company rules.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="card-elevated hover-lift">
        <div className="p-4 sm:p-6">
          <h3 className="text-3xl font-bold gradient-text-glow mb-6 text-center">Submit New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="file-input-wrap">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📷</span> Upload Receipt (OCR)
              </label>
              <div className="flex items-center space-x-4">
                <input type="file" accept="image/*" onChange={handleReceiptUpload} />
                {ocrLoading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="spinner spinner-sm mr-2"></div>
                    Processing...
                  </div>
                )}
              </div>
              {receiptImage && <p className="mt-1 text-sm text-green-600">✓ Receipt uploaded and processed</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency *</label>
                <select
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {convertedAmount != null && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Converted Amount:</span> {Number(convertedAmount).toFixed(2)} {company.currency}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                id="description"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                placeholder="Describe the expense..."
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1"
              />
            </div>

            {user.role === 'employee' && user.managerId && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireManagerApproval"
                  checked={formData.requireManagerApproval}
                  onChange={(e) => setFormData({ ...formData, requireManagerApproval: e.target.checked })}
                />
                <label htmlFor="requireManagerApproval" className="ml-2 block text-sm text-gray-700">
                  Require Manager Approval
                </label>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center py-3 px-8 text-lg font-bold rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm mr-2" style={{ borderColor: 'transparent', borderTopColor: '#fff' }}></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
