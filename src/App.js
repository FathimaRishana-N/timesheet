import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import Projects from "./components/Projects";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetails from "./components/EmployeeDetails";
import ProjectDetails from "./components/ProjectDetails";
import Timesheet from "./components/Timesheet";
import DetailsPage from "./components/DetailsPage";
import Settings from "./components/Settings";
import TimesheetTable from "./components/TimesheetTable";
import ViewSubmissions from "./components/ViewSubmissions";
import Performance from "./components/Performance";
function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}></Route>
        <Route path='/employee-list' element={<EmployeeList/>}></Route>
        <Route path='/projects' element={<Projects/>}></Route>
        <Route path='/employeedetails' element={<EmployeeDetails/>}></Route>
        <Route path='/editproject/:projectId' element={<ProjectDetails/>}></Route>
        <Route path='/timesheet' element={<Timesheet/>}></Route>
        <Route path='/details' element={<DetailsPage/>}></Route>
        <Route path='/performance' element={<Performance/>}></Route>
        <Route path='/settings' element={<Settings/>}></Route>
        <Route path="/TimesheetTable" element={<TimesheetTable />} ></Route>
        <Route path="/view" element={<ViewSubmissions />} ></Route>
      </Routes>
      </BrowserRouter>
  );
}

export default App;