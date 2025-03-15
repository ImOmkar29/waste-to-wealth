// src/components/AppNavbar.js
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  FaHome, 
  FaInfoCircle, 
  FaServicestack, 
  FaUserCircle, 
  FaPhone, 
  FaTrash, 
  FaStore 
} from 'react-icons/fa';

const AppNavbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3 shadow-md">
        <Container>
          <Navbar.Brand as={Link} to="/" className="text-light fw-bold">
            ♻️ Waste to Wealth
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/" className="text-light d-flex align-items-center">
                <FaHome className="me-1" /> Home
              </Nav.Link>
              <Nav.Link as={Link} to="/user-dashboard" className="text-light d-flex align-items-center">
                <FaUserCircle className="me-1" /> Dashboard
              </Nav.Link>
              
              <NavDropdown title="More" id="navbarScrollingDropdown" className="text-light">
                <NavDropdown.Item as={Link} to="/services">
                  <FaServicestack className="me-2" /> Services
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/contact">
                  <FaPhone className="me-2" /> Contact
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/about" className="me-2">
                <FaInfoCircle className="me-1" /> About
              </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/waste-request">
                  <FaTrash className="me-2" /> Waste Collection Request
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/marketplace">
                  <FaStore className="me-2" /> Marketplace
                </NavDropdown.Item>
              </NavDropdown>

              {user ? (
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout} 
                  className="ms-2 px-3"
                >
                  Logout
                </Button>
              ) : (
                <Button 
                  variant="light" 
                  as={Link} 
                  to="/login" 
                  className="ms-2 px-3"
                >
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
};

export default AppNavbar;