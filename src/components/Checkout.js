import React, { useState } from "react";
import { Container, ProgressBar } from "react-bootstrap";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [orderDetails, setOrderDetails] = useState({});

  const handleShippingDetails = (details) => {
    setOrderDetails({ ...orderDetails, shipping: details });
    setStep(2);
  };

  const handlePaymentDetails = (paymentInfo) => {
    setOrderDetails({ ...orderDetails, payment: paymentInfo });
    setStep(3);
  };

  const handleOrderConfirmation = () => {
    // Place the order and redirect to confirmation page
    console.log("Order confirmed:", orderDetails);
    // Send data to backend or Firebase for saving the order
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Checkout</h2>
      
      <ProgressBar
        now={(step / 3) * 100}
        label={`Step ${step} of 3`}
        className="mb-4"
      />

      {step === 1 && <ShippingForm onSubmit={handleShippingDetails} />}
      {step === 2 && <PaymentForm onSubmit={handlePaymentDetails} />}
      {step === 3 && (
        <OrderSummary
          orderDetails={orderDetails}
          onConfirm={handleOrderConfirmation}
        />
      )}
    </Container>
  );
};

export default Checkout;
