"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Message from "@/components/Message";

export default function LoginPage() {
  const router = useRouter();
  const [error,setError]=useState(""); const [pending,setPending]=useState(false); const [registered,setRegistered]=useState(false);
  useEffect(() => { setRegistered(new URLSearchParams(window.location.search).has("registered")); if (localStorage.getItem("profilePortalToken")) router.replace("/profile"); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    const values=Object.fromEntries(new FormData(event.currentTarget));
    try { const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)}); const data=await response.json(); if(!response.ok) throw new Error(data.error); localStorage.setItem("profilePortalToken",data.token); router.push("/profile"); }
    catch(cause){setError(cause instanceof Error?cause.message:"Login failed");} finally{setPending(false);}
  }
  return <section className="card auth-card">
    <h1>Welcome back</h1><p className="subtitle">Log in to manage your profile.</p>
    {registered && <Message type="success" text="Registration successful. You can now log in."/>}<Message type="error" text={error}/>
    <form onSubmit={submit} className="form-grid" noValidate>
      <div className="field full"><label htmlFor="email">Email</label><input id="email" name="email" type="email" data-testid="login-email" required/></div>
      <div className="field full"><label htmlFor="password">Password</label><input id="password" name="password" type="password" data-testid="login-password" required/></div>
      <button className="field full" type="submit" data-testid="login-submit" disabled={pending}>{pending?"Logging in…":"Log in"}</button>
    </form><p className="auth-footer">New here? <a href="/register">Create an account</a></p>
  </section>;
}
