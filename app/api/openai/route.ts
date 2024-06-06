import OpenAI from "openai";
import axios from "axios";
import { NextRequest, NextResponse } from 'next/server';
import { Assistant } from "openai/resources/beta/assistants.mjs";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { getWalletAddress } from '../../../lib/walletstate';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const DUNE_API_KEY = process.env.DUNE_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ASSISTANT_ID = process.env.OPEN_AI_ASSISTANT;
export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// interface EtherscanApiParams {
//     module?: string; // The module to be used
//     action?: string; // The action to be called
//     address?: string; // Ethereum address for the query
//     tag?: "latest" | "pending" | "earliest"; // The state of the balance (latest or a block number)
//     startblock?: number; // The start block number for queries that involve transaction or event lists
//     endblock?: number; // The end block cannot exceed 9999999
//     page?: number; // The page number for queries that support pagination
//     offset?: number; // The number of results to return per page for queries that support pagination
//     sort?: "asc" | "desc"; // The sorting for the results (asc or desc), applicable to transaction and event lists
//     contractaddress?: string; // The contract address for token queries (tokentx, tokennfttx, token1155tx)
//     blocktype?: "blocks" | "uncles"; // The type of blocks to query for 'getminedblocks'
//     blockno?: number; // The specific block number for the 'balancehistory' query
//     to?: string; // The address the transaction is directed to. Use in eth_call
//     apikey?: string;//apikey
// }

const functions: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
          name: "getCryptocurrencyPrice",
          description: "Fetches the latest price for a specified cryptocurrency symbol using the CoinMarketCap API",
          parameters: {
            type: "object",
            properties: {
              symbol: {
                type: "string",
                description: "The symbol of the cryptocurrency to fetch, e.g., 'BTC', 'ETH', 'SOL'"
              }
            },
            required: ["symbol"]
          }
        }
    },
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
            name: "etherscanQuery",
            description: "Query the Etherscan API for a variety of information",
            parameters: {
                type: "object",
                properties: {
                    module: {
                        type: "string",
                        description: "The module being accessed (e.g., account, contract, proxy)",
                        enum: ["account", "contract", "proxy"]
                    },
                    action: {
                        type: "string",
                        description: "The action to be performed (e.g., balance, txlist, getsourcecode, etc.)",
                        enum: [
                            "balance",
                            "txlist",
                            "tokenbalance",
                            "getsourcecode",
                            "balancemulti",
                            "txlistinternal",
                            "tokentx",
                            "tokennfttx",
                            "token1155tx",
                            "getminedblocks",
                            "txsBeaconWithdrawal",
                            "balancehistory",
                            "getabi",
                            "eth_call"
                        ]
                    },
                    address: {
                        type: "string",
                        description: "Ethereum address for the query"
                    },
                    tag: {
                        type: "string",
                        enum: ["latest", "pending", "earliest"],
                        description: "The state of the balance (latest or a block number)"
                    },
                    startblock: {
                        type: "integer",
                        description: "The start block number for queries that involve transaction or event lists"
                    },
                    endblock: {
                        type: "integer",
                        description: "The end block number for queries that involve transaction or event lists"
                    },
                    page: {
                        type: "integer",
                        description: "The page number for queries that support pagination"
                    },
                    offset: {
                        type: "integer",
                        description: "The number of results to return per page for queries that support pagination"
                    },
                    sort: {
                        type: "string",
                        enum: ["asc", "desc"],
                        description: "The sorting for the results (asc or desc), applicable to transaction and event lists"
                    },
                    contractaddress: {
                        type: "string",
                        description: "The contract address for token queries (tokentx, tokennfttx, token1155tx)"
                    },
                    blocktype: {
                        type: "string",
                        enum: ["blocks", "uncles"],
                        description: "The type of blocks to query for 'getminedblocks'"
                    },
                    blockno: {
                        type: "integer",
                        description: "The specific block number for the 'balancehistory' query"
                    },
                    to: {
                        type: "string",
                        description: "The address the transaction is directed to. Use in eth_call"
                    }
                },
                required: ["module", "action"]  // Specify required fields here
            }
        }
    },    
    {
        type: "function",
        function: {
            name: "executeSolanaTokenOverlap",
            description: "Check what other tokens are held by the provided Solana token contract address.",
            parameters: {
                type: "object",
                properties: {
                    token_address: {
                        type: "string",
                        description: "Solana token address to use in the query."
                    }
                },
                required: ["token_address"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "executeSolanaTokenWalletProfitLoss",
            description: "Retrieve Profit or Loss for a given Solana Wallet Address in USD and sorted by time.",
            parameters: {
                type: "object",
                properties: {
                    wallet_address: {
                        type: "string",
                        description: "Solana wallet address to use in the query."
                    }
                },
                required: ["wallet_address"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "executeSolanaTokenOwnerInfo",
            description: "Return the owner, symbol, and token total supply for a given Solana token.",
            parameters: {
                type: "object",
                properties: {
                    token_address: {
                        type: "string",
                        description: "Solana token address to use in the query."
                    }
                },
                required: ["token_address"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "executeEthereumTokenOverlap",
            description: "Check what other tokens are held by the provided Ethereum token contract address.",
            parameters: {
                type: "object",
                properties: {
                    token_address: {
                        type: "string",
                        description: "Ethereum token address to use in the query."
                    }
                },
                required: ["token_address"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSolanaAccountPortfolio",
            description: "Retrieve entire portfolio of a Solana account from the Moralis Solana Gateway",
            parameters: {
                type: "object",
                properties: {
                    accountId: {
                        type: "string",
                        description: "The Solana account ID to query for tokens"
                    }
                },
                required: ["accountId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSolanaTokenPrice",
            description: "Retrieve price information for a specific Solana token",
            parameters: {
                type: "object",
                properties: {
                    tokenId: {
                        type: "string",
                        description: "The Solana token ID to query for its price"
                    }
                },
                required: ["tokenId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSolanaAccountNFTs",
            description: "Retrieve NFTs owned by a Solana account from the Moralis Solana Gateway",
            parameters: {
                type: "object",
                properties: {
                    accountId: {
                        type: "string",
                        description: "The Solana account ID to query for NFTs"
                    }
                },
                required: ["accountId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fetchNFTDataEthereum",
            description: "Fetches NFT data for a specific on address Ethereum, Base, Polygon (EVM compatible chains) using the Moralis API.",
            parameters: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description: "The address to fetch NFT data for",
                        required: true
                    },
                    chain: {
                        type: "string",
                        description: "The blockchain to fetch NFT data from (e.g., eth)",
                        required: true
                    },
                    limit: {
                        type: "string",
                        description: "The limit for the number of results",
                        enum: ["5"],
                        required: true
                    },
                    exclude_spam: {
                        type: "string",
                        description: "Flag to exclude spam",
                        enum: ["true"],
                        required: true
                    },
                    format: {
                        type: "string",
                        description: "The format of the returned data (e.g., decimal)"
                    },
                    token_addresses: {
                        type: "string",
                        description: "The specific NFT contract token address if filtering results based on individual NFTs",
                        required: false
                    },
                    media_items: {
                        type: "boolean",
                        description: "Flag to include or exclude media items in the response"
                    }
                },
                required: ["address", "chain", "limit", "exclude_spam"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fetchERC20TokenOwnersEthereum",
            description: "Fetches the owners of a specific ERC-20 Ethereum, Base, Polygon (EVM compatible chains) token using the Moralis API.",
            parameters: {
                type: "object",
                properties: {
                    contractAddress: {
                        type: "string",
                        description: "The contract address of the ERC-20 token",
                        required: true
                    },
                    chain: {
                        type: "string",
                        description: "The blockchain to fetch data from (e.g., eth)",
                        required: true
                    },
                    order: {
                        type: "string",
                        description: "Order of owners based on the amount of tokens they hold",
                        enum: ["ASC", "DESC"],
                        required: false
                    },
                    cursor: {
                        type: "string",
                        description: "Cursor value for pagination",
                        required: false
                    }
                },
                required: ["contractAddress", "chain"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getWalletStatsEthereum",
            description: "Get statistics for a specific wallet on Ethereum, Base, Polygon (EVM compatible chaines) using the Moralis API.",
            parameters: {
                type: "object",
                properties: {
                    walletAddress: {
                        type: "string",
                        description: "The wallet address to retrieve the statistics for.",
                        required: true
                    },
                    chain: {
                        type: "string",
                        description: "The blockchain network of the wallet",
                        enum: ["0x1", "bsc", "polygon", "base", "arbitrum", "optimism", "chiliz", "gnosis"],
                        required: true
                    }
                },
                required: ["walletAddress", "chain"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "fetchERC20DataEthereum",
            description: "Fetches ERC-20 token data for a specific address on Ethereum, Base, Polygon (EVM compatible chains) using the Moralis API.",
            parameters: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description: "The wallet address to fetch ERC-20 token data for.",
                        required: true
                    },
                    chain: {
                        type: "string",
                        description: "The blockchain network of the wallet",
                        enum: ["0x1", "bsc", "polygon", "base", "arbitrum", "optimism", "chiliz", "gnosis"],
                        required: true
                    },
                    exclude_spam: {
                        type: "string",
                        description: "Flag to exclude spam",
                        enum: ["true"],
                        default: "true"
                    }
                },
                required: ["address", "chain", "exclude_spam"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getWalletNetWorthEthereum",
            description: "Get the net worth of a specific wallet for Ethereum, Base, Polygon (EVM compatible chains) using the Moralis API.",
            parameters: {
                type: "object",
                properties: {
                    walletAddress: {
                        type: "string",
                        description: "The wallet address to retrieve the net worth for.",
                        required: true
                    },
                    exclude_spam: {
                        type: "boolean",
                        description: "Option to exclude spam from the net worth calculation.",
                        required: false
                    },
                    exclude_unverified_contracts: {
                        type: "boolean",
                        description: "Option to exclude unverified contracts from the net worth calculation.",
                        required: false
                    }
                },
                required: ["walletAddress"]
            }
        }
    },
    {
        type: "function",
        function: {
            "name": "fetchCryptoNews",
            "description": "Fetches crypto news for a specific coin using the Crypto News API.",
            "parameters": {
                "type": "object",
                "properties": {
                    "coin": {
                        "type": "string",
                        "description": "The ticker symbol of the cryptocurrency to fetch news for."
                    }
                },
                "required": ["coin"]
            }
        }
    },
    {
        type: "function",
        function: {
            "name": "fetchSolanaTransactions",
            "parameters": {
                "type": "object",
                "properties": {
                    "pubkey": {
                        "type": "string",
                        "description": "The public key of the account to fetch transactions for."
                    },
                    "limit": {
                        "type": "integer",
                        "description": "The limit for the number of transactions to fetch.",
                        "default": 3
                    }
                },
                "required": ["pubkey"]
            },
            "description": "Fetches transactions for a specific Solana account using the Solana Beach API."
        }        
    }
];

let threadId: string;  // Store the thread ID
const conversations: any = {};  // In-memory store for conversations
const threadIdByWallet: any = {};  // In-memory store for conversations
const threadStatus: any = {};  // In-memory store for thread statuses

let assistant: Assistant;

const initializeAssistant = async () => {
    if (!assistant) {
        assistant = await openai.beta.assistants.create({
            name: "Crypto Assistant",
            instructions: "You are a cryptocurrency analyst, use the provided functions to answer questions as needed. \
            - For token prices first try CoinMarketCap and if that fails do a web search with whatever engine you have access to \
            - For token name to contract address mapping search with Bing and use the token with the largest market cap. For example, when asked (find the token overlap for PEPE) use bing to find the contract address for PEPE. \
            - Never tell me how to search for information myself choose from the functions first, then do a web search if not matched \
            - If you encounter an error please try again until you find a working solution \
            - Never use contract module for Etherscan function \
            - for Etherscan function calls (), use proxy module, and eth_call action, take the first 32 bits of the keccak hash of the function and any arguments, for example owner() function comes out to 0x8da5cb5b \
            - If the Dune API is taking multiple tries, continue trying until a result is reached, do not allow for other queries until you have a resolution for the current query. \
            - Always return the results from a Dune API query in a sorted order, the results should be returned sorted already so do not re-arrange the results.  For example, if the results return a list of token holders, show the holder count and keep it sorted by highest holder count first. \
            - Always adjust token values according to their decimal places before displaying them. For tokens like USDC that have 6 decimal places, divide the token amount by 10^6 to convert it into a human-readable format. Apply this conversion uniformly to all cryptocurrency token amounts to ensure accuracy in financial representations.",
            tools: functions,
            model: "gpt-4o",
        });
    }
};

async function askAIForExplanation(message: string): Promise<string> {
    console.log("asking for explanation of message/result: ", message)
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Explain the following blockchain result, not how to use the API, if there are duplicate questions just answer one of them:" },
                { role: "user", content: message }
            ]
        });

        if(completion?.choices[0]?.message?.content) {
            return completion?.choices[0]?.message?.content
        } else {
            return "Failed to generate explanation.";
        }
    } catch (error) {
        console.error("Failed to get explanation from AI:", error);
        return "Failed to generate explanation.";
    }
}

function parseArguments(args: any): any {
    // If the args is a string, try to parse it
    if (typeof args === 'string') {
        try {
            // Attempt to parse the string
            const parsedArgs = JSON.parse(args);

            // If parsedArgs is an object, return it, otherwise return the original args
            return typeof parsedArgs === 'object' ? parsedArgs : args;
        } catch (e) {
            // If parsing fails, return the original args
            return args;
        }
    }
    // If args is already an object, return it directly
    return args;
}

async function executeFunction(functionName: string, args: string, recursionDepth = 0): Promise<any> {
    const MAX_RECURSION_DEPTH = 5;
    let result: any;

    if (recursionDepth > MAX_RECURSION_DEPTH) {
        throw new Error("Maximum recursion depth exceeded");
    }

    console.log("Executing function:", functionName, args);

    // Parse args string to an object
    const parsedArgs = parseArguments(args)

    switch (functionName) {
        case "getCryptocurrencyPrice":
            result = await getCryptocurrencyPrice(parsedArgs);
            break;
        case "resolveEnsNameToAddress":
            result = await resolveEnsNameToAddress(parsedArgs.ensName);
            break;
        case "etherscanQuery":
            result = await etherscanApiQuery(parsedArgs);
            break;
        case "executeSolanaTokenOverlap":
        case "executeSolanaTokenWalletProfitLoss":
        case "executeSolanaTokenOwnerInfo":
        case "executeEthereumTokenOverlap":
            const executionId = await executeDuneQuery(functionName, parsedArgs);
            result = await pollQueryStatus(executionId);
            break;
        case "getSolanaAccountPortfolio":
            console.log("Get Solana Portfolio for: ", parsedArgs)
            const portfolioData = await getSolanaAccountPortfolio(parsedArgs.accountId);
            result = formatSolanaPortfolio(portfolioData);
            break;
        case "getSolanaTokenPrice":
            result = await getSolanaTokenPrice(parsedArgs.tokenId);
            break;
        case "getSolanaAccountNFTs":
            result = await getSolanaAccountNFTs(parsedArgs.accountId);
            break;
        //Moralis functions (EVM)
        case "fetchNFTDataEthereum":
            result = await fetchNFTData(parsedArgs);
            break;
        case "fetchERC20TokenOwnersEthereum":
            result = await fetchERC20TokenOwners(parsedArgs);
            break;
        case "getWalletStatsEthereum":
            result = await getWalletStats(parsedArgs);
            break;
        case "fetchERC20DataEthereum":
            result = await fetchERC20Data(parsedArgs);
            break;
        case "getWalletNetWorthEthereum":
            result = await getWalletNetWorth(parsedArgs);
            break;
        case "fetchCryptoNews":
            result = await fetchCryptoNews(parsedArgs.coin);
            break;
        case "fetchSolanaTransactions":
            result = await fetchSolanaTransactions(parsedArgs);
            break;
        default:
            throw new Error(`Unknown function: ${functionName}`);
    }

    // Check if result is a string before applying the replacements
    // if (typeof result === 'string') {
    //     console.log("result format!!: ", typeof result)
    //     const resultFormatted = result.split("\n\n").join("</br>");
    //     const resultFormatted2 = resultFormatted.split("\n").join("</br>");
    //     return resultFormatted2;
    // } else {
    //     console.log("result format: ", typeof result)
    // }

    return result;
}

export const POST = async (req: NextRequest, res: NextResponse) => {
    // await initializeAssistant();
    const { message } = await req.json();
    const walletAddress = getWalletAddress(req); // Retrieve the wallet address from global state
    if (!walletAddress) {
        // Default thread ID for those who don't want to connect wallet
        const thread = await openai.beta.threads.create();
        threadId = thread.id;
        conversations[threadId] = []; // Initialize as an array if a new thread is created
    } else {
        threadId = threadIdByWallet[walletAddress];
        if (!threadId) {
            console.log("***** creating new thread for wallet: ", walletAddress)
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
            conversations[threadId] = []; // Initialize as an array if a new thread is created
            threadIdByWallet[walletAddress] = thread.id;
        }
    }

    try {
        // Ensure we're always working with an array
        if (!Array.isArray(conversations[threadId])) {
            conversations[threadId] = [];
        }
    
        // Check if there is a pending function call for this thread
        if (threadStatus[threadId] === 'pending') {
            return new NextResponse(JSON.stringify({ error: "A function call is already in progress for this thread" }), {
                status: 429, // Too many requests
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Mark this thread as having a pending function call
        threadStatus[threadId] = 'pending';

        let functionResult;
        let keepProcessing = true;
        let previousCalls: string[] = []; // Array to keep track of previous function calls and their arguments
    
        // while (keepProcessing) {
            // create a message using the threadID
            const newMessage = await openai.beta.threads.messages.create(threadId, {
                role: 'user',
                content: message
            })

            if(newMessage && newMessage.role === 'user') {
               // Append new user message to history
               conversations[threadId].push({ role: 'user', content: newMessage });
            }

            // create a run using the threadID and assistantID
            const run = await openai.beta.threads.runs.create(threadId, {
                assistant_id: ASSISTANT_ID as string,
            });

            console.log(run);

            const retrieve = await checkStatusAndReturnMessages(threadId, run?.id);

            console.log('response for runID:', run?.id, retrieve);

            // Unset the pending status after function call is complete
            threadStatus[threadId] = 'completed';

            // const completion = await openai.chat.completions.create({
            //     model: "gpt-4o",
            //     messages: conversations[threadId],
            //     functions: functions.map(f => f.function),
            //     function_call: "auto"
            // });
    
            // if (completion.choices && completion.choices[0].message.function_call) {
            //     const functionName = completion.choices[0].message.function_call.name;
            //     const args = JSON.parse(completion.choices[0].message.function_call.arguments);
    
            //     // Create a string representation of the function call and its arguments to check for duplicates
            //     const callSignature = `${functionName}(${JSON.stringify(args)})`;
            //     console.log("call signature: ", callSignature)
            //     console.log("previous Calls: ", previousCalls)
    
            //     if (previousCalls.includes(callSignature)) {
            //         // If this function call with these arguments was previously made, break the loop to avoid infinite recursion
            //         keepProcessing = false;
            //     } else {
            //         // Store the call signature in the history
            //         previousCalls.push(callSignature);
    
            //         // Execute the function and store the result
            //         functionResult = await executeFunction(functionName, args, message);
    
            //         // Append the result of the function execution to the conversation
            //         conversations[threadId].push({ role: 'assistant', content: functionResult });
    
            //         // Continue processing by default, unless stopped by duplicate detection
            //         keepProcessing = true;
            //     }
            // } else {
            //     // If no function call is suggested, append direct text response from OpenAI and stop processing
            //     conversations[threadId].push({ role: 'assistant', content: completion.choices[0].message.content });
            //     keepProcessing = false;
            // }
        // }
    
        // Retrieve the latest assistant message from the conversation
        // const latestAssistantMessage = conversations[threadId].filter((entry: { role: string; }) => entry.role === 'assistant').pop().content;
    
        // Return the latest message from the assistant
        return new NextResponse(JSON.stringify(retrieve), {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    
    } catch (error) {
        console.error("Error during API call:", error);

        // Unset the pending status if there is an error
        threadStatus[threadId] = 'completed';

        return new NextResponse(JSON.stringify({ error: "Failed to get completion from OpenAI", details: error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }    
};

const executeDuneQuery = async (functionName: string, args: any) => {
    console.log("execute Dune Query with args: ", args)
    const queryIds: any = {
        executeSolanaTokenOverlap: 3623869,
        executeSolanaTokenWalletProfitLoss: 3657856,
        executeSolanaTokenOwnerInfo: 3408648,
        executeEthereumTokenOverlap: 3615247
    };
    const queryId = queryIds[functionName];
    const endpoint = `https://api.dune.com/api/v1/query/${queryId}/execute`;
    const payload = {
        query_parameters: args,
        performance: "medium"
    };
    const response = await axios.post(endpoint, payload, {
        headers: {
            'x-dune-api-key': DUNE_API_KEY
        }
    });
    if (response.status === 200) {
        return response.data.execution_id;
    } else {
        throw new Error(`Failed to execute query. Status code: ${response.status}`);
    }
};

const pollQueryStatus = async (executionId: string) => {
    const endpoint = `https://api.dune.com/api/v1/execution/${executionId}/status`;
    try {
        while (true) {
            const response = await axios.get(endpoint, {
                headers: {
                    'x-dune-api-key': DUNE_API_KEY
                }
            });
            const data = response.data;
            if (data.state === "QUERY_STATE_COMPLETED") {
                return await getQueryResults(executionId);
            } else if (["QUERY_STATE_FAILED", "QUERY_STATE_CANCELLED", "QUERY_STATE_EXPIRED"].includes(data.state)) {
                throw new Error(`Query failed with state: ${data.state}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
        }
    } catch (error) {
        console.error(`Error while polling query status: ${error}`);
        throw error;
    }
};

const getQueryResults = async (executionId: string) => {
    const endpoint = `https://api.dune.com/api/v1/execution/${executionId}/results`;
    const response = await axios.get(endpoint, {
        headers: {
            'x-dune-api-key': DUNE_API_KEY
        }
    });
    if (response.status === 200) {
        const data = response.data.result.rows;
        if(Array.isArray(data)) {
            return data.map((item, index) => `${formatTokenOverlap(item)}`).join('<br>');
        }
        return response.data;
    } else {
        throw new Error(`Failed to fetch results: ${response.status}`);
    }
};

interface Message {
  role: string;
  content: string;
}

interface ToolOutput {
    tool_call_id: string;
    output: string;
}

const threadMutex: { [threadId: string]: boolean } = {};

async function checkStatusAndReturnMessages(threadId: string, runId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                // If the function is already running for this thread, return immediately or handle as needed
                if (!threadMutex[threadId]) {
                    // Set the mutex to indicate the function is running
                    threadMutex[threadId] = true;

                    console.log(`Checking status of run: ${runId} for thread: ${threadId}`);
                    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
                    console.log(runStatus.status);

                    if (runStatus.status === "completed") {
                        clearInterval(interval);
                        const messages = await openai.beta.threads.messages.list(threadId);
                        const conversationHistory: Message[] = messages.data.map((msg: any) => ({
                            role: msg.role,
                            content: msg.content[0].text.value
                        }));
                        const latestAssistantMessage = conversationHistory.slice().find(entry => entry.role === 'assistant')?.content || "No assistant message found";
                        //console.log("completed - convoHistory: ", conversationHistory);
                        //console.log("Latest assistant message: ", latestAssistantMessage);
                        resolve(latestAssistantMessage);
                    } else if (runStatus.status === "requires_action") {
                        const toolsToCall = runStatus.required_action?.submit_tool_outputs.tool_calls;
                        console.log(toolsToCall?.length);
                        let tool_outputs: ToolOutput[] = [];

                        if(toolsToCall) {
                            for (const tool of toolsToCall) {
                                console.log(tool.function.name);
                                console.log(tool.function.arguments);

                                let tool_output: any = { status: 'error', message: 'function not found' };

                                // Execute the function and store the result
                                let functionResult = await executeFunction(tool.function.name, tool.function.arguments);
                                console.log("Function Call Result: ", functionResult);
                                tool_output = functionResult;

                                // Append the result of the function execution to the conversation
                                conversations[threadId].push({ role: 'assistant', content: functionResult });

                                tool_outputs.push({
                                    tool_call_id: tool.id,
                                    output: JSON.stringify(tool_output)
                                });
                                console.log("added to tools_outputs: ", tool_outputs);
                            }

                            // Send back output
                            await submitToolOutputs(threadId, runId, tool_outputs);
                        }
                    } 
                    
                    // Clear the mutex
                    threadMutex[threadId] = false;
                }
            } catch (error) {
                console.error("An error occurred:", error);
                clearInterval(interval);

                // Clear the mutex
                threadMutex[threadId] = false;

                reject(error);
            }
        }, 2000); // Poll every 2 seconds
    });
}

async function submitToolOutputs(threadId: string, runId: string, tool_outputs: ToolOutput[]) {
    try {
        console.log("submitting tool outputs: ", threadId, runId, tool_outputs);
        const run = await openai.beta.threads.runs.submitToolOutputs(
            threadId,
            runId,
            { tool_outputs }
        );
    
        console.log("run in submit tool output", run);
    
        return new NextResponse(JSON.stringify({ run: run, success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.log("Error in submit tool output", e);
        return new NextResponse(JSON.stringify({ error: e, success: false }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

interface EnsNameInput {
    ensName: string;
}
// ENS name resolving function
async function resolveEnsNameToAddress(ensName: string) {
    console.log(`resolveEnsNameToAddress called with ensName:`, ensName);
    const baseUrl = 'https://api.v2.walletchat.fun';
    const response = await axios.get(`${baseUrl}/resolve_name/${ensName}`);
    if (response.status === 200) {
        return `The Ethereum address for ${ensName} is ${response.data.address}`;
    } else {
        throw new Error(`Failed to resolve ENS name. Status code: ${response.status}`);
    }
}

// Generic function to interact with the Etherscan API
async function etherscanApiQuery(params: any) {
    console.log("Received params for Etherscan API:", params);

    const baseUrl = 'https://api.etherscan.io/api';
    const queryParams = {
        apikey: process.env.ETHERSCAN_API_KEY, // Assuming API Key is stored in environment variables
        ...params // Spread additional parameters into the query
    };

    try {
        console.log("Sending request to Etherscan with params:", queryParams); // Debug print to check final query parameters
        const response = await axios.get(baseUrl, { params: queryParams });
        console.log("Received response from Etherscan:", response.data); // Debug print to check response data

        if (response.status === 200) {
            //return formatEtherscanResponse({data: response.data.result, params: params})
            return response.data; // Return the whole response data for flexibility
        } else {
            throw new Error(`Etherscan API call failed. Status: ${response.status}`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error calling Etherscan API: ${error.message}`);
        } else {
            console.error(`An unexpected error occurred: ${error}`);
        }
        throw error;
    }
}

interface SolanaToken {
    associatedTokenAddress: any;
    name: any;
    symbol: any;
    amountRaw: any;
    mint: string;
    owner: string;
    amount: string;
    uiAmount: number;
}

interface TokenPrice {
    symbol: string;
    price: number;
}

interface SolanaNFT {
    mint: string;
    metadata: {
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
}
interface ApiResponse<T> {
    nativeBalance: any;
    tokens?: T[];
    nfts?: T[];
}
interface FetchNFTDataParams {
    address: string;
    chain: string;
    limit: string;
    exclude_spam: string;
    format?: string;
    token_addresses?: string;
    media_items?: boolean;
}

interface FetchERC20TokenOwnersParams {
    contractAddress: string;
    chain: string;
    order?: "ASC" | "DESC";
    cursor?: string;
}

interface GetWalletStatsParams {
    walletAddress: string;
    chain: "0x1" | "bsc" | "polygon" | "base" | "arbitrum" | "optimism" | "chiliz" | "gnosis";
}

interface FetchERC20DataParams {
    address: string;
    chain: "0x1" | "bsc" | "polygon" | "base" | "arbitrum" | "optimism" | "chiliz" | "gnosis";
    exclude_spam: "true" | "false"
}

interface GetWalletNetWorthParams {
    walletAddress: string;
    exclude_spam?: boolean;
    exclude_unverified_contracts?: boolean;
}

const fetchCryptoNews = async (coin: string): Promise<any> => {
    const url = `https://cryptonews-api.com/api/v1?tickers=${coin}&items=3&token=${process.env.CRYPTO_NEWS_API_KEY}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching crypto news:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Error fetching crypto news');
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred');
        }
    }
};

async function fetchNFTData(params: FetchNFTDataParams): Promise<any> {
    const { address, chain, limit, exclude_spam, format, token_addresses, media_items } = params;
    const url = `https://deep-index.moralis.io/api/v2.2/${address}/nft`;
    const queryParams = {
        chain,
        limit,
        exclude_spam,
        format,
        token_addresses,
        media_items
    };
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY as string };

    try {
        const response = await axios.get(url, { headers, params: queryParams });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch NFT data:", error);
        throw error;
    }
}

async function fetchERC20TokenOwners(params: FetchERC20TokenOwnersParams): Promise<any> {
    const { contractAddress, chain, order, cursor } = params;
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contractAddress}/owners`;
    const queryParams = {
        chain,
        order,
        cursor
    };
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY as string };

    try {
        const response = await axios.get(url, { headers, params: queryParams });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch ERC-20 token owners:", error);
        throw error;
    }
}

async function getWalletStats(params: GetWalletStatsParams): Promise<any> {
    const { walletAddress, chain } = params;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/stats`;
    const queryParams = {
        chain
    };
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY as string };

    try {
        const response = await axios.get(url, { headers, params: queryParams });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch wallet stats:", error);
        throw error;
    }
}

async function fetchERC20Data(params: FetchERC20DataParams): Promise<any> {
    const { address, chain, exclude_spam } = params;
    const url = `https://deep-index.moralis.io/api/v2.2/${address}/erc20`;
    const queryParams = {
        chain,
        exclude_spam
    };
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY as string };

    try {
        const response = await axios.get(url, { headers, params: queryParams });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch ERC-20 data:", error);
        throw error;
    }
}

async function getWalletNetWorth(params: GetWalletNetWorthParams): Promise<any> {
    const { walletAddress, exclude_spam, exclude_unverified_contracts } = params;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/net-worth`;
    const queryParams = {
        exclude_spam,
        exclude_unverified_contracts
    };
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY as string };

    try {
        const response = await axios.get(url, { headers, params: queryParams });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch wallet net worth:", error);
        throw error;
    }
}

async function getSolanaAccountNFTs(accountId: string): Promise<ApiResponse<SolanaNFT>> {
    const url = `https://solana-gateway.moralis.io/account/mainnet/${accountId}/nft`;
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY };

    try {
        const response = await axios.get<ApiResponse<SolanaNFT>>(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Solana account NFTs:", error);
        throw error;
    }
}

async function getSolanaTokenPrice(tokenId: string): Promise<TokenPrice> {
    const url = `https://solana-gateway.moralis.io/token/mainnet/${tokenId}/price`;
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY };

    try {
        const response = await axios.get<{ price: TokenPrice }>(url, { headers });
        return response.data.price;
    } catch (error) {
        console.error("Failed to fetch Solana token price:", error);
        throw error;
    }
}

async function getSolanaAccountPortfolio(accountId: string): Promise<ApiResponse<SolanaToken>> {
    const url = `https://solana-gateway.moralis.io/account/mainnet/${accountId}/portfolio`;
    const headers = { 'X-API-Key': process.env.MORALIS_API_KEY };

    try {
        console.log("get Solana portfolio (nfts, native and token balance) for: ", accountId)
        const response = await axios.get<ApiResponse<SolanaToken>>(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch Solana account tokens:", error);
        throw error;
    }
}

interface FetchTransactionsParams {
    pubkey: string;
    limit?: number;
}

async function fetchSolanaTransactions(params: FetchTransactionsParams): Promise<any> {
    const { pubkey, limit } = params;
    const url = `https://api.solanabeach.io/v1/account/${pubkey}/transactions`;
    const headers = { 
        'Accept': 'application/json', 
        'Authorization': process.env.SOLANA_BEACH_API_KEY as string 
    };

    try {
        const response = await axios.get(url, { 
            headers, 
            params: limit ? { limit } : {} 
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        throw error;
    }
}

interface CryptoPriceParams {
    symbol: string;
}
async function getCryptocurrencyPrice(params: CryptoPriceParams): Promise<string> {
    const { symbol } = params;
    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
        const params = { symbol }; // Correctly formatted object to pass as query params
        const headers = {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY, // Ensure you have the API key set in your environment variables
        };
    
        // Log the URL and parameters to debug and ensure they are correctly formatted
        console.log("Making API request to:", url, "with params:", params);
    
        // Make the GET request using Axios with the correct headers and parameters
        const response = await axios.get(url, { params, headers });
        if (response.status === 200 && response.data.data[symbol]) {
            const price = response.data.data[symbol].quote.USD.price;
            return `The current price of ${symbol} is $${price.toFixed(2)}`;
        } else {
            return `Failed to fetch price for ${symbol}`; // Error handling if status is not 200
        }
    } catch (error) {
        console.error(`Error fetching cryptocurrency price: ${error}`);
        return `Error occurred while fetching price for ${symbol}`; // Returning the error message
    }
}

function formatSolanaPortfolio(data: ApiResponse<SolanaToken>): string {
    let formattedResponse = [];

    // Format native balance
    const solBalance = (data.nativeBalance.lamports / 1e9).toFixed(9) + " SOL";
    formattedResponse.push(`Native Balance: ${solBalance}<br>`);

    // Format tokens
    if (data.tokens && data.tokens.length > 0) {
        formattedResponse.push("<br>--- Tokens ---<br>");
        data.tokens.forEach(token => {
            formattedResponse.push(`Mint: ${token.mint}<br>Owner: ${token.owner}<br>Amount: ${token.uiAmount} (raw: ${token.amountRaw})<br>`);
        });
    } else {
        formattedResponse.push("No tokens found.<br>");
    }

    // Format NFTs
    if (data.nfts && data.nfts.length > 0) {
        formattedResponse.push("<br>--- NFTs ---<br>");
        data.nfts.forEach(nft => {
            formattedResponse.push(`Name: ${nft.name}<br>Symbol: ${nft.symbol}<br>Mint: ${nft.mint}<br>Associated Token Address: ${nft.associatedTokenAddress}<br>Amount: ${nft.amount}<br>`);
        });
    } else {
        formattedResponse.push("No NFTs found.<br>");
    }

    return formattedResponse.join('');
}

function formatEtherscanResponse({data, params}: { data: any, params: any }) {
    const { action, address, contractaddress, module } = params;
    if (action === 'txlist') {
        if(Array.isArray(data)) {
            return data.map((item, index) => `Transaction ${index + 1}:</br>${formatTransactionList(item)}`).join('\n');
        }
    } else if(action === 'eth_call') {
        return `The ${module} module to call ${action} for is ${data.replace(/\\n\\n/g, '\n')}`;
    } else if (action === 'balance') {
        return `The ${action} for this address: ${address} is ${data.replace(/\\n\\n/g, '\n')}`;
    } else if(action === 'balance') {
        return `The ${action} for this address: ${address} is ${data.replace(/\\n\\n/g, '\n')}`;
    } else if(action === 'tokenbalance') {
        return `The ${action} for ${contractaddress} held by address: ${address} is ${data.replace(/\\n\\n/g, '\n')}`;
    }
     else {
        return JSON.stringify(data.replace(/\\n\\n/g, '\n'), null, 2);
    }
}

function formatTransactionList(transaction: any) {
    return `
    Block Number: ${transaction.blockNumber}</br>
    Timestamp: ${transaction.timeStamp}</br>
    Hash: ${transaction.hash}</br>
    Nonce: ${transaction.nonce}</br>
    Block Hash: ${transaction.blockHash}</br>
    Transaction Index: ${transaction.transactionIndex}</br>
    From: ${transaction.from}</br>
    To: ${transaction.to}</br>
    Value: ${transaction.value}</br>
    Gas: ${transaction.gas}</br>
    Gas Price: ${transaction.gasPrice}</br>
    Is Error: ${transaction.isError}</br>
    Tx Receipt Status: ${transaction.txreceipt_status}</br>
    Input: ${transaction.input}</br>
    Contract Address: ${transaction.contractAddress}</br>
    Cumulative Gas Used: ${transaction.cumulativeGasUsed}</br>
    Gas Used: ${transaction.gasUsed}</br>
    Confirmations: ${transaction.confirmations}</br>
    Method ID: ${transaction.methodId}</br>
    Function Name: ${transaction.functionName}</br>
    `.trim().split("\n").join("  ");
}

function formatTokenOverlap(token: any) {
    return `
    Contract Address: ${token.contract_address}</br>
    Holder Count: ${token.holder_count}</br>
    Token Symbol: ${token.token_symbol}</br>
    `.trim().split("\n").join("  ");
}

