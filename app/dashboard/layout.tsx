import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import { AutomationBackground } from "./_components/AutomationBackground";
import { UserButton } from "@clerk/nextjs";

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* Global automation background */}
            <AutomationBackground />
            
            <AppSidebar />
            
            {/* Main content area */}
            <main className="relative flex-1 flex flex-col min-h-screen">
                {/* Top bar with sidebar trigger */}
                <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6">
                    <SidebarTrigger className="hover:bg-muted/50 transition-colors rounded-lg p-2" />
                    <div className="flex-1" />
                    <UserButton/>
                </header>
                
                {/* Page content */}
                <div className="flex-1 p-4 md:p-6 lg:p-8">
                    {/* <AppHeader/> */}
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}

export default DashboardLayout;