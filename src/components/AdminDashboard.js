import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import '../stylesheet.css';

const AdminDashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:5000/employeeCount')
      .then((response) => {
        setEmployeeCount(response.data.totalEmployees);
      })
      .catch((error) => {
        console.error('Error fetching employee count:', error);
      });

    axios.get('http://localhost:5000/projectCount')
      .then((response) => {
        setProjectCount(response.data.totalProjects);
      })
      .catch((error) => {
        console.error('Error fetching project count:', error);
      });
  }, []);

  return (
    <Layout heading="Home">
      <div className="d-flex justify-content-around mt-5">
        <div className="dashboard-card">
          <h4>Current Employees</h4>
          <p>{employeeCount}</p>
        </div>
        <div className="dashboard-card">
          <h4>Total Projects</h4>
          <p>{projectCount}</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
