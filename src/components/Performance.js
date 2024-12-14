import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from './Layout'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Performance = () => {
  const [performanceData, setPerformanceData] = useState([]); 
  const [month, setMonth] = useState('12'); 
  const [year, setYear] = useState('2024'); 
  const [loading, setLoading] = useState(false); 

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Fetch data when month or year changes
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/monthperformance', {
          params: { month, year }, 
        });
        setPerformanceData(response.data); 
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [month, year]);

  const chartData = {
    labels: performanceData.map((data) => data.username), // X-axis
    datasets: [
      {
        label: 'Total Work Hours',
        data: performanceData.map((data) => data.total_hours), // Y-axis
        backgroundColor: 'rgba(75, 192, 192, 0.6)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Employee Work Hours for ${months[month - 1]} ${year}`, // Title with month name
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Hours: ${tooltipItem.raw}`, 
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Employee', 
        },
      },
      y: {
        title: {
          display: true,
          text: 'Work Hours', 
        },
        beginAtZero: true, 
      },
    },
  };

  return (
    <Layout heading="monthly performance">
      <div className="container mt-4">
        <div className="mb-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)} 
            className="form-select w-auto d-inline me-2"
          >
            {months.map((monthName, index) => (
              <option key={index} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)} 
            min="2000"
            max="2099"
            className="form-control w-auto d-inline"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : performanceData.length > 0 ? (
          <div style={{ width: '80%', margin: 'auto' }}>
            <Bar data={chartData} options={chartOptions} /> 
          </div>
        ) : (
          <p>No data available for the selected month and year.</p>
        )}
      </div>
    </Layout>
  );
};

export default Performance;
