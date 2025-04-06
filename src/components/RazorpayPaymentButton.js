// RazorpayPaymentButton.js

import React, { useState } from "react";

const RazorpayPaymentButton = ({ amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Make a request to your backend to create the Razorpay order
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amount * 100 }), // Convert to paise (smallest unit of INR)
    });

    const { orderId, currency } = await response.json();

    // Razorpay Checkout Options
    const options = {
      key: "rzp_test_790dwOM89uQsCo", // Razorpay Key ID
      amount: amount * 100, // Amount in paise
      currency: currency, // Currency type (INR)
      name: "Waste to Wealth", // Your Shop Name
      description: "Purchase Description", // Description for the payment
      image: "https://yourlogo.com/logo.png", // Your logo URL
      order_id: orderId, // Order ID received from the backend
      handler: function (response) {
        alert("Payment Successful!");

        // Call backend to verify the payment
        verifyPayment(response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "1234567890",
      },
      theme: {
        color: "#28a745", // Customize theme color
      },
    };

    // Create a Razorpay Payment Object
    const paymentObject = new window.Razorpay(options);

    // Open the Razorpay modal
    paymentObject.open();

    setLoading(false);
  };

  const verifyPayment = async (paymentResponse) => {
    // Call the backend to verify the payment
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
      }),
    });

    const data = await res.json();
    if (data === "Payment verified") {
      alert("Payment verified successfully!");
    } else {
      alert("Payment verification failed.");
    }
  };

  return (
    <button onClick={handlePayment} className="btn btn-success" disabled={loading}>
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
};

export default RazorpayPaymentButton;
