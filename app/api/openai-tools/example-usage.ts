// Example usage of the OpenAI API with custom tools
// This file demonstrates how to call the API endpoint from client-side code

export interface OpenAIToolsRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
}

export interface OpenAIToolsResponse {
  message: {
    role: string;
    content: string;
    tool_calls?: Array<{
      id: string;
      type: string;
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
  toolCalls?: Array<any>;
  toolResults?: Array<any>;
  usage?: {
    initial?: any;
    final?: any;
  };
}

// Example function to call the OpenAI API with tools
export async function callOpenAIWithTools(
  messages: OpenAIToolsRequest['messages'],
  model: string = 'gpt-4o-mini'
): Promise<OpenAIToolsResponse> {
  try {
    const response = await fetch('/api/openai-tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        maxTokens: 1000,
        tools: [
          {
            type: "function",
            function: {
              name: "generateMonthlyBudgetWidget",
              description: "Generate a monthly budget widget with spending categories and progress tracking",
              parameters: {
                type: "object",
                properties: {
                  month: { type: "string", description: "Month name (e.g., 'January', 'February')" },
                  year: { type: "number", description: "Year (e.g., 2024)" },
                  totalBudget: { type: "number", description: "Total monthly budget amount" },
                  totalSpent: { type: "number", description: "Total amount spent so far this month" },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Category name (e.g., 'Food', 'Transportation')" },
                        allocated: { type: "number", description: "Budget allocated for this category" },
                        spent: { type: "number", description: "Amount spent in this category" },
                        color: { type: "string", description: "CSS color class for the progress bar" }
                      },
                      required: ["name", "allocated", "spent", "color"]
                    }
                  },
                  savingsGoal: { type: "number", description: "Monthly savings goal amount (optional)" },
                  savingsCurrent: { type: "number", description: "Current savings amount for this month (optional)" }
                },
                required: ["month", "year", "totalBudget", "totalSpent", "categories"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "generateChartData",
              description: "Generate chart data and configuration for financial visualizations including expenses, income, savings, and budget analysis",
              parameters: {
                type: "object",
                properties: {
                  chartType: {
                    type: "string",
                    enum: ["bar", "line", "pie", "area"],
                    description: "Type of chart to generate"
                  },
                  dataType: {
                    type: "string",
                    enum: ["expenses", "income", "budget", "savings", "categories", "trends", "custom"],
                    description: "Type of financial data to visualize"
                  },
                  timeframe: {
                    type: "string",
                    enum: ["week", "month", "quarter", "year"],
                    description: "Time period for the data (optional)"
                  },
                  title: {
                    type: "string",
                    description: "Chart title (optional, will be auto-generated if not provided)"
                  },
                  xAxisLabel: {
                    type: "string",
                    description: "Label for X-axis (optional)"
                  },
                  yAxisLabel: {
                    type: "string",
                    description: "Label for Y-axis (optional, defaults to 'Amount (CHF)')"
                  }
                },
                required: ["chartType", "dataType"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "calculateCompoundInterest",
              description: "Calculate compound interest for investment planning",
              parameters: {
                type: "object",
                properties: {
                  principal: { type: "number", description: "Initial investment amount" },
                  rate: { type: "number", description: "Annual interest rate as a percentage (e.g., 7 for 7%)" },
                  time: { type: "number", description: "Investment time period in years" },
                  compoundFrequency: {
                    type: "string",
                    enum: ["annually", "semi-annually", "quarterly", "monthly", "daily"],
                    description: "How often interest is compounded"
                  }
                },
                required: ["principal", "rate", "time"]
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

// Example usage scenarios
export const exampleUsages = {
  // Weather query
  weatherQuery: async () => {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant that can provide weather information and financial advice.',
      },
      {
        role: 'user' as const,
        content: 'What\'s the weather like in San Francisco?',
      },
    ];

    return await callOpenAIWithTools(messages);
  },

  // Financial calculation
  financialQuery: async () => {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a financial advisor assistant that can perform calculations and provide advice.',
      },
      {
        role: 'user' as const,
        content: 'If I invest $10,000 at 7% annual interest compounded monthly for 10 years, how much will I have?',
      },
    ];

    return await callOpenAIWithTools(messages);
  },

  // User profile query
  userProfileQuery: async () => {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a personal finance assistant that can access user profiles and provide personalized advice.',
      },
      {
        role: 'user' as const,
        content: 'Can you get my profile information for user_123 and give me some financial advice?',
      },
    ];

    return await callOpenAIWithTools(messages);
  },

  // Complex multi-tool query
  complexQuery: async () => {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a comprehensive assistant that can help with weather, finances, and user management.',
      },
      {
        role: 'user' as const,
        content: 'I\'m user_123. Can you check the weather in New York, calculate how much I\'d have if I invested $5000 at 6% for 5 years with monthly compounding, and also get my user profile to give me personalized advice?',
      },
    ];

    return await callOpenAIWithTools(messages);
  },
};

// Utility function to format the response for display
export function formatOpenAIResponse(response: OpenAIToolsResponse): string {
  let formatted = `**Assistant Response:**\n${response.message.content}\n\n`;

  if (response.toolCalls && response.toolCalls.length > 0) {
    formatted += `**Tools Used:**\n`;
    response.toolCalls.forEach((toolCall, index) => {
      formatted += `${index + 1}. ${toolCall.function.name}\n`;
    });
    formatted += '\n';
  }

  if (response.toolResults && response.toolResults.length > 0) {
    formatted += `**Tool Results:**\n`;
    response.toolResults.forEach((result, index) => {
      const content = JSON.parse(result.content);
      formatted += `${index + 1}. ${JSON.stringify(content, null, 2)}\n\n`;
    });
  }

  if (response.usage) {
    formatted += `**Token Usage:**\n`;
    if (response.usage.initial) {
      formatted += `Initial: ${JSON.stringify(response.usage.initial)}\n`;
    }
    if (response.usage.final) {
      formatted += `Final: ${JSON.stringify(response.usage.final)}\n`;
    }
  }

  return formatted;
}
