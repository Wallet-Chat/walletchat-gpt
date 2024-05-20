import OpenAI from "openai";
import axios from "axios";
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
    {
        type: "function",
        function: {
            name: "resolveEnsNameToAddress",
            description: "Resolve the given ENS name to an Ethereum address",
            parameters: {
                type: "object",
                properties: {
                    ensName: {
                        type: "string",
                        description: "The ENS name to resolve",
                    }
                },
                required: ["ensName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getWalletInfo",
            description: "Retrieve the ETH balance, transaction lists, and token transfers of a given wallet address using the Etherscan API",
            parameters: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description: "The Ethereum wallet address to retrieve information for"
                    },
                    action: {
                        type: "string",
                        description: "The action to perform (balance, txlist, tokentx)",
                        enum: ["balance", "txlist", "tokentx"]
                    }
                },
                required: ["address", "action"]
            }
        }
    }
];

let threadId;  // Store the thread ID
const conversations = {};  // In-memory store for conversations

// Create assistant once, outside the handler to avoid creating a new instance each time
let assistant;

const initializeAssistant = async () => {
    if (!assistant) {
        assistant = await openai.beta.assistants.create({
            name: "Crypto Assistant",
            instructions: "You are a cryptocurrency analyst, use the provided functions to answer questions as needed.",
            tools: functions,
            model: "gpt-4o",
        });
    }
};

const executeFunction = async (functionName, args) => {
    switch (functionName) {
        case "resolveEnsNameToAddress":
            return await resolveEnsNameToAddress(args);
        case "getWalletInfo":
            return await getWalletInfo(args);
        default:
            throw new Error(`Unknown function: ${functionName}`);
    }
};

const checkStatusAndReturnMessages = async (threadId, runId) => {
    return new Promise(async (resolve) => {
        const interval = setInterval(async () => {
            console.log(`Checking status of run: ${runId} for thread: ${threadId}`);
            let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
            if (runStatus.status === "completed") {
                clearInterval(interval);
                let messages = await openai.beta.threads.messages.list(threadId);
                const conversationHistory = [];
                messages.data.forEach((msg) => {
                    const role = msg.role;
                    const content = msg.content[0].text.value;
                    conversationHistory.push({ role: role, content: content });
                });
                resolve(conversationHistory);
            }
        }, 2000); // Poll every 2 seconds
    });
};

export const POST = async (req, res) => {
    await initializeAssistant();
    const { message } = await req.json();
    try {
        // Check if a new thread needs to be created
        if (!threadId) {
            // Create a new thread
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
            conversations[threadId] = []; // Initialize the conversation history for the new thread
        } else if (!conversations[threadId]) {
            // Initialize the conversation history if it doesn't exist
            conversations[threadId] = [];
        }

        // Add new user message to history
        const history = conversations[threadId];
        history.push({ role: 'user', content: message });

        // Detect if the assistant wants to call a function
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a cryptocurrency analyst. Use the provided functions to answer questions as needed." },
                { role: "user", content: message }
            ],
            functions: functions.map(f => f.function),
        });

        const functionCall = completion.choices[0].message.function_call;
        if (functionCall) {
            const functionName = functionCall.name;
            const args = JSON.parse(functionCall.arguments);
            const functionResult = await executeFunction(functionName, args);

            // Add the function result to the conversation history
            history.push({ role: 'assistant', content: functionResult });
            conversations[threadId] = history;

            // Respond with the function result
            return new NextResponse(JSON.stringify({ threadId, conversation: history }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // If no function call, proceed to create a new message in the thread
        const userMessage = await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message,
        });

        // Run the assistant with the conversation history if no function is called
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistant.id,
            instructions: "Please address the user as Sir Bruv Degen.",
        });

        console.log(run);

        // Wait for the run to complete and return the result
        const conversationHistory = await checkStatusAndReturnMessages(threadId, run.id);

        // Save updated conversation history
        conversations[threadId] = conversationHistory;

        // Respond with the updated conversation
        return new NextResponse(JSON.stringify({ threadId, conversation: conversationHistory }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error during API call:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to get completion from OpenAI", details: error }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// ENS name resolving function
async function resolveEnsNameToAddress({ ensName }) {
    console.log(`resolveEnsNameToAddress called with ensName: ${ensName}`);
    const baseUrl = 'https://api.v2.walletchat.fun';
    const response = await axios.get(`${baseUrl}/resolve_name/${ensName}`);
    if (response.status === 200) {
        return `The Ethereum address for ${ensName} is ${response.data.address}`;
    } else {
        throw new Error(`Failed to resolve ENS name. Status code: ${response.status}`);
    }
}

// Get Wallet Info using Etherscan
async function getWalletInfo({ address, action }) {
    console.log(`getWalletInfo called with address: ${address}, action: ${action}`);
    const baseUrl = 'https://api.etherscan.io/api';
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const response = await axios.get(baseUrl, {
        params: {
            module: 'account',
            action: action,
            address: address,
            apikey: apiKey
        }
    });
    if (response.status === 200) {
        return `The ${action} for this address: ${address} is ${response.data.result}`;
    } else {
        throw new Error(`Failed to retrieve wallet info. Status code: ${response.status}`);
    }
}
