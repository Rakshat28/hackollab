"use client";

import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Loader2, Settings, Eye, EyeOff, Key } from 'lucide-react';
import { api } from '~/trpc/react';
import { toast } from 'sonner';

export const GeminiKeyInput = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [open, setOpen] = useState(false);
  
  const utils = api.useUtils();
  const { data: userProfile } = api.user.getProfile.useQuery();
  
  const updateGeminiKey = api.user.updateGeminiKey.useMutation({
    onSuccess: () => {
      toast.success('Gemini API key saved successfully!');
      utils.user.getProfile.invalidate();
      setOpen(false);
      setGeminiKey('');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to save API key');
    }
  });
  
  const handleSaveKey = async () => {
    if (!geminiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setIsSavingKey(true);
    try {
      await updateGeminiKey.mutateAsync({ geminiApiKey: geminiKey });
    } finally {
      setIsSavingKey(false);
    }
  };
  
  const hasApiKey = userProfile?.geminiApiKey;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          {hasApiKey ? 'API Key Set' : 'Add API Key'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gemini API Key Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Add your own Gemini API key to avoid quota limits and get better performance.
            </p>
            
            {hasApiKey && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ You have an API key configured
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                onClick={handleSaveKey}
                disabled={isSavingKey || !geminiKey.trim()}
                className="w-full"
              >
                {isSavingKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save API Key'
                )}
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Get your API key from <a href="https://aistudio.google.com/" target="_blank" className="underline">Google AI Studio</a></p>
              <p className="mt-1">Your API key is stored securely and only used for AI features.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 