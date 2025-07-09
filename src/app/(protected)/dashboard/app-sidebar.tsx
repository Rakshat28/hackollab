'use client';
import { Bot, LayoutDashboard, Plus, Presentation } from "lucide-react";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import Link from "next/link";
const items = [
    {
        title:'Dashboard',
        url:'/dashboard',
        icon:LayoutDashboard
    },
    {
        title:'Q&A',
        url:'/qa',
        icon:Bot
    },
    {
        title:'Meetings',
        url:'/meetings',
        icon:Presentation
    }
]
const projects = [
    {
        name : 'Project1'
    },
    {
        name : 'Project2'
    },
    {
        name : 'Project3'
    },
]

export function AppSidebar(){
    const pathname = usePathname();
    const {state} = useSidebar();
    const collapsed = state === "collapsed"
    return(
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src='/logo (1).png' alt='logo' width={52} height={52} />
                    {!collapsed && <h1 className="text-xl font-bold text-primary/90">
                        Hackollab
                    </h1>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild className={cn(
                                        "w-full px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-2",
                                        pathname === item.url
                                        ? "bg-primary text-white hover:bg-primary hover:text-white"
                                        : "hover:bg-muted"
                                    )}>
                                <Link href={item.url}>
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects.map((project)=>{
                            return(
                                <SidebarMenuItem key={project.name}>
                                    <SidebarMenuButton asChild>
                                        <div>
                                            <div className={cn('rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary p-2',
                                                {
                                                    'bg-primary text-white hover:bg-primary hover:text-white' : true
                                                }
                                            )}>
                                            {project.name[0]} 
                                            </div>
                                            {project.name}
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                            })
                            }
                            <div className="h-4"></div>
                            <SidebarMenuItem>
                                {!collapsed ? (
                                    <Link href="/create">
                                    <Button size="sm" variant="outline">
                                        <Plus />
                                        Create Project
                                    </Button>
                                </Link>
                                ) : (
                                    <Link href="/create">
                                    <Button size="sm" variant="outline">
                                        <Plus />
                                    </Button>
                                </Link>
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

