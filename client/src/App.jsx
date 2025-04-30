import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import NavBar from './components/NavBar'
import './App.css'
import Dashboard from './components/Dashboard';
import ActivityTypeList from './components/ActivityTypeList';
import ActivityList from './components/ActivityList';
import { ToastContainer } from 'react-toastify';
import TimeLogList from './components/TimeLogList';
import TimeLogForm from './components/TimeLogForm';

function App() {
  async function logout() {
    const res = await fetch("/registration/logout/", {
      credentials: "same-origin", // include cookies!
    });

    if (res.ok) {
      // navigate away from the single page app!
      window.location = "/registration/sign_in/";
    } else {
      // handle logout failed!
    }
  }

  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <NavBar onLogout={logout}/>
        <div className='container mx-auto px-4 py-8'>
          <Routes>
            <Route path="/" element={
              <Dashboard />
            } />
            <Route path='/activity-types' element={
              <ActivityTypeList />
            } />
            <Route path='/activities' element={
              <ActivityList />
            } />
            <Route path='/time-logs' element= {
              <TimeLogList />
            } />
            <Route path='/add-time-log' element={
              <TimeLogForm />
            } />
            <Route path='/edit-time-log/:id' element={
              <TimeLogForm />
            } />
          </Routes>
        </div>
        <ToastContainer position='bottom-right' />
      </div>
    </Router>
  )
}

export default App;
