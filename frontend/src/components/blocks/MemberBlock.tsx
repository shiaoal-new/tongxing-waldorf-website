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

                    return (
                        <div
                            key={mIndex}
                            onClick={() => setSelectedMember(member)}
                            className="group relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100 dark:bg-gray-800"
                        >
                            {/* Background Image */}
                            <div className={`absolute inset-0 ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                                {member.media ? (
                                    <motion.div
                                        layoutId={`member-image-${member.title}`}
                                        layout
                                        className="w-full h-full"
                                    >
                                        <MediaRenderer
                                            media={member.media as any}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                                            imgClassName="object-cover w-full h-full"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-accent/5 dark:bg-white/5">
                                        <span className="text-brand-accent/20 text-7xl font-bold select-none">
                                            {member.title?.[0]}
                                        </span>
                                    </div>
                                )}
                                {/* Overlay Gradient for better text readability if we didn't have the card, 
                                    but here we have a card. We can add a subtle gradient at the bottom anyway 
                                    to ground the floating card visually or if the card floats high. */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Floating Info Card */}
                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-5 rounded-2xl shadow-sm transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-hover:shadow-lg">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex flex-col text-left min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-snug truncate pr-2">
                                            {member.title}
                                        </h3>
                                        {member.subtitle && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium tracking-wide truncate">
                                                {member.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {/* Icon - Decorative or specific if available */}
                                    <div className="flex-shrink-0 text-gray-400 group-hover:text-brand-accent transition-colors pt-1">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
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
