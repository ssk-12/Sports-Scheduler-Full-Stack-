import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Details = () => {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const[username, setUsername]= useState("");

    useEffect(() => {
        // Define an async function inside useEffect
        const fetch = async () => {
            try {
                // Retrieve the token from localStorage
                const token = localStorage.getItem("token");

                if (!token) {
                    console.log("No token found");
                    // Handle case when token is not available, e.g., redirect to login
                    return;
                }

                // Make the API call with the token in the Authorization header
                const response = await axios.get("http://localhost:3000/api/v1/user/protected", {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                });

                if(response){
                    setMsg(response.data.message); 
                    setUsername(response.data.user)
                }


                
            } catch (error) {
                console.error("Failed to fetch balance", error);
            }
        };

        fetch();
    }, []);



    return (
        <div>
            <p>hi</p>
            <p>{msg}</p>
            <p>{username}</p>
        </div>
    );
};
