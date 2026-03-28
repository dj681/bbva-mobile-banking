import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchAccounts,
  fetchTransactions,
  setSelectedAccount,
  setFilters,
  setSearchQuery,
} from '@/store/slices';
import type { Account, Transaction, TransactionFilters } from '@/types';

interface UseAccountsReturn {
  accounts: Account[];
  selectedAccount: Account | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  selectAccount: (id: string) => void;
  fetchTransactionsList: (accountId: string) => Promise<void>;
  searchTransactions: (query: string) => void;
  filterTransactions: (filters: TransactionFilters) => void;
}

export const useAccounts = (): UseAccountsReturn => {
  const dispatch = useAppDispatch();

  const accounts = useAppSelector((state) => state.accounts.accounts);
  const selectedAccountId = useAppSelector((state) => state.accounts.selectedAccountId);
  const allTransactions = useAppSelector((state) => state.accounts.transactions);
  const isLoading = useAppSelector((state) => state.accounts.isLoading);
  const error = useAppSelector((state) => state.accounts.error);
  const filters = useAppSelector((state) => state.accounts.filters);
  const searchQuery = useAppSelector((state) => state.accounts.searchQuery);

  // Fetch accounts on mount if not already loaded
  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts.length]);

  const selectedAccount = useMemo<Account | null>(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const rawTransactions = useMemo<Transaction[]>(
    () => (selectedAccountId ? (allTransactions[selectedAccountId] ?? []) : []),
    [allTransactions, selectedAccountId],
  );

  // Apply search + filters client-side on the current account's transactions
  const transactions = useMemo<Transaction[]>(() => {
    let result = rawTransactions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.merchant ?? '').toLowerCase().includes(q) ||
          (t.counterpartName ?? '').toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q),
      );
    }

    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.category) {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.minAmount !== undefined) {
      result = result.filter((t) => Math.abs(t.amount) >= (filters.minAmount ?? 0));
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter((t) => Math.abs(t.amount) <= (filters.maxAmount ?? Infinity));
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter((t) => new Date(t.date).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      result = result.filter((t) => new Date(t.date).getTime() <= to);
    }

    return result;
  }, [rawTransactions, searchQuery, filters]);

  const selectAccount = useCallback(
    (id: string) => {
      dispatch(setSelectedAccount(id));
    },
    [dispatch],
  );

  const fetchTransactionsList = useCallback(
    async (accountId: string): Promise<void> => {
      await dispatch(fetchTransactions({ accountId }));
    },
    [dispatch],
  );

  const searchTransactions = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch],
  );

  const filterTransactions = useCallback(
    (newFilters: TransactionFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch],
  );

  return {
    accounts,
    selectedAccount,
    transactions,
    isLoading,
    error,
    selectAccount,
    fetchTransactionsList,
    searchTransactions,
    filterTransactions,
  };
};

export default useAccounts;
