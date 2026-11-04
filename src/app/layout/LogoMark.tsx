interface LogoMarkProps {
  width?: number;
}

export function LogoMark({ width = 26 }: LogoMarkProps) {
  return (
    <svg
      width={width}
      height={(width * 18) / 26}
      viewBox="0 0 26 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 16.5V1.5L13 10 24.5 1.5v15"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 10.8l2.8 2.6L13 16l-2.8-2.6z" fill="currentColor" />
    </svg>
  );
}