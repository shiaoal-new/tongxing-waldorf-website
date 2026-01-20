# TON-17: 优化 [slug].js 的静态属性获取 (getStaticProps)

## 问题描述

之前的实现中,`pages/[slug].tsx` 和 `pages/courses/[slug].js` 的 `getStaticProps` 无差别抓取所有全局数据(facultyList, faqList, coursesList),即使页面并不需要这些数据,也会在编译时加载,增加了不必要的开销。

## 解决方案

### 1. 创建数据加载器模块 (`lib/dataLoader.ts`)

新建了一个智能数据加载器,能够:
- 分析页面配置中的 `blocks` 类型
- 确定每种 block 类型需要的数据依赖
- 只加载页面实际需要的数据

#### 数据依赖映射

```typescript
const BLOCK_DATA_DEPENDENCIES = {
    'member_block': ['facultyList'],  // 教师团队页面需要
    'faq_item': ['faqList'],          // FAQ 区块需要
    'list_block': [],                 // 需要进一步检查 item_type
};
```

#### 核心功能

1. **`analyzePageDataDependencies(page)`**: 递归分析页面配置,识别所有 block 类型
2. **`loadPageData(dependencies)`**: 根据依赖集合,只加载必要的数据
3. **`getPageDataOptimized(page)`**: 一站式函数,分析并加载数据

### 2. 更新页面文件

#### `pages/[slug].tsx`

**优化前:**
```typescript
const facultyList = getAllFaculty();  // 总是加载
const faqList = getAllFaq();          // 总是加载
const coursesList = getAllCourses();  // 总是加载
```

**优化后:**
```typescript
const pageData = getPageDataOptimized(page);  // 按需加载
```

#### `pages/courses/[slug].js`

同样的优化方式,只加载课程页面实际需要的数据。

## 性能提升

### 示例分析

假设有以下页面:

1. **首页 (index.yml)**: 
   - 使用 `benefit_item`, `video_item`, `faq_item`
   - **需要**: `faqList`
   - **不需要**: `facultyList`, `coursesList`

2. **教师团队 (teacher-group.yml)**:
   - 使用 `member_block`, `compact_card`
   - **需要**: `facultyList`
   - **不需要**: `faqList`, `coursesList`

3. **课程发展 (curriculum-development.yml)**:
   - 使用 `curriculum_block`, `text_block`
   - **不需要**: `facultyList`, `faqList`, `coursesList`

### 优化效果

- **编译时数据负载减少**: 每个页面只加载必要的数据
- **构建时间缩短**: 减少了不必要的文件读取和解析
- **内存占用降低**: 避免加载未使用的数据到内存

## 扩展性

如果将来添加新的 block 类型需要全局数据,只需:

1. 在 `BLOCK_DATA_DEPENDENCIES` 中添加映射
2. 在 `loadPageData` 中添加加载逻辑

例如,添加一个新的 `course_list_block`:

```typescript
const BLOCK_DATA_DEPENDENCIES = {
    // ... 现有映射
    'course_list_block': ['coursesList'],
};
```

## 测试建议

1. 检查所有页面是否正常渲染
2. 验证教师团队页面能正确显示教师信息
3. 验证 FAQ 区块能正确显示问答内容
4. 监控构建时间是否有改善

## 相关文件

- `frontend/src/lib/dataLoader.ts` (新建)
- `frontend/src/pages/[slug].tsx` (已修改)
- `frontend/src/pages/courses/[slug].js` (已修改)
