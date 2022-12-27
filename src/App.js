import styles from "./App.module.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScheduleAppointment from "./routes/ScheduleAppointment";
import SelectAppointment from "./routes/SelectAppointment";
import { useEffect, useState } from "react";
import { getLocations } from "./api/locations";
import InfoCheck from "./components/InfoCheck";
import AppointmentList from "./routes/AppointmentList";

export default function App() {
  const [token, setStateToken] = useState("");
  const [name, setName] = useState("");
  const [dependents, setDependents] = useState(null);
  const [locations, setLocations] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getLocations();
      setLocations(data.locations);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get("token");
    if (queryToken != null) {
      localStorage.setItem("token", queryToken);
    }
    const token = localStorage.getItem("token");
    setStateToken(token);
  }, []);

  function setToken(token) {
    localStorage.setItem("token", token);
    setStateToken(token);
  }

  return (
    <main className={`${styles.main} card`}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<SelectAppointment locations={locations} />}
          />
          <Route
            path="/schedule"
            element={
              <InfoCheck
                name={name}
                setName={setName}
                setDependents={setDependents}
                dependents={dependents}
                token={token}
                setToken={setToken}
              >
                <ScheduleAppointment
                  name={name}
                  dependents={dependents}
                  setDependents={setDependents}
                  locations={locations}
                />
              </InfoCheck>
            }
          />
          <Route
            path="/appointment-list"
            element={
              <InfoCheck
                name={name}
                setName={setName}
                setDependents={setDependents}
                dependents={dependents}
                token={token}
                setToken={setToken}
              >
                <AppointmentList
                  dependents={dependents}
                  locations={locations}
                />
              </InfoCheck>
            }
          />
        </Routes>
      </Router>
    </main>
  );
}
