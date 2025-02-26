// src/components/LandingPage.js
import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Sample products to showcase in the "Featured" section
const featuredProducts = [
  { title: 'Upcycled Plastic Bottle Vase', img: 'https://i.pinimg.com/originals/f1/99/80/f199803d360d4e90467ffb4846851d49.jpg' },
  { title: 'Recycled Paper Notebook', img: 'https://images-na.ssl-images-amazon.com/images/I/817mFy4yYkL._AC_SL1500_.jpg' },
  { title: 'Upcycled Planters', img: 'https://www.busymommymedia.com/wp-content/uploads/2019/09/minion-planter-one-4-640x994.jpg' }
];

const LandingPage = () => {
  return (
    <Container className="mt-5 text-center">
      {/* Hero Section */}
      <Row className="hero-section">
        <Col>
          <motion.h1
            className="display-4 mb-4 text-success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transforming Waste into Wealth
          </motion.h1>
          <motion.p
            className="lead mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Join us in our mission to create a sustainable future by turning waste into valuable resources.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Button variant="success" href="#services" className="px-4 py-2">
              Get Started
            </Button>
          </motion.div>
        </Col>
      </Row>

      {/* Featured Products Section */}
      <Row className="mt-5">
        <Col>
          <motion.h2
            className="mb-4 text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Featured Upcycled Products
          </motion.h2>
        </Col>
      </Row>
      
      <Row className="g-4">
        {featuredProducts.map((product, index) => (
          <Col sm={12} md={6} lg={4} key={index} className="d-flex justify-content-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
            >
              <Card className="shadow product-card" style={{ width: '18rem', minHeight: '320px' }}>
                <div className="image-container" style={{ height: '200px', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src={product.img} 
                    className="product-image" 
                    style={{ 
                      height: '100%', 
                      width: '100%', 
                      objectFit: 'contain', 
                      backgroundColor: '#f5f5f5' // Optional: Add a neutral background for better visibility
                    }}
                  />
                </div>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <Card.Title>{product.title}</Card.Title>
                  <Button variant="primary" href="/upcycled-products" className="mt-auto w-100">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Call to Action Section */}
      <Row className="mt-5">
        <Col>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-center"
          >
            <Button variant="info" href="/waste-request" size="lg">
              Request Waste Pickup
            </Button>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
