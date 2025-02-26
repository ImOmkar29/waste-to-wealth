// src/components/AdminPanel.js
import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';

const AdminPanel = () => {
    return (
        <Container className="mt-5">
            <h2 className="mb-4">Admin Panel</h2>
            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Manage Waste Requests</Card.Title>
                            <Card.Text>Review and manage incoming waste collection requests.</Card.Text>
                            <Button variant="success">View Requests</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Manage Marketplace</Card.Title>
                            <Card.Text>Manage the products listed on the marketplace.</Card.Text>
                            <Button variant="primary">Manage Products</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
