import React from 'react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'

function page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 gap-4 ">
      Hello World 
      <Link href={'/sign-up'}>
        <Button>
          SignUp
        </Button>
      </Link>
      <Link href={'/sign-in'}>
        <Button>
          SignIn
        </Button>
      </Link>
    </div>
  )
}

export default page
