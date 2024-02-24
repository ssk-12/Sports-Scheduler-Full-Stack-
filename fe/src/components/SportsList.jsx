import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const SportList = () => {
  const [sports, setSports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/user/sports-names');
        setSports(response.data);
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    };

    fetchSports();
  }, []);

  const handleSelectSport = (sport) => {
    // navigate(`/create-session/${sport.sportTitle}/${sport.sportId}`);
    navigate('/create-session?id='+ sport.sportId + "&title=" + sport.sportTitle)
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ul className="space-y-2">
        {sports.map((sport, index) => (
          <li 
            key={index} 
            className="cursor-pointer p-2 hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 shadow-md rounded-lg"
            onClick={() => handleSelectSport(sport)}
          >
            <h3 className="font-semibold text-lg text-gray-800">{sport.sportTitle}</h3>
            <p className="text-sm text-gray-600">{sport.userName}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
