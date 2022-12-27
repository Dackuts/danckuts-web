import styles from "./Spinner.module.css";

export default function Spinner({ mode = 'spinner' }) {
  return <div className={styles[mode]} />;
}
