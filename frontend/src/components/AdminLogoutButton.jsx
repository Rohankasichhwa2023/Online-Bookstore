import { useNavigate } from 'react-router-dom';

function AdminLogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminUser'); // Remove admin info
        navigate('/admin-login'); // Redirect to login page
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default AdminLogoutButton;
