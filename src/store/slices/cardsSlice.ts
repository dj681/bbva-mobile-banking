import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CardsState, Card, CardTransaction } from '../../types';
import {
  fetchCardsApi,
  fetchCardTransactionsApi,
  blockCardApi,
  unblockCardApi,
  updateCardLimitsApi,
} from '../../services/api/cardsApi';

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
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCardsApi();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement des cartes.');
    }
  },
);

export const fetchCardTransactions = createAsyncThunk<
  { cardId: string; transactions: CardTransaction[] },
  { cardId: string; page?: number; pageSize?: number }
>('cards/fetchCardTransactions', async ({ cardId }, { rejectWithValue }) => {
  try {
    const transactions = await fetchCardTransactionsApi(cardId);
    return { cardId, transactions };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions.');
  }
});

export const blockCard = createAsyncThunk<Card, string>(
  'cards/blockCard',
  async (cardId, { rejectWithValue }) => {
    try {
      return await blockCardApi(cardId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du blocage de la carte.');
    }
  },
);

export const unblockCard = createAsyncThunk<Card, string>(
  'cards/unblockCard',
  async (cardId, { rejectWithValue }) => {
    try {
      return await unblockCardApi(cardId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors du déblocage de la carte.');
    }
  },
);

export const updateCardLimits = createAsyncThunk<Card, UpdateCardLimitsPayload>(
  'cards/updateCardLimits',
  async (payload, { rejectWithValue }) => {
    try {
      const { cardId, ...limits } = payload;
      return await updateCardLimitsApi(cardId, {
        spendingLimit: limits.spendingLimit ?? 0,
        dailyLimit: limits.dailyLimit ?? 0,
      });
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des limites.');
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
