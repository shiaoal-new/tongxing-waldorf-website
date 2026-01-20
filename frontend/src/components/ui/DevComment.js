import React from 'react';

/**
 * DevCommentImpl - 真实的逻辑，仅在开发环境定义
 */
const DevCommentImpl = ({ text }) => {
    return (
        <span
            style={{ display: 'none' }}
            ref={(node) => {
                if (node && !node.dataset.commented) {
                    node.dataset.commented = 'true';
                    node.insertAdjacentHTML('afterend', `\n<!-- ${text} -->\n`);
                }
            }}
        />
    );
};

/**
 * 根据环境导出
 * 在 Production build 时，process.env.NODE_ENV === 'development' 为恒假
 * 这样打包工具 (Webpack/Turbo) 会通过 Tree Shaking 彻底物理移除 DevCommentImpl 的代码量
 */
const DevComment = process.env.NODE_ENV === 'development'
    ? DevCommentImpl
    : () => null;

export default DevComment;

