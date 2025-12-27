import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/PrivateRoute";

const API_URL = "http://localhost:8000/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/register");
      return;
    }

    axios
      .get(`${API_URL}/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Profile fetch error", err);
        navigate("/register");
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/register");
  };

  return (
    <div className="p-6">
      {profile ? (
        <div>
          <h2 className="text-xl font-semibold">{profile.full_name}</h2>
          <p className="text-gray-600">{profile.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
