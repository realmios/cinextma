import { tmdb } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { BiSearchAlt2, BiSolidSearchAlt2 } from "react-icons/bi";
import { GoHomeFill, GoHome } from "react-icons/go";
import { HiComputerDesktop } from "react-icons/hi2";
import { IoIosSunny } from "react-icons/io";
import {
  IoCompass,
  IoCompassOutline,
  IoInformationCircle,
  IoInformationCircleOutline,
  IoMoon,
} from "react-icons/io5";
import { TbFolder, TbFolderFilled } from "react-icons/tb";

export const siteConfig: SiteConfigType = {
  name: "Cinextma",
  description: "Lựa chọn duy nhất của bạn cho website xem phim và chương trình TV miễn phí.",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "Trang chủ",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Khám phá",
      href: "/discover",
      icon: <IoCompassOutline className="size-full" />,
      activeIcon: <IoCompass className="size-full" />,
    },
    {
      label: "Tìm kiếm",
      href: "/search",
      icon: <BiSearchAlt2 className="size-full" />,
      activeIcon: <BiSolidSearchAlt2 className="size-full" />,
    },
    {
      label: "Thư viện",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
    {
      label: "Giới thiệu",
      href: "/about",
      icon: <IoInformationCircleOutline className="size-full" />,
      activeIcon: <IoInformationCircle className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Phim thịnh hành hôm nay",
        query: () => tmdb.trending.trending("movie", "day"),
        param: "todayTrending",
      },
      {
        name: "Phim thịnh hành tuần này",
        query: () => tmdb.trending.trending("movie", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Phim phổ biến",
        query: () => tmdb.movies.popular(),
        param: "popular",
      },
      {
        name: "Phim đang chiếu",
        query: () => tmdb.movies.nowPlaying(),
        param: "nowPlaying",
      },
      {
        name: "Phim sắp chiếu",
        query: () => tmdb.movies.upcoming(),
        param: "upcoming",
      },
      {
        name: "Phim đánh giá cao",
        query: () => tmdb.movies.topRated(),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "TV thịnh hành hôm nay",
        query: () => tmdb.trending.trending("tv", "day"),
        param: "todayTrending",
      },
      {
        name: "TV thịnh hành tuần này",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Chương trình TV phổ biến",
        // @ts-expect-error
        query: () => tmdb.tvShows.popular(),
        param: "popular",
      },
      {
        name: "Chương trình đang phát sóng",
        // @ts-expect-error
        query: () => tmdb.tvShows.onTheAir(),
        param: "onTheAir",
      },
      {
        name: "Chương trình TV đánh giá cao",
        // @ts-expect-error
        query: () => tmdb.tvShows.topRated(),
        param: "topRated",
      },
    ],
  },
  socials: {
    github: "https://www.facebook.com/ngochaidz",
  },
};

export type SiteConfig = typeof siteConfig;