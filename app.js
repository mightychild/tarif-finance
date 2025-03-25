import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Initialize WalletConnect
const projectId = 'bb72347b00a08f7ce40e6c359420e94e';
const provider = await EthereumProvider.init({
  projectId,
  chains: [1],
  showQrModal: true
});

// DOM Elements
const connectBtn = document.getElementById('connectWalletBtn');
const headerConnectBtn = document.querySelector('.header-connect');
const mobileConnectBtn = document.querySelector('.mobile-connect');
const postConnection = document.getElementById('postConnection');
const formWallet = document.getElementById('formWallet');
const referralLink = document.getElementById('referralLink');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

// Check for referral in URL
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get('ref');

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active
