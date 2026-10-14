export function percentOf(percent: number, base: number): number {
  return (base * percent) / 100;
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return Number.NaN;
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.NaN;
  return ((to - from) / Math.abs(from)) * 100;
}

export function applyDiscount(price: number, percent: number): { saved: number; finalPrice: number } {
  const saved = (price * percent) / 100;
  return { saved, finalPrice: price - saved };
}

export function splitTip(bill: number, percent: number, people: number): { tip: number; total: number; each: number } {
  const tip = (bill * percent) / 100;
  const total = bill + tip;
  const count = people > 0 ? people : 1;
  return { tip, total, each: total / count };
}

export function marginFromPrices(cost: number, price: number): { profit: number; margin: number; markup: number } {
  const profit = price - cost;
  return {
    profit,
    margin: price === 0 ? Number.NaN : (profit / price) * 100,
    markup: cost === 0 ? Number.NaN : (profit / cost) * 100,
  };
}

export function priceFromMargin(cost: number, marginPercent: number): { price: number; profit: number } | null {
  const margin = marginPercent / 100;
  if (!(margin < 1)) return null;
  const price = cost / (1 - margin);
  return { price, profit: price - cost };
}
