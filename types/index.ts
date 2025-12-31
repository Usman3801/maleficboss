export interface Token {
  symbol: string;
  name: string;
  address?: string;
  decimals?: number;
  balance?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

export interface ContributionStats {
  github: {
    commits: number;
    pullRequests: number;
    issues: number;
  };
  discord: {
    messages: number;
    reactions: number;
    activeDays: number;
  };
  twitter: {
    tweets: number;
    retweets: number;
    likes: number;
  };
  telegram: {
    messages: number;
    replies: number;
    activeDays: number;
  };
}

export interface PerpPosition {
  asset: string;
  type: "long" | "short";
  size: string;
  leverage: number;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  timestamp: number;
}
