import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import StockCard from "../../../Common/StockCard";
import Web3 from 'web3';
import MedisecureABI from '../../../MedisecureABI.json'; // Import the ABI of the smart contract

const ViewStocks = ({ user }) => {
    const [medicines, setMedicines] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => setAccount(accounts[0]))
                .catch(error => console.error(error));
            const contractInstance = new web3Instance.eth.Contract(MedisecureABI, '0x7822e2724462b80a1B56082F01e4A4a1fe8cf69D');
            setContract(contractInstance);
        } else {
            alert('Please install MetaMask!');
        }
    }, []);

    useEffect(() => {
        if (contract && account) {
            getStocks();
        }
    }, [contract, account]);

    const getStocks = async () => {
        try {
            console.log("getting stocks from blockchain");
            const stocks = await contract.methods.view_stocks_by_manufacturer(user.name).call({ from: account });
            console.log(stocks, 'stocks from blockchain');
            setMedicines(stocks);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div>
                <h2>Your Stocks</h2>
            </div>
            <div className="d-flex flex-row flex-wrap">
                {
                    medicines.map((e, index) => (
                        <div key={index} className="d-flex m-2">
                            <StockCard
                                name={e.medicine_id}
                                units={e.quantity}
                                price={e.price}
                                manDate={new Date(parseInt(e.manufacture_date)).toLocaleDateString()}
                                expiryDate={new Date(parseInt(e.expiry_date)).toLocaleDateString()}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
};

const mapStateToProps = ({ Register, Login }) => ({
    isLoading: Register.isLoading,
    error: Register.error,
    user: Login.user,
});

export default connect(
    mapStateToProps,
)(ViewStocks);
