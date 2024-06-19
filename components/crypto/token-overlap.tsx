"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function TokenOverlap({ tokens, address, chain } : { tokens: any, address: string, chain: string }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-900 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">Here is the token overlap for : {`${address?.slice(0, 7)}...${address?.slice(35)}`} {chain}:</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg">
        <ScrollArea className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contract Address</TableHead>
                <TableHead>Holder Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens?.map((token: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{token?.name}</TableCell>
                  <TableCell>{`${token?.contract_address?.slice(0, 7)}...${token?.contract_address.slice(35)}`}</TableCell>
                  <TableCell>{token?.holder_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}