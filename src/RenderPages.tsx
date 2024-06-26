import React from 'react';
import { BrowserRouter as Router, Routes as Pathhub, Route as Path, Navigate as Redirect } from 'react-router-dom'
import LoginPage from './pages/credentials/login.tsx';
import LogoutPage from './pages/credentials/logout.tsx';
import HomePage from './pages/main/homepage.tsx';
import EventsPage from './pages/main/events.tsx';
import CalendarPage from './pages/main/calendar.tsx';

// SCSS
import './assets/scss/global.scss';

const RenderPages: React.FC = (): React.JSX.Element => {
  return (
    <Router>
      <Pathhub>
        {/* Redirects */}
        <Path path="/login/*" element={<Redirect to="/login" />} />
        <Path path="/logout/*" element={<Redirect to="/logout" />} />
        <Path path="/*" element={<Redirect to="/" />} />
        <Path path="/events/*" element={<Redirect to="/events" />} />
        <Path path="/calendar/*" element={<Redirect to="/calendar" />} />

        {/* Pages */}
        <Path path="/login" element={<LoginPage />} />
        <Path path="/logout" element={<LogoutPage />} />
        <Path path="/" element={<HomePage />} />
        <Path path='/events' element={<EventsPage />} />
        <Path path="/calendar" element={<CalendarPage />} />
      </Pathhub>
    </Router>
  )
};

export default RenderPages;