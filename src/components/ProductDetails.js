// src/components/ProductDetails.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Card, Button, Container } from 'react-bootstrap';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'upcycledProducts', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log('No such product!');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  return (
    <Container className="my-5">
      {loading ? (
        <p>Loading...</p>
      ) : (
        product && (
          <Card>
            <Card.Img variant="top" src={product.imageURL} />
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>{product.description}</Card.Text>
              <h5>{`$${product.price}`}</h5>
              <Button variant="dark">Add to Cart</Button>
            </Card.Body>
          </Card>
        )
      )}
    </Container>
  );
};

export default ProductDetails;
