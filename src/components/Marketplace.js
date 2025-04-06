import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Card, Button, Container, Row, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { classifyProduct } from "../utils/classifier.js"; // Import the classifyProduct function
import "../styles/Marketplace.css";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);

  // Fetch and filter only "Approved" products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "upcycledProducts"), (snapshot) => {
      const productsList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => product.status === "Approved"); // Only display Approved products

      // Classify each product
      const classifiedProducts = productsList.map((product) => ({
        ...product,
        category: classifyProduct(product.description), // Add category based on description
      }));

      setProducts(classifiedProducts);
      setFilteredProducts(classifiedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters based on search, category, and price
  useEffect(() => {
    let updatedProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory !== "All") {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    updatedProducts = updatedProducts.filter((product) => product.price <= maxPrice);

    setFilteredProducts(updatedProducts);
  }, [searchQuery, selectedCategory, maxPrice, products]);

  return (
    <Container className="marketplace my-5">
      <h2 className="text-center mb-4">Buy Upcycled Products</h2>

      {/* Search & Filters */}
      <div className="filter-container d-flex flex-wrap justify-content-between mb-4">
        <Form.Control
          type="text"
          placeholder="Search products..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category Filter Dropdown */}
        <Form.Select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Accessories">Accessories</option>
          <option value="Furniture">Furniture</option>
          <option value="Art">Art</option>
          <option value="Home Decor">Home Decor</option>
          <option value="Electronics">Electronics</option>
        </Form.Select>

        {/* Price Range Slider */}
        <Form.Range
          className="price-slider"
          min={0}
          max={10000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <span className="price-label">Max Price: ₹{maxPrice}</span>
      </div>

      {/* Product Listing */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Row className="g-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Col key={product.id} md={4} sm={6} xs={12}>
                <Card className="product-card">
                  <div className="image-container">
                    {product.imageURL && (
                      <Card.Img
                        variant="top"
                        src={product.imageURL}
                        alt={product.name}
                        className="product-image"
                      />
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-truncate">{product.name}</Card.Title>
                    <Card.Text className="description flex-grow-1">
                      {product.description}
                    </Card.Text>
                    <h5 className="price">₹{product.price}</h5>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-dark btn-block mt-auto"
                    >
                      View Details
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No approved products available based on your filters.</p>
          )}
        </Row>
      )}

      {/* Sell Product Button */}
      {currentUser && (
        <Button variant="success" href="/sell-product" className="mt-4">
          Sell Your Upcycled Product
        </Button>
      )}
    </Container>
  );
};

export default Marketplace;