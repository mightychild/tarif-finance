document.addEventListener('DOMContentLoaded', async function() {
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

    // Wallet Connection State
    let walletProvider = null;

    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Initialize WalletConnect
    async function initWalletConnect() {
        try {
            const WalletConnectProvider = window.WalletConnectProvider.default;
            const provider = new WalletConnectProvider({
                rpc: {
                    1: "https://cloudflare-eth.com", // Free public RPC
                    56: "https://bsc-dataseed.binance.org/",
                    137: "https://polygon-rpc.com/"
                },
                bridge: "https://bridge.walletconnect.org",
                qrcodeModalOptions: {
                    mobileLinks: [
                        'metamask',
                        'trust',
                        'coinbase',
                        'argent'
                    ]
                }
            });
            
            await provider.enable();
            return provider;
        } catch (error) {
            console.error("WalletConnect Error:", error);
            throw error;
        }
    }

    // Connect MetaMask
    async function connectMetaMask() {
        try {
            if (!window.ethereum) {
                // If on mobile and no injected provider, try deep linking
                if (isMobile) {
                    window.location.href = "https://metamask.app.link/dapp/" + window.location.hostname;
                    throw new Error("Redirecting to MetaMask...");
                } else {
                    window.open('https://metamask.io/download.html', '_blank');
                    throw new Error("MetaMask not installed");
                }
            }
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return {
                address: accounts[0],
                provider: window.ethereum,
                name: 'MetaMask'
            };
        } catch (error) {
            console.error("MetaMask Error:", error);
            throw error;
        }
    }

    // Connect Coinbase Wallet
    async function connectCoinbase() {
        try {
            if (window.coinbaseWalletExtension) {
                const accounts = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
                return {
                    address: accounts[0],
                    provider: window.coinbaseWalletExtension,
                    name: 'Coinbase'
                };
            } else if (window.ethereum?.isCoinbaseWallet) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                return {
                    address: accounts[0],
                    provider: window.ethereum,
                    name: 'Coinbase'
                };
            } else if (isMobile) {
                window.location.href = "https://go.cb-w.com/dapp?cb_url=" + encodeURIComponent(window.location.href);
                throw new Error("Redirecting to Coinbase Wallet...");
            } else {
                window.open('https://www.coinbase.com/wallet', '_blank');
                throw new Error("Coinbase Wallet not installed");
            }
        } catch (error) {
            console.error("Coinbase Error:", error);
            throw error;
        }
    }

    // Handle Successful Connection
    function handleConnectedWallet(result) {
        const { address, name } = result;
        const shortenedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        
        walletAddressSpan.textContent = `${name}: ${shortenedAddress}`;
        walletInfo.style.display = 'block';
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.style.backgroundColor = '#10b981';
        submitBtn.disabled = false;
        submitBtn.classList.add('enabled');
        walletModal.style.display = 'none';
        
        // Store provider reference
        walletProvider = result.provider;

        // Add event listeners for account changes
        if (name === 'MetaMask' || name === 'Coinbase') {
            walletProvider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    resetWalletConnection();
                } else {
                    walletAddressSpan.textContent = `${name}: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`;
                }
            });
            
            walletProvider.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }

    // Reset connection
    function resetWalletConnection() {
        walletInfo.style.display = 'none';
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.style.backgroundColor = '#3b82f6';
        submitBtn.disabled = true;
        submitBtn.classList.remove('enabled');
        walletProvider = null;
    }

    // Event Listeners
    connectWalletBtn.addEventListener('click', () => {
        walletModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        walletModal.style.display = 'none';
    });

    metamaskBtn.addEventListener('click', async () => {
        try {
            const result = await connectMetaMask();
            handleConnectedWallet(result);
        } catch (error) {
            alert(`MetaMask Error: ${error.message}`);
        }
    });

    walletConnectBtn.addEventListener('click', async () => {
        try {
            const provider = await initWalletConnect();
            const web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            
            handleConnectedWallet({
                address: accounts[0],
                provider: provider,
                name: 'WalletConnect'
            });
            
            // Handle WalletConnect events
            provider.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) resetWalletConnection();
            });
            
            provider.on("disconnect", () => {
                resetWalletConnection();
            });
            
        } catch (error) {
            alert(`WalletConnect Error: ${error.message}`);
        }
    });

    coinbaseBtn.addEventListener('click', async () => {
        try {
            const result = await connectCoinbase();
            handleConnectedWallet(result);
        } catch (error) {
            alert(`Coinbase Error: ${error.message}`);
        }
    });

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

    // Check if wallet is already connected
    async function checkConnectedWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    handleConnectedWallet({
                        address: accounts[0],
                        provider: window.ethereum,
                        name: window.ethereum.isMetaMask ? 'MetaMask' : 
                             window.ethereum.isCoinbaseWallet ? 'Coinbase' : 'Injected'
                    });
                }
            } catch (error) {
                console.error("Error checking connected wallet:", error);
            }
        }
    }

    // Initialize wallet connection check
    checkConnectedWallet();
});
