
// "use client"

// import {
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarContent,
//   SidebarFooter,
// } from "@/components/ui/sidebar"
// import Logo from "@/components/logo"
// import { usePathname } from "next/navigation"
// import Link from "next/link"
// import { Calendar, LayoutGrid, DollarSign, UploadCloud, Settings, Home } from "lucide-react"

// const navItems = [
//   { href: "/dashboard", label: "Dashboard", icon: Home },
//   { href: "/schedule", label: "Schedule", icon: Calendar },
//   { href: "/planner", label: "Fleet Planner", icon: LayoutGrid },
//   { href: "/optimizer", label: "Cost Optimizer", icon: DollarSign },
//   { href: "/upload", label: "Upload", icon: UploadCloud },
// ]

// export default function Nav() {
//   const pathname = usePathname()
//   return (
//     <>
//       <SidebarHeader>
//         <Logo />
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarMenu>
//           {navItems.map((item) => (
//             <SidebarMenuItem key={item.label}>
//               <SidebarMenuButton
//                 asChild
//                 isActive={pathname.startsWith(item.href)}
//                 tooltip={item.label}
//                 className="justify-start"
//               >
//                 <Link href={item.href}>
//                   <item.icon />
//                   <span>{item.label}</span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarContent>
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton className="justify-start" tooltip="Settings">
//               <Settings />
//               <span>Settings</span>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </>
//   )
// }
"use client"

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Logo from "@/components/logo"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Calendar, LayoutGrid, DollarSign, UploadCloud, Settings, Home } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/planner", label: "Fleet Planner", icon: LayoutGrid },
  { href: "/optimizer", label: "Cost Optimizer", icon: DollarSign },
  { href: "/upload", label: "Upload", icon: UploadCloud },
]

export default function Nav() {
  const pathname = usePathname()
  
  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start" tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
