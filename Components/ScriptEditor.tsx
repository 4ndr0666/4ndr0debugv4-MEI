import React from 'react';
import { useInputContext } from '../AppContext.tsx';
import { useLoadingStateContext } from '../contexts/SessionContext.tsx';

export const ScriptEditor: React.FC = () => {
    const { workbenchScript, setWorkbenchScript } = useInputContext();
    const { isChatLoading } = useLoadingStateContext();

    const textareaClasses = `
    block w-full h-full p-3 font-mono text-sm text-[var(--hud-color)]
    focus:outline-none focus:ring-1 focus:ring-[var(--hud-color)]
    resize-none placeholder:text-transparent bg-black/70 border border-[var(--hud-color-darkest)]
    transition-all duration-150
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className="flex flex-col flex-grow min-h-0">
            <h2 className="text-xl text-center mb-4 flex-shrink-0">Script Editor</h2>
            <div className="relative flex-grow min-h-0">
                <textarea
                    id="workbench-script-editor"
                    className={textareaClasses}
                    value={workbenchScript}
                    onChange={(e) => setWorkbenchScript(e.target.value)}
                    disabled={isChatLoading}
                    aria-label="Workbench script editor"
                    placeholder=" "
                    title="Paste or edit script here. The AI will use this as context for all chat messages."
                />
            </div>
        </div>
    );
};