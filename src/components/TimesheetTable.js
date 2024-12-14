import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import 'bootstrap/dist/css/bootstrap.min.css';


const TimesheetTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId, projects: assignedProjects } = location.state || {};


  const [employeeName, setEmployeeName] = useState('');
  const [projects, setProjects] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [holidays, setHolidays] = useState({});


  useEffect(() => {
    if (Array.isArray(assignedProjects)) {
      setProjects(assignedProjects);
    } else {
      setProjects([]);
    }
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    setCurrentDate(today);
    calculateWeekDates(today);
  }, [assignedProjects]);

  useEffect(() => {
    if (weekDates.length > 0) {
      fetchEmployeeDetails();
      fetchPublicHolidays(weekDates);
    }
  }, [weekDates]);

  const calculateWeekDates = (startDate) => {
    const startOfWeek = moment(startDate).tz('Asia/Kolkata').startOf('Week');
    const dates = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD')
    );
    setWeekDates(dates);
  };

  const fetchEmployeeDetails = async () => {

    try {
      const response = await axios.get('http://localhost:5000/api/employee', {
        params: { employee_id: employeeId },
      });

      if (response.data) {
        setEmployeeName(response.data.employee_name);
        const uniqueProjects = [
          ...new Set(response.data.projects.map(project => project.project_id))
        ].map(id => response.data.projects.find(project => project.project_id === id));

        setProjects(uniqueProjects);
      }
    } catch (error) {
    }
  };


  const fetchPublicHolidays = async (dates) => {
    try {
      const response = await axios.get('http://localhost:5000/api/public-holidays', {
        params: { dates },
      });
      setHolidays(response.data || {});
    } catch (error) {
      console.error('Error fetching public holidays:', error);
    }
  };

  const handleInputChange = (projectId, day, value) => {
    const hours = parseInt(value, 10);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      alert('Please enter a valid number of hours (0-24)');
      return;
    }
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project_id === projectId
          ? {
            ...project,
            [day]: hours || 0,
            total_weekly_hours: Object.entries({
              ...project,
              [day]: hours || 0,
            }).reduce(
              (sum, [key, val]) =>
                ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].includes(key)
                  ? sum + (val || 0)
                  : sum,
              0
            ),
          }
          : project
      )
    );
  };


  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    calculateWeekDates(newDate);

  };

  const submitTimesheet = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/timesheet', {
        employeeId,
        projects: projects.flatMap((project) =>
          weekDates.map((date) => ({
            project_id: project.project_id,
            work_date: date,
            work_hours: project[moment(date).format('dddd').toLowerCase()] || 0,
          }))
        ),
      });

      if (response.status === 200) {
        alert('Timesheet submitted successfully!');

        setProjects((prevProjects) =>
          prevProjects.map((project) => {
            const resetHours = weekDates.reduce(
              (acc, date) => ({
                ...acc,
                [moment(date).format('dddd').toLowerCase()]: 0,
              }),
              {}
            );
            return { ...project, ...resetHours, total_weekly_hours: 0 };
          })
        );
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    }
  };
  const handleSubmit = () => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    const hasInvalidDates = weekDates.some((date) => {
      const momentDate = moment(date);
      return momentDate.isBefore(startOfWeek) || momentDate.isAfter(endOfWeek);
    });

    if (hasInvalidDates) {
      alert('Please choose a valid date.');
      return;
    }

    submitTimesheet();
  };



  return (
    <div>

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <h className="navbar-brand" >
            TIMESHEET
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
                <a className="nav-link" href="/TimesheetTable">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
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
      <div className="container mt-4 bg-light p-4 rounded shadow">
        <h4 className="mb-3 text-primary">Timesheet</h4>
        <div className="mb-3">
          <strong>Employee Name:</strong> {employeeName} <br />
          <strong>Employee ID:</strong> {employeeId}
        </div>
        <div className="d-flex align-items-center mb-4">
          <label htmlFor="date-picker" className="form-label me-2">
            <strong>Date:</strong>
          </label>
          <input
            id="date-picker"
            type="date"
            value={currentDate}
            className="form-control w-auto"
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <table className="table table-bordered table-striped custom-table">
          <thead className="table-dark">
            <tr>
              <th>Project ID</th>
              <th>Project Name</th>
              {weekDates.map((date, index) => (
                <th key={date}>
                  {moment(date).format('dddd')}<br />({moment(date).format('YYYY-MM-DD')})
                </th>
              ))}
              <th>Weekly Hours</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(projects) &&
              projects.map((project) => (
                <tr key={project.project_id}>
                  <td>{project.project_id}</td>
                  <td>{project.project_name}</td>
                  {weekDates.map((date, index) => {
                    const isFutureDate = moment(date).isAfter(moment().startOf('day'));
                    const day = moment(date).format('dddd').toLowerCase();
                    const isHoliday = !!holidays[weekDates[index]];

                    return (
                      <td key={date}>
                        {isFutureDate ? (
                          <>
                            <input
                              type="number"
                              className="form-control"
                              value={project[day] || ''}
                              disabled
                              min="0"
                              max="24"
                            />

                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              className="form-control"
                              value={project[day] || ''}
                              onChange={(e) =>
                                handleInputChange(project.project_id, day, e.target.value)
                              }
                              min="0"
                              max="24"
                              disabled={isHoliday}
                            />
                            {isHoliday && (
                              <span className="text-danger small">
                                {' ('}
                                {holidays[weekDates[index]]}
                                {')'}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                  <td>{project.total_weekly_hours}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-start mt-3">
          <button onClick={handleSubmit} className="btn btn-success me-2">
            Submit
          </button>


          <button onClick={() => navigate('/view')} className="btn btn-primary">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimesheetTable;