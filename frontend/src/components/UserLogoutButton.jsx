import { useNavigate } from 'react-router-dom';

function UserLogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user'); // Remove user info
        navigate('/login'); // Redirect to login page
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default UserLogoutButton;
