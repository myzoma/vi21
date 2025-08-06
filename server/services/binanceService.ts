import { MarketData } from "@shared/schema";

export class BinanceService {
  private baseUrl = 'https://www.okx.com/api/v5';

  async getSymbolPrice(symbol: string): Promise<MarketData | null> {
    try {
      // Convert symbol format for OKX (BTC-USDT instead of BTCUSDT)
      const okxSymbol = symbol.replace('USDT', '-USDT');
      
      const response = await fetch(`${this.baseUrl}/market/ticker?instId=${okxSymbol}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}`);
      }

      const data = await response.json();
      
      if (data.code !== '0' || !data.data || data.data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }

      const tickerData = data.data[0];

      return {
        symbol,
        price: parseFloat(tickerData.last),
        change24h: parseFloat(tickerData.chgUtc8) * 100, // Convert to percentage
        volume24h: parseFloat(tickerData.vol24h),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  }

  async getKlineData(symbol: string, interval: string, limit: number = 100): Promise<number[][] | null> {
    try {
      // Convert symbol format for OKX and interval mapping
      const okxSymbol = symbol.replace('USDT', '-USDT');
      const okxInterval = this.convertIntervalToOKX(interval);
      
      const response = await fetch(
        `${this.baseUrl}/market/candles?instId=${okxSymbol}&bar=${okxInterval}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch kline data for ${symbol}`);
      }

      const data = await response.json();
      
      if (data.code !== '0' || !data.data) {
        throw new Error(`No kline data available for ${symbol}`);
      }
      
      // OKX format: [timestamp, open, high, low, close, volume, volumeCcy]
      // Return [timestamp, open, high, low, close, volume] format
      return data.data.map((kline: string[]) => [
        parseInt(kline[0]), // timestamp
        parseFloat(kline[1]), // open
        parseFloat(kline[2]), // high
        parseFloat(kline[3]), // low
        parseFloat(kline[4]), // close
        parseFloat(kline[5]), // volume
      ]);
    } catch (error) {
      console.error(`Error fetching kline data for ${symbol}:`, error);
      return null;
    }
  }

  private convertIntervalToOKX(interval: string): string {
    const intervalMap: { [key: string]: string } = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1H',
      '4h': '4H',
      '1d': '1D',
      '1w': '1W'
    };
    return intervalMap[interval] || '1H';
  }

  async getTopSymbols(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/market/tickers?instType=SPOT`);
      if (!response.ok) {
        throw new Error('Failed to fetch top symbols');
      }

      const data = await response.json();
      
      if (data.code !== '0' || !data.data) {
        throw new Error('No symbols data available');
      }
      
      // Filter USDT pairs and sort by volume
      const usdtPairs = data.data
        .filter((ticker: any) => ticker.instId.endsWith('-USDT'))
        .sort((a: any, b: any) => parseFloat(b.vol24h) - parseFloat(a.vol24h))
        .slice(0, 20)
        .map((ticker: any) => ticker.instId.replace('-USDT', 'USDT'));

      return usdtPairs;
    } catch (error) {
      console.error('Error fetching top symbols:', error);
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'];
    }
  }

  async getExchangeInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/exchangeInfo`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange info');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching exchange info:', error);
      return null;
    }
  }
}

export const binanceService = new BinanceService();
