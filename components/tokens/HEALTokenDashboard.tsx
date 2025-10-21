"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  PiggyBank,
  Users,
  Award,
  Clock,
  DollarSign,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import HEALTokenService, { TokenReward, TokenStake } from '@/services/healTokenService';

interface HEALTokenDashboardProps {
  userDid: string;
}

export function HEALTokenDashboard({ userDid }: HEALTokenDashboardProps) {
  const [balance, setBalance] = useState<number>(0);
  const [rewards, setRewards] = useState<TokenReward[]>([]);
  const [stakes, setStakes] = useState<TokenStake[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stakingForm, setStakingForm] = useState({
    amount: '',
    lockPeriod: 30
  });

  // Load user data
  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceData, rewardsData, stakesData, marketData, distributionData] = await Promise.all([
        HEALTokenService.getTokenBalance(userDid),
        HEALTokenService.getRewardHistory(userDid),
        HEALTokenService.getStakingInfo(userDid),
        HEALTokenService.getMarketStats(),
        HEALTokenService.getTokenDistribution()
      ]);

      setBalance(balanceData);
      setRewards(rewardsData);
      setStakes(stakesData);
      setMarketStats(marketData);
      setDistribution(distributionData);
    } catch (error) {
      console.error('Failed to load token data:', error);
      toast.error('Failed to load token data');
    } finally {
      setLoading(false);
    }
  }, [userDid]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Stake tokens
  const handleStakeTokens = async () => {
    const amount = parseInt(stakingForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await HEALTokenService.stakeTokens(userDid, amount, stakingForm.lockPeriod);
      toast.success(`Staked ${amount} HEAL tokens for ${stakingForm.lockPeriod} days`);
      setStakingForm({ amount: '', lockPeriod: 30 });
      loadUserData();
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      toast.error('Failed to stake tokens');
    }
  };

  // Claim staking rewards
  const handleClaimRewards = async (stakeId: string) => {
    try {
      const rewardAmount = await HEALTokenService.claimStakingRewards(stakeId);
      toast.success(`Claimed ${rewardAmount} HEAL tokens in rewards`);
      loadUserData();
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  // Simulate earning rewards
  const simulateEarnRewards = async () => {
    try {
      await HEALTokenService.rewardQualityData(userDid, 'high');
      toast.success('Earned HEAL tokens for data contribution!');
      loadUserData();
    } catch (error) {
      console.error('Failed to earn rewards:', error);
      toast.error('Failed to earn rewards');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Coins className="h-8 w-8 text-yellow-400" />
            HEAL Token Economy
          </h1>
          <p className="text-gray-400 mt-2">
            Earn, stake, and manage your HEAL tokens for healthcare data sharing
          </p>
        </div>

        <Button onClick={simulateEarnRewards} className="bg-yellow-600 hover:bg-yellow-700">
          <Gift className="h-4 w-4 mr-2" />
          Earn Rewards
        </Button>
      </div>

      {/* Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Coins className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Your Balance</p>
                <p className="text-2xl font-bold text-white">{balance.toLocaleString()}</p>
                <p className="text-xs text-gray-500">HEAL Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Token Price</p>
                <p className="text-2xl font-bold text-white">${marketStats?.price?.toFixed(4) || '0.0000'}</p>
                <p className={`text-xs ${marketStats?.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {marketStats?.priceChange24h >= 0 ? '+' : ''}{marketStats?.priceChange24h?.toFixed(2) || '0.00'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Rewards</p>
                <p className="text-2xl font-bold text-white">{rewards.length}</p>
                <p className="text-xs text-gray-500">Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PiggyBank className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Active Stakes</p>
                <p className="text-2xl font-bold text-white">{stakes.filter(s => s.status === 'active').length}</p>
                <p className="text-xs text-gray-500">Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earn" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earn">Earn Tokens</TabsTrigger>
          <TabsTrigger value="stake">Stake & Earn</TabsTrigger>
          <TabsTrigger value="rewards">Reward History</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        <TabsContent value="earn" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Earn HEAL Tokens
              </CardTitle>
              <CardDescription className="text-gray-400">
                Participate in the healthcare data economy and earn tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Ways to Earn</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Grant Data Consent</p>
                        <p className="text-xs text-gray-400">Earn 10-50 HEAL per consent based on data sensitivity</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">High-Quality Data</p>
                        <p className="text-xs text-gray-400">Earn bonus tokens for complete, accurate health data</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Emergency Access</p>
                        <p className="text-xs text-gray-400">Earn tokens for enabling emergency data access</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Your Earnings</h4>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Earned</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {rewards.reduce((sum, reward) => sum + reward.amount, 0).toLocaleString()} HEAL
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">This Month</span>
                      <span className="text-sm text-green-400">
                        +{rewards.filter(r => new Date(r.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).reduce((sum, r) => sum + r.amount, 0)} HEAL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Stake Tokens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Earn rewards by staking your HEAL tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Amount to Stake</Label>
                  <Input
                    type="number"
                    value={stakingForm.amount}
                    onChange={(e) => setStakingForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Lock Period</Label>
                  <select
                    value={stakingForm.lockPeriod}
                    onChange={(e) => setStakingForm(prev => ({ ...prev, lockPeriod: parseInt(e.target.value) }))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value={30}>30 Days (2% APR)</option>
                    <option value={90}>90 Days (5% APR)</option>
                    <option value={180}>180 Days (8% APR)</option>
                    <option value={365}>365 Days (12% APR)</option>
                  </select>
                </div>

                <Button onClick={handleStakeTokens} className="w-full bg-purple-600 hover:bg-purple-700">
                  Stake Tokens
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Stakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stakes.filter(s => s.status === 'active').length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No active stakes</p>
                ) : (
                  <div className="space-y-3">
                    {stakes.filter(s => s.status === 'active').map((stake) => (
                      <div key={stake.id} className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{stake.amount} HEAL</span>
                          <Badge className="bg-green-500 text-white text-xs">
                            {stake.lockPeriod} days
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Rewards: {stake.rewards} HEAL</span>
                          <span>Ends: {new Date(stake.endDate).toLocaleDateString()}</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-green-600 hover:bg-green-700"
                          onClick={() => handleClaimRewards(stake.id)}
                        >
                          Claim Rewards
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5" />
                Reward History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No rewards earned yet</p>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {reward.reason === 'consent_granted' && <Gift className="h-5 w-5 text-yellow-400" />}
                        {reward.reason === 'quality_contribution' && <CheckCircle className="h-5 w-5 text-green-400" />}
                        {reward.reason === 'emergency_access' && <Zap className="h-5 w-5 text-blue-400" />}
                        <div>
                          <p className="text-sm font-medium text-white">{reward.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(reward.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-400">+{reward.amount} HEAL</p>
                        <Badge className={`text-xs ${reward.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                          {reward.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-lg font-bold text-white">${marketStats?.price?.toFixed(6) || '0.000000'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">24h Change</span>
                  <span className={`text-sm font-bold ${marketStats?.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {marketStats?.priceChange24h >= 0 ? '+' : ''}{marketStats?.priceChange24h?.toFixed(2) || '0.00'}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">24h Volume</span>
                  <span className="text-sm text-white">${marketStats?.volume24h?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Market Cap</span>
                  <span className="text-sm text-white">${marketStats?.marketCap?.toLocaleString() || '0'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Token Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Supply</span>
                  <span className="text-sm text-white">{distribution?.totalSupply?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Circulating</span>
                  <span className="text-sm text-white">{distribution?.circulatingSupply?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rewards Distributed</span>
                  <span className="text-sm text-green-400">{distribution?.rewardsDistributed?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Community Fund</span>
                  <span className="text-sm text-blue-400">{distribution?.communityFund?.toLocaleString() || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HEALTokenDashboard;
