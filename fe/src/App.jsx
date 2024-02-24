import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Signup } from "./Pages/Signup";
import { Dashboard } from "./Pages/Dashboard"
import { Signin } from "./Pages/Signin";
import { SportsSessionForm } from "./components/SportsSessionForm";
import {Signout} from "./components/Signout"

function App() {
  return (
    <>
       <BrowserRouter>
        <Routes>
          
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signout" element={<Signout />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signout" element={<Signout />} />
          <Route path="/create-session" element={<SportsSessionForm />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
