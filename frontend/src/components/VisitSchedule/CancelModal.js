import React from "react";
import Modal from "../Modal";

export default function CancelModal({
    isOpen,
    onClose,
    selectedRegistration,
    formatSessionDate,
    cancelReasons,
    cancelReason,
    setCancelReason,
    onConfirm,
    isCancelling
}) {
    return (
        <Modal
            title="取消預約"
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-md"
        >
            <div className="p-6">
                <div className="mb-6">
                    <h4 className="text-lg font-bold text-brand-text mb-2">
                        場次：{formatSessionDate(selectedRegistration?.session?.date)}
                    </h4>
                    <p className="text-sm text-brand-taupe leading-relaxed">
                        您確定要取消這次的參訪嗎？取消後名額將會釋出。
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    <p className="text-sm font-bold text-brand-text">請選擇取消原因：</p>
                    {cancelReasons.map((reason) => (
                        <label key={reason} className="flex items-center space-x-3 p-3 rounded-xl border border-brand-taupe/10 hover:bg-brand-accent/5 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={cancelReason === reason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="radio radio-primary radio-sm"
                            />
                            <span className="text-brand-text text-sm">{reason}</span>
                        </label>
                    ))}
                    {cancelReason === "其他原因" && (
                        <textarea
                            className="textarea textarea-bordered w-full mt-2 text-sm"
                            placeholder="請輸入原因..."
                            rows={2}
                            onChange={(e) => setCancelReason(`其他：${e.target.value}`)}
                        />
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost flex-1 rounded-full"
                    >
                        我再想想
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isCancelling || !cancelReason}
                        className={`btn btn-error flex-1 rounded-full text-white ${isCancelling ? 'loading' : ''}`}
                    >
                        {isCancelling ? '處理中...' : '確認取消'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
