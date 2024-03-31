//Get contract address and contract ABI from file
var contractABI;
var contractAddressBook;

//For placeholder contract details
const contractDetails = {
    name: "MySmartContract",
    description: "This is a template for interacting with a custom smart contract."
};

fetch("contractABI.json")
    .then((response) => response.json())
    .then((data) => {
        contractABI = data;
    });
fetch("contractAddressBook.json")
    .then((response) => response.json())
    .then((data) => {
        contractAddressBook = data;
    });

//Variables    
var emitedContractEvents;
let isConnected = false;
let currentAccount;
let chainID;
let network;


// Function to connect wallet
async function connectWallet() {
    // Check if there is an instance of web3 already present
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            // Reset connection status
            const connectionStatus = document.getElementById("connectionStatus");
            connectionStatus.innerText = "";

            // Request access to the wallet
            currentAccount = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
            const walletChainID = await ethereum.request({ method: 'eth_chainId' });
            networkChanged(walletChainID);
            // Wallet access granted
            console.log("Connection to wallet established!");
            ethereum.on('chainChanged', (newChainID) => {
                networkChanged(newChainID);
            });
            ethereum.on('accountsChanged', (accounts) => {
                accountChanged(accounts);
            });

            // Update UI
            handleWalletConnectionChange(true);
            isConnected = true;
        } catch (error) {
            // User denied wallet access
            const connectionStatus = document.getElementById("connectionStatus");
            connectionStatus.innerText = "Connection to wallet was denied. Please approve the connection to continue.";
            console.error("User denied wallet access");
        }
    } else {
        // Wallet not installed in the browser
        const walletStatus = document.getElementById("walletStatus");
        walletStatus.innerText = "No Ethereum wallet detected. Please install MetaMask or another Ethereum-compatible wallet.";
    }
}

// Function to disconnect wallet
function disconnectWallet() {
    // Reset UI
    handleWalletConnectionChange(false);
    ethereum.removeAllListeners();
    isConnected = false;
}

function networkChanged(_chainID) {
    if (chainID == _chainID)
        return;

    //Network related UI and variables
    const networkStatus = document.getElementById("networkStatus");
    //const networkCoinSymbol = document.getElementById("networkCoinSymbol");
    chainID = _chainID;
    network = getNetworkName(chainID);

    networkStatus.innerText = "Connected network: " + network;
    // networkCoinSymbol.innerText = getNetworkSymbol(chainID);

    //Connected block management
    if (network === "Unknown") {
        document.getElementById("connectedSection").style.display = "none";
        networkStatus.innerText += ". Please change to a supported network.";
    }
    else if (isConnected)
        document.getElementById("connectedSection").style.display = "block";

    //Restart labels displaying blockchain info of user files and selected file. 
    customContractUIHandleAccountOrNetworkChanged();

    console.log("Changed network to: " + getNetworkName(chainID) + ". CONTRACT ADDRESS " + getContractAddress(chainID));
}

function accountChanged(accounts) {
    currentAccount = accounts[0];
    customContractUIHandleAccountOrNetworkChanged();
}

async function getContract() {
    let contract;
    contract = new web3.eth.Contract(contractABI, getContractAddress(chainID));
    return contract;
}

// Function to handle wallet connection change
function handleWalletConnectionChange(isConnected) {
    const connectButton = document.getElementById('connectButton');
    const disconnectButton = document.getElementById('disconnectButton');
    const connectedSection = document.getElementById('connectedSection');

    if (isConnected) {
        connectButton.style.display = 'none';
        disconnectButton.style.display = 'inline';
        connectedSection.style.display = 'block';
        customContractUIHandleWalletConnectionChange(isConnected); // Update contract custom UI when wallet is connected
    } else {
        connectButton.style.display = 'inline';
        disconnectButton.style.display = 'none';
        connectedSection.style.display = 'none';
    }
}

/* Contract address book funcitons. */
function getContractAddress(chainID) {
    let address = getAddressBookValue(chainID, "address");
    if (address === 'Unknown')
        address = "0x0";
    return address;
}

function getNetworkName(chainID) {
    let name = getAddressBookValue(chainID, "networkName");
    return name;

}

function getNetworkSymbol(chainID) {
    let symbol = getAddressBookValue(chainID, "currencySymbol");
    return symbol;
}

function getAddressBookValue(chainID, value) {
    let res;
    const entry = contractAddressBook[chainID];
    if (entry === undefined)
        res = "Unknown";
    else
        res = entry[value]; //JS black magic

    return res;
}

/**
 * Generates a block explorer link for a given transaction hash.
 * 
 * @param {string} transactionHash - The transaction hash to generate the link for.
 * @returns {string} The HTML link to view the transaction on a pertinent block explorer.
 */
function getBlockExplorerLink(transactionHash) {
    const baseURL = contractAddressBook[chainID].explorerUrl;
    const blockExplorerURL = baseURL + transactionHash;
    const linkHTML = `<a href="${blockExplorerURL}" target="_blank">View Transaction on Block Explorer</a>`;
    return linkHTML;
}


// Section for handling UI changes

// Function to update network status
function updateNetworkStatus(network) {
    document.getElementById('networkStatus').innerText = `Connected network: ${network}`;
}

// Function to update wallet status
function updateWalletStatus(status) {
    document.getElementById('walletStatus').innerText = status;
}

// Function to update connection status
function updateConnectionStatus(status) {
    document.getElementById('connectionStatus').innerText = status;
}

// Custom contract UI functions
// These functions are intended for the dev to update the web elements that are dependent on the connected contract.

/**
 * This function is intended for the dev to update the customized UI for the connected contract.
 * Called when connection to wallet changes.
 */
function customContractUIHandleWalletConnectionChange() {
    document.getElementById('contractNamePlaceholder').innerText = contractDetails.name;
    document.getElementById('contractDescriptionPlaceholder').innerText = contractDetails.description;
    document.getElementById('userAccountPlaceholder').innerText = "Connected account: " + currentAccount;
    // Update other contract-specific elements as needed
}

 /**
 * This function is intended for the dev to update the customized UI for the connected contract.
 * Called when account or network changes.
 */
function customContractUIHandleAccountOrNetworkChanged() {
    document.getElementById('userAccountPlaceholder').innerText = "Connected account: " + currentAccount;
    // Update other contract-specific elements as needed
}

