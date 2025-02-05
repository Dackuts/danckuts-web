import { useEffect, useState } from "react";
import {
  getMe,
  postCheckPhoneNumber,
  postCheckTextCode,
  postCreateAccount,
  postSendTextCode,
} from "../api/auth";
import Spinner from "./Spinner";
import Input from "./Input";
import styles from "./InfoCheck.module.css";

export default function InfoCheck({
  setName,
  name,
  setDependents,
  dependents,
  token,
  setToken,
  children,
  setRestrictionlevel,
}) {
  const [step, setStep] = useState(token ? "continue" : "requestPhone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line eqeqeq
      if (token != "" && name == "" && dependents == null) {
        const {
          user: { name, dependents, restrictionLevel },
        } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
        if (dependents) {
          setDependents(dependents);
        }
        setRestrictionlevel(restrictionLevel)
      } else {
        setStep("continue");
      }
    }
    fetchData();
  }, [token, name, setName, setDependents, dependents]);

  async function nextStep(data) {
    setLoading(true);
    try {
      if (step === "requestPhone") {
        setPhoneNumber(data);
        const userExists = await postCheckPhoneNumber({ phoneNumber: data });
        if (userExists) {
          await postSendTextCode(data);
          setLoading(false);
          setStep("requestCode");
        } else {
          setLoading(false);
          setStep("requestInfo");
        }
      }

      if (step === "requestInfo") {
        await postCreateAccount({ ...data, phoneNumber });
        await postSendTextCode(phoneNumber);
        setLoading(false);
        setStep("requestCode");
      }

      if (step === "requestCode") {
        const { token } = await postCheckTextCode({ phoneNumber, code: data });
        setLoading(false);
        setToken(token);
      }
    } catch (error) {
      setLoading(false);
    }
  }

  const STEPS = {
    continue: children,
    hideAndSeek: <HideAndSeek />,
    requestPhone: <SetPhone nextStep={nextStep} />,
    requestCode: <SetCode nextStep={nextStep} />,
    requestInfo: <SetInfo errorStep={() => setStep("hideAndSeek")} phoneNumber={phoneNumber} nextStep={nextStep} />,
  };

  return loading ? (
    <div className={"loading-container-full"}>
      <Spinner />
    </div>
  ) : (
    <>
      {STEPS[step]}
      {step !== "continue" ? (<div className="troubleContainer">
        <span>HAVING TROUBLE!? WE GOT YOU</span>
        <a className="blueLink" href="tel:1-866-343-4737">CLICK HERE TO CALL US</a>
      </div>) : null}
    </>
  );
}

function HideAndSeek() {
  return (<div className={styles.centerContainer}>
    <p className={styles.heading}>HIDE AND SEEK!</p>
    <p>We are having trouble finding you. Please click below to call us
      so we can sort this out.</p>
  </div>)
}

function SetPhone({ nextStep }) {
  const [phone, setPhone] = useState("");

  return (
    <div className={styles.container}>
      <p className={styles.heading}>CAN I HAVE YOUR NUMBER!?</p>
      <p>We’re gonna text a code to this number. You’ll enter it on the next screen to verify.</p>
      <Input
        key="phone-number"
        value={phone}
        onChange={setPhone}
        label="Enter your mobile number"
      />
      <input onClick={() => nextStep(phone)} type="submit" value="TEXT ME" />
    </div>
  );
}

function SetCode({ nextStep }) {
  const [code, setCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className={styles.container}>
      {showPopup ? (
        <div className={styles.popup} >
          <div className={styles.x} onClick={() => setShowPopup(false)}>✖</div>
          <p className={styles.heading}>NOBODY PANIC!</p>
          <p>You're most likely not receiving texts from us because you
            responded "cancel" to one of our automated appointment
            reminders because you wanted to cancel your appointment.
            "Cancel" is a key word that stops us from sending you messages
            from our system. This is out of our control. In order to get texts
            from us again TEXT "START" to the the number below. We will
            NEVER use our automated system to text you marketing
            materials; only appointment reminders.</p>
          <a href="tel:1-866-343-4737">(866) 343-4737</a>
        </div>
      ) : null}
      <p className={styles.heading}>WHATS THE PASSWORD!?</p>
      <p>JK, just enter the code we texted you</p>
      <Input
        key="phone-code"
        value={code}
        onChange={setCode}
        label="Enter the code"
      />
      <input
        onClick={() => {
          nextStep(code);
        }}
        type="submit"
        value="SUBMIT"
      />
      <button class={styles.ghostButton} onClick={() => setShowPopup(true)}>
        I'M NOT GETTING A CODE 😡
      </button>
    </div>
  );
}

function SetInfo({ nextStep, errorStep }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className={styles.container}>
      <p className={styles.heading}>FIRST TIME!?
        Let’s GO! We need some info below</p>
      <p>No way dude, I have been to Danckuts before... <span onClick={errorStep} className={styles.redLink}>click here</span></p>
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
      <Input
        key="email"
        value={email}
        onChange={setEmail}
        label="Email"
      />
      <input
        onClick={() =>
          nextStep({
            email,
            firstName,
            lastName,
          })
        }
        type="submit"
        value="Submit"
      />
      <p className={styles.redText}>
        If you are a parent booking an appointment for yourself and also
        want to book an appointment for your kid(s) you can do so on the
        final page once this appointment is booked.
      </p>
    </div>
  );
}
