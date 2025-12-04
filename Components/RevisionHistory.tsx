import React from 'react';
import { useChatStateContext, useSessionActionsContext, useLoadingStateContext } from '../contexts/SessionContext.tsx';
import { LoadIntoEditorIcon, DeleteIcon } from './Icons.tsx';
import { EditableTitle } from './EditableTitle.tsx';

export const RevisionHistory: React.FC = () => {
  const { chatRevisions } = useChatStateContext();
  const { isChatLoading } = useLoadingStateContext();
  const { handleLoadRevisionIntoEditor, onDeleteChatRevision, onRenameChatRevision } = useSessionActionsContext();
  
  const handleDeleteClick = (revisionId: string, revisionName: string) => {
    if (window.confirm(`Are you sure you want to delete the revision "${revisionName}"? This cannot be undone.`)) {
      onDeleteChatRevision(revisionId);
    }
  };

  if (!chatRevisions || chatRevisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center text-xs text-[var(--hud-color-darker)]">
        <p>Code revisions from this session will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...chatRevisions].reverse().map(revision => (
        <div key={revision.id} className="p-3 bg-black/50 border border-[var(--hud-color-darkest)]">
          <div className="flex justify-between items-center">
            <div className="flex-grow overflow-hidden mr-2">
              <EditableTitle
                initialTitle={revision.name}
                onSave={(newName) => onRenameChatRevision(revision.id, newName)}
                className="font-semibold text-sm text-[var(--hud-color)] uppercase tracking-wider cursor-pointer hover:text-white flex-1 truncate"
                inputClassName="bg-transparent font-semibold text-sm text-[var(--hud-color)] uppercase tracking-wider w-full outline-none border-b border-b-[var(--hud-color-darker)]"
                disabled={isChatLoading}
              />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleLoadRevisionIntoEditor(revision.code)}
                title="Load into Editor"
                className="p-1.5 text-[var(--hud-color)] rounded-full hover:bg-[var(--hud-color)]/20 focus:outline-none focus:ring-1 focus:ring-[var(--hud-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChatLoading}
              >
                <LoadIntoEditorIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(revision.id, revision.name)}
                title="Delete Revision"
                className="p-1.5 text-[var(--red-color)]/70 rounded-full hover:bg-red-500/30 hover:text-[var(--red-color)] focus:outline-none focus:ring-1 focus:ring-[var(--red-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChatLoading}
              >
                <DeleteIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
