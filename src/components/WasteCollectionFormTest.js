// import React, { useState, useEffect } from 'react';
// import { db } from '../firebaseConfig';
// import { collection, addDoc, Timestamp } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Card, Form, Button, Container, Alert } from 'react-bootstrap';

// const WasteCollectionFormTest = () => {
//     const [formData, setFormData] = useState({
//         name: '',
//         address: '',
//         wasteType: '',
//         quantity: '',
//         contact: '',
//         items: '',
//         latitude: '',
//         longitude: ''
//     });

//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [manualAddress, setManualAddress] = useState(false); // State to track manual address input
//     const navigate = useNavigate();

//     // Auto-fetch location & address
//     useEffect(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 async (position) => {
//                     const { latitude, longitude } = position.coords;
//                     try {
//                         const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
//                         const data = await response.json();
//                         const address = data.display_name || '';

//                         setFormData((prevData) => ({
//                             ...prevData,
//                             address,
//                             latitude,
//                             longitude,
//                         }));
//                     } catch (err) {
//                         console.error('Reverse geocoding failed:', err);
//                     }
//                 },
//                 (error) => {
//                     console.error('Geolocation error:', error);
//                 }
//             );
//         }
//     }, []);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         setError('');
//         setSuccess('');
//     };

//     const handleAddressChange = (e) => {
//         setFormData({ ...formData, address: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         const { name, address, wasteType, quantity, contact, items, latitude, longitude } = formData;

//         const auth = getAuth();
//         const user = auth.currentUser;
//         if (!user) {
//             setError('You must be logged in to submit a waste collection request.');
//             setLoading(false);
//             return;
//         }

//         if (!name || !address || !wasteType || !quantity || !contact) {
//             setError('All fields are required.');
//             setLoading(false);
//             return;
//         }
//         if (isNaN(quantity) || parseFloat(quantity) <= 0) {
//             setError('Quantity must be a valid positive number.');
//             setLoading(false);
//             return;
//         }
//         if (!/^[0-9]{10}$/.test(contact)) {
//             setError('Contact number must be a valid 10-digit number.');
//             setLoading(false);
//             return;
//         }

//         try {
//             const itemsArray = items ? items.split(',').map(item => item.trim()) : [];

//             await addDoc(collection(db, 'wasteRequests'), {
//                 name,
//                 address,
//                 wasteType,
//                 quantity: parseFloat(quantity),
//                 contact,
//                 items: itemsArray,
//                 latitude,
//                 longitude,
//                 userId: user.uid,
//                 createdAt: Timestamp.now(),
//                 status: 'Pending'
//             });

//             setSuccess('Request submitted successfully!');
//             setFormData({
//                 name: '',
//                 address: '',
//                 wasteType: '',
//                 quantity: '',
//                 contact: '',
//                 items: '',
//                 latitude: '',
//                 longitude: ''
//             });
//             setTimeout(() => navigate('/user-dashboard'), 2000);
//         } catch (err) {
//             console.error('Error adding document:', err);
//             setError('Failed to submit request. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Container className="d-flex flex-column justify-content-between align-items-center vh-100" style={{ overflow: 'hidden' }}>
//             <div className="w-100" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 60px)', padding: '20px 0' }}>
//                 <Card className="p-4 shadow-lg w-100" style={{ maxWidth: '500px', margin: 'auto' }}>
//                     <h2 className="text-center mb-4">Waste Collection Request</h2>

//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Form onSubmit={handleSubmit}>
//                         <Form.Group className="mb-3">
//                             <Form.Label>Name</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Address</Form.Label>
//                             <Form.Control
//                                 type="text"
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={manualAddress ? handleAddressChange : handleChange}
//                                 required
//                             />
//                             <Form.Check
//                                 type="checkbox"
//                                 label="Edit address"
//                                 checked={manualAddress}
//                                 onChange={() => setManualAddress(!manualAddress)}
//                             />
//                             <Form.Text className="text-muted">
//                                 If the address is incorrect, you can edit it manually.
//                             </Form.Text>
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Waste Type</Form.Label>
//                             <Form.Select
//                                 name="wasteType"
//                                 value={formData.wasteType}
//                                 onChange={handleChange}
//                                 required
//                             >
//                                 <option value="">Select Waste Type</option>
//                                 <option value="Plastic">Plastic</option>
//                                 <option value="Metal">Metal</option>
//                                 <option value="Organic">Organic</option>
//                                 <option value="E-Waste">E-Waste</option>
//                                 <option value="Paper">Paper</option>
//                             </Form.Select>
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Contact Number</Form.Label>
//                             <Form.Control
//                                 type="tel"
//                                 name="contact"
//                                 placeholder="e.g., 9876543210"
//                                 pattern="[0-9]{10}"
//                                 value={formData.contact}
//                                 onChange={handleChange}
//                                 required
//                             />
//                             <Form.Text className="text-muted">
//                                 Please enter a 10-digit phone number.
//                             </Form.Text>
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Quantity (in kg)</Form.Label>
//                             <Form.Control
//                                 type="number"
//                                 name="quantity"
//                                 value={formData.quantity}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </Form.Group>

//                         <Form.Group className="mb-3">
//                             <Form.Label>Items (e.g., plastic bottles, old electronics)</Form.Label>
//                             <Form.Control
//                                 as="textarea"
//                                 rows={3}
//                                 name="items"
//                                 value={formData.items}
//                                 onChange={handleChange}
//                                 placeholder="Enter comma-separated items (e.g., plastic bottles, old electronics)"
//                             />
//                             <Form.Text className="text-muted">
//                                 Enter a comma-separated list of items (optional).
//                             </Form.Text>
//                         </Form.Group>

//                         <Button variant="dark" type="submit" className="w-100" disabled={loading}>
//                             {loading ? 'Submitting...' : 'Submit Request'}
//                         </Button>
//                     </Form>
//                 </Card>
//             </div>
//         </Container>
//     );
// };

// export default WasteCollectionFormTest;
