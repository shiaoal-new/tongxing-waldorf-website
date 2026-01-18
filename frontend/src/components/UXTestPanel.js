import { motion, AnimatePresence } from 'framer-motion';
import { useUXTestMode } from '../context/UXTestModeContext';
import { useState, useEffect } from 'react';
import { XIcon, RefreshIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { getUXTestComponents } from '../hooks/useUXTestComponents';

/**
 * UX 测试面板 - Modeless Overlay
 * 显示当前页面所有可调的 UI/UX 选项
 */
export default function UXTestPanel() {
    const { isTestMode, resetAllSettings } = useUXTestMode();
    const [isMinimized, setIsMinimized] = useState(false);
    const [expandedComponents, setExpandedComponents] = useState({});
    const [pageComponents, setPageComponents] = useState([]);

    // 定期检查页面组件更新
    useEffect(() => {
        const updateComponents = () => {
            setPageComponents(getUXTestComponents());
        };

        updateComponents();
        const interval = setInterval(updateComponents, 500);

        return () => clearInterval(interval);
    }, []);

    const toggleComponent = (componentId) => {
        setExpandedComponents(prev => ({
            ...prev,
            [componentId]: !prev[componentId]
        }));
    };

    if (!isTestMode || process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={{
                    top: -window.innerHeight / 2,
                    left: -window.innerWidth + 400,
                    right: window.innerWidth / 2,
                    bottom: window.innerHeight / 2
                }}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-4 top-20 z-[9999] w-96 max-h-[80vh] overflow-hidden cursor-move"
            >
                <div className="bg-brand-structural/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-brand-accent/30 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-accent/20 to-brand-accent/10 p-4 border-b border-brand-accent/20 cursor-move">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Drag Handle Icon */}
                                <svg className="w-4 h-4 text-brand-bg/60" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                                </svg>
                                <div className="w-3 h-3 rounded-full bg-brand-accent animate-pulse"></div>
                                <h3 className="font-bold text-brand-bg text-lg select-none">UI/UX 测试面板</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('确定要重置所有设置吗？')) {
                                            resetAllSettings();
                                        }
                                    }}
                                    className="p-2 hover:bg-brand-accent/20 rounded-lg transition-colors cursor-pointer"
                                    title="重置所有设置"
                                >
                                    <RefreshIcon className="w-5 h-5 text-brand-bg" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMinimized(!isMinimized);
                                    }}
                                    className="p-2 hover:bg-brand-accent/20 rounded-lg transition-colors cursor-pointer"
                                    title={isMinimized ? '展开' : '最小化'}
                                >
                                    {isMinimized ? (
                                        <ChevronDownIcon className="w-5 h-5 text-brand-bg" />
                                    ) : (
                                        <ChevronUpIcon className="w-5 h-5 text-brand-bg" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                        {!isMinimized && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {pageComponents.length === 0 ? (
                                        <div className="text-center py-8 text-brand-bg/60">
                                            <p>当前页面没有可调选项</p>
                                            <p className="text-sm mt-2">请在组件中注册 UX 测试选项</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pageComponents.map((component) => (
                                                <ComponentSettingsPanel
                                                    key={component.id}
                                                    component={component}
                                                    isExpanded={expandedComponents[component.id]}
                                                    onToggle={() => toggleComponent(component.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Drag Handle Hint */}
                <div className="text-center mt-2 text-brand-bg/40 text-xs select-none">
                    拖动标题栏可移动面板
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.1);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(251, 146, 60, 0.5);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(251, 146, 60, 0.7);
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * 单个组件的设置面板
 */
function ComponentSettingsPanel({ component, isExpanded, onToggle }) {
    const { updateComponentSetting, getComponentSetting, resetComponentSettings } = useUXTestMode();

    return (
        <div className="bg-brand-bg/10 rounded-lg overflow-hidden border border-brand-accent/10">
            {/* Component Header */}
            <button
                onClick={onToggle}
                className="w-full p-3 flex items-center justify-between hover:bg-brand-accent/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-brand-accent text-sm">▸</span>
                    <span className="font-semibold text-brand-bg">{component.name}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        resetComponentSettings(component.id);
                    }}
                    className="text-xs text-brand-bg/60 hover:text-brand-accent transition-colors"
                >
                    重置
                </button>
            </button>

            {/* Settings */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 space-y-3 bg-brand-structural/20">
                            {component.settings.map((setting) => (
                                <SettingControl
                                    key={setting.key}
                                    setting={setting}
                                    componentId={component.id}
                                    value={getComponentSetting(component.id, setting.key, setting.default)}
                                    onChange={(value) => updateComponentSetting(component.id, setting.key, value)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * 单个设置控件
 */
function SettingControl({ setting, componentId, value, onChange }) {
    const renderControl = () => {
        switch (setting.type) {
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-bg/20 border border-brand-accent/20 rounded-lg text-brand-bg focus:outline-none focus:border-brand-accent transition-colors"
                    >
                        {setting.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'toggle':
                return (
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-brand-bg/80">{setting.label}</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-brand-accent' : 'bg-brand-bg/20'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-1'} mt-0.5`}></div>
                            </div>
                        </div>
                    </label>
                );

            case 'range':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-brand-bg/80 text-sm">{setting.label}</span>
                            <span className="text-brand-accent font-mono text-sm">{value}{setting.unit || ''}</span>
                        </div>
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step || 1}
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="w-full accent-brand-accent"
                        />
                    </div>
                );

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-brand-accent/20"
                        />
                        <div className="flex-1">
                            <div className="text-brand-bg/80 text-sm mb-1">{setting.label}</div>
                            <div className="text-brand-accent font-mono text-xs">{value}</div>
                        </div>
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-bg/20 border border-brand-accent/20 rounded-lg text-brand-bg focus:outline-none focus:border-brand-accent transition-colors"
                    />
                );
        }
    };

    return (
        <div>
            {setting.type !== 'toggle' && (
                <label className="block text-sm text-brand-bg/80 mb-2">
                    {setting.label}
                    {setting.description && (
                        <span className="block text-xs text-brand-bg/50 mt-1">{setting.description}</span>
                    )}
                </label>
            )}
            {renderControl()}
        </div>
    );
}
