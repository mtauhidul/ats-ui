import { useState } from "react";
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
import { QuickImportModal } from "@/components/modals/quick-import-modal";

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
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const isMessagesActive = location.pathname === "/dashboard/messages";

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Import"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              onClick={() => setIsQuickImportOpen(true)}
            >
              <IconCirclePlusFilled />
              <span>Quick Import</span>
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
            const isActive = location.pathname === item.url || 
              (item.url === "/dashboard" && location.pathname === "/dashboard");
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
      
      <QuickImportModal 
        open={isQuickImportOpen} 
        onOpenChange={setIsQuickImportOpen} 
      />
    </SidebarGroup>
  );
}
