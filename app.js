document.addEventListener('DOMContentLoaded', function() {
    const waitlistForm = document.getElementById('waitlistForm');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const submitBtn = document.getElementById('submitBtn');
    const waitlistContainer = document.getElementById('waitlist-form');
    const successMessage = document.getElementById('success-message');
    const emailInput = document.getElementById('email');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddressSpan = document.getElementById('walletAddress');

    // Check if Web3 is injected (MetaMask or similar)
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
    } else {
        // Alert users if no Web3 provider is found
        connectWalletBtn.textContent = 'Install MetaMask';
        connectWalletBtn.style.backgroundColor = '#ef4444';
        connectWalletBtn.onclick = function() {
            window.open('https://metamask.io/download.html', '_blank');
        };
        return;
    }

    // Wallet connection handler
    connectWalletBtn.addEventListener('click', async function() {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            // Shorten address for display
            const shortenedAddress = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
            
            // Update UI
            connectWalletBtn.textContent = 'Wallet Connected';
            connectWalletBtn.style.backgroundColor = '#10b981';
            walletAddressSpan.textContent = shortenedAddress;
            walletInfo.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.classList.add('enabled');
            
            // Optional: Request user to sign a message to verify ownership
            await signMessage(account);
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            connectWalletBtn.textContent = 'Connection Failed';
            connectWalletBtn.style.backgroundColor = '#ef4444';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.style.backgroundColor = '#3b82f6';
            }, 2000);
        }
    });

    // Function to sign a message (optional verification)
    async function signMessage(account) {
        try {
            const message = "Please sign this message to verify your wallet ownership for Tarif Finance airdrop.";
            const signature = await web3.eth.personal.sign(message, account, '');
            console.log('Signature:', signature);
            // In a real app, you would send this signature to your backend for verification
        } catch (error) {
            console.error('Error signing message:', error);
        }
    }

    // Form submission
    waitlistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate email
        if (!emailInput.value || !emailInput.validity.valid) {
            alert('Please enter a valid email address');
            return;
        }

        // In a real app, you would send this data to your server
        console.log('Form submitted:', {
            email: emailInput.value,
            referral: document.getElementById('referral').value,
            walletAddress: walletAddressSpan.textContent
        });

        // Show success message
        waitlistContainer.style.display = 'none';
        successMessage.style.display = 'block';
    });
});
