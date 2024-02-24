import React, { useState } from 'react';
import axios from 'axios';

export const CreateSport = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/v1/user/new-sport', { title }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
      });

      if (response.data) {
        setMessage(response.data.message);
        // Handle success (maybe clear form or redirect)
      }
    } catch (err) {
      setMessage(err.response.data.message || 'An error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Sport Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Sport title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Sport
          </button>
        </div>
      </form>
      {message && (
        <div className="text-center py-4 lg:px-4">
          <div className="p-2 bg-blue-800 items-center text-blue-100 leading-none lg:rounded-full flex lg:inline-flex" role="alert">
            <span className="flex rounded-full bg-blue-500 uppercase px-2 py-1 text-xs font-bold mr-3">Info</span>
            <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};