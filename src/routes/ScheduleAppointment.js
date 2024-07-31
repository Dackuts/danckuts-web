import styles from "./ScheduleAppointment.module.css";
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
import Input from "../components/Input";
import { getMe, postCreateDependent } from "../api/auth";
import { keyBy as _keyBy } from "lodash";

export default function ScheduleAppointment({
	name,
	dependents,
	setDependents,
	locations,
}) {
	const navigate = useNavigate();
	const [terms, setTerms] = useState(false);
	const [confirmed, setConfirmed] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(locations == null);
	const urlParams = Object.fromEntries(
		new URLSearchParams(window.location.search).entries()
	);
	const [dependent, setDependent] = useState(undefined);
	const [newDependent, setNewDependent] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
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
					...(dependent?.id != null && { dependent: dependent?.id }),
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
				await sleep(500);
				try {
				} catch (error) {
					const googleTag = JSON.parse(localStorage.getItem("queryGoogleTag"));
					window.top.location.href = `https://book.danckuts.com/confirmation?utm_term=${googleTag.utm_term}&utm_source=${googleTag.utm_source}&utm_medium=${googleTag.utm_medium}&utm_campaign=${googleTag.utm_campaign}&gclid=${googleTag.gclid}&fbclid=${googleTag.fbclid}`;
				} finally {
					window.top.location.href = "https://book.danckuts.com/confirmation";
				}
			}
		}

		wait();
	}, [confirmed, error, navigate]);

	async function handleNewDependent() {
		setLoading(true);
		await postCreateDependent(firstName, lastName);
		const {
			user: { dependents },
		} = await getMe();
		setDependents(dependents);
		await setNewDependent(false);
		setLoading(false);
	}

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
	) : newDependent ? (
		<div className={styles.container}>
			<p className={styles.heading}>ADD A DEPENDENT BELOW</p>
			<p>No way dude. no kids for me to add! Take me back... <span className={styles.redLink} onClick={() => setNewDependent(false)}>click here</span> </p>
			<Input
				key="firstName"
				value={firstName}
				onChange={setFirstName}
				label="First name"
			/>
			<Input
				key="lastName"
				value={lastName}
				onChange={setLastName}
				label="Last name"
			/>
			<span
				onClick={handleNewDependent}
				className={styles["add-dependent-button"]}
			>
				Submit
			</span>
		</div>
	) : (dependent === undefined && urlParams.rescheduled === "false") ? (
		<div className={styles.container}>
			<p className={styles.heading}>NEW APPOINTMENT, WHO THIS!?</p>
			<p>Select who this appointment is for 👇</p>
			{[
				{
					first_name: name.split(" ")[0],
					last_name: name.split(" ")?.[1] ?? "",
					id: null,
				},
				...(dependents ?? []),
			].map((d) => (
				<div
					key={d.id}
					className={styles["dependent-container"]}
					onClick={() =>
						setDependent({ ...d, name: `${d.first_name} ${d.last_name}` })
					}
				>
					<span>
						{d.first_name} {d.last_name}
					</span>
				</div>
			))}
			<span
				className={styles.blueLink}
				onClick={() => setNewDependent(true)}
			>
				+ ADD your kid(s) under your mobile number
				Click here
			</span>
			<span className={styles.centerText}>You can book them after you add them</span>
		</div>
	) : (
		<div className={styles.container}>
			<p className={styles.heading}>
				One Last Step
			</p>
			<p className={styles["center-text"]}>Confirm details and accept below to book it!</p>
			<p className={styles.heading}>
				{dependent?.id != null ? dependent?.name : name}
			</p>
			<div className={styles.appointmentContainer}>
				<span className={styles.appointmentContainerWeekday}>{DateTime.fromISO(urlParams.time).toFormat("cccc")}</span>
				<span className={styles.appointmentContainerDate}>{DateTime.fromISO(urlParams.time).toFormat("LLLL d")}</span>
				<span className={styles.appointmentContainerTime}>{DateTime.fromISO(urlParams.time).toFormat("h:mm a")}</span>
			</div>
			<p className={styles.addressText}>
				@ {keyedLocations[urlParams.location].address}
			</p>
			<div className={styles.seperator}></div>
			<Checkbox
				value={terms}
				setValue={setTerms}
				label={"Accept terms"}
				labelRight={true}
			/>
			<div>
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
			<p className={styles.info}>
				By providing information and clicking on{" "}
				{urlParams.rescheduled === "true"
					? "Reschedule Appointment"
					: "Book Appointment"}{" "}
				below you agree to our Privacy Policy.
			</p>
			<a
				className={styles["info-link"]}
				href="https://danckuts.com/app-privacy"
			>
				Privacy Policy
			</a>
			{!!error?.atlas && (
				<div className={styles.popup} >
					<p className={styles.error}>{error?.atlas}</p>
					<button
						className={styles.refresh}
						onClick={() => window.location.replace("/")}
						type="button"
					>
						&larr; Find another time
					</button>
				</div>
			)}
		</div>
	);
}
