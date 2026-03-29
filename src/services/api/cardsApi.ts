import type { Card, CardTransaction, CardStatus } from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface CardLimits {
  spendingLimit: number;
  dailyLimit: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────

let MOCK_CARDS: Card[] = [
  {
    id: 'card-001',
    accountId: 'acc-001',
    type: 'prepaid',
    network: 'mastercard',
    status: 'active',
    cardNumber: '5355 7300 5987 ****',
    holderName: 'JOSÉ ANTONIO DÍAZ RODRÍGUEZ',
    expiryDate: '03/28',
    cvv: '***',
    spendingLimit: 10_000.00,
    dailyLimit: 3_000.00,
    onlinePaymentEnabled: true,
    internationalEnabled: true,
    contactlessEnabled: true,
    color: '#004481',
    createdAt: '2022-01-10T08:00:00.000Z',
  },
  {
    id: 'card-004',
    accountId: 'acc-001',
    type: 'debit',
    network: 'visa',
    status: 'active',
    cardNumber: '**** **** **** 7755',
    holderName: 'JOSE COMPTE',
    expiryDate: '03/29',
    cvv: '***',
    spendingLimit: 10_000.00,
    dailyLimit: 5_000.00,
    onlinePaymentEnabled: true,
    internationalEnabled: true,
    contactlessEnabled: true,
    isVirtual: true,
    color: '#1B998B',
    createdAt: '2026-03-29T09:00:00.000Z',
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_CARD_TRANSACTIONS: CardTransaction[] = [];

// ── API functions ────────────────────────────────────────────────────────────

export const fetchCardsApi = async (): Promise<Card[]> => {
  await delay(600);
  return [...MOCK_CARDS];
};

export const fetchCardTransactionsApi = async (
  cardId: string,
): Promise<CardTransaction[]> => {
  await delay(500);
  return MOCK_CARD_TRANSACTIONS.filter((t) => t.cardId === cardId);
};

export const blockCardApi = async (cardId: string): Promise<Card> => {
  await delay(800);
  const idx = MOCK_CARDS.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Carte introuvable : ${cardId}`);
  MOCK_CARDS[idx] = { ...MOCK_CARDS[idx], status: 'blocked' as CardStatus };
  return { ...MOCK_CARDS[idx] };
};

export const unblockCardApi = async (cardId: string): Promise<Card> => {
  await delay(800);
  const idx = MOCK_CARDS.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Carte introuvable : ${cardId}`);
  MOCK_CARDS[idx] = { ...MOCK_CARDS[idx], status: 'active' as CardStatus };
  return { ...MOCK_CARDS[idx] };
};

export const updateCardLimitsApi = async (
  cardId: string,
  limits: CardLimits,
): Promise<Card> => {
  await delay(700);
  const idx = MOCK_CARDS.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Carte introuvable : ${cardId}`);
  MOCK_CARDS[idx] = {
    ...MOCK_CARDS[idx],
    spendingLimit: limits.spendingLimit,
    dailyLimit: limits.dailyLimit,
  };
  return { ...MOCK_CARDS[idx] };
};
