'use client';

import { useState } from 'react';
import type { Expense } from '@/types';

interface BudgetManagerProps {
  budget: number;
  expenses: Expense[];
  onBudgetChange: (budget: number) => void;
  onExpenseAdd: (expense: Expense) => void;
  onExpenseRemove: (expenseId: string) => void;
}

export function BudgetManager({ budget, expenses, onBudgetChange, onExpenseAdd, onExpenseRemove }: BudgetManagerProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    title: '',
    amount: 0,
    category: 'activities',
    date: new Date().toISOString().split('T')[0],
  });

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;
  const progress = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const categories = [
    { value: 'transport', label: '交通', icon: '🚗' },
    { value: 'accommodation', label: '住宿', icon: '🏨' },
    { value: 'food', label: '餐饮', icon: '🍽️' },
    { value: 'activities', label: '活动', icon: '🎯' },
    { value: 'shopping', label: '购物', icon: '🛍️' },
    { value: 'other', label: '其他', icon: '📦' },
  ];

  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount > 0) {
      const expense: Expense = {
        id: Date.now().toString(),
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category as Expense['category'],
        date: newExpense.date || new Date().toISOString().split('T')[0],
        notes: newExpense.notes,
      };
      onExpenseAdd(expense);
      setNewExpense({ title: '', amount: 0, category: 'activities', date: new Date().toISOString().split('T')[0] });
      setShowAddExpense(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '📦';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">预算管理</h3>
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          添加费用
        </button>
      </div>

      {/* Budget Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">总预算</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="设置预算"
          />
        </div>
      </div>

      {/* Progress Bar */}
      {budget > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>已使用: ${totalSpent}</span>
            <span>剩余: ${remaining}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="费用名称"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="金额"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddExpense}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddExpense(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getCategoryIcon(expense.category)}</span>
              <div>
                <p className="font-medium text-gray-900">{expense.title}</p>
                <p className="text-sm text-gray-500">{expense.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-gray-900">${expense.amount}</span>
              <button
                onClick={() => onExpenseRemove(expense.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}