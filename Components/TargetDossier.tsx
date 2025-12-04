import React from 'react';
import { useConfigContext } from '../AppContext.tsx';

export const TargetDossier: React.FC = () => {
    const { targetHostname } = useConfigContext();
    return (
        <div className="p-3 bg-black/30 border border-[var(--hud-color-darkest)] text-sm space-y-2">
            <div className="flex justify-between">
                <span className="text-[var(--hud-color-darker)]">HOSTNAME:</span>
                <span className="font-mono text-[var(--hud-color)] truncate pl-2">{targetHostname || 'N/A'}</span>
            </div>
        </div>
    );
};
