import { createContext, useContext, useState, useEffect } from 'react';

/**
 * UI/UX 测试模式 Context
 * 用于在开发环境中调试和测试 UI/UX 选项
 */
const UXTestModeContext = createContext();

export function UXTestModeProvider({ children }) {
    const [isTestMode, setIsTestMode] = useState(false);
    const [componentSettings, setComponentSettings] = useState({});

    // 从 localStorage 加载设置
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('ux_test_mode');
            const savedSettings = localStorage.getItem('ux_component_settings');

            if (savedMode) setIsTestMode(savedMode === 'true');
            if (savedSettings) {
                try {
                    setComponentSettings(JSON.parse(savedSettings));
                } catch (e) {
                    console.error('Failed to parse UX settings:', e);
                }
            }
        }
    }, []);

    // 保存到 localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ux_test_mode', isTestMode.toString());
        }
    }, [isTestMode]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ux_component_settings', JSON.stringify(componentSettings));
        }
    }, [componentSettings]);

    const toggleTestMode = () => {
        setIsTestMode(prev => !prev);
    };

    const updateComponentSetting = (componentId, settingKey, value) => {
        setComponentSettings(prev => ({
            ...prev,
            [componentId]: {
                ...prev[componentId],
                [settingKey]: value
            }
        }));
    };

    const getComponentSetting = (componentId, settingKey, defaultValue) => {
        return componentSettings[componentId]?.[settingKey] ?? defaultValue;
    };

    const resetComponentSettings = (componentId) => {
        setComponentSettings(prev => {
            const newSettings = { ...prev };
            delete newSettings[componentId];
            return newSettings;
        });
    };

    const resetAllSettings = () => {
        setComponentSettings({});
    };

    return (
        <UXTestModeContext.Provider
            value={{
                isTestMode,
                toggleTestMode,
                componentSettings,
                updateComponentSetting,
                getComponentSetting,
                resetComponentSettings,
                resetAllSettings
            }}
        >
            {children}
        </UXTestModeContext.Provider>
    );
}

export function useUXTestMode() {
    const context = useContext(UXTestModeContext);
    if (!context) {
        throw new Error('useUXTestMode must be used within UXTestModeProvider');
    }
    return context;
}
