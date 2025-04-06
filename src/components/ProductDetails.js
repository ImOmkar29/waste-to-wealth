import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import "../styles/ProductDetails.css"; // Add a dedicated CSS file for styling

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "upcycledProducts", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log("No such product!");
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;

    const options = {
      key: "rzp_test_790dwOM89uQsCo", // Replace with your Razorpay key
      amount: product.price * 100, // Razorpay expects amount in paise
      currency: "INR", // Change to your required currency
      name: product.name,
      description: product.description,
      image: product.imageURL,
      handler: function (response) {
        alert("Payment Successful!");
        console.log(response);
        // Handle payment success (e.g., redirect to order summary or save the order)
      },
      prefill: {
        name: "John Doe", // Replace with user's name
        email: "johndoe@example.com", // Replace with user's email
        contact: "9876543210", // Replace with user's contact number
      },
      notes: {
        address: "123 Main Street, City, State", // Add user's address here
      },
      theme: {
        color: "#F37254", // Customize Razorpay's color theme
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <Container className="product-details my-5">
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" />
          <p>Loading product details...</p>
        </div>
      ) : (
        product && (
          <Row className="product-container">
            {/* Product Image Section */}
            <Col md={6} className="image-section">
              <div className="image-container">
                <img
                  src={product.imageURL}
                  alt={product.name}
                  className="main-image"
                />
              </div>
            </Col>

            {/* Product Info Section */}
            <Col md={6} className="info-section">
              <h2 className="product-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <h4 className="product-price">₹{product.price}</h4>

              <div className="delivery-info">
                <p>✅ Free Shipping | 🚀 Fast Delivery</p>
              </div>

              {/* Add Razorpay Buy Now Button */}
              <Button
                variant="dark"
                className="add-to-cart-btn"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </Col>
          </Row>
        )
      )}
    </Container>
  );
};

export default ProductDetails;
