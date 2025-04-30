// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, TrendingUp, List } from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7); // Default to 7 days
  
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData(dateRange);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-semibold text-gray-600 mb-4">No data available</div>
        <p className="text-gray-500">
          Start logging your activities to see insights on your dashboard.
        </p>
      </div>
    );
  }
  
  // Prepare data for daily breakdown chart
  const dailyChartData = dashboardData.daily_breakdown.map(day => {
    const data = {
      date: day.date,
    };
    
    // Add each activity type's minutes
    Object.entries(day.activities).forEach(([name, details]) => {
      data[name] = details.minutes;
    });
    
    return data;
  });
  
  // Get all unique activity type names for the line chart
  const activityTypeNames = [];
  if (dashboardData.daily_breakdown.length > 0) {
    Object.keys(dashboardData.daily_breakdown[0].activities).forEach(name => {
      if (!activityTypeNames.includes(name)) {
        activityTypeNames.push(name);
      }
    });
  }
  
  // Prepare data for activity totals (top activities)
  const sortedActivities = [...dashboardData.activity_totals]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10); // Get top 10
  
  // Prepare data for sleep consistency chart
  const sleepData = dashboardData.sleep_data.map(day => {
    // Convert sleep and wake times to minutes since midnight for visualization
    const sleepTimeParts = day.sleep_time.split(':');
    const sleepMinutes = parseInt(sleepTimeParts[0]) * 60 + parseInt(sleepTimeParts[1]);
    
    const wakeTimeParts = day.wake_time.split(':');
    const wakeMinutes = parseInt(wakeTimeParts[0]) * 60 + parseInt(wakeTimeParts[1]);
    
    return {
      date: day.date,
      sleepTime: sleepMinutes,
      wakeTime: wakeMinutes,
      duration: day.duration_minutes
    };
  });
  
  // Format minutes as hours and minutes
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Format minutes on time axis to show as time
  const formatTimeAxis = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Time Tracking Dashboard</h1>
      
      {/* Date range selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Date Range</h2>
        </div>
        <div className="flex space-x-4">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-md ${
                dateRange === days 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {days === 7 ? 'Week' : days === 14 ? '2 Weeks' : days === 30 ? 'Month' : '3 Months'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Daily activity breakdown chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Daily Activity Breakdown</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatMinutes(value)} />
              <Tooltip formatter={(value) => formatMinutes(value)} />
              <Legend />
              {activityTypeNames.map((name, index) => {
                // Get color from the activity data
                const color = dashboardData.daily_breakdown[0]?.activities[name]?.color || '#8884d8';
                return (
                  <Area 
                    key={name}
                    type="monotone" 
                    dataKey={name} 
                    stackId="1"
                    stroke={color}
                    fill={color}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Top activities */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <List className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Top Activities</h2>
        </div>
        {sortedActivities.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedActivities}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                />
                <YAxis tickFormatter={(value) => formatMinutes(value)} />
                <Tooltip formatter={(value) => formatMinutes(value)} />
                <Bar dataKey="minutes">
                  {sortedActivities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center p-8">No activity data available</p>
        )}
      </div>
      
      {/* Sleep consistency */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Sleep Consistency</h2>
        </div>
        {sleepData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sleepData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={[0, 1440]} // 24 hours in minutes
                  tickFormatter={formatTimeAxis}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'duration') return formatMinutes(value);
                    return formatTimeAxis(value);
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sleepTime" 
                  name="Sleep Time" 
                  stroke="#8e44ad" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wakeTime" 
                  name="Wake Time" 
                  stroke="#3498db" 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center p-8">No sleep data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;