import { type LucideProps } from 'lucide-react'
import {
  Home, Search, Ticket, UserRound, Plus, ArrowLeft, ArrowRight,
  Share2, SlidersHorizontal, MapPin, Calendar, Clock, ChevronDown, ChevronRight,
  Route, Users, CarFront, Car, Armchair, BadgeCheck, Check, Signal,
  Wifi, BatteryFull, Settings, UsersRound, Lock, UserPlus, Globe,
  MessageCircle, HelpCircle, Phone, Star, Copy, QrCode, Eye, EyeOff,
  AlertCircle, X, Menu, Bell, Filter, Globe2, Mail,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'home':               Home,
  'search':             Search,
  'ticket':             Ticket,
  'user-round':         UserRound,
  'plus':               Plus,
  'arrow-left':         ArrowLeft,
  'arrow-right':        ArrowRight,
  'share-2':            Share2,
  'sliders-horizontal': SlidersHorizontal,
  'map-pin':            MapPin,
  'calendar':           Calendar,
  'clock':              Clock,
  'chevron-down':       ChevronDown,
  'chevron-right':      ChevronRight,
  'route':              Route,
  'users':              Users,
  'car-front':          CarFront,
  'car-taxi-front':     Car,
  'armchair':           Armchair,
  'badge-check':        BadgeCheck,
  'check':              Check,
  'signal':             Signal,
  'wifi':               Wifi,
  'battery-full':       BatteryFull,
  'settings':           Settings,
  'users-round':        UsersRound,
  'lock':               Lock,
  'user-plus':          UserPlus,
  'globe':              Globe,
  'globe-2':            Globe2,
  'message-circle':     MessageCircle,
  'help-circle':        HelpCircle,
  'phone':              Phone,
  'star':               Star,
  'copy':               Copy,
  'qr-code':            QrCode,
  'eye':                Eye,
  'eye-off':            EyeOff,
  'alert-circle':       AlertCircle,
  'x':                  X,
  'menu':               Menu,
  'bell':               Bell,
  'filter':             Filter,
  'mail':               Mail,
}

interface IconProps {
  name: string
  size?: number
  color?: string
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 20, color, className, strokeWidth = 1.5 }: IconProps) {
  const IconComponent = iconMap[name]
  if (!IconComponent) return null
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
    />
  )
}
