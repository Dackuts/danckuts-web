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
import Input from "../components/Input";
import { getMe, postCreateDependent } from "../api/auth";

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
					navigate(
						`https://danckuts.com/booking-confirmation?utm_source=${googleTag.utm_source}&utm_medium=${googleTag.utm_medium}&utm_campaign=${googleTag.utm_campaign}&gclid=${googleTag.gclid}&fbclid=${googleTag.fbclid}}`
					);
				} finally {
					navigate("https://danckuts.com/booking-confirmation");
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
			<p className={styles.heading}>Select dependent</p>
			<Input
				key="firstName"
				value={firstName}
				onChange={setFirstName}
				label="Enter first name"
			/>
			<Input
				key="lastName"
				value={lastName}
				onChange={setLastName}
				label="Enter last name"
			/>
			<div
				onClick={handleNewDependent}
				className={styles["add-dependent-container"]}
			>
				<p>Add dependent</p>
			</div>
		</div>
	) : dependent === undefined ? (
		<div className={styles.container}>
			<p className={styles.heading}>Select dependent</p>
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
					className={styles["dependent-selector"]}
					onClick={() =>
						setDependent({ ...d, name: `${d.first_name} ${d.last_name}` })
					}
				>
					<span>
						{d.first_name} {d.last_name}
					</span>
				</div>
			))}
			<div
				onClick={() => setNewDependent(true)}
				className={styles["add-dependent-container"]}
			>
				<p>Add dependent</p>
			</div>
		</div>
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
				appointment
				{dependent?.id != null ? <b> for {dependent?.name}.</b> : "."}
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
			<a
				className={styles["info-link"]}
				href="https://danckuts.com/app-privacy"
			>
				Privacy Policy
			</a>
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
			{!!error?.atlas && (
				<>
					<p className={styles.error}>{error?.atlas}</p>
					<button
						className={styles.refresh}
						onClick={() => window.location.replace("/")}
						type="button"
					>
						&larr; Find another time
					</button>
				</>
			)}
		</div>
	);
}
