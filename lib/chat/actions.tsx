import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Purchase
} from '@/components/crypto'
import { z } from 'zod'
import { EventsSkeleton } from '@/components/crypto/events-skeleton'
import { Events } from '@/components/crypto/events'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/crypto/message'
import { Chat, Message } from '@/lib/types'
import axios from 'axios'
import { PriceSkeleton } from '@/components/crypto/price-skeleton'
import { Price } from '@/components/crypto/price'
import { PricesSkeleton } from '@/components/crypto/prices-skeleton'
import { Prices } from '@/components/crypto/prices'
import { StatsSkeleton } from '@/components/crypto/stats-skeleton'
import { Stats } from '@/components/crypto/stats'
import SolanaToken from '@/components/crypto/solana-tokens'
import SolanaTokenSkeleton from '@/components/crypto/solana-token-skeleton'
import SolanaNFTs from '@/components/crypto/solana-nfts'
import SolanaPortfolio from '@/components/crypto/solana-portfolio'
import TokenOverlap from '@/components/crypto/token-overlap'

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-4o-2024-05-13'),
    initial: <SpinnerMessage />,
    system: `\
    You are a cryptocurrency analyst conversation bot, use the provided functions to answer questions as needed.
    You and the user can discuss cryptocurrency prices and the user can adjust the amount of crypto they want to buy, or place an order, in the UI.
    
    Messages inside [] means that it's a UI element or a user event. For example:
    - "[Price of BTC = 696969]" means that an interface of the cryptocurrency price of BTC is shown to the user.
    - "[Stats of BTC]" means that the interface of the cryptocurrency stats of BTC is shown to the user.
    - "[User has changed the amount of SOL to 10]" means that the user has changed the amount of SOL to 10 in the UI.
    - For token name to contract address mapping search with Bing and use the token with the largest market cap. For example, when asked (find the token overlap for PEPE) use bing to find the contract address for PEPE.
    - Never tell me how to search for information myself choose from the functions first, then do a web search if not matched
    - API request timeout is 360 seconds 
    - If you encounter an error please try again until you find a working solution
    - Never use contract module for Etherscan function
    - for Etherscan function calls (), use proxy module, and eth_call action, take the first 32 bits of the keccak hash of the function and any arguments, for example owner() function comes out to 0x8da5cb5b
    - If the Dune API is taking multiple tries, continue trying until a result is reached, do not allow for other queries until you have a resolution for the current query. 
    - Always return the results from a Dune API query in a sorted order, the results should be returned sorted already so do not re-arrange the results.  For example, if the results return a list of token holders, show the holder count and keep it sorted by highest holder count first.
    - Always adjust token values according to their decimal places before displaying them. For tokens like USDC that have 6 decimal places, divide the token amount by 10^6 to convert it into a human-readable format. Apply this conversion uniformly to all cryptocurrency token amounts to ensure accuracy in financial representations.

    If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
    If the user just wants the price, call \`show_stock_price\` to show the price. if that fails do a web search with whatever engine you have access to
    If the user wants the market cap or stats of a given cryptocurrency, call \`get_crypto_stats\` to show the stats.
    If you want to show trending stocks, call \`list_stocks\`.
    If you want to show events, call \`get_events\`.
    If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.
    
    Besides that, you can also chat with users and do some calculations if needed.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      get_crypto_price: {
        description:
          "Get the current price of a given cryptocurrency. Use this to show the price to the user.",
        parameters: z.object({
          symbol: z
            .string()
            .describe("The name or symbol of the cryptocurrency. e.g. BTC/ETH/SOL.")
        }),
        generate: async function* ({ symbol }: { symbol: string; }) {
          yield (
            <BotCard>
              <PriceSkeleton />
            </BotCard>
          );

          const result = await getCryptocurrencyPrice({ symbol });
          const price = Number(result.price);
          const delta = Number(result.delta);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_crypto_price',
                    toolCallId,
                    args: { symbol }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_crypto_price',
                    toolCallId,
                    result: `[price of ${symbol} = ${price}]`
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Price symbol={symbol} price={price} delta={delta} />
            </BotCard>
          );
        },
      },
      get_crypto_stats: {
        description: "Get the market stats of a given cryptocurrency. Use this to show the stats to the user.",
        parameters: z.object({
          slug: z.string().describe("The name of the cryptocurrency in lowercase e.g, bitboin/solana/ethereum")
        }),
        generate: async function* ({ slug }: { slug: string }) {
            yield (
              <BotCard>
                <StatsSkeleton />
              </BotCard>
            )

            const url = new URL("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail");

            // set the query params which are required
            url.searchParams.append("slug", slug);
            url.searchParams.append("limit", "1");
            url.searchParams.append("sortBy", "market_cap");

            const response = await fetch(url, {
              //@ts-ignore
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
              }
            });

            if (!response.ok) {
                return <BotMessage content="Crypto not found!" />;
            }

            const toolCallId = nanoid()

            const res = await response.json() as {
                data: {
                id: number;
                name: string;
                symbol: string;
                volume: number;
                volumeChangePercentage24h: number;
                statistics: {
                    rank: number;
                    totalSupply: number;
                    marketCap: number;
                    marketCapDominance: number;
                },
                };
            };

            const data = res.data;
            const stats = res.data.statistics;

            const marketStats = {
                name: data.name,
                volume: data.volume,
                volumeChangePercentage24h: data.volumeChangePercentage24h,
                rank: stats.rank,
                marketCap: stats.marketCap,
                totalSupply: stats.totalSupply,
                dominance: stats.marketCapDominance,
            };

            await sleep(1000);

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'get_crypto_stats',
                      toolCallId,
                      args: { slug }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'get_crypto_stats',
                      toolCallId,
                      result: `[Stats of ${slug}]`
                    }
                  ]
                }
              ]
            })

            return (
                <BotCard>
                  <Stats {...marketStats} />
                </BotCard>
            );
        }
      },
      listStocks: {
        description: 'List three imaginary crypto that are trending. Use this to trending crypto to the user',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the crypto'),
              price: z.number().describe('The price of the crypto'),
              delta: z.number().describe('The change in price of the crypto')
            })
          )
        }),
        generate: async function* ({ stocks }) {
          yield (
            <BotCard>
              <PricesSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listStocks',
                    toolCallId,
                    args: { stocks }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listStocks',
                    toolCallId,
                    result: stocks
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Prices props={stocks} />
            </BotCard>
          )
        }
      },
      resolve_ensName_toAddress: {
        description: 'Get the wallet address of a given ENS name. Use this to show the user the address of a given ENS name.',
        parameters: z.object({
          ensName: z.string().describe("The ENS name of a user e.g, vitalik.eth/mgoesdistance.eth/cyberkevin.eth")
        }),

        generate: async function* ({ ensName } : { ensName: string }) {
          
          const result = await resolveEnsNameToAddress(ensName);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'resolve_ensName_toAddress',
                    toolCallId,
                    args: { ensName }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'resolve_ensName_toAddress',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotMessage content={result} />
          ) 
        } 
      },
      etherscan_api_query: {
        description: 'Generic function to interact with the Etherscan API. Use this to query the etherscan API.',
        parameters: z.object({
          params: z.string().describe("The ENS name of a user e.g, vitalik.eth/mgoesdistance.eth/cyberkevin.eth")
        }),

        generate: async function* ({ params } : { params: string }) {
          
          const result = await etherscanApiQuery(params);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'etherscan_api_query',
                    toolCallId,
                    args: { params }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'etherscan_api_query',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotMessage content={result} />
          ) 
        } 
      },
      get_ethereumToken_overlap: {
        description: 'Get the ethereum token overlap of a given ethereum account. Use this to show the user the ethereum token overlap of a given ethereum account.',
        parameters: z.object({
          accountId: z.string().describe("The address of the token or the name of the token on ethereum e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF/PEPE")
        }),

        generate: async function* ({ accountId } : { accountId: string }) {
          yield (
            <BotCard>
              <SolanaTokenSkeleton />
            </BotCard>
          )
          console.log("here at the moment")
          
          const executionId = await executeDuneQuery("executeEthereumTokenOverlap", accountId);
          console.log("i got called", executionId);
          const result = await pollQueryStatus(executionId)
          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_ethereumToken_overlap',
                    toolCallId,
                    args: { accountId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_ethereumToken_overlap',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <TokenOverlap tokens={result.tokens} address={accountId} chain="Ethereum" />
            </BotCard>
          ) 
        }
      },
      get_solanaToken_overlap: {
        description: 'Get the solana token overlap of a given solana account. Use this to show the user the solana token overlap of a given solana account.',
        parameters: z.object({
          accountId: z.string().describe("The address of the token or name of the token on solana e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF")
        }),

        generate: async function* ({ accountId } : { accountId: string }) {
          yield (
            <BotCard>
              <SolanaTokenSkeleton />
            </BotCard>
          )
          
          const executionId = await executeDuneQuery("executeSolanaTokenOverlap", accountId);
          const result = await pollQueryStatus(executionId)
          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_solanaToken_overlap',
                    toolCallId,
                    args: { accountId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_solanaToken_overlap',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <TokenOverlap tokens={result.tokens} address={accountId} chain="Solana" />
            </BotCard>
          ) 
        }
      },
      get_solanaAccount_portfolio: {
        description: 'Get the portfolio of a given solana account. Use this to show the user the portfolio of a given solana account.',
        parameters: z.object({
          accountId: z.string().describe("The solana address of the user e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF")
        }),

        generate: async function* ({ accountId } : { accountId: string }) {
          yield (
            <BotCard>
              <SolanaTokenSkeleton />
            </BotCard>
          )
          
          const result = await getSolanaAccountPortfolio(accountId);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_solanaAccount_portfolio',
                    toolCallId,
                    args: { accountId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_solanaAccount_portfolio',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <SolanaPortfolio tokens={result.tokens} nfts={result.nfts} balance={result.nativeBalance.solana} address={accountId} />
            </BotCard>
          ) 
        } 
      },
      get_solanaAccount_tokens: {
        description: 'Get the tokens on a given solana account. Use this to show the user the tokens on a given solana account.',
        parameters: z.object({
          accountId: z.string().describe("The solana address of the user e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF")
        }),

        generate: async function* ({ accountId } : { accountId: string }) {
          yield (
            <BotCard>
              <SolanaTokenSkeleton />
            </BotCard>
          )

          const result = await getSolanaAccountTokens(accountId);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_solanaAccount_tokens',
                    toolCallId,
                    args: { accountId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_solanaAccount_tokens',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <SolanaToken tokens={result} address={accountId} />
            </BotCard>
          ) 
        } 
      },
      get_solanaToken_price: {
        description: 'Get the price of a given solana token. Use this to show the user the price of a given solana token.',
        parameters: z.object({
          tokenId: z.string().describe("The address of th solana token e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF")
        }),

        generate: async function* ({ tokenId }: { tokenId: string; }) {
    
          const result = await getSolanaTokenPrice(tokenId);
          console.log(result)

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_solanaToken_price',
                    toolCallId,
                    args: { tokenId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_solanaToken_price',
                    toolCallId,
                    result: `[price of ${tokenId} = ${result.price}]`
                  }
                ]
              }
            ]
          })

          return (
            <BotMessage content={JSON.stringify(result.price)} />
          );
        },
      },
      get_solanaAccount_NFTs: {
        description: 'Get the NFTs on a given solana account. Use this to show the user the NFTs on a given solana account.',
        parameters: z.object({
          accountId: z.string().describe("The solana address of the user e.g, 3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF")
        }),

        generate: async function* ({ accountId } : { accountId: string }) {
          yield (
            <BotCard>
              <SolanaTokenSkeleton />
            </BotCard>
          )

          const result = await getSolanaAccountNFTs(accountId);

          await sleep(1000);

          const toolCallId = nanoid()
        
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'get_solanaAccount_NFTs',
                    toolCallId,
                    args: { accountId }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'get_solanaAccount_NFTs',
                    toolCallId,
                    result: result
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <SolanaNFTs nfts={result} address={accountId} />
            </BotCard>
          ) 
        } 
      },
      getEvents: {
        description:
          'Get crypto events for a given cryptocurrency that describe the crypto activity. e.g DOGE/SOL/ETH/BTC',
        parameters: z.object({
          symbol: z.string().describe("The name or symbol of the cryptocurrency. e.g. DOGE/SOL/BTC. "),
        }),
        generate: async function* ({ symbol }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          const result = await fetchCryptoNews(symbol)

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getEvents',
                    toolCallId,
                    args: { symbol }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getEvents',
                    toolCallId,
                    result: `[Events for ${symbol}]`
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Events props={result.data} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]
interface CryptoPriceParams {
  symbol: string;
}
interface SolanaTokenProp {
  associatedTokenAddress: any;
  name: any;
  symbol: any;
  amountRaw: any;
  mint: string;
  owner: string;
  amount: string;
  uiAmount: number;
}
interface ApiResponse<T> {
  nativeBalance: any;
  tokens?: T[];
  nfts?: T[];
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

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'
    
    try {
      const address = await axios.get('/api/connectWallet');

      if (address.data && address.data) {
        const aiState = getAIState()
  
        if (aiState) {
          const uiState = getUIStateFromAIState(aiState as Chat)
          return uiState
        }
      } else {
        return
      }
    } catch (error) {
      console.log(error)
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'
    
    try {
      const address = await axios.get('/api/connectWallet');

      if (address.data && address.data) {
        const { chatId, messages } = state
  
        const createdAt = new Date()
        const userId = address.data
        const path = `/chat/${chatId}`
  
        const firstMessageContent = messages[0].content as string
        const title = firstMessageContent.substring(0, 100)
  
        const chat: Chat = {
          id: chatId,
          title,
          userId,
          createdAt,
          messages,
          path
        }
  
        await saveChat(chat)
      } else {
        return
      }
    } catch (error) {
      console.log(error)
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message: any)=> message.role !== 'system')
    .map((message: any, index: any) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map((tool: any) => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                <Prices props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'get_crypto_price' ? (
              <BotCard>
                <Price symbol={tool.result.symbol} price={tool.result.price} delta={tool.result.delta} />
              </BotCard>
            ) : tool.toolName === 'get_crypto_stats' ? (
              <BotCard>
                <Stats {...tool.result} />
              </BotCard>
            ) : tool.toolName === 'show_crypto_purchase' ? (
              <BotCard>
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}

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

async function etherscanApiQuery(params: string): Promise<any> {
  console.log("Received params for Etherscan API:", params);

  const baseUrl = 'https://api.etherscan.io/api';
  const apiKey = process.env.ETHERSCAN_API_KEY || '';
  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is not set in environment variables");
  }

  // Append the API key to the query string
  const queryParams = `${params}&apikey=${apiKey}`;

  // Construct the full URL
  const fullUrl = `${baseUrl}?${queryParams}`;

  try {
    console.log("Sending request to Etherscan with URL:", fullUrl); // Debug print to check final URL
    const response = await axios.get(fullUrl);
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
          'x-dune-api-key': process.env.DUNE_API_KEY
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
                  'x-dune-api-key': process.env.DUNE_API_KEY
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
          'x-dune-api-key': process.env.DUNE_API_KEY
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
      console.log(response)
      return response.data.price;
  } catch (error) {
      console.error("Failed to fetch Solana token price:", error);
      throw error;
  }
}

async function getSolanaAccountPortfolio(accountId: string): Promise<ApiResponse<SolanaTokenProp>> {
  const url = `https://solana-gateway.moralis.io/account/mainnet/${accountId}/portfolio`;
  const headers = { 'X-API-Key': process.env.MORALIS_API_KEY };

  try {
      console.log("get Solana portfolio (nfts, native and token balance) for: ", accountId)
      const response = await axios.get<ApiResponse<SolanaTokenProp>>(url, { headers });
      return response.data;
  } catch (error) {
      console.error("Failed to fetch Solana account tokens:", error);
      throw error;
  }
}

async function getSolanaAccountTokens(accountId: string): Promise<ApiResponse<SolanaTokenProp>> {
  const url = `https://solana-gateway.moralis.io/account/mainnet/${accountId}/tokens`;
  const headers = { 'X-API-Key': process.env.MORALIS_API_KEY };

  try {
      console.log("get Solana tokens by address for: ", accountId)
      const response = await axios.get<ApiResponse<SolanaTokenProp>>(url, { headers });
      return response.data;
  } catch (error) {
      console.error("Failed to fetch Solana account tokens:", error);
      throw error;
  }
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

async function getCryptocurrencyPrice(params: CryptoPriceParams): Promise<{price: string, delta: string}> {
  const { symbol } = params;
  try {
      const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
      const params = { symbol };
      const headers = {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
      };
  
      // Log the URL and parameters to debug and ensure they are correctly formatted
      console.log("Making API request to:", url, "with params:", params);
  
      const response = await axios.get(url, { params, headers });
      if (response.status === 200 && response.data.data[symbol]) {
          const price = response.data.data[symbol].quote.USD.price;
          const delta = response.data.data[symbol].quote.USD.volume_change_24h
          return {price, delta};
      } else {
          return {price: "", delta: ""};
      }
  } catch (error) {
      console.error(`Error fetching cryptocurrency price: ${error}`);
      return {price: "", delta: ""}
  }
}

function formatTokenOverlap(token: any) {
  return `
  Contract Address: ${token.contract_address}</br>
  Holder Count: ${token.holder_count}</br>
  Token Symbol: ${token.token_symbol}</br>
  `.trim().split("\n").join("  ");
}