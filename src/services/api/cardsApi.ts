import type { Card, CardTransaction, CardStatus } from '../../types';
import { getActiveUserId } from './authApi';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface CardLimits {
  spendingLimit: number;
  dailyLimit: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────

let MOCK_CARDS_KALLE: Card[] = [
  {
    id: 'card-003',
    accountId: 'acc-003',
    type: 'debit',
    network: 'mastercard',
    status: 'active',
    cardNumber: '**** **** **** 4290',
    holderName: 'KALLE HUIKKO',
    expiryDate: '01/29',
    cvv: '***',
    spendingLimit: 0.00,
    dailyLimit: 0.00,
    onlinePaymentEnabled: false,
    internationalEnabled: false,
    contactlessEnabled: false,
    color: '#004481',
    createdAt: '2024-01-01T09:00:00.000Z',
  },
];

let MOCK_CARDS_FILOMENA: Card[] = [
  {
    id: 'card-005',
    accountId: 'acc-004',
    type: 'debit',
    network: 'mastercard',
    status: 'active',
    cardNumber: '**** **** **** 5870',
    holderName: 'RIBEIRO FILOMENA',
    expiryDate: '04/29',
    cvv: '***',
    spendingLimit: 0.00,
    dailyLimit: 0.00,
    onlinePaymentEnabled: false,
    internationalEnabled: false,
    contactlessEnabled: false,
    color: '#004481',
    createdAt: '2026-04-01T09:00:00.000Z',
  },
];

let MOCK_CARDS_JOSE: Card[] = [
  {
    id: 'card-006',
    accountId: 'acc-006',
    type: 'debit',
    network: 'mastercard',
    status: 'active',
    cardNumber: '**** **** **** 3110',
    holderName: 'JOSÉ ANTONIO DÍAZ RODRÍGUEZ',
    expiryDate: '04/29',
    cvv: '***',
    spendingLimit: 0.00,
    dailyLimit: 0.00,
    onlinePaymentEnabled: false,
    internationalEnabled: false,
    contactlessEnabled: false,
    color: '#004481',
    createdAt: '2026-04-01T09:00:00.000Z',
  },
];

/** Returns a mutable reference to the card list for the currently active user. */
function getCardsForUser(): Card[] {
  const uid = getActiveUserId();
  if (uid === 'usr-004-filomena') return MOCK_CARDS_FILOMENA;
  if (uid === 'usr-006-jose') return MOCK_CARDS_JOSE;
  return MOCK_CARDS_KALLE;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_CARD_TRANSACTIONS: CardTransaction[] = [];

// ── API functions ────────────────────────────────────────────────────────────

export const fetchCardsApi = async (): Promise<Card[]> => {
  await delay(600);
  return [...getCardsForUser()];
};

export const fetchCardTransactionsApi = async (
  cardId: string,
): Promise<CardTransaction[]> => {
  await delay(500);
  return MOCK_CARD_TRANSACTIONS.filter((t) => t.cardId === cardId);
};

export const blockCardApi = async (cardId: string): Promise<Card> => {
  await delay(800);
  const cards = getCardsForUser();
  const idx = cards.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Tarjeta no encontrada: ${cardId}`);
  cards[idx] = { ...cards[idx], status: 'blocked' as CardStatus };
  return { ...cards[idx] };
};

export const unblockCardApi = async (cardId: string): Promise<Card> => {
  await delay(800);
  const cards = getCardsForUser();
  const idx = cards.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Tarjeta no encontrada: ${cardId}`);
  cards[idx] = { ...cards[idx], status: 'active' as CardStatus };
  return { ...cards[idx] };
};

export const updateCardLimitsApi = async (
  cardId: string,
  limits: CardLimits,
): Promise<Card> => {
  await delay(700);
  const cards = getCardsForUser();
  const idx = cards.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error(`Tarjeta no encontrada: ${cardId}`);
  cards[idx] = {
    ...cards[idx],
    spendingLimit: limits.spendingLimit,
    dailyLimit: limits.dailyLimit,
  };
  return { ...cards[idx] };
};
