"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { editionFor, msUntilNextHour } from "../lib/hours";

function fmtRemain(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const edition = useMemo(() => editionFor(now), [now.getHours(), now.getDate()]);
  const [remain, setRemain] = useState(() => msUntilNextHour(now));
  const [slips, setSlips] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNow(d);
      setRemain(msUntilNextHour(d));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase
      .from("cinderwell_notes")
      .select("id,title,body,created_at,author_id")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => setSlips(data || []));

    supabase.from("cinderwell_hours").upsert(
      {
        hour_key: edition.hour_key,
        title: edition.title,
        dek: edition.dek,
        body: edition.body,
      },
      { onConflict: "hour_key" }
    );
  }, [edition.hour_key]);

  return (
    <div className="shell">
      <header className="top">
        <div className="mark">Cinderwell</div>
        <nav className="top">
          <Link href="/">The hour</Link>
          <Link href="/desk">Desk</Link>
        </nav>
      </header>

      <div className="hour-rail">
        <div className="label">Edition for this hour</div>
        <div className="timer">Turns in {fmtRemain(remain)}</div>
      </div>
      <div className="bar">
        <span style={{ width: `${100 - (remain / 3600000) * 100}%` }} />
      </div>

      <article className="ember">
        <div className="label">Featured</div>
        <h1>{edition.title}</h1>
        <p className="dek">{edition.dek}</p>
        <p className="body">{edition.body}</p>
      </article>

      <section className="wall" style={{ marginTop: 56 }}>
        <div className="label">Public slips</div>
        <h2>What people marked for the room</h2>
        <p className="dek" style={{ fontSize: 17 }}>
          Private drafts stay at the desk. Anything marked public is here.
          {user ? "" : " Sign in at the desk to leave one."}
        </p>
        <div className="slips">
          {slips.length === 0 && (
            <div className="slip">
              <div className="meta">Empty rail</div>
              <h3>No public slips yet this stretch.</h3>
              <p>The first one sets the temperature.</p>
            </div>
          )}
          {slips.map((s) => (
            <article className="slip" key={s.id}>
              <div className="meta">
                {new Date(s.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <h3>{s.title}</h3>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
