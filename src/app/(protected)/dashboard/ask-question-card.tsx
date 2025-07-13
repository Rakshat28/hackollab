import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { useProjectContext } from '~/context/ProjectContext'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import Image from 'next/image'
import { askQuestion } from './actions'
import { Loader2 } from 'lucide-react'

const AskQuestionCard = () => {
    const {projectId} = useProjectContext();
    const [question, setQuestion] = useState('');
    const [open,setOpen] = useState<boolean>(false)
    const [answer,setAnswer] = useState('');
    const [fileReferences, setFileReferences] = useState<{fileName: string; sourceCode: string; summary: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(!projectId || !question.trim()) return;
      
      setIsLoading(true);
      setOpen(true);
      setAnswer('');
      setFileReferences([]);
      
      try {
        console.log('Starting to ask question:', question);
        const result = await askQuestion(question, projectId);
        console.log('Question result:', result);
        
        // Set the answer directly
        if (result.output) {
          console.log('Setting answer:', result.output.substring(0, 100) + '...');
          setAnswer(result.output);
        } else {
          console.log('No output in result');
          setAnswer('No response generated. Please try again.');
        }
        
        if (result.fileReferences) {
          console.log('Setting file references:', result.fileReferences.length);
          setFileReferences(result.fileReferences);
        }
              } catch (error) {
          console.error('Error asking question:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            setAnswer('The AI service has reached its daily limit. Please try again tomorrow or check your Gemini API quota. You can also try using a different API key.');
          } else if (errorMessage.includes('No Gemini API key')) {
            setAnswer('Please add your Gemini API key in the settings to use this feature.');
          } else {
            setAnswer(`Error: ${errorMessage}`);
          }
        } finally {
        setIsLoading(false);
      }
    }
    
  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <Image src="/favicon.png" width={40} height={40} alt='hackollab' />
            <span>AI Response</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      
      <div className="mt-4 space-y-4">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: answer || 'Processing your question...' }} />
        </div>
        
        {fileReferences.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Referenced Files:</h3>
            <div className="space-y-1">
              {fileReferences.map((file, index) => (
                <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {file.fileName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </DialogContent>
    </Dialog>
    
    <Card className="relative col-span-3">
        <CardHeader>
            <CardTitle>Ask a question</CardTitle>
            <CardDescription>The Gemini model will give you the answer</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea 
                  placeholder="Ask a question about the codebase" 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isLoading}
                />
                <div className="h-5"></div>
                <Button type="submit" disabled={isLoading || !question.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Explore with AI'
                    )}
                </Button>
            </form>
            <div className="h-2"></div>
        </CardContent>
    </Card>
    </>
  )
}

export default AskQuestionCard
