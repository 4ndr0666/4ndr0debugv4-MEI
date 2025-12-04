import React from 'react';
import { useConfigContext } from '../AppContext.tsx';
import { usePersistenceContext } from '../contexts/PersistenceContext.tsx';

export const SystemStatus: React.FC = () => {
    const { appMode } = useConfigContext();
    const { versions, projectFiles } = usePersistenceContext();

    return (
        <div className="p-3 bg-black/30 border border-[var(--hud-color-darkest)] text-sm space-y-2">
            <div className="flex justify-between">
                <span className="text-[var(--hud-color-darker)]">OP MODE:</span>
                <span className="font-mono text-[var(--hud-color)] uppercase">{appMode}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-[var(--hud-color-darker)]">SAVED ASSETS:</span>
                <span className="font-mono text-[var(--hud-color)]">{versions.length} VER / {projectFiles.length} FILES</span>
            </div>
        </div>
    );
};
