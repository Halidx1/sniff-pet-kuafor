// Illustrations for the homepage grooming story (ADR-022): original flat drawings in the
// brand colours (navy #07152b, cream #f5e1ce, caramel #c98a4b, beige #e9d8c6). Not photos,
// not AI images and not the logo. Class names (gs-*) are animated by groom-story.css; the
// spiky "messy fur" paths are generated zigzags; the CSS only hides them, never reshapes them.
export function GroomScene() {
  return (
    <svg viewBox="50 110 720 350" className="gs-scene" aria-hidden="true" focusable="false">
      <g className="gs-camera">
        <path
          d="M120 120C220 30 420 40 560 70C700 100 790 190 760 300C730 410 560 450 400 446C230 442 60 420 40 310C24 220 60 170 120 120Z"
          fill="#e9d8c6"
          opacity="0.55"
        />
        <g className="gs-dog">
          <ellipse cx="270" cy="440" rx="180" ry="14" fill="#e9d8c6" />
          <path
            d="M152 300C116 278 96 236 114 196C122 178 146 180 142 198"
            fill="none"
            stroke="#07152b"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <rect x="160" y="330" width="34" height="100" rx="17.0" fill="#07152b" />
          <ellipse cx="182.0" cy="426" rx="24.0" ry="13" fill="#07152b" />
          <path
            d="M176.0 419v7M188.0 419v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="282" y="330" width="34" height="100" rx="17.0" fill="#07152b" />
          <ellipse cx="304.0" cy="426" rx="24.0" ry="13" fill="#07152b" />
          <path
            d="M298.0 419v7M310.0 419v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="132" y="258" width="218" height="112" rx="56" fill="#07152b" />
          <path
            className="gs-strand gs-strand-1"
            d="M150.0 352.0 L150.0 362.0 L158.7 388.6 L166.0 362.0 L167.7 395.8 L182.0 362.0 L182.0 352.0 Z"
            fill="#07152b"
          />
          <path
            className="gs-strand gs-strand-2"
            d="M182.0 352.0 L182.0 362.0 L178.4 395.3 L198.0 362.0 L198.8 387.1 L214.0 362.0 L214.0 352.0 Z"
            fill="#07152b"
          />
          <path
            className="gs-strand gs-strand-3"
            d="M214.0 352.0 L214.0 362.0 L215.3 401.3 L230.0 362.0 L242.5 397.5 L246.0 362.0 L246.0 352.0 Z"
            fill="#07152b"
          />
          <path
            className="gs-strand gs-strand-4"
            d="M246.0 352.0 L246.0 362.0 L262.4 393.2 L262.0 362.0 L262.3 401.9 L278.0 362.0 L278.0 352.0 Z"
            fill="#07152b"
          />
          <path
            className="gs-strand gs-strand-5"
            d="M278.0 352.0 L278.0 362.0 L279.5 388.0 L294.0 362.0 L306.3 389.2 L310.0 362.0 L310.0 352.0 Z"
            fill="#07152b"
          />
          <path
            className="gs-strand gs-strand-6"
            d="M310.0 352.0 L310.0 362.0 L320.1 392.8 L326.0 362.0 L325.1 386.9 L342.0 362.0 L342.0 352.0 Z"
            fill="#07152b"
          />
          <rect
            x="198"
            y="334"
            width="34"
            height="100"
            rx="17.0"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <ellipse
            cx="220.0"
            cy="430"
            rx="24.0"
            ry="13"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <path
            d="M214.0 423v7M226.0 423v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="318"
            y="334"
            width="34"
            height="100"
            rx="17.0"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <ellipse
            cx="340.0"
            cy="430"
            rx="24.0"
            ry="13"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <path
            d="M334.0 423v7M346.0 423v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="352" cy="214" r="56" fill="#07152b" />
          <rect x="376" y="210" width="80" height="50" rx="25" fill="#07152b" />
          <circle cx="455" cy="222" r="12" fill="#07152b" stroke="#f5e1ce" strokeWidth="4" />
          <path
            d="M357 200q11 9 22 0"
            fill="none"
            stroke="#f5e1ce"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M418 252q12 8 24-2"
            fill="none"
            stroke="#f5e1ce"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <ellipse
            cx="322"
            cy="214"
            rx="21"
            ry="42"
            transform="rotate(16 322 214)"
            fill="#c98a4b"
            stroke="#f5e1ce"
            strokeWidth="4"
          />
          <path
            d="M318 266L382 262L346 304Z"
            fill="#c98a4b"
            stroke="#c98a4b"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            className="gs-messy gs-dog-messy"
            d="M140.0 276.0 L140.0 262.0 L147.7 237.7 L158.2 262.0 L164.6 237.3 L176.4 262.0 L184.0 233.8 L194.5 262.0 L211.3 236.3 L212.7 262.0 L233.1 239.7 L230.9 262.0 L240.5 237.8 L249.1 262.0 L246.0 236.8 L267.3 262.0 L279.5 232.9 L285.5 262.0 L302.2 239.3 L303.6 262.0 L313.0 235.5 L321.8 262.0 L334.1 230.3 L340.0 262.0 L340.0 276.0 Z M304.9 202.1 L273.8 195.4 L311.1 187.7 L352.0 214.0 Z M310.4 188.9 L293.5 158.1 L320.5 177.0 L352.0 214.0 Z M319.4 177.9 L315.5 137.1 L332.6 169.4 L352.0 214.0 Z M331.3 170.0 L328.2 143.0 L346.4 165.7 L352.0 214.0 Z M344.9 165.9 L338.0 134.8 L360.6 166.2 L352.0 214.0 Z M359.2 165.9 L365.7 137.8 L374.1 170.7 L352.0 214.0 Z M372.9 170.1 L382.2 148.1 L385.7 179.0 L352.0 214.0 Z M384.7 178.0 L407.9 154.2 L394.4 190.3 L352.0 214.0 Z M375.2 252.6 L376.3 272.7 L359.0 258.4 L352.0 214.0 Z M360.6 258.2 L363.6 282.6 L343.4 258.2 L352.0 214.0 Z M345.0 258.4 L328.4 275.1 L328.8 252.6 L352.0 214.0 Z M109.0 196.4 L94.4 182.5 L111.9 189.4 L118.0 196.0 Z M111.4 189.9 L105.5 172.0 L118.4 187.0 L118.0 196.0 Z M117.6 187.0 L125.7 174.0 L124.6 189.9 L118.0 196.0 Z M124.1 189.4 L144.6 190.3 L127.0 196.4 L118.0 196.0 Z"
            fill="#07152b"
          />
        </g>
        <g className="gs-cat">
          <ellipse cx="600" cy="440" rx="120" ry="13" fill="#e9d8c6" />
          <path
            d="M646 432C706 436 720 372 690 338C680 326 664 332 670 346"
            fill="none"
            stroke="#07152b"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path d="M522 440C506 360 532 288 592 284C652 288 676 360 660 440Z" fill="#07152b" />
          <rect
            x="546"
            y="362"
            width="30"
            height="78"
            rx="15.0"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <ellipse
            cx="566.0"
            cy="436"
            rx="22.0"
            ry="13"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <path
            d="M560.0 429v7M572.0 429v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="584"
            y="362"
            width="30"
            height="78"
            rx="15.0"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <ellipse
            cx="604.0"
            cy="436"
            rx="22.0"
            ry="13"
            fill="#07152b"
            stroke="#f5e1ce"
            strokeWidth="5"
          />
          <path
            d="M598.0 429v7M610.0 429v7"
            stroke="#f5e1ce"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M532 214L524 150L574 186Z"
            fill="#07152b"
            stroke="#07152b"
            strokeWidth="12"
            strokeLinejoin="round"
          />
          <path
            d="M598 184L640 146L632 210Z"
            fill="#07152b"
            stroke="#07152b"
            strokeWidth="12"
            strokeLinejoin="round"
          />
          <path
            d="M538 194L534 168L555 184Z"
            fill="#c98a4b"
            stroke="#c98a4b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M612 184L630 166L627 194Z"
            fill="#c98a4b"
            stroke="#c98a4b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="580" cy="240" r="58" fill="#07152b" />
          <path
            d="M541 238q9 8 18 0M586 238q9 8 18 0"
            fill="none"
            stroke="#f5e1ce"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M566 256h14l-7 8Z"
            fill="#c98a4b"
            stroke="#c98a4b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M560 266l-36-4M560 272l-34 6M588 266l36-4M588 272l34 6"
            stroke="#f5e1ce"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            className="gs-messy gs-cat-messy"
            d="M536.7 265.8 L516.0 275.9 L530.9 251.3 L580.0 240.0 Z M531.2 252.7 L507.1 255.1 L529.7 237.1 L580.0 240.0 Z M529.6 238.5 L504.1 222.9 L532.5 223.1 L580.0 240.0 Z M532.0 224.5 L507.9 220.0 L539.1 210.5 L580.0 240.0 Z M620.9 210.5 L646.7 201.7 L628.0 224.5 L580.0 240.0 Z M627.5 223.1 L658.9 239.7 L630.4 238.5 L580.0 240.0 Z M630.3 237.1 L660.1 248.4 L628.8 252.7 L580.0 240.0 Z M629.1 251.3 L651.6 274.8 L623.3 265.8 L580.0 240.0 Z M555.0 198.3 L567.6 175.5 L572.4 192.0 L580.0 240.0 Z M570.7 192.3 L590.8 168.1 L589.3 192.3 L580.0 240.0 Z M587.6 192.0 L601.9 170.5 L605.0 198.3 L580.0 240.0 Z M604.0 314.0 L604.0 300.0 L612.6 283.3 L619.0 300.0 L618.2 283.8 L634.0 300.0 L631.7 280.5 L649.0 300.0 L646.0 282.8 L664.0 300.0 L664.0 314.0 Z M530.0 314.0 L530.0 300.0 L540.3 287.1 L543.0 300.0 L547.2 285.9 L556.0 300.0 L556.0 314.0 Z M681.4 335.3 L672.7 323.3 L686.8 329.6 L690.0 338.0 Z M686.1 329.9 L692.9 317.4 L693.9 329.9 L690.0 338.0 Z M693.2 329.6 L710.2 318.4 L698.6 335.3 L690.0 338.0 Z"
            fill="#07152b"
          />
        </g>
        <g transform="translate(200 384) scale(1.3)">
          <g className="gs-scissors">
            <g className="gs-blade gs-blade-bottom">
              <path
                d="M0 3L90 10Q96 6 90 2L0 -4Z"
                fill="#f5e1ce"
                stroke="#07152b"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M0 0L-30 14" stroke="#07152b" strokeWidth="7" strokeLinecap="round" />
              <circle cx="-40" cy="20" r="13" fill="none" stroke="#c98a4b" strokeWidth="7" />
            </g>
            <g className="gs-blade gs-blade-top">
              <path
                d="M0 -3L90 -10Q96 -6 90 -2L0 4Z"
                fill="#f5e1ce"
                stroke="#07152b"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M0 0L-30 -14" stroke="#07152b" strokeWidth="7" strokeLinecap="round" />
              <circle cx="-40" cy="-20" r="13" fill="none" stroke="#c98a4b" strokeWidth="7" />
            </g>
            <circle cx="0" cy="0" r="5" fill="#07152b" />
          </g>
        </g>
        <g transform="translate(340 262)">
          <g className="gs-brush">
            <g transform="translate(-60 -44)">
              <rect
                x="96"
                y="-38"
                width="22"
                height="70"
                rx="11"
                transform="rotate(52 107 -3)"
                fill="#c98a4b"
                stroke="#07152b"
                strokeWidth="4"
              />
              <rect
                x="0"
                y="0"
                width="120"
                height="30"
                rx="15"
                fill="#c98a4b"
                stroke="#07152b"
                strokeWidth="4"
              />
              <path
                d="M12 32v12M24 32v12M36 32v12M48 32v12M60 32v12M72 32v12M84 32v12M96 32v12M108 32v12"
                stroke="#f5e1ce"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M12 32v12M24 32v12M36 32v12M48 32v12M60 32v12M72 32v12M84 32v12M96 32v12M108 32v12"
                stroke="#07152b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
        <path
          className="gs-sparkle gs-sparkle-1"
          d="M110 154Q112.88 167.12 126 170Q112.88 172.88 110 186Q107.12 172.88 94 170Q107.12 167.12 110 154Z"
          fill="#c98a4b"
        />
        <path
          className="gs-sparkle gs-sparkle-2"
          d="M470 118Q472.16 127.84 482 130Q472.16 132.16 470 142Q467.84 132.16 458 130Q467.84 127.84 470 118Z"
          fill="#c98a4b"
        />
        <path
          className="gs-sparkle gs-sparkle-3"
          d="M730 194Q732.88 207.12 746 210Q732.88 212.88 730 226Q727.12 212.88 714 210Q727.12 207.12 730 194Z"
          fill="#c98a4b"
        />
        <path
          className="gs-sparkle gs-sparkle-4"
          d="M480 320Q481.8 328.2 490 330Q481.8 331.8 480 340Q478.2 331.8 470 330Q478.2 328.2 480 320Z"
          fill="#c98a4b"
        />
        <path
          className="gs-sparkle gs-sparkle-5"
          d="M690 100Q691.8 108.2 700 110Q691.8 111.8 690 120Q688.2 111.8 680 110Q688.2 108.2 690 100Z"
          fill="#c98a4b"
        />
      </g>
    </svg>
  );
}
