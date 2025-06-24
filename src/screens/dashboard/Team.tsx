import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Share, Clipboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { showToast } from '../../utils/toast';
import ReferralService from '../../connections/referrals';
import { 
    getTierInfo, 
    getStatusColor, 
    getStatusMessage, 
    generateReferralShareMessage,
    formatReferralEarnings 
} from '../../utils/referralUtils';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    status: 'active' | 'pending' | 'inactive';
    totalEarnings: number;
    monthlyEarnings: number;
    firstInvestmentDate?: string;
}

interface ReferralDashboardData {
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    pendingReferrals: number;
    tier: string;
    referralBalance: number;
    totalEarnings: number;
    monthlyEarnings: number;
    team: TeamMember[];
    tierProgress: {
        current: string;
        next: string;
        referralsNeeded: number;
        percentage: number;
    };
}

const Team: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');
    const [dashboardData, setDashboardData] = useState<ReferralDashboardData | null>(null);

    // Load referral dashboard data
    const loadDashboardData = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await ReferralService.getReferralDashboard();

            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                showToast.error(response.message || 'Failed to load referral data');
            }
        } catch (error) {
            console.error('Error loading referral dashboard:', error);
            showToast.error('Failed to load referral data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const onRefresh = () => {
        loadDashboardData(true);
    };

    const shareReferralCode = async () => {
        if (!dashboardData?.referralCode) return;

        try {
            const message = generateReferralShareMessage(dashboardData.referralCode);

            await Share.share({
                message,
                title: 'Join Hourly Club - Get ₹250 Bonus!',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const copyReferralCode = () => {
        if (!dashboardData?.referralCode) return;

        Clipboard.setString(dashboardData.referralCode);
        showToast.success('Referral code copied to clipboard!', 'Success');
    };

    const withdrawBalance = async () => {
        if (!dashboardData?.referralBalance || dashboardData.referralBalance <= 0) {
            showToast.error('No balance to withdraw');
            return;
        }

        try {
            const result = await ReferralService.withdrawReferralBalance(dashboardData.referralBalance);

            if (result.success) {
                showToast.success('Withdrawal successful! Amount transferred to main balance.', 'Success');
                // Reload data to get updated balances
                loadDashboardData();
            }
        } catch (error) {
            console.error('Error withdrawing balance:', error);
        }
    };

    const filteredMembers = dashboardData?.team?.filter((member: TeamMember) => {
        if (selectedTab === 'all') return true;
        return member.status === selectedTab;
    }) || [];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#f0f9ff' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-600 mt-4">Loading referral dashboard...</Text>
            </SafeAreaView>
        );
    }

    const tierInfo = getTierInfo(dashboardData?.tier || 'bronze');

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

                    {/* Tier Card */}
                    <View
                        className="rounded-3xl p-6 mb-6 shadow-2xl"
                        style={{ backgroundColor: tierInfo.color }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-3 shadow-lg">
                                    <Text style={{ fontSize: 24 }}>{tierInfo.icon}</Text>
                                </View>
                                <View>
                                    <Text className="text-white text-sm font-medium opacity-90">Current Tier</Text>
                                    <Text className="text-white text-2xl font-black capitalize">
                                        {dashboardData?.tier || 'Bronze'} ({tierInfo.rate})
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-white text-sm font-medium opacity-90">
                                    Next: {dashboardData?.tierProgress?.next || tierInfo.next}
                                </Text>
                                <View className="w-24 h-2 bg-white/20 rounded-full mt-2">
                                    <View
                                        className="h-full bg-white rounded-full"
                                        style={{ width: `${dashboardData?.tierProgress?.percentage || 0}%` }}
                                    />
                                </View>
                                <Text className="text-white text-xs font-bold mt-1">
                                    {dashboardData?.tierProgress?.percentage || 0}%
                                </Text>
                            </View>
                        </View>
                        
                        {dashboardData?.tierProgress?.referralsNeeded && dashboardData.tierProgress.referralsNeeded > 0 && (
                            <Text className="text-white text-xs opacity-90">
                                {dashboardData.tierProgress.referralsNeeded} more referrals needed for {dashboardData.tierProgress.next}
                            </Text>
                        )}
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row flex-wrap justify-between mb-6">
                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-blue-50" style={{ width: '48%', marginBottom: 16 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="users" size={24} color="#3b82f6" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    {dashboardData?.totalReferrals || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">Total Team</Text>
                            <Text className="text-orange-600 text-xs font-bold mt-1">
                                {dashboardData?.pendingReferrals || 0} pending
                            </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-green-50" style={{ width: '48%', marginBottom: 16 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="activity" size={24} color="#10b981" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    {dashboardData?.activeReferrals || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">Active Members</Text>
                            <Text className="text-green-600 text-xs font-bold mt-1">
                                Earning {tierInfo.rate}
                            </Text>
                        </View>

                        <View className="bg-white rounded-2xl p-5 shadow-lg border border-purple-50" style={{ width: '48%' }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                                    <FeatherIcon name="gift" size={24} color="#8b5cf6" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900">
                                    ₹{dashboardData?.totalEarnings || 0}
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
                                    ₹{dashboardData?.monthlyEarnings || 0}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">This Month</Text>
                            <Text className="text-orange-600 text-xs font-bold mt-1">
                                From {dashboardData?.activeReferrals || 0} active users
                            </Text>
                        </View>
                    </View>

                    {/* Referral Code Card */}
                    <View className="rounded-3xl p-6 mb-6 shadow-2xl" style={{ backgroundColor: '#3b82f6' }}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-white/90 text-sm font-medium mb-1">Your Referral Code</Text>
                                <Text className="text-white text-3xl font-black tracking-wider">
                                    {dashboardData?.referralCode || 'LOADING...'}
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
                                        ₹{dashboardData?.referralBalance || 0}
                                    </Text>
                                </View>
                                {(dashboardData?.referralBalance || 0) > 0 && (
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
                                onPress={() => {
                                    showToast.success(
                                        `Share your code with friends. They get ₹250 bonus on first investment, you earn ${tierInfo.rate} of their returns!`,
                                        'How it works'
                                    );
                                }}
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
                                                    Earned: ₹{member.totalEarnings}
                                                </Text>
                                                <View className="px-3 py-1 bg-green-50 rounded-xl">
                                                    <Text className="text-green-600 font-black text-xs">
                                                        +₹{member.monthlyEarnings}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        {member.status === 'pending' && (
                                            <Text className="text-orange-500 text-xs mt-1 font-medium">
                                                💡 Will activate when they make their first investment
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {filteredMembers.length === 0 && (
                            <View className="items-center py-12">
                                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                                    <FeatherIcon name="users" size={40} color="#3b82f6" />
                                </View>
                                <Text className="text-gray-500 text-lg font-medium text-center mb-2">
                                    {selectedTab === 'all'
                                        ? 'No team members yet'
                                        : `No ${selectedTab} members found`}
                                </Text>
                                {selectedTab === 'all' && (
                                    <>
                                        <Text className="text-gray-400 text-sm text-center mb-4">
                                            Share your referral code to start building your team!
                                        </Text>
                                        <TouchableOpacity
                                            onPress={shareReferralCode}
                                            className="bg-blue-600 rounded-xl px-6 py-3"
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-white font-bold">Share Your Code</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
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