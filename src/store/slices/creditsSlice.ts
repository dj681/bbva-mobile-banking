import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CreditsState, Credit, CreditSimulation } from '../../types';

const initialState: CreditsState = {
  credits: [],
  selectedCreditId: null,
  simulation: null,
  isLoading: false,
  error: null,
};

interface SimulateCreditParams {
  amount: number;
  termMonths: number;
  interestRate?: number;
}

interface RequestCreditPayload {
  amount: number;
  termMonths: number;
  type: Credit['type'];
  purpose?: string;
}

interface EarlyPaymentPayload {
  creditId: string;
  amount: number;
}

export const fetchCredits = createAsyncThunk<Credit[], void>(
  'credits/fetchCredits',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch('/api/credits', {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to fetch credits');
      }
      return data.data as Credit[];
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const fetchCreditDetails = createAsyncThunk<Credit, string>(
  'credits/fetchCreditDetails',
  async (creditId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch(`/api/credits/${creditId}`, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to fetch credit details');
      }
      return data.data as Credit;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const simulateCredit = createAsyncThunk<CreditSimulation, SimulateCreditParams>(
  'credits/simulateCredit',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch('/api/credits/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to simulate credit');
      }
      return data.data as CreditSimulation;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const requestCredit = createAsyncThunk<Credit, RequestCreditPayload>(
  'credits/requestCredit',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch('/api/credits/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to submit credit request');
      }
      return data.data as Credit;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const makeEarlyPayment = createAsyncThunk<Credit, EarlyPaymentPayload>(
  'credits/makeEarlyPayment',
  async ({ creditId, amount }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch(`/api/credits/${creditId}/early-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to process early payment');
      }
      return data.data as Credit;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    setCredits(state, action: PayloadAction<Credit[]>) {
      state.credits = action.payload;
    },
    setSelectedCredit(state, action: PayloadAction<string | null>) {
      state.selectedCreditId = action.payload;
    },
    setSimulation(state, action: PayloadAction<CreditSimulation | null>) {
      state.simulation = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchCredits
    builder
      .addCase(fetchCredits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.credits = action.payload;
      })
      .addCase(fetchCredits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCreditDetails
    builder
      .addCase(fetchCreditDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreditDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.credits.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.credits[index] = action.payload;
        } else {
          state.credits.push(action.payload);
        }
      })
      .addCase(fetchCreditDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // simulateCredit
    builder
      .addCase(simulateCredit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(simulateCredit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.simulation = action.payload;
      })
      .addCase(simulateCredit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // requestCredit
    builder
      .addCase(requestCredit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestCredit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.credits.push(action.payload);
      })
      .addCase(requestCredit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // makeEarlyPayment
    builder
      .addCase(makeEarlyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makeEarlyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.credits.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.credits[index] = action.payload;
        }
      })
      .addCase(makeEarlyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredits, setSelectedCredit, setSimulation, setLoading, setError } =
  creditsSlice.actions;

export default creditsSlice.reducer;
