import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CLOUDINARY_CLOUD_NAME = "dczurbx8g";
const CLOUDINARY_UPLOAD_PRESET = "PRODUCTS"; // Ensure this matches your Cloudinary preset

const SellerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Upload Image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: imageData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setError("Image upload failed. Please try again.");
      return null;
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user is authenticated
      if (!currentUser) {
        setError("You must be logged in to add a product.");
        setLoading(false);
        return;
      }

      let imageURL = "";

      if (formData.image) {
        imageURL = await uploadToCloudinary(formData.image);
        if (!imageURL) {
          setLoading(false);
          return;
        }
      }

      // Add product details to Firestore
      await addDoc(collection(db, "upcycledProducts"), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageURL,
        sellerId: currentUser.uid,
        createdAt: new Date(),
      });

      setSuccess("Product added successfully!");
      setTimeout(() => {
        navigate("/marketplace");
      }, 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Check permissions and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!currentUser) {
    return <Alert variant="danger">You must be logged in to sell a product.</Alert>;
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Sell Your Upcycled Product</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control type="text" name="name" required onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" required onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price ($)</Form.Label>
          <Form.Control type="number" name="price" required onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" required onChange={handleFileChange} />
        </Form.Group>

        <Button variant="success" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Add Product"}
        </Button>
      </Form>
    </Container>
  );
};

export default SellerForm;
