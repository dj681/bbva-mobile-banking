import type { Card, CardTransaction, CardStatus } from '../../types';
import { getActiveUserId } from './authApi';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface CardLimits {
  spendingLimit: number;
  dailyLimit: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────

let MOCK_CARDS_JOSE: Card[] = [
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

/** Returns a mutable reference to the card list for the currently active user. */
function getCardsForUser(): Card[] {
  const uid = getActiveUserId();
  if (uid === 'usr-003-khuikko') return MOCK_CARDS_KALLE;
  if (uid === 'usr-004-filomena') return MOCK_CARDS_FILOMENA;
  return MOCK_CARDS_JOSE;
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
