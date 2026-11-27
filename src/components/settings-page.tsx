'use client'

import * as React from 'react'
import { formatDate } from '@/lib/utils'
import {
  User, Bell, Moon, Sun, Monitor, Globe, Palette,
  Clock, BookOpen, Target, Brain, Zap, Shield,
  Save, Loader2, Check, AlertCircle, Info,
  ChevronDown, ChevronUp, Key, Database, Wifi,
  Mail, Smartphone, Layers, Tag, Download, FileText,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

const topics = [
  'global_affairs', 'economics', 'business', 'ecommerce',
  'technology', 'ai', 'geopolitics', 'science'
]

const geographicOptions = [
  'Global', 'North America', 'Europe', 'Asia-Pacific',
  'Middle East', 'Latin America', 'Africa', 'China', 'US', 'EU', 'UK'
]

const publicationOptions = [
  'Financial Times', 'Wall Street Journal', 'The Economist',
  'Reuters', 'Bloomberg', 'New York Times', 'Washington Post',
  'The Guardian', 'Foreign Affairs', 'MIT Technology Review',
  'Stratechery', 'Benedict Evans', 'Noema', 'Palladium'
]

const mockPreferences = {
  preferredTopics: ['economics', 'technology', 'ai', 'geopolitics'],
  geographicFocus: ['Global', 'US', 'EU', 'China'],
  preferredPublications: ['Financial Times', 'The Economist', 'Reuters'],
  briefingTime: '07:00',
  reviewTime: '20:00',
  briefingLength: 'medium',
  analyticalDepth: 'standard',
  theme: 'system',
  emailNotifications: true,
  pushNotifications: true,
}

export function SettingsPage() {
  const { toast } = useToast()
  const [preferences, setPreferences] = React.useState(mockPreferences)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<string>('general')
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // In real app: await updatePreferences(preferences)
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' })
  }

  const handleReset = () => {
    setPreferences(mockPreferences)
    toast({ title: 'Reset to defaults', description: 'All settings restored to default values.' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold px-2 sm:px-0">Settings</h1>
          <p className="text-muted-foreground px-2 sm:px-0 text-sm">Customize your SIGNAL experience</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-0">
          <Button variant="outline" onClick={handleReset} disabled={isSaving} className="touch-manipulation">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Reset to Defaults</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-1.5 sm:gap-2 touch-manipulation">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general"><User className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">General</span></TabsTrigger>
          <TabsTrigger value="content"><Layers className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Content</span></TabsTrigger>
          <TabsTrigger value="schedule"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Schedule</span></TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Notifications</span></TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Appearance</span></TabsTrigger>
          <TabsTrigger value="data"><Database className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Data</span></TabsTrigger>
          <TabsTrigger value="account"><Shield className="h-3 w-3 sm:h-4 sm:w-4" /><span className="ml-0.5 sm:mr-1.5 hidden sm:inline">Account</span></TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings preferences={preferences} onChange={setPreferences} />
        </TabsContent>

        <TabsContent value="content">
          <ContentSettings preferences={preferences} onChange={setPreferences} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleSettings preferences={preferences} onChange={setPreferences} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings preferences={preferences} onChange={setPreferences} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings preferences={preferences} onChange={setPreferences} />
        </TabsContent>

        <TabsContent value="data">
          <DataSettings />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings showDeleteDialog={setShowDeleteDialog} />
        </TabsContent>
      </Tabs>

      {showDeleteDialog && (
        <DeleteAccountDialog onClose={() => setShowDeleteDialog(false)} />
      )}
    </div>
  )
}

function GeneralSettings({ preferences, onChange }: { preferences: typeof mockPreferences; onChange: (p: typeof mockPreferences) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg"><User className="h-4 w-4 sm:h-5 sm:w-5" /> Profile</CardTitle>
          <CardDescription>Basic account information (managed via Clerk)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Signed in as user@example.com</p>
              <p className="text-sm text-muted-foreground">Free tier • Member since January 2024</p>
            </div>
          </div>
          <Button variant="outline" className="w-fit">Manage Account →</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI Assistant</CardTitle>
          <CardDescription>Configure how the AI assistant behaves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Response Length</Label>
            <Select value={preferences.briefingLength} onValueChange={v => onChange({ ...preferences, briefingLength: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Concise (2-3 sentences)</SelectItem>
                <SelectItem value="medium">Standard (1-2 paragraphs)</SelectItem>
                <SelectItem value="long">Detailed (multiple paragraphs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Analytical Depth</Label>
            <Select value={preferences.analyticalDepth} onValueChange={v => onChange({ ...preferences, analyticalDepth: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary only</SelectItem>
                <SelectItem value="standard">Standard analysis</SelectItem>
                <SelectItem value="deep">Deep dive with nuance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Citation Style</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Inline citations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline [1], [2]</SelectItem>
                <SelectItem value="footnote">Footnotes</SelectItem>
                <SelectItem value="none">No citations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Advanced</CardTitle>
          <CardDescription>Experimental features and power-user options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Beta Features</p>
              <p className="text-sm text-muted-foreground">Access experimental features before general release</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Keyboard Shortcuts</p>
              <p className="text-sm text-muted-foreground">Enable vim-style navigation and shortcuts</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing for information density</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-refresh Briefing</p>
              <p className="text-sm text-muted-foreground">Automatically update briefing when new articles arrive</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContentSettings({ preferences, onChange }: { preferences: typeof mockPreferences; onChange: (p: typeof mockPreferences) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Topics of Interest</CardTitle>
          <CardDescription>Select topics to prioritize in your briefing and storyline tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <label key={topic} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted">
                <input
                  type="checkbox"
                  checked={preferences.preferredTopics.includes(topic)}
                  onChange={(e) => onChange({
                    ...preferences,
                    preferredTopics: e.target.checked
                      ? [...preferences.preferredTopics, topic]
                      : preferences.preferredTopics.filter(t => t !== topic)
                  })}
                  className="rounded border-input"
                />
                <span className="capitalize text-sm">{topic.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Geographic Focus</CardTitle>
          <CardDescription>Regions and countries to emphasize in coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {geographicOptions.map(geo => (
              <label key={geo} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted">
                <input
                  type="checkbox"
                  checked={preferences.geographicFocus.includes(geo)}
                  onChange={(e) => onChange({
                    ...preferences,
                    geographicFocus: e.target.checked
                      ? [...preferences.geographicFocus, geo]
                      : preferences.geographicFocus.filter(g => g !== geo)
                  })}
                  className="rounded border-input"
                />
                <span className="text-sm">{geo}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Preferred Publications</CardTitle>
          <CardDescription>Sources to prioritize (others still included but ranked lower)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {publicationOptions.map(pub => (
              <label key={pub} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted">
                <input
                  type="checkbox"
                  checked={preferences.preferredPublications.includes(pub)}
                  onChange={(e) => onChange({
                    ...preferences,
                    preferredPublications: e.target.checked
                      ? [...preferences.preferredPublications, pub]
                      : preferences.preferredPublications.filter(p => p !== pub)
                  })}
                  className="rounded border-input"
                />
                <span className="text-sm">{pub}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Content Filters</CardTitle>
          <CardDescription>Fine-tune what appears in your feed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Minimum Importance Score</p>
              <p className="text-sm text-muted-foreground">Filter out low-signal articles</p>
            </div>
            <Select>
              <SelectTrigger className="w-36"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any (0+)</SelectItem>
                <SelectItem value="3">Moderate (3+)</SelectItem>
                <SelectItem value="5">High (5+)</SelectItem>
                <SelectItem value="7">Very High (7+)</SelectItem>
                <SelectItem value="9">Critical (9+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Include Opinion/Editorial</p>
              <p className="text-sm text-muted-foreground">Show clearly labeled opinion pieces</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Include Press Releases</p>
              <p className="text-sm text-muted-foreground">Show corporate/government announcements</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deduplicate Similar Stories</p>
              <p className="text-sm text-muted-foreground">Group articles covering the same event</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleSettings({ preferences, onChange }: { preferences: typeof mockPreferences; onChange: (p: typeof mockPreferences) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Daily Briefing</CardTitle>
          <CardDescription>When and how you receive your morning intelligence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <Input
                type="time"
                value={preferences.briefingTime}
                onChange={(e) => onChange({ ...preferences, briefingTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Auto-detect" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Briefing Length</Label>
            <Select value={preferences.briefingLength} onValueChange={v => onChange({ ...preferences, briefingLength: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (~5 min read, 3 stories)</SelectItem>
                <SelectItem value="medium">Medium (~10 min read, 6 stories)</SelectItem>
                <SelectItem value="long">Long (~20 min read, 10+ stories)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekend Briefing</p>
              <p className="text-sm text-muted-foreground">Receive briefing on weekends</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Breaking News Alerts</p>
              <p className="text-sm text-muted-foreground">Immediate notifications for major events</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Evening Review</CardTitle>
          <CardDescription>Spaced repetition and prediction calibration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Review Time</Label>
              <Input
                type="time"
                value={preferences.reviewTime}
                onChange={(e) => onChange({ ...preferences, reviewTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Session Length</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="15 minutes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Quick (5 min)</SelectItem>
                  <SelectItem value="10">Standard (10 min)</SelectItem>
                  <SelectItem value="15">Extended (15 min)</SelectItem>
                  <SelectItem value="20">Deep (20 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Include Prediction Review</p>
              <p className="text-sm text-muted-foreground">Check predictions nearing resolution</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Include Storyline Updates</p>
              <p className="text-sm text-muted-foreground">Review followed storylines with new events</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekend Review</p>
              <p className="text-sm text-muted-foreground">Run review session on weekends</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Prediction Reminders</CardTitle>
          <CardDescription>When to prompt for confidence updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Remind Before Resolution</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="1 week" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">1 week before</SelectItem>
                  <SelectItem value="14">2 weeks before</SelectItem>
                  <SelectItem value="30">1 month before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remind on Stale Predictions</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="30 days" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 week no update</SelectItem>
                  <SelectItem value="14">2 weeks no update</SelectItem>
                  <SelectItem value="30">1 month no update</SelectItem>
                  <SelectItem value="60">2 months no update</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Calibration Digest</p>
              <p className="text-sm text-muted-foreground">Summary of prediction performance every Monday</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSettings({ preferences, onChange }: { preferences: typeof mockPreferences; onChange: (p: typeof mockPreferences) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Notifications</CardTitle>
          <CardDescription>Configure what triggers email delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Enabled</p>
              <p className="text-sm text-muted-foreground">Master toggle for all email notifications</p>
            </div>
            <Switch checked={preferences.emailNotifications} onCheckedChange={v => onChange({ ...preferences, emailNotifications: v })} />
          </div>
          <Separator />
          <div className="space-y-3">
            {[
              { key: 'briefingReady', label: 'Daily Briefing Ready', desc: 'Morning briefing is available' },
              { key: 'reviewReminder', label: 'Evening Review Reminder', desc: 'Time for spaced repetition session' },
              { key: 'predictionDue', label: 'Prediction Resolution Due', desc: 'A prediction is nearing its resolution date' },
              { key: 'predictionStale', label: 'Stale Prediction Alert', desc: 'Prediction has not been updated in a while' },
              { key: 'storylineUpdate', label: 'Storyline Update', desc: 'New event in a followed storyline' },
              { key: 'breakingNews', label: 'Breaking News Alert', desc: 'Major event matching your interests' },
              { key: 'weeklyDigest', label: 'Weekly Calibration Digest', desc: 'Monday summary of prediction performance' },
              { key: 'flashcardsDue', label: 'Flashcards Due', desc: 'Cards ready for review' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> Push Notifications</CardTitle>
          <CardDescription>Browser and mobile push notifications (requires permission)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Enabled</p>
              <p className="text-sm text-muted-foreground">Master toggle for all push notifications</p>
            </div>
            <Switch checked={preferences.pushNotifications} onCheckedChange={v => onChange({ ...preferences, pushNotifications: v })} />
          </div>
          <p className="text-sm text-muted-foreground">Click "Enable Push" in the header menu to grant browser permission.</p>
          <Separator />
          <div className="space-y-3">
            {[
              { label: 'Breaking News Only', desc: 'Only critical alerts (default for push)' },
              { label: 'Briefing Ready', desc: 'Notification when briefing is available' },
              { label: 'Review Reminder', desc: 'Evening review session reminder' },
              { label: 'Prediction Alerts', desc: 'Resolution due or stale predictions' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={i === 0} onCheckedChange={() => {}} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wifi className="h-5 w-5" /> In-App Notifications</CardTitle>
          <CardDescription>Notification center behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show in Notification Center</p>
              <p className="text-sm text-muted-foreground">All notifications appear in the bell menu</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Group Similar Notifications</p>
              <p className="text-sm text-muted-foreground">Bundle related updates together</p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-mark Read on View</p>
              <p className="text-sm text-muted-foreground">Clear notification when panel opens</p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="space-y-2">
            <Label>Retention Period</Label>
            <Select>
              <SelectTrigger className="w-48"><SelectValue placeholder="30 days" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AppearanceSettings({ preferences, onChange }: { preferences: typeof mockPreferences; onChange: (p: typeof mockPreferences) => void }) {
  const [theme, setTheme] = React.useState(preferences.theme)

  React.useEffect(() => {
    setTheme(preferences.theme)
  }, [preferences.theme])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun, desc: 'Clean, high-contrast light mode' },
              { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes in low light' },
              { value: 'system', label: 'System', icon: Monitor, desc: 'Matches your OS preference' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); onChange({ ...preferences, theme: t.value as any }) }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  theme === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                {theme === t.value && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Layout Density</CardTitle>
          <CardDescription>Control information density across the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'comfortable', label: 'Comfortable', desc: 'Generous spacing, easier scanning' },
              { value: 'compact', label: 'Compact', desc: 'More content on screen' },
              { value: 'dense', label: 'Dense', desc: 'Maximum information density' },
            ].map(l => (
              <button
                key={l.value}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  false // TODO: track selected layout
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div>
                  <p className="font-medium">{l.label}</p>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" /> Accent Color</CardTitle>
          <CardDescription>Primary color used for highlights and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
              <button
                key={color}
                className={`w-10 h-10 rounded-full border-2 transition-transform ${
                  false // TODO: track selected color
                    ? 'scale-110 border-white dark:border-gray-900 shadow-lg'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Typography</CardTitle>
          <CardDescription>Font preferences for reading comfort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>UI Font</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="System default" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="manrope">Manrope</SelectItem>
                <SelectItem value="dm-sans">DM Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reading Font (Articles)</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Serif (Merriweather)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merriweather">Merriweather (Serif)</SelectItem>
                <SelectItem value="source-serif">Source Serif Pro</SelectItem>
                <SelectItem value="charter">Charter</SelectItem>
                <SelectItem value="sans">System Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Code Font</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="JetBrains Mono" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                <SelectItem value="fira">Fira Code</SelectItem>
                <SelectItem value="monospace">System Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base Font Size</Label>
            <div className="flex items-center gap-3">
              <Slider value={[100]} onValueChange={([v]) => {}} min={85} max={125} step={5} className="flex-1" />
              <span className="font-mono text-lg w-16 text-right">100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DataSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Export Data</CardTitle>
          <CardDescription>Download your SIGNAL data in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Complete Export (JSON)"
              description="All your data: briefings, predictions, flashcards, storylines, annotations"
              format="JSON"
              size="~2-5 MB"
            />
            <ExportCard
              title="Predictions Only (CSV)"
              description="All predictions with outcomes, Brier scores, and calibration data"
              format="CSV"
              size="~50-200 KB"
            />
            <ExportCard
              title="Flashcards (Anki/CSV)"
              description="Formatted for Anki import or spreadsheet analysis"
              format="CSV/Anki"
              size="~10-100 KB"
            />
            <ExportCard
              title="Reading History"
              description="Articles saved, annotated, and time spent reading"
              format="JSON"
              size="~100-500 KB"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Storage & Sync</CardTitle>
          <CardDescription>Manage local storage and cloud synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StorageStat label="Database Size" value="~45 MB" icon={Database} />
            <StorageStat label="Cached Articles" value="234" icon={FileText} />
            <StorageStat label="Offline Data" value="12 MB" icon={Wifi} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-sync to Cloud</p>
                <p className="text-sm text-muted-foreground">Sync data to Supabase for multi-device access</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm text-muted-foreground">Cache recent briefings for offline reading</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
            <Button variant="outline" className="w-fit">Clear Local Cache</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Shield className="h-5 w-5" /> Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div>
              <p className="font-medium text-destructive">Delete All Data</p>
              <p className="text-sm text-muted-foreground">Permanently remove all your SIGNAL data from this device</p>
            </div>
            <Button variant="destructive" className="gap-1">Delete</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Reset Preferences Only</p>
              <p className="text-sm text-muted-foreground">Keep your data but restore all settings to defaults</p>
            </div>
            <Button variant="outline" className="gap-1">Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ExportCard({ title, description, format, size }: { title: string; description: string; format: string; size: string }) {
  return (
    <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Badge variant="outline">{format}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{size}</p>
      </CardContent>
    </Card>
  )
}

function StorageStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function AccountSettings({ showDeleteDialog }: { showDeleteDialog: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Information</CardTitle>
          <CardDescription>Managed through Clerk authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">user@example.com</p>
              <p className="text-sm text-muted-foreground">Signed in via email</p>
              <p className="text-sm text-muted-foreground">Member since January 2024</p>
            </div>
            <Button variant="outline">Manage in Clerk →</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium">Free Tier</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">API Usage</p>
              <p className="font-medium">1,234 / 10,000 this month</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Storage Used</p>
              <p className="font-medium">45 MB / 1 GB</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Sessions</p>
              <p className="font-medium">Active on 2 devices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Security</CardTitle>
          <CardDescription>Authentication and access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Enabled via Clerk</p>
              </div>
              <Badge variant="default" className="bg-green-500">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Passkeys</p>
                <p className="text-sm text-muted-foreground">Passwordless sign-in</p>
              </div>
              <Button variant="outline" size="sm">Add Passkey</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">View and revoke</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</CardTitle>
          <CardDescription>Data processing and privacy controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Anonymous usage statistics</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Error Reporting</p>
                <p className="text-sm text-muted-foreground">Automatic crash/error reports</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">AI Training Opt-out</p>
                <p className="text-sm text-muted-foreground">Don't use my data for model training</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
          </div>
          <Button variant="outline" className="w-fit">View Privacy Policy →</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Shield className="h-5 w-5" /> Delete Account</CardTitle>
          <CardDescription>Permanently remove your account and all data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone. All your briefings, predictions, flashcards, and storylines will be permanently deleted.</p>
            </div>
            <Button variant="destructive" onClick={() => showDeleteDialog(true)} className="gap-1">
              <AlertCircle className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setIsDeleting(true)
    // In real app: await deleteAccount()
    await new Promise(r => setTimeout(r, 2000))
    setIsDeleting(false)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This will permanently delete your account and all associated data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="font-medium text-destructive">The following will be permanently deleted:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
              <li>All daily briefings and storylines</li>
              <li>All predictions and calibration history</li>
              <li>All flashcards and review history</li>
              <li>All saved articles and annotations</li>
              <li>All AI conversations</li>
              <li>All preferences and settings</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label>Type "DELETE" to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== 'DELETE' || isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Missing import
