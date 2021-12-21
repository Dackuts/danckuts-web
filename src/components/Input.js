import styles from "./Input.module.css";

export default function Input({ label, value, onChange }) {
  return (
    <div className={styles["input-container"]}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        type="text"
      />
      <label className="noselect">{label}</label>
    </div>
  );
}
