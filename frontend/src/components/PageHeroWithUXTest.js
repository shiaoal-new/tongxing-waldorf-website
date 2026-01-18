import PageHero from './PageHero';
import { useUXTestComponents } from '../hooks/useUXTestComponents';
import { useUXTestMode } from '../context/UXTestModeContext';
import { useMemo } from 'react';

/**
 * PageHero 的 UX 测试包装器
 * 注册 UX 测试选项并根据设置渲染组件
 */
export default function PageHeroWithUXTest({ data }) {
    const { getComponentSetting } = useUXTestMode();

    // 注册 UX 测试组件配置
    const uxTestConfig = useMemo(() => [
        {
            id: 'pageHero',
            name: 'Hero Section',
            settings: [
                {
                    key: 'accentAnimationType',
                    label: 'Accent Text 动画',
                    type: 'select',
                    default: 'charByChar',
                    description: '选择装饰文字的动画效果',
                    options: [
                        { value: 'typed', label: '打字机效果 (Typed.js)' },
                        { value: 'charByChar', label: '逐字显现 (一个一个字出现)' },
                        { value: 'fade', label: '淡入+旋转效果' },
                        { value: 'none', label: '无动画' }
                    ]
                },
                {
                    key: 'showScrollButton',
                    label: '显示滚动按钮',
                    type: 'toggle',
                    default: true,
                    description: '显示/隐藏底部的滚动按钮'
                },
                {
                    key: 'entryDelay',
                    label: '入场延迟',
                    type: 'range',
                    default: 1,
                    min: 0,
                    max: 5,
                    step: 0.5,
                    unit: 's',
                    description: '内容淡入的延迟时间'
                }
            ]
        }
    ], []);

    useUXTestComponents(uxTestConfig);

    // 获取当前设置
    const accentAnimationType = getComponentSetting('pageHero', 'accentAnimationType', 'typed');
    const showScrollButton = getComponentSetting('pageHero', 'showScrollButton', true);
    const entryDelay = getComponentSetting('pageHero', 'entryDelay', 1);

    // 合并设置到 data
    const enhancedData = {
        ...data,
        _uxTest: {
            accentAnimationType,
            showScrollButton,
            entryDelay
        }
    };

    return <PageHero data={enhancedData} />;
}
