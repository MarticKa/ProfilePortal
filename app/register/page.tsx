"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Message from "@/components/Message";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push("/login?registered=1");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Registration failed"); }
    finally { setPending(false); }
  }
  return <section className="card auth-card">
    <h1>Create your profile</h1><p className="subtitle">Register to access Profile Portal.</p>
    <Message type="error" text={error}/>
    <form onSubmit={submit} className="form-grid" noValidate>
      <div className="field full"><label htmlFor="email">Email</label><input id="email" name="email" type="email" data-testid="register-email" required/></div>
      <div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" data-testid="register-first-name" required/></div>
      <div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" data-testid="register-last-name" required/></div>
      <div className="field full"><label htmlFor="password">Password</label><input id="password" name="password" type="password" data-testid="register-password" required/><small>6+ characters with lowercase, uppercase, number and special character.</small></div>
      <button className="field full" type="submit" data-testid="register-submit" disabled={pending}>{pending ? "Creating…" : "Register"}</button>
    </form>
    <p className="auth-footer">Already registered? <a href="/login">Log in</a></p>
  </section>;
}
