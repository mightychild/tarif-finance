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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Error display function
    const showError = (message, elementId = null) => {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        errorEl.innerHTML = `<span aria-hidden="true">!</span> ${message}`;
        
        if (elementId) {
            const target = document.getElementById(elementId);
            target.parentNode.insertBefore(errorEl, target.nextSibling);
            target.setAttribute('aria-invalid', 'true');
            target.focus();
        } else {
            waitlistForm.prepend(errorEl);
        }
    };

    // Email validation
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Initialize WalletConnect
    async function initWalletConnect() {
        try {
            walletConnectBtn.setAttribute('aria-busy', 'true');
            connectWalletBtn.classList.add('connecting');
            
            const WalletConnectProvider = window.WalletConnectProvider.default;
            const provider = new WalletConnectProvider({
                rpc: {
                    1: "https://cloudflare-eth.com",
                    56: "https://bsc-dataseed.binance.org/",
                    137: "https://polygon-rpc.com/"
                },
                bridge: "https://bridge.walletconnect.org",
                qrcodeModalOptions: {
                    mobileLinks: ['metamask', 'trust', 'coinbase', 'argent']
                }
            });
            
            await provider.enable();
            return provider;
        } catch (error) {
            showError(`WalletConnect Error: ${error.message}`);
            throw error;
        } finally {
            walletConnectBtn.removeAttribute('aria-busy');
            connectWalletBtn.classList.remove('connecting');
        }
    }

    // Connect MetaMask
    async function connectMetaMask() {
        try {
            metamaskBtn.setAttribute('aria-busy', 'true');
            connectWalletBtn.classList.add('connecting');
            
            if (!window.ethereum) {
                if (isMobile) {
                    window.location.href = "https://metamask.app.link/dapp/" + window.location.hostname;
                    throw new Error("Redirecting to MetaMask...");
                }
                throw new Error("MetaMask not installed");
            }
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return {
                address: accounts[0],
                provider: window.ethereum,
                name: 'MetaMask'
            };
        } catch (error) {
            showError(`MetaMask Error: ${error.message}`);
            throw error;
        } finally {
            metamaskBtn.removeAttribute('aria-busy');
            connectWalletBtn.classList.remove('connecting');
        }
    }

    // Connect Coinbase Wallet
    async function connectCoinbase() {
        try {
            coinbaseBtn.setAttribute('aria-busy', 'true');
            connectWalletBtn.classList.add('connecting');
            
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
            showError(`Coinbase Error: ${error.message}`);
            throw error;
        } finally {
            coinbaseBtn.removeAttribute('aria-busy');
            connectWalletBtn.classList.remove('connecting');
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
        
        walletProvider = result.provider;

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
            console.error("MetaMask connection failed:", error);
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
            
            provider.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) resetWalletConnection();
            });
            
            provider.on("disconnect", () => {
                resetWalletConnection();
            });
            
        } catch (error) {
            console.error("WalletConnect connection failed:", error);
        }
    });

    coinbaseBtn.addEventListener('click', async () => {
        try {
            const result = await connectCoinbase();
            handleConnectedWallet(result);
        } catch (error) {
            console.error("Coinbase connection failed:", error);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });

    // Form submission
    waitlistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
        
        if (!emailInput.value) {
            showError('Email address is required', 'email');
            return;
        }
        
        if (!validateEmail(emailInput.value)) {
            showError('Please enter a valid email address', 'email');
            return;
        }
        
        submitBtn.innerHTML = '<div class="spinner"></div>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const referralCode = generateReferralCode(8);
            document.getElementById('referral-code').textContent = referralCode;
            
            console.log('Form submitted:', {
                email: emailInput.value,
                referral: document.getElementById('referral').value,
                walletAddress: walletAddressSpan.textContent,
                userReferralCode: referralCode
            });

            waitlistContainer.style.display = 'none';
            successMessage.style.display = 'block';
            document.getElementById('referral-section').style.display = 'block';
            
            submitBtn.innerHTML = 'Join Waitlist';
            submitBtn.disabled = false;
        }, 1500);
    });

    function generateReferralCode(length) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

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

    checkConnectedWallet();
});