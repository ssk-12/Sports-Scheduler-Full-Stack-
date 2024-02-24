import { Appbar } from "../components/Appbar";
import { SportList } from "../components/SportsList";
import { useNavigate } from "react-router-dom"
import { SportsSessionForm } from "../components/SportsSessionForm";
import { useState , useEffect } from "react";
import axios from "axios";

export function Dashboard(){
    const navigate = useNavigate();

    const[userName, setUserName] =useState("");
    const[userrole, setUserrole] = useState("player");

    useEffect(() => {
        
        const fetch = async () => {
            try {
                // Retrieve the token from localStorage
                const token = localStorage.getItem("token");

                if (!token) {

                    console.log("No token found");
                    // redirect to login
                    navigate( "/signin", { replace: true });
                    return;
                }

                // Make the API call with the token in the Authorization header
                const response = await axios.get("http://localhost:3000/api/v1/user/protected", {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                });

                if(response){
                    setUserName(response.data.user)
                    setUserrole(response.data.role)
                }


                
            } catch (error) {
                console.error("Failed to fetch balance", error);
                navigate('/signin');
            }
        };

        fetch();
    }, []);



    return <div>
        <Appbar username={userName} role={userrole} />
        <SportList/>
        {/* <SportsSessionForm/> */}
    </div>
}