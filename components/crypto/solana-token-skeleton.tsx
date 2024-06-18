"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function SolanaTokenSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-900 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">
            <Skeleton className="h-4 w-[100px]" />
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg">
        <ScrollArea className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[80px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[80px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}