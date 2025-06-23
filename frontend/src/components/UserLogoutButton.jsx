import { useNavigate } from 'react-router-dom';

function UserLogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('user'); // Clear user data
            navigate('/login');
        }
    };

    return (
        <button onClick={handleLogout} className="dropdown-item">
            Logout
        </button>
    );
}

export default UserLogoutButton;
