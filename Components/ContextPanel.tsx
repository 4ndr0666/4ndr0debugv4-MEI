import React from 'react';
import { AccordionItem } from './AccordionItem.tsx';
import { TargetDossier } from './TargetDossier.tsx';
import { SystemStatus } from './SystemStatus.tsx';
import { RevisionHistory } from './RevisionHistory.tsx';

export const ContextPanel: React.FC = () => {
    return (
        <div className="flex flex-col flex-grow min-h-0">
            <h2 className="text-xl text-center mb-4 flex-shrink-0">Context Panel</h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                <AccordionItem title="Target Dossier">
                    <TargetDossier />
                </AccordionItem>
                <AccordionItem title="System Status">
                    <SystemStatus />
                </AccordionItem>
                <AccordionItem title="Revision History" defaultOpen={true}>
                    <RevisionHistory />
                </AccordionItem>
            </div>
        </div>
    );
};