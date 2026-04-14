export default function Sparkle({ size = 12, color = "#DA6FD8", style = {} }) {
  const h = size / 2;
  const q = size / 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={style}
    >
      <path
        d={`M${h} 0 L${h + q * 0.4} ${h - q * 0.4} L${size} ${h} L${h + q * 0.4} ${h + q * 0.4} L${h} ${size} L${h - q * 0.4} ${h + q * 0.4} L0 ${h} L${h - q * 0.4} ${h - q * 0.4} Z`}
        fill={color}
      />
    </svg>
  );
}
