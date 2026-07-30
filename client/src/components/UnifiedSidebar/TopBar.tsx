import { memo, useCallback, lazy, Suspense, useState, useRef, useEffect, startTransition } from 'react';
import { useRecoilValue } from 'recoil';
import { SquarePen, ChevronDown } from 'lucide-react';
import { QueryKeys } from 'librechat-data-provider';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton, Button, TooltipAnchor } from '@librechat/client';
import type { NavLink } from '~/common';
import { useActivePanel, resolveActivePanel, DEFAULT_PANEL } from '~/Providers';
import { useLocalize, useNewConvo } from '~/hooks';
import { clearMessagesCache, cn } from '~/utils';
import store from '~/store';

const AccountSettings = lazy(() => import('~/components/Nav/AccountSettings'));

const NewChatButton = memo(function NewChatButton({
  setActive,
}: {
  setActive: (id: string) => void;
}) {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { newConversation } = useNewConvo();
  const conversationId = useRecoilValue(store.conversationIdByIndex(0));
  const switchToHistory = useRecoilValue(store.newChatSwitchToHistory);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        clearMessagesCache(queryClient, conversationId);
        queryClient.invalidateQueries([QueryKeys.messages]);
        newConversation();
        if (switchToHistory) {
          setActive(DEFAULT_PANEL);
        }
      }
    },
    [queryClient, conversationId, newConversation, switchToHistory, setActive],
  );

  return (
    <TooltipAnchor
      side="bottom"
      description={localize('com_ui_new_chat')}
      render={
        <a
          href="/c/new"
          data-testid="new-chat-button"
          aria-label={localize('com_ui_new_chat')}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-surface-hover"
          onClick={handleClick}
        >
          <SquarePen className="h-4 w-4 text-text-primary" />
        </a>
      }
    />
  );
});

const NavIconButton = memo(function NavIconButton({
  link,
  isActive,
  panelOpen,
  setActive,
  onToggle,
}: {
  link: NavLink;
  isActive: boolean;
  panelOpen: boolean;
  setActive: (id: string) => void;
  onToggle: () => void;
}) {
  const localize = useLocalize();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (link.onClick) {
        link.onClick(e);
        return;
      }
      if (isActive && panelOpen) {
        onToggle();
        return;
      }
      if (!isActive) {
        setActive(link.id);
      }
      if (!panelOpen) {
        onToggle();
      }
    },
    [link, isActive, setActive, panelOpen, onToggle],
  );

  return (
    <TooltipAnchor
      description={localize(link.title)}
      side="bottom"
      render={
        <Button
          size="sm"
          variant="ghost"
          aria-label={localize(link.title)}
          aria-pressed={isActive && panelOpen}
          data-testid={`nav-panel-${link.id}`}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm',
            isActive && panelOpen
              ? 'bg-surface-active-alt text-text-primary'
              : 'text-text-secondary',
          )}
          onClick={handleClick}
        >
          <link.icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{localize(link.title)}</span>
          {isActive && panelOpen && <ChevronDown className="h-3 w-3 opacity-60" />}
        </Button>
      }
    />
  );
});

/** Dropdown panel that appears below the topbar */
function TopBarPanel({
  links,
  onClose,
}: {
  links: NavLink[];
  onClose: () => void;
}) {
  const { active } = useActivePanel();
  const effectiveActive = resolveActivePanel(active, links);

  const activeLink = links.find((l) => l.id === effectiveActive);
  if (!activeLink?.Component) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 border-b border-border-light bg-surface-primary-alt shadow-lg"
      style={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      <activeLink.Component />
    </div>
  );
}

function TopBar({ links }: { links: NavLink[] }) {
  const localize = useLocalize();
  const [panelOpen, setPanelOpen] = useState(false);
  const { active, setActive } = useActivePanel();
  const effectiveActive = resolveActivePanel(active, links);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setPanelOpen((prev) => !prev);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Top navigation bar */}
      <div className="flex h-12 w-full items-center justify-between border-b border-border-light bg-surface-primary-alt px-3">
        {/* Left: logo area + new chat */}
        <div className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="Base44" className="h-6 w-auto" />
          <div className="mx-2 h-5 w-px bg-border-light" />
          <NewChatButton setActive={setActive} />
        </div>

        {/* Center: nav icon buttons */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <NavIconButton
              key={link.id}
              link={link}
              isActive={link.id === effectiveActive}
              panelOpen={panelOpen}
              setActive={setActive}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Right: account */}
        <div className="flex items-center">
          <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
            <AccountSettings collapsed />
          </Suspense>
        </div>
      </div>

      {/* Dropdown panel */}
      {panelOpen && <TopBarPanel links={links} onClose={() => setPanelOpen(false)} />}
    </div>
  );
}

export default memo(TopBar);
