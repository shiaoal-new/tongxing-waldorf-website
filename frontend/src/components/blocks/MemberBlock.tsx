import React from "react";
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
    const { getMemberDetails, setSelectedMember } = usePageData() as PageContextValue;
    return (
        <div className="max-w-brand mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {block.members && block.members.map((memberName, mIndex) => {
                    const member = getMemberDetails(memberName);
                    if (!member) return null;
                    return (
                        <div
                            key={mIndex}
                            onClick={() => setSelectedMember(member)}
                            className="flex flex-col items-center text-center p-6 bg-brand-bg dark:bg-brand-structural rounded-3xl shadow-sm border border-gray-50 dark:border-brand-structural transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                        >
                            <div className="relative mb-4">
                                {member.media ? (
                                    <MediaRenderer
                                        media={member.media as any}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-brand-accent/20 group-hover:border-primary-100 transition-colors shadow-sm"
                                    />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-brand-accent/10 dark:bg-primary-900/30 flex items-center justify-center border-4 border-brand-accent/20 dark:border-primary-900/50">
                                        <span className="text-brand-accent/60 text-3xl font-bold">{member.title?.[0]}</span>
                                    </div>
                                )}
                                <div className="absolute -bottom-2 right-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h3 className="font-bold text-brand-text dark:text-brand-bg group-hover:text-brand-accent transition-colors">{member.title}</h3>
                                {member.subtitle && (
                                    <p className="mt-1 text-xs text-brand-accent dark:text-brand-accent font-medium tracking-tight whitespace-pre-wrap">
                                        {member.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
