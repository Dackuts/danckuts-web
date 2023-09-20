import styles from "./App.module.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScheduleAppointment from "./routes/ScheduleAppointment";
import SelectAppointment from "./routes/SelectAppointment";
import { useEffect, useState } from "react";
import { getLocations } from "./api/locations";
import InfoCheck from "./components/InfoCheck";
import AppointmentList from "./routes/AppointmentList";
import { useTokenStore } from "./store";

export default function App() {
	const { token, setToken } = useTokenStore((state) => state);
	const [name, setName] = useState("");
	const [dependents, setDependents] = useState(null);
	const [locations, setLocations] = useState(null);

	useEffect(() => {
		async function fetchData() {
			const data = await getLocations();
			setLocations(data.locations);
		}
		fetchData();
	}, []);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const queryToken = urlParams.get("token");
		const utm_source = urlParams.get("utm_source");
		const utm_medium = urlParams.get("utm_medium");
		const utm_campaign = urlParams.get("utm_campaign");
		const gclid = urlParams.get("gclid");
		const fbclid = urlParams.get("fbclid");
		const queryGoogleTag = {
			utm_source,
			utm_medium,
			utm_campaign,
			gclid,
			fbclid,
		};
		if (queryToken != null) {
			setToken(queryToken);
		}
		try {
			if (!Object.values(queryGoogleTag).every((x) => x == null)) {
				localStorage.setItem("queryGoogleTag", JSON.stringify(queryGoogleTag));
			}
		} catch (_err) {}
	}, [setToken]);

	return (
		<main className={`${styles.main} card`}>
			<Router>
				<Routes>
					<Route
						path="/"
						element={<SelectAppointment locations={locations} token={token} />}
					/>
					<Route
						path="/schedule"
						element={
							<InfoCheck
								name={name}
								setName={setName}
								setDependents={setDependents}
								dependents={dependents}
								token={token}
								setToken={setToken}
							>
								<ScheduleAppointment
									name={name}
									dependents={dependents}
									setDependents={setDependents}
									locations={locations}
								/>
							</InfoCheck>
						}
					/>
					<Route
						path="/appointment-list"
						element={
							<InfoCheck
								name={name}
								setName={setName}
								setDependents={setDependents}
								dependents={dependents}
								token={token}
								setToken={setToken}
							>
								<AppointmentList
									dependents={dependents}
									locations={locations}
								/>
							</InfoCheck>
						}
					/>
				</Routes>
			</Router>
		</main>
	);
}
