import React, { useState } from 'react';
import {Form, Button} from 'react-bootstrap';
import { useToast } from '../../utils/toast';
import '../../styles/App.css'

let url = '/api'
export const Login = ({onLogin, setIsRegistering}) => {
    console.log(url)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const addToast = useToast(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        const credentials = {
            username,
            password
        };
    
        try {
        const response = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        console.log(`making request to: ${url}/auth/login`)
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }
        const token = await response.json()
        localStorage.setItem('token', token.token);
        localStorage.setItem('username', token.user.username);
        addToast(`Logged in successfully!`);
        onLogin()
        } catch (err) {
        addToast(err.message, 'error');
        }
    }
    return (
        <div className = "d-flex justify-content-center">
            <div className="p-3 shadow-lg rounded">
            <h1>Sign in.</h1>
            <hr></hr>
            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        type="username" 
                        placeholder="Username" 
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <hr></hr>
                <div className = "d-flex justify-content-between">
                    <Button variant="primary" type="submit">
                        Login
                    </Button>
                    <Button variant="primary" onClick={() => setIsRegistering(true)}>
                        Sign-Up
                    </Button>
                </div>
            </Form>
            </div>
        </div>
    )
};

export const Register = ({ onLogin, setIsRegistering }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const addToast = useToast();

    const handleRegister = async (e) => {
        e.preventDefault();
        const upperCasePattern = /[A-Z]/; // Regex for at least one uppercase letter
        const numberPattern = /[0-9]/; // Regex for at least one number
        const credentials = { username, password };
        if(username.length === 0 || password.length === 0){
            addToast('Username or Password must not be empty', 'error');
            return;
        }
        if(password.length < 8){
            addToast('Password must be at least 8 characters.', 'error');
            return;
        }
        if (!upperCasePattern.test(password)) {
            addToast('Password must contain at least one uppercase letter', 'error');
            return;
        }
    
        if (!numberPattern.test(password)) {
            addToast('Password must contain at least one number', 'error');
            return;
        }
        try {
            const response = await fetch(`${url}/auth/register`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }
            const token = await response.json();
            localStorage.setItem('token', token.token);
            localStorage.setItem('username', token.user.username);
            addToast(`Registered successfully!`);
            onLogin();
        } catch (err) {
            console.log(err)
            addToast(err.message, 'error');
        }
    };

    return (
        <div className="d-flex justify-content-center">
            <div className="p-3 shadow-lg rounded">
                <h1>Sign Up.</h1>
                <hr />
                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3" controlId="formGroupEmail">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="username"
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formGroupPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <hr />
                    <div className="d-flex justify-content-between">
                        <Button variant="primary" type="submit">
                            Register
                        </Button>
                        <Button variant="secondary" onClick={() => setIsRegistering(false)}>
                            Back to Login
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};
