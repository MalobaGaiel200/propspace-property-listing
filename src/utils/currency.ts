/**
 * Formats property price based on country and status
 */
export const formatPropertyPrice = (price: number, country: string = 'Cameroon', status: string = '') => {
  const isCameroon = !country || country.toLowerCase().includes('cameroon') || country.toLowerCase().includes('cameroun');
  
  if (isCameroon) {
    const formatted = new Intl.NumberFormat('en-US').format(price);
    const withCurrency = `${formatted} FCFA`;
    return status === 'For Rent' ? `${withCurrency}/mo` : withCurrency;
  } else {
    // Other countries, support USD if US, etc.
    if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa') || country.toLowerCase().includes('us')) {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price);
      return status === 'For Rent' ? `${formatted}/mo` : formatted;
    }
    
    // Default fallback to FCFA since PropSpace is Cameroon-centric
    const formatted = new Intl.NumberFormat('en-US').format(price);
    const withCurrency = `${formatted} FCFA`;
    return status === 'For Rent' ? `${withCurrency}/mo` : withCurrency;
  }
};
