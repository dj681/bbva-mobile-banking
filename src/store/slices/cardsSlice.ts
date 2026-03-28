import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CardsState, Card, CardTransaction } from '../../types';

const initialState: CardsState = {
  cards: [],
  selectedCardId: null,
  cardTransactions: {},
  isLoading: false,
  error: null,
};

interface UpdateCardLimitsPayload {
  cardId: string;
  spendingLimit?: number;
  dailyLimit?: number;
  onlinePaymentEnabled?: boolean;
  internationalEnabled?: boolean;
  contactlessEnabled?: boolean;
}

export const fetchCards = createAsyncThunk<Card[], void>(
  'cards/fetchCards',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch('/api/cards', {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to fetch cards');
      }
      return data.data as Card[];
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const fetchCardTransactions = createAsyncThunk<
  { cardId: string; transactions: CardTransaction[] },
  { cardId: string; page?: number; pageSize?: number }
>('cards/fetchCardTransactions', async ({ cardId, page = 1, pageSize = 20 }, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: { token: string | null } };
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const response = await fetch(`/api/cards/${cardId}/transactions?${query.toString()}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message ?? 'Failed to fetch card transactions');
    }
    return { cardId, transactions: data.data as CardTransaction[] };
  } catch {
    return rejectWithValue('Network error. Please try again.');
  }
});

export const blockCard = createAsyncThunk<Card, string>(
  'cards/blockCard',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch(`/api/cards/${cardId}/block`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to block card');
      }
      return data.data as Card;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const unblockCard = createAsyncThunk<Card, string>(
  'cards/unblockCard',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const response = await fetch(`/api/cards/${cardId}/unblock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to unblock card');
      }
      return data.data as Card;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

export const updateCardLimits = createAsyncThunk<Card, UpdateCardLimitsPayload>(
  'cards/updateCardLimits',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const { cardId, ...body } = payload;
      const response = await fetch(`/api/cards/${cardId}/limits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message ?? 'Failed to update card limits');
      }
      return data.data as Card;
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  },
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards(state, action: PayloadAction<Card[]>) {
      state.cards = action.payload;
    },
    setSelectedCard(state, action: PayloadAction<string | null>) {
      state.selectedCardId = action.payload;
    },
    setCardTransactions(
      state,
      action: PayloadAction<{ cardId: string; transactions: CardTransaction[] }>,
    ) {
      state.cardTransactions[action.payload.cardId] = action.payload.transactions;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateCard(state, action: PayloadAction<Card>) {
      const index = state.cards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchCards
    builder
      .addCase(fetchCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchCardTransactions
    builder
      .addCase(fetchCardTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCardTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cardTransactions[action.payload.cardId] = action.payload.transactions;
      })
      .addCase(fetchCardTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // blockCard
    builder
      .addCase(blockCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(blockCard.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cards.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(blockCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // unblockCard
    builder
      .addCase(unblockCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unblockCard.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cards.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(unblockCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateCardLimits
    builder
      .addCase(updateCardLimits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCardLimits.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cards.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(updateCardLimits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCards,
  setSelectedCard,
  setCardTransactions,
  setLoading,
  setError,
  updateCard,
} = cardsSlice.actions;

export default cardsSlice.reducer;
