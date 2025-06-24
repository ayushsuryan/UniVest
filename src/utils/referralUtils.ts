// Referral utility functions

export const generateReferralShareURL = (referralCode: string): string => {
  const baseURL = 'https://Byaaj.app'; // Update with your actual app URL
  return `${baseURL}/register?ref=${referralCode}`;
};

export const generateReferralShareMessage = (referralCode: string, userName?: string): string => {
  const shareURL = generateReferralShareURL(referralCode);
  
  return `🚀 ${userName ? `${userName} invited you to` : 'Join me on'} Byaaj and start earning! 

Use my referral code: ${referralCode}

🎉 Get ₹250 bonus on your first investment!
💰 Start building your wealth with hourly returns

Download now: ${shareURL}`;
};

export const extractReferralCodeFromURL = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch (error) {
    return null;
  }
};

export const getTierInfo = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return { 
        color: '#CD7F32', 
        icon: '🥉', 
        rate: '30%', 
        next: 'Silver',
        minReferrals: 0,
        maxReferrals: 4
      };
    case 'silver':
      return { 
        color: '#C0C0C0', 
        icon: '🥈', 
        rate: '50%', 
        next: 'Gold',
        minReferrals: 5,
        maxReferrals: 11
      };
    case 'gold':
      return { 
        color: '#FFD700', 
        icon: '🥇', 
        rate: '70%', 
        next: 'Diamond',
        minReferrals: 12,
        maxReferrals: 24
      };
    case 'diamond':
      return { 
        color: '#6B5B95', 
        icon: '💎', 
        rate: '100%', 
        next: 'Max',
        minReferrals: 25,
        maxReferrals: 999
      };
    default:
      return { 
        color: '#6B7280', 
        icon: '🥉', 
        rate: '30%', 
        next: 'Silver',
        minReferrals: 0,
        maxReferrals: 4
      };
  }
};

export const formatReferralEarnings = (amount: number): string => {
  if (amount >= 1000000) {
    return `₹${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toFixed(0)}`;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'inactive': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getStatusMessage = (status: string): string => {
  switch (status) {
    case 'active': return 'Earning returns';
    case 'pending': return 'Waiting for first investment';
    case 'inactive': return 'No recent activity';
    default: return '';
  }
}; 