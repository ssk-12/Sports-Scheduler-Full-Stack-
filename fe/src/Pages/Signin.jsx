import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { Message } from "../components/Message"; 
import { useState } from "react";

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMessage] = useState(""); 

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        email,
        password,
      });

      //setting up local storage items
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userid", response.data.userid);
      localStorage.setItem("username", response.data.username); 

      if (response.data.message == "User signed in successfully") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      setMessage(error.response?.data?.message || "Sign in failed"); // Set message based on error response
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center items-center">
      <div className="rounded-lg bg-white w-96 text-center p-4 shadow-lg">
        <Heading label={"Sign in"} />
        <SubHeading label={"Enter your credentials to access your account"} />
        <InputBox
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@gmail.com"
          label={"Email"}
        />
        <InputBox
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          label={"Password"}
        />
        <div className="pt-4">
          <Button
            onClick={handleSignIn}
            label={"Sign in"}
          />
        </div>
        {msg && <Message label={msg} />} {/* Display message if present */}
        <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
      </div>
    </div>
  );
};
