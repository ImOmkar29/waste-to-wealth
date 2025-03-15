import React, { useState } from 'react';
import { db } from '../firebaseConfig';  // Import the Firestore instance
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Container, Alert } from 'react-bootstrap';

const WasteCollectionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    wasteType: '',
    quantity: '',
    contact: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, address, wasteType, quantity, contact } = formData;

    if (!name || !address || !wasteType || !quantity || !contact) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (isNaN(quantity) || parseFloat(quantity) <= 0) {
      setError('Quantity must be a valid positive number.');
      setLoading(false);
      return;
    }
    if (!/^[0-9]{10}$/.test(contact)) {
      setError('Contact number must be a valid 10-digit number.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'wasteRequests'), {
        name,
        address,
        wasteType,
        quantity: parseFloat(quantity),
        contact,
        createdAt: Timestamp.now()
      });

      setSuccess('Request submitted successfully!');
      setFormData({ name: '', address: '', wasteType: '', quantity: '', contact: '' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Waste Collection Request</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {['name', 'address'].map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
              <Form.Control
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </Form.Group>
          ))}
          
          <Form.Group className="mb-3">
            <Form.Label>Waste Type</Form.Label>
            <Form.Select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              required
            >
              <option value="">Select Waste Type</option>
              <option value="Plastic">Plastic</option>
              <option value="Metal">Metal</option>
              <option value="Organic">Organic</option>
              <option value="E-Waste">E-Waste</option>
              <option value="Paper">Paper</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="tel"
              name="contact"
              placeholder="e.g., 9876543210"
              pattern="[0-9]{10}"
              value={formData.contact}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Please enter a 10-digit phone number.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Quantity (in kg)</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Button variant="dark" type="submit" className="w-100" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default WasteCollectionForm;
