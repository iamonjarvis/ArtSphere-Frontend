import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import { PhotoIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logoartsp.png"; // Import the logo

function LoginSignup() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    dob: "",
    bio: "",
    profilePic: null,
  });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const toggleForm = () => setIsSignup(!isSignup);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, profilePic: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      if (isSignup) {
        // Append all fields for signup
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
      } else {
        // In login mode, send only userId, email, and password
        formDataToSend.append("userId", formData.userId);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
      }

      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await axios.post(endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response:", response.data);

      if (isSignup) {
        alert("Signup successful. Please log in.");
        setIsSignup(false);
        setFormData((prev) => ({
          ...prev,
          userId: "",
          name: "",
          dob: "",
          bio: "",
          profilePic: null,
          password: "",
        }));
      } else {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/home");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.error || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4F3]">
      {/* Header with Logo */}
      <header className="py-8">
        <div className="container mx-auto flex justify-center">
          <img
            src={logo} // Use the imported logo
            alt="Logo"
            className="w-48 md:w-64 lg:w-80 object-contain"
          />
        </div>
      </header>

      {/* Form Container */}
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-semibold text-[#5B2333] mb-6 text-center">
            {isSignup ? "Sign Up" : "Login"}
          </h2>
          <form onSubmit={handleSubmit}>
            {isSignup ? (
              <>
                <input
                  type="text"
                  name="userId"
                  placeholder="User ID"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                  required
                />
                {/* Profile Picture */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {formData.profilePic ? (
                    <img
                      src={URL.createObjectURL(formData.profilePic)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
                      <PhotoIcon className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <PhotoIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                  required
                />
                <div className="mb-3">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                    required
                  />
                </div>
                <textarea
                  name="bio"
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                  required
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="userId"
                  placeholder="User ID"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
                />
              </>
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5B2333]"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#5B2333] text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            {isSignup
              ? "Already have an account? "
              : "Don't have an account? "}
            <span
              className="text-[#5B2333] font-medium cursor-pointer hover:underline"
              onClick={toggleForm}
            >
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
