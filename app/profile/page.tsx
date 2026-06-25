"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Message from "@/components/Message";
import type { PublicUser } from "@/lib/types";

const countries = { CZ:"Česko", SK:"Slovensko", PL:"Polsko", DE:"Německo", AT:"Rakousko", HU:"Maďarsko", SI:"Slovinsko" };
type Notice = { type:"success"|"error"; text:string } | null;

export default function ProfilePage() {
  const router=useRouter(); const [profile,setProfile]=useState<PublicUser|null>(null); const [notice,setNotice]=useState<Notice>(null); const [loading,setLoading]=useState(true);
  const token=()=>localStorage.getItem("profilePortalToken");
  const authHeaders=()=>({ Authorization:`Bearer ${token()}` });

  async function loadProfile() {
    const current=token(); if(!current){router.replace("/login");return;}
    try { const response=await fetch("/api/profile",{headers:authHeaders()}); if(response.status===401){localStorage.removeItem("profilePortalToken");router.replace("/login");return;} const data=await response.json(); if(!response.ok)throw new Error(data.error); setProfile(data); }
    catch(cause){setNotice({type:"error",text:cause instanceof Error?cause.message:"Could not load profile"});} finally{setLoading(false);}
  }
  useEffect(()=>{void loadProfile();},[]);

  async function saveProfile(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setNotice(null); const values=Object.fromEntries(new FormData(event.currentTarget));
    const body={firstName:values.firstName,lastName:values.lastName,address:{street:values.street,houseNumber:values.houseNumber,city:values.city,postalCode:values.postalCode,country:values.country}};
    const response=await fetch("/api/profile",{method:"PATCH",headers:{...authHeaders(),"Content-Type":"application/json"},body:JSON.stringify(body)}); const data=await response.json();
    if(!response.ok)setNotice({type:"error",text:data.error}); else{setProfile(data);setNotice({type:"success",text:"Profile saved successfully."});}
  }
  async function changePassword(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setNotice(null); const form=event.currentTarget; const values=Object.fromEntries(new FormData(form));
    const response=await fetch("/api/profile/password",{method:"PATCH",headers:{...authHeaders(),"Content-Type":"application/json"},body:JSON.stringify(values)});
    if(!response.ok){const data=await response.json();setNotice({type:"error",text:data.error});}else{form.reset();setNotice({type:"success",text:"Password changed successfully."});}
  }
  async function uploadFile(event:React.ChangeEvent<HTMLInputElement>,endpoint:string){
    const file=event.target.files?.[0]; if(!file)return; setNotice(null); const form=new FormData();form.append("file",file);
    const response=await fetch(endpoint,{method:"POST",headers:authHeaders(),body:form}); const data=await response.json();
    if(!response.ok)setNotice({type:"error",text:data.error});else{await loadProfile();setNotice({type:"success",text:"File uploaded successfully."});} event.target.value="";
  }
  async function deleteFile(endpoint:string){
    setNotice(null); const response=await fetch(endpoint,{method:"DELETE",headers:authHeaders()});
    if(!response.ok){const data=await response.json();setNotice({type:"error",text:data.error});}else{await loadProfile();setNotice({type:"success",text:"File deleted successfully."});}
  }
  async function logout(){try{await fetch("/api/auth/logout",{method:"POST",headers:authHeaders()});}finally{localStorage.removeItem("profilePortalToken");router.push("/login");}}

  if(loading)return <section className="card"><p role="status">Loading profile…</p></section>;
  if(!profile)return <section className="card"><Message type={notice?.type??"error"} text={notice?.text??"Profile is unavailable."}/></section>;
  return <>
    <div className="profile-head"><div><h1>Your profile</h1><p className="subtitle">Signed in as {profile.email}</p></div><button type="button" className="secondary" data-testid="logout-button" onClick={logout}>Log out</button></div>
    {notice&&<Message type={notice.type} text={notice.text}/>} 
    <div className="profile-grid">
      <section className="card"><h2>Personal details</h2><form onSubmit={saveProfile} className="form-grid" noValidate>
        <div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" defaultValue={profile.firstName} data-testid="profile-first-name" required/></div>
        <div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" defaultValue={profile.lastName} data-testid="profile-last-name" required/></div>
        <div className="field full"><label htmlFor="street">Street</label><input id="street" name="street" defaultValue={profile.address.street} data-testid="profile-street"/></div>
        <div className="field"><label htmlFor="houseNumber">House number</label><input id="houseNumber" name="houseNumber" defaultValue={profile.address.houseNumber} data-testid="profile-house-number"/></div>
        <div className="field"><label htmlFor="city">City</label><input id="city" name="city" defaultValue={profile.address.city} data-testid="profile-city"/></div>
        <div className="field"><label htmlFor="postalCode">Postal code</label><input id="postalCode" name="postalCode" defaultValue={profile.address.postalCode} data-testid="profile-postal-code" required/></div>
        <div className="field"><label htmlFor="country">Country</label><select id="country" name="country" defaultValue={profile.address.country} data-testid="profile-country">{Object.entries(countries).map(([code,name])=><option value={code} key={code}>{code} — {name}</option>)}</select></div>
        <button type="submit" className="field full" data-testid="profile-save">Save profile</button>
      </form></section>
      <div className="stack">
        <section className="card"><h2>Files</h2>
          <div className="upload-row">{profile.avatar?<img className="avatar" src={profile.avatar.url} alt="User avatar"/>:<div className="avatar placeholder" aria-label="Avatar placeholder">{profile.firstName[0]}{profile.lastName[0]}</div>}<div><span className="upload-title">Avatar photo</span><p className="file-name">{profile.avatar?.fileName??"No avatar uploaded"}</p></div><div className="file-actions"><label htmlFor="avatar" className="upload-button">Upload</label><input id="avatar" className="visually-hidden" type="file" accept=".jpg,.jpeg,.png" data-testid="avatar-upload" onChange={e=>uploadFile(e,"/api/profile/avatar")}/><button type="button" className="danger" data-testid="avatar-delete" onClick={()=>deleteFile("/api/profile/avatar")}>Delete</button></div></div>
          <div className="upload-row"><div><span className="upload-title">GDPR consent document</span><p className="file-name">{profile.gdprDocument?.fileName??"No document uploaded"}</p></div><div className="file-actions"><label htmlFor="gdpr" className="upload-button">Upload</label><input id="gdpr" className="visually-hidden" type="file" accept=".pdf,.doc,.docx" data-testid="gdpr-document-upload" onChange={e=>uploadFile(e,"/api/profile/gdpr-document")}/><button type="button" className="danger" data-testid="gdpr-document-delete" onClick={()=>deleteFile("/api/profile/gdpr-document")}>Delete</button></div></div>
        </section>
        <section className="card"><h2>Change password</h2><form onSubmit={changePassword} className="form-grid" noValidate>
          <div className="field full"><label htmlFor="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" data-testid="change-password-current" required/></div>
          <div className="field full"><label htmlFor="newPassword">New password</label><input id="newPassword" name="newPassword" type="password" data-testid="change-password-new" required/></div>
          <button type="submit" className="field full" data-testid="change-password-submit">Change password</button>
        </form></section>
      </div>
    </div>
  </>;
}
