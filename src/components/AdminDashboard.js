import React, { useEffect, useState } from "react";
import { Tabs, Tab, Container, Row, Col, Card, Table, Spinner, Badge, Button, Alert, Form, Modal } from "react-bootstrap";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const AdminDashboard = () => {
  const [wasteRequests, setWasteRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("");

  // State for waste requests management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pickupDate, setPickupDate] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [collectors, setCollectors] = useState([]);
  const [assignedCollector, setAssignedCollector] = useState("");
  const requestsPerPage = 10;

  const user = auth.currentUser;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch waste requests with requester info
        const requestsSnapshot = await getDocs(collection(db, "wasteRequests"));
        const requests = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          requesterName: doc.data().name || doc.data().requesterName || "",
          requesterPhone: doc.data().contact || doc.data().requesterContact || ""
        }));
        setWasteRequests(requests);

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "upcycledProducts"));
        setProducts(productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const userList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userList);
        setCollectors(userList.filter(user => user.role === "collector"));

        // Fetch admin details
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setAdminName(userDoc.data().name || user.email);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Notification function
  const sendNotification = async (userId, message, additionalData = {}) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        message,
        ...additionalData,
        timestamp: serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Product management functions
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const productRef = doc(db, "upcycledProducts", productId);
      await updateDoc(productRef, { status: newStatus });

      const product = products.find((p) => p.id === productId);
      if (product) {
        await sendNotification(
          product.sellerId,
          `Your product "${product.name}" was ${newStatus.toLowerCase()} ✅`,
          { productId, status: newStatus }
        );
      }

      setProducts(prevProducts =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      setError("Failed to update status");
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const product = products.find((p) => p.id === productId);
        if (product) {
          await sendNotification(
            product.sellerId,
            `Your product "${product.name}" was removed 🗑️`,
            { productId }
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

  // Waste request management functions
  const handleWasteStatusChange = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "wasteRequests", requestId), { status: newStatus });
      setWasteRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      const request = wasteRequests.find(req => req.id === requestId);
      if (request) {
        await sendNotification(
          request.userId,
          `Your waste request status updated to: ${newStatus}`,
          { requestId, status: newStatus }
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const schedulePickup = async (requestId) => {
    if (!pickupDate) return alert("Please select pickup date");
    
    try {
      await updateDoc(doc(db, "wasteRequests", requestId), { 
        pickupDate, 
        status: "Scheduled" 
      });
      
      setWasteRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, pickupDate, status: "Scheduled" } : req
      ));

      const request = wasteRequests.find(req => req.id === requestId);
      if (request) {
        await sendNotification(
          request.userId,
          `Pickup scheduled for ${pickupDate}`,
          { requestId, pickupDate, status: "Scheduled" }
        );
      }
      alert("Pickup scheduled!");
    } catch (error) {
      console.error("Error scheduling pickup:", error);
      alert("Failed to schedule pickup");
    }
  };

  const assignCollector = async (requestId) => {
    if (!assignedCollector) return alert("Please select collector");
    
    try {
      await updateDoc(doc(db, "wasteRequests", requestId), { 
        assignedCollector,
        status: "Collector Assigned",
        collectorAssignedAt: serverTimestamp()
      });

      setWasteRequests(prev => prev.map(req => 
        req.id === requestId ? { 
          ...req, 
          assignedCollector,
          status: "Collector Assigned",
          collectorAssignedAt: new Date().toISOString()
        } : req
      ));

      const request = wasteRequests.find(req => req.id === requestId);
      if (request) {
        await sendNotification(
          request.userId,
          `Collector assigned to your request`,
          { requestId, status: "Collector Assigned" }
        );
        
        await sendNotification(
          assignedCollector,
          `New collection assigned from ${request.requesterName || "a user"}`,
          { 
            requestId, 
            address: request.address,
            wasteType: request.wasteType,
            requesterName: request.requesterName,
            requesterPhone: request.requesterPhone
          }
        );
      }
      alert("Collector assigned!");
      setAssignedCollector("");
    } catch (error) {
      console.error("Error assigning collector:", error);
    }
  };

  // User management functions
  const toggleBanStatus = async (userId, isBanned) => {
    try {
      await updateDoc(doc(db, "users", userId), { isBanned: !isBanned });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isBanned: !isBanned } : user
      ));
    } catch (error) {
      console.error("Error updating ban status:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      if (newRole === "collector" || newRole === "user") {
        const usersSnapshot = await getDocs(collection(db, "users"));
        setCollectors(usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "collector")
        );
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Helper functions
  const openDetailsModal = (request) => setSelectedRequest(request);
  const closeDetailsModal = () => setSelectedRequest(null);

  const downloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Requester Name,Requester Phone,Address,Waste Type,Quantity,Status,Pickup Date,Assigned Collector\n" +
      wasteRequests.map(request => {
        return [
          `"${request.requesterName || ""}"`,
          `"${request.requesterPhone || ""}"`,
          `"${request.address || ""}"`,
          `"${request.wasteType || ""}"`,
          `"${request.quantity || ""}"`,
          `"${request.status || ""}"`,
          `"${request.pickupDate || ""}"`,
          `"${request.assignedCollector ? users.find(u => u.id === request.assignedCollector)?.name || request.assignedCollector : ''}"`
        ].join(',');
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "waste_requests_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Filter and pagination with proper null checks
  const filteredWasteRequests = wasteRequests.filter(request => {
    const searchStr = searchQuery.toLowerCase();
    const requesterName = (request.requesterName || "").toLowerCase();
    const requesterPhone = (request.requesterPhone || "").toLowerCase();
    const address = (request.address || "").toLowerCase();
    const wasteType = (request.wasteType || "").toLowerCase();
    const collector = request.assignedCollector 
      ? (users.find(u => u.id === request.assignedCollector)?.name || "").toLowerCase()
      : "";

    return (
      requesterName.includes(searchStr) ||
      requesterPhone.includes(searchStr) ||
      address.includes(searchStr) ||
      wasteType.includes(searchStr) ||
      collector.includes(searchStr)
    ) && (statusFilter === "All" || request.status === statusFilter);
  });

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredWasteRequests.slice(indexOfFirstRequest, indexOfLastRequest);

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
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Search by name, address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: "300px" }}
                    />
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: "200px" }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Collector Assigned">Collector Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Select>
                    <Button variant="secondary" onClick={downloadReport}>
                      📄 Download Report
                    </Button>
                  </div>
                  
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Requester</th>
                        <th>Address</th>
                        <th>Waste Type</th>
                        <th>Quantity (kg)</th>
                        <th>Pickup Date</th>
                        <th>Assigned Collector</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.map((request, index) => (
                        <tr key={request.id}>
                          <td>{index + 1}</td>
                          <td>
                            {request.requesterName || (
                              <span className="text-muted">Not provided</span>
                            )}
                          </td>
                          <td>{request.address || "-"}</td>
                          <td>{request.wasteType || "-"}</td>
                          <td>{request.quantity || "-"}</td>
                          <td>{request.pickupDate || "Not Scheduled"}</td>
                          <td>
                            {request.assignedCollector ? (
                              users.find(u => u.id === request.assignedCollector)?.name || 
                              `Collector (ID: ${request.assignedCollector})`
                            ) : "Not Assigned"}
                          </td>
                          <td>
                            <Badge bg={
                              request.status === "Pending" ? "warning" :
                              request.status === "Completed" ? "success" :
                              request.status === "In Progress" ? "primary" :
                              request.status === "Scheduled" || request.status === "Collector Assigned" ? "info" : "danger"
                            }>
                              {request.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-2">
                              <Form.Select
                                value={request.status}
                                onChange={(e) => handleWasteStatusChange(request.id, e.target.value)}
                                size="sm"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Collector Assigned">Collector Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </Form.Select>

                              {request.status === "Pending" && (
                                <>
                                  <Form.Control
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    size="sm"
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

                              {(request.status === "Scheduled" || request.status === "Collector Assigned") && (
                                <>
                                  <Form.Select
                                    value={assignedCollector}
                                    onChange={(e) => setAssignedCollector(e.target.value)}
                                    size="sm"
                                  >
                                    <option value="">Select Collector</option>
                                    {collectors.map(collector => (
                                      <option key={collector.id} value={collector.id}>
                                        {collector.name} ({collector.email})
                                      </option>
                                    ))}
                                  </Form.Select>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => assignCollector(request.id)}
                                  >
                                    👷 Assign Collector
                                  </Button>
                                </>
                              )}

                              <div className="d-flex gap-2">
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => openDetailsModal(request)}
                                  className="flex-grow-1"
                                >
                                  👁️ Details
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm("Delete this request?")) {
                                      deleteDoc(doc(db, "wasteRequests", request.id));
                                      setWasteRequests(prev => prev.filter(req => req.id !== request.id));
                                    }
                                  }}
                                >
                                  🗑️ Delete
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {filteredWasteRequests.length > requestsPerPage && (
                    <nav>
                      <ul className="pagination justify-content-center">
                        {Array.from({ length: Math.ceil(filteredWasteRequests.length / requestsPerPage) }).map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
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
                  <div
                    style={{
                      height: "200px",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "15px",
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

        {/* User Management Tab */}
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
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>
                        {user.name || user.email.split('@')[0]}
                        {!user.name && <Badge bg="warning" className="ms-2">No Name</Badge>}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || "-"}</td>
                      <td>
                        <Form.Select
                          value={user.role || "user"}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          size="sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="collector">Collector</option>
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

      {/* Request Details Modal */}
      <Modal show={!!selectedRequest} onHide={closeDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Waste Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <Row>
              <Col md={6}>
                <h5>Requester Information</h5>
                <p><strong>Name:</strong> {selectedRequest.requesterName || <span className="text-muted">Not provided</span>}</p>
                <p><strong>Phone:</strong> {selectedRequest.requesterPhone || <span className="text-muted">Not provided</span>}</p>
              </Col>
              <Col md={6}>
                <h5>Request Details</h5>
                <p><strong>Address:</strong> {selectedRequest.address || "-"}</p>
                <p><strong>Waste Type:</strong> {selectedRequest.wasteType || "-"}</p>
                <p><strong>Quantity:</strong> {selectedRequest.quantity || "-"} kg</p>
                <p><strong>Pickup Date:</strong> {selectedRequest.pickupDate || "Not Scheduled"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    bg={
                      selectedRequest.status === "Pending"
                        ? "warning"
                        : selectedRequest.status === "Completed"
                        ? "success"
                        : selectedRequest.status === "In Progress"
                        ? "primary"
                        : selectedRequest.status === "Scheduled" || 
                          selectedRequest.status === "Collector Assigned"
                        ? "info"
                        : "danger"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </p>
                {selectedRequest.assignedCollector && (
                  <p>
                    <strong>Assigned Collector:</strong>{" "}
                    {users.find(u => u.id === selectedRequest.assignedCollector)?.name || 
                     selectedRequest.assignedCollector}
                  </p>
                )}
              </Col>
              {selectedRequest.additionalNotes && (
                <Col xs={12} className="mt-3">
                  <h5>Additional Notes</h5>
                  <p>{selectedRequest.additionalNotes}</p>
                </Col>
              )}
            </Row>
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