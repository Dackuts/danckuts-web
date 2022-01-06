import { useEffect, useState } from "react";
import { getMe, postChangeName } from "../api/auth";
import Input from "../components/Input";
import Spinner from "../components/Spinner";
import styles from "./NameCheck.module.css";

export default function NameCheck({ setName }) {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          user: { name },
        } = await getMe();
        setLoading(false);
        if (name) {
          setName(name);
        }
      } catch (error) {
        setLoading(false);
      }
    }
    fetchData();
  }, [setName]);

  async function updateName() {
    const { name } = await postChangeName({ firstName, lastName });
    setName(name);
  }

  return loading ? (
    <div className={styles["loading-container-full"]}>
      <Spinner />
    </div>
  ) : (
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
      <input onClick={updateName} type="submit" value="Submit" />
    </div>
  );
}
