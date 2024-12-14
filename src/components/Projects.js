import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ project_name: "" });
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredProjects, setFilteredProjects] = useState([]); 

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  
    const filtered = projects.filter((project) =>
      project.project_name.toLowerCase().includes(term)
    );
    setFilteredProjects(filtered);
  };
  useEffect(() => {
    setFilteredProjects(projects); 
  }, [projects]);
    

  // Fetch all projects and employees
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/employees");
        setAllEmployees(
          response.data.map((emp) => ({
            label: emp.username,
            value: emp.user_id,
          }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchProjects();
    fetchEmployees();
  }, []);

  // Delete a project
  const deleteProject = async (project_id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/deleteProject/${project_id}`);
      if (response.status === 200) {
        setProjects(projects.filter((project) => project.project_id !== project_id));
        alert("Project deleted successfully.");
      } else {
        alert("Error deleting project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project.");
    }
  };

  // Add a new project
  const handleAddProject = async (e) => {
    e.preventDefault();

    const projectData = {
      project_name: newProject.project_name,
      start_date: newProject.start_date,
      end_date: newProject.end_date,
      assignedEmployees: assignedEmployees.map((emp) => emp.value),
    };

    try {
      const response = await axios.post("http://localhost:5000/addProject", projectData);
      setMessage(response.data);

      // Reset form and refresh project list
      setNewProject({ project_name: "", start_date: "" ,end_date:""});
      setAssignedEmployees([]);
      setShowForm(false);

      const updatedProjects = await axios.get("http://localhost:5000/projects");
      setProjects(updatedProjects.data);
    } catch (error) {
      console.error("Error adding project:", error);
      setMessage("Error adding project.");
    }
  };

  return (
    <Layout heading="Projects">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-primary add-project-form" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "Add New Project"}
          </button>
        </div>

        {showForm && (
          <div className="card p-4 mb-4">
            <h4 className="text-center text-primary">Add New Project</h4>
            {message && (
              <div
                className={`alert ${
                  message.includes("Error") ? "alert-danger" : "alert-success"
                } text-center`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleAddProject}>
              <div className="mb-3">
                <label className="form-label">Project Name:</label>
                <input type="text"
                  className="form-control"
                  value={newProject.project_name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, project_name: e.target.value }) }
                  placeholder="Enter project name"
                  required />
              </div>
              <div className="mb-3">
                <label className="form-label">Start Date:</label>
                <input type="date"
                  className="form-control"
                  value={newProject.start_date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, start_date: e.target.value })
                  } required />
              </div>
              <div className="mb-3">
                <label className="form-label">End Date:</label>
                <input type="date"
                  className="form-control"
                  value={newProject.end_date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, end_date: e.target.value })
                  } required />
              </div>
              <div className="mb-3">
                <label className="form-label">Assign Employees:</label>
                <Select isMulti
                  options={allEmployees}
                  value={assignedEmployees}
                  onChange={(selectedOptions) =>
                    setAssignedEmployees(selectedOptions || [])
                  }
                  placeholder="Select employees"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <button type="submit" className="btn btn-primary w-20">
                Add Project
              </button>
            </form>
          </div>
        )}
        <div className="mb-3">
        <input type="text"
          className="form-control"  style={{ width: "250px" }}
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleSearch}/>
        </div>
        <div className="table-responsive">
          <table className="table table-hover text-center align-middle">
            <thead className="table-primary">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Project Name</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
                    <tr key={project.project_id}>
                    <td>{index + 1}</td>
                    <td>{project.project_name}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => navigate(`/editproject/${project.project_id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteProject(project.project_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-muted">
                    No projects found.
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

export default Projects;
