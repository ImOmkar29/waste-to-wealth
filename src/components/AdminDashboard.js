import React, { useEffect, useState } from "react";
import { Tabs, Tab, Container, Row, Col, Card, Table, Spinner, Badge, Button, Alert, Form, Modal } from "react-bootstrap";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from "firebase/firestore";

const AdminDashboard = () => {
  const [wasteRequests, setWasteRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("");

  // New State Variables
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pickupDate, setPickupDate] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;

  const user = auth.currentUser;

  // ✅ Fetch admin details
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setAdminName(userDoc.data().name || user.email);
        }
      }
    };
    fetchAdminDetails();
  }, [user]);

  // ✅ Fetch data (waste requests, products, users)
  useEffect(() => {
    const fetchWasteRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "wasteRequests"));
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWasteRequests(requests);
      } catch (error) {
        console.error("Error fetching waste requests:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "upcycledProducts"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      }
    };

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchWasteRequests();
    fetchProducts();
    fetchUsers();
  }, []);

  // ✅ Send Notification Function
  const sendNotification = async (userId, message, additionalData = {}) => {
    try {
      const notificationRef = collection(db, "notifications");
      await addDoc(notificationRef, {
        userId,
        message,
        ...additionalData, // Include additional data like pickup date
        timestamp: serverTimestamp(),
        isRead: false,
      });
      console.log("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // ✅ Handle product status update with notifications
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const productRef = doc(db, "upcycledProducts", productId);
      await updateDoc(productRef, { status: newStatus });

      const product = products.find((p) => p.id === productId);

      if (product) {
        await sendNotification(
          product.sellerId,
          `Your product "${product.name}" was ${newStatus.toLowerCase()} ✅`
        );
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      setError("Failed to update status");
    }
  };

  // ✅ Handle product deletion with notifications
  const deleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const product = products.find((p) => p.id === productId);

        if (product) {
          await sendNotification(
            product.sellerId,
            `Your product "${product.name}" was removed 🗑️`
          );
        }

        await deleteDoc(doc(db, "upcycledProducts", productId));
        setProducts(products.filter((product) => product.id !== productId));
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Failed to delete product");
      }
    }
  };

  // ✅ Handle status update for Waste Requests with notifications
  const handleWasteStatusChange = async (requestId, newStatus) => {
    setWasteRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    try {
      const requestDocRef = doc(db, "wasteRequests", requestId);
      await updateDoc(requestDocRef, { status: newStatus });

      // Find the request to get the user ID
      const request = wasteRequests.find((req) => req.id === requestId);
      if (request) {
        // Send notification to the user
        await sendNotification(
          request.userId, // Assuming the request has a userId field
          `Your waste request status has been updated to: ${newStatus}`,
          { requestId, status: newStatus } // Additional data
        );
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // ✅ Handle Ban/Unban action
  const toggleBanStatus = async (userId, isBanned) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { isBanned: !isBanned });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isBanned: !isBanned } : user
        )
      );
    } catch (error) {
      console.error("Error updating ban status:", error);
      setError("Failed to update ban status");
    }
  };

  // ✅ Handle Role Change action
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role");
    }
  };

  // ✅ Schedule Pickup Function with notifications
  const schedulePickup = async (requestId) => {
    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    try {
      const requestDocRef = doc(db, "wasteRequests", requestId);
      await updateDoc(requestDocRef, { pickupDate, status: "Scheduled" });
      setWasteRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, pickupDate, status: "Scheduled" } : req
        )
      );

      // Find the request to get the user ID
      const request = wasteRequests.find((req) => req.id === requestId);
      if (request) {
        // Send notification to the user
        await sendNotification(
          request.userId, // Assuming the request has a userId field
          `Your waste pickup has been scheduled for ${pickupDate}.`,
          { requestId, pickupDate, status: "Scheduled" } // Additional data
        );
      }

      alert("Pickup scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      alert("Failed to schedule pickup.");
    }
  };

  // ✅ Delete Waste Request Function with notifications
  const deleteWasteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this waste request?")) {
      try {
        const request = wasteRequests.find((req) => req.id === requestId);

        if (request) {
          // Send notification to the user
          await sendNotification(
            request.userId, // Assuming the request has a userId field
            `Your waste request has been deleted.`,
            { requestId, status: "Deleted" } // Additional data
          );
        }

        await deleteDoc(doc(db, "wasteRequests", requestId));
        setWasteRequests(wasteRequests.filter((req) => req.id !== requestId));
      } catch (error) {
        console.error("Error deleting waste request:", error);
        setError("Failed to delete waste request");
      }
    }
  };

  // ✅ Open Details Modal
  const openDetailsModal = (request) => {
    setSelectedRequest(request);
  };

  // ✅ Close Details Modal
  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  // ✅ Download Report Function
  const downloadReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Address,Waste Type,Quantity,Status,Pickup Date\n" +
      wasteRequests
        .map((request) =>
          `${request.address},${request.wasteType},${request.quantity},${request.status},${request.pickupDate || "Not Scheduled"}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "waste_requests_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredWasteRequests = wasteRequests.filter((request) => {
    const address = request.address || ""; // Default to empty string if undefined
    const wasteType = request.wasteType || ""; // Default to empty string if undefined
    const status = request.status || ""; // Default to empty string if undefined
  
    return (
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wasteType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.toLowerCase().includes(searchQuery.toLowerCase())
    ) && (statusFilter === "All" || status === statusFilter);
  });

  // ✅ Pagination Logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredWasteRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">
        Welcome, <span className="text-primary">{adminName}</span> 👋
      </h2>

      <Tabs defaultActiveKey="wasteRequests" id="admin-tabs" className="mb-3">
        {/* Waste Requests Tab */}
        <Tab eventKey="wasteRequests" title="Waste Requests">
          <Row>
            <Col md={12}>
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>Waste Collection Requests</Card.Title>
                  <Form.Control
                    type="text"
                    placeholder="Search by address, waste type, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mb-3"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                  <Button variant="secondary" onClick={downloadReport} className="mb-3">
                    📄 Download Report
                  </Button>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Address</th>
                        <th>Waste Type</th>
                        <th>Quantity (kg)</th>
                        <th>Pickup Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.map((request, index) => (
                        <tr key={request.id}>
                          <td>{index + 1}</td>
                          <td>{request.address}</td>
                          <td>{request.wasteType}</td>
                          <td>{request.quantity}</td>
                          <td>{request.pickupDate || "Not Scheduled"}</td>
                          <td>
                            <Badge
                              bg={
                                request.status === "Pending"
                                  ? "warning"
                                  : request.status === "Completed"
                                  ? "success"
                                  : request.status === "In Progress"
                                  ? "primary"
                                  : "danger"
                              }
                            >
                              {request.status}
                            </Badge>
                          </td>
                          <td>
                            {/* Status Dropdown */}
                            <Form.Select
                              value={request.status}
                              onChange={(e) => handleWasteStatusChange(request.id, e.target.value)}
                              className="mb-2"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                            </Form.Select>

                            {/* Schedule Pickup Button (only for Pending requests) */}
                            {request.status === "Pending" && (
                              <>
                                <Form.Control
                                  type="date"
                                  value={pickupDate}
                                  onChange={(e) => setPickupDate(e.target.value)}
                                  className="mb-2"
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => schedulePickup(request.id)}
                                >
                                  🗓️ Schedule Pickup
                                </Button>
                              </>
                            )}

                            {/* Delete Waste Request Button */}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteWasteRequest(request.id)}
                              className="ms-2"
                            >
                              🗑️ Delete
                            </Button>

                            {/* View Details Button */}
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => openDetailsModal(request)}
                              className="ms-2"
                            >
                              👁️ View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <nav>
                    <ul className="pagination">
                      {Array.from({ length: Math.ceil(filteredWasteRequests.length / requestsPerPage) }).map(
                        (_, index) => (
                          <li
                            key={index}
                            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                          >
                            <button className="page-link" onClick={() => paginate(index + 1)}>
                              {index + 1}
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </nav>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Upcycled Products Tab */}
        <Tab eventKey="products" title="Upcycled Products">
          <Row className="g-4">
            {products.map((product) => (
              <Col key={product.id} lg={4} md={6} sm={12} className="d-flex">
                <Card
                  className="shadow-lg h-100 border-0"
                  style={{ width: "100%", maxWidth: "350px" }}
                >
                  {/* Image with margin */}
                  <div
                    style={{
                      height: "200px",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "15px", // Added margin around image
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.imageURL || "https://via.placeholder.com/350"}
                      alt={product.name}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/350")}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-center">{product.name}</Card.Title>
                    <Card.Text className="text-muted text-center">
                      {product.description}
                    </Card.Text>
                    <Card.Text className="text-center">
                      <strong>Price:</strong> ₹{product.price}
                    </Card.Text>
                    <Card.Text className="text-center">
                      <strong>Status:</strong>
                      <Badge
                        bg={
                          product.status === "Approved"
                            ? "success"
                            : product.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }
                        className="ms-2"
                      >
                        {product.status}
                      </Badge>
                    </Card.Text>

                    {/* Improved Button Layout */}
                    <div className="d-flex justify-content-around mt-3">
                      <Button
                        variant="success"
                        size="sm"
                        className="px-3"
                        onClick={() => updateProductStatus(product.id, "Approved")}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        className="px-3"
                        onClick={() => updateProductStatus(product.id, "Rejected")}
                      >
                        Reject
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="px-3"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>

        {/* User Management Tab with Ban/Unban & Role Management */}
        <Tab eventKey="users" title="User Management">
          <Card className="shadow-lg">
            <Card.Body>
              <Card.Title>All Users</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <Form.Select
                          value={user.role || "user"}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="form-control"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Badge bg={user.isBanned ? "danger" : "success"}>
                          {user.isBanned ? "Banned" : "Active"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant={user.isBanned ? "success" : "danger"}
                          size="sm"
                          onClick={() => toggleBanStatus(user.id, user.isBanned)}
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* View Details Modal */}
      <Modal show={selectedRequest !== null} onHide={closeDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>Waste Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p><strong>Address:</strong> {selectedRequest.address}</p>
              <p><strong>Waste Type:</strong> {selectedRequest.wasteType}</p>
              <p><strong>Quantity:</strong> {selectedRequest.quantity} kg</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Pickup Date:</strong> {selectedRequest.pickupDate || "Not Scheduled"}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;