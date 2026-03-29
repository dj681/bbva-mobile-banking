import type { Account, Transaction } from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mock accounts ────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-001',
    accountNumber: '00012345678',
    iban: 'ES76 0182 0012 3456 7800 1890',
    type: 'checking',
    name: 'Compte Courant BBVA',
    balance: 200_000.00,
    availableBalance: 200_000.00,
    currency: 'EUR',
    isDefault: true,
    isActive: true,
    createdAt: '2019-03-15T09:00:00.000Z',
  },
];

// ── Mock transactions ────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    accountId: 'acc-001',
    type: 'credit',
    status: 'completed',
    amount: 200_000.00,
    currency: 'EUR',
    description: 'VIREMENT REÇU MONECO BANK',
    category: 'income',
    reference: 'MNB20240115001',
    date: daysAgo(1),
    balance: 200_000.00,
    counterpartName: 'Moneco Bank',
    counterpartIban: 'ES76 0182 0099 8877 6655 4400',
  },
];

// ── API functions ────────────────────────────────────────────────────────────

export const fetchAccountsApi = async (): Promise<Account[]> => {
  await delay(700);
  return [...MOCK_ACCOUNTS];
};

export const fetchTransactionsApi = async (
  accountId: string,
  page = 1,
  pageSize = 20,
): Promise<{ transactions: Transaction[]; hasMore: boolean; total: number }> => {
  await delay(600);
  const filtered = MOCK_TRANSACTIONS.filter((t) => t.accountId === accountId);
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
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) throw new Error(`Compte introuvable : ${accountId}`);
  return { ...account };
};
