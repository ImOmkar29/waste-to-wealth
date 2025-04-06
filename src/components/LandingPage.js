import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [user] = useAuthState(auth);
  const isLoggedIn = !!user;// Check if user is logged in

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'upcycledProducts'));
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Limit to only 3 products
        setFeaturedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = (productId) => {
    if (isLoggedIn) {
      navigate(`/product/${productId}`);
    } else {
      navigate('/login');
    }
  };

  const handleRequestPickup = () => {
    if (isLoggedIn) {
      navigate('/waste-request');
    } else {
      navigate('/login');
    }
  };

  return (
    <Container className="mt-5 text-center">
      {/* Hero Section */}
      <Row className="landing-hero-section">
        <Col>
          <motion.h1 className="landing-hero-title"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            Transforming Waste into Wealth
          </motion.h1>
          <motion.p className="landing-hero-text"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}>
            Join us in our mission to create a sustainable future by turning waste into valuable resources.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}>
            <Button variant="success" href="services" className="landing-hero-btn">
              Get Started
            </Button>
          </motion.div>
        </Col>
      </Row>

      {/* Featured Products Section */}
      <Row className="landing-featured-section">
        <Col>
          <motion.h2 className="landing-featured-title"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}>
            Featured Upcycled Products
          </motion.h2>
        </Col>
      </Row>

      <Row className="g-4 justify-content-center">
        {featuredProducts.length > 0 ? (
          featuredProducts.map((product, index) => (
            <Col sm={12} md={6} lg={4} key={product.id} className="d-flex justify-content-center">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
              >
                <Card className="shadow landing-product-card" style={{ width: '18rem', minHeight: '350px' }}>
                  <div className="landing-image-container">
                    {product.imageURL ? (
                      <Card.Img 
                        variant="top" src={product.imageURL} 
                        className="landing-product-image"
                        style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ height: '200px', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p>No Image</p>
                      </div>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <Card.Title className="landing-product-title">{product.name || 'No Name'}</Card.Title>
                    <Card.Text className="landing-product-description">{product.description || 'No Description'}</Card.Text>
                    <Card.Text className="landing-product-price">₹{product.price}</Card.Text>
                    <Button 
                      variant="primary" 
                      className="mt-auto w-100" 
                      onClick={() => handleViewDetails(product.id)}
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))
        ) : (
          <p>Loading featured products...</p>
        )}
      </Row>

      {/* Call to Action Section */}
      <Row className="landing-cta-section">
        <Col>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }} className="text-center">
            <Button variant="info" size="lg" className="landing-cta-btn" onClick={handleRequestPickup}>
              Request Waste Pickup
            </Button>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
