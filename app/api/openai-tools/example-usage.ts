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
