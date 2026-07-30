import { memo } from 'react';
import { useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { ChatFormValues } from '~/common';
import { ChatContext, ChatFormProvider, ActivePanelProvider } from '~/Providers';
import useUnifiedSidebarLinks from '~/hooks/Nav/useUnifiedSidebarLinks';
import { useChatHelpers } from '~/hooks';
import TopBar from './TopBar';

function SidebarChatProvider({ children }: { children: ReactNode }) {
  const chatHelpers = useChatHelpers(0);
  const sidebarFormMethods = useForm<ChatFormValues>({ defaultValues: { text: '' } });
  return (
    <ChatFormProvider {...sidebarFormMethods}>
      <ChatContext.Provider value={chatHelpers}>{children}</ChatContext.Provider>
    </ChatFormProvider>
  );
}

function UnifiedTopBar() {
  const links = useUnifiedSidebarLinks();

  return (
    <SidebarChatProvider>
      <ActivePanelProvider>
        <TopBar links={links} />
      </ActivePanelProvider>
    </SidebarChatProvider>
  );
}

export default memo(UnifiedTopBar);
