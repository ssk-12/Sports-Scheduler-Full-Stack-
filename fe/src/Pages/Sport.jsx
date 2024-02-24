import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Appbar } from '../components/Appbar';

export const Sports = () => {
  const [sports, setSports] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/user/sports-by-id', {
          sportId: id
        });
        setSports(response.data);
      } catch (error) {
        console.error('Error fetching sports:', error);
        navigate('/signin');
      }
    };

    fetchSports();
  }, [id]); // Added 'id' as a dependency to refetch when it changes

  const handleJoinSession = (sport) => {
    //join session logic here

  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Appbar heading={"SportsList"} page = {"sports"} sport={id}/>
      <div className="p-4 flex flex-wrap justify-center gap-4"> {/* Adjusted for flexbox layout */}
        {sports.map((sport, index) => (
          <div key={index} className="bg-white shadow overflow-hidden rounded-md p-4 w-full md:w-1/2 lg:w-1/3 xl:w-1/4"> {/* Adjusted for responsive card sizing */}
            <div>
              <h2 className="text-lg font-semibold">{sport.title}</h2> {/* Corrected property name */}
              <p className="text-gray-600">{sport.userName}</p>
              <p className="text-gray-600">Date: {sport.date}</p>
              <p className="text-gray-600">Time: {sport.time}</p>
              <p className="text-gray-600">Location: {sport.location}</p>
            </div>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleJoinSession(sport)}
            >
              Join Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
