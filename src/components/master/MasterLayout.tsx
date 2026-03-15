import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import MasterSidebar from "./MasterSidebar";
import MasterTopbar from "./MasterTopbar";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MasterSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MasterTopbar />
          <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
