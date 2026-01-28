import React from "react";
import Modal from "./ui/Modal";
import MuseumLabel from "./ui/MuseumLabel";

const formatTime = (timeStr: string | undefined): string | null => {
    if (!timeStr || timeStr === 'Unknown') return null;
    try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (e) {
        return timeStr;
    }
};

interface AboutContentProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AboutContent({ isOpen, onClose }: AboutContentProps) {
    const branch = process.env.NEXT_PUBLIC_GIT_BRANCH || "Unknown";
    const commitMsg = process.env.NEXT_PUBLIC_GIT_COMMIT_MSG || "Unknown";
    const commitTime = process.env.NEXT_PUBLIC_GIT_COMMIT_TIME || "Unknown";
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
    const actionTime = process.env.NEXT_PUBLIC_ACTION_RUN_TIME;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            padding="p-0"
            maxWidth="max-w-md"
        >
            <MuseumLabel
                title="About This Site"
                metadata={
                    <span className="text-warning-600">SYSTEM INFO</span>
                }
                footerItems={[
                    { label: "Commit", value: commitMsg },
                    { label: "Branch", value: branch }
                ]}
            >
                <div className="space-y-4 text-sm font-mono opacity-80">
                    <p className="flex justify-between border-b border-gray-100 pb-2">
                        <span>Last Commit Time</span>
                        <span className="font-bold">{formatTime(commitTime)}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-100 pb-2">
                        <span>Build Time</span>
                        <span className="font-bold">{formatTime(buildTime)}</span>
                    </p>
                    <p className="flex justify-between pb-2">
                        <span>Action Run Time</span>
                        <span className="font-bold">{formatTime(actionTime) || "Local Dev"}</span>
                    </p>
                </div>
            </MuseumLabel>
        </Modal>
    );
}
