'use client'
import React from 'react'
import { SidebarProvider } from '~/components/ui/sidebar'
import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from './dashboard/app-sidebar';
import { ModeToggle } from '~/components/mode-toggle';
import { GeminiKeyInput } from '~/components/gemini-key-input';

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({children}: Props) => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full m-2">
            <div className="flex items-center gap-4 border-sidebar bg-sidebar border shadow rounded-md p-2 px-4 mt-[1.5]">
                <div className="flex items-center gap-2">
                    <GeminiKeyInput />
                    <p className='text-muted-foreground text-sm flex items-center'>
                    Add Gemini API key first.
                    </p>
                </div>
                <div className="ml-auto flex flex-row gap-2">
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
