import { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FileSources, LocalStorageKeys } from 'librechat-data-provider';
import type { ExtendedFile } from '~/common';
import useResetArtifactsOnConversationChange from '~/hooks/Artifacts/useResetArtifactsOnConversationChange';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { EditorProvider, ArtifactsProvider } from '~/Providers';
import { useDeleteFilesMutation } from '~/data-provider';
import Artifacts from '~/components/Artifacts/Artifacts';
import { SidePanelGroup } from '~/components/SidePanel';
import { useSetFilesToDelete } from '~/hooks';
import store from '~/store';

export default function Presentation({ children }: { children: React.ReactNode }) {
  const artifacts = useRecoilValue(store.artifactsState);
  const artifactsVisibility = useRecoilValue(store.artifactsVisibility);
  // Render-gating the panel on `currentArtifactId != null` (in addition
  // to visibility + non-empty artifacts) means the side panel only opens
  // when *something* is actively focused. Conversation navigation
  // resets `currentArtifactId` to null, so the panel stays closed when
  // a user revisits an old conversation full of artifacts. New artifacts
  // arriving via SSE auto-focus through `ToolArtifactCard`'s mount effect
  // (gated on `isSubmitting`), restoring the legacy streaming UX.
  const currentArtifactId = useRecoilValue(store.currentArtifactId);

  useResetArtifactsOnConversationChange();

  const setFilesToDelete = useSetFilesToDelete();

  const { mutateAsync } = useDeleteFilesMutation({
    onSuccess: () => {
      console.log('Temporary Files deleted');
      setFilesToDelete({});
    },
    onError: (error) => {
      console.log('Error deleting temporary files:', error);
    },
  });

  useEffect(() => {
    const filesToDelete = localStorage.getItem(LocalStorageKeys.FILES_TO_DELETE);
    const map = JSON.parse(filesToDelete ?? '{}') as Record<string, ExtendedFile>;
    const files = Object.values(map)
      .filter(
        (file) =>
          file.filepath != null && file.source && !(file.embedded ?? false) && file.temp_file_id,
      )
      .map((file) => ({
        file_id: file.file_id,
        filepath: file.filepath as string,
        source: file.source as FileSources,
        embedded: !!(file.embedded ?? false),
      }));

    if (files.length === 0) {
      return;
    }
    mutateAsync({ files });
  }, [mutateAsync]);

  const artifactsElement = useMemo(() => {
    if (
      artifactsVisibility === true &&
      currentArtifactId != null &&
      Object.keys(artifacts ?? {}).length > 0
    ) {
      return (
        <ArtifactsProvider>
          <EditorProvider>
            <Artifacts />
          </EditorProvider>
        </ArtifactsProvider>
      );
    }
    return null;
  }, [artifactsVisibility, artifacts, currentArtifactId]);

  return (
    <DragDropWrapper className="relative flex w-full grow overflow-hidden" style={{ background: '#111827' }}>
      {/* Neon glow blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right pink blob */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '45%', height: '50%',
          background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)',
          opacity: 0.35, filter: 'blur(60px)',
        }} />
        {/* Center-left blue blob */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: '50%', height: '55%',
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          opacity: 0.4, filter: 'blur(70px)',
        }} />
        {/* Bottom-left lime blob */}
        <div style={{
          position: 'absolute', bottom: '5%', left: '-5%',
          width: '40%', height: '40%',
          background: 'radial-gradient(circle, #84CC16 0%, transparent 70%)',
          opacity: 0.3, filter: 'blur(60px)',
        }} />
        {/* Bottom-center blue blob */}
        <div style={{
          position: 'absolute', bottom: '-5%', left: '30%',
          width: '45%', height: '45%',
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          opacity: 0.35, filter: 'blur(65px)',
        }} />
        {/* Mid-right pink blob */}
        <div style={{
          position: 'absolute', bottom: '20%', right: '-5%',
          width: '35%', height: '40%',
          background: 'radial-gradient(circle, #DB2777 0%, transparent 70%)',
          opacity: 0.25, filter: 'blur(55px)',
        }} />
      </div>
      <SidePanelGroup artifacts={artifactsElement}>
        <main className="flex h-full flex-col overflow-y-auto" role="main">
          {children}
        </main>
      </SidePanelGroup>
    </DragDropWrapper>
  );
}
