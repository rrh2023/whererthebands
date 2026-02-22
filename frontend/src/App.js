import './App.css';
import {useState} from "react"

import Login from "./components/Auth/Login.jsx"
import Signup from  "./components/Auth/Signup.jsx"
import GenreSelect from "./components/Onboarding/GenreSelect.jsx"
import Navbar from "./components/shared/Navbar.jsx"
import Dashboard from "./components/Dashboard/Dashboard.jsx"
import Profile from "./components/Profile/Profile.jsx"

const  App = () => {
  const [screen, setScreen] = useState("login"); // login | signup | onboarding | app
  const [navTab, setNavTab] = useState("Dashboard");
  const [genres, setGenres] = useState(["Indie Rock", "Electronic"]);

  if (screen === "login") return <Login onLogin={() => setScreen("onboarding")} onSwitch={() => setScreen("signup")} />;
  if (screen === "signup") return <Signup onSignup={() => setScreen("onboarding")} onSwitch={() => setScreen("login")} />;
  if (screen === "onboarding") return <GenreSelect onComplete={(g) => { setGenres(g); setScreen("app"); }} />;

  return (
    <div>
      <Navbar onNav={setNavTab} active={navTab} />
      {navTab === "Dashboard"
        ? <Dashboard genres={genres} />
        : <Profile genres={genres} onUpdateGenres={setGenres} />
      }
    </div>
  );
}

export default App