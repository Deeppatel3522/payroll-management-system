import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute role="admin" />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Protected Employee Routes */}
                <Route element={<ProtectedRoute role="employee" />}>
                    <Route path="/dashboard" element={<EmployeeDashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;