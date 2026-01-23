import React, { useMemo, useCallback } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import { themeJson } from "./SurveyTheme";


import surveyJson from "./visitRegistrationSchema.json";

import { useSession } from "../../context/SessionContext";

interface VisitRegistrationFormProps {
    onComplete: (data: any) => void;
}

export default function VisitRegistrationForm({ onComplete }: VisitRegistrationFormProps) {
    const { session } = useSession() as any;

    const survey = useMemo(() => {
        const model = new Model(surveyJson);
        model.applyTheme(themeJson as any);
        return model;
    }, []);

    const handleComplete = useCallback((sender: any) => {
        const data = {
            ...sender.data,
            name: session?.user?.name || "未知用戶"
        };
        onComplete(data);
    }, [session?.user?.name, onComplete]);

    useMemo(() => {
        survey.onComplete.clear();
        survey.onComplete.add(handleComplete);
    }, [survey, handleComplete]);

    return (
        <div className="registration-form-container">
            <div className="mb-6 animate-slideInLeft">
                <h4 className="text-lg font-bold text-brand-text mb-1">
                    親愛的 {session?.user?.name || "朋友"}，您好
                </h4>
                <p className="text-sm text-brand-taupe">
                    歡迎來到同心華德福，請填寫聯繫電話及參訪人數，我們期待與您相見。
                </p>
            </div>

            <style jsx global>{`
                .registration-form-container .sd-root-modern {
                    background-color: transparent !important;
                }
                .registration-form-container .sd-container-modern {
                    padding: 0 !important;
                }
                .registration-form-container .sd-title {
                    font-weight: 700 !important;
                    color: #333 !important;
                }
                .registration-form-container .sd-btn--action {
                    background-color: #f2a154 !important;
                    border-radius: 9999px !important;
                    padding: 12px 32px !important;
                    font-weight: 700 !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 4px 14px 0 rgba(242, 161, 84, 0.39) !important;
                }
                .registration-form-container .sd-btn--action:hover {
                    background-color: #d98d41 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(242, 161, 84, 0.23) !important;
                }
            `}</style>

            <Survey model={survey} />
        </div>
    );
}
