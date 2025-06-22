import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Share, Clipboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { showToast } from '../../utils/toast';
import ReferralService from '../../connections/referrals';

interface TeamMember {
    id: string;
    name: string;
    joinDate: string;
    reward: number;
    status: 'active' | 'pending' | 'inactive';
    earnings: number;
    avatar?: string;
}

const Team: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');
    const [teamData, setTeamData] = useState<any>(null);

    // Load team data
    const loadTeamData = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await ReferralService.getTeamData();

            if (response.success && response.data) {
                setTeamData(response.data);
            } else {
                showToast.error(response.message || 'Failed to load team data');
            }
        } catch (error) {
            console.error('Error loading team data:', error);
            showToast.error('Failed to load team data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTeamData();
    }, []);

    const onRefresh = () => {
        loadTeamData(true);
    };

    const shareReferralCode = async () => {
        if (!teamData?.user?.referralCode) return;

        try {
            const message = `Join UniVest and start investing with my referral code: ${teamData.user.referralCode}\n\nGet ₹250 bonus on your first investment!\n\nDownload now: https://univest.app/invite`;

            await Share.share({
                message,
                title: 'Join UniVest',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const copyReferralCode = () => {
        if (!teamData?.user?.referralCode) return;

        Clipboard.setString(teamData.user.referralCode);
        showToast.success('Referral code copied!', 'Success');
    };

    const withdrawBalance = async () => {
        if (!teamData?.user?.referralBalance || teamData.user.referralBalance <= 0) {
            showToast.error('No balance to withdraw');
            return;
        }

        try {
            const result = await ReferralService.withdrawReferralBalance(teamData.user.referralBalance);

            if (result.success) {
                // Reload data to get updated balances
                loadTeamData();
            }
        } catch (error) {
            console.error('Error withdrawing balance:', error);
        }
    };

    const filteredMembers = teamData?.teamMembers?.filter((member: TeamMember) => {
        if (selectedTab === 'all') return true;
        return member.status === selectedTab;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'inactive': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getRankGradient = (rank: string) => {
        switch (rank.toLowerCase()) {
            case 'bronze': return '#CD7F32';
            case 'silver': return '#C0C0C0';
            case 'gold': return '#FFD700';
            case 'diamond': return '#6B5B95';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#f0f9ff' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Loading team data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#f0f9ff' }}>
            {/* Animated Background */}
            <View className="absolute inset-0">
                <View className="absolute inset-0" style={{ backgroundColor: '#e0f2fe' }} />
                <View className="absolute top-20 right-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: '#3b82f6' }} />
                <View className="absolute bottom-40 left-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#60a5fa' }} />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View className="px-6 py-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-gray-900 text-3xl font-black">
                                My Team
                            </Text>
                            <Text className="text-gray-600 text-base mt-1">
                                Build your network & earn rewards
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="rounded-2xl p-3 bg-white shadow-lg border border-blue-100"
                            activeOpacity={0.8}
                            onPress={onRefresh}
                        >
                            <FeatherIcon name="refresh-cw" size={24} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>

                    {/* Rank Card */}
                    <View
                        className="rounded-3xl p-6 mb-6 shadow-2xl"
                        style={{ backgroundColor: getRankGradient(teamData?.user?.tier || 'bronze') }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-3 shadow-lg">
                                    <FeatherIcon name="award" size={28} color={getRankGradient(teamData?.user?.tier || 'bronze')} />
                                </View>
                                <View>
                                    <Text className="text-white text-sm font-medium opacity-90">Current Rank</Text>
                                    <Text className="text-white text-2xl font-black capitalize">{teamData?.user?.tier || 'Bronze'}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-white text-sm font-medium opacity-90">
                                    Next: {teamData?.analytics?.tierProgress?.nextTier || 'Silver'}
                                </Text>
                                <View className="w-24 h-2 bg-white/20 rounded-full mt-2">
                                    <View
                                        className="h-full bg-white rounded-full"
                                        style={{ width: `${teamData?.analytics?.tierProgress?.percentage || 0}%` }}
                                    />
                                </View>
                                <Text className="text-white text-xs font-bold mt-1">
                                    {teamData?.analytics?.tierProgress?.percentage || 0}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row flex-wrap justify-between mb-6">
                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-blue-50" style={{ width: '48%', marginBottom: 16 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="users" size={24} color="#3b82f6" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    {teamData?.analytics?.totalMembers || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">Total Team</Text>
                            <Text className="text-green-600 text-xs font-bold mt-1">
                                {teamData?.analytics?.pendingMembers || 0} pending
                            </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-green-50" style={{ width: '48%', marginBottom: 16 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="activity" size={24} color="#10b981" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    {teamData?.analytics?.activeMembers || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">Active Members</Text>
                            <Text className="text-blue-600 text-xs font-bold mt-1">
                                {teamData?.analytics?.conversionRate || '0'}% conversion
                            </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-purple-50" style={{ width: '48%' }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="gift" size={24} color="#8b5cf6" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    ₹{teamData?.analytics?.totalEarnings || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">Total Earnings</Text>
                            <Text className="text-purple-600 text-xs font-bold mt-1">Lifetime rewards</Text>
                        </View>

                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-orange-50" style={{ width: '48%' }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="trending-up" size={24} color="#f97316" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    ₹{teamData?.analytics?.monthlyEarnings || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">This Month</Text>
                            <Text className="text-orange-600 text-xs font-bold mt-1">
                                From {teamData?.analytics?.activeMembers || 0} active users
                            </Text>
                        </View>
                    </View>

                    {/* Referral Code Card */}
                    <View className="rounded-3xl p-6 mb-6 shadow-2xl" style={{ backgroundColor: '#3b82f6' }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-white/90 text-sm font-medium mb-1">Your Referral Code</Text>
                                <Text className="text-white text-3xl font-black tracking-wider">
                                    {teamData?.user?.referralCode || 'LOADING...'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={copyReferralCode}
                                className="bg-white/20 rounded-2xl p-3"
                                activeOpacity={0.8}
                            >
                                <FeatherIcon name="copy" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Referral Balance */}
                        <View className="bg-white/10 rounded-2xl p-4 mb-4">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-white/80 text-sm">Referral Balance</Text>
                                    <Text className="text-white text-2xl font-black">
                                        ₹{teamData?.user?.referralBalance || 0}
                                    </Text>
                                </View>
                                {(teamData?.user?.referralBalance || 0) > 0 && (
                                    <TouchableOpacity
                                        onPress={withdrawBalance}
                                        className="bg-white rounded-xl px-4 py-2"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-blue-600 font-bold">Withdraw</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                className="flex-1 bg-white rounded-2xl py-4 shadow-lg"
                                activeOpacity={0.8}
                                onPress={shareReferralCode}
                            >
                                <View className="flex-row items-center justify-center">
                                    <FeatherIcon name="share-2" size={20} color="#3b82f6" />
                                    <Text className="text-blue-600 text-base font-black ml-2">Share Code</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-white/20 rounded-2xl px-6 py-4"
                                activeOpacity={0.8}
                            >
                                <View className="flex-row items-center justify-center">
                                    <FeatherIcon name="info" size={20} color="white" />
                                    <Text className="text-white text-base font-bold ml-2">How it works</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Team Members Section */}
                    <View className="mb-6">
                        <Text className="text-gray-900 text-xl font-black mb-4">Team Members</Text>

                        {/* Tabs */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            {['all', 'active', 'pending', 'inactive'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setSelectedTab(tab)}
                                    className={`mr-3 px-5 py-2.5 rounded-2xl ${selectedTab === tab
                                        ? 'bg-blue-600 shadow-lg'
                                        : 'bg-white border border-gray-200'
                                        }`}
                                    activeOpacity={0.8}
                                >
                                    <Text className={`font-bold text-sm capitalize ${selectedTab === tab ? 'text-white' : 'text-gray-700'
                                        }`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Members List */}
                        {filteredMembers.map((member: TeamMember, index: number) => (
                            <TouchableOpacity
                                key={member.id}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-md border border-gray-100"
                                activeOpacity={0.95}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg" style={{ backgroundColor: '#3b82f6' }}>
                                        <Text className="text-white text-lg font-black">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-gray-900 font-black text-base">{member.name}</Text>
                                            <View className="flex-row items-center">
                                                <View
                                                    className="w-2 h-2 rounded-full mr-2"
                                                    style={{ backgroundColor: getStatusColor(member.status) }}
                                                />
                                                <Text
                                                    className="text-xs font-bold capitalize"
                                                    style={{ color: getStatusColor(member.status) }}
                                                >
                                                    {member.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-gray-500 text-xs font-medium">
                                                Joined {new Date(member.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Text className="text-gray-500 text-xs mr-3">
                                                    Earned: ₹{member.earnings}
                                                </Text>
                                                <View className="px-3 py-1 bg-green-50 rounded-xl">
                                                    <Text className="text-green-600 font-black text-xs">
                                                        +₹{member.reward}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {filteredMembers.length === 0 && (
                            <View className="items-center py-12">
                                <Text className="text-gray-500 text-lg">
                                    {selectedTab === 'all'
                                        ? 'No team members yet. Share your referral code to start building your team!'
                                        : `No ${selectedTab} members found`}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom Spacer */}
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Team; 