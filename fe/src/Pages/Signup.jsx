import { useState } from "react";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { Message } from "../components/Message";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("player");
  const [msg, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
        username: userName,
        email,
        password,
        role,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userid", response.data.userid);
      localStorage.setItem("username", response.data.username);

      setMessage(response.data.message); 

      if (response.data.message !== "User already exists") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setMessage(error.response.data.message || "Signup failed");
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center items-center">
      <div className="rounded-lg bg-white w-96 text-center p-4 shadow-lg">
        <Heading label={"Sign up"} />
        <SubHeading label={"Enter your information to create an account"} />
        <InputBox
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Username"
          label={"User Name"}
        />
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
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="player">Player</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="pt-4">
          <Button
            onClick={handleSignup}
            label={"Sign up"}
          />
        </div>
        {msg && <Message label={msg} />}
        <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
      </div>
    </div>
  );
};
