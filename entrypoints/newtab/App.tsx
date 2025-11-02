import React from 'react';
import { CONTACT_EMAIL, GITHUB_REPO_URL } from '@/lib/constants';
import NewTabHeader from './components/NewTabHeader';
import HistorySection from './components/HistorySection';
import BookmarkSection from './components/BookmarkSection';
import ThemeModal from './components/ThemeModal';
import FolderModal from './components/FolderModal';
import FirstRunTour from './components/FirstRunTour';
import useHook from './useHook';

const App: React.FC = () => {
  const {
    mode,
    setMode,
    searchQuery,
    setSearchQuery,
    historyHeaderSubtitle,
    currentThemeName,
    isThemeModalOpen,
    openThemeModal,
    closeThemeModal,
    openGithubModal,
    closeGithubModal,
    openContactModal,
    closeContactModal,
    isGithubModalOpen,
    isContactModalOpen,
    refreshVisits,
    clearVisits,
    hasHistory,
    visits,
    loading,
    filteredVisits,
    hasVisits,
    savedUrlSet,
    openFolderModal,
    sidebarNodes,
    isSavedEmpty,
    currentFolderName,
    breadcrumb,
    processedSavedItems,
    currentSavedFolderId,
    resolveFolderName,
    createRootFolder,
    createSubfolder,
    renameCurrentFolder,
    deleteCurrentFolder,
    openCurrentFolderItems,
    onRemoveSavedItem,
    exportFolders,
    importFolders,
    importFromChrome,
    renameSavedItem,
    renameSavedTitle,
    manageSavedItem,
    isFolderModalOpen,
    folderModalTitle,
    folderTree,
    folderModalNewName,
    setFolderModalNewName,
    createFolder,
    closeFolderModal,
    savePendingVisit,
    themeId,
    changeTheme,
    isTourOpen,
    closeTour,
  } = useHook();

  return (
    <div className="w-full space-y-8 px-4 pb-10 pt-6 md:px-8 lg:px-12">
      <NewTabHeader
        subtitle={historyHeaderSubtitle}
        mode={mode}
        onModeChange={setMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        currentThemeName={currentThemeName}
        onOpenThemeModal={openThemeModal}
        isThemeModalOpen={isThemeModalOpen}
        onRefresh={refreshVisits}
        onClearHistory={clearVisits}
        hasHistory={hasHistory}
        onOpenGithubModal={openGithubModal}
        onOpenContactModal={openContactModal}
      />

      <main className="space-y-8">
        {mode === 'history' ? (
          <HistorySection
            loading={loading}
            visits={visits}
            filteredVisits={filteredVisits}
            hasVisits={hasVisits}
            savedUrlSet={savedUrlSet}
            onSaveClick={(visit) => {
              openFolderModal(visit);
            }}
          />
        ) : (
          <BookmarkSection
            sidebarNodes={sidebarNodes}
            isEmpty={isSavedEmpty}
            currentFolderName={currentFolderName}
            breadcrumb={breadcrumb}
            savedItems={processedSavedItems}
            currentSavedFolderId={currentSavedFolderId}
            resolveFolderName={resolveFolderName}
            onCreateRootFolder={createRootFolder}
            onCreateSubfolder={createSubfolder}
            onRenameFolder={renameCurrentFolder}
            onDeleteFolder={deleteCurrentFolder}
            onRemoveSavedItem={(folderId, url) => void onRemoveSavedItem(folderId, url)}
            onExportFolders={exportFolders}
            onImportFolders={importFolders}
            onImportFromChrome={importFromChrome}
            onRenameSavedItem={renameSavedItem}
            onRenameSavedTitle={renameSavedTitle}
            onManageSavedItem={(folderId, item) => manageSavedItem(folderId, item)}
            onOpenAllSavedItems={(items) => openCurrentFolderItems(items)}
          />
        )}
      </main>

      {isThemeModalOpen ? (
        <ThemeModal
          open={isThemeModalOpen}
          currentThemeId={themeId}
          onClose={closeThemeModal}
          onChangeTheme={(id) => changeTheme(id)}
        />
      ) : null}

      {isFolderModalOpen ? (
        <FolderModal
          open={isFolderModalOpen}
          title={folderModalTitle}
          foldersEmpty={isSavedEmpty}
          folderTree={folderTree}
          newName={folderModalNewName}
          onChangeNewName={(v: string) => setFolderModalNewName(v)}
          onCreateFolder={(name: string, parentId: string | null = null) => void createFolder(name, parentId)}
          onClose={closeFolderModal}
          onSave={() => void savePendingVisit()}
        />
      ) : null}

      {/* {isTourOpen ? (
        <FirstRunTour open={isTourOpen} onClose={closeTour} />
      ) : null} */}

      {isGithubModalOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => closeGithubModal()}
        >
          <div
            className="bs-surface w-full max-w-md space-y-4 rounded-lg border border-white/20 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="space-y-1">
              <h3 className="text-lg font-semibold">GitHub Repository</h3>
              <p className="text-sm opacity-70">
                Find the source code, issue tracker, and documentation of the Bookmark Saga project.
              </p>
            </header>
            <div className="space-y-2 text-sm">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold"
              >
                {GITHUB_REPO_URL}
              </a>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-semibold"
                onClick={() => closeGithubModal()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isContactModalOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => closeContactModal()}
        >
          <div
            className="bs-surface w-full max-w-md space-y-4 rounded-lg border border-white/20 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="space-y-1">
              <h3 className="text-lg font-semibold">Contact Me</h3>
              <p className="text-sm opacity-70">
                Send a message via email or contact us directly using the details below.
              </p>
            </header>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-60">Email</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-1 inline-flex items-center gap-2 text-blue-600 transition hover:underline dark:text-blue-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-semibold"
                onClick={() => closeContactModal()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default App;
