import styles from "./SelectAppointment.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import Spinner from "../components/Spinner";
import Map from "../components/Map";
import TimeSelector from "../components/TimeSelector";

export default function SelectAppointment({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

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
        <div className={styles["cancel-link-c"]}>
          <Link to="/appointment-list" className={styles["cancel-link"]}>
            Cancel or Reschedule
          </Link>
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
