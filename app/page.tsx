"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Globe, Mail, Menu, Moon, Sun, X, ExternalLink } from "lucide-react";
import PixelSwap from "./components/PixelSwap";
import ShapeWaves from "./components/ShapeWaves";
import WarpText from "./components/WarpText";
import TargetCursor from "./components/TargetCursor";
import Magnet from "./components/Magnet";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1 .11-.8.42-1.32.76-1.62-2.66-.3-5.46-1.33-5.46-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.3-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.61-5.48 5.91.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" fill="currentColor"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.94 8.5A1.56 1.56 0 1 1 6.92 5.4a1.56 1.56 0 0 1 .02 3.1ZM5.5 9.8h2.9V18H5.5V9.8Zm5.04 0h2.77v1.12h.04c.39-.73 1.35-1.5 2.78-1.5 2.96 0 3.51 1.95 3.51 4.48V18h-2.9v-16.8c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.43V18h-2.9V9.8Z" fill="currentColor"/>
    </svg>
  );
}

function SocialIconLink({ href, label, children, style }: { href: string; label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <a className="social-link" href={href} target="_blank" rel="noreferrer" aria-label={label} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      border: '1px solid #303030',
      borderRadius: 8,
      background: '#111',
      color: '#f1f1ef',
      transition: 'border-color .2s ease, transform .2s ease',
      ...style
    }}>
      {children}
    </a>
  );
}

const projects = [
  {
    title: "HarborFlow",
    description: "A Spring Boot microservices system for harbor operations, built around service separation, REST APIs, PostgreSQL, JWT authentication, API Gateway and service discovery.",
    tags: ["Java", "Spring Boot", "Microservices", "PostgreSQL", "JWT", "REST APIs"],
    link: "https://github.com/n4ku7/HarborFlow"
  },
  {
    title: "NetView",
    description: "A Linux/Ubuntu command-line network analysis and monitoring tool focused on inspecting network and system information directly from the terminal.",
    tags: ["Python", "Linux", "CLI", "Networking"],
    link: "https://github.com/n4ku7/NetView"
  },
  {
    title: "Linux Intercommunication System",
    description: "A Linux systems project exploring intercommunication and practical process/system interaction through a command-line workflow.",
    tags: ["Linux", "Systems", "CLI", "Python"],
    link: "https://github.com/n4ku7/Linux-Intercommunication-System"
  },
  {
    title: "Frontend & Custom Sites",
    description: "A collection of frontend deliverables and custom web interfaces built for practical applications, with responsive layouts and modern component-based development.",
    tags: ["React", "Next.js", "Tailwind CSS", "JavaScript"],
    link: "https://github.com/n4ku7/Frontend-Custom-Sites"
  }
];

const experience = [
  {
    role: "AI/ML QA Summer Intern",
    company: "MidCentury",
    period: "Summer Internship",
    bullets: [
      "Contributed to AI/ML quality-assurance workflows, supporting evaluation, testing and validation of AI/ML-related systems."
    ],
    tags: ["AI/ML", "QA", "Testing"]
  },
  {
    role: "Freelance Developer",
    company: "Independent / Collaborative",
    period: "Freelance",
    bullets: [
      "Worked with developers on IT management, routine technical repairs, troubleshooting and general development/support work."
    ],
    tags: ["IT Management", "Troubleshooting", "Development"]
  }
];

const skills = {
  Languages: ["Python", "JavaScript", "Java", "C", "SQL"],
  "AI / ML": ["RAG Pipelines", "AI Agents"],
  "Full-Stack": ["Next.js", "React", "Node.js", "Tailwind CSS", "PostgreSQL", "REST APIs"],
  Infrastructure: ["Docker", "Linux (Ubuntu)", "Git", "CI/CD"]
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [displayLightMode, setDisplayLightMode] = useState(false);

  const handleThemeChange = (nextLightMode: boolean) => {
    setIsLightMode(nextLightMode);
    window.setTimeout(() => {
      setDisplayLightMode(nextLightMode);
      document.documentElement.dataset.theme = nextLightMode ? "light" : "dark";
    }, 750);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="main-shell">
      <ShapeWaves
        color={displayLightMode ? '#5a574f' : '#929292'}
        backgroundColor={displayLightMode ? '#f5f4ef' : '#090909'}
        cellSize={20}
        speed={0.7}
        scale={0.85}
        fade={0.55}
        interactive
      />
      <TargetCursor
        targetSelector="a, button, .project"
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        cursorColor="#ffffff"
        cursorColorOnTarget={displayLightMode ? '#151515' : '#d8ff55'}
      />
      <header className="nav-wrap">
        <nav className="nav container">
          <a className="brand" href="#top" onClick={closeMenu} style={{ fontSize: 16, letterSpacing: '-0.08em' }}>no.</a>
          <div className={`nav-links ${menuOpen ? "open" : ""}`} style={{ fontSize: 12, letterSpacing: '0.01em' }}>
            <Magnet padding={14} magnetStrength={4}><a href="#experience" onClick={closeMenu}>experience</a></Magnet>
            <Magnet padding={14} magnetStrength={4}><a href="#projects" onClick={closeMenu}>projects</a></Magnet>
            <Magnet padding={14} magnetStrength={4}><a href="#skills" onClick={closeMenu}>skills</a></Magnet>
            <Magnet padding={14} magnetStrength={4}><a href="#contact" onClick={closeMenu}>contact</a></Magnet>
            <Magnet padding={14} magnetStrength={4}>
              <PixelSwap
                firstContent={<Sun size={14} />}
                secondContent={<Moon size={14} />}
                active={isLightMode}
                onActiveChange={handleThemeChange}
                trigger="click"
                pixelSize={7}
                gap={1}
                pixelRadius={18}
                duration={520}
                pixelDuration={260}
                pattern="random"
                className="theme-toggle pixel-theme-toggle"
                ariaLabel={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
              />
            </Magnet>
          </div>
          <button className="menu-button" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </nav>
      </header>

      <PixelSwap
        firstContent={<div className="theme-pixel theme-pixel-dark" />}
        secondContent={<div className="theme-pixel theme-pixel-light" />}
        active={isLightMode}
        trigger="manual"
        pixelSize={12}
        gap={0}
        pixelRadius={0}
        pixelSpin={0}
        pixelScale={0.35}
        duration={1500}
        pixelDuration={520}
        pattern="random"
        randomness={0}
        fade
        reveal
        className="theme-page-swap"
        ariaLabel="Theme transition"
      />

      <section id="top" className="hero container">
        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
          <p className="eyebrow" style={{ fontSize: 13 }}>hi there<span className="wave">👋</span>, I&apos;m</p>
          <WarpText
            text="Nakul Ojha"
            color={displayLightMode ? '#151515' : '#f1f1ef'}
            warpStrength={0.08}
            warpScale={1.7}
            speed={0.55}
            pointerInfluence={0.42}
            pointerStrength={0.38}
            refraction={0.018}
            ripple
            fontSize="clamp(40px, 7vw, 64px)"
            fontWeight={800}
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="-0.065em"
            lineHeight={0.98}
            textAlign="left"
            className="hero-name-warp"
          />
          <p className="hero-line" style={{ fontSize: 15 }}>Computer Science Undergraduate <span>·</span> AI/ML <span>·</span> Full-Stack Developer</p>
          <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
            <Magnet padding={10} magnetStrength={3}>
              <a className="button primary" href="https://cal.com/n4ku7" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'9px 13px', border:'1px solid #303030', borderRadius:8, fontSize:13, background:'#f1f1ef', color:'#080808' }}><CalendarDays size={15}/> Book a call</a>
            </Magnet>
            <Magnet padding={10} magnetStrength={3}>
              <a className="button" href="/Nakul_Ojha_Resume.pdf" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, padding:'9px 13px', border:'1px solid #303030', borderRadius:8, fontSize:13, background:'#111', color:'#f1f1ef' }}>Resume</a>
            </Magnet>
            <div className="social-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <SocialIconLink href="https://github.com/n4ku7" label="GitHub" style={{ display: 'inline-flex' }}>
                <GitHubIcon />
              </SocialIconLink>
              <SocialIconLink href="https://www.linkedin.com/in/n4ku7" label="LinkedIn" style={{ display: 'inline-flex' }}>
                <LinkedInIcon />
              </SocialIconLink>
              <SocialIconLink href="mailto:thenakulojha@gmail.com" label="Email" style={{ display: 'inline-flex' }}>
                <Mail size={16} />
              </SocialIconLink>
            </div>
          </div>
        </motion.div>
      </section>

      <style>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid #303030;
          border-radius: 999px;
          background: transparent;
          color: #a5a5a2;
          font-size: 11px;
          line-height: 0;
          cursor: pointer;
          align-self: center;
          transform: translateY(-3px);
          transition: color .2s ease, border-color .2s ease, background .2s ease;
        }
        .nav-links { align-items: center; }
        .theme-toggle svg { transform: translateY(-1px); }
        .theme-page-swap {
          position: fixed !important;
          inset: 0;
          z-index: 90;
          width: 100% !important;
          height: 100vh;
          aspect-ratio: auto !important;
          visibility: hidden;
          pointer-events: none;
        }
        .theme-page-swap[data-transitioning='true'] { visibility: visible; }
        .theme-page-swap > .pixel-swap__layer { visibility: hidden; }
        .theme-page-swap > .pixel-swap__grid { opacity: .5; }
        .theme-pixel { width: 100%; height: 100%; }
        .theme-pixel-dark { background: #090909; }
        .theme-pixel-light { background: #f5f4ef; }
        .main-shell { position: relative; z-index: 0; isolation: isolate; min-height: 100vh; }
        .main-shell > .hero,
        .main-shell > .section,
        .main-shell > .footer { position: relative; z-index: 1; }
        .theme-toggle:hover { color: #fff; border-color: #555; }
        html[data-theme="light"] body { background: #f5f4ef; color: #151515; }
        html[data-theme="light"] .nav-wrap { background: rgba(245,244,239,.88); border-bottom-color: rgba(0,0,0,.1); }
        html[data-theme="light"] .nav-links { color: #4d4b45; }
        html[data-theme="light"] .nav-links a:hover { color: #151515; }
        html[data-theme="light"] .theme-toggle { border-color: #aaa79e; color: #4d4b45; }
        html[data-theme="light"] .theme-toggle:hover { color: #151515; border-color: #99968b; background: #ebe9e1; }
        html[data-theme="light"] .eyebrow,
        html[data-theme="light"] .hero-line,
        html[data-theme="light"] .about-copy p,
        html[data-theme="light"] .section-intro,
        html[data-theme="light"] .bullets p,
        html[data-theme="light"] .contact-copy { color: #46443e; }
        html[data-theme="light"] .section { border-top-color: #d9d7cf; }
        html[data-theme="light"] .about-copy strong,
        html[data-theme="light"] .about-meta strong { color: #24231f; }
        html[data-theme="light"] .about-meta { border-color: #d1cfc7; }
        html[data-theme="light"] .button,
        html[data-theme="light"] .social-link { background: #ebe9e1 !important; color: #151515 !important; border-color: #aaa79e !important; }
        html[data-theme="light"] .button.primary { background: #151515 !important; color: #f5f4ef !important; border-color: #151515 !important; }
        html[data-theme="light"] .experience,
        html[data-theme="light"] .skill-row,
        html[data-theme="light"] .contact-links { border-color: #d1cfc7; }
        html[data-theme="light"] .project { background: #f5f4ef !important; color: #151515; border-color: #d1cfc7; }
        html[data-theme="light"] .project h3,
        html[data-theme="light"] .project p,
        html[data-theme="light"] .project .details,
        html[data-theme="light"] .project .project-top > a { color: #25231f; }
        html[data-theme="light"] .project p { color: #4b4942; }
        html[data-theme="light"] .project-number { color: #67645b; }
        html[data-theme="light"] .tag { background: #e8e6de; color: #45433d; border-color: #aaa79e; }
        html[data-theme="light"] .project p,
        html[data-theme="light"] .experience p,
        html[data-theme="light"] .footer { color: #55534c; }
        html[data-theme="light"] .skill-row h3,
        html[data-theme="light"] .skill-values span { color: #3f3d37; }
        html[data-theme="light"] .skill-values { color: #3f3d37; }
        html[data-theme="light"] .about-meta span,
        html[data-theme="light"] .exp-head > span,
        html[data-theme="light"] .project-number { color: #55534c; }
        html[data-theme="light"] .project a:hover,
        html[data-theme="light"] .contact-links a:hover { color: #151515; }
        html[data-theme="light"] .section-title,
        html[data-theme="light"] .experience h3,
        html[data-theme="light"] .project h3,
        html[data-theme="light"] .skill-row h3,
        html[data-theme="light"] .contact-card .section-title,
        html[data-theme="light"] .modal h2 { color: #151515; }
        html[data-theme="light"] .experience p,
        html[data-theme="light"] .experience .bullets p,
        html[data-theme="light"] .project p,
        html[data-theme="light"] .section-intro,
        html[data-theme="light"] .contact-card > p { color: #45433d; }
        html[data-theme="light"] .experience strong,
        html[data-theme="light"] .project strong { color: #24231f; }
        html[data-theme="light"] .exp-head > span,
        html[data-theme="light"] .project-number,
        html[data-theme="light"] .about-meta span { color: #5b5850; }
        html[data-theme="light"] .skill-values,
        html[data-theme="light"] .skill-values span { color: #3f3d37; }
        html[data-theme="light"] .contact-card,
        html[data-theme="light"] .modal { background: #f5f4ef; color: #151515; border-color: #d1cfc7; }
        html[data-theme="light"] .contact-card > p,
        html[data-theme="light"] .modal p { color: #45433d; }
        html[data-theme="light"] .contact-links a,
        html[data-theme="light"] .details { color: #292722; }
        html[data-theme="light"] .contact-links a svg,
        html[data-theme="light"] .details svg { color: #555149; }
        html[data-theme="light"] .footer { color: #4f4c44; }
        html[data-theme="light"] .footer a { color: #292722; }
        html[data-theme="light"] .modal-close { color: #292722; border-color: #aaa79e; }
        html[data-theme="light"] .modal .tag { color: #45433d; background: #e8e6de; }
        @media (max-width: 700px) {
          .theme-toggle { align-self: flex-start; }
        }
      `}</style>

      <section className="section container" id="about">
        <SectionTitle>about me.</SectionTitle>
        <div className="about-grid">
          <div className="about-copy">
            <p>• I&apos;m a Computer Science undergraduate at <strong>KL University, Vijayawada</strong>, currently in my pre-final year with a <strong>9.8 CGPA</strong>.</p>
            <p>• I work across <strong>AI/ML, full-stack development, Linux systems</strong> and developer infrastructure.</p>
            <p>• My current technical focus includes <strong>RAG pipelines, AI agents, modern web applications</strong> and practical Linux tooling.</p>
            <p>• I enjoy turning coursework and real-world requirements into working software that can actually be tested, deployed and used.</p>
          </div>
          <div className="about-meta">
            <div><span>university</span><strong>KL University</strong></div>
            <div><span>location</span><strong>Vijayawada, India</strong></div>
            <div><span>graduation</span><strong>2028</strong></div>
            <div><span>cgpa</span><strong>9.8 / 10</strong></div>
          </div>
        </div>
      </section>

      <section className="section container" id="experience">
        <SectionTitle>experience.</SectionTitle>
        <div className="timeline">
          {experience.map((item, i) => (
            <motion.article className="experience" key={item.role} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:"-80px"}} transition={{delay:i*.08}}>
              <div className="exp-head">
                <div>
                  <h3>{item.role}</h3>
                  <p>at <strong>{item.company}</strong></p>
                </div>
                <span>{item.period}</span>
              </div>
              <div className="bullets">{item.bullets.map(b => <p key={b}>• {b}</p>)}</div>
              <Tags tags={item.tags}/>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section container" id="projects">
        <SectionTitle>projects.</SectionTitle>
        <p className="section-intro">A selection of systems and applications I&apos;ve built across backend engineering, Linux tooling, AI/ML and frontend development.</p>
        <div className="project-list">
          {projects.map((project, i) => (
            <motion.article className="project" key={project.title} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:"-80px"}} transition={{delay:i*.06}}>
              <div className="project-top">
                <div>
                  <span className="project-number">0{i+1}</span>
                  <h3>{project.title}</h3>
                </div>
                <a href={project.link} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}><ExternalLink size={17}/></a>
              </div>
              <p>{project.description}</p>
              <Tags tags={project.tags}/>
              <button className="details" onClick={() => setActiveProject(i)}>
                view details <ArrowUpRight size={14}/>
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section container" id="skills">
        <SectionTitle>technical skills.</SectionTitle>
        <div className="skills">
          {Object.entries(skills).map(([group, values]) => (
            <div className="skill-row" key={group}>
              <h3>{group}:</h3>
              <div className="skill-values">{values.map(v => <span key={v}>{v}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" id="contact">
        <div className="contact-card">
          <SectionTitle>let&apos;s work together.</SectionTitle>
          <p>I&apos;m open to internships, engineering opportunities, freelance work and interesting technical projects.</p>
          <div className="contact-links">
            <a href="mailto:thenakulojha@gmail.com"><Mail size={16}/> thenakulojha@gmail.com</a>
            <a href="https://github.com/n4ku7" target="_blank" rel="noreferrer"><Globe size={16}/> github.com/n4ku7</a>
            <a href="https://www.linkedin.com/in/n4ku7" target="_blank" rel="noreferrer"><Globe size={16}/> linkedin.com/in/n4ku7</a>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <span>Nakul Ojha · 2026</span>
        <a href="#top">elevate to the top ↑</a>
      </footer>

      <AnimatePresence>
        {activeProject !== null && (
          <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setActiveProject(null)}>
            <motion.div className="modal" initial={{opacity:0,y:18,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12}} onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveProject(null)} aria-label="Close"><X size={18}/></button>
              <span className="project-number">0{activeProject + 1}</span>
              <h2>{projects[activeProject].title}</h2>
              <p>{projects[activeProject].description}</p>
              <Tags tags={projects[activeProject].tags}/>
              <a className="button primary modal-link" href={projects[activeProject].link} target="_blank" rel="noreferrer">Open GitHub <ArrowUpRight size={15}/></a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SectionTitle({children}: {children: React.ReactNode}) {
  return <h2 className="section-title">{children}</h2>;
}

function Tags({tags}: {tags: string[]}) {
  return <div className="tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>;
}
