import React, { useEffect } from 'react';
import { useChatStateContext, useSessionActionsContext } from '../contexts/SessionContext.tsx';
import { ChatInterface } from './ChatInterface.tsx';
import { ScriptEditor } from './ScriptEditor.tsx';
import { ContextPanel } from './ContextPanel.tsx';

interface WorkbenchProps {
    onAttachFileClick: () => void;
    onOpenProjectFilesModal: () => void;
    onSaveChatSession: () => void;
}

export const Workbench: React.FC<WorkbenchProps> = ({ onAttachFileClick, onOpenProjectFilesModal, onSaveChatSession }) => {
    const { isChatMode } = useChatStateContext();
    const { handleStartFollowUp, handleLoadRevisionIntoEditor } = useSessionActionsContext();
    
    useEffect(() => {
        if (!isChatMode) {
            handleStartFollowUp();
        }
    }, [isChatMode, handleStartFollowUp]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6 lg:gap-8 h-full min-w-0">
            {/* Panel 1: Script Editor */}
            <div className="hud-container flex flex-col min-h-0">
                <div className="hud-corner corner-top-left"></div>
                <div className="hud-corner corner-top-right"></div>
                <div className="hud-corner corner-bottom-left"></div>
                <div className="hud-corner corner-bottom-right"></div>
                <ScriptEditor />
            </div>

            {/* Panel 2: Command Log (Chat) */}
            <div className="hud-container flex flex-col min-h-0">
                <div className="hud-corner corner-top-left"></div>
                <div className="hud-corner corner-top-right"></div>
                <div className="hud-corner corner-bottom-left"></div>
                <div className="hud-corner corner-bottom-right"></div>
                {isChatMode ? (
                    <ChatInterface 
                        onSaveChatSession={onSaveChatSession} 
                        onAttachFileClick={onAttachFileClick}
                        onOpenProjectFilesModal={onOpenProjectFilesModal}
                        onLoadCodeIntoWorkbench={handleLoadRevisionIntoEditor}
                    />
                ) : (
                    <div className="text-center text-[var(--hud-color-darker)]">Initializing comms link...</div>
                )}
            </div>

            {/* Panel 3: Context Panel */}
            <div className="hud-container flex flex-col min-h-0">
                 <div className="hud-corner corner-top-left"></div>
                <div className="hud-corner corner-top-right"></div>
                <div className="hud-corner corner-bottom-left"></div>
                <div className="hud-corner corner-bottom-right"></div>
                <ContextPanel />
            </div>
        </div>
    );
};