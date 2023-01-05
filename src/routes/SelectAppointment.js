import styles from "./SelectAppointment.module.css";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";
import { getMe } from "../api/auth";

export default function SelectAppointment({ locations, token }) {
  const navigate = useNavigate();
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const unsetSession = () => {
    localStorage.removeItem("token");
    window.location.reload()
  }

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line eqeqeq
      if (!token && !name) {
        const { user: { name } } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
      }
    }
    fetchData();
  }, [token, name, setName]);

  return (
    <div className={styles.split}>
      <div className={styles["split-a"]}>
        <div className={styles["location-container"]}>
          {!loading && !!name && (
            <div className={styles["container"]}>
              <p className={styles['greeting']}><b>Hey {name},</b></p>
              <button onClick={unsetSession} className={styles['remove-session']}>not you?</button>
            </div>
          )}
          <div className={styles["location-header"]}>
            <span>To book an appointment please select a location below</span>
          </div>
          {locations != null ? (
            locations.map((location, i) => {
              return (
                <div
                  onClick={() => {
                    setSelectedLocation(i);
                  }}
                  className={
                    selectedLocation === i
                      ? styles["location-selected"]
                      : styles.location
                  }
                  key={location.location}
                >
                  <p className={styles["location-heading"]}>
                    {location.location}
                  </p>
                  <p className={styles["location-address"]}>
                    {location.address}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="loading-container">
              <Spinner />
            </div>
          )}
        </div>
        <div
          className={styles["cancel-link-c"]}
          onClick={() => navigate("/appointment-list")}
        >
          <p className={styles["cancel-link"]}>
            Cancel or Reschedule
          </p>
        </div>
      </div>
      <div className={styles["split-b-map"]}>
        <Map locations={locations} setLocation={setSelectedLocation} />
        {selectedLocation != null && (
          <div className={`${styles["scheduler-container"]} card`}>
            <TimeSelector location={locations[selectedLocation].location} />
          </div>
        )}
      </div>
    </div>
  );
}
