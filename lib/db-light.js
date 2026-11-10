// Lightweight localStorage-backed database
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "expense_db";
const COLLECTIONS = [
  "users",
  "companies",
  "expenses",
  "approvalRules",
  "approvals",
];

const now = () => new Date();

function sampleData() {
  const base = { companyId: "1", createdAt: now(), updatedAt: now() };
  return {
    companies: {
      1: { id: "1", name: "Demo Company", currency: "USD", country: "US", createdAt: now(), updatedAt: now() },
    },
    users: {
      1: { ...base, id: "1", email: "admin@company.com", name: "Demo Admin", role: "admin" },
      2: { ...base, id: "2", email: "manager@company.com", name: "Demo Manager", role: "manager" },
      3: { ...base, id: "3", email: "employee@company.com", name: "Demo Employee", role: "employee", managerId: "2" },
    },
  };
}

class LightDatabase {
  constructor() {
    COLLECTIONS.forEach((name) => (this[name] = new Map()));
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    let data = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      data = stored ? JSON.parse(stored) : sampleData();
    } catch {
      data = sampleData(); // corrupted storage, or no localStorage (server side)
    }
    COLLECTIONS.forEach((name) => {
      if (data[name]) this[name] = new Map(Object.entries(data[name]));
    });
  }

  // Debounced save
  save() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        const data = {};
        COLLECTIONS.forEach((name) => (data[name] = Object.fromEntries(this[name])));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }, 200);
  }

  // Generic helpers
  async _create(collection, item) {
    await this.initialize();
    this[collection].set(item.id, item);
    this.save();
    return item;
  }

  async _get(collection, id) {
    await this.initialize();
    return this[collection].get(id);
  }

  async _filter(collection, predicate) {
    await this.initialize();
    return Array.from(this[collection].values()).filter(predicate);
  }

  async _update(collection, id, updates) {
    await this.initialize();
    const item = this[collection].get(id);
    if (!item) return undefined;
    const updated = { ...item, ...updates, updatedAt: now() };
    this[collection].set(id, updated);
    this.save();
    return updated;
  }

  async _delete(collection, id) {
    await this.initialize();
    const deleted = this[collection].delete(id);
    if (deleted) this.save();
    return deleted;
  }

  // Users
  createUser(user) { return this._create("users", user); }
  getUser(id) { return this._get("users", id); }
  updateUser(id, updates) { return this._update("users", id, updates); }
  getUsersByCompany(companyId) { return this._filter("users", (u) => u.companyId === companyId); }
  async getUserByEmail(email) {
    return (await this._filter("users", (u) => u.email === email))[0];
  }

  // Companies
  createCompany(company) { return this._create("companies", company); }
  getCompany(id) { return this._get("companies", id); }

  // Expenses
  createExpense(expense) { return this._create("expenses", expense); }
  getExpense(id) { return this._get("expenses", id); }
  updateExpense(id, updates) { return this._update("expenses", id, updates); }
  getExpensesByUser(userId) { return this._filter("expenses", (e) => e.userId === userId); }
  getExpensesByCompany(companyId) { return this._filter("expenses", (e) => e.companyId === companyId); }

  getPendingExpensesForApprover(approverId) {
    return this._filter("expenses", (e) => {
      if (e.status !== "pending") return false;
      return (e.approvalChain || [])[e.currentApprovalStep || 0] === approverId;
    });
  }

  // Approvals
  getApprovalsByExpense(expenseId) {
    return this._filter("approvals", (a) => a.expenseId === expenseId);
  }

  // Approval rules
  createApprovalRule(rule) { return this._create("approvalRules", rule); }
  updateApprovalRule(id, updates) { return this._update("approvalRules", id, updates); }
  deleteApprovalRule(id) { return this._delete("approvalRules", id); }
  getApprovalRulesByCompany(companyId) {
    return this._filter("approvalRules", (r) => r.companyId === companyId && r.isActive);
  }

  // Approval workflow
  async processConditionalApproval(expenseId, approverId, status, comment) {
    const expense = await this._get("expenses", expenseId);
    if (!expense) return null;

    const step = expense.currentApprovalStep || 0;
    await this._create("approvals", {
      id: uuidv4(),
      expenseId,
      approverId,
      status,
      comment,
      step,
      createdAt: now(),
      updatedAt: now(),
    });

    if (status === "rejected") {
      return this.updateExpense(expenseId, { status: "rejected" });
    }

    const rules = await this.getApprovalRulesByCompany(expense.companyId);
    for (const rule of rules) {
      if (rule.minAmount <= expense.amount && rule.maxAmount >= expense.amount) {
        if (await this.checkConditionalRule(expenseId, rule)) {
          return this.updateExpense(expenseId, { status: "approved" });
        }
      }
    }

    const nextStep = step + 1;
    if (nextStep >= (expense.approvalChain || []).length) {
      return this.updateExpense(expenseId, { status: "approved", currentApprovalStep: nextStep });
    }
    return this.updateExpense(expenseId, { currentApprovalStep: nextStep });
  }

  async checkConditionalRule(expenseId, rule) {
    const approved = (await this.getApprovalsByExpense(expenseId)).filter(
      (a) => a.status === "approved"
    );

    if (rule.percentage > 0) {
      const total = (rule.approverIds || []).length;
      if (total > 0 && (approved.length / total) * 100 >= rule.percentage) return true;
    }

    return Boolean(
      rule.specificApproverId &&
        approved.some((a) => a.approverId === rule.specificApproverId)
    );
  }
}

export const db = new LightDatabase();
