import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; // Ensure you have an AuthContext

const UpcycledProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Get logged-in user

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "upcycledProducts"), (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Upcycled Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Row>
          {products.length > 0 ? (
            products.map((product) => (
              <Col key={product.id} md={4} className="mb-4">
                <Card>
                  {product.imageURL && <Card.Img variant="top" src={product.imageURL} alt={product.name} />}
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>{product.description}</Card.Text>
                    <h5>{`$${product.price}`}</h5>
                    <Button variant="dark">Buy Now</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No products available yet. Be the first to sell!</p>
          )}
        </Row>
      )}

      {currentUser && (
        <Button variant="success" href="/sell-product">
          Sell Your Upcycled Product
        </Button>
      )}
    </Container>
  );
};

export default UpcycledProducts;
