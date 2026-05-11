import React from "react";

export default function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -20 120 150"
      fill="currentColor"
      {...props}
    >
      <path d="M 10 -10 L 30 -10 L 30 70 L 50 70 L 50 45 A 35 35 0 0 1 85 15 L 75 25 A 20 20 0 0 0 70 45 L 70 90 A 10 10 0 0 0 90 90 L 90 25 L 110 5 L 110 90 A 30 30 0 0 1 50 90 L 10 90 Z" />
    </svg>
  );
}
