import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EventsPage from './pages/EventsPage';
import UserProfile from './pages/UserProfile';
import MyEventsPage from './pages/MyEventsPage';
import AdminDashboard from './pages/AdminDashboard';
import EventViewPage from './pages/EventViewPage'; // optional
import LoginPage from './pages/LoginPage';
import CreateEventPage from './pages/CreateEventPage';

<Route path="/login" element={<LoginPage />} />

function App() {
  return (
    <Router>
      <div style={{ padding: '1rem' }}>
        {/* You can add <Navbar /> here */}

        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          <Route path="/create_event" element={<CreateEventPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/events/:id" element={<EventViewPage />} /> {/* optional */}
        </Routes>
      </div>
    </Router>
  );
}


export default App;
