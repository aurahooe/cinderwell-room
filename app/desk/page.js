"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Desk() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [flash, setFlash] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return setNotes([]);
    supabase
      .from("cinderwell_notes")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setNotes(data || []));
  }, [user]);

  async function submitAuth(e) {
    e.preventDefault();
    setFlash("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return setFlash(error.message);
      if (data.user) {
        const h = (handle || email.split("@")[0]).replace(/[^a-z0-9_]/gi, "").slice(0, 24);
        await supabase.from("cinderwell_profiles").upsert({
          id: data.user.id,
          handle: h || "reader",
          display_name: handle || h || "reader",
        });
      }
      setFlash("Desk reserved. Confirm email if asked, then sit down.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setFlash(error.message);
    }
  }

  async function saveNote(e) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("cinderwell_notes").insert({
      author_id: user.id,
      title: title.trim() || "Untitled slip",
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) return setFlash(error.message);
    setTitle(""); setBody(""); setIsPublic(false); setFlash("");
    const { data } = await supabase.from("cinderwell_notes").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    setNotes(data || []);
  }

  async function togglePublic(note) {
    await supabase.from("cinderwell_notes").update({ is_public: !note.is_public, updated_at: new Date().toISOString() }).eq("id", note.id);
    setNotes((n) => n.map((x) => (x.id === note.id ? { ...x, is_public: !x.is_public } : x)));
  }

  async function remove(note) {
    await supabase.from("cinderwell_notes").delete().eq("id", note.id);
    setNotes((n) => n.filter((x) => x.id !== note.id));
  }

  return (
    <div className="shell desk">
      <header className="top">
        <div className="mark">Cinderwell</div>
        <nav className="top">
          <Link href="/">The hour</Link>
          <Link href="/desk">Desk</Link>
        </nav>
      </header>

      {!user && (
        <>
          <p className="label" style={{ marginTop: 28 }}>Membership</p>
          <h2>Take a desk</h2>
          <p className="dek" style={{ fontSize: 17 }}>Email and a password. Drafts stay yours until you mark them public.</p>
          <form className="panel" onSubmit={submitAuth}>
            {mode === "up" && (
              <input placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
            )}
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="row">
              <button className="ink" type="submit">{mode === "up" ? "Open a desk" : "Sit down"}</button>
              <button className="ghost" type="button" onClick={() => setMode(mode === "up" ? "in" : "up")}>
                {mode === "up" ? "I already have one" : "I need a desk"}
              </button>
            </div>
            <div className="flash">{flash}</div>
          </form>
        </>
      )}

      {user && (
        <>
          <div className="hour-rail">
            <div>
              <div className="label">Signed in</div>
              <h2 style={{ margin: "6px 0 0" }}>{user.email}</h2>
            </div>
            <button className="ghost" onClick={() => supabase.auth.signOut()}>Leave the room</button>
          </div>
          <form className="panel" onSubmit={saveNote} style={{ maxWidth: 640 }}>
            <input placeholder="Title of the slip" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea required placeholder="Write the thing you actually mean." value={body} onChange={(e) => setBody(e.target.value)} />
            <label className="check">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Mark public — show it on the front wall
            </label>
            <button className="ink" type="submit">Keep this slip</button>
            <div className="flash">{flash}</div>
          </form>
          <div className="slips">
            {notes.map((n) => (
              <article className="slip" key={n.id}>
                <div className="meta">{n.is_public ? "Public" : "Private"} · {new Date(n.created_at).toLocaleString()}</div>
                <h3>{n.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
                <div className="row">
                  <button className="ghost" onClick={() => togglePublic(n)}>{n.is_public ? "Pull from the wall" : "Mark public"}</button>
                  <button className="ghost" onClick={() => remove(n)}>Burn</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
