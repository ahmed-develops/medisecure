import React, { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import "./Dashboard.css";
// import Home from "../../Components/Nav/Home";
// import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import Swal from "sweetalert2";
import MedisecureABI from "../MedisecureABI.json";

const Dashboard = () => {
  // const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const Id = user?._id;
  const Name = user?.name;
  const Email = user?.email;
  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  useEffect(() => {
    initWeb3();
  }, []);

  const getAllMedicines = async (contractInstance) => {
    try {
      // Call the view_all_medicines function from the smart contract
      const allMedicines = await contractInstance.methods.view_all_medicines().call();
      console.log("All Medicines:", allMedicines);
      // Process the fetched data as needed, e.g., set state or return
      setMedicines(allMedicines);
    } catch (error) {
      console.error("Error fetching all medicines:", error);
      // Handle errors as per your application's requirements
      throw error; // Optionally re-throw or handle the error
    }
  };

  const getOrdersByDistributor = async (contractInstance, distributorName) => {
    try {
      // Call the view_orders_by_distributor function from the smart contract
      const orders = await contractInstance.methods.view_orders_by_distributor(distributorName).call();
      console.log("Orders by Distributor:", orders);
      setOrders(orders);    
    } catch (error) {
      console.error("Error fetching orders by distributor:", error);
      // Handle errors as per your application's requirements
      throw error; // Optionally re-throw or handle the error
    }
  };
  
  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const contractAddress = "0x7822e2724462b80a1B56082F01e4A4a1fe8cf69D";
        const contractInstance = new web3.eth.Contract(MedisecureABI, contractAddress);
        setWeb3(web3);
        setContract(contractInstance);
        getAllMedicines(contractInstance);
        getOrdersByDistributor(contractInstance, Name);
      } else {
        throw new Error('No Ethereum provider found. Install MetaMask.');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `Failed to initialize Web3: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  return (
    <div>
      <Container className="dashboard-container-fluid pr-5 pl-5 pt-5 pb-5">
      <Container className="dashboard-user-greeting mb-5">
  <div className="dashboard-user-info">
    <h1 className="dashboard-greeting-text">{Name}</h1>
    <h2 className="dashboard-user-id">{Id}</h2>
    <h2 className="dashboard-user-id">{Email}</h2>
  </div>
</Container>
        <Container className="dashboard-container-fluid my-3">
          <h2>Purchased Stock Summary</h2>
        </Container>
        <Container className="row d-flex  align-items-center">        
          {orders.length > 0 &&
            orders.map(( order, index ) => (
              <Container key={index} className="col-lg-4 col-sm-6 is-light-text mb-4">
                <Container className="dashboard-grid-card">
                  <Container className="dashboard-card-heading">
                    <Container
                      style={{fontSize: 30, marginBottom: 10 }}
                    >
                       {order.order_id}
                    </Container>
                    <Container>
                      Medicine ID : {order.medicine_id}
                    </Container>
                  <Container>
                    No of Units : {order.quantity}
                  </Container>
                  <Container>
                    Status : {order.status} 
                  </Container>
                  <Container>
                    Manufacturer : {order.manufacturer} 
                  </Container>
                  <Container>
                    Price per unit : {order.manufacturer} 
                  </Container>
                  <Container>
                    Total Price : {order.manufacturer} 
                  </Container>
                  </Container>
                </Container>
              </Container>
            ))}
        </Container>
      </Container>
    </div>
  );
};

export default Dashboard;