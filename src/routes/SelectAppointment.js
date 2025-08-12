import styles from "./SelectAppointment.module.css";
import React, { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";
import { getMe } from "../api/auth";
import { useTokenStore } from "../store";

export default function SelectAppointment({ locations, token }) {
  const navigate = useNavigate();
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cancelPopup, setCancelPopup] = useState(new URLSearchParams(window.location.search).get("cancel") === 'true' ?? false)
  const setToken = useTokenStore(state => state.setToken);
  const unsetSession = () => {
    setToken(null)
    window.location.reload()
  }

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line eqeqeq
      if (!token && !name) {
        const { user: { name } } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
      }
    }
    fetchData();
  }, [token, name, setName]);

  return (
    <>
      <div className={styles.split}>
        {cancelPopup ? (
          <div className={styles.popup}>
            <div className={styles.x} onClick={() => setCancelPopup(false)}>✖</div>
            <p className={styles.redText}>YOUR APPOINTMENT HAS BEEN CANCELED</p>
            <p>Don't cheat on us. We'll know!</p>
          </div>
        ) : null}
        <div className={styles["split-a"]}>
          <div className={styles["location-container"]}>
            {!loading && !!name && (
              <div className={styles["container"]}>
                <p className={styles['greeting']}><b>Hey {name},</b></p>
                <button onClick={unsetSession} className={styles['remove-session']}>not you?</button>
              </div>
            )}
            <div className={styles["location-header"]}>
              <p className={styles.heading}>Let's Book It!</p>
              <p>Select a location to book at.</p>
            </div>
            {locations != null ? (
              locations.map((location, i) => {
                const isEdwardsLocation = location.location === "Edwards (employees only)";
                return React.createElement(
                  isEdwardsLocation ? 'a' : 'div',
                  {
                    onClick: () => setSelectedLocation(i),
                    className: selectedLocation === i ? styles["location-selected"] : styles.location,
                    style: {
                      display: "block",
                      textDecoration: "none"
                    },
                    key: location.location,
                    ...(isEdwardsLocation && { 
                      href: "https://login.microsoftonline.com/c8fe7995-06f0-4bdf-8f2a-0c8a7986480d/oauth2/authorize?client_id=00000003-0000-0ff1-ce00-000000000000&response_mode=form_post&response_type=code%20id_token&resource=00000003-0000-0ff1-ce00-000000000000&scope=openid&nonce=7E408360B30118C67ECB2D9AA6DF85CAF2A319B4CFC0A87C-26595B233289042B74DE59A0CC96E94C8B21801A0EC872AAC07DC7D8BE54E522&redirect_uri=https%3A%2F%2Fedwardslifesciences.sharepoint.com%2F_forms%2Fdefault.aspx&state=OD0w&claims=%7B%22id_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083-87e0-41b5-bb78-0bc43c8a8e8a&client-request-id=73d6b8a1-a023-9000-c2a3-bce27075fa1a#hair-salon" 
                    })
                  },
                  <>
                    <p className={styles["location-heading"]}>
                      {location.location}
                    </p>
                    <p className={styles["location-address"]}>
                      {location.address}
                    </p>
                  </>
                );
              })
            ) : (
              <div className="loading-container">
                <Spinner />
              </div>
            )}
          </div>
          <div
            className={styles["cancel-link-c"]}
            onClick={() => navigate("/appointment-list")}
          >
            <p className={styles["cancel-link"]}>
              Cancel or Reschedule
            </p>
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
			<div className="troubleContainer">
				<span>HAVING TROUBLE!? WE GOT YOU</span>
				<a className="blueLink" href="tel:1-866-343-4737">CLICK HERE TO CALL US</a>
			</div>
    </>
  );
}
