document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const closeModal = document.getElementById('closeModal');
    const metamaskBtn = document.getElementById('metamaskBtn');
    const walletConnectBtn = document.getElementById('walletConnectBtn');
    const coinbaseBtn = document.getElementById('coinbaseBtn');
    const waitlistForm = document.getElementById('waitlistForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');
    const waitlistContainer = document.getElementById('waitlist-form');
    const successMessage = document.getElementById('success-message');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddressSpan = document.getElementById('walletAddress');

    // Wallet Connection Functions
    async function connectMetaMask() {
        try {
            if (!window.ethereum) {
                window.open('https://metamask.io/download.html', '_blank');
                return;
            }
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleConnectedWallet(accounts[0], 'MetaMask');
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // Wallet disconnected
                    resetWalletConnection();
                } else {
                    // Account changed
                    handleConnectedWallet(accounts[0], 'MetaMask');
                }
            });
        } catch (error) {
            console.error('MetaMask connection error:', error);
            alert('Failed to connect MetaMask: ' + error.message);
        }
    }

    async function connectWalletConnect() {
        try {
            const provider = new WalletConnectProvider.default({
                rpc: {
                    1: "https://mainnet.infura.io/v3/534b7dbe207e43f59228b1cee99db90f",
                    56: "https://bsc-dataseed.binance.org/",
                    // Add other chains as needed
                }
            });
            
            await provider.enable();
            const web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            handleConnectedWallet(accounts[0], 'WalletConnect');
            
            // Subscribe to events
            provider.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) {
                    resetWalletConnection();
                } else {
                    handleConnectedWallet(accounts[0], 'WalletConnect');
                }
            });
        } catch (error) {
            console.error('WalletConnect error:', error);
            alert('Failed to connect via WalletConnect: ' + error.message);
        }
    }

    async function connectCoinbase() {
        try {
            if (window.ethereum && window.ethereum.isCoinbaseWallet) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleConnectedWallet(accounts[0], 'Coinbase');
                
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        resetWalletConnection();
                    } else {
                        handleConnectedWallet(accounts[0], 'Coinbase');
                    }
                });
            } else {
                window.open('https://www.coinbase.com/wallet', '_blank');
            }
        } catch (error) {
            console.error('Coinbase connection error:', error);
            alert('Failed to connect Coinbase Wallet: ' + error.message);
        }
    }

    function handleConnectedWallet(address, walletName) {
        const shortenedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        walletAddressSpan.textContent = `${walletName}: ${shortenedAddress}`;
        walletInfo.style.display = 'block';
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.style.backgroundColor = '#10b981';
        submitBtn.disabled = false;
        submitBtn.classList.add('enabled');
        walletModal.style.display = 'none';
    }

    function resetWalletConnection() {
        walletInfo.style.display = 'none';
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.style.backgroundColor = '#3b82f6';
        submitBtn.disabled = true;
        submitBtn.classList.remove('enabled');
    }

    // Event Listeners
    connectWalletBtn.addEventListener('click', () => {
        walletModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        walletModal.style.display = 'none';
    });

    metamaskBtn.addEventListener('click', connectMetaMask);
    walletConnectBtn.addEventListener('click', connectWalletConnect);
    coinbaseBtn.addEventListener('click', connectCoinbase);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });

    // Form submission
    waitlistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate email
        if (!emailInput.value || !emailInput.validity.valid) {
            alert('Please enter a valid email address');
            return;
        }

        // Generate a referral code (8 characters, alphanumeric)
        const referralCode = generateReferralCode(8);
        
        // Display the referral code
        document.getElementById('referral-code').textContent = referralCode;
        
        // In a real app, you would send this data to your server
        console.log('Form submitted:', {
            email: emailInput.value,
            referral: document.getElementById('referral').value,
            walletAddress: walletAddressSpan.textContent,
            userReferralCode: referralCode
        });

        // Show success message
        waitlistContainer.style.display = 'none';
        successMessage.style.display = 'block';
        document.getElementById('referral-section').style.display = 'block';
    });

    // Function to generate referral code
    function generateReferralCode(length) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
});
