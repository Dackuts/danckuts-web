import { DateTime, Interval } from "luxon";
import { useEffect, useState } from "react";
import { getAvailability } from "../api/time";
import { datesFromInterval, getDates } from "../utils/time";
import Spinner from "./Spinner";
import styles from "./TimeSelector.module.css";
import { useNavigate } from "react-router-dom";

export default function TimeSelector({
  location,
  appointmentId,
  reschedule = false,
}) {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(
    DateTime.now().toFormat("yyyy-LL-dd")
  );

  useEffect(() => {
    async function fetchData() {
      const dates = getDates(selected);
      const data = await getAvailability(dates, location);
      setAvailability(data);
      setLoading(false);
    }
    setLoading(true);
    fetchData();
  }, [location, selected]);

  const week = datesFromInterval(
    Interval.fromDateTimes(
      DateTime.fromISO(selected).startOf("week"),
      DateTime.fromISO(selected)
        .startOf("week")
        .plus({ weeks: 1 })
        .minus({ days: 1 })
    )
  );

  function selectNextWeek() {
    const newDate = DateTime.fromISO(selected)
      .plus({ weeks: 1 })
      .toFormat("yyyy-LL-dd");
    setSelected(newDate);
  }

  const previousWeekDisabled = !(
    DateTime.fromISO(selected).startOf("week") >= DateTime.now().startOf("day")
  );

  function selectPreviousWeek() {
    if (!previousWeekDisabled) {
      setSelected(
        DateTime.max(
          DateTime.fromISO(selected).minus({ weeks: 1 }),
          DateTime.now()
        ).toFormat("yyyy-LL-dd")
      );
    }
  }

  return (
    <div className={styles["time-picker-container"]}>
      <div className={styles["date-picker-container"]}>
        <svg onClick={selectPreviousWeek} width="12" height="17">
          <path d="M10.8158 0.889582C11.1481 1.33071 11.0598 1.9577 10.6187 2.29L2.63108 8.3071L10.6414 14.7102C11.0728 15.055 11.143 15.6843 10.7981 16.1157C10.4533 16.5471 9.82405 16.6172 9.39265 16.2724L0.375802 9.06478C0.134464 8.87187 -0.00414848 8.57823 0.000289917 8.2693C0.00472927 7.96036 0.151721 7.67083 0.398501 7.48493L9.41535 0.692535C9.85647 0.360233 10.4835 0.448454 10.8158 0.889582Z" />
        </svg>
        <div>
          <div className={styles["date-picker-content"]}>
            {week.map((d) => (
              <span
                className={`${styles["day-text"]} noselect`}
                key={d.toFormat("EEE")}
              >
                {d.toFormat("EEE")}
              </span>
            ))}
          </div>
          <div className={styles.spacer} />
          <div className={styles["date-picker-content"]}>
            {week.map((d) => (
              <div
                onClick={() => {
                  if (d >= DateTime.now().startOf("day")) {
                    setSelected(d.toFormat("yyyy-LL-dd"));
                  }
                }}
                key={d.toFormat("EEE")}
                className={`${styles.date} ${d.toFormat("yyyy-LL-dd") === selected ? styles.selected : ""
                  } ${d < DateTime.now().startOf("day") ? styles.disabled : ""} ${d.toFormat("yyyy-LL-dd") === selected ? styles.selected : ""
                  }`}
              >
                <span className="noselect number">{d.toFormat("d")}</span>
              </div>
            ))}
          </div>
        </div>
        <svg onClick={selectNextWeek} width="12" height="17">
          <path d="M0.69278 16.1104C0.360478 15.6693 0.448698 15.0423 0.889826 14.71L8.87747 8.6929L0.867128 2.28985C0.435729 1.94501 0.365557 1.31575 0.710395 0.884347C1.05523 0.452948 1.6845 0.382776 2.1159 0.727615L11.1327 7.93522C11.3741 8.12813 11.5127 8.42177 11.5083 8.7307C11.5038 9.03964 11.3568 9.32917 11.11 9.51507L2.0932 16.3075C1.65207 16.6398 1.02508 16.5515 0.69278 16.1104Z" />
        </svg>
      </div>
      {loading ||
        availability?.dates == null ||
        availability?.dates[selected] == null ? (
        <div className="loading-container">
          <Spinner />
        </div>
      ) : (
        <div className={styles["time-text-container"]}>
          {availability.dates[selected].length > 0 ? (
            <>
              {availability.dates[selected].map((d, i) => {
                return (
                  <p
                    onClick={() =>
                      navigate(
                        `/schedule?time=${d}&rescheduled=${reschedule ? appointmentId : false
                        }&location=${location}`
                      )
                    }
                    className={`number ${styles["time-text"]}`}
                    key={i}
                  >
                    {DateTime.fromISO(d).toFormat("hh : mm a")}
                  </p>
                );
              })}
            </>
          ) : (
            <div className={styles["no-time-text"]}>
              <p>We're fully booked today 🥴</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
