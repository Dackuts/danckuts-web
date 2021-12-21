import NameCheck from "../routes/NameCheck";
import PhoneCode from "../routes/PhoneCode";

export default function InfoCheck({
  name,
  setName,
  token,
  setToken,
  children,
}) {
  return token ? (
    name ? (
      <>{children}</>
    ) : (
      <NameCheck setName={setName} />
    )
  ) : (
    <PhoneCode setToken={setToken} />
  );
}
