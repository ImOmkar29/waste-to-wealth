import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Card, Button, Container, Row, Col, Form, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { classifyProduct } from "../utils/classifier.js";
import "../styles/Marketplace.css";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // 3 rows × 3 products

  // Fetch and filter only "Approved" products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "upcycledProducts"), (snapshot) => {
      const productsList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => product.status === "Approved");

      const classifiedProducts = productsList.map((product) => ({
        ...product,
        category: classifyProduct(product.description),
      }));

      setProducts(classifiedProducts);
      setFilteredProducts(classifiedProducts);
      setLoading(false);
      setCurrentPage(1); // Reset to first page when products change
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory, maxPrice, products]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <>
          <Row className="g-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
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

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => paginate(Math.max(1, currentPage - 1))} 
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  // Show limited page numbers (max 5)
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }

                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Sell Product Button */}
      {currentUser && (
        <div className="text-center mt-4">
          <Button variant="success" href="/sell-product">
            Sell Your Upcycled Product
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Marketplace;