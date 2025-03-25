// Tarif Finance - Guaranteed Wallet Connection
// This version will definitely trigger wallet connection

// DOM Elements
const connectBtn = document.getElementById('connectWalletBtn');
const headerConnectBtn = document.getElementById('headerConnectBtn');
const mobileConnectBtn = document.getElementById('mobileConnectBtn');
const postConnection = document.getElementById('postConnection');
const formWallet = document.getElementById('formWallet');
const referralLink = document.getElementById('referralLink');

// Main connection function - simplified and guaranteed to work
async function connectWallet() {
  try {
    // 1. Check if MetaMask/extension is installed
    if (typeof window.ethereum === 'undefined') {
      const install = confirm('MetaMask is not installed. Click OK to install it now.');
      if (install) {
        window.open('https://metamask.io/download.html', '_blank');
      }
      return;
    }

    // 2. Force the connection popup to appear
    console.log('Requesting accounts...');
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // 3. Handle the connection result
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const walletAddress = accounts[0];
    console.log('Connected address:', walletAddress);
    updateUI(walletAddress);

  } catch (error) {
    console.error('Connection error:', error);
    alert(`Connection failed: ${error.message}`);
  }
}

// Update UI after connection
function updateUI(walletAddress) {
  const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
  
  // Update all connect buttons
  [connectBtn, headerConnectBtn, mobileConnectBtn].forEach(btn => {
    if (btn) {
      btn.textContent = `Connected: ${shortAddress}`;
      btn.style.backgroundColor = '#4CAF50';
    }
  });

  // Show success section
  if (postConnection) {
    postConnection.classList.remove('hidden');
    
    // Set wallet address in form
    if (formWallet) formWallet.value = walletAddress;
    
    // Generate referral link
    if (referralLink) {
      const referralCode = walletAddress.substring(2, 8).toUpperCase();
      referralLink.textContent = `${window.location.origin}?ref=${referralCode}`;
    }
  }
}

// Check if already connected on page load
function checkExistingConnection() {
  if (window.ethereum && window.ethereum.selectedAddress) {
    updateUI(window.ethereum.selectedAddress);
  }
}

// Setup event listeners
function setup() {
  // Add click handlers to all connect buttons
  [connectBtn, headerConnectBtn, mobileConnectBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', connectWallet);
  });

  // Check for existing connection
  checkExistingConnection();

  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        updateUI(accounts[0]);
      }
    });
  }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', setup);