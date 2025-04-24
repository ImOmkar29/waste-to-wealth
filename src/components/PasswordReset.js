import React, { useState, useEffect } from 'react';
import { 
  auth,
  db,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  checkActionCode
} from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Form, Card, Container, Alert, Spinner } from 'react-bootstrap';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('request');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyResetCode = async () => {
      if (oobCode) {
        try {
          await checkActionCode(auth, oobCode);
          setMode('reset');
        } catch (error) {
          setError('Invalid or expired reset link. Please request a new one.');
          setMode('request');
        }
      }
    };
    verifyResetCode();
  }, [oobCode]);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      setError(error.message.includes('user-not-found') 
        ? 'No account found with this email' 
        : 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      const userCredential = await signInWithEmailAndPassword(auth, email, newPassword);
      await userCredential.user.getIdToken(true);
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        navigate(userDoc.data().role === 'admin' 
          ? '/admin-dashboard' 
          : '/user-dashboard', 
        { replace: true });
      }
    } catch (error) {
      setError(error.message.includes('weak-password')
        ? 'Password must be at least 6 characters'
        : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
    >
      <Container className="py-5">
        <Card className="p-4 shadow-lg" style={{ maxWidth: '500px' }}>
          {mode === 'reset' ? (
            <>
              <h2 className="text-center mb-4">Set New Password</h2>
              <Form onSubmit={handlePasswordReset}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your registered email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    placeholder="At least 6 characters"
                  />
                </Form.Group>
                
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : 'Update Password'}
                </Button>
              </Form>
            </>
          ) : (
            <>
              <h2 className="text-center mb-4">Reset Password</h2>
              {success ? (
                <Alert variant="success" className="text-center">
                  <p>Reset link sent to:</p>
                  <strong>{email}</strong>
                  <Button
                    variant="outline-success"
                    onClick={() => navigate('/login')}
                    className="w-100 mt-3"
                  >
                    Back to Login
                  </Button>
                </Alert>
              ) : (
                <>
                  <Form onSubmit={handleSendResetEmail}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </Form.Group>
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 py-2 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Form>
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => navigate('/login')}
                      className="text-decoration-none"
                    >
                      Remember your password? Login
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </Card>
      </Container>
    </motion.div>
  );
};

export default PasswordReset;