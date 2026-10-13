export default function ItemArt({ kind = "other" }) {
  const art = {
    earbuds: (
      <>
        <path
          d="M99 106 Q99 90 117 90 H203 Q221 90 221 106 V146 Q221 176 191 176 H129 Q99 176 99 146Z"
          fill="#fdfbf4"
        />
        <path d="M100 119H220" stroke="#d3d0c4" strokeWidth="2" />
        <circle cx="160" cy="140" r="3" fill="#94a38c" />
        <g fill="#fffdf7" stroke="#d3d0c4" strokeWidth="2">
          <path d="M121 61q0-15 13-15t13 15v32h-12V70q-14 3-14-9Z" />
          <path d="M173 61q0-15 13-15t13 15q0 12-14 9v23h-12Z" />
        </g>
      </>
    ),
    bottle: (
      <g transform="rotate(-12 160 115)">
        <rect x="135" y="47" width="50" height="24" rx="7" fill="#294665" />
        <rect x="129" y="67" width="62" height="126" rx="17" fill="#6c9caf" />
        <path
          d="M140 80v91"
          stroke="#a1c3ce"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="142" y="119" width="36" height="28" rx="3" fill="#f1eaca" />
        <path
          d="m152 136 8-10 8 10"
          stroke="#486475"
          strokeWidth="2"
          fill="none"
        />
      </g>
    ),
    keys: (
      <g transform="rotate(-24 160 120)">
        <circle
          cx="151"
          cy="88"
          r="26"
          fill="none"
          stroke="#a6a9aa"
          strokeWidth="7"
        />
        <path
          d="M136 108v72h12v-12h10v-13h-10v-47"
          fill="#c4c8cb"
          stroke="#92989b"
          strokeWidth="2"
        />
        <path d="m164 107 20 66 12-4-4-12 9-3-4-12-9 3-12-41" fill="#d0b777" />
        <rect x="103" y="111" width="25" height="76" rx="8" fill="#517965" />
        <path d="M115 119v59" stroke="#8da590" strokeWidth="2" />
      </g>
    ),
    wallet: (
      <g transform="rotate(-12 160 120)">
        <rect x="91" y="74" width="138" height="97" rx="13" fill="#3c3d3b" />
        <rect
          x="98"
          y="82"
          width="123"
          height="81"
          rx="8"
          fill="none"
          stroke="#777870"
          strokeDasharray="3 3"
        />
        <path d="M182 107h49v34h-49q-15-17 0-34" fill="#4c4d49" />
        <circle cx="193" cy="124" r="4" fill="#a9a598" />
      </g>
    ),
    umbrella: (
      <g transform="rotate(30 160 120)">
        <path d="M146 51q14-9 28 0l7 116h-42Z" fill="#3b526d" />
        <path d="M157 49v115m12-115 3 115" stroke="#718195" strokeWidth="2" />
        <rect x="140" y="113" width="40" height="12" rx="3" fill="#23384e" />
        <path
          d="M160 167v20q0 19 17 15q10-2 9-15"
          fill="none"
          stroke="#313a45"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    ),
    book: (
      <g transform="rotate(-13 160 120)">
        <rect x="112" y="54" width="105" height="140" rx="5" fill="#927357" />
        <rect x="105" y="50" width="105" height="140" rx="5" fill="#c3a680" />
        <path d="M117 50v140" stroke="#8d7659" strokeWidth="3" />
        <path d="M192 50v140" stroke="#545d55" strokeWidth="5" />
        <rect x="135" y="82" width="42" height="28" fill="#e7d8b9" />
        <path d="M143 93h26m-26 7h19" stroke="#9c896c" />
      </g>
    ),
    clothing: (
      <path
        d="m125 65 20-12h30l20 12 43 45-27 24-18-24v77h-67v-77l-18 24-27-24Z"
        fill="#a4adb4"
        stroke="#7d8892"
        strokeWidth="3"
      />
    ),
    card: (
      <>
        <rect x="88" y="77" width="145" height="91" rx="8" fill="#f9faf5" />
        <path d="M89 98h143" stroke="#69866c" strokeWidth="14" />
        <circle cx="119" cy="129" r="12" fill="#cbd9ce" />
        <path
          d="M145 124h63m-63 13h46m-46 13h54"
          stroke="#a9b6ac"
          strokeWidth="4"
        />
      </>
    ),
    other: (
      <>
        <rect x="116" y="72" width="90" height="105" rx="12" fill="#d4c9b5" />
        <path
          d="M143 102q3-21 22-16t10 28l-13 13v8"
          fill="none"
          stroke="#8b806d"
          strokeWidth="6"
        />
        <circle cx="162" cy="150" r="3" fill="#8b806d" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label="示範物品插畫">
      <ellipse cx="160" cy="199" rx="66" ry="9" fill="#233d72" opacity=".07" />
      {art[kind] || art.other}
    </svg>
  );
}
