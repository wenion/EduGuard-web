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

export function HeaderDropdownMenu() {
  const { logout, user, switchShowPeerRequest } = useAuth();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserIcon className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Hi {user?.name}!
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e)=> e.preventDefault()}>
            Compare with Peer
            <Switch
              id="airplane-mode"
              checked={compare}
              onCheckedChange={() => setShowPeer(!compare)}
              className="ml-auto"
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Refresh Data</DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
