import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import our custom tool functions
import { getWeatherData } from "../tools/weather";

// Define available tools
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "makeDashboard",
      description: "Make a dashboard for the user",
      parameters: {
        type: "object",
        properties: {
          layout: {
            type: "string",
            required: true,
            description:
              "Sequence of characters symbolizing the dashboard setup",
            //e.g. [#@!m3]
          },
        },
        required: ["layout"],
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
];

// Function to execute tool calls
async function executeToolCall(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
) {
  const { name, arguments: args } = toolCall.function;
  const parsedArgs = JSON.parse(args);

  switch (name) {
    case "get_weather_data":
      return await getWeatherData(parsedArgs.location, parsedArgs.units);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      model = "gpt-5-mini",
      maxTokens = 1000,
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
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
              `Error executing tool ${toolCall.function.name}:`,
              error
            );
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: JSON.stringify({
                error: `Failed to execute ${toolCall.function.name}: ${
                  error instanceof Error ? error.message : "Unknown error"
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
