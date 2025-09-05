'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  User,
  Mail,
  Lock,
  Trash2,
  Building,
  Briefcase,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sidebar } from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('Alex Doe');
  const [role, setRole] = useState('UX Designer');
  const [company, setCompany] = useState('QuantumLeap');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <UserCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" />
            </Button>
        </div>
        <h1 className="ml-4 text-xl font-bold">Settings</h1>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Edit Profile Section */}
          <section>
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                 <div className="relative mt-1">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                 <div className="relative mt-1">
                  <Building className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
            <Button className="mt-6 w-full">Save Changes</Button>
          </section>

          <Separator />

          {/* Account Security Section */}
          <section>
            <h2 className="text-lg font-semibold">Account Security</h2>
            <div className="mt-4 space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>Change Email Address</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>Change Password</span>
              </Button>
            </div>
          </section>

          <Separator />

          {/* Delete Account Section */}
          <section>
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4 w-full justify-start gap-3">
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </main>
    </div>
  );
}
