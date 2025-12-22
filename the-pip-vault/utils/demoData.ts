import { Trade } from "@/context/TradeContext";

// We retourneren nu objecten die ook een 'date' veld hebben
export const generateDummyTrades = (count: number = 10): (Omit<Trade, 'id' | 'date'> & { date: string })[] => {
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'];
  const directions = ['LONG', 'SHORT'] as const;
  
  return Array.from({ length: count }).map((_, index) => {
    // Willekeurig win of verlies
    const isWin = Math.random() > 0.4; // +/- 60% winrate
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // Random PnL (Winst tussen 20 en 100, Verlies tussen -10 en -50)
    const pnl = isWin 
      ? Math.floor(Math.random() * 80) + 20 
      : Math.floor(Math.random() * 40) * -1 - 10;

    // LOGICA VOOR DATUM SPREIDING:
    // We gaan 'count - index' dagen terug in de tijd.
    // Trade 1 is (bv) 10 dagen geleden, Trade 10 is vandaag.
    const date = new Date();
    date.setDate(date.getDate() - (count - index));

    return {
      pair,
      direction,
      entryPrice: 1.0000, // Dummy
      stopLoss: 0.9950,   // Dummy
      takeProfit: 1.0100, // Dummy
      riskPips: 50,       // Dummy
      rewardPips: 100,    // Dummy
      rrRatio: 2,
      chartUrl: '',
      pnl: pnl,
      date: date.toISOString() // <--- We sturen de datum mee
    };
  });
};