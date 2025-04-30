import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Calendar, Clock, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const TimeLogList = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    activity: '',
    activity_type: '',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchTimeLogs();
    fetchActivities();
  }, []);
  
  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTimeLogs(filters);
      setTimeLogs(response.data);
    } catch (error) {
      console.error('Error fetching time logs', error);
      toast.error('Failed to load time logs');
    }
  };
  
  const fetchActivities = async () => {
    let types = []
    try {
      const response = await apiService.getActivityTypes();
      types = response.data;
      setActivityTypes(response.data);
    } catch (error) {
      console.error('Error fetching activity types', error);
    }
    try {
      setLoading(true);
      let activitiesByType = {};
      for (const type of types) {
        const response = await apiService.getActivities(type.id);
        activitiesByType[type.name] = response.data || [];
      }
      setActivities(activitiesByType);
    } catch (error) {
      console.error('Error fetching activities', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) {
      return;
    }
    
    try {
      await apiService.deleteTimeLog(id);
      toast.success('Time log deleted successfully');
      fetchTimeLogs();
    } catch (error) {
      console.error('Error deleting time log', error);
      toast.error('Failed to delete time log');
    }
  };
  
  const openEditModal = (timeLogId) => {
    window.location.href = `/add-time-log/${timeLogId}`;
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  const applyFilters = (e) => {
    e.preventDefault();
    fetchTimeLogs();
  };
  
  const resetFilters = () => {
    setFilters({
      activity: '',
      activity_type: '',
      date_from: '',
      date_to: ''
    });
    setTimeout(() => {
      fetchTimeLogs();
    }, 0);
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatDateTime = (dateTimeStr) => {
    try {
      return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateTimeStr;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading time logs...</div>
      </div>
    );
  }
  
  console.log(activityTypes);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Logs</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          <button
            onClick={() => window.location.href = '/add-time-log'}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Time Log
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Time Logs</h2>
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="activity_type">
                Activity Type
              </label>
              <select
                id="activity_type"
                name="activity_type"
                value={filters.activity_type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {activityTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="activity">
                Activity
              </label>
              <select
                id="activity"
                name="activity"
                value={filters.activity}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Activities</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>{activity.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date_from">
                From Date
              </label>
              <input
                type="date"
                id="date_from"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date_to">
                To Date
              </label>
              <input
                type="date"
                id="date_to"
                name="date_to"
                onChange={handleFilterChange}
                value={filters.date_to}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Time Logs List */}
      {timeLogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Time Logs</h2>
          <p className="text-gray-600 mb-6">
            Start by logging your first activity time.
          </p>
          <button
            onClick={() => window.location.href = '/add-time-log'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Time Log
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(log.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {console.log(log)}
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: activityTypes.find(c => c.id === log.activity_type).color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.activity_name || ""}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.activity_type_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(log.duration_minutes)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(log.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLogList;