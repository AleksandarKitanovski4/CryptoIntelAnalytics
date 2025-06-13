import type { OHLCV } from "./cryptoData";

export interface IndicatorResult {
  timestamp: Date;
  values: Record<string, number>;
}

export class TechnicalIndicators {
  // Simple Moving Average
  static sma(data: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    
    return result;
  }

  // Exponential Moving Average
  static ema(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first value
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(ema);
    
    // Calculate EMA for the rest
    for (let i = period; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
      result.push(ema);
    }
    
    return result;
  }

  // Relative Strength Index
  static rsi(data: number[], period = 14): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate RSI
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        result.push(rsi);
      }
    }
    
    return result;
  }

  // MACD (Moving Average Convergence Divergence)
  static macd(data: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const fastEMA = this.ema(data, fastPeriod);
    const slowEMA = this.ema(data, slowPeriod);
    
    // Calculate MACD line
    const macdLine: number[] = [];
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i + (fastEMA.length - slowEMA.length)] - slowEMA[i]);
    }
    
    // Calculate signal line
    const signalLine = this.ema(macdLine, signalPeriod);
    
    // Calculate histogram
    const histogram: number[] = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }

  // Bollinger Bands
  static bollingerBands(data: number[], period = 20, stdDev = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.sma(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      
      // Calculate standard deviation
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const upperBand = mean + (standardDeviation * stdDev);
      const lowerBand = mean - (standardDeviation * stdDev);
      
      upper.push(upperBand);
      lower.push(lowerBand);
    }
    
    return { upper, middle, lower };
  }

  // Average True Range
  static atr(ohlcvData: OHLCV[], period = 14): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < ohlcvData.length; i++) {
      const current = ohlcvData[i];
      const previous = ohlcvData[i - 1];
      
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.sma(trueRanges, period);
  }

  // On Balance Volume
  static obv(ohlcvData: OHLCV[]): number[] {
    const result: number[] = [];
    let obv = 0;
    
    for (let i = 1; i < ohlcvData.length; i++) {
      const current = ohlcvData[i];
      const previous = ohlcvData[i - 1];
      
      if (current.close > previous.close) {
        obv += current.volume;
      } else if (current.close < previous.close) {
        obv -= current.volume;
      }
      // If close prices are equal, OBV remains the same
      
      result.push(obv);
    }
    
    return result;
  }

  // Stochastic Oscillator
  static stochastic(ohlcvData: OHLCV[], kPeriod = 14, dPeriod = 3): {
    k: number[];
    d: number[];
  } {
    const kValues: number[] = [];
    
    for (let i = kPeriod - 1; i < ohlcvData.length; i++) {
      const slice = ohlcvData.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(candle => candle.high));
      const lowest = Math.min(...slice.map(candle => candle.low));
      const current = ohlcvData[i].close;
      
      const k = ((current - lowest) / (highest - lowest)) * 100;
      kValues.push(k);
    }
    
    const dValues = this.sma(kValues, dPeriod);
    
    return { k: kValues, d: dValues };
  }

  // Calculate all indicators for a given dataset
  static calculateAll(ohlcvData: OHLCV[]): Record<string, any> {
    const closes = ohlcvData.map(d => d.close);
    const timestamps = ohlcvData.map(d => d.timestamp);
    
    const sma20 = this.sma(closes, 20);
    const sma50 = this.sma(closes, 50);
    const ema20 = this.ema(closes, 20);
    const rsi = this.rsi(closes);
    const macd = this.macd(closes);
    const bb = this.bollingerBands(closes);
    const atr = this.atr(ohlcvData);
    const obv = this.obv(ohlcvData);
    const stoch = this.stochastic(ohlcvData);
    
    return {
      timestamps,
      sma20,
      sma50,
      ema20,
      rsi,
      macd,
      bollingerBands: bb,
      atr,
      obv,
      stochastic: stoch
    };
  }
}
