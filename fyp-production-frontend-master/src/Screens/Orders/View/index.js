import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import OrderTable from '../../../Common/OrderTable';
import MedisecureABI from "../../../MedisecureABI.json"; 
import { connect } from 'react-redux';

const ViewOrders = ({user , history}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);
    console.log(user);
    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);

                    const accounts = await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });
                    setAccounts(accounts);

                    const contractInstance = new web3Instance.eth.Contract(MedisecureABI, "0x20B29cbe2b77157069Af59171366E5a7aA00958b");
                    setContract(contractInstance);

                    getOrdersByManufacturer(contractInstance);
                } else {
                    toast.error("Please install MetaMask to use this application.");
                }
            } catch (error) {
                console.error("Failed to load web3, accounts, or contract. Check console for details.");
                console.error(error);
                toast.error("Failed to load web3, accounts, or contract. Check console for details.");
            }
        };

        init();
    }, []);

    const getOrdersByManufacturer = async (contract) => {
        setLoading(true);
        setError(null);
        try {
            const allOrders = await contract.methods.view_all_orders().call();
    
            const ordersByManufacturer = {};
    
            await Promise.all(allOrders.map(async (order) => {
                try {
                    const medicine = await contract.methods.view_medicine_by_manufacturer(user.name).call();
                    
                    const manufacturer = medicine && medicine[0] && medicine[0].manufacturer ? medicine[0].manufacturer : "Unknown";
    
                    if (!ordersByManufacturer[manufacturer]) {
                        ordersByManufacturer[manufacturer] = [];
                    }
                    ordersByManufacturer[manufacturer].push(order);
                } catch (error) {
                    console.error("Error fetching medicine:", error);
                    setError("Failed to fetch medicine details");
                }
            }));
    
            const ordersArray = Object.entries(ordersByManufacturer).map(([manufacturer, orders]) => ({
                manufacturer,
                orders,
            }));
    
            setOrders(ordersArray);
        } catch (error) {
            setError("Failed to fetch orders");
            console.error(error);
        }
        setLoading(false);
    };
    
    

    const updateOrderStatus = async (orderId, status) => {
        try {
            await contract.methods.update_order_status(orderId, status).send({ from: accounts[0] });
            toast.success(`Order status updated to ${status}`);
            getOrdersByManufacturer(contract); 
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
            {!loading && !error && orders.map(({ manufacturer, orders }) => (
                <div key={manufacturer}>
                    <h4>{manufacturer}</h4>
                    <h3>{orders}</h3>
                    <OrderTable orders={orders} handleStatusChange={handleStatusChange} />
                </div>
            ))}
        </div>
    );
};

const mapStateToProps = ({ Register, Login }) => ({
    isLoading: Register.isLoading,
    error: Register.error,
    user: Login.user,
});

export default connect(mapStateToProps)(ViewOrders);
