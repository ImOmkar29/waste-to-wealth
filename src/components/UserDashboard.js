// src/components/UserDashboard.js
import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const [userRole, setUserRole] = useState('');
    const [wasteRequests, setWasteRequests] = useState([]);
    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role || 'user');
                }
            }
        };
        fetchUserRole();
    }, [user]);

    useEffect(() => {
        const fetchWasteRequests = async () => {
            if (user) {
                const requestsCollectionRef = collection(db, 'wasteRequests');
                const querySnapshot = await getDocs(requestsCollectionRef);
                const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWasteRequests(requests);
            }
        };
        fetchWasteRequests();
    }, [user]);

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Dashboard</h2>
            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Waste Collection Requests</Card.Title>
                            <Card.Text>View and manage your waste collection requests.</Card.Text>
                            <Button href="/waste-request" variant="success">Request Pickup</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Request Status</Card.Title>
                            <Card.Text>Track the status of your waste collection requests.</Card.Text>
                            <ul>
                                {wasteRequests.map(request => (
                                    <li key={request.id}>{request.address} - {request.status}</li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Profile Management</Card.Title>
                            <Card.Text>Update your profile information.</Card.Text>
                            <Button variant="info" onClick={() => navigate('/profile')}>Manage Profile</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Marketplace</Card.Title>
                            <Card.Text>Explore upcycled products available for purchase.</Card.Text>
                            <Button href="/upcycled-products" variant="primary">View Products</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserDashboard;
