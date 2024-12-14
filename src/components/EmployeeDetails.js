import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import Layout from "./Layout";

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id } = location.state || {}; 
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch employee details when the component mounts
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/employeeDetails/${user_id}`);
        console.log("Employee details response:", response.data); 
        setEmployeeDetails(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        alert("Failed to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchEmployeeDetails(); 
    }, [user_id]); 

  if (loading) {
    return (
      <Layout>
        <div className="container my-5 text-center">
          <h3>Loading employee details...</h3>
        </div>
      </Layout>
    );
  }

  if (!employeeDetails) {
    return (
      <Layout>
        <div className="container my-5 text-center">
          <h3>Employee not found or an error occurred.</h3>
          <Button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeftCircle /> Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-5">
        <Button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          <ArrowLeftCircle />
        </Button>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Employee Details</h2>
        <div className="card p-4">
          <p><strong>Name:</strong> {employeeDetails.Name}</p>
          <p><strong>Username:</strong> {employeeDetails.username}</p>
          <p><strong>Email:</strong> {employeeDetails.email}</p>
          <p><strong>Department:</strong> {employeeDetails.department}</p>
        </div>
        <div className="mt-4">
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Assigned Projects</h3>
          <table className="table table-hover">
            <thead>
            </thead>
            <tbody>
              {employeeDetails.projects.length > 0 ? (
                employeeDetails.projects.map((project, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td> 
                    <td>{project.project_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No assigned projects.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDetails;
