import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatTimestamp } from '@/lib/utils';
import { CONTRACT_ADDRESS } from '@/config/contracts';
import { Loader2 } from 'lucide-react';

interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  event: string;
  args: any;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const { address } = useAccount();

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Get recent blocks
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 10000n > 0n ? currentBlock - 10000n : 0n;

        // Fetch all relevant events
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock,
          toBlock: currentBlock,
        });

        // Get timestamps for blocks
        const txs: Transaction[] = [];
        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            txs.push({
              hash: log.transactionHash || '',
              blockNumber: log.blockNumber || 0n,
              timestamp: Number(block.timestamp),
              event: log.topics[0] || '',
              args: log,
            });
          } catch (error) {
            console.error('Error fetching block:', error);
          }
        }

        setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, publicClient]);

  const getEventName = (topic: string): string => {
    const eventMap: Record<string, string> = {
      '0x': 'Unknown Event',
    };
    return eventMap[topic] || 'Contract Interaction';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent contract interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{getEventName(tx.event)}</p>
                  <p className="text-xs text-muted-foreground">
                    Block: {tx.blockNumber.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(tx.timestamp)}
                  </p>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View on Explorer →
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
