import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import NavBar from './components/NavBar'
import './App.css'

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
      </div>
    </Router>
  )
}

export default App;
