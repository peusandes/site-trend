export default function Logo({ size = 32, showText = true }) {
  return (
    <svg
      width={showText ? size * 4.5 : size}
      height={size}
      viewBox="0 0 144 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* t */}
      <text x="0" y="26" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="28" fill="#DA6FD8">t</text>
      {/* r */}
      <text x="17" y="26" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="28" fill="#DA6FD8">r</text>
      {/* e */}
      <text x="31" y="26" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="28" fill="#DA6FD8">e</text>
      {/* n */}
      <text x="47" y="26" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="28" fill="#DA6FD8">n</text>
      {/* d (sem pingo) */}
      <text x="64" y="26" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="28" fill="#DA6FD8">d</text>
      {/* Sparkle de 4 pontas no lugar do pingo do d */}
      <g transform="translate(82, 3)">
        {/* Estrela 4 pontas */}
        <path
          d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z"
          fill="#DA6FD8"
        />
      </g>
    </svg>
  );
}
