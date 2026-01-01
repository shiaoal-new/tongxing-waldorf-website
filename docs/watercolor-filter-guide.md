# Watercolor-v2 SVG 滤镜使用指南

## 概述
`watercolor-v2` 是一个复杂的 SVG 滤镜,可以为元素添加水彩画效果。该滤镜已集成到 tongxing 主题中。

## 文件位置
- **滤镜定义**: `/components/svgFilters.js`
- **集成位置**: `/components/layout.js` (已自动加载)
- **使用说明**: `/css/themes/tongxing.css` (文件末尾有注释)

## 使用方法

### 在 CSS 中使用
在 `tongxing.css` 或其他 CSS 文件中,可以这样使用:

```css
[data-theme="tongxing"] {
    & .your-element {
        filter: url(#watercolor-v2);
    }
}
```

### 在内联样式中使用
```jsx
<div style={{ filter: 'url(#watercolor-v2)' }}>
    你的内容
</div>
```

### 在 Tailwind 类中使用
虽然 Tailwind 不直接支持 SVG 滤镜,但可以通过自定义 CSS 类实现:

```css
.watercolor-effect {
    filter: url(#watercolor-v2);
}
```

然后在 JSX 中:
```jsx
<div className="watercolor-effect">
    你的内容
</div>
```

## 滤镜效果说明
该滤镜通过以下技术创建水彩效果:
- **程序化纹理**: 使用 `feTurbulence` 生成噪点
- **位移映射**: 创建不规则边缘
- **形态学操作**: 扩张和侵蚀效果
- **高斯模糊**: 柔化边缘
- **多层合成**: 创建深度和发光效果

## 性能注意事项
- SVG 滤镜可能会影响渲染性能
- 建议仅在关键视觉元素上使用
- 在移动设备上测试性能表现
- 可以考虑为移动设备提供简化版本或禁用滤镜

## 示例应用场景
1. **标题文字**: 为主标题添加艺术感
2. **图片边框**: 创建手绘边框效果
3. **背景元素**: 装饰性背景图案
4. **按钮悬停效果**: 交互式水彩效果

## 调整参数
如需调整滤镜效果,可以修改 `/components/svgFilters.js` 中的参数:
- `baseFrequency`: 控制纹理细节
- `numOctaves`: 控制纹理复杂度
- `scale`: 控制位移强度
- `stdDeviation`: 控制模糊程度
- `k1, k2, k3, k4`: 控制合成效果
