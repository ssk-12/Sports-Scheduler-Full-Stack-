import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./Button";

export const Appbar = (props) => {
    const navigate = useNavigate();

    return (
        <div className="bg-blue-700 shadow-lg h-16 flex justify-between items-center px-6 text-white">
            <h1 className="text-2xl font-bold">
                SportScheduler
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-lg hidden sm:block">{props.username}</span>
                <span className="text-lg hidden sm:block">{props.heading}</span>
                {/* Conditionally render "New Sport" button only for admin */}
                {props.role === "admin" && (
                    <Button onClick={() => navigate('/new-sport')} label="New Sport" className="bg-green-500 hover:bg-green-600" />
                )}
                {props.page === "sports" && (
                    
                    <Button onClick={() => navigate('/create-session?id='+ props.sport + "&title=" + props.sport)} label="Create Session" className="bg-green-500 hover:bg-green-600" />
                )}
                <Button onClick={() => navigate('/signout')} label="Sign Out" className="bg-red-500 hover:bg-red-600" />
            </div>
        </div>
    );
};
