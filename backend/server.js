const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment-timezone');
const axios = require('axios'); 



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'timesheet_db'
});
app.get('/', (req, res) => {
    return res.json("From Backend side");
});

// Login validation
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const userSql = "SELECT * FROM user WHERE username = ?";
  const userValues = [username];

  db.query(userSql, userValues, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json("An error occurred while logging in.");
    }
    if (data.length === 0) {
      return res.status(401).json("Invalid credentials");
    }

    const user = data[0];
    if (user.password !== password) {
      return res.status(401).json("Invalid password");
    }

    if (user.role === 'employee') {
      const projectSql = `
        SELECT p.project_id, p.project_name
        FROM project_employees pe
        JOIN projects p ON pe.project_id = p.project_id
        WHERE pe.employee_id = ?
      `;
      const projectValues = [user.user_id];

      db.query(projectSql, projectValues, (projectErr, projects) => {
        if (projectErr) {
          console.log(projectErr);
          return res.status(500).json("An error occurred while fetching projects.");
        }

        res.json({
          username: user.username,
          role: user.role,
          employeeId: user.user_id,
          projects: projects, 
        });
      });
    } else {

      res.json({
        username: user.username,
        role: user.role,
        employeeId: user.user_id,
      });
    }
  });
});

//save user data
app.post('/user', (req, res) => {
  const checkUsername = "SELECT * FROM user WHERE username = ?";
  const insertUser = "INSERT INTO user (Name, username,email, password, department, role) VALUES (?, ?, ?, ?, ?,?)";
  const { Name, username,email, password, department, role } = req.body;

  // Check if the username exists
  db.query(checkUsername, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Username isn't available" });
    }

    db.query(insertUser, [Name, username, email, password, department, role], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Failed to create user' });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});


//dashboard
app.get('/employeeCount', (req, res) => {
  const sql = 'SELECT COUNT(*) AS totalEmployees FROM user WHERE role = "employee"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching employee count:', err);
      return res.json({ error: 'Failed to fetch employee count.' });
    }
    res.json({ totalEmployees: results[0].totalEmployees });
  });
});
app.get('/projectCount', (req, res) => {
  const sql = 'SELECT COUNT(*) AS totalProjects FROM projects';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project count:', err);
      return res.json({ error: 'Failed to fetch project count.' });
    }
    res.json({ totalProjects: results[0].totalProjects });
  });
});


//  add project and assign employees- projects

  //fetch projects
  app.get("/projects", (req, res) => {
    const sql = "SELECT project_id, project_name FROM projects";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching projects:", err);
        return res.status(500).json({ error: "Error fetching projects" });
      }
      res.json(results);
    });
  });  
  
  // add a project with assigned employees
  app.post("/addProject", (req, res) => {
    const { project_name, start_date,end_date, assignedEmployees } = req.body;
  
    const sqlInsertProject =
      "INSERT INTO projects (project_name, start_date,end_date) VALUES (?, ?,?)";
    const sqlAssignEmployees =
      "INSERT INTO project_employees (project_id, employee_id) VALUES (?, ?)";
  
    db.query(sqlInsertProject, [project_name, start_date,end_date], (err, result) => {
      if (err) {
        console.error("Error adding project:", err);
        return res.status(500).json("Error adding project.");
      }
  
      const projectId = result.insertId;
      assignedEmployees.forEach((employee_id) => {
        db.query(sqlAssignEmployees, [projectId, employee_id], (err) => {
          if (err) {
            console.error("Error assigning employee:", err);
          }
        });
      });
  
      res.json("Project added successfully");
    });
  });
    
  
//fetch Employees List from user table 
app.get('/employees', (req, res) => {
  const sql = "SELECT user_id, Name FROM user WHERE role = 'employee'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ error: "Error fetching employees" });
    }
    res.json(results);
  });
});

//delete employee from employee list
app.delete('/deleteEmployee/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = "DELETE FROM user WHERE user_id = ?";

  db.query(query, [user_id], (err, result) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json("Error deleting employee.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json("Employee not found.");
    }

    res.json("Employee deleted successfully");
  });
});


// Fetch employee details along with assigned projects
app.get("/employeeDetails/:user_id", (req, res) => {
  const userId = req.params.user_id;
  console.log("Received user ID:", userId);

  const sqlUser = "SELECT Name, username, email, department FROM user WHERE user_id = ?";
  db.query(sqlUser, [userId], (err, userResults) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send("Error fetching employee details");
    }

    if (userResults.length === 0) {
      console.log(`No employee found for user_id: ${userId}`);
      return res.status(404).send("Employee not found");
    }

    const user = userResults[0];
    
    const sqlProjects = `
      SELECT p.project_name 
      FROM project_employees pe 
      JOIN projects p ON pe.project_id = p.project_id 
      WHERE pe.employee_id = ?
    `;
    
    db.query(sqlProjects, [userId], (err, projectResults) => {
      if (err) {
        console.error('Error fetching projects:', err);
        return res.status(500).send("Error fetching projects");
      }

      const projects = projectResults || [];  
      res.json({
        Name: user.Name,
        username: user.username,
        email: user.email,
        department: user.department,
        projects: projects
      });
    });
  });
});


//delete project
app.delete('/deleteProject/:project_id', (req, res) => {
  const { project_id } = req.params;
  console.log("Project ID received:", project_id); 
  
  const query = `DELETE FROM projects WHERE project_id = ?`;

  db.query(query, [project_id], (err, result) => {
    if (err) {
      console.error("Error:", err);  
      return res.status(500).json("Error removing project.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).json("Project not found.");  
    }

    return res.status(200).json("Project removed successfully");
  });
});

// Fetch project details with assigned employees
app.get('/projectDetails/:projectId', (req, res) => {
  const { projectId } = req.params;

  const sql = `SELECT
    p.project_id,  p.project_name,  p.start_date,p.end_date ,u.user_id, u.username
    FROM projects p LEFT JOIN project_employees pe 
    ON  p.project_id = pe.project_id LEFT JOIN  user u 
    ON  pe.employee_id = u.user_id WHERE  p.project_id = ?;`;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching project details:', err);
      return res.status(500).json({ error: 'Failed to fetch project details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = {
      project_id: results[0].project_id,
      project_name: results[0].project_name,
      start_date: results[0].start_date,
      end_date: results[0].end_date,
      assigned_employees: results
        .filter(row => row.user_id) 
        .map(row => ({ user_id: row.user_id, username: row.username })),
    };

    res.json(project);
  });
});


// Update project name
app.put('/updateProjectName', (req, res) => {
  const { project_id, new_project_name } = req.body;
  const sql = 'UPDATE projects SET project_name = ? WHERE project_id = ?';

  db.query(sql, [new_project_name, project_id], (err, result) => {
    if (err) {
      console.error('Error updating project name:', err);
      return res.status(500).json({ error: 'Error updating project name' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project name updated successfully' });
  });
});


// Remove project assignment for an employee
app.delete('/removeEmployeeFromProject', (req, res) => {
  const { project_id, employee_id } = req.body;

  // Start a transaction to ensure both deletions happen together
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Transaction failed to start' });
    }

    const deleteEmployeeFromProjectSQL = `
      DELETE FROM project_employees
      WHERE project_id = ? AND employee_id = ?;
    `;
    db.query(deleteEmployeeFromProjectSQL, [project_id, employee_id], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error deleting employee from project_employees:', err);
          res.status(500).json({ error: 'Failed to remove employee from project' });
        });
      }

      const deleteWorkHoursSQL = `
        DELETE FROM work_hour
        WHERE project_employee_id IN (
          SELECT project_employee_id
          FROM project_employees
          WHERE project_id = ? AND employee_id = ?
        );
      `;
      db.query(deleteWorkHoursSQL, [project_id, employee_id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error deleting employee work hours:', err);
            res.status(500).json({ error: 'Failed to remove employee work hours' });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Transaction commit failed' });
            });
          }
          res.json({ message: 'Employee removed from project and work hours deleted successfully' });
        });
      });
    });
  });
});


//add employee to existing project
app.post('/addEmployeesToProject', (req, res) => {
  const { project_id, employee_ids } = req.body;
  
  if (!project_id || !employee_ids || employee_ids.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const values = employee_ids.map((employee_id) => [project_id, employee_id]);

  const sql = 'INSERT INTO project_employees (project_id, employee_id) VALUES ?';

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error adding employees to project:', err);
      return res.status(500).json({ error: 'Failed to add employees to project' });
    }

    res.json({ message: 'Employees added successfully', data: result });
  });
});


// Timesheet
app.post("/performance", (req, res) => {
  const { start_date, end_date } = req.body;

  const query = `
    SELECT 
      u.username, 
      IFNULL(SUM(wh.work_hours), 0) AS total_work_hours,  
      IFNULL(MAX(wh.status), 'pending') AS status               
    FROM work_hour wh
    JOIN project_employees pe ON wh.project_id = pe.project_id AND wh.employee_id = pe.employee_id  -- Correct join condition
    JOIN user u ON pe.employee_id = u.user_id
    WHERE wh.work_date BETWEEN ? AND ? 
    GROUP BY u.username
  `;

  db.query(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error("Error fetching performance data:", err.message);
      return res.status(500).send("Error fetching performance data");
    }
    res.json(results);
  });
});

//accept 
app.post('/accept', (req, res) => {
  const { username, start_date, end_date } = req.body;
  const query = `
    UPDATE work_hour
    SET status = 'accepted'
    WHERE employee_id = (SELECT user_id FROM user WHERE username = ?)
    AND work_date >= ? 
    AND work_date <= ?
  `;

  db.query(query, [username, start_date, end_date], (err, result) => {
    if (err) {
      console.error('Error accepting work hours:', err);
      return res.status(500).json({ message: 'Error accepting work hour' });
    }

    if (result.affectedRows > 0) {
      return res.json({ message: 'Work hour accepted successfully.' });
    } else {
      return res.status(404).json({ message: 'Work hour not found.' });
    }
  });
});

//reject
app.post('/reject', (req, res) => {
  const { username, rejected_reason, start_date, end_date } = req.body;

  if (!username || !rejected_reason || !start_date || !end_date) {
    return res.status(400).json({ message: "All fields are required." });
  }

  console.log("Reject Request:", username, rejected_reason, start_date, end_date);

  const queryGetTimesheetId = `
    SELECT timesheet_id FROM work_hour
    WHERE employee_id = (SELECT user_id FROM user WHERE username = ?)
    AND work_date >= ? 
    AND work_date <= ?;
  `;

  db.query(queryGetTimesheetId, [username, start_date, end_date], (err, result) => {
    if (err) {
      console.error("Error fetching timesheet IDs:", err);
      return res.status(500).json({ message: "Server error while fetching timesheets." });
    }

    if (result.length === 0) {
      console.warn("No timesheets found for:", { username, start_date, end_date });
      return res.status(404).json({ message: "No timesheets found for the specified period." });
    }

    const timesheetIds = result.map(row => row.timesheet_id);
    console.log("Timesheet IDs to reject:", timesheetIds);

    const queryUpdateStatus = `
      UPDATE work_hour
      SET status = 'rejected'
      WHERE timesheet_id IN (${timesheetIds.map(() => "?").join(", ")});
    `;

    db.query(queryUpdateStatus, timesheetIds, (err) => {
      if (err) {
        console.error("Error updating work hour statuses:", err);
        return res.status(500).json({ message: "Error updating work hour statuses." });
      }

      const queryReject = `
        INSERT INTO rejections (timesheet_id, rejected_reason, rejected_date)
        VALUES ${timesheetIds.map(() => "(?, ?, NOW())").join(", ")};
      `;
      const rejectionValues = timesheetIds.flatMap(id => [id, rejected_reason]);

      db.query(queryReject, rejectionValues, (err) => {
        if (err) {
          console.error("Error inserting rejection reasons:", err);
          return res.status(500).json({ message: "Error inserting rejection reasons." });
        }

        console.log("Work hours rejected successfully for:", timesheetIds);
        return res.json({ message: "Work hours rejected successfully." });
      });
    });
  });
});


//get employee work hour  details
app.post("/details", (req, res) => {
  const { username, start_date, end_date } = req.body;

  const query = `
    SELECT 
      p.project_name,
      wh.work_date,
      wh.work_hours
    FROM work_hour wh
    JOIN project_employees pe ON wh.project_id = pe.project_id AND wh.employee_id = pe.employee_id
    JOIN projects p ON pe.project_id = p.project_id
    JOIN user u ON pe.employee_id = u.user_id
    WHERE u.username = ? AND wh.work_date BETWEEN ? AND ?
    ORDER BY wh.work_date, p.project_name;
  `;

  db.query(query, [username, start_date, end_date], (err, results) => {
    if (err) {
      console.error("Error fetching details:", err.message);
      return res.status(500).send("Error fetching details");
    }

    const projectData = results.reduce((acc, { project_name, work_date, work_hours }) => {
      if (!acc[work_date]) {
        acc[work_date] = { date: work_date }; 
      }
      acc[work_date][project_name] = work_hours; 

      return acc;
    }, {});

    const formattedData = Object.values(projectData);

    const allProjects = [...new Set(results.map(item => item.project_name))];

    formattedData.forEach(row => {
      allProjects.forEach(project => {
        if (!row[project]) {
          row[project] = 0;  
        }
      });
    });

    res.json(formattedData);
  });
});


// Get admin details
app.get("/adminDetails", (req, res) => {
  const sql = "SELECT username, email, department FROM user WHERE role = 'admin' LIMIT 1";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching admin details:", err);
      return res.status(500).send("Error fetching admin details");
    }
    if (results.length === 0) {
      return res.status(404).send("Admin not found");
    }
    res.json(results[0]);
  });
});

// Update admin details
app.put("/adminDetails", (req, res) => {
  const { username, email, department } = req.body;
  const sql = "UPDATE user SET username = ?, email = ?, department = ? WHERE role = 'admin' LIMIT 1";
  db.query(sql, [username, email, department], (err, result) => {
    if (err) {
      console.error("Error updating admin details:", err);
      return res.status(500).send("Error updating admin details");
    }
    res.send("Admin details updated successfully");
  });
});



//performance
app.get('/monthperformance', (req, res) => {
  const { month, year } = req.query;

  const query = `
    SELECT u.username, u.Name, SUM(w.work_hours) AS total_hours
    FROM work_hour w
    JOIN user u ON w.employee_id = u.user_id
    WHERE MONTH(w.work_date) = ? AND YEAR(w.work_date) = ?
    GROUP BY w.employee_id
  `;

  db.query(query, [month, year], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});




//employee part

//TimesheetTable

app.get('/timesheet/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  const query = `
      SELECT DISTINCT
         pe.project_id,
      p.project_name,
      IFNULL(wh.work_hours, 0) AS hours_worked
    FROM 
      project_employees pe
    JOIN 
      projects p ON pe.project_id = p.project_id
    LEFT JOIN 
      work_hour wh ON pe.project_id = wh.project_id AND pe.employee_id = wh.employee_id
    WHERE 
      pe.employee_id = ?; 
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {

      console.error('Error fetching timesheet data:', err);
      res.status(500).json({ error: 'Failed to fetch timesheet data' });
    } else {
      res.json(results);
    }
  });
});


app.get('/api/employee', (req, res) => {
  const { employee_id } = req.query;


  if (!employee_id) {
    console.error('No Employee ID provided');
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const query = `
    SELECT u.Name AS employee_name, u.user_id AS employee_id, p.project_name, p.project_id FROM user u
    JOIN project_employees pe ON u.user_id = pe.employee_id
    JOIN projects p ON pe.project_id = p.project_id
    WHERE u.user_id = ?;
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      console.error('Error fetching employee details:', err);
      return res.status(500).json({ error: 'Error fetching employee details' });
    }

    if (results.length === 0) {
      return res.json({ error: 'No employee data found' });
    }

    const projects = results.map((row) => ({
      project_id: row.project_id,
      project_name: row.project_name,
    }));

    res.json({ employee_name: results[0].employee_name, projects });
  });
});


app.post('/api/timesheet', (req, res) => {


  const { employeeId, projects } = req.body;

  const query = `
    INSERT INTO work_hour (project_id, employee_id, work_date, work_hours,status)
    VALUES ?
    ON DUPLICATE KEY UPDATE work_hours = VALUES(work_hours),status= VALUES(status)
`;


  const values = projects.map((project) => [
    project.project_id,
    employeeId,
    project.work_date,
    project.work_hours || 0,
    "pending",
  ]);

  db.query(query, [values], (err) => {
    if (err) {
      console.error("Error submitting timesheet:", err);
      return res.status(500).json({ error: "Error submitting timesheet" });
    }

    res.json({ message: "Timesheet submitted successfully" });
  });
});

app.get('/api/public-holidays', (req, res) => {
  let { dates } = req.query;

  if (!dates || dates.length === 0) {
    console.error('No dates provided to API');
    return res.status(400).json({ error: 'No dates provided' });
  }

  if (!Array.isArray(dates)) {
    dates = [dates];

  }

  const query = `
    SELECT date, name
    FROM public_holidays
    WHERE DATE(date) IN (?)`;

  db.query(query, [dates], (err, results) => {
    if (err) {
      console.error('Error fetching holidays:', err);
      return res.status(500).json({ error: 'Error fetching holidays' });
    }


    const holidays = {};
    results.forEach((holiday) => {
      const normalizedDate = moment(holiday.date).tz('Asia/Kolkata').startOf('day').format('YYYY-MM-DD');
      holidays[normalizedDate] = holiday.name;
    });

    res.json(holidays);
  });
});

app.get('/api/submissions', (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const query = `
  SELECT 
      w.timesheet_id,
      w.project_id,
      DATE_FORMAT(DATE_SUB(w.work_date, INTERVAL (DAYOFWEEK(w.work_date) - 1) DAY), '%Y-%m-%d') AS week_start_date,
      SUM(w.work_hours) AS weekly_work_hour,
      w.status,
      r.rejected_reason
    FROM work_hour w
    LEFT JOIN rejections r ON w.timesheet_id = r.timesheet_id
    WHERE w.employee_id = ?
    GROUP BY w.project_id, week_start_date, w.status, r.rejected_reason
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      console.error('Error fetching submissions:', err);
      return res.status(500).json({ error: 'Failed to fetch submissions.' });
    }


    const formattedResults = results.map((row) => ({
      timesheet_id: row.timesheet_id,
      project_id: row.project_id,
      week_start_date: row.week_start_date,
      weekly_work_hour: row.weekly_work_hour,
      status: row.status,
      rejection_reason: row.rejected_reason || '',
    }));

    res.json(formattedResults);
  });
});


app.get('/api/work_hours/week', (req, res) => {
  const { employee_id, week_start_date } = req.query;

  if (!employee_id || !week_start_date) {
    return res.status(400).json({ error: 'Employee ID and week start date are required' });
  }


  const datesQuery = `
    SELECT DATE_ADD(?, INTERVAL n DAY) AS work_date
    FROM (
      SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
      UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    ) AS numbers
  `;


  const workHoursQuery = `
    SELECT
      dates.work_date,
      w.timesheet_id,
      w.project_id,
      p.project_name,
      COALESCE(w.work_hours, 0) AS work_hours,
      COALESCE(w.status, 'empty') AS status
    FROM (${datesQuery}) AS dates
    LEFT JOIN work_hour w
      ON w.employee_id = ? AND w.work_date = dates.work_date
    LEFT JOIN projects p
      ON w.project_id = p.project_id
  `;


  db.query(workHoursQuery, [week_start_date, employee_id], (err, results) => {
    if (err) {
      console.error('Error fetching work hours:', err);
      return res.status(500).json({ error: 'Error fetching work hours' });
    }
    res.json(results);
  });
});



app.put('/api/work_hours/update', (req, res) => {
  const { timesheet_updates } = req.body;

  if (!Array.isArray(timesheet_updates) || timesheet_updates.length === 0) {
    return res.status(400).json({ error: 'Invalid input: timesheet_updates must be a non-empty array' });
  }
  const query = `
  UPDATE work_hour
  SET work_hours = ?, status = 'pending'
  WHERE timesheet_id = ?
`;


  const updatePromises = timesheet_updates.map(({ timesheet_id, work_hours }) => {
    return new Promise((resolve, reject) => {
      db.query(query, [work_hours, timesheet_id], (err, results) => {
        if (err) {
          console.error(`Error: updating timesheet_id ${timesheet_id}:`, err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  });


  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: 'Work hours updated successfully.' });
    })
    .catch((error) => {
      console.error('Error updating work hours:', error);
      res.status(500).json({ error: 'Error updating work hours.' });
  });
});







app.listen(5000, () => {
    console.log("Listening on port 5000");
});