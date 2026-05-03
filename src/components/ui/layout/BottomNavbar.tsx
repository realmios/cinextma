"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/chip";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        {/* Khoảng trống bù để nội dung cuối trang không bị đè */}
        <div className="h-20 pb-[env(safe-area-inset-bottom)] md:hidden" />
        
        <div className="fixed bottom-0 left-0 right-0 z-[100] block h-fit w-full border-t border-secondary-background bg-background/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
          <div className="mx-auto grid h-full max-w-lg grid-cols-5 px-2">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center text-foreground transition-opacity active:opacity-60"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: "h-8 min-w-12 py-[2px] transition-all",
                        content: "flex items-center justify-center",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                    <p className={clsx("text-[10px] uppercase tracking-tighter", { "font-bold text-primary": isActive })}>
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
