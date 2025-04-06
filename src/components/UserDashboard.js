import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Card, Badge, Tabs, Tab, Spinner, Alert, ListGroup, ProgressBar, Modal, Form } from 'react-bootstrap';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [userRole, setUserRole] = useState('');
  const [wasteRequests, setWasteRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);  // ✅ Added products state
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '', price: '', category: '', status: '' });
  const navigate = useNavigate();
  const user = auth.currentUser;

  // 🚀 Fetch User Role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'user');
        }
      }
    };
    fetchUserRole();
  }, [user]);

  // 🚛 Fetch Waste Requests
  useEffect(() => {
    if (!user) return;

    const requestsCollectionRef = collection(db, 'wasteRequests');
    const q = query(requestsCollectionRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'N/A',
      }));
      setWasteRequests(requests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔔 Fetch Notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toLocaleString() : 'N/A'
      }));

      setNotifications(notifList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🛒 Fetch User's Listed Products
  useEffect(() => {
    if (!user) return;

    const productsRef = collection(db, 'upcycledProducts');
    const q = query(productsRef, where('sellerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'N/A'
      }));
      setProducts(productList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // ✅ Mark notification as read and auto-remove it
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });

      // Remove from the list after 10 seconds
      setTimeout(async () => {
        await deleteDoc(notificationRef);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }, 10000); // 10 seconds delay
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ Delete Waste Request
  const deleteRequest = async (requestId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this request?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'wasteRequests', requestId));
        setWasteRequests((prev) => prev.filter((req) => req.id !== requestId));
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  // ✅ Duplicate (Re-request) Waste Pickup
  const reRequestPickup = async (request) => {
    try {
      const newRequest = {
        ...request,
        createdAt: new Date(),
        status: 'Pending',
      };
      delete newRequest.id; // Remove the old ID
      await addDoc(collection(db, 'wasteRequests'), newRequest);
      alert("Re-request submitted successfully.");
    } catch (error) {
      console.error("Error re-requesting pickup:", error);
    }
  };

  // ✅ Open Modal with Request Details
  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // ✅ Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setSelectedProduct(null);
  };

  // ✅ Delete Product
  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'upcycledProducts', productId));
        setProducts((prev) => prev.filter((prod) => prod.id !== productId));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // ✅ Open Edit Modal
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      status: product.status
    });
    setShowModal(true);
  };

  // ✅ Handle Edit Form Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Save Edited Product
  const saveEdit = async () => {
    if (selectedProduct) {
      const productRef = doc(db, 'upcycledProducts', selectedProduct.id);
      await updateDoc(productRef, {
        ...editData,
        updatedAt: new Date()
      });
      closeModal();
    }
  };

  // 🚀 Map status to progress bar value
  const getProgressValue = (status) => {
    switch (status) {
      case 'Pending': return 25;
      case 'Approved': return 50;
      case 'Scheduled': return 75;
      case 'Completed': return 100;
      default: return 0;
    }
  };

  // 🌟 Map status to color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ fontWeight: 'bold', fontSize: '28px' }}>
        Welcome back, {user?.displayName || user?.email}
      </h2>

      <Tabs defaultActiveKey="notifications" id="user-dashboard-tabs" className="mb-4">

        {/* 🔥 Notifications Tab */}
        <Tab eventKey="notifications" title={`Notifications ${notifications.length > 0 ? `(${notifications.length})` : ''}`}>
          <Row className="mt-4">
            <Col>
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>🔔 Notifications</Card.Title>
                  {notifications.length === 0 ? (
                    <Alert variant="info">No new notifications.</Alert>
                  ) : (
                    <ListGroup>
                      {notifications.map((notification) => (
                        <ListGroup.Item key={notification.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{notification.message}</strong>
                            <div className="text-muted">{notification.createdAt}</div>
                          </div>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            disabled={notification.isRead}
                          >
                            Mark as Read
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* 🚛 Track Your Request Status Tab */}
        <Tab eventKey="track-status" title="Track Your Request Status">
          <Row className="g-4 d-flex justify-content-center">
            <Col md={12}>
              <Card className="shadow-lg p-3 rounded border-0">
                <Card.Body>
                  <Card.Title className="fw-bold text-primary">📊 Request Status</Card.Title>
                  {wasteRequests.length === 0 ? (
                    <p className="text-muted">No requests found.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '500px' }}>
                      {wasteRequests.map(request => (
                        <Card key={request.id} className="mb-3 p-3 shadow-sm">
                          <h5>📍 {request.address}</h5>
                          <p>📦 <strong>Quantity:</strong> {request.quantity} kg</p>
                          <Badge bg={getStatusColor(request.status)}>{request.status}</Badge>
                          <ProgressBar now={getProgressValue(request.status)} label={`${getProgressValue(request.status)}%`} className="mt-2" />

                          <div className="mt-3">
                            <Button variant="info" size="sm" onClick={() => openRequestModal(request)}>View Details</Button>{' '}
                            <Button variant="danger" size="sm" onClick={() => deleteRequest(request.id)}>Delete</Button>{' '}
                            <Button variant="primary" size="sm" onClick={() => reRequestPickup(request)}>Re-request</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* 🛒 My Listings Tab */}
        <Tab eventKey="my-listings" title="My Listings">
          <Row className="mt-4">
            {products.length === 0 ? (
              <Alert variant="info" className="text-center">
                No products listed yet.
              </Alert>
            ) : (
              products.map((product) => (
                <Col key={product.id} md={4} className="mb-4">
                  <Card className="shadow-lg h-100">
                    <div
                      className="image-container d-flex justify-content-center align-items-center"
                      style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}
                    >
                      <Card.Img
                        variant="top"
                        src={product.imageURL}
                        alt={product.name}
                        className="img-fluid"
                        style={{ 
                          height: '100%', 
                          width: 'auto', 
                          maxWidth: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="text-truncate">{product.name}</Card.Title>
                      <Card.Text className="mb-2">
                        <strong>Category:</strong>{" "}
                        <Badge bg="secondary" className="text-capitalize">
                          {product.category}
                        </Badge>
                      </Card.Text>
                      <Card.Text className="flex-grow-1">
                        <strong>Description:</strong>{" "}
                        <span className="text-muted">{product.description}</span>
                      </Card.Text>
                      <Card.Text>
                        <strong>Price:</strong>{" "}
                        <span className="text-success">₹{product.price}</span>
                      </Card.Text>
                      <Card.Text>
                        <strong>Created At:</strong>{" "}
                        <span className="text-muted">{product.createdAt}</span>
                      </Card.Text>
                      <div className="mt-auto">
                        <Badge
                          bg={
                            product.status === "Approved"
                              ? "success"
                              : product.status === "Rejected"
                              ? "danger"
                              : "warning"
                          }
                          className="mb-2"
                        >
                          {product.status}
                        </Badge>
                        <div className="d-grid gap-2">
                          <Button
                            variant="info"
                            onClick={() => openEditModal(product)}
                            className="mb-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => deleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>
      </Tabs>

      {/* ✅ Modal with Improved Styling */}
      {selectedRequest && (
        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>🗑️ Request Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Address:</strong> {selectedRequest.address}</p>
            <p><strong>Quantity:</strong> {selectedRequest.quantity} kg</p>
            <p><strong>Waste Type:</strong> {selectedRequest.wasteType}</p>
            <p><strong>Requested On:</strong> {selectedRequest.createdAt}</p>
            <Badge bg={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Modal */}
      {selectedProduct && (
        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={editData.name} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={editData.category} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" name="price" value={editData.price} onChange={handleEditChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={saveEdit}>Save</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default UserDashboard;