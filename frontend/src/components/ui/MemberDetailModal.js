import Modal from "./Modal";
import MuseumLabel from "./MuseumLabel";

export default function MemberDetailModal({ selectedMember, onClose }) {
    if (!selectedMember) return null;

    return (
        <Modal
            isOpen={!!selectedMember}
            onClose={onClose}
            title="" // Title handled by MuseumLabel
            padding="p-0"
            maxWidth="max-w-md" // Match timeline width
        >
            <MuseumLabel
                image={selectedMember.media?.url || selectedMember.media?.src} // Handle possible media object structure
                title={selectedMember.title}
                metadata={
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg">{selectedMember.subtitle}</span>
                        <div className="h-1 w-10 bg-[var(--accent-primary)] rounded-full mt-1"></div>
                    </div>
                }
                footerItems={[
                    { label: "Department", value: selectedMember.group || "Faculty" },
                    { label: "Role", value: selectedMember.role || "Teacher" }
                ]}
            >
                <div className="space-y-8 text-[0.95rem]">
                    {selectedMember.education && (
                        <div>
                            <h5 className="font-bold uppercase tracking-widest text-xs mb-3 opacity-60">
                                學歷背景與資格
                            </h5>
                            <div className="leading-relaxed pl-4 border-l-2 border-dashed border-gray-300">
                                {selectedMember.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                                    <div key={idx} className="mb-1">
                                        {line.replace(/^[-\*\+]\s*/, '')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedMember.experience && (
                        <div>
                            <h5 className="font-bold uppercase tracking-widest text-xs mb-3 opacity-60">
                                專業經歷
                            </h5>
                            <div className="leading-relaxed pl-4 border-l-2 border-dashed border-gray-300">
                                {selectedMember.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
                                    <div key={idx} className="mb-1">
                                        {line.replace(/^[-\*\+]\s*/, '')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedMember.content && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <h5 className="font-bold uppercase tracking-widest text-xs mb-3 opacity-60">
                                教育理念 / 心語
                            </h5>
                            <div className="italic font-serif leading-loose text-lg opacity-80">
                                "{selectedMember.content}"
                            </div>
                        </div>
                    )}
                </div>
            </MuseumLabel>
        </Modal>
    );
}
