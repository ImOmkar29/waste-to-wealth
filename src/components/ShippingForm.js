import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const ShippingForm = ({ onSubmit }) => {
  const [shippingDetails, setShippingDetails] = useState({
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails({ ...shippingDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(shippingDetails); // Pass the details to the parent component
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="address">
        <Form.Label>Shipping Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={shippingDetails.address}
          onChange={handleChange}
          placeholder="Enter address"
          required
        />
      </Form.Group>

      <Form.Group controlId="city">
        <Form.Label>City</Form.Label>
        <Form.Control
          type="text"
          name="city"
          value={shippingDetails.city}
          onChange={handleChange}
          placeholder="Enter city"
          required
        />
      </Form.Group>

      <Form.Group controlId="zip">
        <Form.Label>Postal Code</Form.Label>
        <Form.Control
          type="text"
          name="zip"
          value={shippingDetails.zip}
          onChange={handleChange}
          placeholder="Enter postal code"
          required
        />
      </Form.Group>

      <Form.Group controlId="country">
        <Form.Label>Country</Form.Label>
        <Form.Control
          type="text"
          name="country"
          value={shippingDetails.country}
          onChange={handleChange}
          placeholder="Enter country"
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3">
        Continue to Payment
      </Button>
    </Form>
  );
};

export default ShippingForm;
