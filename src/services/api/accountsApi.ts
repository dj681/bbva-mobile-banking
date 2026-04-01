import type { Account, Transaction } from '../../types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Mock accounts ────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-001',
    accountNumber: '00012345678',
    iban: 'ES76 0182 0012 3456 7800 1890',
    type: 'checking',
    name: 'Cuenta Corriente BBVA',
    balance: 199_950.00,
    availableBalance: 199_950.00,
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
    id: 'txn-025',
    accountId: 'acc-001',
    type: 'debit',
    status: 'completed',
    amount: 50.00,
    currency: 'EUR',
    description: 'RETRAIT DAB GUICHET AUTOMATIQUE',
    category: 'cash',
    merchant: 'Guichet Automatique BBVA',
    reference: 'DAB20260401',
    date: daysAgo(0),
    balance: 199_950.00,
  },
  {
    id: 'txn-024',
    accountId: 'acc-001',
    type: 'credit',
    status: 'completed',
    amount: 200_000.00,
    currency: 'EUR',
    description: 'VIREMENT ENTRANT MONECO BANK',
    category: 'income',
    reference: 'MNB20260329',
    date: daysAgo(0),
    balance: 200_000.00,
    counterpartName: 'Moneco Bank',
    counterpartIban: 'FR76 1690 6009 0000 2345 6789 012',
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
  if (!account) throw new Error(`Cuenta no encontrada: ${accountId}`);
  return { ...account };
};
