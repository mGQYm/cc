'use client';

import { useState } from 'react';
import type { Checklist, ChecklistItem } from '@/types';

interface ChecklistManagerProps {
  checklist: Checklist;
  onChecklistUpdate: (checklist: Checklist) => void;
}

const PREDEFINED_TEMPLATES = {
  essentials: {
    name: '旅行必需品',
    items: [
      { title: '护照/身份证', category: 'documents' },
      { title: '登机牌', category: 'documents' },
      { title: '现金/信用卡', category: 'money' },
      { title: '手机充电器', category: 'electronics' },
      { title: '常用药品', category: 'health' },
      { title: '换洗衣物', category: 'clothing' },
    ]
  },
  international: {
    name: '国际旅行',
    items: [
      { title: '签证', category: 'documents' },
      { title: '国际驾照', category: 'documents' },
      { title: '旅行保险', category: 'documents' },
      { title: '电源转换器', category: 'electronics' },
      { title: '翻译APP', category: 'apps' },
    ]
  },
  photography: {
    name: '摄影装备',
    items: [
      { title: '相机', category: 'electronics' },
      { title: '备用电池', category: 'electronics' },
      { title: '存储卡', category: 'electronics' },
      { title: '三脚架', category: 'electronics' },
      { title: '镜头清洁布', category: 'accessories' },
    ]
  }
};

export function ChecklistManager({ checklist, onChecklistUpdate }: ChecklistManagerProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const categories = [
    { value: 'documents', label: '证件文件', icon: '📄' },
    { value: 'clothing', label: '服装', icon: '👕' },
    { value: 'electronics', label: '电子设备', icon: '📱' },
    { value: 'toiletries', label: '洗漱用品', icon: '🧴' },
    { value: 'health', label: '健康医疗', icon: '💊' },
    { value: 'money', label: '钱财', icon: '💰' },
    { value: 'apps', label: 'APP准备', icon: '📲' },
    { value: 'accessories', label: '配件', icon: '🎒' },
    { value: 'other', label: '其他', icon: '📦' },
  ];

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        title: newItemTitle.trim(),
        completed: false,
        category: newItemCategory,
      };
      
      onChecklistUpdate({
        ...checklist,
        items: [...checklist.items, newItem]
      });
      
      setNewItemTitle('');
    }
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onChecklistUpdate({ ...checklist, items: updatedItems });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = checklist.items.filter(item => item.id !== itemId);
    onChecklistUpdate({ ...checklist, items: updatedItems });
  };

  const handleLoadTemplate = (templateKey: keyof typeof PREDEFINED_TEMPLATES) => {
    const template = PREDEFINED_TEMPLATES[templateKey];
    const newItems = template.items.map(item => ({
      id: Date.now().toString() + Math.random(),
      title: item.title,
      completed: false,
      category: item.category,
    }));
    
    onChecklistUpdate({
      name: template.name,
      items: [...checklist.items, ...newItems]
    });
    setShowTemplateModal(false);
  };

  const groupedItems = checklist.items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{checklist.name || '旅行清单'}</h3>
          <p className="text-sm text-gray-500">{completedCount}/{totalCount} 已完成</p>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          模板
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Item Form */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="添加新项目..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => {
          const categoryInfo = categories.find(c => c.value === category);
          const completedInCategory = items.filter(item => item.completed).length;
          
          return (
            <div key={category} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {categoryInfo?.icon} {categoryInfo?.label || '其他'}
                </h4>
                <span className="text-sm text-gray-500">{completedInCategory}/{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.title}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">选择模板</h3>
            <div className="space-y-3">
              {Object.entries(PREDEFINED_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleLoadTemplate(key as keyof typeof PREDEFINED_TEMPLATES)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.items.length} 项</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTemplateModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}