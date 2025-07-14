'use client'
import React from 'react'
import { SidebarProvider, useSidebar } from '~/components/ui/sidebar'
import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from './dashboard/app-sidebar';
import { ModeToggle } from '~/components/mode-toggle';
import { GeminiKeyInput } from '~/components/gemini-key-input';

type Props = {
    children: React.ReactNode
}

function MobileSidebarTrigger() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <button
      className="fixed top-4 left-4 z-50 p-1 rounded-md text-primary shadow-md md:hidden"
      onClick={() => setOpenMobile(true)}
      aria-label="Open sidebar"
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
    </button>
  );
}

const SidebarLayout = ({children}: Props) => {
  return (
    <div>
      <SidebarProvider>
        <MobileSidebarTrigger />
        <AppSidebar />
        <main className="w-full m-2">
          <div className="flex items-center gap-4 border-sidebar bg-sidebar border shadow rounded-md p-2 px-4 mt-[1.5] relative">
            <MobileSidebarTrigger />
            <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full hidden sm:flex">
              <GeminiKeyInput />
              <p className='text-muted-foreground text-sm flex items-center'>
                Add Gemini API key first.
              </p>
            </div>
            <div className="ml-auto flex flex-row gap-2 items-center">
              <div className="flex sm:hidden">
                <GeminiKeyInput />
              </div>
              <UserButton />
              <div className="">
                <ModeToggle></ModeToggle>
              </div>
            </div>
          </div>
            <div className="h-4"></div>
            <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
                {children}
            </div>
            
        </main>
      </SidebarProvider>
    </div>
  )
}

export default SidebarLayout
