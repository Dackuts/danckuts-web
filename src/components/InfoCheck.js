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
}) {
  const [step, setStep] = useState(token ? "continue" : "requestPhone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line eqeqeq
      if (token != "" && name == "" && dependents == null) {
        const {
          user: { name, dependents },
        } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
        if (dependents) {
          setDependents(dependents);
        }
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
    <>{STEPS[step]}</>
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
      <p className={styles.inputText}>Returning to Danckuts? Enter the number associated w your profile</p>
      <input onClick={() => nextStep(phone)} type="submit" value="TEXT ME" />
      <p className='hint-text'>Trouble logging in? Call (949) 392-3422</p>
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
          <p>If you are not receiving automated texts from us it is almost
            certainly because you accidentally placed yourself on the DNC
            (do not contact) list. We are not in control of this! The big bad
            government is. In order to receive automated texts again and
            take yourself off of the DNC list you need to text “start” to this
            number</p>
          <a href="tel:+19493923422">(949) 392-3422</a>
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
