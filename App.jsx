import { useState, useEffect, useRef } from "react";

const ROLE_COLORS = {
  DUELIST:    { bg:"#FF4655", glow:"#FF465566", text:"#fff" },
  CONTROLLER: { bg:"#7B5CF0", glow:"#7B5CF066", text:"#fff" },
  SENTINEL:   { bg:"#00C8A0", glow:"#00C8A066", text:"#fff" },
  INITIATOR:  { bg:"#FFB800", glow:"#FFB80066", text:"#111" },
};
const ROLE_LABELS = ["BẤT KỲ","DUELIST","CONTROLLER","SENTINEL","INITIATOR"];
const MAPS = ["Haven","Bind","Split","Ascent","Icebox","Breeze","Fracture","Pearl","Lotus","Sunset","Abyss"];

// Use valorant-api.com display icons (no CORS issues)
const IMG = (uuid) => `https://media.valorant-api.com/agents/${uuid}/displayiconsmall.png`;

const FALLBACK_AGENTS = [
  { name:"Jett",       role:"DUELIST",    abbr:"JT", icon:IMG("dee9be29-4519-ec96-9294-4c3aaad6b0ac") },
  { name:"Reyna",      role:"DUELIST",    abbr:"RY", icon:IMG("a3bfb853-43b2-7238-a4f1-ad90e9e46bcc") },
  { name:"Raze",       role:"DUELIST",    abbr:"RZ", icon:IMG("f94c3b30-42be-e959-889c-5aa313dba261") },
  { name:"Phoenix",    role:"DUELIST",    abbr:"PX", icon:IMG("eb93336a-449b-9c1e-0ac7-d3d8beebad30") },
  { name:"Yoru",       role:"DUELIST",    abbr:"YR", icon:IMG("7f94d92c-4234-0a36-9646-3a87eb8b5eef") },
  { name:"Neon",       role:"DUELIST",    abbr:"NN", icon:IMG("bb2a4828-46eb-8cd1-e765-15848195d751") },
  { name:"Iso",        role:"DUELIST",    abbr:"IS", icon:IMG("0e38b510-41a8-5780-7db6-24f72f7d5b98") },
  { name:"Waylay",     role:"DUELIST",    abbr:"WL", icon:IMG("df1cb487-4902-6f6a-5bc2-4f4b6e5b3e0f") },
  { name:"Brimstone",  role:"CONTROLLER", abbr:"BS", icon:IMG("95b78ed7-4637-86d9-7e41-71ba8c293152") },
  { name:"Omen",       role:"CONTROLLER", abbr:"OM", icon:IMG("8e253930-4c05-31dd-1b6c-968525494517") },
  { name:"Viper",      role:"CONTROLLER", abbr:"VP", icon:IMG("9f0d8ba9-4140-b941-57d3-a7ad57c6b417") },
  { name:"Astra",      role:"CONTROLLER", abbr:"AS", icon:IMG("41fb69c1-4189-7b37-f117-bcaf1e96f1bf") },
  { name:"Harbor",     role:"CONTROLLER", abbr:"HB", icon:IMG("95b78ed7-4637-86d9-7e41-71ba8c293152") },
  { name:"Clove",      role:"CONTROLLER", abbr:"CL", icon:IMG("e4560910-4a2b-0829-3e9b-629bb49f83e4") },
  { name:"Sage",       role:"SENTINEL",   abbr:"SG", icon:IMG("569fdd95-4d10-43ab-ca70-79becc718b46") },
  { name:"Cypher",     role:"SENTINEL",   abbr:"CY", icon:IMG("117ed9e3-49f3-6512-3ccf-0cada7e3823b") },
  { name:"Killjoy",    role:"SENTINEL",   abbr:"KJ", icon:IMG("1dbf2edd-4729-0984-3115-daa5eed44993") },
  { name:"Chamber",    role:"SENTINEL",   abbr:"CH", icon:IMG("22697a3d-45bf-8dd7-4fec-84a9e28c69d7") },
  { name:"Deadlock",   role:"SENTINEL",   abbr:"DL", icon:IMG("cc8b64c8-4b25-4ff9-6e7f-37b4da43d235") },
  { name:"Vyse",       role:"SENTINEL",   abbr:"VS", icon:IMG("efba5359-4016-a1e5-7626-b1ae76895940") },
  { name:"Sova",       role:"INITIATOR",  abbr:"SV", icon:IMG("320b2a48-4d9b-a075-30f1-1f93a9b638fa") },
  { name:"Breach",     role:"INITIATOR",  abbr:"BR", icon:IMG("5f8d3a7f-467b-97f3-062c-2189ba624941") },
  { name:"Skye",       role:"INITIATOR",  abbr:"SK", icon:IMG("6f2a04ca-43e0-be17-7f36-b3908627744d") },
  { name:"KAY/O",      role:"INITIATOR",  abbr:"KO", icon:IMG("601dbbe7-43ce-be57-2a40-4abd24953621") },
  { name:"Fade",       role:"INITIATOR",  abbr:"FD", icon:IMG("dade69b4-4f5a-8528-247b-219e5a1facd6") },
  { name:"Gekko",      role:"INITIATOR",  abbr:"GK", icon:IMG("e370fa57-4757-3604-3648-499e1f642d3f") },
  { name:"Tejo",       role:"INITIATOR",  abbr:"TJ", icon:IMG("b444168c-4b95-7a4e-b6a5-b19f4b1d5014") },
];

const CSS = `
@keyframes vSlideIn {
  from { transform: translateY(56px) scale(.82); opacity:0; filter:blur(5px); }
  to   { transform: translateY(0) scale(1);      opacity:1; filter:blur(0); }
}
@keyframes vReveal {
  0%  { transform: scale(.72) translateY(18px); opacity:0; filter:blur(8px); }
  55% { transform: scale(1.09) translateY(-4px); opacity:1; filter:blur(0); }
  78% { transform: scale(.97) translateY(2px); }
  100%{ transform: scale(1) translateY(0); }
}
@keyframes vPulseGlow {
  0%,100%{ opacity:0; }
  50%    { opacity:1; }
}
@keyframes vScanline {
  0%  { top:-4px; }
  100%{ top:108%; }
}
@keyframes vGlow {
  0%,100%{ opacity:.55; }
  50%    { opacity:1; }
}
@keyframes vBadgePop {
  0%  { transform: scale(0) rotate(-12deg); opacity:0; }
  65% { transform: scale(1.18) rotate(2deg); opacity:1; }
  100%{ transform: scale(1) rotate(0); }
}
@keyframes vFloat {
  0%,100%{ transform: translateY(0); }
  50%    { transform: translateY(-4px); }
}
@keyframes vCheckmark {
  0%  { transform: scale(0) rotate(-20deg); opacity:0; }
  60% { transform: scale(1.25) rotate(5deg); opacity:1; }
  100%{ transform: scale(1) rotate(0); }
}
.v-slide   { animation: vSlideIn .17s cubic-bezier(.2,.85,.4,1) both; }
.v-reveal  { animation: vReveal .5s cubic-bezier(.2,.85,.3,1) both; }
.v-badge   { animation: vBadgePop .38s cubic-bezier(.2,.85,.4,1) both; }
.v-float   { animation: vFloat 2.6s ease-in-out infinite; }
.v-check   { animation: vCheckmark .38s cubic-bezier(.2,.85,.4,1) both; }
`;

function injectCSS() {
  if (document.getElementById("vd-css")) return;
  const s = document.createElement("style");
  s.id = "vd-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function AvatarImg({ src, alt, style, fallback }) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(true), [src]);
  if (ok && src) return (
    <img src={src} alt={alt} onError={() => setOk(false)} style={style} />
  );
  return fallback || null;
}

function SpinWindow({ agent, spinning, animKey, revealed, teamColor }) {
  if (!agent) return (
    <div style={{
      width:144, height:144, borderRadius:14,
      border:"2px dashed #1a2535", background:"#0a1520",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:8,
    }}>
      <span style={{ fontSize:28, color:"#1a2535" }}>?</span>
      <span style={{ fontSize:10, color:"#1e3040", fontWeight:700 }}>CHỌN ROLE</span>
    </div>
  );
  const c = ROLE_COLORS[agent.role];
  const cls = revealed ? "v-reveal" : spinning ? "v-slide" : "";
  return (
    <div key={animKey} className={cls} style={{
      width:144, height:144, borderRadius:14, overflow:"hidden",
      border:`2.5px solid ${revealed ? c.bg : spinning ? c.bg+"88" : c.bg+"44"}`,
      boxShadow: revealed
        ? `0 0 0 4px ${c.bg}22, 0 0 40px ${c.glow}, 0 0 80px ${c.glow}55`
        : spinning ? `0 0 20px ${c.glow}` : "none",
      position:"relative", background:"#0a1520",
      transition: revealed ? "box-shadow .3s" : "none",
    }}>
      <AvatarImg
        src={agent.icon} alt={agent.name}
        style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", display:"block" }}
        fallback={
          <div style={{
            width:"100%", height:"100%",
            background:`${c.bg}22`,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:6,
          }}>
            <span style={{ fontSize:40, fontWeight:900, color:c.bg }}>{agent.abbr}</span>
            <span style={{ fontSize:11, color:c.bg+"99", fontWeight:700 }}>{agent.name}</span>
          </div>
        }
      />
      {spinning && (
        <>
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(180deg,transparent 40%,#0a152099 100%)",
            pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", left:0, right:0, height:3,
            background:`linear-gradient(90deg,transparent,${c.bg}cc,transparent)`,
            animation:"vScanline .45s linear infinite",
            pointerEvents:"none",
          }} />
        </>
      )}
      {revealed && (
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(180deg,rgba(255,255,255,.08) 0%,transparent 50%,#0a1520cc 100%)",
          pointerEvents:"none",
        }} />
      )}
      {revealed && (
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding:"10px 8px 6px",
        }}>
          <div style={{ fontSize:13, fontWeight:900, color:"#fff", textAlign:"center", textShadow:"0 2px 8px #000a" }}>{agent.name}</div>
          <div style={{ fontSize:9, color:c.bg, fontWeight:800, textAlign:"center", letterSpacing:1.5 }}>{agent.role}</div>
        </div>
      )}
    </div>
  );
}

function TeamPanel({ teamName, setTeamName, picks, isActive, teamColor }) {
  const [editing, setEditing] = useState(false);
  const filledCount = picks.filter(Boolean).length;
  return (
    <div style={{
      width:188, background:"#0d1824", borderRadius:12,
      padding:"13px 10px",
      border: isActive ? `1.5px solid ${teamColor}88` : "1.5px solid #1a2535",
      boxShadow: isActive ? `0 0 32px ${teamColor}18` : "none",
      transition:"all .3s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
          width:8, height:8, borderRadius:"50%",
          background: isActive ? teamColor : "#1e2d3d",
          boxShadow: isActive ? `0 0 10px ${teamColor}` : "none",
          transition:"all .3s", flexShrink:0,
        }} />
        {editing ? (
          <input autoFocus value={teamName}
            onChange={e => setTeamName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={e => e.key==="Enter" && setEditing(false)}
            style={{
              background:"transparent", border:"none",
              borderBottom:`1px solid ${teamColor}`,
              color:"#fff", fontSize:12, fontWeight:800,
              width:"100%", outline:"none", padding:"2px 0",
            }}
          />
        ) : (
          <span onClick={() => setEditing(true)} title="Chỉnh tên đội"
            style={{ fontSize:12, fontWeight:800, color:"#eef",
              letterSpacing:1.2, textTransform:"uppercase", cursor:"text", flex:1 }}>
            {teamName}
          </span>
        )}
        <span style={{ fontSize:10, color:teamColor, fontWeight:800 }}>{filledCount}/5</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {picks.map((pick, i) => {
          const isCurrent = isActive && i === filledCount;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{
                width:19, height:19, borderRadius:4, background:"#111e2b",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:8, fontWeight:900, color: pick ? teamColor+"88":"#223", flexShrink:0,
              }}>A{i+1}</div>
              {pick ? (
                <div className="v-badge" style={{
                  display:"flex", alignItems:"center", gap:6, flex:1, minWidth:0,
                  background: ROLE_COLORS[pick.role].bg+"15",
                  border:`1px solid ${ROLE_COLORS[pick.role].bg}44`,
                  borderRadius:6, padding:"4px 7px",
                }}>
                  <div style={{ width:28, height:28, borderRadius:5, overflow:"hidden", flexShrink:0, background:"#111e2b" }}>
                    <AvatarImg src={pick.icon} alt={pick.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                      fallback={
                        <div style={{
                          width:"100%", height:"100%", display:"flex",
                          alignItems:"center", justifyContent:"center",
                          background: ROLE_COLORS[pick.role].bg+"33",
                          fontSize:10, fontWeight:800, color:ROLE_COLORS[pick.role].bg,
                        }}>{pick.abbr}</div>
                      }
                    />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:"#dde",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {pick.name}
                    </div>
                    <div style={{ fontSize:8, color:ROLE_COLORS[pick.role].bg, fontWeight:800, letterSpacing:.8 }}>
                      {pick.role.slice(0,4)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  height:36, flex:1, borderRadius:6,
                  background: isCurrent ? teamColor+"0d" : "#0a1520",
                  border: isCurrent ? `1px solid ${teamColor}44` : "1px dashed #1a2535",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .3s",
                }}>
                  <span style={{
                    fontSize:9, fontWeight:800,
                    color: isCurrent ? teamColor : "#1e2d3d",
                    animation: isCurrent ? "vGlow 1.2s ease-in-out infinite" : "none",
                  }}>
                    {isCurrent ? "ĐANG CHỌN..." : "—"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [agents, setAgents] = useState(FALLBACK_AGENTS);
  const [teamNames, setTeamNames] = useState(["ĐỘI ĐỎ", "ĐỘI TÍM"]);
  const [picks, setPicks] = useState([Array(5).fill(null), Array(5).fill(null)]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedRole, setSelectedRole] = useState("BẤT KỲ");
  const [spinning, setSpinning] = useState(false);
  const [spinAgent, setSpinAgent] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedMap, setSelectedMap] = useState("Haven");
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(1);
  const timerRef = useRef(null);
  const teamColors = ["#FF4655", "#7B5CF0"];

  injectCSS();

  useEffect(() => {
    fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
      .then(r => r.json())
      .then(d => {
        const RMAP = { Duelist:"DUELIST", Controller:"CONTROLLER", Sentinel:"SENTINEL", Initiator:"INITIATOR" };
        const mapped = d.data
          .filter(a => a.role)
          .map(a => ({
            name: a.displayName,
            role: RMAP[a.role.displayName] || "DUELIST",
            abbr: a.displayName.replace(/[^A-Z]/g,"").slice(0,2) || a.displayName.slice(0,2).toUpperCase(),
            // Use displayIconSmall directly from the API — no CORS issues
            icon: a.displayIconSmall,
          }))
          .sort((a,b) => a.role.localeCompare(b.role)||a.name.localeCompare(b.name));
        if (mapped.length > 0) setAgents(mapped);
      })
      .catch(() => {});
  }, []);

  const allPicked = picks.flat().filter(Boolean).map(a => a.name);

  function getPool(role) {
    return agents.filter(a =>
      !allPicked.includes(a.name) &&
      (role === "BẤT KỲ" || a.role === role)
    );
  }

  const available = getPool(selectedRole);
  const totalPicks = allPicked.length;

  function startSpin() {
    if (spinning || done) return;
    const pool = available.length > 0 ? available : getPool("BẤT KỲ");
    if (!pool.length) return;
    clearTimeout(timerRef.current);
    setRevealed(false);
    setSpinning(true);

    const winner = pool[Math.floor(Math.random() * pool.length)];
    let frame = 0;
    const total = 32;

    function tick() {
      frame++;
      const speed = frame < 8 ? 45 : frame < 16 ? 70 : frame < 22 ? 115 : frame < 27 ? 190 : frame < 31 ? 300 : 450;
      const show = frame < total ? pool[Math.floor(Math.random() * pool.length)] : winner;
      setSpinAgent(show);
      setAnimKey(k => k + 1);
      if (frame < total) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        setSpinning(false);
        setRevealed(true);
        timerRef.current = setTimeout(() => commitPick(winner), 950);
      }
    }
    tick();
  }

  function commitPick(agent) {
    setPicks(prev => {
      const next = prev.map(t => [...t]);
      const slot = next[currentTurn].findIndex(x => x === null);
      if (slot !== -1) next[currentTurn][slot] = agent;
      return next;
    });
    setSpinAgent(null);
    setRevealed(false);
    setSelectedRole("BẤT KỲ");
    setRound(r => r + 1);
    if (totalPicks + 1 >= 10) {
      setDone(true);
    } else {
      setCurrentTurn(t => 1 - t);
    }
  }

  function reset() {
    clearTimeout(timerRef.current);
    setPicks([Array(5).fill(null), Array(5).fill(null)]);
    setCurrentTurn(0); setSelectedRole("BẤT KỲ");
    setSpinning(false); setSpinAgent(null);
    setRevealed(false); setDone(false); setRound(1);
  }

  return (
    <div style={{
      minHeight:640, background:"#0a1520", borderRadius:12, overflow:"hidden",
      fontFamily:"var(--font-sans,'Inter',system-ui,sans-serif)", color:"#ccd",
    }}>
      {/* Header */}
      <div style={{
        background:"#0d1824", borderBottom:"1px solid #1a2535",
        padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:15, fontWeight:900, color:"#FF4655", letterSpacing:3 }}>
            VALORANT DRAFT
          </span>
          <select value={selectedMap} onChange={e => setSelectedMap(e.target.value)}
            style={{ background:"#111e2b", border:"1px solid #1a2535", color:"#889",
              fontSize:11, borderRadius:6, padding:"3px 8px" }}>
            {MAPS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={reset} style={{
          background:"transparent", border:"1px solid #1e2d3d",
          color:"#445", fontSize:11, borderRadius:6, padding:"5px 14px",
          cursor:"pointer", fontWeight:700, letterSpacing:.8,
        }}>↺ LÀM MỚI</button>
      </div>

      {/* Scoreboard bar */}
      <div style={{
        background:"#0b1a27", borderBottom:"1px solid #1a2535",
        padding:"9px 18px", display:"flex", alignItems:"center",
        justifyContent:"center", gap:20,
      }}>
        <span style={{ fontWeight:900, fontSize:13, color:teamColors[0], letterSpacing:1.5, textTransform:"uppercase" }}>
          {teamNames[0]}
        </span>
        <span style={{ color:"#FF4655", fontSize:11, fontWeight:900 }}>VS</span>
        <span style={{ fontWeight:900, fontSize:13, color:teamColors[1], letterSpacing:1.5, textTransform:"uppercase" }}>
          {teamNames[1]}
        </span>
        <span style={{ color:"#1e3040", fontSize:10 }}>•</span>
        <span style={{ fontSize:11, color:"#334" }}>{selectedMap}</span>
        {!done && (
          <div style={{
            background: teamColors[currentTurn]+"15",
            border:`1px solid ${teamColors[currentTurn]}55`,
            borderRadius:6, padding:"3px 12px",
            fontSize:10, color:teamColors[currentTurn], fontWeight:800,
          }}>
            LƯỢT #{round} — {teamNames[currentTurn]}
          </div>
        )}
      </div>

      {/* Main layout */}
      <div style={{ display:"flex", minHeight:556 }}>
        {/* Team Left */}
        <div style={{ padding:"14px 10px 14px 14px" }}>
          <TeamPanel teamName={teamNames[0]} setTeamName={n => setTeamNames(p => [n, p[1]])}
            picks={picks[0]} isActive={currentTurn===0 && !done} teamColor={teamColors[0]} />
        </div>

        {/* Center */}
        <div style={{ flex:1, padding:"14px 8px", display:"flex", flexDirection:"column", gap:10 }}>
          {done ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22 }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#FF4655", letterSpacing:3, textAlign:"center" }}>
                DRAFT HOÀN TẤT!
              </div>
              <div style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center" }}>
                {[0,1].map(ti => (
                  <div key={ti}>
                    <div style={{ fontSize:12, fontWeight:800, color:teamColors[ti], textAlign:"center",
                      letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>
                      {teamNames[ti]}
                    </div>
                    {picks[ti].filter(Boolean).map((a, i) => (
                      <div key={i} className="v-float" style={{
                        display:"flex", alignItems:"center", gap:10,
                        background:"#0d1824", borderRadius:8,
                        padding:"7px 12px", marginBottom:8,
                        border:`1px solid ${ROLE_COLORS[a.role].bg}44`,
                        animationDelay:`${i*0.12}s`,
                      }}>
                        <div style={{ width:36, height:36, borderRadius:6, overflow:"hidden", flexShrink:0, background:"#111e2b" }}>
                          <AvatarImg src={a.icon} alt={a.name}
                            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                            fallback={
                              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
                                background:ROLE_COLORS[a.role].bg+"33", fontSize:12, fontWeight:800, color:ROLE_COLORS[a.role].bg }}>
                                {a.abbr}
                              </div>
                            }
                          />
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:800, color:"#dde" }}>{a.name}</div>
                          <div style={{ fontSize:9, color:ROLE_COLORS[a.role].bg, fontWeight:800 }}>{a.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={reset} style={{
                background:"#FF4655", border:"none", color:"#fff",
                fontSize:12, fontWeight:900, borderRadius:8,
                padding:"11px 32px", cursor:"pointer", letterSpacing:2,
                boxShadow:"0 4px 24px #FF465544",
              }}>⟳ DRAFT LẠI</button>
            </div>
          ) : (
            <>
              {/* Role filter */}
              <div style={{ background:"#0d1824", borderRadius:10, padding:"12px 14px", border:"1px solid #1a2535" }}>
                <div style={{ fontSize:9, color:"#334", marginBottom:9, fontWeight:800, letterSpacing:1.5 }}>
                  1. CHỌN VAI TRÒ (ROLE)
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {ROLE_LABELS.map(r => {
                    const c = ROLE_COLORS[r] || { bg:"#556", glow:"#55666666" };
                    const active = selectedRole === r;
                    const cnt = getPool(r).length;
                    return (
                      <button key={r} onClick={() => setSelectedRole(r)} style={{
                        background: active ? c.bg : "transparent",
                        border:`1.5px solid ${active ? c.bg : "#1a2535"}`,
                        color: active ? (c.text||"#fff") : "#445",
                        fontSize:10, fontWeight:800, borderRadius:6,
                        padding:"5px 10px", cursor:"pointer", letterSpacing:.8,
                        boxShadow: active ? `0 0 18px ${c.glow||c.bg+"55"}` : "none",
                        transition:"all .15s",
                        display:"flex", alignItems:"center", gap:5,
                      }}>
                        {r}
                        <span style={{
                          background: active ? "rgba(255,255,255,.25)" : "#111e2b",
                          borderRadius:3, padding:"1px 5px",
                          fontSize:9, color: active ? "#fff" : "#334",
                        }}>{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spin zone */}
              <div style={{
                background:"#0d1824", borderRadius:10,
                border:`1px solid ${spinning||revealed ? teamColors[currentTurn]+"55":"#1a2535"}`,
                padding:"14px 14px",
                boxShadow: spinning||revealed ? `0 0 40px ${teamColors[currentTurn]}14` : "none",
                transition:"all .3s",
              }}>
                <div style={{ fontSize:9, color:"#334", marginBottom:12, fontWeight:800, letterSpacing:1.5 }}>
                  2. BẮT ĐẦU QUAY RANDOM
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <SpinWindow agent={spinAgent} spinning={spinning}
                      animKey={animKey} revealed={revealed} teamColor={teamColors[currentTurn]} />
                    {revealed && (
                      <div className="v-check" style={{
                        position:"absolute", top:-10, right:-10, zIndex:10,
                        width:30, height:30, borderRadius:"50%",
                        background:teamColors[currentTurn],
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:15, fontWeight:900, color:"#fff",
                        boxShadow:`0 0 16px ${teamColors[currentTurn]}`,
                      }}>✓</div>
                    )}
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-start", flex:1 }}>
                    {spinAgent && revealed ? (
                      <div className="v-reveal">
                        <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:.5 }}>
                          {spinAgent.name}
                        </div>
                        <div style={{
                          fontSize:10, fontWeight:800,
                          color: ROLE_COLORS[spinAgent.role]?.bg||"#aaa",
                          letterSpacing:2, marginTop:3,
                        }}>{spinAgent.role}</div>
                        <div style={{ fontSize:11, color:teamColors[currentTurn], fontWeight:700, marginTop:7 }}>
                          {teamNames[currentTurn]} nhận được agent này!
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:spinning ? "#dde":"#2a3548", fontWeight:700 }}>
                          {spinning ? (spinAgent?.name||"...") : "Nhấn quay để bắt đầu"}
                        </div>
                        {spinning && spinAgent && (
                          <div style={{ fontSize:9, color:ROLE_COLORS[spinAgent.role]?.bg, fontWeight:800, marginTop:3, letterSpacing:1 }}>
                            {spinAgent.role}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={startSpin}
                      disabled={spinning || available.length===0}
                      style={{
                        background: spinning ? "#111e2b" : teamColors[currentTurn],
                        border: spinning ? "1px solid #1a2535" : "none",
                        color: spinning ? "#334" : "#fff",
                        fontSize:12, fontWeight:900, borderRadius:8,
                        padding:"11px 24px", cursor: spinning ? "not-allowed" : "pointer",
                        letterSpacing:1.5, textTransform:"uppercase",
                        boxShadow: spinning ? "none" : `0 4px 22px ${teamColors[currentTurn]}44`,
                        transition:"all .2s", minWidth:210,
                      }}
                    >
                      {spinning ? "⟳ ĐANG QUAY..." : "⟳ QUAY NGẪU NHIÊN"}
                    </button>
                    {available.length === 0 && selectedRole !== "BẤT KỲ" && (
                      <div style={{ fontSize:10, color:"#FF4655", fontWeight:700 }}>
                        Hết {selectedRole} — đổi vai trò khác
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent grid */}
              <div style={{ background:"#0d1824", borderRadius:10, padding:"12px 14px",
                border:"1px solid #1a2535", flex:1, overflowY:"auto" }}>
                <div style={{ fontSize:9, color:"#334", marginBottom:10, fontWeight:800, letterSpacing:1.5 }}>
                  BẢN ĐỒ AGENT VALORANT
                  <span style={{ color:"#1e2d3d", marginLeft:8 }}>({available.length} khả dụng)</span>
                </div>
                {["DUELIST","CONTROLLER","SENTINEL","INITIATOR"].map(role => {
                  const group = agents.filter(a => a.role===role);
                  if (!group.length) return null;
                  const c = ROLE_COLORS[role];
                  return (
                    <div key={role} style={{ marginBottom:14 }}>
                      <div style={{
                        fontSize:9, fontWeight:800, color:c.bg,
                        letterSpacing:2, marginBottom:7,
                        display:"flex", alignItems:"center", gap:6,
                      }}>
                        <span style={{ width:14, height:1, background:c.bg, display:"inline-block" }} />
                        {role}
                        <span style={{ width:14, height:1, background:c.bg, display:"inline-block" }} />
                      </div>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        {group.map(a => {
                          const picked = allPicked.includes(a.name);
                          const inRole = selectedRole==="BẤT KỲ" || a.role===selectedRole;
                          const dim = picked || !inRole;
                          return (
                            <div key={a.name} title={`${a.name} — ${a.role}`} style={{
                              width:52, opacity: dim ? .22 : 1,
                              transition:"opacity .2s",
                            }}>
                              <div style={{
                                width:52, height:52, borderRadius:8, overflow:"hidden",
                                border:`1.5px solid ${dim ? "#1a2535" : c.bg+"66"}`,
                                background:"#0a1520", position:"relative",
                              }}>
                                <AvatarImg src={a.icon} alt={a.name}
                                  style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block" }}
                                  fallback={
                                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
                                      background:c.bg+"22", fontSize:14, fontWeight:800, color:c.bg }}>
                                      {a.abbr}
                                    </div>
                                  }
                                />
                                {picked && (
                                  <div style={{
                                    position:"absolute", inset:0, background:"rgba(0,0,0,.72)",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    borderRadius:7,
                                  }}>
                                    <span style={{ fontSize:20, color:"#FF4655", fontWeight:900 }}>✕</span>
                                  </div>
                                )}
                              </div>
                              <div style={{ fontSize:8, textAlign:"center", color: dim?"#1e2d3d":"#556",
                                fontWeight:700, marginTop:3, whiteSpace:"nowrap",
                                overflow:"hidden", textOverflow:"ellipsis" }}>
                                {a.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Team Right */}
        <div style={{ padding:"14px 14px 14px 10px" }}>
          <TeamPanel teamName={teamNames[1]} setTeamName={n => setTeamNames(p => [p[0],n])}
            picks={picks[1]} isActive={currentTurn===1 && !done} teamColor={teamColors[1]} />
        </div>
      </div>
    </div>
  );
}
