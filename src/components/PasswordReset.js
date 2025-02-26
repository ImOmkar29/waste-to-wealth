// src/components/PasswordReset.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Card, Container } from 'react-bootstrap';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow-lg">
        <h2 className="text-center mb-4">Reset Password</h2>
        <Form onSubmit={handleReset}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </Form.Group>
          <Button variant="dark" type="submit" className="w-100 mb-3">
            Send Reset Link
          </Button>
          {message && <p className="text-success">{message}</p>}
        </Form>
      </Card>
    </Container>
  );
};

export default PasswordReset;
