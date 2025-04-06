import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../styles/Contact.css'; // Import the CSS file

const Contact = () => {
  return (
    <Container className="contact-page my-5">
      {/* Page Heading */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 fw-bold">Contact Us</h1>
          <p className="lead">
            Have questions or need assistance? Reach out to us! We're here to help.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Contact Form */}
        <Col md={6} className="mb-4">
          <div className="contact-form">
            <h2 className="mb-4">Send Us a Message</h2>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your name" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={5} placeholder="Enter your message" required />
              </Form.Group>
              <Button variant="primary" type="submit">
                Send Message
              </Button>
            </Form>
          </div>
        </Col>

        {/* Contact Information */}
        <Col md={6} className="mb-4">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p>
              <FaMapMarkerAlt className="icon" />
              123 Green Street, Eco City, Earth
            </p>
            <p>
              <FaPhone className="icon" />
              +91 (123) 456-7890
            </p>
            <p>
              <FaEnvelope className="icon" />
              info@wastetowealth.com
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;