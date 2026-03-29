import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { InvestmentsState, Investment, PortfolioSummary, PricePoint, SavingsPlan } from '../../types';
import {
  fetchPortfolioApi,
  fetchInvestmentDetailsApi,
  fetchPriceHistoryApi,
  buyInvestmentApi,
  sellInvestmentApi,
} from '../../services/api/investmentsApi';

const initialState: InvestmentsState = {
  investments: [],
  portfolio: null,
  selectedInvestmentId: null,
  priceHistory: {},
  savingsPlans: [],
  isLoading: false,
  error: null,
};

interface BuySellPayload {
  investmentId?: string;
  symbol: string;
  quantity: number;
  price: number;
}

interface PriceHistoryParams {
  symbol: string;
  period: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
}

export const fetchPortfolio = createAsyncThunk<
  { investments: Investment[]; portfolio: PortfolioSummary; savingsPlans: SavingsPlan[] },
  void
>('investments/fetchPortfolio', async (_, { rejectWithValue }) => {
  try {
    return await fetchPortfolioApi();
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement du portefeuille.');
  }
});

export const fetchInvestmentDetails = createAsyncThunk<Investment, string>(
  'investments/fetchInvestmentDetails',
  async (investmentId, { rejectWithValue }) => {
    try {
      return await fetchInvestmentDetailsApi(investmentId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'investissement.');
    }
  },
);

export const fetchPriceHistory = createAsyncThunk<
  { symbol: string; history: PricePoint[] },
  PriceHistoryParams
>('investments/fetchPriceHistory', async ({ symbol, period }, { rejectWithValue }) => {
  const periodToDays: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, '5Y': 1825 };
  try {
    const history = await fetchPriceHistoryApi(symbol, periodToDays[period] ?? 30);
    return { symbol, history };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique.');
  }
});

export const buyInvestment = createAsyncThunk<Investment, BuySellPayload>(
  'investments/buyInvestment',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await buyInvestmentApi({ ...payload, action: 'buy' });
      return result.investment;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors de l\'achat.');
    }
  },
);

export const sellInvestment = createAsyncThunk<
  { investmentId: string; updatedInvestment: Investment | null },
  BuySellPayload
>('investments/sellInvestment', async (payload, { rejectWithValue }) => {
  try {
    const result = await sellInvestmentApi({ ...payload, action: 'sell' });
    return {
      investmentId: payload.investmentId ?? '',
      updatedInvestment: result.investment.quantity > 0 ? result.investment : null,
    };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors de la vente.');
  }
});

const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    setInvestments(state, action: PayloadAction<Investment[]>) {
      state.investments = action.payload;
    },
    setPortfolio(state, action: PayloadAction<PortfolioSummary | null>) {
      state.portfolio = action.payload;
    },
    setSelectedInvestment(state, action: PayloadAction<string | null>) {
      state.selectedInvestmentId = action.payload;
    },
    setPriceHistory(
      state,
      action: PayloadAction<{ symbol: string; history: PricePoint[] }>,
    ) {
      state.priceHistory[action.payload.symbol] = action.payload.history;
    },
    setSavingsPlans(state, action: PayloadAction<SavingsPlan[]>) {
      state.savingsPlans = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchPortfolio
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investments = action.payload.investments;
        state.portfolio = action.payload.portfolio;
        state.savingsPlans = action.payload.savingsPlans;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchInvestmentDetails
    builder
      .addCase(fetchInvestmentDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestmentDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.investments.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        } else {
          state.investments.push(action.payload);
        }
      })
      .addCase(fetchInvestmentDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchPriceHistory
    builder
      .addCase(fetchPriceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.priceHistory[action.payload.symbol] = action.payload.history;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // buyInvestment
    builder
      .addCase(buyInvestment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(buyInvestment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.investments.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        } else {
          state.investments.push(action.payload);
        }
      })
      .addCase(buyInvestment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // sellInvestment
    builder
      .addCase(sellInvestment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sellInvestment.fulfilled, (state, action) => {
        state.isLoading = false;
        const { investmentId, updatedInvestment } = action.payload;
        if (updatedInvestment) {
          const index = state.investments.findIndex((i) => i.id === investmentId);
          if (index !== -1) {
            state.investments[index] = updatedInvestment;
          }
        } else {
          // Full position sold — remove from list
          state.investments = state.investments.filter((i) => i.id !== investmentId);
        }
      })
      .addCase(sellInvestment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setInvestments,
  setPortfolio,
  setSelectedInvestment,
  setPriceHistory,
  setSavingsPlans,
  setLoading,
  setError,
} = investmentsSlice.actions;

export default investmentsSlice.reducer;
