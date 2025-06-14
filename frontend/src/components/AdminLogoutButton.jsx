import { useNavigate } from 'react-router-dom';

function AdminLogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('adminUser'); // Remove admin info
            navigate('/admin-login'); // Redirect to login page
        }
    };

    return (
        <button onClick={handleLogout} style={{fontSize: "16px", fontWeight: "500",color: "white", cursor: "pointer", backgroundColor: "transparent", border: "none", padding: "0px"}}>
            Logout
        </button>
    );
}

export default AdminLogoutButton;
