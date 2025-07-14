import React from 'react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import Image from 'next/image'
import { 
  GitBranch, 
  MessageCircle, 
  Zap, 
  Github, 
  Brain, 
  ArrowRight,
  Users,
  Shield
} from 'lucide-react'

function page() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <header className="border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Image src='/logo (1).png' width={40} height={40} alt='logo' />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Hackollab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-900 dark:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Code
              <span className="text-primary"> Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Hackollab transforms your GitHub repositories with AI-powered commit summaries and intelligent repository insights using Gemini API
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-up">
                <Button className="px-8 py-6 text-lg">
                  Lets Try
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href='https://github.com/Rakshat28/hackollab'>
              <Button variant="outline" className="px-8 py-6 text-lg">
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to understand and collaborate on your codebase
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Smart Commit Summaries</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically generate intelligent summaries for every commit using Gemini AI, making code reviews faster and more insightful
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ask Anything</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Query your repository naturally. Ask questions about code structure, functionality, or get explanations about complex logic
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">GitHub Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Seamlessly connect with GitHub repositories. Works with public and private repos with secure authentication
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Leverage Gemini AI to understand code patterns, suggest improvements, and provide contextual explanations
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share insights and summaries with your team. Perfect for onboarding new developers and knowledge sharing
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your code stays secure. We use encrypted connections and do not store your repository data permanently
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers who are already using Hackollab to understand their code better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button className="px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Image src='/logo (1).png' width={40} height={40} alt='logo' />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Hackollab</span>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  )
}

export default page