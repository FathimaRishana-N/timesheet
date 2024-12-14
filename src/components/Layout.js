import React from "react";
import { Link } from "react-router-dom";
import '../stylesheet.css';  
const Layout = ({ children, heading }) => {
  return (
    <div className="layout-container">
      <div className="sidebar">
        <h4 className="text-center mb-4">FinGlider</h4>
        <nav className="nav flex-column">
          <Link to="/employee-list" className="nav-link text-white">
            <i className="bi bi-people-fill me-2"></i> Employees
          </Link>
          <Link to="/projects" className="nav-link text-white">
            <i className="bi bi-folder-fill me-2"></i> Projects
          </Link>
          <Link to="/timesheet" className="nav-link text-white">
            <i className="bi bi-calendar-week me-2"></i> Timesheet
          </Link>
          <Link to="/performance" className="nav-link text-white">
            <i className="bi bi-bar-chart-fill me-2"></i> Performance
          </Link>
          <Link to="/settings" className="nav-link text-white">
              <i className="bi bi-gear-fill me-2"></i> Settings
          </Link>
        </nav>
      </div>

      <div className="main-content">
        <nav className="navbar navbar-expand-lg navbar-custom">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <h4>{heading}</h4>

            <div>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link to="/admin-dashboard" className="nav-link">
                    <i className="bi bi-house-door-fill me-1"></i> Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
