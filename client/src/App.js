// client/src/App.js
import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import axios from 'axios'; 

const App = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    const handleLogout = async () => {
        try {
            const username = loggedInUser; // Assuming loggedInUser is the username

            // API call to logout and clear token in the database using axios
            const response = await axios.post('http://localhost:5000/api/auth/logout', {
                username, // Send the username to logout
            });

            if (response.data.msg === 'User logged out successfully and token deleted') {
                console.log(response.data.msg); // Log the success message
                localStorage.removeItem('token'); // Remove token from localStorage
                setLoggedInUser(null); // Clear the logged-in user
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="App">
            {loggedInUser ? (
                <div>
                    <p>Welcome {loggedInUser}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <div>
                    <Register />
                    <Login setLoggedInUser={setLoggedInUser} />
                </div>
            )}
        </div>
    );
};

export default App;
