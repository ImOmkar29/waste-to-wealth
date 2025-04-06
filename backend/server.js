const handleBuyNowClick = async (amount) => {
    // Call backend to create Razorpay order
    const response = await fetch("http://localhost:5000/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amount * 100 }), // Amount in paise
    });
  
    const orderData = await response.json();
    const { orderId, currency } = orderData;
  
    // Initialize Razorpay payment gateway with the order details
    const options = {
      key: "rzp_test_790dwOM89uQsCo", // Razorpay Key ID
      amount: amount * 100, // Amount in paise
      currency: currency,
      order_id: orderId,
      name: "Your Shop Name",
      description: "Order Description",
      handler: async function (response) {
        // Send the payment verification request to the backend
        const paymentVerificationResponse = await fetch(
          "http://localhost:5000/api/verify-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          }
        );
  
        const paymentVerificationData = await paymentVerificationResponse.text();
  
        if (paymentVerificationData === "Payment verified") {
          alert("Payment successful!");
        } else {
          alert("Payment verification failed!");
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
    };
  
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  