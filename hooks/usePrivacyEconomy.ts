import { useState, useEffect, useCallback } from 'react';
import ZeroKnowledgeHealthVault from '@/lib/healthVault';
import HEALTokenService, { TokenReward } from '@/services/healTokenService';
import { toast } from 'sonner';

interface UsePrivacyEconomyProps {
  patientDid: string;
  patientPrivateKey: string;
}

interface PrivacyEconomyState {
  vault: ZeroKnowledgeHealthVault | null;
  healBalance: number;
  healRewards: TokenReward[];
  isLoading: boolean;
  error: string | null;
}

export function usePrivacyEconomy({ patientDid, patientPrivateKey }: UsePrivacyEconomyProps) {
  const [state, setState] = useState<PrivacyEconomyState>({
    vault: null,
    healBalance: 0,
    healRewards: [],
    isLoading: true,
    error: null
  });

  // Initialize vault and load data
  const initializeVault = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize health vault
      const vault = new ZeroKnowledgeHealthVault();
      await vault.initializeVault(patientDid, patientPrivateKey);

      // Load HEAL token data
      const [balance, rewards] = await Promise.all([
        HEALTokenService.getTokenBalance(patientDid),
        HEALTokenService.getRewardHistory(patientDid)
      ]);

      setState({
        vault,
        healBalance: balance,
        healRewards: rewards,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to initialize privacy economy:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize'
      }));
    }
  }, [patientDid, patientPrivateKey]);

  // Store health record and earn tokens
  const storeHealthRecord = useCallback(async (recordData: any) => {
    if (!state.vault) {
      throw new Error('Vault not initialized');
    }

    try {
      const recordId = await state.vault.storeRecord({
        patientId: patientDid,
        dataType: recordData.dataType,
        encryptedData: recordData.content,
        accessControl: {
          owner: patientDid,
          authorizedViewers: [],
          emergencyAccess: recordData.emergencyAccess || false
        }
      });

      // Earn tokens for storing health data
      const reward = await HEALTokenService.rewardQualityData(patientDid, 'high');

      // Update state
      setState(prev => ({
        ...prev,
        healBalance: prev.healBalance + reward.amount,
        healRewards: [reward, ...prev.healRewards]
      }));

      toast.success(`Stored health record and earned ${reward.amount} HEAL tokens!`);
      return recordId;
    } catch (error) {
      console.error('Failed to store health record:', error);
      toast.error('Failed to store health record');
      throw error;
    }
  }, [state.vault, patientDid]);

  // Grant consent and earn tokens
  const grantConsentWithReward = useCallback(async (
    recordId: string,
    doctorDid: string,
    dataTypes: string[]
  ) => {
    if (!state.vault) {
      throw new Error('Vault not initialized');
    }

    try {
      // Grant access in vault
      await state.vault.grantAccess(recordId, doctorDid, 'read', 30);

      // Earn tokens for consent
      const reward = await HEALTokenService.rewardConsentGrant(patientDid, recordId, dataTypes);

      // Update state
      setState(prev => ({
        ...prev,
        healBalance: prev.healBalance + reward.amount,
        healRewards: [reward, ...prev.healRewards]
      }));

      toast.success(`Consent granted and earned ${reward.amount} HEAL tokens!`);
      return reward;
    } catch (error) {
      console.error('Failed to grant consent:', error);
      toast.error('Failed to grant consent');
      throw error;
    }
  }, [state.vault, patientDid]);

  // Stake tokens for rewards
  const stakeTokens = useCallback(async (amount: number, lockPeriod: number) => {
    try {
      const stake = await HEALTokenService.stakeTokens(patientDid, amount, lockPeriod);

      setState(prev => ({
        ...prev,
        healBalance: prev.healBalance - amount
      }));

      toast.success(`Staked ${amount} HEAL tokens for ${lockPeriod} days`);
      return stake;
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      toast.error('Failed to stake tokens');
      throw error;
    }
  }, [patientDid]);

  // Get vault statistics
  const getVaultStats = useCallback(() => {
    if (!state.vault) return null;
    return state.vault.getVaultStats();
  }, [state.vault]);

  // Get token statistics
  const getTokenStats = useCallback(() => {
    return {
      balance: state.healBalance,
      totalRewards: state.healRewards.reduce((sum, reward) => sum + reward.amount, 0),
      recentRewards: state.healRewards.slice(0, 5)
    };
  }, [state.healBalance, state.healRewards]);

  // Emergency access with audit logging
  const emergencyAccess = useCallback(async (recordId: string, doctorDid: string, reason: string) => {
    if (!state.vault) {
      throw new Error('Vault not initialized');
    }

    try {
      const data = await state.vault.emergencyAccess(recordId, doctorDid, reason);

      // Log emergency access (could integrate with HCS)
      console.log(`Emergency access: ${doctorDid} -> ${recordId} (${reason})`);

      toast.success('Emergency access granted');
      return data;
    } catch (error) {
      console.error('Failed emergency access:', error);
      toast.error('Failed to grant emergency access');
      throw error;
    }
  }, [state.vault]);

  // Initialize on mount
  useEffect(() => {
    initializeVault();
  }, [initializeVault]);

  return {
    // State
    ...state,

    // Actions
    storeHealthRecord,
    grantConsentWithReward,
    stakeTokens,
    emergencyAccess,

    // Getters
    getVaultStats,
    getTokenStats,
    refreshData: initializeVault,

    // Computed values
    isInitialized: !!state.vault && !state.isLoading,
    hasRecords: state.vault ? state.vault.getVaultStats().totalRecords > 0 : false,
    totalEarned: state.healRewards.reduce((sum, reward) => sum + reward.amount, 0)
  };
}

export default usePrivacyEconomy;
