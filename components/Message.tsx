export default function Message({ type, text }: { type: "success" | "error"; text: string }) {
  if (!text) return null;
  return <div role={type === "error" ? "alert" : "status"} className={`message ${type}`} data-testid={`${type}-message`}>{text}</div>;
}
