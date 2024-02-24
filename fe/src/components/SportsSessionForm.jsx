import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';


export function SportsSessionForm() {

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    players: '',
    additional: '',
  });

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value, id:id, Sporttitle:title });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        // redirect to login
        navigate("/signin", { replace: true });
        return;
      }


      const response = await axios.post('http://localhost:3000/api/v1/user/sports-session', formData, {
        headers: {

          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Session created successfully:', response.data);
      // Handle post-success actions here, such as redirecting or clearing the form
    } catch (error) {
      console.error('Error creating session:', error);
      // Handle errors, such as displaying a notification
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="input" />
      <input type="date" name="date" value={formData.date} onChange={handleChange} className="input" />
      <input type="time" name="time" value={formData.time} onChange={handleChange} className="input" />
      <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="input" />
      <input type="text" name="players" value={formData.players} onChange={handleChange} placeholder="Players (comma-separated emails)" className="input" />
      <input type="text" name="additional" value={formData.additional} onChange={handleChange} placeholder="Additional Info" className="input" />
      <button type="submit" className="btn">Submit</button>
    </form>
  );
}

