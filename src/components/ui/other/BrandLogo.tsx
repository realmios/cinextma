"use client";

import Link from "next/link";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const AnimeStarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="256" cy="256" r="256" fill="#F2BC3E" />
    <path
      fill="#ECC984"
      d="M256,0C114.613,0,0,114.609,0,256c0,82.805,39.349,156.38,100.329,203.174L459.173,100.33C412.38,39.349,338.804,0,256,0z"
    />
    <path
      fill="#F2F2F2"
      d="M199.047,30.816C117.969,51.35,53.872,114.451,31.897,194.949c-1.92,7.029,2.225,14.294,9.257,16.206c7.029,1.921,14.287-2.228,16.207-9.257C76.767,130.644,133.76,74.535,205.516,56.402c7.072-1.792,11.349-8.971,9.558-16.028C213.291,33.302,206.111,29.024,199.047,30.816z"
    />
    <polygon
      fill="#E43E10"
      points="256,177.688 278.34,233.517 338.331,237.514 292.139,276.012 306.885,334.297 256,302.271 205.115,334.297 219.853,276.012 173.661,237.514 233.66,233.517"
    />
  </svg>
);

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = false, className }) => {
  const { content } = useDiscoverFilters();

  return (
    <Link href="/" className="group">
      <span
        className={cn(
          "flex items-center bg-linear-to-r from-transparent from-80% via-white to-transparent bg-size-[200%_100%] bg-clip-text bg-position-[40%] text-2xl font-semibold text-foreground/60 md:text-3xl",
          "tracking-widest transition-[letter-spacing] group-hover:tracking-[0.2em]",
          {
            "animate-shine": animate,
            "text-foreground": !animate,
          },
          Saira.className,
          className,
        )}
      >
        SUUTAM
        <span className="inline-flex items-center mx-1">
          <AnimeStarIcon
            className={cn(
              "size-7 md:size-8 transition-all duration-500",
              "group-hover:rotate-[360deg] group-hover:scale-125",
            )}
          />
        </span>
        ANIME
      </span>
    </Link>
  );
};

export default BrandLogo;