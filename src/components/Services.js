import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaTrash, FaRecycle, FaShoppingCart } from 'react-icons/fa';
import '../styles/Services.css'; // Import the CSS file

const Services = () => {
  return (
    <Container className="services-page my-5">
      {/* Page Heading */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 fw-bold">Our Services</h1>
          <p className="lead">
            At <strong>Waste to Wealth</strong>, we offer a range of services to help you manage waste sustainably and turn it into valuable resources.
          </p>
        </Col>
      </Row>

      {/* Waste Collection Section */}
      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <FaTrash size={50} className="text-primary" />
              </div>
              <h2 className="text-center mb-4">Waste Collection</h2>
              <p>
                Our <strong>doorstep waste collection</strong> service makes waste disposal simple, sustainable, and stress-free. We ensure proper segregation and responsible disposal of waste.
              </p>
              <ul className="list-unstyled">
                <li>✅ Doorstep pickup at your convenience.</li>
                <li>✅ Segregation of waste into organic, recyclable, and hazardous materials.</li>
                <li>✅ Real-time tracking of waste collection.</li>
              </ul>
              <div className="text-center mt-4">
                <Button variant="primary" href="/waste-request">
                  Schedule a Pickup
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Upcycled Products Marketplace Section */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <FaShoppingCart size={50} className="text-warning" />
              </div>
              <h2 className="text-center mb-4">Upcycled Products Marketplace</h2>
              <p>
                Discover unique and sustainable products made from upcycled materials in our <strong>Upcycled Products Marketplace</strong>. Support artisans and businesses dedicated to turning waste into treasure.
              </p>
              <ul className="list-unstyled">
                <li>🛍️ Wide range of upcycled furniture, fashion, and home decor.</li>
                <li>🎨 Support talented creators and artisans.</li>
                <li>🌍 Every purchase promotes sustainability.</li>
              </ul>
              <div className="text-center mt-4">
                <Button variant="warning" href="/marketplace">
                  Shop Now
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Services;