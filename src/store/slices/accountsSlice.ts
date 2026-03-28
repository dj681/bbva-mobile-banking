import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AccountsState, Account, Transaction, TransactionFilters } from '../../types';

const initialState: AccountsState = {
  accounts: [],
  selectedAccountId: null,
  transactions: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: {},
  searchQuery: '',
};

interface FetchTransactionsParams {
  accountId: string;
  page?: number;
  pageSize?: number;
  filters?: TransactionFilters;
}

export const fetchAccounts = createAsyncThunk<Account[], void>(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch('/api/accounts', {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to fetch accounts');
      }
      return data.data as Account[];
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const fetchTransactions = createAsyncThunk<
  { accountId: string; transactions: Transaction[] },
  FetchTransactionsParams
>('accounts/fetchTransactions', async (params, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: { token: string | null } };
    const { accountId, page = 1, pageSize = 20, filters } = params;

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.minAmount !== undefined && { minAmount: String(filters.minAmount) }),
      ...(filters?.maxAmount !== undefined && { maxAmount: String(filters.maxAmount) }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
    });

    const response = await fetch(`/api/accounts/${accountId}/transactions?${query.toString()}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message ?? 'Failed to fetch transactions');
    }
    return { accountId, transactions: data.data as Transaction[] };
  } catch {
    return rejectWithValue('Network error. Please try again.');
  }
});

export const fetchAccountDetails = createAsyncThunk<Account, string>(
  'accounts/fetchAccountDetails',
  async (accountId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch(`/api/accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to fetch account details');
      }
      return data.data as Account;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts(state, action: PayloadAction<Account[]>) {
      state.accounts = action.payload;
    },
    setSelectedAccount(state, action: PayloadAction<string | null>) {
      state.selectedAccountId = action.payload;
    },
    setTransactions(
      state,
      action: PayloadAction<{ accountId: string; transactions: Transaction[] }>,
    ) {
      state.transactions[action.payload.accountId] = action.payload.transactions;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setFilters(state, action: PayloadAction<TransactionFilters>) {
      state.filters = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
      state.searchQuery = '';
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      const { accountId } = action.payload;
      if (!state.transactions[accountId]) {
        state.transactions[accountId] = [];
      }
      // Prepend so the latest transaction appears first
      state.transactions[accountId] = [action.payload, ...state.transactions[accountId]];
    },
  },
  extraReducers: (builder) => {
    // fetchAccounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchTransactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions[action.payload.accountId] = action.payload.transactions;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchAccountDetails
    builder
      .addCase(fetchAccountDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        } else {
          state.accounts.push(action.payload);
        }
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAccounts,
  setSelectedAccount,
  setTransactions,
  setLoading,
  setError,
  setFilters,
  setSearchQuery,
  clearFilters,
  addTransaction,
} = accountsSlice.actions;

export default accountsSlice.reducer;
