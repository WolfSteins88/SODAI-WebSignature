"use client";
import { signOut } from "next-auth/react";
export function Logout({dirty=false}:{dirty?:boolean}) {
  return (
    <button onClick={() => {if(!dirty||window.confirm('Discard unsaved edits and sign out?'))void signOut({ redirectTo: "/admin/login" });}}>
      Sign out
    </button>
  );
}
