// Lightweight database for faster loading
import { v4 as uuidv4 } from "uuid";

class LightDatabase {
  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.expenses = new Map();
    this.approvalRules = new Map();
    this.approvalSequences = new Map();
    this.approvals = new Map();
    this.expenseCategories = new Map();
    this.ocrResults = new Map();
    this.initialized = false;
  }

  // Lazy initialization
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load from localStorage only when needed
      const storedData = localStorage.getItem('expense_db');
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Restore data efficiently
        if (data.users) this.users = new Map(Object.entries(data.users));
        if (data.companies) this.companies = new Map(Object.entries(data.companies));
        if (data.expenses) this.expenses = new Map(Object.entries(data.expenses));
        if (data.approvalRules) this.approvalRules = new Map(Object.entries(data.approvalRules));
        if (data.approvals) this.approvals = new Map(Object.entries(data.approvals));
        if (data.expenseCategories) this.expenseCategories = new Map(Object.entries(data.expenseCategories));
        if (data.ocrResults) this.ocrResults = new Map(Object.entries(data.ocrResults));
      } else {
        // Initialize with minimal sample data
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      this.initializeSampleData();
    }
    
    this.initialized = true;
  }

  // Initialize sample data
  initializeSampleData() {
    const company = {
      id: "1",
      name: "Demo Company",
      currency: "USD",
      country: "US",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(company.id, company);

    const admin = {
      id: "1",
      email: "admin@company.com",
      name: "Demo Admin",
      role: "admin",
      companyId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const manager = {
      id: "2",
      email: "manager@company.com",
      name: "Demo Manager",
      role: "manager",
      companyId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const employee = {
      id: "3",
      email: "employee@company.com",
      name: "Demo Employee",
      role: "employee",
      companyId: "1",
      managerId: "2",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(admin.id, admin);
    this.users.set(manager.id, manager);
    this.users.set(employee.id, employee);
  }

  // Debounced save
  saveToStorage() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        const data = {
          users: Object.fromEntries(this.users),
          companies: Object.fromEntries(this.companies),
          expenses: Object.fromEntries(this.expenses),
          approvalRules: Object.fromEntries(this.approvalRules),
          approvals: Object.fromEntries(this.approvals),
          expenseCategories: Object.fromEntries(this.expenseCategories),
          ocrResults: Object.fromEntries(this.ocrResults)
        };
        localStorage.setItem('expense_db', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }, 200);
  }

  // User operations
  async createUser(user) {
    await this.initialize();
    this.users.set(user.id, user);
    this.saveToStorage();
    return user;
  }

  async getUser(id) {
    await this.initialize();
    return this.users.get(id);
  }

  async getUserByEmail(email) {
    await this.initialize();
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async updateUser(id, updates) {
    await this.initialize();
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(id, updatedUser);
      this.saveToStorage();
      return updatedUser;
    }
    return undefined;
  }

  async getUsersByCompany(companyId) {
    await this.initialize();
    return Array.from(this.users.values()).filter(
      (user) => user.companyId === companyId
    );
  }

  async getUsersByManager(managerId) {
    await this.initialize();
    return Array.from(this.users.values()).filter(
      (user) => user.managerId === managerId
    );
  }

  async getManager(userId) {
    await this.initialize();
    const user = this.users.get(userId);
    return user && user.managerId ? this.users.get(user.managerId) : null;
  }

  // Company operations
  async createCompany(company) {
    await this.initialize();
    this.companies.set(company.id, company);
    this.saveToStorage();
    return company;
  }

  async getCompany(id) {
    await this.initialize();
    return this.companies.get(id);
  }

  // Expense operations
  async createExpense(expense) {
    await this.initialize();
    this.expenses.set(expense.id, expense);
    this.saveToStorage();
    return expense;
  }

  async getExpense(id) {
    await this.initialize();
    return this.expenses.get(id);
  }

  async getExpensesByUser(userId) {
    await this.initialize();
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }

  async getExpensesByCompany(companyId) {
    await this.initialize();
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.companyId === companyId
    );
  }

  async getPendingExpensesForApprover(approverId) {
    await this.initialize();
    return Array.from(this.expenses.values()).filter((expense) => {
      if (expense.status !== "pending") return false;
      const approvalChain = expense.approvalChain || [];
      const currentStep = expense.currentApprovalStep || 0;
      if (currentStep < approvalChain.length) {
        return approvalChain[currentStep] === approverId;
      }
      return false;
    });
  }

  async getApprovedExpensesForApprover(approverId) {
    await this.initialize();
    const approvals = Array.from(this.approvals.values()).filter(
      (approval) =>
        approval.approverId === approverId && approval.status === "approved"
    );

    return approvals
      .map((approval) => {
        const expense = this.expenses.get(approval.expenseId);
        return expense ? { ...expense, approvalDetails: approval } : null;
      })
      .filter((expense) => expense !== null);
  }

  async getAllExpensesForApprover(approverId) {
    await this.initialize();
    const pendingExpenses = await this.getPendingExpensesForApprover(approverId);
    const approvedExpenses = await this.getApprovedExpensesForApprover(approverId);

    return {
      pendingExpenses: pendingExpenses.map((expense) => ({
        ...expense,
        status: "pending",
        approvalDetails: null,
      })),
      approvedExpenses: approvedExpenses.map((expense) => ({
        ...expense,
        status: "approved",
        approvalDetails: expense.approvalDetails,
      })),
    };
  }

  async updateExpense(id, updates) {
    await this.initialize();
    const expense = this.expenses.get(id);
    if (expense) {
      const updatedExpense = { ...expense, ...updates, updatedAt: new Date() };
      this.expenses.set(id, updatedExpense);
      this.saveToStorage();
      return updatedExpense;
    }
    return undefined;
  }

  // Approval operations
  async createApproval(approval) {
    await this.initialize();
    this.approvals.set(approval.id, approval);
    this.saveToStorage();
    return approval;
  }

  async getApprovalsByExpense(expenseId) {
    await this.initialize();
    return Array.from(this.approvals.values()).filter(
      (approval) => approval.expenseId === expenseId
    );
  }

  // Approval Rule operations
  async createApprovalRule(rule) {
    await this.initialize();
    this.approvalRules.set(rule.id, rule);
    this.saveToStorage();
    return rule;
  }

  async getApprovalRulesByCompany(companyId) {
    await this.initialize();
    return Array.from(this.approvalRules.values()).filter(
      (rule) => rule.companyId === companyId && rule.isActive
    );
  }

  async getApprovalRule(id) {
    await this.initialize();
    return this.approvalRules.get(id);
  }

  async updateApprovalRule(id, updates) {
    await this.initialize();
    const rule = this.approvalRules.get(id);
    if (rule) {
      const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      this.approvalRules.set(id, updatedRule);
      this.saveToStorage();
      return updatedRule;
    }
    return undefined;
  }

  async deleteApprovalRule(id) {
    await this.initialize();
    const rule = this.approvalRules.get(id);
    if (rule) {
      this.approvalRules.delete(id);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Approval Sequence operations
  async createApprovalSequence(sequence) {
    await this.initialize();
    this.approvalSequences.set(sequence.id, sequence);
    this.saveToStorage();
    return sequence;
  }

  async getApprovalSequencesByCompany(companyId) {
    await this.initialize();
    return Array.from(this.approvalSequences.values()).filter(
      (sequence) => sequence.companyId === companyId && sequence.isActive
    );
  }

  async getApprovalSequence(id) {
    await this.initialize();
    return this.approvalSequences.get(id);
  }

  async updateApprovalSequence(id, updates) {
    await this.initialize();
    const sequence = this.approvalSequences.get(id);
    if (sequence) {
      const updatedSequence = { ...sequence, ...updates, updatedAt: new Date() };
      this.approvalSequences.set(id, updatedSequence);
      this.saveToStorage();
      return updatedSequence;
    }
    return undefined;
  }

  async deleteApprovalSequence(id) {
    await this.initialize();
    const sequence = this.approvalSequences.get(id);
    if (sequence) {
      this.approvalSequences.delete(id);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Enhanced approval workflow
  async processConditionalApproval(expenseId, approverId, status, comment) {
    await this.initialize();
    const expense = this.expenses.get(expenseId);
    if (!expense) return null;

    const approval = {
      id: uuidv4(),
      expenseId,
      approverId,
      status,
      comment,
      step: expense.currentApprovalStep || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.createApproval(approval);

    if (status === "rejected") {
      return await this.updateExpense(expenseId, { status: "rejected" });
    }

    const approvalRules = await this.getApprovalRulesByCompany(expense.companyId);
    const applicableRules = approvalRules.filter(
      (rule) =>
        rule.minAmount <= expense.amount && rule.maxAmount >= expense.amount
    );

    for (const rule of applicableRules) {
      if (await this.checkConditionalRule(expenseId, rule)) {
        return await this.updateExpense(expenseId, { status: "approved" });
      }
    }

    const nextStep = (expense.currentApprovalStep || 0) + 1;
    if (nextStep >= (expense.approvalChain || []).length) {
      return await this.updateExpense(expenseId, {
        status: "approved",
        currentApprovalStep: nextStep,
      });
    } else {
      return await this.updateExpense(expenseId, {
        currentApprovalStep: nextStep,
      });
    }
  }

  async checkConditionalRule(expenseId, rule) {
    await this.initialize();
    const approvals = await this.getApprovalsByExpense(expenseId);
    const approvedApprovals = approvals.filter((a) => a.status === "approved");

    if (rule.percentageThreshold && rule.percentageThreshold > 0) {
      const totalApprovers = (rule.approverIds || []).length;
      const approvedCount = approvedApprovals.length;
      const percentage = (approvedCount / totalApprovers) * 100;
      if (percentage >= rule.percentageThreshold) {
        return true;
      }
    }

    if (rule.specificApproverId) {
      const hasSpecificApproval = approvedApprovals.some(
        (a) => a.approverId === rule.specificApproverId
      );
      if (hasSpecificApproval) {
        return true;
      }
    }

    return false;
  }
}

export const db = new LightDatabase();
