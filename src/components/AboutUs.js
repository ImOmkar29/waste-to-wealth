import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaLightbulb, FaHandsHelping } from 'react-icons/fa';
import '../styles/AboutUs.css'; // Import the CSS file for styling

const AboutUs = () => {
  return (
    <Container className="about-us-page my-5">
      {/* Page Heading */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 fw-bold">About Us</h1>
          <p className="lead">
            Learn more about our mission, vision, and the team behind Waste to Wealth.
          </p>
        </Col>
      </Row>

      {/* Mission Section */}
      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <FaLightbulb size={50} className="mb-3 text-primary" />
              <Card.Title className="fw-bold">Our Mission</Card.Title>
              <Card.Text>
                Our mission is to transform waste into valuable resources, promoting sustainability and environmental conservation. We aim to create a circular economy where waste is minimized, and resources are reused efficiently.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Vision Section */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <FaHandsHelping size={50} className="mb-3 text-success" />
              <Card.Title className="fw-bold">Our Vision</Card.Title>
              <Card.Text>
                We envision a world where waste is no longer a burden but an opportunity. By empowering individuals and businesses, we strive to build a greener, cleaner, and more sustainable future for all.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Team Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h2 className="fw-bold mb-4">Meet Our Team</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Team Member" />
                <Card.Body>
                  <Card.Title className="fw-bold">Omkar</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Team Member" />
                <Card.Body>
                  <Card.Title className="fw-bold">Paras</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Team Member" />
                <Card.Body>
                  <Card.Title className="fw-bold">Shreya</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Team Member" />
                <Card.Body>
                  <Card.Title className="fw-bold">Naresh</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;