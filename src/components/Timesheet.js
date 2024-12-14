import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col, Spinner, Modal } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "./Layout";

const Timesheet = () => {
  const [weekStartDate, setWeekStartDate] = useState("");
  const [weekEndDate, setWeekEndDate] = useState("");
  const [performanceData, setPerformanceData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [customReason, setCustomReason] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 



  const calculateEndDate = (startDate) => {
    const date = new Date(startDate);
    const dayOfWeek = date.getDay();
    const daysToAdd = 6 - dayOfWeek; 
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0]; 
  };

  // Load startDate and endDate
  useEffect(() => {
    if (location.state?.startDate && location.state?.endDate) {
      setWeekStartDate(location.state.startDate);
      setWeekEndDate(location.state.endDate);
      fetchPerformanceData(location.state.startDate, location.state.endDate);
    }
  }, [location.state]);

  // Fetch performance data when the date range changes
  const fetchPerformanceData = async (start_date, end_date) => {
    if (!start_date || !end_date) {
      setError("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/performance", {
        start_date,
        end_date,
      });
      if (response.data.length === 0) {
        setError(`No work hours entered for the selected date range: ${start_date} - ${end_date}`);
      } else {
        setPerformanceData(response.data);
      }
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setError("Unable to fetch performance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting work hours
  const handleAccept = async (username, startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/accept', {
        username,
        start_date: startDate,
        end_date: endDate
      });

      if (response.data.message === 'Work hour accepted successfully.') {
        alert(response.data.message);
        fetchPerformanceData(startDate, endDate); 
      }
    } catch (err) {
      setError('Error accepting work hour: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle rejecting work hours
  const handleReject = async () => {
    const rejection = rejectionReason === 'Other' ? customReason : rejectionReason;
  
    if (!rejection.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const response = await axios.post('http://localhost:5000/reject', {
        username: selectedEmployee.username,
        rejected_reason: rejection,
        start_date: weekStartDate,
        end_date: weekEndDate,
      });
  
      if (response.data.message === "Work hours rejected successfully.") {
        alert(response.data.message);
        setShowModal(false);
        setCustomReason(""); 
        fetchPerformanceData(weekStartDate, weekEndDate); 
      }
    } catch (err) {
      setError('Error rejecting work hour: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const navigateToDetails = (username) => {
    navigate("/details", {
      state: { username, startDate: weekStartDate, endDate: weekEndDate },
    });
  };

  const handleDateChange = () => {
    const endDate = calculateEndDate(weekStartDate); 
    setWeekEndDate(endDate);
    fetchPerformanceData(weekStartDate, endDate);
    navigate("/timesheet", {
      state: { startDate: weekStartDate, endDate },
    });
  };
  useEffect(() => {
    const filtered = performanceData.filter((employee) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        employee.username.toLowerCase().includes(lowerSearchTerm) ||
        employee.status.toLowerCase().includes(lowerSearchTerm) ||
        employee.total_work_hours.toString().includes(lowerSearchTerm)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, performanceData]);


  return (
    <Layout heading="Timesheet">
      <div>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="weekStartDate">
              <Form.Label>Week Start Date </Form.Label>
              <Form.Control
                type="date"
                value={weekStartDate}
                onChange={(e) => {
                  setWeekStartDate(e.target.value);
                  const endDate = calculateEndDate(e.target.value); 
                  setWeekEndDate(endDate);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="weekEndDate">
              <Form.Label>Week End Date</Form.Label>
              <Form.Control
                type="date"
                value={weekEndDate}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button onClick={handleDateChange} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Get Work Hours"}
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="searchBar">
              <Form.Label></Form.Label>
              <Form.Control
                type="text" style={{ width: "250px" }} 
                placeholder="Search by Username,Status...."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        {filteredData.length > 0 && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Employee Username</th>
                <th>Total Work Hours</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((employee) => (
                <tr key={employee.username}>
                  <td
                    onClick={() => navigateToDetails(employee.username)}
                    style={{ cursor: "pointer" }}
                  >
                    {employee.username}
                  </td>
                  <td>{employee.total_work_hours}</td>
                  <td>
                    {employee.status === "pending" ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          variant="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(employee.username, weekStartDate, weekEndDate);
                          }}
                          disabled={loading}
                        >
                          <CheckCircle />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowModal(employee);
                          }}
                          disabled={loading}
                        >
                          <XCircle />
                        </Button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{employee.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Work Hour</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="rejectionReason">
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="select"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option value="Unapproved Overtime">Unapproved Overtime</option>
              <option value="Incorrect Data">Incorrect Data</option>
              <option value="Incomplete Information">Incomplete Information</option>
              <option value="Other">Other</option>
            </Form.Control>
          </Form.Group>
          {rejectionReason === "Other" && (
            <Form.Group controlId="customReason">
              <Form.Label>Enter Custom Reason</Form.Label>
              <Form.Control
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Timesheet;
