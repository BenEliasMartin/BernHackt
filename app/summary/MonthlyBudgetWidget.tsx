"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from "lucide-react";

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
}: MonthlyBudgetWidgetProps) {
  const remaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;
  const savingsPercentage = savingsGoal > 0 ? (savingsCurrent / savingsGoal) * 100 : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingDown className="h-4 w-4" />;
    if (percentage >= 75) return <TrendingUp className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Monthly Budget</h3>
            <p className="text-sm text-gray-600">{month} {year}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Status</p>
          <div className={`flex items-center gap-1 ${getStatusColor(spentPercentage)}`}>
            {getStatusIcon(spentPercentage)}
            <span className="text-sm font-medium">
              {spentPercentage >= 90 ? "Over Budget" : 
               spentPercentage >= 75 ? "Warning" : "On Track"}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Spent</p>
          <p className="text-xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Remaining</p>
          <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <span className="text-sm text-gray-600">{spentPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${
              spentPercentage >= 90 ? 'bg-red-500' : 
              spentPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-800">Category Breakdown</h4>
        {categories.map((category, index) => {
          const categoryPercentage = (category.spent / category.allocated) * 100;
          return (
            <motion.div
              key={category.name}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm text-gray-600">
                  ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${category.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Savings Goal */}
      {savingsGoal > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-gray-800">Savings Goal</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">
              ${savingsCurrent.toLocaleString()} / ${savingsGoal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              transition={{ delay: 0.8, duration: 1 }}
            />
          </div>
          <p className="text-sm text-green-600 mt-1">
            {savingsPercentage.toFixed(1)}% complete
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default MonthlyBudgetWidget;
