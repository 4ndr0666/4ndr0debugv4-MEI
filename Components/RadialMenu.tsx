import React, { useEffect, useMemo, useRef } from 'react';
import { useLoadingStateContext } from '../contexts/SessionContext.tsx';
import { SaveIcon, ImportIcon, BoltIcon, ChatIcon, HistoryIcon, EyeIcon, EyeOffIcon, DocsIcon, FolderIcon, ReportIcon, TargetIcon, PayloadIcon, CrosshairsIcon, ToastInfoIcon as InfoIcon } from './Icons.tsx';
import { ARSENAL, TOOL_CATEGORIES } from '../arsenal.ts';

interface RadialMenuProps {
    isOpen: boolean;
    onClose: () => void;
    // Actions from HeaderProps
    onImportClick: () => void;
    onOpenDocsModal: () => void;
    onOpenProjectFilesModal: () => void;
    onToggleVersionHistory: () => void;
    onOpenReportGenerator: () => void;
    onOpenReconModal: () => void;
    onOpenPayloadCraftingModal: () => void;
    onOpenThreatVectorModal: () => void;
    onOpenHelpModal: () => void;
    isToolsEnabled: boolean;
    onEndChatSession: () => void;
    // State from SessionContext
    isInputPanelVisible: boolean;
    setIsInputPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
    reviewAvailable: boolean;
    handleStartFollowUp: () => void;
    isChatMode: boolean;
    handleGenerateTests: () => void;
}

type MenuItem = {
    type: 'item';
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    disabled?: boolean;
} | {
    type: 'divider';
    label: string;
};

export const RadialMenu: React.FC<RadialMenuProps> = (props) => {
    const { isOpen, onClose, isToolsEnabled } = props;
    const { isLoading, isChatLoading } = useLoadingStateContext();
    const menuRef = useRef<HTMLDivElement>(null);
    const anyLoading = isLoading || isChatLoading;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const menuItems: MenuItem[] = useMemo(() => {
        const actionMap: Record<string, () => void> = {
            'toggle_panel': () => props.setIsInputPanelVisible(p => !p),
            'threat_vector': props.onOpenThreatVectorModal,
            'live_recon': props.onOpenReconModal,
            'payload_crafting': props.onOpenPayloadCraftingModal,
            'adv_report': props.onOpenReportGenerator,
            'gen_tests': props.handleGenerateTests,
            'gen_docs': props.onOpenDocsModal,
            'follow_up': props.handleStartFollowUp,
            'end_save_chat': props.onEndChatSession,
            'history': props.onToggleVersionHistory,
            'project_files': props.onOpenProjectFilesModal,
            'session_mgr': props.onImportClick,
        };

        const generatedItems: (MenuItem | null)[] = [];
        const categories = [TOOL_CATEGORIES.VIEW, TOOL_CATEGORIES.TOOLS, TOOL_CATEGORIES.SESSION];
        
        categories.forEach(categoryName => {
            const categoryTools = ARSENAL.filter(tool => tool.category === categoryName)
                .filter(tool => { // Pre-filter conditional tools
                    if (tool.id === 'follow_up' && (props.isChatMode || !props.reviewAvailable)) return false;
                    if (tool.id === 'end_save_chat' && !props.isChatMode) return false;
                    return true;
                });

            if (categoryTools.length > 0) {
                generatedItems.push({ type: 'divider', label: categoryName });
                categoryTools.forEach(tool => {
                    let label = tool.label;
                    let icon = <tool.icon className="w-6 h-6" />;
                    if (tool.id === 'toggle_panel') {
                        label = props.isInputPanelVisible ? 'Hide Panel' : 'Show Panel';
                        icon = props.isInputPanelVisible ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />;
                    }

                    generatedItems.push({
                        type: 'item',
                        label: label,
                        description: tool.description,
                        icon: icon,
                        action: actionMap[tool.id],
                        disabled: anyLoading || ( (tool.id === 'gen_tests' || tool.id === 'gen_docs') ? !isToolsEnabled : false),
                    });
                });
            }
        });

        return generatedItems.filter((item): item is MenuItem => item !== null);

    }, [props, anyLoading, isToolsEnabled]);

    const radius = Math.min(window.innerWidth, window.innerHeight) / 3.2;
    const totalItems = menuItems.length;

    return (
        <div className={`radial-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="radial-menu-title">
            <div className="radial-menu-container" ref={menuRef} onClick={e => e.stopPropagation()}>
                <button
                    className="radial-menu-center"
                    onClick={() => handleAction(props.onOpenHelpModal)}
                    aria-label="Open Help"
                    title="Open the system manual and doctrines."
                >
                    <InfoIcon className="w-8 h-8" />
                </button>
                {menuItems.map((item, index) => {
                    const angle = (index / totalItems) * 360 - 90; // Start at the top
                    
                    if (item.type === 'item') {
                        const style = {
                            '--angle': `${angle}deg`,
                            '--radius': `${radius}px`,
                            '--index': index,
                        } as React.CSSProperties;

                        return (
                            <div key={index} className="radial-menu-item-wrapper" style={style}>
                                <button
                                    className="radial-menu-item"
                                    onClick={() => handleAction(item.action)}
                                    disabled={item.disabled}
                                    title={item.description}
                                >
                                    <div className="radial-menu-item-icon">{item.icon}</div>
                                    <span className="radial-menu-item-label">{item.label}</span>
                                </button>
                            </div>
                        );
                    } else { // divider
                        const style = {
                            '--angle': `${angle}deg`,
                            '--radius': `${radius * 1.3}px`,
                            '--index': index,
                        } as React.CSSProperties;
                        return (
                             <div key={index} className="radial-menu-item-wrapper" style={style}>
                                <div className="radial-menu-divider">
                                    <span className="radial-menu-divider-label">{item.label}</span>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};
