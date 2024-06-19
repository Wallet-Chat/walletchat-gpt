"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function TransactionList({ transactions, address } : { transactions: any, address: string}) {
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
                <TableHead>BlockNumber</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Nonce</TableHead>
                <TableHead>Block Hash</TableHead>
                <TableHead>Transaction Index</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Gas</TableHead>
                <TableHead>Gas Price</TableHead>
                <TableHead>Is Error</TableHead>
                <TableHead>Tx Receipt Status</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Contract Address</TableHead>
                <TableHead>Cumulative Gas Used</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead>Confirmations</TableHead>
                <TableHead>Method ID</TableHead>
                <TableHead>Function Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((trx: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{trx?.blockNumber}</TableCell>
                  <TableCell>{trx?.timeStamp}</TableCell>
                  <TableCell>{trx?.hash}</TableCell>
                  <TableCell>{trx?.nonce}</TableCell>
                  <TableCell>{trx?.blockHash}</TableCell>
                  <TableCell>{trx?.transactionIndex}</TableCell>
                  <TableCell>{trx?.from}</TableCell>
                  <TableCell>{trx?.to}</TableCell>
                  <TableCell>{trx?.value}</TableCell>
                  <TableCell>{trx?.gas}</TableCell>
                  <TableCell>{trx?.gasPrice}</TableCell>
                  <TableCell>{trx?.isError}</TableCell>
                  <TableCell>{trx?.txreceipt_status}</TableCell>
                  <TableCell>{trx?.input}</TableCell>
                  <TableCell>{trx?.contractAddress}</TableCell>
                  <TableCell>{trx?.cumulativeGasUsed}</TableCell>
                  <TableCell>{trx?.gasUsed}</TableCell>
                  <TableCell>{trx?.confirmations}</TableCell>
                  <TableCell>{trx?.methodId}</TableCell>
                  <TableCell>{trx?.functionName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}