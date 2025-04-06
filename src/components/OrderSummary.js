import React from "react";
import { Button } from "react-bootstrap";

const OrderSummary = ({ orderDetails, onConfirm }) => {
  return (
    <div>
      <h4>Order Summary</h4>
      <p><strong>Shipping Address:</strong> {orderDetails.shipping?.address}, {orderDetails.shipping?.city}</p>
      <p><strong>Total Amount:</strong> $100</p> {/* Update this with real cart total */}
      
      <Button variant="primary" onClick={onConfirm}>
        Confirm Order
      </Button>
    </div>
  );
};

export default OrderSummary;
