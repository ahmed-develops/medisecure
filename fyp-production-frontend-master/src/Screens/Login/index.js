import React, { Fragment, useState, useEffect } from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {
    Col, Row, Card, CardBody,
    CardTitle, Button, Form, FormGroup, Label, Input
} from 'reactstrap';
import loginAction from "../../actions/login";
import { connect } from 'react-redux';
import Swal from 'sweetalert2'
import "./styles.scss";

const defaultFormData = {
    email: "",
    password: ""
}
const Login = ({ history, loginAction, user }) => {
    const [formData, setFormData] = useState(defaultFormData);
    const submitForm = (e) => {
        e.preventDefault();
        console.log("login");
        history.push("/dashboard");
    }
    const goToRegister = () => {
        history.push("/register");
    };
    const onInput = (e, key) => {
        var value = e.target.value;
        var data = { ...formData };
        data[key] = value;
        setFormData(data);
    };
    const login = () => {
        console.log(formData, 'formData');
        loginAction(formData, (res) => {
            console.log(res, 'ress in login');
            Swal.fire({
                title: res.error ? 'Error' : 'Success',
                text: res.message,
                icon: res.error ? 'error' : 'success',
                confirmButtonText: 'Ok',
            }).then(() => {
                if (!res.error)
                    history.push("/dashboard");
            })
        })
    }
    const {
        email,
        password
    } = formData;
    if (user) {
        history.push("/dashboard");
    }
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
                <div className="logo-div">
                    <img
                        className="logo"
                        src={require("../../assets/images/medichain.png")} />
                </div>
                <div>
                    <p className="subtitle">FOR PRODUCTIONS</p>
                </div>
                <Card className="login-card mb-3 pt-2 pb-2">
                    <CardBody>
                        <CardTitle>Login</CardTitle>
                        <Form onSubmit={submitForm}>
                            <Row form>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="exampleEmail11">Email</Label>
                                        <Input value={email} onChange={(e) => onInput(e, "email")} type="email" name="email" id="email"
                                            placeholder="Email" />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="examplePassword11">Password</Label>
                                        <Input value={password} onChange={(e) => onInput(e, "password")} type="password" name="password" id="password"
                                            placeholder="Password" />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <FormGroup check>
                                <Input type="checkbox" name="check" id="exampleCheck" />
                                <Label for="exampleCheck" check>Remember me</Label>
                            </FormGroup>
                            <Button onClick={login} color="primary" className="mt-2 w-100">Sign in</Button>
                        </Form>
                        <div className="d-flex flex-column justify-content-center align-items-center mt-2">
                            <p>
                                OR
                            </p>
                            <Button onClick={goToRegister} color="secondary" className="mt-2">Register Yourself</Button>
                        </div>
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

const mapDispatchToProps = {
    loginAction: loginAction

};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login);