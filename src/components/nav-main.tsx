import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const isMessagesActive = location.pathname.startsWith("/dashboard/messages");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Import"
              className="bg-primary hover:bg-primary/90 active:bg-primary/90 min-w-8 duration-200 ease-linear text-primary-foreground hover:text-primary-foreground"
              asChild
            >
              <Link to="/dashboard/candidates/quick-import">
                <IconCirclePlusFilled />
                <span>Quick Import</span>
              </Link>
            </SidebarMenuButton>
            <Button
              size="icon"
              className={`size-8 group-data-[collapsible=icon]:opacity-0 hover:text-sidebar-accent ${
                isMessagesActive ? "bg-sidebar-accent text-sidebar-accent" : ""
              }`}
              variant="outline"
              asChild
            >
              <Link to="/dashboard/messages">
                <IconMail />
                <span className="sr-only">Messages</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            // Check if current path starts with the item's URL for nested route support
            const isActive =
              item.url === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link to={item.url} className="[&:hover]:!text-black dark:[&:hover]:!text-white [&:hover>svg]:!text-black dark:[&:hover>svg]:!text-white">
                    {item.icon && <item.icon className="transition-colors" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
