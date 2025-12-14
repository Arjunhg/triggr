'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image";
import Link from "next/link";
import { Headphones, LayoutDashboard, Zap } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button";
import { cubicBezier, motion } from "framer-motion";
import { AutomationPattern, StatusPulse } from "./AutomationBackground";

const MenuOptions = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'AI Agents',
    url: '/dashboard/ai-agents',
    icon: Headphones
  },
  // {
  //   title: 'Data',
  //   url: '/data',
  //   icon: Database
  // },
  // {
  //   title: 'Pricing',
  //   url: '/pricing',
  //   icon: WalletCards
  // },
  // {
  //   title: 'Profile',
  //   url: '/profile',
  //   icon: User2Icon
  // }
]

// Animation variants
const sidebarItemVariants = {
  initial: { x: -10, opacity: 0 },
  animate: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  }),
  hover: {
    x: 4,
    transition: { duration: 0.2 }
  }
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border/50 bg-sidebar/80 backdrop-blur-xl">
      <AutomationPattern className="opacity-30" />
      
      {/* Logo Section */}
      <div className="relative z-10 flex gap-3 items-center p-4">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          <Image src={'/logo.png'} alt="logo" width={56} height={56} className="relative z-10" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <h2 className="font-semibold text-lg tracking-tight text-gradient">Triggr</h2>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Automation</span>
        </motion.div>
      </div>
      
      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1 px-2">
            {MenuOptions.map((menu, index) => {
              const isActive = pathname === menu.url;
              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={sidebarItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <SidebarMenuItem className="list-none">
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={isActive}
                      className={`
                        relative group transition-all duration-300
                        ${isActive 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'hover:bg-muted/50 border-l-2 border-transparent hover:border-primary/30'
                        }
                      `}
                    >
                      <Link href={menu.url} className="flex items-center gap-3">
                        {/* Icon with glow effect on active */}
                        <span className="relative">
                          {isActive && (
                            <motion.span
                              variants={glowVariants}
                              initial="initial"
                              animate="animate"
                              className="absolute inset-0 bg-primary/30 blur-md rounded-full"
                            />
                          )}
                          <menu.icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`} />
                        </span>
                        
                        <span className={`font-medium transition-colors duration-300 ${
                          isActive ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'
                        }`}>
                          {menu.title}
                        </span>
                        
                        {/* Active indicator dot */}
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <StatusPulse status="active" size="sm" />
                          </motion.span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative z-10 p-4 mb-4">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Welcome
            </span>
            {/* Animated shine effect */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "linear"
              }}
            />
          </Button>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;