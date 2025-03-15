import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Container, Card, Button, Row, Col, Spinner, Alert } from "react-bootstrap";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "upcycledProducts"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "upcycledProducts", id));
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Buy & Sell Upcycled Products</h2>
      {loading ? <Spinner animation="border" /> : null}

      <Row>
        {products.length === 0 ? (
          <Alert variant="info">No products available.</Alert>
        ) : (
          products.map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card>
                <Card.Img variant="top" src={product.imageURL} alt={product.name} />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text><strong>${product.price}</strong></Card.Text>
                  
                  {currentUser && currentUser.uid === product.sellerId ? (
                    <Button variant="danger" onClick={() => handleDelete(product.id)}>Delete</Button>
                  ) : (
                    <Button variant="primary">Buy Now</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Marketplace;     
