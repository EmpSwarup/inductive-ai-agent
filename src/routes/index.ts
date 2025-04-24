import { IRoute } from "./types";
import LandingPage from "@/pages/LandingPage";
import ChatPage from "@/pages/ChatPage";

export const publicRoutes: IRoute[] = [
  {
    id: "landing",
    path: "/",
    name: "Landing",
    component: LandingPage,
  },
  {
    id: "chat",
    path: "/chat",
    name: "Chat",
    component: ChatPage,
  },
];

export const allRoutes = [...publicRoutes];