import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './Button';

export function SportsSessionForm() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    players: '',
    additional: '',
  });
  const [message, setMessage] = useState(''); 
  const [messageType, setMessageType] = useState(''); 

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, id, Sporttitle: title }; 
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No token found. Please log in.");
        setMessageType('error');
        navigate("/signin", { replace: true });
        return;
      }

      await axios.post('http://localhost:3000/api/v1/user/sports-session', updatedFormData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('Session created successfully!');
      setMessageType('success');
      
    } catch (error) {
      console.error('Error creating session:', error);
      setMessage('Error creating session. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
  <div className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <input
        type="text"
        name="players"
        value={formData.players}
        onChange={handleChange}
        placeholder="Players (comma-separated emails)"
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <input
        type="text"
        name="additional"
        value={formData.additional}
        onChange={handleChange}
        placeholder="Additional Info"
        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Create
      </button>
    </form>
    {message && (
      <div className={`mt-4 text-sm ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
        {message}
        <Button label={"return to dashboard"} onClick={()=>navigate("/dashboard")}/>
      </div>
    )}
  </div>
</div>

  );
}
