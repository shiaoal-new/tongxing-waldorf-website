import { useEffect } from 'react';

/**
 * 用于在页面中注册 UX 测试组件配置的 Hook
 * 
 * @example
 * useUXTestComponents([
 *   {
 *     id: 'pageHero',
 *     name: 'Hero Section',
 *     settings: [
 *       {
 *         key: 'accentAnimationType',
 *         label: 'Accent Text 动画',
 *         type: 'select',
 *         default: 'typed',
 *         options: [
 *           { value: 'typed', label: '打字机效果' },
 *           { value: 'fade', label: '淡入效果' },
 *           { value: 'none', label: '无动画' }
 *         ]
 *       }
 *     ]
 *   }
 * ]);
 */
export function useUXTestComponents(components) {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // 将组件配置存储到 window 对象，供 UXTestPanel 使用
            window.__UX_TEST_COMPONENTS__ = components;
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.__UX_TEST_COMPONENTS__;
            }
        };
    }, [components]);
}

/**
 * 获取当前页面注册的 UX 测试组件
 */
export function getUXTestComponents() {
    if (typeof window !== 'undefined') {
        return window.__UX_TEST_COMPONENTS__ || [];
    }
    return [];
}
