import { useEffect, useState } from 'react';
import '../styles/styles.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function Home() {
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    const stats = [
      { date: '2025-06-01', users: 4 },
      { date: '2025-06-02', users: 10 },
      { date: '2025-06-03', users: 7 },
      { date: '2025-06-04', users: 12 },
      { date: '2025-06-05', users: 8 },
      { date: '2025-06-06', users: 15 },
      { date: '2025-06-07', users: 18 }
    ];
    setUserStats(stats);
  }, []);

  return (
    <div className="home-container container page-wrapper text-center text-light py-5">
      <h1 className="display-4 fw-bold mb-3 gradient-text">Welcome to <span className="text-primary">Pro-Inventory</span></h1>

      <p className="lead mb-4">
        <strong>Pro-Inventory</strong> is your intelligent business solution for real-time inventory control, reporting, and user insights.
      </p>

      <div className="row justify-content-center mb-4">
        <div className="col-md-10">
          <p className="fs-5">
            Our platform offers a seamless experience for tracking, editing, and evaluating inventory in real-time. From adding new stock to recording precise transaction histories, every action is secured under user-specific authentication, ensuring data privacy and individual accountability.
            Designed for warehouses, retailers, and enterprises that demand precision and clarity, our platform scales effortlessly and empowers decision-makers with clean UI and powerful backend intelligence.
          </p>
          <p className="fs-6 text-secondary">
Designed using the latest in web technology <strong>React.js</strong> for the frontend, <strong>Node.js</strong> for the backend, and <strong>MongoDB</strong>MongoDB for dynamic data handling <strong>Pro-Inventory</strong> is optimized for speed, security, and scalability. The intuitive UI, enhanced with a responsive dark theme and powerful dashboards, keeps everything organized and easy to navigate, whether you're on a desktop or mobile.          </p>
        </div>
      </div>

      <div className="chart-wrapper mt-5">
        <h3 className="fw-bold mb-4">📊 Weekly User Login Analytics</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={userStats}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2c" />
            <XAxis
              dataKey="date"
              stroke="#bbb"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#bbb" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#222', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ color: '#ccc' }}
              itemStyle={{ fontSize: '14px' }}
            />
            <Bar dataKey="users" fill="#00c6ff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5">
        <p className="text-muted">
          Questions? Visit our <a href="/contact" className="text-info">Contact</a> page or learn more <a href="/about" className="text-info">About Us</a>.
        </p>
      </div>
    </div>
  );
}
