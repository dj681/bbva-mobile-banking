import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchCards,
  blockCard as blockCardThunk,
  unblockCard as unblockCardThunk,
  setSelectedCard,
} from '@/store/slices';
import type { Card } from '@/types';

interface UseCardsReturn {
  cards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
  error: string | null;
  selectCard: (id: string) => void;
  blockCard: (id: string) => Promise<void>;
  unblockCard: (id: string) => Promise<void>;
}

export const useCards = (): UseCardsReturn => {
  const dispatch = useAppDispatch();

  const cards = useAppSelector((state) => state.cards.cards);
  const selectedCardId = useAppSelector((state) => state.cards.selectedCardId);
  const isLoading = useAppSelector((state) => state.cards.isLoading);
  const error = useAppSelector((state) => state.cards.error);

  // Fetch cards on mount if not already loaded
  useEffect(() => {
    if (cards.length === 0) {
      dispatch(fetchCards());
    }
  }, [dispatch, cards.length]);

  const selectedCard = useMemo<Card | null>(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const selectCard = useCallback(
    (id: string) => {
      dispatch(setSelectedCard(id));
    },
    [dispatch],
  );

  const blockCard = useCallback(
    async (id: string): Promise<void> => {
      await dispatch(blockCardThunk(id));
    },
    [dispatch],
  );

  const unblockCard = useCallback(
    async (id: string): Promise<void> => {
      await dispatch(unblockCardThunk(id));
    },
    [dispatch],
  );

  return {
    cards,
    selectedCard,
    isLoading,
    error,
    selectCard,
    blockCard,
    unblockCard,
  };
};

export default useCards;
