import React from "react";
import { motion } from "framer-motion";
import MediaRenderer from "../ui/MediaRenderer";
import { usePageData } from "../../context/PageDataContext";
import { MemberBlock as MemberBlockType, PageContextValue } from "../../types/content";

interface MemberBlockProps {
    block: MemberBlockType;
}

/**
 * MemberBlock Component
 * 渲染成員塊
 */
export default function MemberBlock({ block }: MemberBlockProps) {
    const { getMemberDetails, setSelectedMember, selectedMember } = usePageData() as PageContextValue;
    return (
        <div className="brand-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {block.members && block.members.map((memberName, mIndex) => {
                    const member = getMemberDetails(memberName);
                    if (!member) return null;
                    const isSelected = selectedMember?.title === member.title;

                    // 判斷是否可點擊：擁有媒體(照片)或詳細內容(學歷、經歷、理念)
                    const isClickable = !!(member.media || member.photo || member.content || member.education || member.experience);
                    const hasPhoto = !!(member.media || member.photo);

                    return (
                        <div
                            key={mIndex}
                            onClick={() => isClickable && setSelectedMember(member)}
                            className={`group relative w-full rounded-[2rem] overflow-hidden transition-all duration-300 
                                ${hasPhoto ? 'aspect-[3/4] bg-gray-100 dark:bg-gray-800' : 'aspect-[3/1.2] lg:aspect-[3/1.5] bg-brand-accent/5 dark:bg-white/5'}
                                ${isClickable ? 'cursor-pointer shadow-md hover:shadow-xl' : 'cursor-default opacity-80 shadow-sm'}`}
                        >
                            {/* Background Image Container (Only for photo cards) */}
                            <div className={`absolute inset-0 ${isSelected ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                                {hasPhoto && (
                                    <>
                                        <div className="relative w-full h-full">
                                            <motion.div
                                                layoutId={`member-image-${member.title}`}
                                                layout
                                                className="w-full h-full relative z-10"
                                            >
                                                <MediaRenderer
                                                    media={member.media as any}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="w-full h-full"
                                                    imgClassName={`object-cover w-full h-full transition-transform duration-700 ${isClickable ? 'group-hover:scale-105' : ''}`}
                                                />
                                            </motion.div>
                                        </div>
                                        {/* Overlay Gradient for photo cards */}
                                        <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent ${isClickable ? 'opacity-60 group-hover:opacity-80' : 'opacity-30'} transition-opacity duration-300 z-20`} />
                                    </>
                                )}

                                {/* Info Content Area */}
                                <div className={`absolute z-30 transition-all duration-300 
                                    ${hasPhoto
                                        ? 'bottom-4 left-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:-translate-y-1'
                                        : 'inset-0 flex items-center justify-center p-6 text-center'}`}
                                >
                                    <div className={`flex justify-between items-start gap-3 w-full ${!hasPhoto ? 'flex-col items-center' : ''}`}>
                                        <div className={`flex flex-col min-w-0 ${!hasPhoto ? 'items-center' : 'text-left'}`}>
                                            <h3 className={`font-bold text-gray-900 dark:text-gray-100 leading-tight truncate px-1 
                                                ${hasPhoto ? 'text-lg' : 'text-xl'}`}>
                                                {member.title}
                                            </h3>
                                            {member.subtitle && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide truncate">
                                                    {member.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {/* Indicator - Only show for clickable items */}
                                        {isClickable && (
                                            <div className={`flex-shrink-0 text-brand-accent/60 group-hover:text-brand-accent transition-colors font-bold tracking-widest 
                                                ${!hasPhoto ? 'mt-2' : 'pt-1'}`}>
                                                ...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
