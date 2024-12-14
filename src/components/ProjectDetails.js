import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import Select from "react-select";

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [newProjectName, setNewProjectName] = useState(""); 
    const [editing, setEditing] = useState(false); 
    const [employees, setEmployees] = useState([]); 
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [showAddEmployee, setShowAddEmployee] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/projectDetails/${projectId}`);
        setProject(response.data);
        setNewProjectName(response.data.project_name);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/employees");
        const options = response.data.map((emp) => ({
          value: emp.user_id,
          label: emp.username,
        }));
        setEmployees(options);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleUpdateProjectName = async () => {
    try {
      await axios.put("http://localhost:5000/updateProjectName", {
        project_id: project.project_id,
        new_project_name: newProjectName,
      });
      setProject({ ...project, project_name: newProjectName });
      setEditing(false);
    } catch (error) {
      console.error("Error updating project name:", error);
    }
  };

  // Function to remove employee from the project
  const handleRemoveEmployee = async (employee_id) => {
    try {
      await axios.delete("http://localhost:5000/removeEmployeeFromProject", {
        data: {
          project_id: project.project_id,
          employee_id: employee_id,
        },
      });

      // Update the UI after employee is removed
      setProject({
        ...project,
        assigned_employees: project.assigned_employees.filter(
          (employee) => employee.user_id !== employee_id
        ),
      });
    } catch (error) {
      console.error("Error removing employee:", error);
    }
  };


  const handleAddEmployees = async () => {
    try {
      const employee_ids = assignedEmployees.map((emp) => emp.value);
  
      await axios.post("http://localhost:5000/addEmployeesToProject", {
        project_id: project.project_id,
        employee_ids,
      });
  
      const response = await axios.get(`http://localhost:5000/projectDetails/${project.project_id}`);
      setProject(response.data);
  
      // Reset fields
      setAssignedEmployees([]);
      setShowAddEmployee(false);
    } catch (error) {
      console.error("Error adding employees:", error);
    }
  };
  

  if (!project) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <p>Loading project details...</p>
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
      <h2 style={{fontSize: "20px", fontWeight: "bold", color: "black", 
         textTransform: "capitalize", marginBottom: "5px", textAlign: "center"
         }}>Project Details</h2>
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="card p-4 shadow-sm">
              <div className="mb-3">
                <strong>Project ID:</strong> {project.project_id || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Start Date:</strong>{" "}
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : "N/A"}
              </div>
              <div className="mb-3">
                <strong>End Date:</strong>{" "}
                {project.end_date
                  ? new Date(project.end_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : "N/A"}
              </div>
              <div className="mb-3">
                <strong>Project Name:</strong>
                {editing ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateProjectName}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    {project.project_name || "N/A"}
                    <PencilFill
                      className="ms-2 text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => setEditing(true)}
                    />
                  </div>
                )}
              </div>
              <h3 className="mb-3">Assigned Employees</h3>
              <ul className="list-group">
                {project.assigned_employees.length > 0 ? (
                  project.assigned_employees.map((employee) => (
                    <li
                      key={employee.user_id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {employee.username}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveEmployee(employee.user_id)}
                      >
                        <TrashFill />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item">No employees assigned.</li>
                )}
              </ul>
              <div className="mb-3 mt-4">
                <button
                  className="btn btn-sm btn-primary " 
                  onClick={() => setShowAddEmployee(!showAddEmployee)}
                >
                  Add New Employeestyle
                </button>
              </div>
  
              {showAddEmployee && (
                <div>
                  <label className="form-label">Assign Employees:</label>
                  <Select
                    isMulti
                    options={employees}
                    value={assignedEmployees}
                    onChange={(selectedOptions) =>
                      setAssignedEmployees(selectedOptions || [])
                    }
                    placeholder="Select employees"
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  <button
                    className="btn btn-primary mt-3"
                    onClick={handleAddEmployees}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );  
};

export default ProjectDetails;
