// src/components/LoginSignup.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Form, Card, Container } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';

const LoginSignup = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div 
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <Container>
        <Card className="p-4 shadow-lg">
          <h2 className="text-center mb-4">
            {isSignUp ? 'Sign Up' : 'Login'}
          </h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
            <Button 
              variant="dark" 
              type="submit" 
              className="w-100 mb-3"
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            <Button 
              variant="outline-dark" 
              className="w-100 mb-3 d-flex align-items-center justify-content-center"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle size={20} className="me-2" />
              Sign in with Google
            </Button>
            <div className="text-center">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <span 
                  onClick={toggleMode} 
                  className="text-primary cursor-pointer ms-2"
                  style={{ cursor: 'pointer' }}
                >
                  {isSignUp ? 'Login' : 'Sign Up'}
                </span>
              </p>
              {!isSignUp && (
                <Link to="/password-reset" className="text-secondary">
                  Forgot Password?
                </Link>
              )}
            </div>
          </Form>
        </Card>
      </Container>
    </motion.div>
  );
};

export default LoginSignup;
