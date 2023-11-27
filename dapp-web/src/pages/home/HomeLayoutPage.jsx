import { Outlet } from "react-router-dom";
import { LandingPageNavbar } from "./LandingPage";

export function HomeLayoutPage() {
  return (
    <>
      <LandingPageNavbar />
      <Outlet />
    </>
  );
}
