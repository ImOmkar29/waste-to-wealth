import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { classifyProduct } from "../utils/classifier";

const CLOUDINARY_CLOUD_NAME = "dczurbx8g";
const CLOUDINARY_UPLOAD_PRESET = "PRODUCTS";

const SellerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ✅ Automatically classify category based on description
  useEffect(() => {
    if (formData.description.trim()) {
      const delayDebounce = setTimeout(() => {
        const category = classifyProduct(formData.description); // Directly call the function
        setFormData((prev) => ({ ...prev, category }));
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const uploadToCloudinary = async (file) => {
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: imageData }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      
      const data = await response.json();
      return data.secure_url;

    } catch (error) {
      setError("Image upload failed. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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

    try {
      // ✅ Adding the product with "Pending" status initially
      await addDoc(collection(db, "upcycledProducts"), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageURL,
        category: formData.category,
        sellerId: currentUser.uid,
        createdAt: new Date(),
        status: "Pending" // 💡 Product status is set to Pending initially
      });

      setSuccess("Product submitted for admin approval!");
      setTimeout(() => navigate("/marketplace"), 1500);

    } catch (error) {
      console.error("Firestore Error:", error);
      setError("Failed to submit product. Try again.");
      
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <Alert variant="danger">You must be logged in to sell a product.</Alert>;

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
          <Form.Label>Price (Rs)</Form.Label>
          <Form.Control type="number" name="price" required onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" required onChange={handleFileChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Predicted Category</Form.Label>
          <Form.Control type="text" value={formData.category || "Analyzing..."} readOnly />
        </Form.Group>

        <Button variant="success" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit for Approval"}
        </Button>
      </Form>
    </Container>
  );
};

export default SellerForm;