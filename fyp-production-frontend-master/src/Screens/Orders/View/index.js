import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import OrderTable from '../../../Common/OrderTable';
import MedisecureABI from "../../../MedisecureABI.json"; 
import { connect } from 'react-redux';

const ViewOrders = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);

                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                    setAccounts(accounts);

                    const contractInstance = new web3Instance.eth.Contract(MedisecureABI, "0xFCCe984e7127c9427ac2b56F29B40a02Fb35EdaE");
                    setContract(contractInstance);

                    fetchOrders(contractInstance);
                } else {
                    toast.error("Please install MetaMask to use this application.");
                }
            } catch (error) {
                console.error("Failed to load web3, accounts, or contract. Check console for details.", error);
                toast.error("Failed to load web3, accounts, or contract. Check console for details.");
            }
        };

        init();
    }, []);

    const fetchOrders = async (contract) => {
        setLoading(true);
        setError(null);
        try {
            const allOrders = await contract.methods.view_all_orders().call();
            const ordersByManufacturer = allOrders.filter(order => {
                return order.distributor === "Muhammad Ahmed";
            });

            setOrders(ordersByManufacturer);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setError("Failed to fetch orders");
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            console.log('Updating order status:', { orderId, status });
            if (typeof orderId !== 'string' || typeof status !== 'string') {
                throw new Error('Order ID and status must be strings');
            }
    
            await contract.methods.update_order_status(orderId, status).send({ from: accounts[0] });
            toast.success(`Order status updated to ${status}`);
            fetchOrders(contract); 
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    };
    

    const handleStatusChange = (status, orderId) => {
        Swal.fire({
            title: `Change status to ${status}?`,
            text: "Are you sure you want to update this order?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                updateOrderStatus(orderId, status);
            }
        });
    };

    return (
        <div>
            <h3>Distributor Orders</h3>
            {loading && <p>Loading orders...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
                <OrderTable orders={orders} onClick={handleStatusChange} />
            )}
        </div>
    );
};

const mapStateToProps = ({ Register, Login }) => ({
    isLoading: Register.isLoading,
    error: Register.error,
    user: Login.user,
});

export default connect(mapStateToProps)(ViewOrders);
