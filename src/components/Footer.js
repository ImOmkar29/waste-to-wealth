// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Social media icons

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-5">
      <Container>
        {/* Footer Branding Section */}
        <Row className="mb-3">
          <Col>
            <h4>Waste to Wealth</h4>
            <p className="mb-0">Transforming Waste into Valuable Resources</p>
          </Col>
        </Row>

        {/* Quick Links Section */}
        <Row className="mb-3">
          <Col>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-white">About Us</a></li>
              <li><a href="/contact" className="text-white">Contact</a></li>
              <li><a href="/privacy-policy" className="text-white">Privacy Policy</a></li>
            </ul>
          </Col>
        </Row>

        {/* Social Media Links Section */}
        <Row>
          <Col>
            <div className="d-flex justify-content-center">
              <a href="https://www.facebook.com" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={24} />
              </a>
              <a href="https://www.instagram.com" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={24} />
              </a>
              <a href="https://www.linkedin.com" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
        </Row>

        {/* Copyright Section */}
        <Row className="mt-3">
          <Col>
            <p className="mb-0">© 2025 Waste to Wealth | All Rights Reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
