import styles from "./ScheduleAppointment.module.css";
import { keyBy as _keyBy } from "lodash";
import { useState } from "react";
import Checkbox from "../components/Checkbox";
import {
  postCreateAppointment,
  postRescheduleAppointment,
} from "../api/appointments";
import Spinner from "../components/Spinner";
import { DateTime } from "luxon";

export default function ScheduleAppointment({ name, locations }) {
  const [terms, setTerms] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const urlParams = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );
  const keyedLocations = _keyBy(locations, "location");

  async function bookAppointment() {
    setLoading(true);
    try {
      if (urlParams.rescheduled) {
        await postRescheduleAppointment({
          appointmentId: urlParams.rescheduled,
          location: urlParams.location,
          time: urlParams.time,
        });
      } else {
        await postCreateAppointment({
          location: urlParams.location,
          time: urlParams.time,
        });
      }
      setLoading(false);
      setConfirmed(true);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }

  return loading ? (
    <div className="loading-container-full">
      <Spinner />
    </div>
  ) : confirmed ? (
    error ? (
      <div className={styles["center-container"]}>
        <p className={styles["heading-center"]}>Something Went Wrong!</p>
        <p className={styles.error}>{JSON.stringify(error)}</p>
      </div>
    ) : (
      <div className={styles["center-container"]}>
        <p className={styles["heading-center"]}>
          Appointment {urlParams.rescheduled ? "Rescheduled" : "Confirmed"}!
        </p>
      </div>
    )
  ) : (
    <div className={styles.container}>
      <p className={styles.heading}>
        Confirm {urlParams.rescheduled ? "Rescheduling" : "Booking"}
      </p>
      <p>
        Hello <span className={styles.name}>{name}</span>,
      </p>
      <p className={styles.info}>
        Please confirm the details below{" "}
        {urlParams.rescheduled ? "rescheduling" : "booking"} your appointment.
      </p>
      <p className={styles.title}>Date:</p>
      <p className={styles.property}>
        {DateTime.fromISO(urlParams.time).toFormat("cccc, LL/dd/yy h:mm a")}
      </p>
      <p className={styles.title}>Location:</p>
      <p className={styles.property}>
        {keyedLocations[urlParams.location].address}
      </p>
      <p className={styles.info}>
        By providing information and clicking on{" "}
        {urlParams.rescheduled ? "Reschedule Appointment" : "Book Appointment"}{" "}
        below you agree to our Privacy Policy and are expressly consenting for
        us to contact you by telephone, mobile device, email and including text
        message, automated or prerecorded means, even if your telephone number
        is on a state, corporate or national Do Not Call Registry.
      </p>
      <Checkbox
        value={terms}
        setValue={setTerms}
        label={"Accept terms"}
        labelRight={true}
      />
      <div className={styles["form-spacer"]} />
      <input
        disabled={!terms}
        onClick={bookAppointment}
        type="submit"
        value={
          urlParams.rescheduled ? "Reschedule Appointment" : "Book Appointment"
        }
      />
    </div>
  );
}
