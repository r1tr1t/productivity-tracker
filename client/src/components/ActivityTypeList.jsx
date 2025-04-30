// src/components/ActivityTypeList.js
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, Clock } from 'lucide-react';

const ActivityTypeList = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    color: '#3498db'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchActivityTypes();
  }, []);
  
  const fetchActivityTypes = async () => {
    try {
      setLoading(true);
      let response = await apiService.getActivityTypes();
      if (!response.data.length) {
        await apiService.createDefaults();
        response = await apiService.getActivityTypes();
      }
      setActivityTypes(response.data);
    } catch (error) {
      console.error('Error fetching activity types', error);
      toast.error('Failed to load activity types');
    } finally {
      setLoading(false);
    }
  };
  
  const openModal = (activityType = null) => {
    if (activityType) {
      setFormData({
        id: activityType.id,
        name: activityType.name,
        description: activityType.description || '',
        color: activityType.color
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        color: '#3498db'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await apiService.updateActivityType(formData.id, formData);
        toast.success('Activity type updated successfully');
      } else {
        await apiService.createActivityType(formData);
        toast.success('Activity type created successfully');
      }
      
      fetchActivityTypes();
      closeModal();
    } catch (error) {
      console.error('Error saving activity type', error);
      toast.error('Failed to save activity type');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity type?')) {
      return;
    }
    
    try {
      await apiService.deleteActivityType(id);
      toast.success('Activity type deleted successfully');
      fetchActivityTypes();
    } catch (error) {
      console.error('Error deleting activity type', error);
      toast.error('Failed to delete activity type');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading activity types...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Types</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Activity Type
        </button>
      </div>
      
      {activityTypes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Activity Types</h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first activity type.
          </p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Activity Type
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activityTypes.map((activityType) => (
            <div
              key={activityType.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div 
                className="h-2" 
                style={{ backgroundColor: activityType.color }}
              ></div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{activityType.name}</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openModal(activityType)}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    {!activityType.is_default && (
                      <button 
                        onClick={() => handleDelete(activityType.id)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                {activityType.description && (
                  <p className="text-gray-600 mt-2">{activityType.description}</p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {activityType.activities_count} activities
                  </div>
                  {activityType.is_default && (
                    <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Default
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit Activity Type' : 'Add Activity Type'}
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
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                  Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="h-10 w-10 mr-2"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Hex color code (e.g. #3498db)"
                  />
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

export default ActivityTypeList;