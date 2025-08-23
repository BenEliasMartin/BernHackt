# OpenAI API with Custom Tools Implementation

This implementation provides a server-side function that invokes the OpenAI API with custom tool calls, allowing the AI to execute functions within your API directory.

## 🏗️ Architecture

```
app/
├── api/
│   ├── openai-tools/
│   │   ├── route.ts              # Main API endpoint
│   │   └── example-usage.ts      # Client-side usage examples
│   └── tools/                    # Custom tool functions
│       ├── weather.ts            # Weather data tool
│       ├── finance.ts            # Financial calculations tool
│       └── user.ts               # User profile management tool
├── test-openai/
│   └── page.tsx                  # Test interface
└── ...
```

## 🚀 Features

### Main API Endpoint (`/api/openai-tools`)
- **POST endpoint** that accepts messages and returns OpenAI responses
- **Automatic tool detection** and execution
- **Error handling** for failed tool calls
- **Usage tracking** for both initial and final API calls
- **Support for multiple tool calls** in a single request

### Available Tools

#### 1. Weather Tool (`get_weather_data`)
- Get current weather data for any location
- Support for Celsius/Fahrenheit units
- Mock data implementation (easily replaceable with real API)
- Example real API integration included

#### 2. Financial Calculator (`calculate_financial_metrics`)
- Compound interest calculations
- Simple vs compound interest comparison
- ROI calculations
- Loan payment calculations
- Support for different compounding frequencies

#### 3. User Profile Tool (`get_user_profile`)
- Retrieve user profile information
- Financial profile and preferences
- Mock user database with sample data
- Additional functions for profile updates and financial summaries

## 🛠️ Setup

### 1. Environment Variables
Create a `.env.local` file in your project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_weather_api_key_here  # Optional, for real weather data
```

### 2. Dependencies
The implementation uses the official OpenAI SDK:
```bash
npm install openai
# or
pnpm add openai
```

### 3. API Usage

#### Basic Request
```typescript
const response = await fetch('/api/openai-tools', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant with access to various tools.',
      },
      {
        role: 'user',
        content: 'What\'s the weather like in London?',
      },
    ],
    model: 'gpt-4o-mini',
    maxTokens: 1000,
  }),
});

const data = await response.json();
```

#### Response Format
```typescript
{
  message: {
    role: 'assistant',
    content: 'Based on the weather data...',
    tool_calls?: [...] // If tools were used
  },
  toolCalls?: [...],      // Details of tools called
  toolResults?: [...],    // Results from tool execution
  usage: {
    initial: {...},       // Token usage for initial request
    final: {...}          // Token usage for final request
  }
}
```

## 🧪 Testing

Visit `/test-openai` in your browser to access the test interface, which includes:
- **Pre-built example queries** for each tool type
- **Custom query input** for testing your own prompts
- **Formatted response display** showing tool calls and results
- **Loading states** and error handling

### Example Queries

1. **Weather**: "What's the weather like in San Francisco?"
2. **Finance**: "If I invest $10,000 at 7% annual interest compounded monthly for 10 years, how much will I have?"
3. **User Profile**: "Can you get my profile information for user_123?"
4. **Complex**: "I'm user_123. Check the weather in New York, calculate compound interest for $5000 at 6% for 5 years, and get my profile."

## 🔧 Customization

### Adding New Tools

1. **Create the tool function** in `/app/api/tools/`:
```typescript
export async function myCustomTool(param1: string, param2: number) {
  try {
    // Your tool logic here
    return {
      success: true,
      data: { /* your result */ },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

2. **Define the tool schema** in `/app/api/openai-tools/route.ts`:
```typescript
{
  type: 'function',
  function: {
    name: 'my_custom_tool',
    description: 'Description of what your tool does',
    parameters: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Description of param1',
        },
        param2: {
          type: 'number',
          description: 'Description of param2',
        },
      },
      required: ['param1', 'param2'],
    },
  },
}
```

3. **Add the execution case**:
```typescript
case 'my_custom_tool':
  return await myCustomTool(parsedArgs.param1, parsedArgs.param2);
```

4. **Import the function**:
```typescript
import { myCustomTool } from '../tools/my-tool';
```

### Modifying Existing Tools

Each tool function is self-contained and can be modified independently:
- **Weather tool**: Replace mock data with real API calls
- **Finance tool**: Add more complex financial calculations
- **User tool**: Connect to a real database instead of mock data

## 🔒 Security Considerations

- **API Key Protection**: Never expose OpenAI API keys in client-side code
- **Input Validation**: All tool parameters are validated before execution
- **Error Handling**: Comprehensive error handling prevents information leakage
- **Rate Limiting**: Consider implementing rate limiting for production use

## 📊 Token Usage Optimization

- **Efficient Tool Descriptions**: Keep tool descriptions concise but clear
- **Parameter Validation**: Validate inputs before making API calls
- **Response Formatting**: Structure responses to minimize token usage
- **Model Selection**: Use appropriate models (gpt-4o-mini for most cases)

## 🚀 Production Deployment

1. **Environment Variables**: Ensure all required API keys are set
2. **Error Monitoring**: Implement logging and monitoring
3. **Rate Limiting**: Add rate limiting middleware
4. **Caching**: Consider caching tool results where appropriate
5. **Database Integration**: Replace mock data with real database connections

## 📝 Example Use Cases

- **Financial Planning**: Investment calculations, retirement planning
- **Weather Services**: Location-based weather information
- **User Management**: Profile management, personalized recommendations
- **Data Analysis**: Custom analytics and reporting tools
- **External API Integration**: Wrapper functions for third-party services

This implementation provides a solid foundation for building AI-powered applications with custom tool integration, allowing for extensible and maintainable server-side AI functionality.
