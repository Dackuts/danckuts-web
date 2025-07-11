import styles from "./ScheduleAppointment.module.css";
import { useState, useEffect } from "react";
import Checkbox from "../components/Checkbox";
import {
	postCreateAppointment,
	postRescheduleAppointment,
	getAppointments,
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
	restrictionlevel
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
	const [showRestrictedPopup, setShowRestrictedPopup] = useState(false);
	const [showWarningPopup, setShowWarningPopup] = useState(false);
	const [recentAppointmentPopup, setRecentAppointmentPopup] = useState(false);
	const [checkingRecentAppointments, setCheckingRecentAppointments] = useState(false);
	const [daysSinceLastAppointment, setDaysSinceLastAppointment] = useState(0);
	const [futureAppointmentPopup, setFutureAppointmentPopup] = useState(false);
	const [futureAppointment, setFutureAppointment] = useState(null);
	const [daysUntilNextAppointment, setDaysUntilNextAppointment] = useState(0);

	useEffect(() => {
		setShowRestrictedPopup(restrictionlevel === 'restricted')
		setShowWarningPopup(restrictionlevel === 'warning')
		// setShowRestrictedPopup(true)
	}, [restrictionlevel])

	useEffect(() => {
		setLoading(locations == null);
	}, [locations]);

	useEffect(() => {
		async function checkRecentAppointments() {
			setCheckingRecentAppointments(true);
			try {
				const {past, future} = await getAppointments();
				
				// Check for recent past appointments (existing logic)
				const sevenDaysAgo = DateTime.now().minus({ days: 7 });
				const recentCompletedAppointment = past.find(appointment => {
					const appointmentDate = DateTime.fromISO(appointment.date);
					return appointmentDate > sevenDaysAgo;
				});
				
				if (recentCompletedAppointment != null) {
					const daysSince = Math.floor(DateTime.now().diff(DateTime.fromISO(recentCompletedAppointment.time), 'days').days);
					setDaysSinceLastAppointment(daysSince);
					setRecentAppointmentPopup(1);
				}

				
				// Check for future appointments within 7 days (new logic)
				// Skip this check if we are rescheduling
				if (urlParams.rescheduled === "false") {
					const sevenDaysFromNow = DateTime.now().plus({ days: 7 });
					const upcomingAppointment = future
						.filter(appointment => {
							const appointmentDate = DateTime.fromISO(appointment.date);
							return appointmentDate <= sevenDaysFromNow;
						}).filter(appointment => {
							return appointment.dependent === dependent?.id
						})
						.sort((a, b) => DateTime.fromISO(a.date) - DateTime.fromISO(b.date))[0]; // Get the soonest one
					

					if (upcomingAppointment != null && !recentCompletedAppointment) {
						const daysUntil = Math.ceil(DateTime.fromISO(upcomingAppointment.date).diff(DateTime.now(), 'days').days);
						setFutureAppointment(upcomingAppointment);
						setDaysUntilNextAppointment(daysUntil);
						setFutureAppointmentPopup(1);
					}
				}
			} catch (error) {
				console.error('Error checking recent appointments:', error);
			} finally {
				setCheckingRecentAppointments(false);
			}
		}
		
		checkRecentAppointments();
	}, [urlParams.rescheduled, dependent?.id]);

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
				let redirectUrl = localStorage.getItem("redirectUrl") ?? "https://book.danckuts.com/confirmation";
				try {
					const googleTag = JSON.parse(localStorage.getItem("queryGoogleTag"));
					window.top.location.href = `${redirectUrl}?utm_term=${googleTag.utm_term}&utm_source=${googleTag.utm_source}&utm_medium=${googleTag.utm_medium}&utm_campaign=${googleTag.utm_campaign}&gclid=${googleTag.gclid}&fbclid=${googleTag.fbclid}`;
				} finally {
					window.top.location.href = redirectUrl;
				}
			}
		}

		wait();
	}, [confirmed, error, navigate]);

	async function handleNewDependent() {
		if (loading) return; // Prevent multiple calls
		setLoading(true);
		try {
			await postCreateDependent(firstName, lastName);
			const {
				user: { dependents },
			} = await getMe();
			setDependents(dependents);
			await setNewDependent(false);
		} catch (error) {
			console.error('Error creating dependent:', error);
		} finally {
			setLoading(false);
		}
	}

	function handleFutureAppointmentReschedule() {
		// Update URL params to reschedule the future appointment to the current time
		const newUrlParams = new URLSearchParams(window.location.search);
		newUrlParams.set('rescheduled', futureAppointment.id);
		window.history.replaceState({}, '', window.location.pathname + '?' + newUrlParams.toString());
		
		// Update the urlParams object to reflect the change
		Object.assign(urlParams, { rescheduled: futureAppointment.id });
		
		// Close the popup
		setFutureAppointmentPopup(0);
	}

  useEffect(() => {
    async function wait() {
      await sleep(2000);
      navigate("../");
    }

    if(futureAppointmentPopup === 2) {
      wait();
    }
  }, [futureAppointmentPopup, navigate]);

	return loading || checkingRecentAppointments ? (
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
				style={{
					opacity: loading ? 0.6 : 1,
					cursor: loading ? 'not-allowed' : 'pointer'
				}}
			>
				{loading ? 'Adding...' : 'Submit'}
			</span>
		</div>
	) : (dependent === undefined && urlParams.rescheduled === "false") ? (
		<div className={styles.container}>
			{showRestrictedPopup ? (
				<div className={styles["popup-wrapper"]}>
					<div className={styles.popup}>
						<p className={styles["popup-title"]}>Hey</p>
						<p>
							{"Don't worry, we'd still love to have you!"}
						</p>
						<p>
							{"BUT"}
						</p>
						<p>
							{"A hold has been placed on your account. Please call us to schedule this appointment."}
						</p>
						<p>
							<a className="blueLink" href="tel:1-949-392-3422">949-392-3422</a>
						</p>
						<button className={styles["ok-button"]} onClick={() => navigate("../")}>
							Ok
						</button>
					</div>
				</div>
			) : null}
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
			{showWarningPopup ? (
				<div className={styles["popup-wrapper"]}>
					<div className={styles.popup}>
						<p className={styles["popup-title"]}>Hey, real quick!</p>
						<p>
							<span style={{ fontWeight: "bold" }}>Last minute canceling</span> within 60 minutes
							or <span style={{ fontWeight: "bold" }}>Missing an appointment</span>, can auto
							trigger a hold to be placed on your
							account if they occur back to back.
						</p>
						<button className={styles["ok-button"]} onClick={() => setShowWarningPopup(false)}>
							OK 👍
						</button>
					</div>
				</div>
			) : null}
			{recentAppointmentPopup > 0 ? recentAppointmentPopup === 1 ? (
				<div className={styles["popup-wrapper"]}>
					<div className={styles.popup}>
						<p className={styles["popup-title"]}>Hey, {name?.split(" ")?.[0]}!</p>
						<p>
							You just had an appointment {daysSinceLastAppointment === 0 ? 'today' : daysSinceLastAppointment === 1 ? 'yesterday' : `${daysSinceLastAppointment} days ago`}. Is this for a <span style={{ fontWeight: "bold" }}>touch up</span> to correct that last kut?
						</p>
						<div className={styles["button-wrapper"]}>
							<button 
								className={styles["ok-button"]} 
								onClick={() => {
									setRecentAppointmentPopup(2);
								}}
								disabled={loading}
							>
								Yes
							</button>
							<button className={styles["ok-button"]} onClick={() => setRecentAppointmentPopup(0)}>
								No, I need a fresh kut
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className={styles["popup-wrapper"]}>
					<div className={styles.popup}>
						<p className={styles["popup-title"]}>7 DAY TOUCH UP POLICY</p>
						<p>
							No need to book for touch up's, {name?.split(" ")?.[0]}! <span style={{ fontWeight: "bold" }}>Walk in</span> to any location. let them know that you're there for a touch up and we'll take care of it for you!
						</p>
						<button className={styles["ok-button"]} onClick={() => setRecentAppointmentPopup(0)}>
							Ok
						</button>
					</div>
				</div>
			) : null}
			{futureAppointmentPopup > 0 ? futureAppointmentPopup === 1 ? (
				<div className={styles["popup-wrapper"]}>
					<div className={styles.popup}>
						<p className={styles["popup-title"]}>Hey, {name?.split(" ")?.[0]}!</p>
						<p>
							You have an appointment scheduled {daysUntilNextAppointment === 0 ? 'today' : daysUntilNextAppointment === 1 ? 'tomorrow' : `in ${daysUntilNextAppointment} days`} at {DateTime.fromISO(futureAppointment?.date).toFormat("h:mm a")} on {DateTime.fromISO(futureAppointment?.date).toFormat("LLLL d")}. Would you like to <span style={{ fontWeight: "bold" }}>reschedule</span> it to this new time instead?
						</p>
						<div className={styles["button-wrapper"]}>
							<button 
								className={styles["ok-button"]} 
								onClick={handleFutureAppointmentReschedule}
								disabled={loading}
							>
								Yes
							</button>
							<button className={styles["ok-button"]} onClick={() => setFutureAppointmentPopup(2)}>
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
							We will see you there, {name?.split(" ")?.[0]}!
						</p>
					</div>
				</div>
			) : null}
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
					onClick={() => setShowWarningPopup(true)}
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
				href="https://www.danckuts.com/privacy-policy/"
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
