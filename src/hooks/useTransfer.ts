import { useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import { showAlert, addTransaction } from '@/store/slices';
import {
  executeTransferApi,
  fetchBeneficiariesApi,
  addBeneficiaryApi,
} from '@/services/api/transfersApi';
import type { Transfer, Beneficiary, Transaction } from '@/types';

interface TransferValidationError {
  field: string;
  message: string;
}

interface UseTransferReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  beneficiaries: Beneficiary[];
  executeTransfer: (transfer: Transfer) => Promise<boolean>;
  fetchBeneficiaries: () => Promise<void>;
  addBeneficiary: (beneficiary: Partial<Beneficiary>) => Promise<Beneficiary | null>;
}

const validateTransfer = (transfer: Transfer): TransferValidationError | null => {
  if (!transfer.fromAccountId) {
    return { field: 'fromAccountId', message: 'Please select a source account.' };
  }
  if (!transfer.amount || transfer.amount <= 0) {
    return { field: 'amount', message: 'Transfer amount must be greater than 0.' };
  }
  if (transfer.amount > 50_000) {
    return { field: 'amount', message: 'Transfer amount exceeds the maximum allowed limit.' };
  }
  if (!transfer.description.trim()) {
    return { field: 'description', message: 'Please provide a transfer description.' };
  }
  if (
    (transfer.type === 'external' || transfer.type === 'international') &&
    !transfer.recipientIban &&
    !transfer.beneficiaryId
  ) {
    return { field: 'recipient', message: 'Please select or enter a recipient.' };
  }
  return null;
};

export const useTransfer = (): UseTransferReturn => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.accounts);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const executeTransfer = useCallback(
    async (transfer: Transfer): Promise<boolean> => {
      setError(null);
      setSuccess(false);

      // Client-side validation
      const validationError = validateTransfer(transfer);
      if (validationError) {
        setError(validationError.message);
        dispatch(showAlert({ message: validationError.message, type: 'error' }));
        return false;
      }

      setIsLoading(true);
      try {
        const result = await executeTransferApi(transfer);

        // Optimistically add a transaction record to the source account
        const sourceAccount = accounts.find((a) => a.id === transfer.fromAccountId);
        if (sourceAccount) {
          const newTx: Transaction = {
            id: result.transferId,
            accountId: transfer.fromAccountId,
            type: 'transfer',
            status: result.status,
            amount: -Math.abs(transfer.amount),
            currency: transfer.currency,
            description: transfer.description,
            category: 'Transfer',
            reference: result.reference,
            date: result.executedAt,
            balance: sourceAccount.balance - transfer.amount,
            counterpartName: transfer.recipientName,
            counterpartIban: transfer.recipientIban,
          };
          dispatch(addTransaction(newTx));
        }

        setSuccess(true);
        dispatch(showAlert({ message: result.message, type: 'success' }));
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Transfer failed. Please try again.';
        setError(message);
        dispatch(showAlert({ message, type: 'error' }));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, accounts],
  );

  const fetchBeneficiaries = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await fetchBeneficiariesApi();
      setBeneficiaries(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load beneficiaries.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBeneficiary = useCallback(
    async (beneficiary: Partial<Beneficiary>): Promise<Beneficiary | null> => {
      if (!beneficiary.name || !beneficiary.iban || !beneficiary.bank) {
        const message = 'Name, IBAN and bank are required to add a beneficiary.';
        setError(message);
        dispatch(showAlert({ message, type: 'error' }));
        return null;
      }

      setIsLoading(true);
      try {
        const newBeneficiary = await addBeneficiaryApi({
          name: beneficiary.name,
          iban: beneficiary.iban,
          bank: beneficiary.bank,
          alias: beneficiary.alias,
          isFavorite: beneficiary.isFavorite ?? false,
          avatar: beneficiary.avatar,
        });
        setBeneficiaries((prev) => [...prev, newBeneficiary]);
        dispatch(
          showAlert({ message: 'Beneficiary added successfully.', type: 'success' }),
        );
        return newBeneficiary;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to add beneficiary.';
        setError(message);
        dispatch(showAlert({ message, type: 'error' }));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  return {
    isLoading,
    error,
    success,
    beneficiaries,
    executeTransfer,
    fetchBeneficiaries,
    addBeneficiary,
  };
};

export default useTransfer;
