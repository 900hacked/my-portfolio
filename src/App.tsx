
import { useState, useEffect, useRef, useCallback } from "react";
import emailjs from "@emailjs/browser";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  url: string;
  status: "ACTIVE" | "ARCHIVED" | "WIP";
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "proj_001",
    name: "portfolio.exe",
    desc: "This very site. Hacked together with React, TypeScript, and a deep love for the Matrix aesthetic.",
    tags: ["React", "TypeScript", "CSS"],
    url: "https://github.com/doriankalisa",
    status: "ACTIVE",
  },
  {
    id: "proj_002",
    name: "data_breach_sim",
    desc: "A penetration testing dashboard that visualises network topology and live vulnerability scans.",
    tags: ["Python", "WebSockets", "D3.js"],
    url: "https://github.com/doriankalisa",
    status: "WIP",
  },
  {
    id: "proj_003",
    name: "ghost_protocol",
    desc: "End-to-end encrypted messaging CLI. Zero logs. Zero traces. Built for privacy purists.",
    tags: ["Rust", "Cryptography", "CLI"],
    url: "https://github.com/doriankalisa",
    status: "ARCHIVED",
  },
];

const NAV: NavItem[] = [
  { id: "home", label: "HOME", icon: "⌂" },
  { id: "about", label: "ABOUT", icon: "◈" },
  { id: "projects", label: "PROJECTS", icon: "◉" },
  { id: "skills", label: "SKILLS", icon: "▲" },
  { id: "contact", label: "CONTACT", icon: "◎" },
];

const SKILLS = {
  "LANGUAGES": ["TypeScript", "JavaScript", "Java", "C#", "SQL"],
  "FRAMEWORKS": ["React", "Node.js", "Express", "FastAPI", "Next.js"],
  "TOOLS": ["Git", "Docker", "Linux", "Vim", "Figma"],
  "CONCEPTS": ["REST APIs", "Auth/Security", "CI/CD", "Databases", "Testing"],
};

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ".split("");
    const fontSize = 13;
    let columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      columns = Math.floor(canvas.width / fontSize);
      while (drops.length < columns) drops.push(Math.random() * canvas.height);

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();

        if (brightness > 0.98) {
          ctx.fillStyle = "#ffffff";
        } else if (brightness > 0.85) {
          ctx.fillStyle = "#00ff41";
        } else {
          ctx.fillStyle = "#003b00";
        }

        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        opacity: 0.35,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Glitch Text ─────────────────────────────────────────────────────────────
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch ${className}`} data-text={text}>
      {text}
    </span>
  );
}

// ─── Terminal Cursor ──────────────────────────────────────────────────────────
function Cursor() {
  return <span className="cursor">█</span>;
}

// ─── Typing Effect ────────────────────────────────────────────────────────────
function TypingText({ lines, speed = 40 }: { lines: string[]; speed?: number }) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const line = lines[currentLine];

    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const next = [...prev];
          next[currentLine] = (next[currentLine] || "") + line[currentChar];
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed + Math.random() * 20);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, lines, speed]);

  return (
    <div className="typing-block">
      {displayed.map((line, i) => (
        <div key={i} className="terminal-line">
          <span className="prompt">root@matrix:~$</span> {line}
          {i === currentLine && <Cursor />}
        </div>
      ))}
      {currentLine >= lines.length && <Cursor />}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      {children}
    </section>
  );
}

// ─── Scan Line Effect ─────────────────────────────────────────────────────────
function ScanLines() {
  return <div className="scanlines" aria-hidden="true" />;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Project["status"] }) {
  const map = {
    ACTIVE: { color: "#00ff41", bg: "#003b0022" },
    WIP: { color: "#ffd700", bg: "#3b300022" },
    ARCHIVED: { color: "#888", bg: "#11111122" },
  };
  const s = map[status];
  return (
    <span
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}44`,
        fontSize: "10px",
        padding: "2px 8px",
        fontFamily: "monospace",
        letterSpacing: "2px",
      }}
    >
      [{status}]
    </span>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none" }}
    >
      <div className="card-header">
        <span className="card-id" style={{ color: "#00ff4166", fontSize: "11px", fontFamily: "monospace" }}>
          {project.id}
        </span>
        <StatusBadge status={project.status} />
      </div>
      <div className="card-name">
        <span style={{ color: "#00ff41", fontSize: "18px", fontFamily: "monospace", letterSpacing: "1px" }}>
          {hovered ? "> " : "  "}{project.name}
        </span>
      </div>
      <p className="card-desc">{project.desc}</p>
      <div className="card-tags">
        {project.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      {hovered && (
        <div className="card-cta">
          <span style={{ color: "#00ff41", fontSize: "12px", fontFamily: "monospace" }}>
            ACCESSING REPOSITORY... ▶
          </span>
        </div>
      )}
    </a>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <span style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "13px", letterSpacing: "3px" }}>
          DK://v2.0.1
        </span>
      </div>
      <div className="nav-links">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`nav-link ${active === item.id ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Home Section ─────────────────────────────────────────────────────────────
function HomeSection() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Section id="home">
      <div className="home-content">
        <div className="boot-sequence">
          {booted && (
            <TypingText
              lines={[
                "initiating secure connection...",
                "identity confirmed: DORIAN KALISA",
                "clearance level: DEVELOPER",
                "loading portfolio...",
              ]}
              speed={35}
            />
          )}
        </div>
        <div className="hero">
          <div className="hero-pre" style={{ color: "#00ff4199", fontFamily: "monospace", fontSize: "13px", letterSpacing: "4px", marginBottom: "12px" }}>
            &gt; SYSTEM ACCESS GRANTED
          </div>
          <h1 className="hero-name">
            <GlitchText text="DORIAN" />
            <br />
            <GlitchText text="KALISA" />
          </h1>
          <div className="hero-role">
            <span className="role-text">SOFTWARE DEVELOPER</span>
            <span style={{ color: "#00ff4144", margin: "0 12px" }}>|</span>
            <span className="role-text">BUILDER</span>
            <span style={{ color: "#00ff4144", margin: "0 12px" }}>|</span>
            <span className="role-text">PROBLEM SOLVER</span>
          </div>
          <div className="hero-actions">
            <a href="https://github.com/900hacked" target="_blank" rel="noopener noreferrer" className="btn-primary">
              ▶ GITHUB.INIT()
            </a>
            <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="btn-secondary">
              ◈ ESTABLISH_CONNECTION
            </button>
          </div>
        </div>
        <div className="hex-grid" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="hex-char" style={{ animationDelay: `${i * 0.3}s` }}>
              {Math.random() > 0.5 ? "1" : "0"}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <Section id="about">
      <div className="section-header">
        <span className="section-tag">//&nbsp;ABOUT</span>
        <h2 className="section-title">WHO_AM_I.exe</h2>
      </div>
      <div className="about-grid">
        <div className="about-terminal">
          <div className="terminal-bar">
            <span className="t-dot" style={{ background: "#ff5f57" }} />
            <span className="t-dot" style={{ background: "#febc2e" }} />
            <span className="t-dot" style={{ background: "#28c840" }} />
            <span style={{ color: "#00ff4166", fontFamily: "monospace", fontSize: "11px", marginLeft: "auto" }}>
              dorian@matrix: ~
            </span>
          </div>
          <div className="terminal-body">
            <div className="terminal-line">
              <span className="prompt">$</span> cat about.txt
            </div>
            <div className="terminal-output">
              <p>Hello, World. I'm Dorian Kalisa — a software developer based in Kampala, Uganda.</p>
              <p>I build things that live on the internet: clean APIs, fast UIs, and the occasional script that does something probably shouldn't be automated but absolutely should be.</p>
              <p>When I'm not coding, I'm thinking about code.</p>
            </div>
            <div className="terminal-line">
              <span className="prompt">$</span> cat philosophy.txt
            </div>
            <div className="terminal-output">
              <p>Good software is invisible. Great software is inevitable.</p>
            </div>
            <div className="terminal-line">
              <span className="prompt">$</span> <Cursor />
            </div>
          </div>
        </div>
        <div className="about-stats">
          {[
            { label: "LOCATION", value: "Kampala, UG" },
            { label: "STATUS", value: "AVAILABLE" },
            { label: "FOCUS", value: "Full-Stack Dev" },
            { label: "GITHUB", value: "@900hacked" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────
function ProjectsSection() {
  return (
    <Section id="projects">
      <div className="section-header">
        <span className="section-tag">//&nbsp;PROJECTS</span>
        <h2 className="section-title">REPOSITORY_DUMP.log</h2>
      </div>
      <div className="projects-grid">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      <div style={{ marginTop: "32px", textAlign: "center" }}>
        <a href="https://github.com/900hacked?tab=repositories" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          ▶ VIEW ALL REPOSITORIES
        </a>
      </div>
    </Section>
  );
}

// ─── Skills Section ───────────────────────────────────────────────────────────
function SkillsSection() {
  return (
    <Section id="skills">
      <div className="section-header">
        <span className="section-tag">//&nbsp;SKILLS</span>
        <h2 className="section-title">CAPABILITIES.db</h2>
      </div>
      <div className="skills-grid">
        {Object.entries(SKILLS).map(([category, items]) => (
          <div key={category} className="skill-group">
            <div className="skill-category">{category}</div>
            <div className="skill-items">
              {items.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

 const handleSubmit = () => {
  if (!form.name || !form.email || !form.message) return;

  emailjs
    .send(
      "Portfolio",
      "template_avb8t8o",
      {
        from_name: form.name,
        from_email: form.email,
        message: form.message,
      },
      "GdEc5bSQ9ynJ7ZfIJ"
    )
    .then(() => setSent(true))
    .catch(() => alert("TRANSMISSION FAILED. RETRY."));
};

  return (
    <Section id="contact">
      <div className="section-header">
        <span className="section-tag">//&nbsp;CONTACT</span>
        <h2 className="section-title">ESTABLISH_CONNECTION.sh</h2>
      </div>
      {sent ? (
        <div className="sent-msg">
          <TypingText lines={["message encrypted.", "transmission successful.", "dorian will respond shortly."]} speed={50} />
        </div>
      ) : (
        <div className="contact-grid">
          <div className="contact-form">
            <div className="form-field">
              <label className="form-label">IDENTIFIER (name)</label>
              <input
                className="form-input"
                type="text"
                placeholder="agent_unknown"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">CHANNEL (email)</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@matrix.net"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">PAYLOAD (message)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="enter your message..."
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button className="btn-primary" onClick={handleSubmit}>
              ▶ TRANSMIT_MESSAGE()
            </button>
          </div>
          <div className="contact-links">
            <div className="contact-link-header">DIRECT CHANNELS</div>
            {[
              { label: "GITHUB", handle: "900hacked", url: "https://github.com/900hacked", icon: "◈" },
              { label: "EMAIL", handle: "doriankalisa975@gmail.com", url: "mailto:doriankalisa975@gmail.com", icon: "◎" },
              { label: "LINKEDIN", handle: "linkedin.com/in/doriankalisa", url: "https://linkedin.com/in/doriankalisa", icon: "▲" },
            ].map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="contact-icon">{link.icon}</span>
                <div>
                  <div className="contact-link-label">{link.label}</div>
                  <div className="contact-link-handle">{link.handle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <span style={{ color: "#00ff4133", fontFamily: "monospace", fontSize: "12px" }}>
        © {new Date().getFullYear()} DORIAN KALISA — ALL SYSTEMS OPERATIONAL
      </span>
      <span style={{ color: "#00ff4133", fontFamily: "monospace", fontSize: "12px" }}>
        built_with(react + typescript + 🌿)
      </span>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("home");

  const handleNav = useCallback((id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id);
        });
      },
      { threshold: 0.4 }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #00ff41;
          --green-dim: #00b32c;
          --green-dark: #003b00;
          --green-mid: #00ff4122;
          --bg: #000000;
          --bg2: #050d05;
          --text: #b8ffb8;
          --text-dim: #4a8c4a;
          --mono: 'Share Tech Mono', monospace;
          --display: 'Orbitron', monospace;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--mono);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .scanlines {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 60px;
          background: rgba(0,0,0,0.92);
          border-bottom: 1px solid var(--green-dark);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .nav-links {
          display: flex;
          gap: 4px;
        }

        .nav-link {
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 2px;
          padding: 6px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s, border-color 0.2s;
          border-bottom: 1px solid transparent;
        }
        .nav-link:hover { color: var(--green); }
        .nav-link.active { color: var(--green); border-bottom-color: var(--green); }
        .nav-icon { font-size: 14px; }

        .section {
          min-height: 100vh;
          padding: 100px 80px 60px;
          position: relative;
          z-index: 2;
        }

        .section-header {
          margin-bottom: 48px;
        }

        .section-tag {
          color: var(--text-dim);
          font-size: 12px;
          letter-spacing: 4px;
          display: block;
          margin-bottom: 8px;
        }

        .section-title {
          font-family: var(--display);
          font-size: clamp(24px, 4vw, 42px);
          font-weight: 700;
          color: var(--green);
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        /* ─── Home ─── */
        .home-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: calc(100vh - 100px);
          max-width: 900px;
        }

        .boot-sequence {
          margin-bottom: 48px;
        }

        .typing-block { font-size: 13px; line-height: 2; }
        .terminal-line { display: flex; align-items: center; gap: 8px; color: var(--text); }
        .prompt { color: var(--green); font-weight: bold; }

        .hero { margin-bottom: 48px; }
        .hero-pre { animation: fadeIn 1s ease 1.5s both; }

        .hero-name {
          font-family: var(--display);
          font-size: clamp(56px, 10vw, 120px);
          font-weight: 900;
          line-height: 0.95;
          color: var(--green);
          letter-spacing: 8px;
          margin: 16px 0 24px;
        }

        .hero-role {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 40px;
        }

        .role-text {
          color: var(--text-dim);
          font-size: 13px;
          letter-spacing: 4px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--green);
          color: #000;
          border: none;
          padding: 12px 28px;
          font-family: var(--mono);
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, transform 0.1s;
          display: inline-block;
        }
        .btn-primary:hover { background: #fff; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: transparent;
          color: var(--green);
          border: 1px solid var(--green-dim);
          padding: 12px 28px;
          font-family: var(--mono);
          font-size: 13px;
          letter-spacing: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          display: inline-block;
        }
        .btn-secondary:hover { background: var(--green-mid); border-color: var(--green); }

        /* ─── Glitch ─── */
        .glitch {
          position: relative;
          display: inline-block;
          color: var(--green);
        }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          color: var(--green);
        }
        .glitch::before {
          animation: glitch1 3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          transform: translate(-2px);
          opacity: 0.8;
          color: #00ffff;
        }
        .glitch::after {
          animation: glitch2 3s infinite;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          transform: translate(2px);
          opacity: 0.8;
          color: #ff003c;
        }

        @keyframes glitch1 {
          0%,90%,100% { transform: translate(-2px); opacity: 0; }
          92% { transform: translate(3px); opacity: 0.8; }
          94% { transform: translate(-3px); opacity: 0.8; }
          96% { transform: translate(0); opacity: 0; }
        }
        @keyframes glitch2 {
          0%,88%,100% { transform: translate(2px); opacity: 0; }
          90% { transform: translate(-4px); opacity: 0.8; }
          93% { transform: translate(4px); opacity: 0.8; }
          95% { transform: translate(0); opacity: 0; }
        }

        /* ─── Cursor ─── */
        .cursor {
          display: inline-block;
          color: var(--green);
          animation: blink 1s step-end infinite;
          margin-left: 2px;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        /* ─── About ─── */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
          align-items: start;
        }

        .about-terminal {
          border: 1px solid var(--green-dark);
          background: rgba(0,10,0,0.7);
        }

        .terminal-bar {
          background: #0a1a0a;
          border-bottom: 1px solid var(--green-dark);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .t-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

        .terminal-body {
          padding: 20px 24px;
          font-size: 14px;
          line-height: 1.8;
        }

        .terminal-output {
          color: var(--text-dim);
          padding: 8px 0 16px 20px;
          font-size: 13px;
        }
        .terminal-output p { margin-bottom: 8px; }

        .about-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 240px;
        }

        .stat-card {
          border: 1px solid var(--green-dark);
          background: rgba(0,20,0,0.4);
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          color: var(--text-dim);
          font-size: 10px;
          letter-spacing: 3px;
        }

        .stat-value {
          color: var(--green);
          font-size: 14px;
          font-family: var(--display);
        }

        /* ─── Projects ─── */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .project-card {
          border: 1px solid var(--green-dark);
          background: rgba(0,10,0,0.5);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.2s, background 0.2s;
          color: var(--text);
        }
        .project-card.hovered {
          border-color: var(--green);
          background: rgba(0,30,0,0.7);
        }

        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-name { font-size: 18px; }
        .card-desc { font-size: 13px; color: var(--text-dim); line-height: 1.7; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .card-cta { margin-top: 4px; }

        .tag {
          background: var(--green-dark);
          color: var(--green-dim);
          border: 1px solid var(--green-dark);
          padding: 2px 10px;
          font-size: 11px;
          letter-spacing: 1px;
        }

        /* ─── Skills ─── */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }

        .skill-group { display: flex; flex-direction: column; gap: 16px; }

        .skill-category {
          color: var(--green);
          font-size: 11px;
          letter-spacing: 4px;
          border-bottom: 1px solid var(--green-dark);
          padding-bottom: 8px;
        }

        .skill-items { display: flex; flex-direction: column; gap: 8px; }

        .skill-pill {
          color: var(--text-dim);
          font-size: 13px;
          padding: 6px 0;
          border-left: 2px solid var(--green-dark);
          padding-left: 12px;
          transition: color 0.2s, border-color 0.2s;
          cursor: default;
        }
        .skill-pill:hover { color: var(--green); border-left-color: var(--green); }

        /* ─── Contact ─── */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 48px;
          align-items: start;
        }

        .contact-form { display: flex; flex-direction: column; gap: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 8px; }

        .form-label {
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--text-dim);
        }

        .form-input {
          background: rgba(0,10,0,0.8);
          border: 1px solid var(--green-dark);
          color: var(--green);
          font-family: var(--mono);
          font-size: 14px;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s;
          resize: none;
        }
        .form-input:focus { border-color: var(--green); }
        .form-input::placeholder { color: var(--text-dim); }
        .form-textarea { min-height: 120px; }

        .contact-links { display: flex; flex-direction: column; gap: 16px; }

        .contact-link-header {
          color: var(--text-dim);
          font-size: 11px;
          letter-spacing: 3px;
          margin-bottom: 8px;
        }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--green-dark);
          background: rgba(0,10,0,0.4);
          text-decoration: none;
          color: var(--text);
          transition: border-color 0.2s, background 0.2s;
        }
        .contact-link:hover { border-color: var(--green); background: rgba(0,30,0,0.6); }

        .contact-icon { color: var(--green); font-size: 18px; width: 24px; text-align: center; }
        .contact-link-label { font-size: 11px; letter-spacing: 3px; color: var(--text-dim); margin-bottom: 2px; }
        .contact-link-handle { font-size: 13px; color: var(--green); }

        .sent-msg { padding: 48px 0; }

        /* ─── Footer ─── */
        .footer {
          display: flex;
          justify-content: space-between;
          padding: 24px 80px;
          border-top: 1px solid var(--green-dark);
          position: relative;
          z-index: 2;
        }

        /* ─── Hex decoration ─── */
        .hex-grid {
          position: absolute;
          right: 80px;
          bottom: 60px;
          display: flex;
          flex-wrap: wrap;
          width: 160px;
          gap: 8px;
          opacity: 0.15;
        }
        .hex-char {
          color: var(--green);
          font-size: 18px;
          animation: flicker 4s infinite;
        }
        @keyframes flicker {
          0%,100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .section { padding: 100px 24px 60px; }
          .about-grid { grid-template-columns: 1fr; }
          .contact-grid { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 8px; padding: 24px; }
          .nav { padding: 0 16px; }
          .nav-label { display: none; }
          .hero-name { font-size: clamp(48px, 18vw, 80px); }
        }
      `}</style>

      <MatrixRain />
      <ScanLines />
      <Nav active={activeNav} onNav={handleNav} />

      <main>
        <HomeSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}



