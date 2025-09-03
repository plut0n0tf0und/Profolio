import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      {...props}
      className={cn(props.className)}
    >
      <path
        fill="#e0dedc"
        d="m166.19 330.84 89.41-69.58 89.42 69.58-32.96 44.49H199.15l-32.96-44.49Z"
      />
      <path
        fill="#262524"
        d="m166.19 330.84 57.06-118.89h64.71l57.06 118.89-18.73 25.28-4.9-3.7-58.04-45.16-58.04 45.16-4.9 3.7-18.73-25.28Z"
      />
      <path
        fill="#453833"
        d="M255.6 156.46h.27l-57.33 119.5-32.35-67.4-44.2 46.46 32.96 44.48h33.91l48.01-37.35 18.73-25.28-57.06-118.89h57.06v.02Z"
      />
      <path
        fill="#b58258"
        d="M256.13 156.46h-.27l57.33 119.5 32.35-67.4 44.2 46.46-32.96 44.48h-33.91l-48.01-37.35-18.73-25.28 57.06-118.89h-57.06v.02Z"
      />
      <g filter="url(#a)">
        <path
          fill="#453833"
          d="m255.6 156.46-57.06 118.89L256.4 212.01h-.8Z"
        />
        <path
          fill="#b58258"
          d="m256.13 156.46 57.06 118.89L255.33 212.01h.8Z"
        />
        <path
          fill="#e0dedc"
          d="M166.19 330.84 255.6 261.26l89.42 69.58L255.6 422.34l-89.41-91.5Z"
        />
        <path
          fill="#262524"
          d="M255.6 156.46h.27l-57.33 119.5 57.06-118.89h.27l57.06 118.89 57.06-118.89h-64.71l-57.33 119.5 57.06-118.89h.27l-57.06 118.89L255.6 261.26l-32.35 67.4h-57.06l32.96-44.49h132.84l32.96 44.49h-57.06l-32.35-67.4L255.6 261.26l-89.41 69.58-18.73 25.28h205.88l-18.73-25.28-89.42-69.58Z"
        />
      </g>
      <path
        fill="#262524"
        d="m255.6 352.01-18.74-25.29h37.48l-18.74 25.29Z"
      />
      <path
        fill="#453833"
        d="M236.86 326.72h18.74l-9.37 12.65-9.37-12.65Z"
      />
      <path
        fill="#b58258"
        d="M255.6 339.37h18.74l-9.37-12.65-9.37 12.65Z"
      />
      <g filter="url(#b)">
        <ellipse
          cx="207.6"
          cy="289.43"
          fill="#fff"
          rx="12.49"
          ry="11.24"
        />
        <ellipse
          cx="303.6"
          cy="289.43"
          fill="#fff"
          rx="12.49"
          ry="11.24"
        />
      </g>
      <ellipse cx="207.6" cy="289.43" fill="#262524" rx="7.49" ry="6.87" />
      <ellipse cx="303.6" cy="289.43" fill="#262524" rx="7.49" ry="6.87" />
      <defs>
        <filter
          id="a"
          width="320.62"
          height="305.88"
          x="121.99"
          y="136.46"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20" />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1_25" />
        </filter>
        <filter
          id="b"
          width="135.98"
          height="62.48"
          x="187.61"
          y="268.19"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            in="SourceAlpha"
            radius="10"
            operator="dilate"
            result="effect1_innerShadow_1_25"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite
            in2="hardAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
          />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="shape" result="effect1_innerShadow_1_25" />
        </filter>
      </defs>
    </svg>
  );
}
