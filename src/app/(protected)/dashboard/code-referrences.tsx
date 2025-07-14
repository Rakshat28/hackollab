'use client';
import { TabsContent } from '@radix-ui/react-tabs';
import React from 'react'
import { Tabs } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';
import { Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
type Props = {
    filesReferrences: { fileName: string; sourceCode: string, summary: string}[]
}

const CodeReferrences = ({filesReferrences}: Props) => {
    const [tab,setTab] = React.useState(filesReferrences[0]?.fileName)
    if(filesReferrences.length === 0) return null;
  return (
    <div className='max-w-[70vw]'>
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md">
        {filesReferrences.map(file => (
            <button
                key={file.fileName}
                className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-mute',
                {
                    'br-primary text-primary-foreground': tab === file.fileName
                }
                )}
            >
                {file.fileName}
            </button>
            ))}
        </div>
        {filesReferrences.map(file => (
            <TabsContent key={file.fileName} value={file.fileName} className='max-h-[40vh] overflow-scroll max-w-7xl rounded-md'>
                <SyntaxHighlighter language='typescript' style={materialDark}>
                    {file.sourceCode}
                </SyntaxHighlighter>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default CodeReferrences
