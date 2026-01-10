# daisyUI Menu 快速參考

## 基本模式

### 1. 簡單垂直菜單
```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### 2. 帶標題的菜單
```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li className="menu-title">Category</li>
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
```

### 3. 帶激活狀態的菜單
```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li><a className="active">Active Item</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### 4. 可折疊子菜單
```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li><a>Item 1</a></li>
  <li>
    <details open>
      <summary>Parent</summary>
      <ul>
        <li><a>Submenu 1</a></li>
        <li><a>Submenu 2</a></li>
      </ul>
    </details>
  </li>
  <li><a>Item 3</a></li>
</ul>
```

### 5. 水平菜單
```jsx
<ul className="menu menu-horizontal bg-base-200 rounded-box">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### 6. 緊湊菜單
```jsx
<ul className="menu menu-compact bg-base-200 rounded-box w-56">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### 7. 帶圖標的菜單
```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li>
    <a>
      <svg className="w-5 h-5">...</svg>
      Home
    </a>
  </li>
  <li>
    <a>
      <svg className="w-5 h-5">...</svg>
      Settings
    </a>
  </li>
</ul>
```

### 8. 透明背景菜單 (用於 Footer 等)
```jsx
<ul className="menu bg-transparent p-0">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
```

## 常用類組合

### 項目中的常用模式

#### 移動端目錄菜單
```jsx
<ul className="menu bg-transparent rounded-box w-full">
  <li>
    <a className={isActive ? 'active bg-brand-accent/10 text-brand-accent font-bold' : 'text-brand-text dark:text-gray-400'}>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
      Section Title
    </a>
  </li>
</ul>
```

#### Footer 導航菜單
```jsx
<ul className="menu bg-transparent p-0">
  <li>
    <Link href="/path" className="text-brand-taupe dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent text-sm">
      Link Text
    </Link>
  </li>
</ul>
```

#### 主題選擇菜單
```jsx
<ul className="menu menu-compact bg-brand-bg/50 dark:bg-brand-structural/50 rounded-lg p-0">
  <li className="menu-title text-brand-accent px-4 py-2 text-xs font-bold uppercase tracking-wider">
    選擇主題
  </li>
  <li>
    <a className={theme === t ? "active bg-brand-accent text-brand-bg" : "text-brand-text dark:text-brand-bg"}>
      <span className="capitalize">{themeName}</span>
      {isActive && <Icon icon="lucide:check" className="w-4 h-4 ml-2" />}
    </a>
  </li>
</ul>
```

## 可用的類

### 主要類
- `menu` - 基礎類 (必需)
- `menu-title` - 標題樣式
- `menu-compact` - 緊湊版本
- `menu-horizontal` - 水平佈局
- `menu-vertical` - 垂直佈局 (默認)

### 尺寸
- `menu-xs` - 超小
- `menu-sm` - 小
- `menu-md` - 中 (默認)
- `menu-lg` - 大

### 狀態
- `active` - 激活狀態
- `disabled` - 禁用狀態

### 背景
- `bg-base-100` - 基礎背景
- `bg-base-200` - 次要背景
- `bg-base-300` - 第三背景
- `bg-transparent` - 透明

### 邊框
- `rounded-box` - 圓角邊框
- `rounded-btn` - 按鈕圓角

## 與 Next.js Link 集成

```jsx
import Link from 'next/link';

<ul className="menu">
  <li>
    <Link href="/path">
      Link Text
    </Link>
  </li>
</ul>
```

## 與 Framer Motion 集成

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
>
  <ul className="menu bg-base-200 rounded-box">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
  </ul>
</motion.div>
```

## 響應式設計

```jsx
<ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

## 可訪問性提示

1. 使用語義化的 `<ul>` 和 `<li>` 標籤
2. 為鏈接添加適當的 `href` 屬性
3. 使用 `<a>` 標籤而不是 `<button>` (除非需要按鈕行為)
4. 為圖標添加 `aria-label` 或 `sr-only` 文本
5. 確保鍵盤導航可用

## 常見錯誤

❌ **錯誤:** 忘記添加 `menu` 基礎類
```jsx
<ul className="bg-base-200">  {/* 缺少 menu 類 */}
  <li><a>Item</a></li>
</ul>
```

✅ **正確:**
```jsx
<ul className="menu bg-base-200">
  <li><a>Item</a></li>
</ul>
```

❌ **錯誤:** 在 `<li>` 外使用 `<a>`
```jsx
<ul className="menu">
  <a><li>Item</li></a>  {/* 錯誤的結構 */}
</ul>
```

✅ **正確:**
```jsx
<ul className="menu">
  <li><a>Item</a></li>
</ul>
```

❌ **錯誤:** 混用 button 和 a 標籤
```jsx
<ul className="menu">
  <li><button>Item 1</button></li>
  <li><a>Item 2</a></li>  {/* 不一致 */}
</ul>
```

✅ **正確:** 保持一致
```jsx
<ul className="menu">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
```

## 參考資源

- [daisyUI Menu 官方文檔](https://daisyui.com/components/menu/)
- [完整使用指南](./daisyui-menu-usage.md)
- [更新總結](./daisyui-menu-adoption-summary.md)
