import styles from "./AppointmentList.module.css";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { getAppointments, postCancelAppointment, postForceReminder } from "../api/appointments";
import { DateTime } from "luxon";
import TimeSelector from "../components/TimeSelector";
import { useNavigate, useParams } from "react-router-dom";
import { keyBy as _keyBy } from "lodash";
import { getMe } from "../api/auth";
import { isWithinNextHour, sleep } from "../utils/time";

const TESTING_PHONE_NUMBERS = [
  "(929) 269-6855",
  "(949) 680-6703",
  "(951) 200-9318",
  "(949) 556-2474",
  "(949) 547-1619",
  "(949) 669-7884",
  "(909) 525-7460",
  "(714) 943-8870"
]

export default function AppointmentList({ locations, dependents }) {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reschedule, setReschedule] = useState(0);
  const [rescheduleLocation, setRescheduleLocation] = useState(null);
  const { appointmentId } = useParams();
  const [cancelWarning, setCancelWarning] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { future } = await getAppointments();
      const { user } = await getMe();
      setCurrentUser(user);
      setAppointments(future);

      if (appointmentId != null) {
        const appointmentIndex = future.map(apt => `${apt.id}`).indexOf(appointmentId);
        if (appointmentIndex !== -1) {
          setSelectedAppointment(appointmentIndex)
        }
      }
    }
    fetchData();
  }, [appointmentId]);

  function cancelAppointment() {
    postCancelAppointment(appointments[selectedAppointment].id);
    navigate("../?cancel=true");
  }

  function sendReminder(reminderType) {
    postForceReminder(appointments[selectedAppointment].id, reminderType).then(() => alert("reminder sent!")).catch(() => alert("failed to send reminder!"))
  }

  const keyedLocations = _keyBy(locations, "location");

  const depsById = _keyBy(
    (dependents ?? []).map((d) => ({
      id: d.id,
      name: d.first_name,
    })),
    "id"
  );

  useEffect(() => {
    async function wait() {
      await sleep(2000);
      navigate("../");
    }

    if(cancelWarning === 2) {
      wait();
    }
  }, [cancelWarning, navigate]);

  return (
    <>
      <div className={styles.split}>
        {cancelWarning > 0 ?
          cancelWarning === 1 ?
            (
              <div className={styles["popup-wrapper"]}>
                <div className={styles.popup}>
                  <p className={styles["popup-title"]}>Hey, {currentUser.name?.split(" ")?.[0]}!</p>
                  <p>
                    It's too close to your appointment time (90 minutes) to <span style={{ fontWeight: "bold" }}>cancel</span> it BUT you can <span style={{ fontWeight: "bold" }}>reschedule</span> it.
                  </p>
                  <div className={styles["button-wrapper"]}>
                    <button className={styles["ok-button"]} onClick={() => { setCancelWarning(0); setReschedule(1) }}>
                      Reschedule
                    </button>
                    <button className={styles["ok-button"]} onClick={() => setCancelWarning(2)}>
                      No, I'll keep it
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles["popup-wrapper"]}>
                <div className={styles.popup}>
                  <p className={styles["popup-title"]}>Right On</p>
                  <p>
                    We will see you there, {currentUser.name?.split(" ")?.[0]}!
                  </p>
                </div>
              </div>) : null}
        <div className={styles["split-a"]}>
          <div className={styles["appointment-container"]}>
            <div className={styles["appointment-header"]}>
              {/* <span>Select one of your existing appointments</span> */}
              <span className={styles.heading}>
                You got it 🫡
              </span>
              <span>
                Select an appointment to modify
              </span>
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
                          {DateTime.fromISO(
                            appointment.date
                          ).toFormat("cccc, ")}
                          <span className="number">
                            {DateTime.fromISO(
                              appointment.date
                            ).toFormat("LL/dd/yy h:mm ")}
                          </span>
                          {DateTime.fromISO(
                            appointment.date
                          ).toFormat("a")}
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
            reschedule !== 0 ? (
              <div className={`${styles["scheduler-container"]} card`}>
                {reschedule === 1 ?
                  locations.map((location, i) => {
                    return (
                      <div
                        onClick={() => {
                          setReschedule(2)
                          setRescheduleLocation(location.location)
                          console.log(location)
                        }}
                        className={styles.location}
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
                  : (
                    <TimeSelector
                      location={rescheduleLocation}
                      reschedule={true}
                      appointmentId={appointments[selectedAppointment].id}
                    />)
                }
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
                      ).toFormat("cccc, ")}
                      <span className="number">
                        {DateTime.fromISO(
                          appointments[selectedAppointment].date
                        ).toFormat("LL/dd/yy h:mm ")}
                      </span>
                      {DateTime.fromISO(
                        appointments[selectedAppointment].date
                      ).toFormat("a")}
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
                    <p className={`${styles["appointment-info-content"]} number`}>
                      {
                        keyedLocations[appointments[selectedAppointment].location]
                          .phone
                      }
                    </p>
                  </div>
                  <div className={styles["button-container"]}>
                    <button
                      onClick={() => setReschedule(1)}
                      className={`${styles.button} ${styles["appointment-reschedule"]}`}
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => isWithinNextHour(appointments[selectedAppointment].date) ? setCancelWarning(1) : cancelAppointment()}
                      className={`${styles.button} ${styles["appointment-cancel"]}`}
                    >
                      Cancel
                    </button>
                  </div>
                  {
                    TESTING_PHONE_NUMBERS.includes(currentUser.phoneNumber) &&
                    <div className={styles["button-container"]}>
                      <button
                        onClick={() => sendReminder("2_hours_appt_new")}
                        className={`${styles.button} ${styles["appointment-reschedule"]}`}
                      >
                        Force Send Reminder
                      </button>
                    </div>
                  }
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
      <div className="troubleContainer">
        <span>HAVING TROUBLE!? WE GOT YOU</span>
        <a className="blueLink" href="tel:1-866-343-4737">CLICK HERE TO CALL US</a>
      </div>
    </>
  );
}
