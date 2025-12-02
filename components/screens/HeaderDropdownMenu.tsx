"use client";

import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { User as UserIcon } from 'lucide-react';

import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";

export function HeaderDropdownMenu() {
  const { logout, user, switchShowPeerRequest, setUnitId } = useAuth();

  const [open, setOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  useEffect(() => {
    if (user) {
      setCompare(user?.compareWithPeer);
    }
  }, [user]);

  const setShowPeer = async (value: boolean) => {
    switchShowPeerRequest(value);
    setCompare(value);
  };

  const onLogout = async () => {
    setUnitId(null);
    await logout();
  };

  return (
    <div id="userInfo" role="navigation" aria-label="Account actions">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <Button
            id="userIconButton"
            variant="ghost"
            attr-class="btn btn-usr dropdown-toggle show"
            data-bs-toggle="dropdown"
          >
            <UserIcon id="userIcon" className="cursor-pointer" />
            <span className="sr-only">Open user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent id="userMenu" className="w-56" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem className="italic">
              <p id="userDetail" attr-class="dropdown-header">
                {`${user ? `Hi! ${user?.name}` : "Welcome! Please log in first!"}`}
              </p>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  id="peerCompareToggleContainer"
                  onClick={(e)=> e.preventDefault()}
                >
                  <div id="peerCompareToggleDiv" className="flex items-center w-full">
                    <span>Compare with Peer</span>
                    <Switch
                      id="peerCompareToggle"
                      checked={compare}
                      onCheckedChange={() => setShowPeer(!compare)}
                      className="ml-auto"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!user?.name}
            attr-class="dropdown-item usr-options func-btn"
          >
            <Button
              variant="ghost"
              id="sidePanelRefreshButton"
              className="p-0 text-sm font-normal h-fit w-full justify-start cursor-pointer"
              disabled={!user?.name}
              attr-class="dropdown-item usr-options func-btn"
            >
              Refresh Data
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              id="sidePanelLogoutButton"
              className="p-0 text-sm font-normal h-fit w-full justify-start cursor-pointer"
              onClick={onLogout}
              disabled={!user?.name}
              attr-class="dropdown-item usr-options"
            >
              Log Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
