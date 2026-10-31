/** Hand-built illustration: a hostel study room at dusk. Decorative only. */
export function Scene() {
  const chalk = { fill: "#f0e6d0", opacity: 0.5 } as const;
  const line = { stroke: "#f0e6d0", strokeWidth: 2, fill: "none", opacity: 0.5, strokeLinecap: "round" } as const;
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      style={{ fontFamily: "var(--font-hand), cursive" }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#222f55" />
          <stop offset=".5" stopColor="#6a5c7c" />
          <stop offset=".85" stopColor="#d58c63" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c24" />
          <stop offset="1" stopColor="#1a1411" />
        </linearGradient>
        <radialGradient id="lampglow">
          <stop offset="0" stopColor="#ffc46e" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffc46e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tubeglow">
          <stop offset="0" stopColor="#eaf2ff" stopOpacity=".5" />
          <stop offset="1" stopColor="#eaf2ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vig" cx=".5" cy=".5" r=".75">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".65" />
        </radialGradient>
        <linearGradient id="cone" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd08a" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
        </linearGradient>
        <filter id="wallnoise">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="5" seed="3" />
          <feColorMatrix values="0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .1  0 0 0 .9 -.25" />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
        <marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#f0e6d0" opacity=".6" />
        </marker>
      </defs>

      {/* wall, dado, floor */}
      <rect width="1600" height="900" fill="#b3a085" />
      <rect y="690" width="1600" height="130" fill="#5d7068" />
      <rect y="686" width="1600" height="8" fill="#3f4f49" />
      <rect y="820" width="1600" height="80" fill="url(#floor)" />
      <rect width="1600" height="900" filter="url(#wallnoise)" opacity=".55" />
      <g fill="#7d6a52" opacity=".28" filter="url(#rough)">
        <ellipse cx="300" cy="170" rx="160" ry="60" />
        <ellipse cx="900" cy="560" rx="120" ry="90" />
        <path d="M0 640 L120 600 L90 690 L0 690z" />
        <ellipse cx="640" cy="90" rx="200" ry="40" />
      </g>

      {/* the GATE wall */}
      <g filter="url(#rough)">
        <text x="78" y="628" fontSize="260" fontWeight="900" fontFamily="Impact, 'Arial Black', sans-serif" textLength="760" lengthAdjust="spacingAndGlyphs" fill="#5b4a38" opacity=".35">GATE</text>
        <text x="70" y="620" fontSize="260" fontWeight="900" fontFamily="Impact, 'Arial Black', sans-serif" textLength="760" lengthAdjust="spacingAndGlyphs" fill="#eadfc4" opacity=".62">GATE</text>
      </g>

      {/* handwritten subjects */}
      <g {...chalk} fontSize="40">
        <text x="120" y="250" transform="rotate(-6 120 250)" fontSize="46">DSA</text>
        <text x="330" y="210" transform="rotate(4 330 210)">OS</text>
        <text x="520" y="262" transform="rotate(-3 520 262)" fontSize="44">DBMS</text>
        <text x="760" y="230" transform="rotate(5 760 230)">CN</text>
        <text x="880" y="335" transform="rotate(-4 880 335)" fontSize="38">COA</text>
        <text x="300" y="395" transform="rotate(-2 300 395)" fontSize="34">TOC</text>
        <text x="90" y="395" transform="rotate(-2 90 395)" fontSize="34">Compiler Design</text>
        <text x="560" y="392" transform="rotate(2 560 392)" fontSize="34">Algorithms</text>
        <text x="715" y="470" transform="rotate(-8 715 470)" fontSize="30">O(n log n)</text>
        <text x="90" y="672" transform="rotate(-1 90 672)" fontSize="30" opacity=".7">T(n) = 2T(n/2) + n</text>
        <text x="760" y="640" transform="rotate(3 760 640)" fontSize="28">(0+1)*00</text>
        <text x="830" y="540" transform="rotate(-5 830 540)" fontSize="28">{"AB' + A'B"}</text>
        <text x="880" y="430" transform="rotate(4 880 430)" fontSize="28">ΣP(x) = 1</text>
      </g>
      {/* diagrams */}
      <g {...line}>
        {/* DFA */}
        <g transform="translate(730 120)">
          <circle cx="0" cy="40" r="18" /><circle cx="90" cy="40" r="18" /><circle cx="180" cy="40" r="18" /><circle cx="180" cy="40" r="13" />
          <path d="M-36 40 H-18" markerEnd="url(#ar)" /><path d="M18 40 H72" markerEnd="url(#ar)" /><path d="M108 40 H162" markerEnd="url(#ar)" />
          <path d="M80 24 C84 -6 100 -6 104 24" markerEnd="url(#ar)" />
        </g>
        {/* binary tree */}
        <g transform="translate(440 112)">
          <circle cx="40" cy="0" r="10" /><circle cx="10" cy="40" r="10" /><circle cx="70" cy="40" r="10" /><circle cx="-10" cy="80" r="10" /><circle cx="30" cy="80" r="10" />
          <path d="M34 8 L16 32 M46 8 L64 32 M4 48 L-6 72 M16 48 L26 72" />
        </g>
        {/* K-map */}
        <g transform="translate(880 150)">
          <rect width="120" height="120" />
          <path d="M30 0V120M60 0V120M90 0V120M0 30H120M0 60H120M0 90H120" opacity=".6" />
          <ellipse cx="45" cy="45" rx="40" ry="22" />
        </g>
        {/* plot */}
        <g transform="translate(620 290)">
          <path d="M0 -10 V70 H110" /><path d="M10 60 C40 60 50 0 100 5" />
        </g>
        {/* ER */}
        <g transform="translate(240 285)">
          <rect width="70" height="34" /><path d="M70 17 H100" /><path d="M100 17 L125 0 L150 17 L125 34z" /><path d="M150 17 H180" /><rect x="180" width="70" height="34" />
        </g>
        {/* NAND */}
        <g transform="translate(765 285)">
          <path d="M0 0 H22 A20 20 0 0 1 22 40 H0z" /><circle cx="48" cy="20" r="4" /><path d="M-18 10H0M-18 30H0M52 20H72" />
        </g>
        <path d="M120 270 C170 330 200 330 235 300" markerEnd="url(#ar)" />
        <path d="M620 270 C560 300 540 280 520 285" opacity=".4" />
      </g>
      {/* taped timetable */}
      <g transform="translate(575 120) rotate(-3)">
        <rect width="72" height="92" fill="#e9e0c8" opacity=".75" />
        <path d="M8 18H64M8 32H64M8 46H64M8 60H64M8 74H50" stroke="#6b5a45" strokeWidth="2" opacity=".6" />
        <rect x="22" y="-6" width="28" height="12" fill="#d9c58a" opacity=".7" />
      </g>

      {/* tube light, chains, conduit */}
      <ellipse cx="400" cy="100" rx="230" ry="60" fill="url(#tubeglow)" />
      <path d="M270 0 V90 M530 0 V90" stroke="#2a2420" strokeWidth="3" />
      <rect x="240" y="88" width="320" height="12" rx="6" fill="#f4f1e0" />
      <path d="M560 94 C700 140 900 60 990 230" stroke="#241d19" strokeWidth="5" fill="none" />
      <rect x="975" y="225" width="28" height="44" fill="#d8ceb4" stroke="#6b5a45" />
      <rect x="983" y="235" width="12" height="10" fill="#6b5a45" />

      {/* window: dusk outside */}
      <rect x="1040" y="130" width="480" height="535" fill="#2a2420" />
      <rect x="1060" y="150" width="440" height="490" fill="url(#sky)" />
      <ellipse cx="1330" cy="560" rx="170" ry="60" fill="#f0a870" opacity=".5" />
      <g fill="#3a3347">
        <rect x="1070" y="470" width="90" height="130" /><rect x="1170" y="500" width="70" height="100" /><rect x="1380" y="450" width="110" height="150" />
        <rect x="1250" y="520" width="110" height="80" />
      </g>
      <g fill="#ffd27a" opacity=".85">
        <rect x="1084" y="490" width="10" height="12" /><rect x="1110" y="520" width="10" height="12" /><rect x="1130" y="490" width="10" height="12" />
        <rect x="1400" y="470" width="10" height="12" /><rect x="1440" y="500" width="10" height="12" /><rect x="1400" y="540" width="10" height="12" />
        <rect x="1190" y="520" width="10" height="12" /><rect x="1272" y="540" width="10" height="12" />
      </g>
      <g fill="#2c3a30"><ellipse cx="1240" cy="590" rx="70" ry="40" /><ellipse cx="1480" cy="590" rx="50" ry="45" /></g>
      <rect x="1060" y="595" width="440" height="45" fill="#3a3028" />
      {/* bicycle + a small walker */}
      <g stroke="#17130f" strokeWidth="3" fill="none">
        <circle cx="1120" cy="618" r="14" /><circle cx="1158" cy="618" r="14" /><path d="M1120 618 L1135 596 L1158 618 M1135 596 H1148" />
      </g>
      <g fill="#17130f" stroke="#17130f" strokeWidth="3">
        <circle cx="1330" cy="590" r="5" /><rect x="1326" y="596" width="8" height="18" stroke="none" /><path d="M1328 614 L1324 630 M1332 614 L1337 630" />
      </g>
      <path d="M1170 150V640M1280 150V640M1390 150V640M1060 400H1500" stroke="#1e1a17" strokeWidth="8" />
      <rect x="1030" y="640" width="500" height="26" fill="#4b3d33" />
      {/* ceiling fan in front of the window */}
      <path d="M1250 0V62" stroke="#1d1815" strokeWidth="5" />
      <g transform="translate(1250 70) scale(1 .22)" fill="#2a2420" opacity=".92">
        <ellipse cx="95" cy="0" rx="90" ry="14" /><ellipse cx="-50" cy="82" rx="90" ry="14" transform="rotate(120)" /><ellipse cx="-50" cy="-82" rx="90" ry="14" transform="rotate(-120)" />
      </g>
      <ellipse cx="1250" cy="70" rx="20" ry="9" fill="#171310" />

      {/* student */}
      <g transform="translate(1170 0)">
        <rect x="-70" y="560" width="26" height="170" rx="6" fill="#2d2420" />
        <path d="M-38 580 Q-10 548 25 560 Q42 600 40 722 L-42 722 Z" fill="#56677f" />
        <rect x="14" y="540" width="16" height="26" fill="#8a5a3c" />
        <circle cx="28" cy="524" r="26" fill="#8a5a3c" />
        <path d="M0 522 a28 28 0 0 1 56 -2 c-8 -18 -40 -22 -56 2z" fill="#17120f" />
        <path d="M-2 520 q-6 18 8 30 q-4 -14 2 -28z" fill="#17120f" />
        <path d="M22 592 L52 660 L96 702" stroke="#56677f" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="102" cy="704" r="9" fill="#8a5a3c" /><path d="M104 704 L120 690" stroke="#17120f" strokeWidth="3" />
      </g>

      {/* desk */}
      <path d="M1000 712 H1590 V732 H1000z" fill="#4a3426" />
      <rect x="1000" y="732" width="590" height="30" fill="#3a281d" />
      <rect x="1030" y="762" width="22" height="140" fill="#2d2018" /><rect x="1548" y="762" width="22" height="140" fill="#2d2018" />
      <ellipse cx="1320" cy="905" rx="320" ry="30" fill="#000" opacity=".35" />
      {/* open notebook, sheets, calculator, laptop, chai */}
      <path d="M1250 712 L1262 696 H1296 V712z M1296 696 H1330 L1342 712 H1296z" fill="#ece5d2" />
      <path d="M1296 696V712" stroke="#9a8d73" />
      <rect x="1350" y="700" width="30" height="12" fill="#cfc8b6" transform="rotate(-8 1350 706)" />
      <rect x="1215" y="704" width="34" height="8" fill="#e5ddc6" transform="rotate(4 1215 708)" />
      <rect x="1392" y="702" width="30" height="10" fill="#2f2b27" />
      <rect x="1430" y="704" width="90" height="8" fill="#6b6f78" />
      <path d="M1440 704 L1450 630 H1530 L1520 704z" fill="#2b2f36" />
      <path d="M1450 630 H1530 L1527 650 H1447z" fill="#8fb4d6" opacity=".5" />
      <path d="M1566 712 V686 H1584 V712z" fill="#c8d3d6" opacity=".7" />

      {/* desk lamp + warm light */}
      <circle cx="1440" cy="600" r="260" fill="url(#lampglow)" style={{ mixBlendMode: "screen" }} />
      <path d="M1440 598 L1230 712 H1370z" fill="url(#cone)" style={{ mixBlendMode: "screen" }} />
      <ellipse cx="1560" cy="712" rx="24" ry="5" fill="#1f1a17" />
      <path d="M1560 710 L1540 650 L1472 596" stroke="#2a2420" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M1448 588 l34 -18 l14 28 -44 12z" fill="#c9a24a" />

      {/* finishing: vignette, grain */}
      <rect width="1600" height="900" fill="url(#vig)" />
      <rect width="1600" height="900" filter="url(#grain)" opacity=".5" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
