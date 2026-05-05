"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import UserProfileButton from "../button/UserProfileButton";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import BrandLogo from "../other/BrandLogo";
import { getSearchSuggestions } from "@/actions/search";
import SearchInput from "../input/SearchInput";
import { ArrowUpLeft, Close, History, Movie, Search, TV } from "@/utils/icons";
import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@bprogress/next/app";
import { isEmpty } from "@/utils/helpers";
import { useState, useCallback, useRef, useEffect } from "react";
import { SEARCH_HISTORY_STORAGE_KEY } from "@/utils/constants";
import Highlight from "../other/Highlight";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

// Mini search với dropdown — dùng trong navbar
const NavbarSearch: React.FC = () => {
  const router = useRouter();
  const { mobile } = useBreakpoints();
  const { content } = useDiscoverFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [searchHistories, setSearchHistories] = useLocalStorage<string[]>({
    key: SEARCH_HISTORY_STORAGE_KEY,
    defaultValue: [],
  });

  const enableFetch = debouncedSearchQuery.length > 2 && focused;
  const { data, isFetching } = useQuery({
    enabled: enableFetch,
    queryKey: ["navbar-search-suggestions", debouncedSearchQuery],
    queryFn: async () => await getSearchSuggestions(debouncedSearchQuery),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const showSuggestions = enableFetch && !isFetching && !isEmpty(data?.data);
  const showHistory = focused && !showSuggestions && !isEmpty(searchHistories) && isEmpty(searchQuery);
  const showDropdown = showSuggestions || showHistory;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty(searchQuery)) return;
    if (!searchHistories.includes(searchQuery)) {
      const newHistories = [searchQuery, ...searchHistories].slice(0, 5);
      setSearchHistories(newHistories);
    }
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&content=${content}`);
    setFocused(false);
  }, [searchQuery, searchHistories, content]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <SearchInput
          placeholder={`Tìm kiếm ${content === "movie" ? "phim" : "TV series"}...`}
          isLoading={isFetching}
          value={searchQuery}
          onValueChange={(val) => setSearchQuery(val)}
          onFocus={() => setFocused(true)}
          onClear={!isEmpty(searchQuery) ? () => setSearchQuery("") : undefined}
        />
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 z-[999] w-full"
          >
            <Listbox
              variant="flat"
              aria-label="Gợi ý tìm kiếm"
              className="bg-content1 rounded-medium w-full shadow-2xl"
              classNames={{ list: "max-h-[15rem] overflow-y-auto" }}
            >
              <>
                {showHistory && searchHistories.map((history, index) => (
                  <ListboxItem
                    key={`history-${index}`}
                    className="text-start"
                    startContent={<History />}
                    endContent={
                      <Button isIconOnly variant="light" size="sm" className="size-6"
                        onPress={() => setSearchHistories(searchHistories.filter(h => h !== history))}>
                        <Close size={24} />
                      </Button>
                    }
                    onPress={() => setSearchQuery(history)}
                  >
                    {history}
                  </ListboxItem>
                ))}
                {showSuggestions && (data?.data || []).map(({ id, title, type }, index) => (
                  <ListboxItem
                    key={`suggestion-${index}`}
                    className="text-start"
                    startContent={type === "movie"
                      ? <Movie className="text-primary" />
                      : <TV className="text-warning" />
                    }
                    endContent={
                      <Button isIconOnly variant="light" size="sm" className="size-6"
                        onPress={() => setSearchQuery(title)}>
                        <ArrowUpLeft size={20} />
                      </Button>
                    }
                    onPress={() => {
                      router.push(`/${type}/${id}`);
                      setFocused(false);
                    }}
                  >
                    <Highlight markType="bold" highlight={debouncedSearchQuery}>
                      {title}
                    </Highlight>
                  </ListboxItem>
                ))}
              </>
            </Listbox>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  const isSearchPage = pathName.startsWith("/search");

  if (auth || player) return null;

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className={cn("inset-0 h-min bg-transparent", {
        "bg-background": show,
      })}
    >
      {!show && (
        <div
          className="border-background bg-background absolute inset-0 h-full w-full border-b"
          style={{ opacity: opacity }}
        />
      )}
      <NavbarBrand>
        {show ? <BrandLogo /> : <BackButton href={tv ? "/?content=tv" : "/"} />}
      </NavbarBrand>

      {/* Search với dropdown — hiện ở tất cả trang trừ /search */}
      {show && !isSearchPage && (
        <NavbarContent className="hidden w-full max-w-lg gap-2 md:flex" justify="center">
          <NavbarItem className="w-full">
            <NavbarSearch />
          </NavbarItem>
        </NavbarContent>
      )}

      {/* Trang /search giữ nguyên link cũ */}
      {show && isSearchPage && (
        <NavbarContent className="hidden w-full max-w-lg gap-2 md:flex" justify="center">
          <NavbarItem className="w-full">
            <Link href="/search" className="w-full">
              <SearchInput
                className="pointer-events-none"
                placeholder="Tìm kiếm phim yêu thích..."
              />
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        <NavbarItem className="flex gap-1">
          <ThemeSwitchDropdown />
          <FullscreenToggleButton />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;