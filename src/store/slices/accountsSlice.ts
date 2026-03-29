import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AccountsState, Account, Transaction, TransactionFilters } from '../../types';
import {
  fetchAccountsApi,
  fetchTransactionsApi,
  fetchAccountDetailsApi,
} from '../../services/api/accountsApi';

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
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountsApi();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement des comptes.');
    }
  },
);

export const fetchTransactions = createAsyncThunk<
  { accountId: string; transactions: Transaction[] },
  FetchTransactionsParams
>('accounts/fetchTransactions', async (params, { rejectWithValue }) => {
  try {
    const { accountId, page = 1, pageSize = 20 } = params;
    const { transactions } = await fetchTransactionsApi(accountId, page, pageSize);
    return { accountId, transactions };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions.');
  }
});

export const fetchAccountDetails = createAsyncThunk<Account, string>(
  'accounts/fetchAccountDetails',
  async (accountId, { rejectWithValue }) => {
    try {
      return await fetchAccountDetailsApi(accountId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement du compte.');
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
