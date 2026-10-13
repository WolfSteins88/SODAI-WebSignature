"use client";
import {useEffect,useRef,useState} from "react";
import {signIn} from "next-auth/react";
import {useReducedMotion} from "motion/react";
import {BaliClock} from "./bali-clock";
import {LoginSlide,type LoginPhase} from "./login-slide";
import {createSubmissionGate} from "./login-interactions";
import "./login.css";

export function Login({configured,localDemo=false,name="Villa management"}:{configured:boolean;localDemo?:boolean;name?:string}){
 const [step,setStep]=useState<"password"|"otp">("password"),[phase,setPhase]=useState<LoginPhase>("idle"),[error,setError]=useState(""),[code,setCode]=useState("");
 const form=useRef<HTMLFormElement>(null),gate=useRef(createSubmissionGate()),mounted=useRef(true),abort=useRef<AbortController|null>(null),redirect=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const reduced=useReducedMotion(),pending=phase!=="idle";
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;abort.current?.abort();clearTimeout(redirect.current);};},[]);
 function fail(message:string){if(!mounted.current)return;gate.current.release();setError(message);setPhase("idle");}
 function complete(next:()=>void){if(!mounted.current)return;setPhase("success");redirect.current=setTimeout(()=>{if(mounted.current)next();},reduced?0:260);}
 function validate(){const valid=form.current?.reportValidity()||false;if(!valid)setError(step==="otp"?"Enter the six-digit authenticator code.":"Enter your account identifier and password.");return valid;}
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!gate.current.enter())return;
  setPhase("pending");setError("");const element=event.currentTarget,data=new FormData(element);
  try{
   if(localDemo){
    const result=await signIn("credentials",{identifier:data.get("identifier"),password:data.get("password"),redirect:false,redirectTo:"/admin"});
    if(result?.error || !result?.ok)fail("Sign-in failed. Check your credentials or try again later.");
    else complete(()=>window.location.assign("/admin"));
   }else if(step==="password"){
    abort.current=new AbortController();
    const response=await fetch("/api/auth/challenge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:data.get("identifier"),password:data.get("password")}),signal:abort.current.signal});
    if(!response.ok){fail("Sign-in failed. Check your credentials or try again later.");return;}
    complete(()=>{element.reset();setCode("");setStep("otp");setPhase("idle");gate.current.release();});
   }else{
    const result=await signIn("credentials",{code:data.get("code"),redirect:false,redirectTo:"/admin"});
    if(result?.error || !result?.ok)fail("Code rejected or challenge expired. Try again or restart sign-in.");
    else complete(()=>window.location.assign("/admin"));
   }
  }catch{fail("Sign-in is temporarily unavailable.");}
 }
 return <section className="cms-login login-surface">
  <div className="login-form-side">
   <a className="login-brand" href="/"><span aria-hidden="true"/>{name}</a>
   <div className="login-form-content">
    <h1>{step==="otp"?"Verify your identity":"Welcome back"}</h1>
    <p className="login-introduction">{step==="otp"?"One more step to your villa.":"Welcome back. Your villa awaits."}</p>
    <p className="login-environment">{localDemo?"Offline local demo · authenticator not required":"Villa management · secure account access"}</p>
    {configured?<form ref={form} onSubmit={submit} aria-busy={pending} onInvalid={()=>setError(step==="otp"?"Enter the six-digit authenticator code.":"Enter your account identifier and password.")}>
     {step==="password"?<><label htmlFor="login-identifier">Account identifier<input id="login-identifier" name="identifier" autoComplete="username" required maxLength={120} readOnly={pending}/></label>
      <label htmlFor="login-password">Password<input id="login-password" name="password" type="password" autoComplete="current-password" required maxLength={72} readOnly={pending}/></label></>:
      <label htmlFor="login-code">Authenticator code<input id="login-code" name="code" aria-label="Six-digit authenticator code" value={code} onChange={event=>setCode(event.target.value.replace(/[^0-9]/g,""))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required autoFocus readOnly={pending} aria-describedby="otp-help"/><small id="otp-help">Enter the six-digit code from your authenticator. No code is sent by email.</small></label>}
     {error&&<p className="login-error" role="alert">{error}</p>}
     <LoginSlide key={step} phase={phase} validate={validate} onConfirm={()=>{if(validate())form.current?.requestSubmit();}}/>
     <button type="submit" tabIndex={-1} className="sr-only" disabled={pending}>Sign in</button>
     <p className="sr-only" role="status">{phase==="pending"?"Checking your account…":phase==="success"?step==="password"&&!localDemo?"Password accepted. Continue with your authenticator.":"Sign-in confirmed. Opening villa management.":""}</p>
     {step==="otp"&&<button className="login-restart" type="button" disabled={pending} onClick={()=>{setStep("password");setCode("");setError("");}}>Restart sign-in</button>}
    </form>:<p className="login-error" role="status">Server authentication is not configured. Ask the deployment operator to complete the M1 environment setup.</p>}
    <a className="login-return" href="/"><span aria-hidden="true">←</span> Return to villa</a>
   </div>
   <span className="login-footnote">Villa management</span>
  </div>
  <div className="login-visual" aria-label="Bali time">
   <div className="login-sun" aria-hidden="true"><span/><i/></div>
   <BaliClock/>
  </div>
 </section>;
}
