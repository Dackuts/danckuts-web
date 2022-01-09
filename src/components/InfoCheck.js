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
      if (token != "" && name == "") {
        const {
          user: { name },
        } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
      }
      setStep("continue");
    }
    fetchData();
  }, [token, name, setName]);

  async function nextStep(data) {
    setLoading(true);
    try {
      if (step === "requestPhone") {
        setPhoneNumber(data);
        const userExists = await postCheckPhoneNumber({ phoneNumber: data });
        console.log(userExists);
        if (userExists) {
          await postSendTextCode(data);
          setLoading(false);
          setStep("requestCode");
        } else {
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
    requestPhone: <SetPhone nextStep={nextStep} />,
    requestCode: <SetCode nextStep={nextStep} />,
    requestInfo: <SetInfo phoneNumber={phoneNumber} nextStep={nextStep} />,
  };

  return loading ? (
    <div className={"loading-container-full"}>
      <Spinner />
    </div>
  ) : (
    <>{STEPS[step]}</>
  );
}

function SetPhone({ nextStep }) {
  const [phone, setPhone] = useState("");

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Phone Code</p>
      <p>Please provide your mobile number</p>
      <Input
        key="phone-number"
        value={phone}
        onChange={setPhone}
        label="Enter your mobile number"
      />
      <input onClick={() => nextStep(phone)} type="submit" value="Submit" />
    </div>
  );
}

function SetCode({ nextStep }) {
  const [code, setCode] = useState("");

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Phone Code</p>
      <p>A code has been sent to your phone, please enter the code below:</p>
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
        value="Submit"
      />
    </div>
  );
}

function SetInfo({ nextStep }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Name</p>
      <p>Please provide your name</p>
      <Input
        key="firstName"
        value={firstName}
        onChange={setFirstName}
        label="Enter your first name"
      />
      <Input
        key="lastName"
        value={lastName}
        onChange={setLastName}
        label="Enter your last name"
      />
      <Input
        key="email"
        value={email}
        onChange={setEmail}
        label="Enter your email"
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
    </div>
  );
}
