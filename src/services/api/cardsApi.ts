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
    type: 'debit',
    network: 'visa',
    status: 'active',
    cardNumber: '**** **** **** 4821',
    holderName: 'JEAN DUPONT',
    expiryDate: '12/27',
    cvv: '***',
    spendingLimit: 5_000.00,
    dailyLimit: 1_500.00,
    onlinePaymentEnabled: true,
    internationalEnabled: true,
    contactlessEnabled: true,
    color: '#004481',
    createdAt: '2022-01-10T08:00:00.000Z',
  },
  {
    id: 'card-002',
    accountId: 'acc-001',
    type: 'credit',
    network: 'mastercard',
    status: 'active',
    cardNumber: '**** **** **** 3367',
    holderName: 'JEAN DUPONT',
    expiryDate: '09/26',
    cvv: '***',
    creditLimit: 10_000.00,
    availableCredit: 7_350.00,
    spendingLimit: 10_000.00,
    dailyLimit: 3_000.00,
    onlinePaymentEnabled: true,
    internationalEnabled: true,
    contactlessEnabled: true,
    color: '#1464A0',
    createdAt: '2021-06-15T10:00:00.000Z',
  },
  {
    id: 'card-003',
    accountId: 'acc-002',
    type: 'prepaid',
    network: 'visa',
    status: 'active',
    cardNumber: '**** **** **** 9012',
    holderName: 'JEAN DUPONT',
    expiryDate: '03/25',
    cvv: '***',
    spendingLimit: 2_000.00,
    dailyLimit: 500.00,
    onlinePaymentEnabled: true,
    internationalEnabled: false,
    contactlessEnabled: true,
    color: '#2DCCCD',
    createdAt: '2023-03-01T12:00:00.000Z',
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_CARD_TRANSACTIONS: CardTransaction[] = [
  {
    id: 'ctxn-001',
    cardId: 'card-001',
    amount: -29.90,
    currency: 'EUR',
    merchant: 'Starbucks Paris Opéra',
    category: 'food',
    date: daysAgo(0),
    status: 'completed',
    type: 'purchase',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-002',
    cardId: 'card-001',
    amount: -112.00,
    currency: 'EUR',
    merchant: 'Galeries Lafayette',
    category: 'shopping',
    date: daysAgo(1),
    status: 'completed',
    type: 'purchase',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-003',
    cardId: 'card-001',
    amount: -45.00,
    currency: 'EUR',
    merchant: 'Decathlon Paris 15',
    category: 'sports',
    date: daysAgo(2),
    status: 'completed',
    type: 'purchase',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-004',
    cardId: 'card-001',
    amount: -200.00,
    currency: 'EUR',
    merchant: 'Distributeur BNP',
    category: 'cash',
    date: daysAgo(3),
    status: 'completed',
    type: 'withdrawal',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-005',
    cardId: 'card-001',
    amount: 29.90,
    currency: 'EUR',
    merchant: 'Starbucks Paris Opéra',
    category: 'food',
    date: daysAgo(3),
    status: 'completed',
    type: 'refund',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-006',
    cardId: 'card-002',
    amount: -899.00,
    currency: 'EUR',
    merchant: 'Apple Store Champs-Élysées',
    category: 'technology',
    date: daysAgo(1),
    status: 'completed',
    type: 'purchase',
    location: 'Paris, France',
    isPending: false,
  },
  {
    id: 'ctxn-007',
    cardId: 'card-002',
    amount: -350.00,
    currency: 'EUR',
    merchant: 'Booking.com',
    category: 'travel',
    date: daysAgo(4),
    status: 'pending',
    type: 'purchase',
    isPending: true,
  },
  {
    id: 'ctxn-008',
    cardId: 'card-002',
    amount: -2.50,
    currency: 'EUR',
    merchant: 'BBVA Frais de carte',
    category: 'fees',
    date: daysAgo(5),
    status: 'completed',
    type: 'fee',
    isPending: false,
  },
  {
    id: 'ctxn-009',
    cardId: 'card-003',
    amount: -19.99,
    currency: 'EUR',
    merchant: 'Steam Games',
    category: 'entertainment',
    date: daysAgo(2),
    status: 'completed',
    type: 'purchase',
    isPending: false,
  },
];

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
