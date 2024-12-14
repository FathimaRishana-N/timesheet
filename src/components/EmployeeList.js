import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Delete employee
  const deleteEmployee = async (user_id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/deleteEmployee/${user_id}`);
      if (response.data === "Employee deleted successfully") {
        setEmployees(employees.filter((employee) => employee.user_id !== user_id));
        alert("Employee deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee.");
    }
  };

  return (
    <Layout heading="Employees">
      <div className="container mt-4">
      <div className="mb-3">
          <input
            type="text"
            className="form-control"
            style={{ width: "250px" }} 
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-hover text-center align-middle">
            <thead className="table-primary">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Employee Name</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <tr key={employee.user_id}>
                    <td>{index + 1}</td>
                    <td>{employee.Name}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => navigate("/employeedetails", { state: { user_id: employee.user_id } })}>
                        View Details
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteEmployee(employee.user_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-muted">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeList;
