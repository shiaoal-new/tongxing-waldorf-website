import React from 'react';

interface DevCommentProps {
    text: string;
}

/**
 * DevCommentImpl - 真实的逻辑，仅在开发环境定义
 */
const DevCommentImpl: React.FC<DevCommentProps> = ({ text }) => {
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
 * 這樣打包工具 (Webpack/Turbo) 會通過 Tree Shaking 徹底物理移除 DevCommentImpl 的代碼量
 */
const DevComment: React.FC<DevCommentProps> = process.env.NODE_ENV === 'development'
    ? DevCommentImpl
    : () => null;

export default DevComment;

