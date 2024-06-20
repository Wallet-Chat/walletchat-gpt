import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function SolanaPortfolio({ tokens, nfts, balance, address } : { tokens: any, nfts: any, balance: string, address: string }) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="bg-gray-900 text-white p-4 rounded-t-lg">
            <h1 className="text-lg font-bold">The portfolio of the Solana account: {`${address?.slice(0, 7)}...${address?.slice(35)}`} includes the following:</h1>
        </div>
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-10 flex-1 grid gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Account Balance</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Current balance in SOL</p>
            </div>
            <div className="text-2xl font-bold">{balance}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tokens</h2>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-72 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>AssociatedTokenAddress</TableHead>
                    <TableHead>Mint</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {tokens?.map((token: any, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{token?.name}</TableCell>
                            <TableCell>{token?.symbol}</TableCell>
                            <TableCell>{`${token?.associatedTokenAddress?.slice(0, 7)}...${token.associatedTokenAddress?.slice(35)}`}</TableCell>
                            <TableCell>{`${token?.mint?.slice(0, 7)}...${token.mint?.slice(35)}`}</TableCell>
                            <TableCell>{token?.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">NFTs</h2>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-72 w-full">
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>AssociatedTokenAddress</TableHead>
                        <TableHead>Mint</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {nfts?.map((nft: any, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{nft?.name}</TableCell>
                            <TableCell>{nft?.symbol}</TableCell>
                            <TableCell>{`${nft?.associatedTokenAddress?.slice(0, 7)}...${nft.associatedTokenAddress?.slice(35)}`}</TableCell>
                            <TableCell>{`${nft?.mint?.slice(0, 7)}...${nft.mint?.slice(35)}`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  )
}