"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function SolanaToken({ tokens, address } : { tokens: any, address: string}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-900 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">The Solana account: {`${address?.slice(0, 7)}...${address?.slice(35)}`} holds the following tokens:</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg">
        <ScrollArea className="max-h-[400px] overflow-auto">
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
  )
}