import styles from "./Checkbox.module.css";

export default function Checkbox({
  id,
  label,
  labelLeft,
  labelRight,
  value,
  setValue,
}) {
  return (
    <div className={styles["check-container"]}>
      {labelLeft && (
        <label htmlFor={id} className={styles.left}>
          {label}
        </label>
      )}
      <div className={styles.checkbox}>
        <input
          id={id}
          checked={value}
          type="checkbox"
          onChange={(e) => setValue(e.target.checked)}
        />
        <svg viewBox="0 0 21 21">
          <polyline points="5 10.75 8.5 14.25 16 6" />
        </svg>
      </div>
      {labelRight && (
        <label htmlFor={id} className={styles.right}>
          {label}
        </label>
      )}
    </div>
  );
}
