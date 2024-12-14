import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Container } from "react-bootstrap"; 
import Layout from "./Layout";

const Settings = () => {
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    department: ""
  });

  // Fetch admin details when the component mounts
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/adminDetails");
        setAdminDetails(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          department: response.data.department
        });
      } catch (error) {
        console.error("Error fetching admin details:", error);
        alert("Failed to fetch admin details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Form submission to update 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/adminDetails", formData);
      alert("Admin details updated successfully");
      setIsEditing(false); 
    } catch (error) {
      console.error("Error updating admin details:", error);
      alert("Failed to update admin details.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container my-5 text-center">
          <h3>Loading admin details...</h3>
        </div>
      </Layout>
    );
  }

  if (!adminDetails) {
    return (
      <Layout>
        <div className="container my-5 text-center">
          <h3>Admin details not found or an error occurred.</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="my-5">
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Edit Profile</h2>

        <div className="card p-4">
          {isEditing ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername" className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formDepartment" className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          ) : (
            <>
              <p>
                <strong>Username:</strong> {adminDetails.username}
              </p>
              <p>
                <strong>Email:</strong> {adminDetails.email}
              </p>
              <p>
                <strong>Department:</strong> {adminDetails.department}
              </p>
              <div className="d-flex justify-content-start"> 
                <Button
                  variant="secondary"
                  className="btn-sm" 
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: "auto", 
                    padding: "5px 10px", 
                  }}
                >
                  Edit Details
                </Button>
              </div>
            </>
          )}
        </div>
      </Container>
    </Layout>
  );
};

export default Settings;
