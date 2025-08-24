import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateChartDataTool } from "../tools/generateChartData";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// Define available tools
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generateMonthlyBudgetWidget",
      description: "Generate a monthly budget widget with spending categories and progress tracking",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "string",
            description: "Month name (e.g., 'January', 'February')",
          },
          year: {
            type: "number",
            description: "Year (e.g., 2024)",
          },
          totalBudget: {
            type: "number",
            description: "Total monthly budget amount",
          },
          totalSpent: {
            type: "number",
            description: "Total amount spent so far this month",
          },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Category name (e.g., 'Food', 'Transportation')",
                },
                allocated: {
                  type: "number",
                  description: "Budget allocated for this category",
                },
                spent: {
                  type: "number",
                  description: "Amount spent in this category",
                },
                color: {
                  type: "string",
                  description: "CSS color class for the progress bar (e.g., 'bg-blue-500')",
                },
              },
              required: ["name", "allocated", "spent", "color"],
            },
          },
          savingsGoal: {
            type: "number",
            description: "Monthly savings goal amount (optional)",
          },
          savingsCurrent: {
            type: "number",
            description: "Current savings amount for this month (optional)",
          },
        },
        required: ["month", "year", "totalBudget", "totalSpent", "categories"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculateCompoundInterest",
      description: "Calculate compound interest for investment planning",
      parameters: {
        type: "object",
        properties: {
          principal: {
            type: "number",
            description: "Initial investment amount",
          },
          rate: {
            type: "number",
            description: "Annual interest rate as a percentage (e.g., 7 for 7%)",
          },
          time: {
            type: "number",
            description: "Investment time period in years",
          },
          compoundFrequency: {
            type: "string",
            enum: ["annually", "semi-annually", "quarterly", "monthly", "daily"],
            description: "How often interest is compounded",
          },
        },
        required: ["principal", "rate", "time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculateMonthlyPayment",
      description: "Calculate monthly payment for loans or mortgages",
      parameters: {
        type: "object",
        properties: {
          principal: {
            type: "number",
            description: "Loan amount",
          },
          rate: {
            type: "number",
            description: "Annual interest rate as a percentage",
          },
          years: {
            type: "number",
            description: "Loan term in years",
          },
        },
        required: ["principal", "rate", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather_data",
      description: "Get current weather data for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: 'The city and country, e.g. "San Francisco, CA"',
          },
          units: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "Temperature units",
          },
        },
        required: ["location"],
      },
    },
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
            description: "Type of chart to generate",
          },
          dataType: {
            type: "string",
            enum: ["expenses", "income", "budget", "savings", "categories", "trends", "custom"],
            description: "Type of financial data to visualize",
          },
          timeframe: {
            type: "string",
            enum: ["week", "month", "quarter", "year"],
            description: "Time period for the data (optional)",
          },
          customLabels: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Custom labels for chart data points (required when dataType is 'custom')",
          },
          customValues: {
            type: "array",
            items: {
              type: "number",
            },
            description: "Custom values for chart data points (required when dataType is 'custom')",
          },
          title: {
            type: "string",
            description: "Chart title (optional, will be auto-generated if not provided)",
          },
          xAxisLabel: {
            type: "string",
            description: "Label for X-axis (optional)",
          },
          yAxisLabel: {
            type: "string",
            description: "Label for Y-axis (optional, defaults to 'Amount (CHF)')",
          },
        },
        required: ["chartType", "dataType"],
      },
    },
  },
];

// Function to execute tool calls
async function executeToolCall(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
) {
  if (toolCall.type === 'function') {
    const { name, arguments: args } = toolCall.function;
    const parsedArgs = JSON.parse(args);

    switch (name) {
      case "generateMonthlyBudgetWidget":
        return generateMonthlyBudgetWidget(
          parsedArgs.month,
          parsedArgs.year,
          parsedArgs.totalBudget,
          parsedArgs.totalSpent,
          parsedArgs.categories,
          parsedArgs.savingsGoal,
          parsedArgs.savingsCurrent
        );
      case "calculateCompoundInterest":
        return calculateCompoundInterest(
          parsedArgs.principal,
          parsedArgs.rate,
          parsedArgs.time,
          parsedArgs.compoundFrequency || 'annually'
        );
      case "calculateMonthlyPayment":
        return calculateMonthlyPayment(
          parsedArgs.principal,
          parsedArgs.rate,
          parsedArgs.years
        );
      case "get_weather_data":
        // Placeholder for weather data function
        return { location: parsedArgs.location, units: parsedArgs.units, temperature: "22°C", condition: "Sunny" };
      case "generateChartData":
        return await generateChartDataTool(
          parsedArgs.chartType,
          parsedArgs.dataType,
          parsedArgs.timeframe,
          parsedArgs.customLabels,
          parsedArgs.customValues,
          parsedArgs.title,
          parsedArgs.xAxisLabel,
          parsedArgs.yAxisLabel
        );
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
  throw new Error('Invalid tool call type');
}

// Widget generation functions
function generateMonthlyBudgetWidget(
  month: string,
  year: number,
  totalBudget: number,
  totalSpent: number,
  categories: any[],
  savingsGoal?: number,
  savingsCurrent?: number
): any {
  return {
    type: "monthlyBudgetWidget",
    data: {
      month,
      year,
      totalBudget,
      totalSpent,
      categories,
      savingsGoal: savingsGoal || 0,
      savingsCurrent: savingsCurrent || 0,
      remaining: totalBudget - totalSpent,
      spentPercentage: (totalSpent / totalBudget) * 100
    },
    message: `Generated monthly budget widget for ${month} ${year}. Total budget: $${totalBudget.toLocaleString()}, spent: $${totalSpent.toLocaleString()}, remaining: $${(totalBudget - totalSpent).toLocaleString()}.`
  };
}

// Financial calculation functions
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundFrequency: string = 'annually'
): any {
  const r = rate / 100;
  let n: number;

  switch (compoundFrequency) {
    case 'annually': n = 1; break;
    case 'semi-annually': n = 2; break;
    case 'quarterly': n = 4; break;
    case 'monthly': n = 12; break;
    case 'daily': n = 365; break;
    default: n = 1;
  }

  const amount = principal * Math.pow(1 + r / n, n * time);
  const interest = amount - principal;

  return {
    principal,
    rate: rate + '%',
    time: time + ' years',
    compoundFrequency,
    finalAmount: Math.round(amount * 100) / 100,
    interestEarned: Math.round(interest * 100) / 100
  };
}

function calculateMonthlyPayment(
  principal: number,
  rate: number,
  years: number
): any {
  const monthlyRate = (rate / 100) / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) {
    return { monthlyPayment: principal / numberOfPayments };
  }

  const monthlyPayment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return {
    principal,
    annualRate: rate + '%',
    term: years + ' years',
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayments: Math.round(monthlyPayment * numberOfPayments * 100) / 100,
    totalInterest: Math.round((monthlyPayment * numberOfPayments - principal) * 100) / 100
  };
}
/**
 * Handle POST requests to the OpenAI API with custom tools.
 *
 * @param {NextRequest} request - The request object.
 * @returns {Promise<NextResponse>} - The response object.
 *
 * The endpoint expects the following JSON payload:
 * 
 */
export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      model = "gpt-5-mini",
      maxTokens = 1000,
      directToolCall,
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Handle direct tool calls (bypass OpenAI)
    if (directToolCall && directToolCall.name && directToolCall.arguments) {
      try {
        const mockToolCall = {
          id: 'direct-call-' + Date.now(),
          type: 'function' as const,
          function: {
            name: directToolCall.name,
            arguments: directToolCall.arguments
          }
        };

        const result = await executeToolCall(mockToolCall);
        return NextResponse.json({
          directToolResult: result,
          message: { content: 'Direct tool call executed' },
        });
      } catch (error) {
        console.error('Direct tool call error:', error);
        return NextResponse.json(
          { error: 'Direct tool call failed', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Make initial request to OpenAI with tools
    const completion = await openai.chat.completions.create({
      model,
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: maxTokens,
    });

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Check if the model wants to call tools
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Add the assistant's response to messages
      const updatedMessages = [...messages, responseMessage];

      // Execute all tool calls
      const toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall) => {
          try {
            const result = await executeToolCall(toolCall);
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify(result),
            };
          } catch (error) {
            console.error(
              `Error executing tool ${toolCall.type === 'function' ? toolCall.function.name : 'unknown'}:`,
              error
            );
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify({
                error: `Failed to execute tool: ${error instanceof Error ? error.message : "Unknown error"
                  }`,
              }),
            };
          }
        })
      );

      // Add tool results to messages
      updatedMessages.push(...toolResults);

      // Make a second request with the tool results
      const finalCompletion = await openai.chat.completions.create({
        model,
        messages: updatedMessages,
        max_tokens: maxTokens,
      });

      return NextResponse.json({
        message: finalCompletion.choices[0]?.message,
        toolCalls: responseMessage.tool_calls,
        toolResults,
        usage: {
          initial: completion.usage,
          final: finalCompletion.usage,
        },
      });
    }

    // No tool calls needed, return the response directly
    return NextResponse.json({
      message: responseMessage,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
