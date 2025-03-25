document.getElementById("connect-wallet").addEventListener("click", connectWallet);

async function connectWallet() {
    if (window.ethereum) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const walletAddress = accounts[0];
            
            // Show success message
            document.getElementById("success-message").style.display = "block";
            document.getElementById("twitter-link").style.display = "block";
            
            // Optional: Send wallet address to your backend
            console.log("Connected wallet:", walletAddress);
            
        } catch (error) {
            console.error("User denied access:", error);
        }
    } else {
        alert("Please install MetaMask or another Ethereum wallet!");
    }
}