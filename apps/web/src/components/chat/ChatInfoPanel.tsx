import type { AuthUser, ChatDto, MessageSearchResultDto, PublishedKeyBundleDto } from '@chat-app/shared';
import type { ReactNode } from 'react';

import { Check, ChevronDown, Copy, PencilLine, Search, ShieldCheck, TimerReset, UserPlus, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { searchLocalMessages } from '@/features/messages/search';
import { messagesApi } from '@/features/messages/api';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const InfoRow = ({
  label,
  value,
  mono = false,
  onCopy,
  copied = false
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted/90">{label}</p>
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-muted transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent dark:bg-slate-950/70"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      ) : null}
    </div>
    <div
      className={`rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.84))] px-3.5 py-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.62))] dark:text-slate-100 ${
        mono ? 'break-all font-mono text-[11px] leading-6 tracking-[0.02em]' : 'leading-6'
      }`}
    >
      {value}
    </div>
  </div>
);

const SectionCard = ({
  icon,
  title,
  subtitle,
  defaultOpen = true,
  children,
  actions
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: ReactNode;
  actions?: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="glass-card rounded-[30px] p-5 transition-all duration-200 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent dark:text-emerald-200">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex w-full items-start justify-between gap-3 text-left"
          >
            <div>
              <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
            </div>
            <span
              className={`mt-0.5 rounded-full border border-line bg-white/70 p-1.5 text-muted transition-transform duration-200 dark:bg-slate-950/70 ${
                open ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </button>
          <div
            className={`grid transition-all duration-200 ease-out ${
              open ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-70'
            }`}
          >
            <div className="overflow-hidden">
              {children}
              {actions ? <div className="mt-4 border-t border-line/70 pt-4">{actions}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SafetyPattern = ({ seed }: { seed: string }) => {
  const cells = Array.from({ length: 81 }, (_, index) => {
    const source = seed.charCodeAt(index % Math.max(seed.length, 1)) || index * 17;
    return ((source + index * 13) % 7) < 3;
  });

  return (
    <div className="grid grid-cols-9 gap-1 rounded-[24px] border border-accent/20 bg-white p-3 shadow-inner dark:bg-slate-950">
      {cells.map((active, index) => (
        <div
          key={index}
          className={`h-5 w-5 rounded-md transition-colors ${active ? 'bg-accent' : 'bg-accent/10'}`}
        />
      ))}
    </div>
  );
};

type ChatInfoPanelProps = {
  chat: ChatDto;
  currentUser: AuthUser;
  peerBundle?: PublishedKeyBundleDto;
  localFingerprint?: string | null;
  verification?: {
    status: 'unverified' | 'verified' | 'changed';
    combinedFingerprint: string;
    verifiedAt?: string | null;
  } | null;
  onVerifySafetyNumber: () => void;
  onUpdateDisappearingMode: (seconds: number) => void;
  onRenameGroup?: (name: string) => Promise<void> | void;
  isRenamingGroup?: boolean;
  directoryUsers?: AuthUser[];
  onAddGroupMember?: (userId: string) => Promise<void> | void;
  onRemoveGroupMember?: (userId: string) => Promise<void> | void;
  isUpdatingGroupMembers?: boolean;
  onClose: () => void;
};

const MemberBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center rounded-full border border-line/80 bg-white/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted shadow-sm dark:bg-slate-950/70">
    {label}
  </span>
);

const TIMER_OPTIONS = [
  { label: 'Off', seconds: 0 },
  { label: '5 min', seconds: 300 },
  { label: '1 hour', seconds: 3600 },
  { label: '1 day', seconds: 86400 }
];

const getOtherParticipant = (chat: ChatDto, currentUserId: string) =>
  chat.participants.find((participant) => participant.id !== currentUserId) ?? chat.participants[0];

export const ChatInfoPanel = ({
  chat,
  currentUser,
  peerBundle,
  localFingerprint,
  verification,
  onVerifySafetyNumber,
  onUpdateDisappearingMode,
  onRenameGroup,
  isRenamingGroup,
  directoryUsers = [],
  onAddGroupMember,
  onRemoveGroupMember,
  isUpdatingGroupMembers,
  onClose
}: ChatInfoPanelProps) => {
  const otherUser = getOtherParticipant(chat, currentUser.id);
  const groupMembers = chat.participants.filter((participant) => participant.id !== currentUser.id);
  const primaryDevice = peerBundle?.devices[0];
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MessageSearchResultDto[]>([]);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSafetySheetOpen, setIsSafetySheetOpen] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(chat.name ?? '');
  const debouncedSearch = useDebouncedValue(search.trim(), 240);
  const canManageGroup = chat.isGroupChat && chat.admins.includes(currentUser.id);
  const availableUsers = directoryUsers.filter(
    (candidate) => candidate.id !== currentUser.id && !chat.participants.some((participant) => participant.id === candidate.id)
  );
  const safetySeed =
    verification?.combinedFingerprint ?? `${localFingerprint ?? 'local'}:${primaryDevice?.fingerprint ?? 'peer'}`;

  useEffect(() => {
    setGroupNameDraft(chat.name ?? '');
    setIsEditingGroupName(false);
  }, [chat.id, chat.name]);

  useEffect(() => {
    let cancelled = false;

    if (!debouncedSearch) {
      setSearchResults([]);
      setIsSearchingMessages(false);
      return;
    }

    setIsSearchingMessages(true);

    const load = async () => {
      if (chat.isGroupChat) {
        const results = await messagesApi.search(chat.id, debouncedSearch, 8);

        if (!cancelled) {
          setSearchResults(results);
          setIsSearchingMessages(false);
        }

        return;
      }

      const results = await searchLocalMessages(currentUser.id, debouncedSearch);

      if (!cancelled) {
        setSearchResults(
          results
            .filter((item) => item.chatId === chat.id)
            .slice(0, 8)
            .map((item) => ({
              messageId: item.messageId,
              chatId: item.chatId,
              type: 'text',
              previewText: item.text,
              matchSource: 'ciphertext',
              attachmentName: null,
              sender: {
                id: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl ?? null
              },
              createdAt: item.createdAt
            }))
        );
        setIsSearchingMessages(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [chat.id, chat.isGroupChat, currentUser, debouncedSearch]);

  const verificationLabel = useMemo(() => {
    if (!verification) {
      return 'Unverified';
    }

    if (verification.status === 'verified') {
      return verification.verifiedAt ? `Verified on ${new Date(verification.verifiedAt).toLocaleString()}` : 'Verified';
    }

    if (verification.status === 'changed') {
      return 'Peer device changed';
    }

    return 'Unverified';
  }, [verification]);

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1600);
    } catch {
      toast.error('Unable to copy right now');
    }
  };

  const handleRenameGroup = async () => {
    const trimmed = groupNameDraft.trim();

    if (!trimmed || trimmed === (chat.name ?? '').trim() || !onRenameGroup) {
      setIsEditingGroupName(false);
      setGroupNameDraft(chat.name ?? '');
      return;
    }

    try {
      await onRenameGroup(trimmed);
      setIsEditingGroupName(false);
    } catch {
      // parent mutation shows the toast
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm xl:hidden" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[380px] min-h-0 flex-col overflow-hidden border-l border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_30px_120px_rgba(15,23,42,0.22)] backdrop-blur-2xl transition-all duration-200 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.94))] xl:relative xl:inset-auto xl:z-auto xl:w-[360px] xl:max-w-none xl:shadow-none">
        <div className="border-b border-line/80 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Security and conversation</p>
            <p className="mt-1 text-xs leading-5 text-muted">Safety number, timer, members, and local search</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white/70 p-2 text-muted transition hover:border-accent/25 hover:text-accent dark:bg-slate-950/70"
          >
            <X className="h-4 w-4" />
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {chat.isGroupChat ? (
            <section className="glass-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar src={null} alt={chat.name ?? 'Group chat'} size="lg" />
                {isEditingGroupName ? (
                  <div className="mt-4 w-full space-y-2">
                    <Input
                      value={groupNameDraft}
                      onChange={(event) => setGroupNameDraft(event.target.value)}
                      maxLength={60}
                      placeholder="Group name"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => {
                          setIsEditingGroupName(false);
                          setGroupNameDraft(chat.name ?? '');
                        }}
                        disabled={isRenamingGroup}
                      >
                        Cancel
                      </Button>
                      <Button fullWidth onClick={() => void handleRenameGroup()} disabled={isRenamingGroup}>
                        {isRenamingGroup ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2">
                    <h3 className="text-[28px] font-semibold leading-none">{chat.name ?? 'Untitled group'}</h3>
                    {canManageGroup ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingGroupName(true)}
                        className="rounded-full border border-line p-2 text-muted transition hover:border-accent/30 hover:text-accent"
                        title="Rename group"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                )}
                <p className="mt-2 text-sm text-muted">{chat.participants.length} members</p>
                <p className="mt-4 max-w-[240px] text-sm leading-6 text-muted">
                  Group messaging is available as a server-group MVP. Direct chats remain the end-to-end encrypted mode.
                </p>
              </div>
              <div className="mt-6 space-y-2.5 border-t border-line/70 pt-5">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.72))] px-3 py-3 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))]"
                  >
                    <Avatar src={member.avatarUrl} alt={member.name} online={member.isOnline} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{member.name}</p>
                      <p className="truncate text-xs text-muted">@{member.username}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {chat.admins.includes(member.id) ? <MemberBadge label="Admin" /> : null}
                      {member.id === chat.createdBy ? <MemberBadge label="Owner" /> : null}
                      {canManageGroup && member.id !== chat.createdBy ? (
                        <button
                          type="button"
                          onClick={() => void onRemoveGroupMember?.(member.id)}
                          className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-950/30"
                          disabled={isUpdatingGroupMembers}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : otherUser ? (
            <section className="glass-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar src={otherUser.avatarUrl} alt={otherUser.name} online={otherUser.isOnline} size="lg" />
                <h3 className="mt-4 text-[28px] font-semibold leading-none">{otherUser.name}</h3>
                <p className="mt-2 text-sm text-muted">@{otherUser.username}</p>
                <div className="mt-4 flex items-center gap-2">
                  <MemberBadge label="Direct chat" />
                  <MemberBadge label="E2EE" />
                </div>
                <p className="mt-4 max-w-[250px] text-sm leading-6 text-muted">
                  {otherUser.bio ?? 'No bio added yet.'}
                </p>
              </div>
            </section>
          ) : null}

          {chat.isGroupChat && canManageGroup ? (
            <SectionCard
              icon={<UserPlus className="h-5 w-5 text-accent" />}
              title="Manage members"
              subtitle="Add people to this group or remove existing members."
              defaultOpen={false}
            >
              <div className="space-y-3">
                {availableUsers.length > 0 ? (
                  availableUsers.slice(0, 8).map((candidate) => (
                    <div
                      key={candidate.id}
                    className="flex items-center gap-3 rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.72))] px-3 py-3 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))]"
                    >
                      <Avatar src={candidate.avatarUrl} alt={candidate.name} online={candidate.isOnline} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{candidate.name}</p>
                        <p className="truncate text-xs text-muted">@{candidate.username}</p>
                      </div>
                      <Button
                        variant="secondary"
                        className="rounded-full px-3 py-2 text-xs"
                        onClick={() => void onAddGroupMember?.(candidate.id)}
                        disabled={isUpdatingGroupMembers}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.76))] px-3 py-3 text-sm text-muted dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.64))]">
                    No more users are available to add right now.
                  </div>
                )}
              </div>
            </SectionCard>
          ) : null}

          {chat.isGroupChat ? (
            <SectionCard
              icon={<ShieldCheck className="h-5 w-5 text-accent" />}
              title="Security mode"
              subtitle="Server-group MVP"
            >
              <div className="space-y-3 text-sm leading-6 text-muted">
                <div className="rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.76))] px-3 py-3 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.64))]">
                  Group chats currently send server-visible text metadata and content for collaboration MVP flows.
                </div>
                <div className="rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.76))] px-3 py-3 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.64))]">
                  Safety numbers and peer device verification apply to encrypted direct conversations only.
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              icon={<ShieldCheck className="h-5 w-5 text-accent" />}
              title="Safety number"
              subtitle={verificationLabel}
              actions={
                <div className="space-y-2">
                  <Button fullWidth onClick={onVerifySafetyNumber} disabled={!primaryDevice || !localFingerprint}>
                    Mark as verified
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsSafetySheetOpen(true)}
                    disabled={!localFingerprint}
                  >
                    View full verification sheet
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                <InfoRow
                  label="Your fingerprint"
                  value={localFingerprint ?? 'Loading...'}
                  mono
                  onCopy={localFingerprint ? () => void handleCopy('local-fingerprint', localFingerprint) : undefined}
                  copied={copiedField === 'local-fingerprint'}
                />
                <InfoRow
                  label="Peer fingerprint"
                  value={primaryDevice?.fingerprint ?? 'Waiting for peer device key...'}
                  mono
                  onCopy={
                    primaryDevice?.fingerprint
                      ? () => void handleCopy('peer-fingerprint', primaryDevice.fingerprint)
                      : undefined
                  }
                  copied={copiedField === 'peer-fingerprint'}
                />
                <InfoRow
                  label="Safety number"
                  value={verification?.combinedFingerprint ?? 'Compare once peer bundle is available'}
                  mono
                  onCopy={
                    verification?.combinedFingerprint
                      ? () => void handleCopy('safety-number', verification.combinedFingerprint)
                      : undefined
                  }
                  copied={copiedField === 'safety-number'}
                />
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={<TimerReset className="h-5 w-5 text-accent" />}
              title="Disappearing timer"
            subtitle="Server purges expired ciphertext automatically."
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-2">
              {TIMER_OPTIONS.map((option) => (
                <Button
                  key={option.seconds}
                  variant={chat.disappearingModeSeconds === option.seconds ? 'primary' : 'secondary'}
                  onClick={() => onUpdateDisappearingMode(option.seconds)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={<Search className="h-5 w-5 text-accent" />}
            title="Message search"
            subtitle={
              chat.isGroupChat
                ? 'Server-assisted search for group text and attachment names.'
                : 'Local decrypted search for direct E2EE messages.'
            }
            defaultOpen={false}
          >
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={chat.isGroupChat ? 'Search group messages' : 'Search decrypted messages'}
            />
            <div className="mt-3 space-y-2">
              {isSearchingMessages ? (
                <p className="text-xs text-muted">Searching messages...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div key={item.messageId} className="rounded-[22px] border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.74))] px-3 py-3 text-sm shadow-sm dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.64))]">
                    <p className="line-clamp-2">{item.previewText}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                      {item.matchSource}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">
                  {search
                    ? chat.isGroupChat
                      ? 'No matching group messages or attachments found.'
                      : 'No local hits yet for this direct chat.'
                    : chat.isGroupChat
                      ? 'Type to search group messages and attachment names.'
                      : 'Type to search your local decrypted cache.'}
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {isSafetySheetOpen ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[320px] rounded-[30px] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_20px_80px_rgba(15,23,42,0.22)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Verify together</p>
                  <h3 className="mt-1 text-lg font-semibold">Safety verification sheet</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Compare this code on both devices before marking the conversation as verified.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSafetySheetOpen(false)}
                  className="rounded-full border border-line bg-white/75 p-2 text-muted dark:bg-slate-950/75"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center rounded-[28px] border border-dashed border-accent/30 bg-emerald-50/70 px-6 py-8 text-center dark:bg-emerald-950/20">
                <div className="space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <SafetyPattern seed={safetySeed} />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Verification code</p>
                  <p className="break-all font-mono text-sm leading-6 text-slate-800 dark:text-slate-100">
                    {verification?.combinedFingerprint ?? 'Compare once peer bundle is available'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow
                  label="Your fingerprint"
                  value={localFingerprint ?? 'Loading...'}
                  mono
                  onCopy={localFingerprint ? () => void handleCopy('sheet-local-fingerprint', localFingerprint) : undefined}
                  copied={copiedField === 'sheet-local-fingerprint'}
                />
                <InfoRow
                  label="Peer fingerprint"
                  value={primaryDevice?.fingerprint ?? 'Waiting for peer device key...'}
                  mono
                  onCopy={
                    primaryDevice?.fingerprint
                      ? () => void handleCopy('sheet-peer-fingerprint', primaryDevice.fingerprint)
                      : undefined
                  }
                  copied={copiedField === 'sheet-peer-fingerprint'}
                />
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() =>
                    verification?.combinedFingerprint
                      ? void handleCopy('sheet-safety-number', verification.combinedFingerprint)
                      : undefined
                  }
                  disabled={!verification?.combinedFingerprint}
                >
                  {copiedField === 'sheet-safety-number' ? 'Copied' : 'Copy code'}
                </Button>
                <Button fullWidth onClick={() => setIsSafetySheetOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
};
