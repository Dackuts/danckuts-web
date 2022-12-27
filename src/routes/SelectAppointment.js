import styles from "./SelectAppointment.module.css";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";
import { getAppointments } from "../api/appointments";

export default function SelectAppointment({ locations }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hasCancellable, setHasCancellable] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!!token) {
        const { future } = await getAppointments();
        setHasCancellable(future?.length > 0)
      } else {
        setHasCancellable(false)
      }
    }
    fetchData();
  }, []);

  return (
    <div className={styles.split}>
      <div className={styles["split-a"]}>
        <div className={styles["location-container"]}>
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
        {hasCancellable === null ? null :
          (
            <>
              {hasCancellable ? (
                <div
                  className={styles["cancel-link-c"]}
                  onClick={() => navigate("/appointment-list")}
                >
                  <p className={styles["cancel-link"]}>
                    Cancel or Reschedule
                  </p>
                </div>
              ) : (
                <div className={styles['no-appointments-found']}>
                  <p>no existing appointments found.</p>
                </div>
              )}
            </>
          )}
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
