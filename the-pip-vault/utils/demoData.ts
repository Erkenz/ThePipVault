import { Trade } from "@/context/TradeContext";

export const generateDummyTrades = (count: number = 10): (Omit<Trade, 'id' | 'date'> & { date: string })[] => {
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'];
  const directions = ['LONG', 'SHORT'] as const;
  
  // NIEUW: Lijstjes voor random selectie
  const setups = ['Trend Continuation', 'Breakout', 'Reversal', 'Range Bounce', 'News Event'];
  const emotions = ['Confident', 'Neutral', 'FOMO', 'Greedy', 'Hesitant', 'Revenge'];

  return Array.from({ length: count }).map((_, index) => {
    const isWin = Math.random() > 0.45; 
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // Selecteer random setup en emotie
    const setup = setups[Math.floor(Math.random() * setups.length)];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];

    const pnl = isWin 
      ? Math.floor(Math.random() * 80) + 20 
      : Math.floor(Math.random() * 40) * -1 - 10;

    const date = new Date();
    date.setDate(date.getDate() - (count - index)); // Spreiding over dagen

    return {
      pair,
      direction,
      entryPrice: 1.0000,
      stopLoss: 0.9950,
      takeProfit: 1.0100,
      riskPips: 50,
      rewardPips: 100,
      rrRatio: 2,
      chartUrl: '',
      pnl: pnl,
      date: date.toISOString(),
      setup,   
      emotion  
    };
  });
};