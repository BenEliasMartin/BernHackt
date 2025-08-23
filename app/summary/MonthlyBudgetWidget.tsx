"use client";

import React from "react";
import { motion } from "framer-motion";

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface MonthlyBudgetWidgetProps {
  month: string;
  year: number;
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  savingsGoal?: number;
  savingsCurrent?: number;
}

export function MonthlyBudgetWidget({
  month,
  year,
  totalBudget,
  totalSpent,
  categories,
  savingsGoal = 0,
  savingsCurrent = 0,
  data,
}: MonthlyBudgetWidgetProps & { data?: any }) {
  // Use data prop if provided, otherwise use individual props
  const budgetData = data || { month, year, totalBudget, totalSpent, categories, savingsGoal, savingsCurrent };

  const {
    month: m = month,
    year: y = year,
    totalBudget: tb = totalBudget,
    totalSpent: ts = totalSpent,
    categories: cat = categories,
    savingsGoal: sg = savingsGoal,
    savingsCurrent: sc = savingsCurrent
  } = budgetData;

  const remaining = tb - ts;
  const spentPercentage = (ts / tb) * 100;
  const savingsPercentage = sg > 0 ? (sc / sg) * 100 : 0;

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">Budget Overview</h3>
        <p className="text-xs text-gray-500">{m} {y}</p>
      </div>

      {/* Summary Numbers */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-semibold text-gray-900">CHF {tb.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Spent</p>
          <p className="text-sm font-semibold text-gray-900">CHF {ts.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Left</p>
          <p className={`text-sm font-semibold ${remaining >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            CHF {remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Usage</span>
          <span className="text-xs text-gray-500">{spentPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${spentPercentage >= 90 ? 'bg-red-500' :
              spentPercentage >= 75 ? 'bg-yellow-500' : 'bg-gray-600'
              }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-medium text-gray-700">Categories</h4>
        {cat.slice(0, 3).map((category: any, index: number) => {
          const categoryPercentage = (category.spent / category.allocated) * 100;
          return (
            <div key={category.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700 truncate max-w-[100px]">{category.name}</span>
                <span className="text-xs text-gray-500">CHF {category.spent.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className="h-1 bg-gray-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
        {cat.length > 3 && (
          <p className="text-xs text-gray-400 text-center">+{cat.length - 3} more</p>
        )}
      </div>

      {/* Savings Goal */}
      {sg > 0 && (
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Savings</span>
            <span className="text-xs text-gray-500">
              CHF {sc.toLocaleString()} / CHF {sg.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <motion.div
              className="h-1 bg-gray-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default MonthlyBudgetWidget;
