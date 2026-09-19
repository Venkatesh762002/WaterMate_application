import React, { useState } from 'react';
import {
  Droplet,
  Home,
  ShoppingBag,
  CreditCard,
  Users,
  Settings,
  Copy,
  Check,
  ChevronDown,
  Plus,
  LogOut,
  User,
  DoorOpen,
} from 'lucide-react';
import { UserProfile, RoomSummary, RoomDetails } from '../types';

interface NavbarProps {
  user: UserProfile;
  currentRoom: RoomDetails | null;
  userRooms: RoomSummary[];
  activeTab: 'dashboard' | 'orders' | 'payments' | 'balances' | 'settings';
  onTabChange: (tab: 'dashboard' | 'orders' | 'payments' | 'balances' | 'settings') => void;
  onSelectRoom: (roomId: string) => void;
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentRoom,
  userRooms,
  activeTab,
  onTabChange,
  onSelectRoom,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenProfile,
  onLogout,
}) => {
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRoom?.room.inviteCode) {
      navigator.clipboard.writeText(currentRoom.room.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { id: 'payments' as const, label: 'Payments & Dues', icon: CreditCard },
    { id: 'balances' as const, label: 'Balances', icon: Users },
    { id: 'settings' as const, label: 'Room & Info', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => onTabChange('dashboard')}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                  <Droplet className="w-5 h-5 fill-white text-sky-100" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                    WaterMate
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Shared Can Manager</span>
                </div>
              </div>

              {/* Room Switcher Dropdown */}
              <div className="relative">
                <button
                  id="room-selector-button"
                  type="button"
                  onClick={() => {
                    setRoomDropdownOpen(!roomDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-semibold text-slate-800 border border-slate-200/60"
                >
                  <DoorOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span className="max-w-[130px] sm:max-w-[180px] truncate">
                    {currentRoom?.room.name || 'Select Room'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {roomDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Your Rooms
                    </div>
                    {userRooms.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          onSelectRoom(r.id);
                          setRoomDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-50 transition-colors ${
                          currentRoom?.room.id === r.id ? 'bg-sky-50/70 font-semibold text-sky-700' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{r.name}</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 uppercase font-medium">
                          {r.role}
                        </span>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        id="nav-create-room"
                        onClick={() => {
                          onOpenCreateRoom();
                          setRoomDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-sky-600 hover:bg-sky-50 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Room</span>
                      </button>
                      <button
                        type="button"
                        id="nav-join-room"
                        onClick={() => {
                          onOpenJoinRoom();
                          setRoomDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Join Room with Invite Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Invite Code Pill */}
              {currentRoom && (
                <button
                  type="button"
                  id="header-copy-invite"
                  onClick={handleCopyInvite}
                  title="Click to copy room invite code for roommates"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-medium hover:bg-sky-100 transition-all"
                >
                  <span className="text-[11px] text-sky-600 uppercase font-bold tracking-wider">Invite:</span>
                  <span className="font-mono font-bold tracking-wide">{currentRoom.room.inviteCode}</span>
                  {copiedInvite ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-sky-500" />
                  )}
                </button>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Menu */}
            <div className="relative flex items-center gap-2">
              <button
                id="user-profile-menu-button"
                type="button"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setRoomDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: user.avatarColor || '#0284c7' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500">@{user.username}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    {user.upiId && (
                      <p className="text-sky-600 text-[11px] font-mono mt-0.5">UPI: {user.upiId}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    id="menu-open-profile"
                    onClick={() => {
                      onOpenProfile();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profile & UPI Settings</span>
                  </button>
                  <button
                    type="button"
                    id="menu-logout"
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-sky-50' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
