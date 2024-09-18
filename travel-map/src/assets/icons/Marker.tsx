interface MarkerIconProps {
  scale: number;
  className: string;
}

export default function MarkerIcon({ scale, className }: MarkerIconProps) {
  return (
    <g
      className={`${className} marker-icon`}
      style={{ transform: `scale(${scale})` }}
    >
      <circle className="st0" cx="0" cy="-14.2" r="4.8" />
      <path
        d="M0-21.9c-4.2,0-7.7,3.4-7.7,7.7C-7.7-10,0,0,0,0s7.7-10,7.7-14.2C7.7-18.5,4.2-21.9,0-21.9L0-21.9z M0-10.4
		c-2.1,0-3.8-1.7-3.8-3.8c0-2.1,1.7-3.8,3.8-3.8c0,0,0,0,0,0c2.1,0,3.8,1.7,3.8,3.8C3.8-12.1,2.1-10.4,0-10.4z"
      />
    </g>
  );
}
