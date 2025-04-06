import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  FaHome, 
  FaInfoCircle, 
  FaServicestack, 
  FaUserCircle, 
  FaPhone, 
  FaTrash, 
  FaStore, 
  FaUserShield 
} from 'react-icons/fa';

const AppNavbar = () => {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Fetch user role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role); // Assuming role is stored in Firestore
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  const handleProtectedNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login');
    }
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

              {/* Common Links */}
              <Nav.Link as={Link} to="/" className="text-light d-flex align-items-center">
                <FaHome className="me-1" /> Home
              </Nav.Link>

              {/* User Dashboard (Hidden for Admins) */}
              {role !== 'admin' && (
                <Nav.Link as={Link} to="/user-dashboard" className="text-light d-flex align-items-center">
                  <FaUserCircle className="me-1" /> Dashboard
                </Nav.Link>
              )}

              {/* Admin Dashboard (Visible only to Admins) */}
              {role === 'admin' && (
                <Nav.Link as={Link} to="/admin-dashboard" className="text-light d-flex align-items-center">
                  <FaUserShield className="me-1" /> Admin Panel
                </Nav.Link>
              )}

              {/* More Dropdown */}
              <NavDropdown title="More" id="navbarScrollingDropdown" className="text-light">
                {/* Services Link */}
                <NavDropdown.Item as={Link} to="/services">
                  <FaServicestack className="me-2" /> Services
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/contact">
                  <FaPhone className="me-2" /> Contact
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/about-us">
                  <FaInfoCircle className="me-1" /> About Us
                </NavDropdown.Item>

                {/* Only for Regular Users (Hide from Admins) */}
                {role !== 'admin' && (
                  <NavDropdown.Item onClick={() => handleProtectedNavigation('/waste-request')}>
                    <FaTrash className="me-2" /> Waste Collection Request
                  </NavDropdown.Item>
                )}

                <NavDropdown.Item onClick={() => handleProtectedNavigation('/marketplace')}>
                  <FaStore className="me-2" /> Marketplace
                </NavDropdown.Item>

                {/* Only for Sellers (Non-Admin Users) */}
                {role !== 'admin' && (
                  <NavDropdown.Item as={Link} to="/sell-product">
                    <FaStore className="me-2" /> Sell Product
                  </NavDropdown.Item>
                )}
              </NavDropdown>

              {/* Authentication Buttons */}
              {user ? (
                <Button variant="outline-light" onClick={handleLogout} className="ms-2 px-3">
                  Logout
                </Button>
              ) : (
                <Button variant="light" as={Link} to="/login" className="ms-2 px-3">
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