import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Signup } from "./Pages/Signup";
import { Dashboard } from "./Pages/Dashboard"
import { Signin } from "./Pages/Signin";

function App() {
  return (
    <>
       <BrowserRouter>
        <Routes>
          
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
