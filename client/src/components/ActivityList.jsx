import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Clock, CheckCircle } from 'lucide-react';

const ActivityList = () => {
  const [activities, setActivities] = useState({});
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    activity_type: '',
    is_favorite: false
  });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
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
  

  
  const openModal = (activity = null) => {
    if (activity) {
      setFormData({
        id: activity.id,
        name: activity.name,
        description: activity.description || '',
        activity_type: activity.activity_type.id,
        is_favorite: activity.is_favorite
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        activity_type: '',
        is_favorite: false
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await apiService.updateActivity(formData.id, formData);
        toast.success('Activity updated successfully');
      } else {
        await apiService.createActivity(formData);
        toast.success('Activity created successfully');
      }
      
      fetchActivities();
      closeModal();
    } catch (error) {
      console.error('Error saving activity', error);
      toast.error('Failed to save activity');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await apiService.deleteActivity(id);
      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity', error);
      toast.error('Failed to delete activity');
    }
  };
  
  const getActivityTypeColor = (typeName) => {
    const activityType = activityTypes.find(type => type.name == typeName);
    return activityType ? activityType.color : '#3498db';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading activities...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Activity
        </button>
      </div>
      
      {Object.values(activities).reduce((acc, value) => acc + value.length, 0) === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Activities</h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first activity.
          </p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Activity
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(activities).map(type => (
            <div key={type} className='bg-white shadow-md rounded-lg p-4'>
              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2 mb-4'>{type}</h3>
              {activities[type].map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: getActivityTypeColor(type) }}
                  ></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">{activity.name}</h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal(activity)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(activity.id)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 mt-2">{activity.description}</p>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {activity.time_spent_formatted || '0h 0m'}
                      </div>
                      {activity.is_favorite && (
                        <div className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Favorite
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Type: {activity.activity_type.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit Activity' : 'Add Activity'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activity_type">
                  Activity Type
                </label>
                <select
                  id="activity_type"
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select an activity type</option>
                  {activityTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_favorite"
                    name="is_favorite"
                    checked={formData.is_favorite}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-gray-700 text-sm" htmlFor="is_favorite">
                    Mark as favorite
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;