import type { AuthUser, ChatDto } from '@chat-app/shared';

import { LaptopMinimalCheck, LogOut, Search, Settings, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ChatListItem } from '@/components/chat/ChatListItem';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog';

type ChatSidebarProps = {
  currentUser: AuthUser;
  chats: ChatDto[];
  activeChatId: string | null;
  search: string;
  searchResults: AuthUser[];
  isSearching: boolean;
  directoryUsers: AuthUser[];
  isCreatingGroup?: boolean;
  isGroupDialogOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
  onOpenDirect: (userId: string) => void;
  onOpenGroupDialog: () => void;
  onCloseGroupDialog: () => void;
  onCreateGroup: (payload: { name: string; participantIds: string[] }) => void;
  onLogout: () => void;
};

export const ChatSidebar = ({
  currentUser,
  chats,
  activeChatId,
  search,
  searchResults,
  isSearching,
  directoryUsers,
  isCreatingGroup,
  isGroupDialogOpen,
  onSearchChange,
  onSelectChat,
  onOpenDirect,
  onOpenGroupDialog,
  onCloseGroupDialog,
  onCreateGroup,
  onLogout
}: ChatSidebarProps) => (
  <>
    <CreateGroupDialog
      open={isGroupDialogOpen}
      users={directoryUsers}
      currentUserId={currentUser.id}
      isSubmitting={isCreatingGroup}
      onClose={onCloseGroupDialog}
      onCreate={onCreateGroup}
    />
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-line bg-card/80 backdrop-blur">
      <div className="border-b border-line p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={currentUser.avatarUrl} alt={currentUser.name} online={currentUser.isOnline} size="lg" />
            <div>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted">@{currentUser.username}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-9" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search users or jump into a DM" />
          </div>
          <Button variant="secondary" onClick={onOpenGroupDialog} title="Create group">
            <UsersRound className="h-4 w-4" />
          </Button>
          <Link to="/devices">
            <Button variant="secondary">
              <LaptopMinimalCheck className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        {search ? (
          <div className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">People</p>
            {isSearching ? (
              <p className="px-2 text-sm text-muted">Searching...</p>
            ) : (
              searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onOpenDirect(user.id)}
                  className="flex w-full items-center gap-3 rounded-3xl px-3 py-3 text-left transition hover:bg-bg"
                >
                  <Avatar src={user.avatarUrl} alt={user.name} online={user.isOnline} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">@{user.username}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUserId={currentUser.id}
                active={chat.id === activeChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line p-3">
        <Link to="/settings">
          <Button variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  </>
);
