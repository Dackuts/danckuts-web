import { useState } from "react";
import { postCheckTextCode, postSendTextCode } from "../api/auth";
import Input from "../components/Input";
import styles from "./PhoneCode.module.css";

export default function PhoneCode({ setToken }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [awaitingToken, setAwaitingToken] = useState(false);

  function requestCode() {
    postSendTextCode(phoneNumber);
    setAwaitingToken(true);
  }

  async function submitCode() {
    const { token } = await postCheckTextCode({ phoneNumber, code });
    setToken("token", token);
  }

  return awaitingToken ? (
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
          submitCode();
        }}
        type="submit"
        value="Submit"
      />
    </div>
  ) : (
    <div className={styles.container}>
      <p className={styles.heading}>Phone Code</p>
      <p>Please provide your mobile number</p>
      <Input
        key="phone-number"
        value={phoneNumber}
        onChange={setPhoneNumber}
        label="Enter your mobile number"
      />
      <input
        onClick={() => {
          requestCode();
        }}
        type="submit"
        value="Submit"
      />
    </div>
  );
}
