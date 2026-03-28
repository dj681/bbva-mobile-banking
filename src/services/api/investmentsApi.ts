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

let MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv-001',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 15,
    purchasePrice: 168.50,
    currentPrice: 182.30,
    currentValue: 2_734.50,
    gainLoss: 207.00,
    gainLossPercent: 8.19,
    currency: 'USD',
    purchaseDate: '2022-09-12T10:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    sector: 'Technology',
    isin: 'US0378331005',
    allocation: 7.06,
  },
  {
    id: 'inv-002',
    symbol: 'BBVA.MC',
    name: 'Banco Bilbao Vizcaya Argentaria',
    type: 'stock',
    quantity: 300,
    purchasePrice: 5.42,
    currentPrice: 8.65,
    currentValue: 2_595.00,
    gainLoss: 969.00,
    gainLossPercent: 59.59,
    currency: 'EUR',
    purchaseDate: '2021-03-22T09:30:00.000Z',
    lastUpdated: new Date().toISOString(),
    sector: 'Financial Services',
    isin: 'ES0113211835',
    allocation: 6.70,
  },
  {
    id: 'inv-003',
    symbol: 'IWDA.AS',
    name: 'iShares Core MSCI World UCITS ETF',
    type: 'etf',
    quantity: 50,
    purchasePrice: 71.20,
    currentPrice: 85.44,
    currentValue: 4_272.00,
    gainLoss: 712.00,
    gainLossPercent: 19.98,
    currency: 'EUR',
    purchaseDate: '2021-01-15T09:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    isin: 'IE00B4L5Y983',
    allocation: 11.03,
  },
  {
    id: 'inv-004',
    symbol: 'SP500',
    name: 'Amundi ETF S&P 500 UCITS',
    type: 'etf',
    quantity: 80,
    purchasePrice: 32.50,
    currentPrice: 41.80,
    currentValue: 3_344.00,
    gainLoss: 744.00,
    gainLossPercent: 28.62,
    currency: 'EUR',
    purchaseDate: '2020-11-10T10:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    isin: 'LU1681048804',
    allocation: 8.63,
  },
  {
    id: 'inv-005',
    symbol: 'ORAP.PA',
    name: 'Orange S.A.',
    type: 'stock',
    quantity: 200,
    purchasePrice: 10.20,
    currentPrice: 9.87,
    currentValue: 1_974.00,
    gainLoss: -66.00,
    gainLossPercent: -3.24,
    currency: 'EUR',
    purchaseDate: '2023-02-01T11:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    sector: 'Communication Services',
    isin: 'FR0000133308',
    allocation: 5.09,
  },
  {
    id: 'inv-006',
    symbol: 'FR0010510800',
    name: 'Obligations État Français 2031',
    type: 'bond',
    quantity: 20,
    purchasePrice: 980.00,
    currentPrice: 945.50,
    currentValue: 18_910.00,
    gainLoss: -690.00,
    gainLossPercent: -3.52,
    currency: 'EUR',
    purchaseDate: '2021-07-01T09:00:00.000Z',
    lastUpdated: new Date().toISOString(),
    isin: 'FR0010510800',
    allocation: 48.81,
  },
];

const MOCK_PORTFOLIO: PortfolioSummary = {
  totalValue: 38_742.15,
  totalInvested: 35_890.00,
  totalGainLoss: 2_852.15,
  totalGainLossPercent: 7.95,
  currency: 'EUR',
  lastUpdated: new Date().toISOString(),
};

const MOCK_SAVINGS_PLANS: SavingsPlan[] = [
  {
    id: 'sp-001',
    name: 'Épargne Retraite',
    targetAmount: 100_000.00,
    currentAmount: 22_450.80,
    monthlyContribution: 400.00,
    startDate: '2021-01-01T00:00:00.000Z',
    targetDate: '2045-01-01T00:00:00.000Z',
    interestRate: 2.5,
    currency: 'EUR',
    progress: 22.45,
  },
  {
    id: 'sp-002',
    name: "Projet Achat Véhicule",
    targetAmount: 25_000.00,
    currentAmount: 8_200.00,
    monthlyContribution: 300.00,
    startDate: '2023-06-01T00:00:00.000Z',
    targetDate: '2025-12-01T00:00:00.000Z',
    interestRate: 3.0,
    currency: 'EUR',
    progress: 32.80,
  },
];

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
