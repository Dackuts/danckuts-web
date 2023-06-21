import styles from "./AppointmentList.module.css";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { getAppointments, postCancelAppointment } from "../api/appointments";
import { DateTime } from "luxon";
import TimeSelector from "../components/TimeSelector";
import { useNavigate } from "react-router-dom";
import { keyBy as _keyBy } from "lodash";
import { getMe } from "../api/auth";

export default function AppointmentList({ locations, dependents }) {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reschedule, setReschedule] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { future } = await getAppointments();
      const { user } = await getMe();
      setCurrentUser(user);
      setAppointments(future);
    }
    fetchData();
  }, []);

  function cancelAppointment() {
    postCancelAppointment(appointments[selectedAppointment].id);
    navigate("../");
  }

  const keyedLocations = _keyBy(locations, "location");

  const depsById = _keyBy(
    (dependents ?? []).map((d) => ({
      id: d.id,
      name: d.first_name,
    })),
    "id"
  );

  return (
    <div className={styles.split}>
      <div className={styles["split-a"]}>
        <div className={styles["appointment-container"]}>
          <div className={styles["appointment-header"]}>
            <span>Select one of your existing appointments</span>
          </div>
          <div className={styles["appointment-scroll"]}>
            {appointments != null ? (
              appointments.length > 0 ? (
                appointments.map((appointment, i) => {
                  return (
                    <div
                      className={`${styles.appointment} ${selectedAppointment === i ? [styles.selected] : ""
                        }`}
                      key={appointment.id}
                      onClick={() => {
                        setSelectedAppointment(i);
                      }}
                    >
                      <p className={styles["appointment-heading"]}>
                        {!appointment.dependent
                          ? currentUser.name.split(" ")[0]
                          : depsById[appointment.dependent].name}{" "}
                        - {appointment.location}
                      </p>
                      <p className={styles["appointment-address"]}>
                        {DateTime.fromISO(appointment.date).toFormat(
                          "cccc, LL/dd/yy h:mm a"
                        )}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className={styles["no-appts"]}>
                  You have no scheduled appointments.
                </p>
              )
            ) : (
              <div className="loading-container">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles["split-b"]}>
        {selectedAppointment != null ? (
          reschedule ? (
            <div className={`${styles["scheduler-container"]} card`}>
              <TimeSelector
                location={appointments[selectedAppointment].location}
                reschedule={true}
                appointmentId={appointments[selectedAppointment].id}
              />
            </div>
          ) : (
            <div className={styles["appointment-info-container"]}>
              <div className={styles["appointment-info"]}>
                <p className={styles["appointment-heading"]}>
                  {appointments[selectedAppointment].location}
                </p>
                <div>
                  <p className={styles["appointment-info-label"]}>Customer:</p>
                  <p className={styles["appointment-info-content"]}>
                    {appointments?.[selectedAppointment]?.dependent == null
                      ? currentUser.name
                      : depsById[appointments?.[selectedAppointment]?.dependent]
                        .name}
                  </p>
                </div>
                <div>
                  <p className={styles["appointment-info-label"]}>Time:</p>
                  <p className={styles["appointment-info-content"]}>
                    {DateTime.fromISO(
                      appointments[selectedAppointment].date
                    ).toFormat("cccc, LL/dd/yy h:mm a")}
                  </p>
                </div>
                <div>
                  <p className={styles["appointment-info-label"]}>Address:</p>
                  <p className={styles["appointment-info-content"]}>
                    {
                      keyedLocations[appointments[selectedAppointment].location]
                        .address
                    }
                  </p>
                </div>
                <div>
                  <p className={styles["appointment-info-label"]}>
                    Shop Phone Number:
                  </p>
                  <p className={styles["appointment-info-content"]}>
                    {
                      keyedLocations[appointments[selectedAppointment].location]
                        .phone
                    }
                  </p>
                </div>
                <div className={styles["button-container"]}>
                  <button
                    onClick={() => setReschedule(true)}
                    className={`${styles.button} ${styles["appointment-reschedule"]}`}
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={cancelAppointment}
                    className={`${styles.button} ${styles["appointment-cancel"]}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div
            className={`${styles["appointment-info-container"]} ${styles.empty}`}
          >
            <p>SELECT AN</p>
            <p>APPOINTMENT</p>
          </div>
        )}
      </div>
    </div>
  );
}
