import React from 'react'
import { SignUp, SignIn } from "@clerk/nextjs"

function page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 ">
      Hello World
      <SignUp />
      <SignIn />
    </div>
  )
}

export default page
