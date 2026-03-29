import type {
  Investment,
  PortfolioSummary,
  PricePoint,
  SavingsPlan,
  AssetType,
} from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface BuySellRequest {
  investmentId?: string;
  symbol?: string;
  quantity: number;
  price: number;
  action: 'buy' | 'sell';
}

export interface BuySellResult {
  orderId: string;
  status: 'executed' | 'pending';
  investment: Investment;
  totalAmount: number;
  fees: number;
  message: string;
}

// ── Mock portfolio ────────────────────────────────────────────────────────────

let MOCK_INVESTMENTS: Investment[] = [];

const MOCK_PORTFOLIO: PortfolioSummary = {
  totalValue: 0.00,
  totalInvested: 0.00,
  totalGainLoss: 0.00,
  totalGainLossPercent: 0.00,
  currency: 'EUR',
  lastUpdated: new Date().toISOString(),
};

const MOCK_SAVINGS_PLANS: SavingsPlan[] = [];

// ── Price history generator ───────────────────────────────────────────────────

function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility = 0.015,
): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * (1 - volatility * days * 0.5);

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const change = 1 + (Math.random() - 0.48) * volatility;
    price = Math.max(0.01, price * change);
    history.push({
      date: d.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5_000_000 + 500_000),
    });
  }

  return history;
}

// ── API functions ────────────────────────────────────────────────────────────

export const fetchPortfolioApi = async (): Promise<{
  portfolio: PortfolioSummary;
  investments: Investment[];
  savingsPlans: SavingsPlan[];
}> => {
  await delay(800);
  return {
    portfolio: { ...MOCK_PORTFOLIO },
    investments: [...MOCK_INVESTMENTS],
    savingsPlans: [...MOCK_SAVINGS_PLANS],
  };
};

export const fetchInvestmentDetailsApi = async (
  investmentId: string,
): Promise<Investment> => {
  await delay(500);
  const inv = MOCK_INVESTMENTS.find((i) => i.id === investmentId);
  if (!inv) throw new Error(`Investissement introuvable : ${investmentId}`);
  return { ...inv };
};

export const fetchPriceHistoryApi = async (
  investmentId: string,
  days = 30,
): Promise<PricePoint[]> => {
  await delay(600);
  const inv = MOCK_INVESTMENTS.find((i) => i.id === investmentId);
  if (!inv) throw new Error(`Investissement introuvable : ${investmentId}`);
  return generatePriceHistory(inv.currentPrice, days);
};

export const buyInvestmentApi = async (
  request: BuySellRequest,
): Promise<BuySellResult> => {
  await delay(1000);
  const totalAmount = request.quantity * request.price;
  const fees = parseFloat((totalAmount * 0.001).toFixed(2)); // 0.1% commission

  const existing = MOCK_INVESTMENTS.find(
    (i) =>
      i.id === request.investmentId ||
      (request.symbol && i.symbol === request.symbol),
  );

  let investment: Investment;

  if (existing) {
    const idx = MOCK_INVESTMENTS.indexOf(existing);
    const newQty = existing.quantity + request.quantity;
    const newAvgPrice =
      (existing.purchasePrice * existing.quantity +
        request.price * request.quantity) /
      newQty;
    MOCK_INVESTMENTS[idx] = {
      ...existing,
      quantity: newQty,
      purchasePrice: parseFloat(newAvgPrice.toFixed(4)),
      currentValue: newQty * existing.currentPrice,
      gainLoss: (existing.currentPrice - newAvgPrice) * newQty,
      gainLossPercent:
        ((existing.currentPrice - newAvgPrice) / newAvgPrice) * 100,
    };
    investment = { ...MOCK_INVESTMENTS[idx] };
  } else {
    investment = {
      id: `inv-${Date.now()}`,
      symbol: request.symbol ?? 'UNKNOWN',
      name: 'Nouvel investissement',
      type: 'stock' as AssetType,
      quantity: request.quantity,
      purchasePrice: request.price,
      currentPrice: request.price,
      currentValue: totalAmount,
      gainLoss: 0,
      gainLossPercent: 0,
      currency: 'EUR',
      purchaseDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    MOCK_INVESTMENTS.push(investment);
  }

  return {
    orderId: `ORD-${Date.now()}`,
    status: 'executed',
    investment,
    totalAmount,
    fees,
    message: `Achat de ${request.quantity} titre(s) exécuté avec succès.`,
  };
};

export const sellInvestmentApi = async (
  request: BuySellRequest,
): Promise<BuySellResult> => {
  await delay(1000);
  const idx = MOCK_INVESTMENTS.findIndex((i) => i.id === request.investmentId);
  if (idx === -1)
    throw new Error(`Investissement introuvable : ${request.investmentId}`);

  const inv = MOCK_INVESTMENTS[idx];
  if (inv.quantity < request.quantity) {
    throw new Error(
      `Quantité insuffisante. Disponible : ${inv.quantity}, demandé : ${request.quantity}.`,
    );
  }

  const totalAmount = request.quantity * request.price;
  const fees = parseFloat((totalAmount * 0.001).toFixed(2));
  const newQty = inv.quantity - request.quantity;

  MOCK_INVESTMENTS[idx] = {
    ...inv,
    quantity: newQty,
    currentValue: newQty * inv.currentPrice,
    gainLoss: (inv.currentPrice - inv.purchasePrice) * newQty,
    gainLossPercent:
      newQty > 0
        ? ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100
        : 0,
  };

  return {
    orderId: `ORD-${Date.now()}`,
    status: 'executed',
    investment: { ...MOCK_INVESTMENTS[idx] },
    totalAmount,
    fees,
    message: `Vente de ${request.quantity} titre(s) exécutée avec succès.`,
  };
};
