import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebaseConfig';

import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Card, Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const UpcycledProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'upcycledProducts'));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    }
  };

  const handleAddProduct = async () => {
    try {
      let imageURL = '';
      if (newProduct.image) {
        const imageRef = ref(storage, `upcycledProducts/${uuidv4()}`);
        await uploadBytes(imageRef, newProduct.image);
        imageURL = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'upcycledProducts'), {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        imageURL: imageURL,
      });

      setNewProduct({ name: '', description: '', price: '', image: null });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

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
                  {product.imageURL && (
                    <Card.Img variant="top" src={product.imageURL} alt={product.name} />
                  )}
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

      <Button variant="success" onClick={() => setShowModal(true)}>
        Sell Your Upcycled Product
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Upcycled Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="productDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="productPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="productImage">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>
            <Button variant="primary" onClick={handleAddProduct} className="mt-3">
              Add Product
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UpcycledProducts;
