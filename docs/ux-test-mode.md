# UI/UX 测试模式系统

## 概述

已成功实现一个完整的 UI/UX 测试模式系统，允许开发者在运行时调整组件的 UI/UX 选项。

## 已完成的功能

### 1. 核心系统
- ✅ **UXTestModeContext** (`frontend/src/context/UXTestModeContext.js`)
  - 全局状态管理
  - localStorage 持久化
  - 组件设置的 CRUD 操作

- ✅ **UXTestPanel** (`frontend/src/components/UXTestPanel.js`)
  - Modeless overlay 面板
  - 支持多种控件类型：select, toggle, range, color
  - 可展开/折叠
  - 重置功能

- ✅ **useUXTestComponents Hook** (`frontend/src/hooks/useUXTestComponents.js`)
  - 注册页面组件配置
  - 自动更新机制

### 2. 集成
- ✅ 在 `_app.js` 中添加 `UXTestModeProvider`
- ✅ 在 `Layout.js` 中添加 `UXTestPanel`
- ✅ 在 Navbar 的开发者菜单中添加 "UI/UX 测试模式" 开关
- ✅ 在 `navigation.yml` 中添加菜单项

### 3. PageHero 集成
- ✅ 添加 `useUXTestMode` hook
- ✅ 支持 accent_text 动画类型切换（typed/fade/none）
- ✅ 创建 `PageHeroWithUXTest.js` 示例包装器

## 使用方法

### 1. 启用测试模式

1. 打开网站
2. 点击 Navbar 右上角的用户菜单
3. 选择 "开发者" > "UI/UX 测试模式"
4. 右侧会出现测试面板

### 2. 在组件中注册 UX 测试选项

```javascript
import { useUXTestComponents } from '../hooks/useUXTestComponents';
import { useUXTestMode } from '../context/UXTestModeContext';

function MyComponent() {
    const { getComponentSetting } = useUXTestMode();
    
    // 注册配置
    useUXTestComponents([
        {
            id: 'myComponent',
            name: '我的组件',
            settings: [
                {
                    key: 'animationType',
                    label: '动画类型',
                    type: 'select',
                    default: 'fade',
                    options: [
                        { value: 'fade', label: '淡入' },
                        { value: 'slide', label: '滑动' }
                    ]
                },
                {
                    key: 'showBorder',
                    label: '显示边框',
                    type: 'toggle',
                    default: true
                },
                {
                    key: 'spacing',
                    label: '间距',
                    type: 'range',
                    default: 16,
                    min: 0,
                    max: 64,
                    step: 4,
                    unit: 'px'
                }
            ]
        }
    ]);
    
    // 获取设置
    const animationType = getComponentSetting('myComponent', 'animationType', 'fade');
    const showBorder = getComponentSetting('myComponent', 'showBorder', true);
    const spacing = getComponentSetting('myComponent', 'spacing', 16);
    
    // 使用设置渲染组件
    return (
        <div style={{ padding: spacing }}>
            {/* 组件内容 */}
        </div>
    );
}
```

### 3. 支持的控件类型

#### Select (下拉选择)
```javascript
{
    key: 'option',
    label: '选项',
    type: 'select',
    default: 'value1',
    options: [
        { value: 'value1', label: '选项 1' },
        { value: 'value2', label: '选项 2' }
    ]
}
```

#### Toggle (开关)
```javascript
{
    key: 'enabled',
    label: '启用功能',
    type: 'toggle',
    default: true
}
```

#### Range (滑块)
```javascript
{
    key: 'size',
    label: '大小',
    type: 'range',
    default: 16,
    min: 8,
    max: 32,
    step: 2,
    unit: 'px'
}
```

#### Color (颜色选择器)
```javascript
{
    key: 'color',
    label: '颜色',
    type: 'color',
    default: '#ff0000'
}
```

## PageHero 示例

PageHero 组件已经支持以下可调选项：

1. **Accent Text 动画**
   - 打字机效果 (Typed.js)
   - 淡入+旋转效果
   - 无动画

2. **显示滚动按钮** (待实现)
3. **入场延迟** (待实现)

### 使用 PageHeroWithUXTest

```javascript
import PageHeroWithUXTest from '../components/PageHeroWithUXTest';

// 在页面中使用
<PageHeroWithUXTest data={heroData} />
```

## 待完成的工作

### PageHero 组件更新
由于文件编辑冲突，以下更新需要手动完成：

1. 在 `pageHero.js` 的 accent_text 渲染部分（第 187-201 行）替换为：

```javascript
{/* 裝飾性手寫文字 - 可切換動畫效果 */}
{accent_text && accentAnimationType !== 'none' && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="absolute -top-6 -right-2 lg:-top-10 lg:-right-4 font-accent text-brand-accent text-xl lg:text-3xl select-none pointer-events-none"
        style={{
            textShadow: '0 0 20px rgba(251,146,60,0.8), 0 0 40px rgba(251,146,60,0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)',
            filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.6))'
        }}
    >
        {accentAnimationType === 'typed' ? (
            <span ref={typedRef}></span>
        ) : (
            <motion.span
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                transition={{ delay: 3, duration: 2, ease: "easeOut" }}
            >
                {accent_text}
            </motion.span>
        )}
    </motion.div>
)}
```

## 下一步

1. 手动完成 PageHero 的 accent_text 渲染更新
2. 为其他组件添加 UX 测试选项
3. 添加更多控件类型（如文本输入、多选等）
4. 添加导出/导入配置功能
5. 添加预设配置功能

## 技术细节

- **状态管理**: React Context API
- **持久化**: localStorage
- **动画**: Framer Motion
- **UI 组件**: 自定义组件 + Heroicons
- **类型检查**: PropTypes (可选)

## 注意事项

- 测试模式仅在开发环境 (`NODE_ENV === 'development'`) 下可用
- 所有设置都保存在 localStorage 中
- 页面刷新后设置会保持
- 可以随时重置单个组件或所有组件的设置
