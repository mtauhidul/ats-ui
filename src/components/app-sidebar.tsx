import {
  IconBookmark,
  IconBriefcase,
  IconBuilding,
  IconDashboard,
  IconFileText,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconTag,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";
import { useUser } from "@clerk/clerk-react";

import { NavUtilities } from "@/components/nav-utilities";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: IconBuilding,
    },
    {
      title: "Jobs",
      url: "/dashboard/jobs",
      icon: IconBriefcase,
    },
    {
      title: "Candidates",
      url: "/dashboard/candidates",
      icon: IconUserCheck,
    },
    {
      title: "Applications",
      url: "/dashboard/applications",
      icon: IconFileText,
    },

    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
  ],
  utilities: [
    {
      name: "Tags",
      url: "/dashboard/tags",
      icon: IconTag,
    },
    {
      name: "Categories",
      url: "/dashboard/categories",
      icon: IconBookmark,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser();

  // Get user data from Clerk
  const userData = {
    name: user?.fullName || user?.firstName || "User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    avatar: user?.imageUrl || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">YTFCS ATS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavUtilities items={data.utilities} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {isLoaded && <NavUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  );
}
