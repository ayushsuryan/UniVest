import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, Modal} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomInput from './CustomInput';
import { showToast } from '../utils/toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'investment';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(24567.89);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'earning',
      amount: 125.50,
      description: 'Hourly Returns - Phone Chargers',
      date: '2024-01-15 14:30',
      status: 'completed',
    },
    {
      id: '2',
      type: 'deposit',
      amount: 5000.00,
      description: 'Bank Transfer - HDFC ****1234',
      date: '2024-01-15 10:15',
      status: 'completed',
    },
    {
      id: '3',
      type: 'investment',
      amount: -2000.00,
      description: 'Invested in Bluetooth Earbuds',
      date: '2024-01-14 16:45',
      status: 'completed',
    },
    {
      id: '4',
      type: 'earning',
      amount: 89.25,
      description: 'Hourly Returns - LED Monitors',
      date: '2024-01-14 13:30',
      status: 'completed',
    },
    {
      id: '5',
      type: 'withdrawal',
      amount: -1500.00,
      description: 'Withdrawal to Bank Account',
      date: '2024-01-13 11:20',
      status: 'completed',
    },
  ];

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }
    
    const amount = parseFloat(depositAmount);
    setBalance(prev => prev + amount);
    setDepositAmount('');
    setShowDepositModal(false);
    showToast.success(`₹${amount.toFixed(2)} deposited successfully!`, 'Success');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount > balance) {
      showToast.error('Insufficient balance');
      return;
    }
    
    setBalance(prev => prev - amount);
    setWithdrawAmount('');
    setShowWithdrawModal(false);
    showToast.success(`₹${amount.toFixed(2)} withdrawal initiated!`, 'Success');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'earning': return 'trending-up';
      case 'investment': return 'shopping-cart';
      default: return 'circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return '#10b981';
      case 'withdrawal': return '#ef4444';
      case 'earning': return '#059669';
      case 'investment': return '#0891b2';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Decorative Background */}
      <View className="absolute inset-0">
        <View
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: '#059669' }}
        />
        <View
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ backgroundColor: '#10b981' }}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-8 mb-6">
          <Text className="text-gray-900 text-3xl font-black mb-2">
            My Wallet 💰
          </Text>
          <Text className="text-gray-600 text-base">
            Manage your trading funds
          </Text>
        </View>

        {/* Balance Card */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <View className="items-center mb-6">
              <Text className="text-gray-600 text-base font-medium mb-2">
                Available Balance
              </Text>
              <Text className="text-gray-900 text-4xl font-black mb-4">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <View className="flex-row items-center">
                <FeatherIcon name="shield" size={16} color="#10b981" />
                <Text className="text-green-600 text-sm font-bold ml-2">
                  Secured & Insured
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setShowDepositModal(true)}
                className="flex-1 rounded-2xl p-4 shadow-lg"
                style={{
                  backgroundColor: '#059669',
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <FeatherIcon name="plus-circle" size={20} color="white" />
                  <Text className="text-white text-lg font-black ml-2">
                    Deposit
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowWithdrawModal(true)}
                className="flex-1 rounded-2xl p-4 border-2 border-gray-200 bg-white"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <FeatherIcon name="arrow-up-circle" size={20} color="#6b7280" />
                  <Text className="text-gray-700 text-lg font-black ml-2">
                    Withdraw
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <FeatherIcon name="trending-up" size={20} color="#10b981" />
                <Text className="text-green-600 text-sm font-bold">+12.5%</Text>
              </View>
              <Text className="text-gray-500 text-sm">This Month</Text>
              <Text className="text-gray-900 text-xl font-black">₹3,245</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <FeatherIcon name="clock" size={20} color="#059669" />
                <Text className="text-emerald-600 text-sm font-bold">Live</Text>
              </View>
              <Text className="text-gray-500 text-sm">Hourly Earnings</Text>
              <Text className="text-gray-900 text-xl font-black">₹125.50</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View className="px-6 mb-8">
          <Text className="text-gray-900 text-xl font-black mb-4">
            Recent Transactions
          </Text>
          <View className="bg-white rounded-3xl shadow-lg border border-gray-100">
            {transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                className={`flex-row items-center px-6 py-5 ${
                  index !== transactions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View
                  className="rounded-2xl p-3 mr-4"
                  style={{ backgroundColor: `${getTransactionColor(transaction.type)}15` }}
                >
                  <FeatherIcon
                    name={getTransactionIcon(transaction.type)}
                    size={20}
                    color={getTransactionColor(transaction.type)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {transaction.description}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {new Date(transaction.date).toLocaleString()}
                  </Text>
                </View>
                <Text
                  className={`font-black text-lg ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-2xl font-black">
                Deposit Funds
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <FeatherIcon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Amount"
              placeholder="Enter amount to deposit"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />

            <View className="flex-row space-x-4 mt-6">
              <TouchableOpacity
                onPress={() => setShowDepositModal(false)}
                className="flex-1 rounded-2xl p-4 border-2 border-gray-200 bg-white"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-lg font-bold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeposit}
                className="flex-1 rounded-2xl p-4"
                style={{ backgroundColor: '#059669' }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold text-center">
                  Deposit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-2xl font-black">
                Withdraw Funds
              </Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <FeatherIcon name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Amount"
              placeholder="Enter amount to withdraw"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />

            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-gray-600 text-sm text-center">
                Available Balance: ₹{balance.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                className="flex-1 rounded-2xl p-4 border-2 border-gray-200 bg-white"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-lg font-bold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWithdraw}
                className="flex-1 rounded-2xl p-4"
                style={{ backgroundColor: '#ef4444' }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold text-center">
                  Withdraw
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Wallet; 