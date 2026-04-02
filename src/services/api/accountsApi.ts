import type { Account, Transaction } from '../../types';
import { getActiveUserId } from './authApi';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mock accounts ────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS_KALLE: Account[] = [
  {
    id: 'acc-003',
    accountNumber: '00034567890',
    iban: 'FI26 1234 5600 0007 8500',
    type: 'checking',
    name: 'Compte Courant BBVA',
    balance: 95_000.00,
    availableBalance: 95_000.00,
    currency: 'EUR',
    isDefault: true,
    isActive: true,
    createdAt: '2024-01-01T09:00:00.000Z',
  },
];

const MOCK_ACCOUNTS_FILOMENA: Account[] = [
  {
    id: 'acc-004',
    accountNumber: '00045678901',
    iban: 'PT50 0182 0004 5678 9010 1892',
    type: 'checking',
    name: 'Compte Courant BBVA',
    balance: 10_000.00,
    availableBalance: 10_000.00,
    currency: 'EUR',
    isDefault: true,
    isActive: true,
    createdAt: '2026-04-01T09:00:00.000Z',
  },
];

/** Returns the account list for the currently active user. */
function getAccountsForUser(): Account[] {
  const uid = getActiveUserId();
  if (uid === 'usr-004-filomena') return MOCK_ACCOUNTS_FILOMENA;
  return MOCK_ACCOUNTS_KALLE;
}

// ── Mock transactions ────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_TRANSACTIONS_KALLE: Transaction[] = [
  {
    id: 'txn-k-001',
    accountId: 'acc-003',
    type: 'credit',
    status: 'completed',
    amount: 95_000.00,
    currency: 'EUR',
    description: 'VIREMENT ENTRANT HAVI LOGISTICS OY',
    category: 'income',
    reference: 'HAVI20240101',
    date: daysAgo(0),
    balance: 95_000.00,
    counterpartName: 'Havi Logistics Oy',
    counterpartIban: 'FI26 3131 3000 1234 56',
  },
];

const MOCK_TRANSACTIONS_FILOMENA: Transaction[] = [
  {
    id: 'txn-f-001',
    accountId: 'acc-004',
    type: 'credit',
    status: 'completed',
    amount: 10_000.00,
    currency: 'EUR',
    description: 'VIREMENT ENTRANT - OUVERTURE DE COMPTE',
    category: 'income',
    reference: 'OPEN20260401',
    date: daysAgo(0),
    balance: 10_000.00,
  },
];

/** Returns the transaction list for the currently active user. */
function getTransactionsForUser(): Transaction[] {
  const uid = getActiveUserId();
  if (uid === 'usr-004-filomena') return MOCK_TRANSACTIONS_FILOMENA;
  return MOCK_TRANSACTIONS_KALLE;
}

// ── API functions ────────────────────────────────────────────────────────────

export const fetchAccountsApi = async (): Promise<Account[]> => {
  await delay(700);
  return [...getAccountsForUser()];
};

export const fetchTransactionsApi = async (
  accountId: string,
  page = 1,
  pageSize = 20,
): Promise<{ transactions: Transaction[]; hasMore: boolean; total: number }> => {
  await delay(600);
  const filtered = getTransactionsForUser().filter((t) => t.accountId === accountId);
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  return {
    transactions: slice,
    hasMore: start + pageSize < filtered.length,
    total: filtered.length,
  };
};

export const fetchAccountDetailsApi = async (accountId: string): Promise<Account> => {
  await delay(500);
  const account = getAccountsForUser().find((a) => a.id === accountId);
  if (!account) throw new Error(`Cuenta no encontrada: ${accountId}`);
  return { ...account };
};
