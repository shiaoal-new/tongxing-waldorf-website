import React from "react";
import { Member } from "../../types/content";
import MediaRenderer from "./MediaRenderer";
import ImmersiveModal from "./ImmersiveModal";

interface MemberDetailModalProps {
    selectedMember: Member | null;
    onClose: () => void;
}

export default function MemberDetailModal({ selectedMember, onClose }: MemberDetailModalProps) {
    if (!selectedMember) return null;

    return (
        <ImmersiveModal
            isOpen={!!selectedMember}
            onClose={onClose}
            layoutId={`member-image-${selectedMember.title}`}
            backgroundContent={
                selectedMember.media ? (
                    <MediaRenderer
                        media={selectedMember.media as any}
                        className="w-full h-full"
                        imgClassName="object-cover w-full h-full"
                        priority={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-accent/5">
                        <span className="text-brand-accent/20 text-9xl font-bold select-none">
                            {selectedMember.title?.[0]}
                        </span>
                    </div>
                )
            }
        >
            {/* Header */}
            <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-black drop-shadow-lg">
                    {selectedMember.title}
                </h2>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-medium text-white/80">
                        {selectedMember.subtitle}
                    </span>
                    <div className="h-1.5 w-16 bg-brand-accent rounded-full mt-3 shadow-lg"></div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-10">
                {/* Education */}
                {selectedMember.education && (
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                            學歷背景與資格
                        </h5>
                        <div className="pl-4 border-l-2 border-dashed border-white/20 space-y-2">
                            {selectedMember.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <div key={idx} className="text-white/80 leading-relaxed font-light">
                                    {line.replace(/^[-\*\+]\s*/, '')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {selectedMember.experience && (
                    <div>
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                            專業經歷
                        </h5>
                        <div className="pl-4 border-l-2 border-dashed border-white/20 space-y-2">
                            {selectedMember.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <div key={idx} className="text-white/80 leading-relaxed font-light">
                                    {line.replace(/^[-\*\+]\s*/, '')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quote/Content */}
                {selectedMember.content && (
                    <div className="pt-8 border-t border-white/10">
                        <h5 className="font-bold uppercase tracking-widest text-xs mb-4 text-white/60">
                            教育理念 / 心語
                        </h5>
                        <blockquote className="italic font-serif text-2xl text-white leading-loose opacity-90">
                            "{selectedMember.content}"
                        </blockquote>
                    </div>
                )}
            </div>
        </ImmersiveModal>
    );
}
