
import { ReactNode } from "react";
import BottomNavbar from "./BottomNavbar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container max-w-lg mx-auto px-4 pb-20">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
};

export default MainLayout;
