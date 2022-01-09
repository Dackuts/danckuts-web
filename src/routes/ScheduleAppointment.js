import styles from "./ScheduleAppointment.module.css";
import { keyBy as _keyBy } from "lodash";
import { useState, useEffect } from "react";
import Checkbox from "../components/Checkbox";
import {
  postCreateAppointment,
  postRescheduleAppointment,
} from "../api/appointments";
import Spinner from "../components/Spinner";
import { DateTime } from "luxon";
import { sleep } from "../utils/time";
import { useNavigate } from "react-router-dom";

export default function ScheduleAppointment({ name, locations }) {
  const navigate = useNavigate();
  const [terms, setTerms] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(locations == null);
  const urlParams = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );
  const keyedLocations = _keyBy(locations, "location");

  useEffect(() => {
    setLoading(locations == null);
  }, [locations]);

  async function bookAppointment() {
    setLoading(true);
    try {
      if (urlParams.rescheduled !== "false") {
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

  useEffect(() => {
    async function wait() {
      if (confirmed && !error) {
        await sleep(5000);
        navigate("../");
      }
    }

    wait();
  }, [confirmed, error, navigate]);

  return loading ? (
    <div className={`${styles["max-height"]} loading-container-full`}>
      <Spinner />
    </div>
  ) : confirmed ? (
    error ? (
      <div className={`${styles["max-height"]} ${styles["center-container"]}`}>
        <p className={styles["heading-center"]}>Something Went Wrong!</p>
        <p className={styles.error}>{JSON.stringify(error)}</p>
      </div>
    ) : (
      <div className={`${styles["max-height"]} ${styles["center-container"]}`}>
        <p className={styles["heading-center"]}>
          Appointment{" "}
          {urlParams.rescheduled === "true" ? "Rescheduled" : "Confirmed"}!
        </p>
      </div>
    )
  ) : (
    <div className={styles.container}>
      <p className={styles.heading}>
        Confirm {urlParams.rescheduled === "true" ? "Rescheduling" : "Booking"}
      </p>
      <p>
        Hello <span className={styles.name}>{name}</span>,
      </p>
      <p className={styles.info}>
        Please confirm the details below{" "}
        {urlParams.rescheduled === "true" ? "rescheduling" : "booking"} your
        appointment.
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
        {urlParams.rescheduled === "true"
          ? "Reschedule Appointment"
          : "Book Appointment"}{" "}
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
          urlParams.rescheduled === "true"
            ? "Reschedule Appointment"
            : "Book Appointment"
        }
      />
    </div>
  );
}
