// CoinGecko API endpoint
const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';

// Update interval in milliseconds (10 seconds)
const UPDATE_INTERVAL = 10000;

// DOM elements
const bitcoinPriceEl = document.getElementById('bitcoin-price');
const ethereumPriceEl = document.getElementById('ethereum-price');
const lastUpdateEl = document.getElementById('last-update');
const errorEl = document.getElementById('error');

/**
 * Fetch crypto prices from CoinGecko API
 */
async function fetchCryptoPrices() {
    try {
        // Show loading state
        showLoading();
        
        // Fetch data from CoinGecko API
        const response = await fetch(API_URL);
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Update UI with new prices
        updatePrices(data);
        
        // Hide error message if it was showing
        hideError();
        
        // Update last update timestamp
        updateTimestamp();
        
        console.log('✅ Prices updated successfully:', data);
        
    } catch (error) {
        // Handle errors gracefully
        console.error('❌ Error fetching crypto prices:', error);
        showError('Failed to fetch prices. Retrying...');
    }
}

/**
 * Show loading state in price elements
 */
function showLoading() {
    // Don't show loading after initial load
    if (bitcoinPriceEl.textContent === 'Loading...') {
        return;
    }
}

/**
 * Update prices in the UI
 * @param {Object} data - Price data from API
 */
function updatePrices(data) {
    // Format and display Bitcoin price
    if (data.bitcoin && data.bitcoin.usd) {
        const btcPrice = formatPrice(data.bitcoin.usd);
        bitcoinPriceEl.innerHTML = `$${btcPrice}`;
    }
    
    // Format and display Ethereum price
    if (data.ethereum && data.ethereum.usd) {
        const ethPrice = formatPrice(data.ethereum.usd);
        ethereumPriceEl.innerHTML = `$${ethPrice}`;
    }
}

/**
 * Format price with thousands separators
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Update the last update timestamp
 */
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdateEl.textContent = `Last updated: ${timeString}`;
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

/**
 * Hide error message
 */
function hideError() {
    errorEl.classList.remove('show');
}

/**
 * Initialize the app
 */
function init() {
    console.log('🚀 Starting crypto price tracker...');
    
    // Fetch prices immediately on load
    fetchCryptoPrices();
    
    // Set up automatic updates every 10 seconds
    setInterval(fetchCryptoPrices, UPDATE_INTERVAL);
    
    console.log(`⏰ Auto-update enabled (every ${UPDATE_INTERVAL / 1000} seconds)`);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
