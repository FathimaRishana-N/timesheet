import React, { useState, useEffect, } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "react-bootstrap";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";



const ViewSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [editingWeekData, setEditingWeekData] = useState([]);
  const [isEditingWeek, setIsEditingWeek] = useState(false);

  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD');
  };

  useEffect(() => {
    const loggedInEmployeeId = localStorage.getItem('employeeId');  // localStorage
    if (loggedInEmployeeId) {
      setEmployeeId(loggedInEmployeeId);
      fetchSubmissions(loggedInEmployeeId);
    }
  }, []);
  useEffect(() => {
    console.log("Editing Week Data:", editingWeekData); // Log whenever editingWeekData changes
  }, [editingWeekData]);


  useEffect(() => {
    if (weekStartDate) {
      const filtered = submissions.filter((submission) => {
        const submissionDate = formatDate(submission.week_start_date);
        return submissionDate === weekStartDate;
      });
      console.log('Filtered Submissions:', filtered);
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions(submissions);
    }
  }, [weekStartDate, submissions]);

  const fetchSubmissions = async (employeeId) => {
    try {
      const response = await axios.get('http://localhost:5000/api/submissions', {
        params: { employee_id: employeeId }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };
  
  const fetchWeekData = async (weekStartDate) => {
    try {
      const response = await axios.get('http://localhost:5000/api/work_hours/week', {
        params: { employee_id: employeeId, week_start_date: weekStartDate },
      });
      
      setEditingWeekData(response.data);
      
      setWeekStartDate(weekStartDate);
      setIsEditingWeek(true);
    } catch (error) {
      console.error('Error fetching week data:', error);
    }
  };

  const handleWeekUpdate = async (e) => {
    e.preventDefault();


    const updates = editingWeekData
      .filter((data) => data.timesheet_id)
      .map((data) => ({
        timesheet_id: data.timesheet_id,
        work_hours: data.work_hours,
      }));

    try {
      const response = await axios.put('http://localhost:5000/api/work_hours/update', {
        timesheet_updates: updates,
      });
      if (response.status === 200) {
        alert('Week updated successfully!');
        setIsEditingWeek(false);


        setSubmissions((prev) =>
          prev.map((submission) =>
            submission.week_start_date === weekStartDate
              ? { ...submission, status: 'pending', rejection_reason: '' }
              : submission
          )
        );
        fetchSubmissions(employeeId);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert('Failed to update week.');
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <h className="navbar-brand" >
            VIEW
          </h>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a
                  className="nav-link" style={{color:'white'}}
                  href="/"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/Login";
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    
      <div className="container mt-5">
      <Button className="btn btn-primary" onClick={() => navigate(-1)}>
            <ArrowLeftCircle /> Back
          </Button>
      <div className="row justify-content-center mb-4">
          <div className="col-md-6 col-lg-4">
            <label htmlFor="weekStartDate" className="form-label fw-bold">
              Week Start Date:
            </label>
            <input
              type="date"
              id="weekStartDate"
              className="form-control border-primary"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="container mt-5">
          {!isEditingWeek ? (
            <>
              <h2>Submissions</h2>
              {filteredSubmissions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-bordered">
                    <thead className="table-primary text-center align-middle">
                      <tr>
                        <th>Project ID</th>
                        <th>Week Start Date</th>
                        <th>Total Weekly Hours</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr key={submission.id} className="align-middle">
                          <td>{submission.project_id}</td>
                          <td>{submission.week_start_date}</td>
                          <td>{submission.weekly_work_hour}</td>
                          <td>
                            <span
                              className={`badge ${submission.status === 'accepted'
                                ? 'bg-success'
                                : submission.status === 'rejected'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                                }`}
                            >
                              {submission.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            {submission.status === 'rejected'
                              ? submission.rejection_reason
                              : ''}
                          </td>
                          <td className="text-center">
                            {submission.status === 'rejected' && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => fetchWeekData(submission.week_start_date)}
                              >
                                Update
                              </button>
                            )}
                            {submission.status === 'accepted' && (
                              <span className="text-success fw-bold">Accepted</span>
                            )}
                            {submission.status === 'pending' && (
                              <span className="text-muted fw-bold">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>No submissions found.</p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleWeekUpdate}>
              <h2>Edit Week Data</h2>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Project ID</th>
                    <th>Project Name</th>
                    <th>Work Hours</th>
                    </tr>
                </thead>
                <tbody>
                  {editingWeekData.map((row, index) => {
                    const currentDate = new Date(row.work_date);
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    return (
                      <tr key={index}>
                        <td>{row.work_date}</td>
                        <td>{dayNames[currentDate.getDay()]}</td>
                        <td>{row.project_id || 'N/A'}</td> 
                        <td>{row.project_name || 'No Project Assigned'}</td> 
                        <td>
                          <input
                            type="number"
                            value={row.work_hours || ''}
                            onChange={(e) => {
                              setEditingWeekData((prev) =>
                                prev.map((data, idx) =>
                                  idx === index ? { ...data, work_hours: e.target.value } : data
                                )
                              );
                            }}
                            className="form-control"
                          />
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  Submit Update
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditingWeek(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;