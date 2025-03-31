import React, { useState } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import InsuranceABI from './InsuranceABI.json';

const CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'; // Replace with your Sepolia address

function App() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');

    const connectLocalBlockchain = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3Instance = new Web3(window.ethereum);
                const accounts = await web3Instance.eth.getAccounts();
                setWeb3(web3Instance);
                setAccount(accounts[0]);
                const contractInstance = new web3Instance.eth.Contract(InsuranceABI, CONTRACT_ADDRESS);
                setContract(contractInstance);
                alert('Connected to Sepolia via MetaMask!');
            } catch (error) {
                alert('Failed to connect: ' + error.message);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const assessRisk = async () => {
        if (!url) return alert('Please enter a URL!');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/assess-risk', { url });
            setResult(response.data);
        } catch (error) {
            alert('Error assessing risk: ' + error.message);
        }
        setLoading(false);
    };

    const payPremium = async () => {
        if (!contract || !result) return alert('Assess a URL first and connect blockchain!');
        try {
            const premium = await contract.methods.calculatePremium(result.score).call();
            await contract.methods.payPremium(result.score).send({
                from: account,
                value: premium,
            });
            alert('Premium paid successfully!');
        } catch (error) {
            alert('Payment failed: ' + error.message);
        }
    };

    const claimPayout = async () => {
        if (!contract) return alert('Connect blockchain first!');
        try {
            await contract.methods.claimPayout().send({ from: account });
            alert('Payout claimed successfully!');
        } catch (error) {
            alert('Claim failed: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
            <h1>CyberShield Vault</h1>
            <button
                onClick={connectLocalBlockchain}
                style={{ marginBottom: '10px', padding: '8px 16px', background: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Connect Sepolia Testnet
            </button>
            <p>Account: {account || 'Not connected'}</p>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (e.g., https://google.com)"
                    style={{ padding: '8px', width: '70%', marginRight: '10px' }}
                />
                <button
                    onClick={assessRisk}
                    disabled={loading}
                    style={{ padding: '8px 16px', background: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Assessing...' : 'Assess Risk'}
                </button>
            </div>
            {result && (
                <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                    <h3>Risk Assessment</h3>
                    <p><strong>URL:</strong> {result.url}</p>
                    <p><strong>Score:</strong> {result.score}/100</p>
                    <p><strong>HTTPS:</strong> {result.checks.https}</p>
                    <p><strong>SSL Version:</strong> {result.checks.ssl_version}</p>
                    <p><strong>Status Code:</strong> {result.checks.status_code}</p>
                    <p><em>{result.message}</em></p>
                    <button
                        onClick={payPremium}
                        style={{ marginTop: '10px', padding: '8px 16px', background: '#28A745', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                    >
                        Pay Premium
                    </button>
                    <button
                        onClick={claimPayout}
                        style={{ marginTop: '10px', padding: '8px 16px', background: '#FFC107', color: 'black', border: 'none', cursor: 'pointer' }}
                    >
                        Claim Payout
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;