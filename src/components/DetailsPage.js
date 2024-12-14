import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import axios from "axios";
import Layout from "./Layout";

const DetailsPage = () => {
  const { state } = useLocation();
  const { username, startDate, endDate } = state;
  const [details, setDetails] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workDates, setWorkDates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.post("http://localhost:5000/details", {
          username,
          start_date: startDate,
          end_date: endDate,
        });
        const projectData = response.data;

        if (projectData.length === 0) {
          console.log("No data found for the selected date range.");
        } else {
          const projectNames = [
            ...new Set(projectData.flatMap(row => Object.keys(row).filter(key => key !== 'date')))
          ];
          const dates = projectData.map(row => row.date);

          setDetails(projectData);
          setProjects(projectNames);
          setWorkDates(dates);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      }
    };

    fetchDetails();
  }, [username, startDate, endDate]);

    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

  return (
    <Layout>
      <div>
        <Button  className="btn btn-secondary mb-3"onClick={() => navigate(-1)}>
          <ArrowLeftCircle />
        </Button>

        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "grey", textAlign: "left" }}>
          Employee Name: {username}
        </h3>

        {details.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                {projects.map((project, index) => (
                  <th key={index}>{project}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workDates.map((workDate, index) => (
                <tr key={index}>
                  <td>{formatDate(workDate)}</td> {/* Format the date here */}
                  {projects.map((project, projectIndex) => {
                    const workHours = details.find(row => row.date === workDate)[project];
                    return <td key={projectIndex}>{workHours}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No work hours available for the selected date range.</p>
        )}
      </div>
    </Layout>
  );
};

export default DetailsPage;
