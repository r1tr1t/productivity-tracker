import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const TimeLogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [formData, setFormData] = useState({
    activity: '',
    activity_type: '', // Added activity_type to formData
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    end_time: format(new Date(Date.now() + 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
    notes: ''
  });
  
  useEffect(() => {
    fetchActivityTypes();
    fetchActivities();
    
    if (isEditing) {
      fetchTimeLog();
    }
  }, [id]);
  
  const fetchTimeLog = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTimeLog(id);
      const timeLog = response.data;
      
      setFormData({
        activity: timeLog.activity?.id || '',
        activity_type: timeLog.activity_type.id, // Get activity_type from response
        date: timeLog.date,
        start_time: timeLog.start_time,
        end_time: timeLog.end_time,
        notes: timeLog.notes || ''
      });
      
      setSelectedActivityType(timeLog.activity_type.id);
    } catch (error) {
      console.error('Error fetching time log', error);
      toast.error('Failed to load time log data');
      navigate('/time-logs');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchActivities = async () => {
    try {
      const response = await apiService.getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities', error);
      toast.error('Failed to load activities');
    }
  };
  
  const fetchActivityTypes = async () => {
    try {
      const response = await apiService.getActivityTypes();
      setActivityTypes(response.data);
    } catch (error) {
      console.error('Error fetching activity types', error);
      toast.error('Failed to load activity types');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleActivityTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedActivityType(typeId);
    // Update both the selected type and reset the activity when type changes
    setFormData({ 
      ...formData, 
      activity_type: typeId, 
      activity: '' 
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      
      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        return;
      }
      
      const payload = {
        activity: formData.activity || null, // Allow null for activity (as per model definition)
        activity_type: formData.activity_type, // Include activity_type in payload
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes
      };
      
      if (isEditing) {
        await apiService.updateTimeLog(id, payload);
        toast.success('Time log updated successfully');
      } else {
        await apiService.createTimeLog(payload);
        toast.success('Time log created successfully');
      }
      
      navigate('/time-logs');
    } catch (error) {
      console.error('Error saving time log', error);
      toast.error('Failed to save time log');
    }
  };
  
  const filteredActivities = selectedActivityType 
    ? activities.filter(activity => activity.activity_type.id === selectedActivityType)
    : activities;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading time log data...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/time-logs')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Time Log' : 'Add New Time Log'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="activity_type">
                Activity Type<span className="text-red-500">*</span>
              </label>
              <select
                id="activity_type"
                name="activity_type"
                value={formData.activity_type}
                onChange={handleActivityTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Activity Type</option>
                {activityTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="activity">
                Activity <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <select
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Activity</option>
                {filteredActivities.map(activity => (
                  <option key={activity.id} value={activity.id}>{activity.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="start_time">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="end_time">
                End Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add any notes about this activity..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/time-logs')}
              className="px-4 py-2 mr-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Save className="w-5 h-5 mr-2" />
              {isEditing ? 'Update' : 'Save'} Time Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogForm;