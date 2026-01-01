# ScrollableGrid 组件使用指南

## 概述

`ScrollableGrid` 是一个通用的响应式网格组件,提供:
- **移动端**: 横向滚动的卡片列表
- **桌面端**: 网格布局
- **灵活性**: 可以渲染任何类型的子组件

## 基本用法

```jsx
import ScrollableGrid from "./components/scrollableGrid";

function MyComponent() {
  const items = [
    { id: 1, title: "项目 1", content: "内容 1" },
    { id: 2, title: "项目 2", content: "内容 2" },
    { id: 3, title: "项目 3", content: "内容 3" },
  ];

  return (
    <ScrollableGrid
      items={items}
      renderItem={(item, index) => (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </div>
      )}
      columns={3}
    />
  );
}
```

## Props 说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | Array | `[]` | 要渲染的数据项数组 |
| `renderItem` | Function | - | 渲染函数 `(item, index) => ReactNode` |
| `buttons` | Array | - | 可选的底部按钮配置 |
| `columns` | Number | `3` | 桌面端的列数 (1-6) |
| `className` | String | `""` | 额外的容器类名 |
| `itemClassName` | String | `""` | 额外的项目容器类名 |
| `align` | String | `"left"` | 对齐方式: `"left"` \| `"center"` \| `"right"` |

## 使用示例

### 示例 1: 在 Benefits 组件中使用 (当前用法)

```jsx
<ScrollableGrid
  items={data.bullets || []}
  renderItem={(item, index) => (
    <Benefit title={item.title} icon={item.icon} buttons={item.buttons}>
      {item.desc}
    </Benefit>
  )}
  buttons={data.buttons}
  columns={3}
  align={props.imgPos === "right" ? "right" : "left"}
/>
```

### 示例 2: 展示团队成员

```jsx
function TeamSection() {
  const teamMembers = [
    { id: 1, name: "张三", role: "创始人", avatar: "/avatars/1.jpg" },
    { id: 2, name: "李四", role: "设计师", avatar: "/avatars/2.jpg" },
    { id: 3, name: "王五", role: "开发者", avatar: "/avatars/3.jpg" },
  ];

  return (
    <ScrollableGrid
      items={teamMembers}
      renderItem={(member) => (
        <div className="text-center">
          <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
          <h4 className="font-bold">{member.name}</h4>
          <p className="text-gray-600">{member.role}</p>
        </div>
      )}
      columns={4}
      align="center"
    />
  );
}
```

### 示例 3: 产品展示

```jsx
function ProductGrid() {
  const products = [
    { id: 1, name: "产品 A", price: "¥99", image: "/products/a.jpg" },
    { id: 2, name: "产品 B", price: "¥199", image: "/products/b.jpg" },
    { id: 3, name: "产品 C", price: "¥299", image: "/products/c.jpg" },
  ];

  return (
    <ScrollableGrid
      items={products}
      renderItem={(product) => (
        <div className="border rounded-lg overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-primary">{product.price}</p>
          </div>
        </div>
      )}
      columns={3}
      buttons={[
        { text: "查看全部产品", link: "/products" }
      ]}
    />
  );
}
```

### 示例 4: FAQ 列表

```jsx
function FAQSection() {
  const faqs = [
    { id: 1, question: "如何注册?", answer: "点击右上角的注册按钮..." },
    { id: 2, question: "支持哪些支付方式?", answer: "我们支持支付宝、微信..." },
    { id: 3, question: "退款政策是什么?", answer: "7天无理由退款..." },
  ];

  return (
    <ScrollableGrid
      items={faqs}
      renderItem={(faq) => (
        <div className="p-6 bg-gray-50 rounded-lg">
          <h4 className="font-bold mb-2">{faq.question}</h4>
          <p className="text-gray-600">{faq.answer}</p>
        </div>
      )}
      columns={2}
    />
  );
}
```

### 示例 5: 自定义列数和对齐

```jsx
// 2 列布局,右对齐
<ScrollableGrid
  items={items}
  renderItem={(item) => <CustomCard {...item} />}
  columns={2}
  align="right"
/>

// 4 列布局,居中对齐
<ScrollableGrid
  items={items}
  renderItem={(item) => <CustomCard {...item} />}
  columns={4}
  align="center"
/>
```

## 响应式行为

- **移动端 (< lg)**:
  - 横向滚动
  - 每个项目占 85% 宽度
  - 支持 snap scrolling (滚动吸附)
  - 左右有 padding 以显示部分下一个项目

- **桌面端 (≥ lg)**:
  - 网格布局
  - 根据 `columns` prop 自动调整列数
  - 项目之间有 gap

## 注意事项

1. **唯一 key**: 如果你的数据项有 `id` 字段,组件会自动使用它作为 key,否则使用 index
2. **renderItem 函数**: 必须返回一个有效的 React 元素
3. **列数限制**: `columns` 支持 1-6,超出范围会默认使用 3
4. **按钮配置**: `buttons` 使用与 `ActionButtons` 组件相同的格式

## 样式定制

你可以通过 `className` 和 `itemClassName` 添加自定义样式:

```jsx
<ScrollableGrid
  items={items}
  renderItem={(item) => <Card {...item} />}
  className="my-custom-container"
  itemClassName="my-custom-item"
/>
```

## 与其他组件的对比

- **vs Container**: `ScrollableGrid` 专注于网格布局和滚动行为
- **vs Benefits**: `Benefits` 现在使用 `ScrollableGrid`,但添加了标题和描述
- **vs ActionButtons**: 可以配合使用,`ScrollableGrid` 支持底部按钮
