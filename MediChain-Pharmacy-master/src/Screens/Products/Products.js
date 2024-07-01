import React, { useEffect, useState } from 'react';
import './Products.css';
import { Card, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import MedisecureABI from "../MedisecureABI.json";
import Swal from 'sweetalert2';
import Web3 from "web3";

const Products = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const Id = user?._id;
  const Name = user?.name;
  const Email = user?.email;
  
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [medicines, setMedicines] = useState({});
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStockForBuy, setSelectedStockForBuy] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [quantityToBuy, setQuantityToBuy] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null); // Track selected medicine
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [fullDescription, setFullDescription] = useState('');

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const contractAddress = "0x20B29cbe2b77157069Af59171366E5a7aA00958b";
        const contractInstance = new web3.eth.Contract(MedisecureABI, contractAddress);
        setWeb3(web3);
        setContract(contractInstance);
        getAllMedicines(contractInstance);
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

  const getAllMedicines = async (contractInstance) => {
    try {
      const allMedicines = await contractInstance.methods.view_all_medicines().call();
      const manufacturersSet = new Set(allMedicines.map(medicine => medicine.manufacturer));
      const manufacturersArray = Array.from(manufacturersSet);
      setManufacturers(manufacturersArray);

      const medicinesWithStockDetails = {};
      for (const manufacturer of manufacturersArray) {
        const medicines = await contractInstance.methods.view_medicine_by_manufacturer(manufacturer).call();
        const stocks = await Promise.all(medicines.map(async (medicine) => {
          const stocks = await contractInstance.methods.view_stocks_by_medicine_id(medicine.medicine_id).call();
          return { ...medicine, stocks };
        }));
        medicinesWithStockDetails[manufacturer] = stocks;
      }
      setMedicines(medicinesWithStockDetails);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `Failed to fetch medicines: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  const handleNavigateToMedicines = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
  };

  const handleViewStock = (medicine) => {
    setSelectedStock(medicine.stocks);
    setSelectedMedicine(medicine); 
    setShowModal(true);
  };

  const handleBuyStockClick = (stock) => {
    setSelectedStockForBuy(stock);
    setQuantityToBuy(1);
    setShowBuyModal(true);
    setShowModal(false);
  };

  const handleBuyConfirm = async () => {
    if (quantityToBuy <= parseInt(selectedStockForBuy.quantity)) {
      try {
        await placeOrder(selectedStockForBuy.stock_id, quantityToBuy);
        // Fetch updated stock details from the blockchain
        const updatedStock = await contract.methods.view_stock_by_id(selectedStockForBuy.stock_id).call();
        setSelectedStockForBuy({
          ...selectedStockForBuy,
          quantity: updatedStock.quantity
        });
        setShowBuyModal(false);
        Swal.fire({
          title: 'Success',
          text: 'Purchase successful',
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: `Purchase failed: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: `Selected quantity is greater than available quantity`,
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  const placeOrder = async (stockId, quantity) => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const account = accounts[0];

      // Interaction with the smart contract to place the order
      await contract.methods.add_order(orderId, selectedMedicine.medicine_id, quantity, Name).send({ from: account });
    } catch (error) {
      throw new Error(`Failed to place order: ${error.message}`);
    }
  };

  const handleShowDescriptionModal = (description) => {
    setFullDescription(description);
    setShowDescriptionModal(true);
  };

  return (
    <div className='prod__container'>
      <div className='prod__header-container'>
        <h1 className='prod__header'>Buy Medicine Stock</h1>
      </div>
      <div className='prod__manufacturer-list'>
        <h4>Select a Manufacturer</h4>
        <Row>
          {manufacturers.length > 0 ? (
            manufacturers.map((manufacturer, index) => (
              <Col key={index} className='mb-2'>
                <Button className='prod__button' onClick={() => handleNavigateToMedicines(manufacturer)}>
                  {manufacturer}
                </Button>
              </Col>
            ))
          ) : (
            <p>No manufacturers found</p>
          )}
        </Row>
      </div>
      <div className='prod__medicines-list'>
        {selectedManufacturer && (
          <div>
            {medicines[selectedManufacturer] && medicines[selectedManufacturer].length > 0 ? (
              <Row>
                {medicines[selectedManufacturer].map(medicine => (
                  <Col key={medicine.medicine_id} md={6}>
                    <Card className='prod__card'>
                      <Card.Body className='d-flex flex-column'>
                        <Card.Title className='prod__title'>{medicine.name}</Card.Title>
                        <Card.Text className='prod__text'>
                          {medicine.description.length > 100 ? (
                            <>
                              {medicine.description.substring(0, 100)}...
                              <span
                                className='prod__more-link'
                                onClick={() => handleShowDescriptionModal(medicine.description)}
                              >
                                more
                              </span>
                            </>
                          ) : (
                            medicine.description
                          )}
                        </Card.Text>
                        <Card.Text className='prod__text'>Category: {medicine.category}</Card.Text>
                        <Card.Text className='prod__text'>Formula: {medicine.formula}</Card.Text>
                        <Card.Text className='prod__text'>Chemicals: {medicine.chemicals}</Card.Text>
                        <Card.Text className='prod__text'>Type: {medicine.medicine_type}</Card.Text>
                        <div className="mt-auto">
                          {medicine.stocks && medicine.stocks.length > 0 ? (
                            <Button onClick={() => handleViewStock(medicine)} className='prod__button'>
                              View Stock
                            </Button>
                          ) : (
                            <p style={{ color: 'red' }}>No stocks available for this medicine</p>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p style={{ color: 'red' }}>No medicines found for this manufacturer</p>
            )}
          </div>
        )}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Stock Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStock && selectedStock.length > 0 ? (
            selectedStock.map(stock => (
              <div key={stock.stock_id}>
                <p>Stock ID: {stock.stock_id}</p>
                <p>Price: {stock.price}</p>
                <p>Quantity: {stock.quantity}</p>
                <p>Manufacture Date: {new Date(stock.manufacture_date * 1000).toLocaleDateString()}</p>
                <p>Expiry Date: {new Date(stock.expiry_date * 1000).toLocaleDateString()}</p>
                <Button onClick={() => handleBuyStockClick(stock)} className='prod__button'>Buy Stock</Button>
                <hr />
              </div>
            ))
          ) : (
            <p>No stock information available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buy Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Stock ID: {selectedStockForBuy?.stock_id}</p>
          <p>Price: {selectedStockForBuy?.price}</p>
          <p>Available Quantity: {selectedStockForBuy?.quantity}</p>
          <Form>
            <Form.Group controlId="order">
              <Form.Label>Order ID</Form.Label>
              <Form.Control
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="quantityToBuy">
              <Form.Label>Quantity to Buy</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={selectedStockForBuy?.quantity}
                value={quantityToBuy}
                onChange={(e) => setQuantityToBuy(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBuyConfirm}>
            Buy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDescriptionModal} onHide={() => setShowDescriptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Medicine Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{fullDescription}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDescriptionModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
