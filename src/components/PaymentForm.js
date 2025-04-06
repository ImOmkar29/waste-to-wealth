import React from "react";
import { Button } from "react-bootstrap";

const PaymentForm = ({ onSubmit }) => {
  const handlePaymentSubmit = async () => {
    const orderData = await fetch("/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 100 }), // Send amount or order details
    }).then((response) => response.json());

    const options = {
      key: "rzp_test_790dwOM89uQsCo", // Your Razorpay key ID
      amount: orderData.amount, // Amount in paise (100 = 1 INR)
      currency: "INR",
      name: "Waste to Wealth", // Your company name
      description: "Order payment",
      image: "https://your-logo-url.com/logo.png", // Logo URL
      order_id: orderData.id, // Razorpay order ID
      handler: (response) => {
        // Handle successful payment
        const paymentInfo = {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        };
        onSubmit(paymentInfo); // Pass payment info to parent component
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
        contact: "1234567890",
      },
      notes: {
        address: "Address of the user",
      },
      theme: {
        color: "#F37254", // Customize the color
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open(); // Open Razorpay checkout window
  };

  return (
    <div>
      <h4>Payment Information</h4>
      <p>Choose your payment method:</p>

      <Button variant="success" onClick={handlePaymentSubmit}>
        Pay with Razorpay
      </Button>
    </div>
  );
};

export default PaymentForm;
