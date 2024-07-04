import React, { Fragment, useState, useEffect } from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {
    Col, Row, Card, CardBody,
    CardTitle, Button, Form, FormGroup, Label, Input, CardSubtitle,
} from 'reactstrap';
import { connect } from "react-redux";
import Swal from "sweetalert2";
import Web3 from 'web3';
import MedisecureABI from '../../../MedisecureABI.json'; // Import the ABI of the smart contract

const AddStocks = ({ user, history }) => {
    console.log(user);
    const [formData, setFormData] = useState({
        stock_id: "",
        medicine_id: "", // Store medicine_id in formData
        price: "",
        units: "",
        manDate: "",
        expiryDate: ""
    });
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [medicines, setMedicines] = useState([]);

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
            Swal.fire({
                title: 'Error',
                text: 'Please install MetaMask!',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }, []);

    useEffect(() => {
        if (contract && account) {
            getMedicines();
        }
    }, [contract, account]);

    const getMedicines = async () => {
        try {
            const medicines = await contract.methods.view_medicine_by_manufacturer(user.name).call({ from: account });
            console.log(medicines)
            setMedicines(medicines);
        } catch (error) {
            console.error(error);
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        // Call addStock function here if needed
    }

    const onInput = (e, key) => {
        const value = e.target.value;
        setFormData({ ...formData, [key]: value });
    };

    const addStock = async () => {
        const { stock_id, medicine_id, price, units, manDate, expiryDate } = formData;

        // Validate form fields
        if (!stock_id || !medicine_id || !price || !units || !manDate || !expiryDate) {
            Swal.fire({
                title: 'Missing Inputs',
                text: 'Please fill all the fields.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            })
            return;
        }
        if (units < 1 || price < 1) {
            Swal.fire({
                title: 'Invalid Input',
                text: 'Units and price cannot have a value less than 1',
                icon: 'warning',
                confirmButtonText: 'Ok'
            })
            return;            
        }

        try {
            await contract.methods.add_stock(
                stock_id,
                medicine_id, // Use medicine_id here
                price,
                units,
                new Date(manDate).getTime(),
                new Date(expiryDate).getTime()
            ).send({ from: account });

            Swal.fire({
                title: 'Success',
                text: 'Stock added successfully!',
                icon: 'success',
                confirmButtonText: 'Ok',
            }).then(() => {
                history.push("/stocks");
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to add stock!',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
            console.error(error);
        }
    };

    const {
        stock_id,
        price,
        units,
        manDate,
        expiryDate
    } = formData;

    return (
        <Fragment>
            <ReactCSSTransitionGroup
                className="login-page"
                component="div"
                transitionName="TabsAnimation"
                transitionAppear={true}
                transitionAppearTimeout={0}
                transitionEnter={false}
                transitionLeave={false}>
                <Card className="login-card mb-3 pt-2 pb-2">
                    <CardBody>
                        <CardTitle>Add Stocks</CardTitle>
                        <CardSubtitle>
                            Produced some new stocks?
                            Add it into Medisecure.
                        </CardSubtitle>
                        <Form onSubmit={submitForm}>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="stock_id">Stock ID</Label>
                                        <Input value={stock_id} onChange={(e) => onInput(e, "stock_id")} type="text" name="stock_id" id="stock_id"
                                            placeholder="Enter Stock ID" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="exampleSelect">Select Medicine</Label>
                                        <Input value={formData.medicine_id} onChange={(e) => onInput(e, "medicine_id")} type="select" name="select" id="exampleSelect">
                                            <option value="">Select a medicine</option>
                                            {
                                                medicines && medicines.length > 0 ? medicines.map((med, index) => (
                                                    <option key={index} value={med.medicine_id}>{med.name}</option>
                                                )) : <option>No medicines available</option>
                                            }
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="exampleUnits">Units</Label>
                                        <Input value={units} onChange={(e) => onInput(e, "units")} type="number" name="units" id="units"
                                            placeholder="Enter No. of Units" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="examplePrice">Price per Unit ($)</Label>
                                        <Input value={price} onChange={(e) => onInput(e, "price")} type="number" name="price" id="price"
                                            placeholder="Enter Price" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="exampleManDate">Manufacturing Date</Label>
                                        <Input value={manDate} onChange={(e) => onInput(e, "manDate")} type="date" name="manDate" id="manDate"
                                            placeholder="Enter Manufacturing Date" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for="exampleExpiryDate">Expiry Date</Label>
                                        <Input value={expiryDate} onChange={(e) => onInput(e, "expiryDate")} type="date" name="expiryDate" id="expiryDate"
                                            placeholder="Enter Expiry Date" />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end align-items-center">
                                <Button onClick={addStock} color="primary" className="mt-2">Add Stocks</Button>
                            </div>
                        </Form>

                    </CardBody>
                </Card>
            </ReactCSSTransitionGroup>
        </Fragment>
    )
};

const mapStateToProps = ({ Register, Login }) => ({
    isLoading: Register.isLoading,
    error: Register.error,
    user: Login.user,
});

export default connect(mapStateToProps)(AddStocks);
