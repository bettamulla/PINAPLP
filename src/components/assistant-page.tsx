'use client'

import * as React from 'react'
import { formatRelative } from '@/lib/utils';
import { Send, Bot, User, Plus, Copy, Sparkles, Brain, BookOpen, Target, Zap, ChevronLeft, ChevronRight, X, Loader2, FileText, Flag, Search, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { markdownToReact } from '@/lib/markdown'

const mockConversations = [
  {
    id: '1',
    title: 'EU AI Act implications for startups',
    contextType: 'storyline',
    contextId: '2',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messages: [
      { role: 'user', content: 'What are the key compliance deadlines for the EU AI Act?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { role: 'assistant', content: 'The EU AI Act has phased implementation...', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000) },
    ],
  },
  {
    id: '2',
    title: 'Fed policy analysis',
    contextType: 'briefing',
    contextId: '1',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messages: [
      { role: 'user', content: 'Explain the dot plot shift', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    id: '3',
    title: 'China property market outlook',
    contextType: 'article',
    contextId: '4',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    messages: [],
  },
  {
    id: '4',
    title: 'Flashcard review strategy',
    contextType: 'general',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    messages: [],
  },
]

const mockMessages = [
  { role: 'user', content: 'What are the key compliance deadlines for the EU AI Act?', createdAt: new Date() },
  {
    role: 'assistant',
    content: `The EU AI Act entered into force on **August 1, 2024**, with a phased implementation timeline:

**Immediate (Aug 2024):**
- Ban on unacceptable risk AI systems (social scoring, real-time biometric ID in public)
- Transparency obligations for AI interacting with humans

**6 months (Feb 2025):**
- Prohibitions on specific practices fully enforced

**12 months (Aug 2025):**
- General-purpose AI model obligations (technical documentation, copyright compliance)
- Governance structure operational

**24 months (Aug 2026):**
- High-risk AI system requirements (most enterprise/commercial AI)
- Conformity assessments, CE marking, registration

**36 months (Aug 2027):**
- High-risk AI as safety components (medical devices, machinery, etc.)

**Key for startups:** If you're building high-risk AI (hiring, credit scoring, medical, critical infrastructure), you have ~2 years to comply. General-purpose AI model providers (LLMs, foundation models) have ~1 year.

The Act uses a **risk-based approach**: Unacceptable → High → Limited → Minimal risk. Most startup AI falls in Limited/Minimal (transparency only) or High (full compliance).`,
    createdAt: new Date(Date.now() + 5000),
    citations: [
      { type: 'article', title: 'EU AI Act Enters Force', source: 'Financial Times' },
      { type: 'storyline', title: 'EU AI Act Implementation' },
    ]
  },
  { role: 'user', content: 'How does this compare to US AI regulation?', createdAt: new Date(Date.now() + 10000) },
  {
    role: 'assistant',
    content: `**US Approach: Sectoral + Voluntary + Executive Orders**

| Dimension | EU AI Act | US Approach |
|-----------|-----------|-------------|
| **Legal form** | Binding regulation (direct effect) | Mix of EOs, agency guidance, state laws |
| **Scope** | Horizontal (all AI) | Vertical (sector-specific) |
| **Enforcement** | Fines up to 7% global revenue | FTC enforcement, state AGs, sector regulators |
| **Risk classification** | 4-tier statutory | NIST AI RMF (voluntary framework) |
| **GPAI/Foundation models** | Specific obligations (Art. 51-56) | Voluntary commitments (White House) |

**Current US landscape:**
- **Executive Order 14110** (Oct 2023): Reporting for frontier models, NIST standards, agency guidance
- **NIST AI RMF**: Voluntary risk management framework (widely adopted as de facto standard)
- **State laws**: CA (transparency), CO (high-risk AI), NY (hiring AI bias audits)
- **Sector rules**: FDA (AI/ML medical devices), SEC (AI in finance), DOT (autonomous vehicles)

**Practical implication:** EU = compliance checklist with deadlines. US = demonstrate reasonable risk management per NIST RMF + sector rules. Multinational companies typically build to EU standard globally.`,
    createdAt: new Date(Date.now() + 15000),
    citations: [
      { type: 'article', title: 'US AI Executive Order', source: 'White House' },
    ]
  },
]

const quickPrompts = [
  { label: 'Explain this storyline', icon: BookOpen, prompt: 'Give me a comprehensive overview of this developing story, including key events, competing interpretations, and what to watch next.' },
  { label: 'Analyze this prediction', icon: Target, prompt: 'Review my prediction reasoning. What are the strongest arguments for and against? What evidence would change my mind?' },
  { label: 'Generate flashcards', icon: Sparkles, prompt: 'Create 5-7 high-yield flashcards from the latest briefing to test my retention of key facts.' },
  { label: 'Compare perspectives', icon: Brain, prompt: 'How do different outlets frame this story? What facts does each emphasize or omit?' },
  { label: 'Calibration check', icon: Zap, prompt: 'Review my prediction track record. Where am I overconfident? Underconfident? What patterns do you see?' },
  { label: 'Research assistant', icon: Search, prompt: 'I need to understand [topic]. Find the key facts, major viewpoints, and open questions from my saved articles and briefings.' },
]

export function AssistantPage() {
  const [conversations, setConversations] = React.useState(mockConversations)
  const [activeConversation, setActiveConversation] = React.useState<typeof mockConversations[0] | null>(mockConversations[0])
  const [messages, setMessages] = React.useState(mockMessages)
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [isNewConversationOpen, setIsNewConversationOpen] = React.useState(false)
  const [newConvTitle, setNewConvTitle] = React.useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input, createdAt: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant' as const,
        content: `I'll help you with: "${input}". This is a simulated response. In the real app, this would call the AI assistant with your full context (saved articles, briefings, storylines, predictions, flashcards).`,
        createdAt: new Date(),
        citations: [],
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleNewConversation = () => {
    const conv = {
      id: Date.now().toString(),
      title: newConvTitle || 'New Conversation',
      contextType: 'general',
      updatedAt: new Date(),
      messages: [],
    }
    setConversations(prev => [conv, ...prev])
    setActiveConversation(conv)
    setMessages([])
    setIsNewConversationOpen(false)
    setNewConvTitle('')
  }

  const contextTypes = {
    storyline: { label: 'Storyline', icon: BookOpen, color: 'text-blue-500' },
    article: { label: 'Article', icon: FileText, color: 'text-green-500' },
    briefing: { label: 'Briefing', icon: Flag, color: 'text-purple-500' },
    prediction: { label: 'Prediction', icon: Target, color: 'text-orange-500' },
    general: { label: 'General', icon: Sparkles, color: 'text-gray-500' },
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSidebar(true)}
        aria-label="Open conversations menu"
        className="md:hidden h-10 w-10 touch-manipulation z-50 fixed top-4 left-4"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 sm:w-72 border-r flex flex-col transition-all duration-200
        fixed inset-y-0 left-0 z-50 -translate-x-full md:relative md:-translate-x-0 md:flex
        ${showSidebar ? 'translate-x-0' : 'md:translate-x-0'}
      `}>
        <div className="p-3 sm:p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-base sm:text-lg">Conversations</h2>
          <div className="flex items-center gap-1">
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(false)}
              aria-label="Close navigation menu"
              className="md:hidden h-8 w-8 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="hidden md:flex h-8 w-8 touch-manipulation">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-b">
          <Button className="w-full gap-1.5 sm:gap-2 justify-start text-sm touch-manipulation" onClick={() => setIsNewConversationOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Conversation</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map(conv => {
              const ctx = contextTypes[conv.contextType as keyof typeof contextTypes] || contextTypes.general
              const ContextIcon = ctx.icon
              return (
                <button
                  key={conv.id}
                  onClick={() => { setShowSidebar(false); setActiveConversation(conv); setMessages(mockMessages); }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-colors touch-manipulation ${
                    activeConversation?.id === conv.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className={`p-1.5 rounded ${ctx.color} bg-current/10 flex-shrink-0`}>
                      <ContextIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(conv.updatedAt)}</p>
                    </div>
                  </div>
                </button>
              )
            })}
            {conversations.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations yet. Start a new one!
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t">
          <QuickPrompts onQuickPrompt={prompt => { setInput(prompt); handleSend({ preventDefault: () => {} } as React.FormEvent) }} />
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background">
            <div className="flex items-center gap-2 sm:gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="sm:hidden h-8 w-8 touch-manipulation">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Show conversations</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div>
                <h1 className="font-semibold text-base sm:text-lg">{activeConversation.title}</h1>
                <p className="text-xs text-muted-foreground capitalize">{contextTypes[activeConversation.contextType as keyof typeof contextTypes]?.label} context</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {}}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => {}}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <ScrollArea className="flex-1 p-4 space-y-6">
          {messages.length === 0 ? (
            <WelcomeScreen onQuickPrompt={prompt => { setInput(prompt); handleSend({ preventDefault: () => {} } as React.FormEvent) }} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 w-full">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </ScrollArea>

        {activeConversation && (
          <div className="border-t p-3 sm:p-4 bg-background">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto">
              <div className="flex items-end gap-1.5 sm:gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your briefings, storylines, predictions..."
                  className="flex-1 min-h-[40px] sm:min-h-[44px] max-h-48 resize-none text-sm"
                  rows={1}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={!input.trim() || isLoading} className="h-9 w-9 sm:h-10 sm:w-auto px-2.5 sm:px-3 touch-manipulation" size={isLoading ? "default" : "sm"}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2 text-center">
                <span className="hidden sm:inline">Enter to send • Shift+Enter for new line • Type / for commands</span>
                <span className="sm:hidden">Enter to send</span>
              </p>
            </form>
          </div>
        )}
      </div>

      {isNewConversationOpen && (
        <Dialog open={true} onOpenChange={setIsNewConversationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input value={newConvTitle} onChange={(e) => setNewConvTitle(e.target.value)} placeholder="e.g., Fed policy deep-dive" />
              </div>
              <div className="space-y-2">
                <Label>Initial Context (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select context type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General (no specific context)</SelectItem>
                    <SelectItem value="storyline">Storyline</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="briefing">Daily Briefing</SelectItem>
                    <SelectItem value="prediction">Prediction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>Cancel</Button>
              <Button onClick={handleNewConversation} className="gap-1">
                <Sparkles className="h-4 w-4" /> Start Conversation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function WelcomeScreen({ onQuickPrompt }: { onQuickPrompt: (prompt: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center space-y-6 sm:space-y-8">
      <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
      </div>
      <div className="px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 px-4 sm:px-0">Your Intelligence Assistant</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">Ask about your briefings, storylines, predictions, or flashcards.</p>
      </div>

      <div className="px-4 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {quickPrompts.slice(0, 4).map((qp, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-16 sm:h-20 flex-col gap-1.5 sm:gap-2 text-left touch-manipulation"
              onClick={() => onQuickPrompt(qp.prompt)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <qp.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">{qp.label}</span>
              </div>
              <p className="text-xs text-muted-foreground px-2 sm:px-0">{qp.prompt.slice(0, 60)}...</p>
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t px-4 sm:px-0">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Try: &#34;What were the top 3 stories?&#34; • &#34;Analyze my Fed prediction&#34;
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: typeof mockMessages[0] }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        }`}>
          {isAssistant ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {markdownToReact(message.content)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs text-muted-foreground mb-1">Sources:</p>
              <div className="flex flex-wrap gap-1">
                {message.citations.map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {c.type}: {c.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{formatRelative(message.createdAt)}</span>
          {isAssistant && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-muted">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function QuickPrompts({ onQuickPrompt }: { onQuickPrompt: (prompt: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground px-2">Quick actions</p>
      {quickPrompts.slice(0, 3).map((qp, i) => (
        <Button
          key={i}
          variant="ghost"
          className="w-full justify-start gap-2 h-10 px-3"
          onClick={() => onQuickPrompt(qp.prompt)}
        >
          <qp.icon className="h-4 w-4" />
          <span className="text-sm truncate">{qp.label}</span>
        </Button>
      ))}
    </div>
  )
}
