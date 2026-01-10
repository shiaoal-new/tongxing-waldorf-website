# daisyUI Menu 組件使用指南

## 概述

本項目已採用 daisyUI 的 Menu 組件來構建各種導航和列表界面。本文檔說明如何正確使用這些組件。

## 已更新的組件

### 1. TableOfContents (tableOfContents.js)

移動端目錄已更新為使用 daisyUI menu 組件:

```jsx
<ul className="menu bg-transparent rounded-box w-full">
  {validSections.map((section) => {
    const isActive = activeId === section.id;
    return (
      <li key={section.id}>
        <a
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(section.id);
          }}
          className={`
            ${isActive ? 'active bg-brand-accent/10 text-brand-accent font-bold' : 'text-brand-text dark:text-gray-400'}
          `}
        >
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
          {section.title}
        </a>
      </li>
    );
  })}
</ul>
```

### 2. Navbar (navbar.js)

導航欄已經在使用 daisyUI 的 menu 組件:

- Debug 菜單使用 `menu menu-compact` 類
- 移動端導航使用 `btn` 組件

## daisyUI Menu 基本用法

### 基本菜單結構

```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li><a>Item 3</a></li>
</ul>
```

### 帶標題的菜單

```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li className="menu-title">標題</li>
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
```

### 可折疊子菜單

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

### 激活狀態

使用 `active` 類來標記當前激活的菜單項:

```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li><a className="active">Active Item</a></li>
  <li><a>Item 2</a></li>
</ul>
```

## 可用的 Menu 類

### 主要類

- `menu` - 基礎菜單類(必需)
- `menu-title` - 菜單標題樣式
- `menu-compact` - 緊湊版本,減少內邊距
- `menu-horizontal` - 水平菜單
- `menu-vertical` - 垂直菜單(默認)

### 尺寸修飾符

- `menu-xs` - 超小尺寸
- `menu-sm` - 小尺寸
- `menu-md` - 中等尺寸(默認)
- `menu-lg` - 大尺寸

### 背景和樣式

- `bg-base-100` - 使用基礎背景色
- `bg-base-200` - 使用次要背景色
- `bg-transparent` - 透明背景
- `rounded-box` - 圓角邊框

## 與品牌設計系統集成

在使用 daisyUI menu 時,可以結合項目的品牌色彩:

```jsx
<ul className="menu bg-transparent rounded-box">
  <li>
    <a className="text-brand-text dark:text-brand-bg hover:text-brand-accent">
      菜單項
    </a>
  </li>
  <li>
    <a className="active bg-brand-accent/10 text-brand-accent">
      激活項
    </a>
  </li>
</ul>
```

## 最佳實踐

1. **語義化 HTML**: 使用 `<ul>` 和 `<li>` 標籤構建菜單
2. **可訪問性**: 使用 `<a>` 標籤並添加適當的 `onClick` 處理器
3. **響應式設計**: 使用 `menu-horizontal` 和 `lg:menu-vertical` 等響應式類
4. **狀態管理**: 使用 `active` 類標記當前激活項
5. **品牌一致性**: 結合項目的品牌色彩變量

## 示例場景

### 側邊欄導航

```jsx
<ul className="menu bg-base-200 w-56 rounded-box">
  <li className="menu-title">導航</li>
  <li><a>首頁</a></li>
  <li><a>關於我們</a></li>
  <li>
    <details>
      <summary>課程</summary>
      <ul>
        <li><a>幼兒園</a></li>
        <li><a>小學</a></li>
      </ul>
    </details>
  </li>
</ul>
```

### 移動端底部菜單

```jsx
<ul className="menu menu-horizontal bg-base-200 rounded-box">
  <li><a>首頁</a></li>
  <li><a>搜索</a></li>
  <li><a>設置</a></li>
</ul>
```

### 帶圖標的菜單

```jsx
<ul className="menu bg-base-200 rounded-box w-56">
  <li>
    <a>
      <svg className="w-5 h-5">...</svg>
      首頁
    </a>
  </li>
  <li>
    <a>
      <svg className="w-5 h-5">...</svg>
      設置
    </a>
  </li>
</ul>
```

## 參考資源

- [daisyUI Menu 官方文檔](https://daisyui.com/components/menu/)
- [Tailwind 配置](../tailwind.config.js)
- [品牌設計系統](./design-system.md)
