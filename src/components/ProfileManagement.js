import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { updateProfile, updateEmail } from 'firebase/auth';

const ProfileManagement = () => {
    const [userData, setUserData] = useState({ firstName: '', lastName: '', email: '' });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData({
                            firstName: userDoc.data().firstName || '',
                            lastName: userDoc.data().lastName || '',
                            email: user.email || ''
                        });
                    } else {
                        // Create user document if not exists
                        await setDoc(userDocRef, {
                            firstName: '',
                            lastName: '',
                            email: user.email || ''
                        });
                        setUserData({ firstName: '', lastName: '', email: user.email || '' });
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                await updateProfile(user, {
                    displayName: `${userData.firstName} ${userData.lastName}`
                });
                await updateEmail(user, userData.email);

                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email
                });

                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' });
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <h3 className="mb-4">Profile Management</h3>
                            {message && <Alert variant={message.type}>{message.text}</Alert>}
                            <Form onSubmit={handleUpdateProfile}>
                                <Form.Group className="mb-3" controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={userData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Update Profile
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfileManagement;
