import { Award, BookOpen, Briefcase, CalendarClock, ClipboardCheck, FileText, FolderOpen, GraduationCap, Home, LayoutGrid, Library, Users, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from './types'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Shown in the phone bottom bar. */
  primary?: boolean
}

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: '/dashboard', label: 'Home', icon: Home, primary: true },
    { href: '/courses', label: 'Courses', icon: BookOpen, primary: true },
    { href: '/assessments', label: 'Quizzes', icon: ClipboardCheck, primary: true },
    { href: '/assignments', label: 'Assignments', icon: FileText, primary: true },
    { href: '/live-classes', label: 'Live classes', icon: Video },
    { href: '/materials', label: 'Materials', icon: FolderOpen },
    { href: '/certificates', label: 'Certificates', icon: Award },
    { href: '/career', label: 'Career', icon: Briefcase },
  ],
  tutor: [
    { href: '/dashboard', label: 'Home', icon: Home, primary: true },
    { href: '/tutor/courses', label: 'My courses', icon: Library, primary: true },
    { href: '/assessments', label: 'Quizzes', icon: ClipboardCheck, primary: true },
    { href: '/assignments', label: 'Grading', icon: FileText, primary: true },
    { href: '/live-classes', label: 'Live classes', icon: CalendarClock },
    { href: '/materials', label: 'Materials', icon: FolderOpen },
    { href: '/courses', label: 'Catalogue', icon: BookOpen },
  ],
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutGrid, primary: true },
    { href: '/admin/users', label: 'People', icon: Users, primary: true },
    { href: '/admin/courses', label: 'Courses', icon: GraduationCap, primary: true },
  ],
}

export const HOME: Record<Role, string> = { student: '/dashboard', tutor: '/dashboard', admin: '/admin' }
