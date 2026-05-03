"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import Link from "next/link"; // ← đổi từ @heroui/link sang next/link
import { usePathname } from "next/navigation";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        <div className="h-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden" />

        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-secondary-background bg-background md:hidden">
          <div className="mx-auto flex h-full max-w-lg justify-around pt-2 pb-[env(safe-area-inset-bottom,8px)]">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center text-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div
                      className={clsx(
                        "flex h-7 w-11 items-center justify-center rounded-full transition-colors duration-200",
                        { "bg-primary/20": isActive }
                      )}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </div>
                    <p
                      className={clsx("text-[10px] transition-colors duration-200", {
                        "font-bold text-primary": isActive,
                        "text-default-500": !isActive,
                      })}
                    >
                      {item.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default BottomNavbar;