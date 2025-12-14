import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import { themeJson } from "./surveyTheme";

import surveyJson from "./visitRegistrationSchema.json";

export default function VisitRegistrationForm({ onComplete }) {
    const survey = new Model(surveyJson);
    // Apply a custom theme or at least ensure it looks decent.
    // For now we use defaultV2 but we could apply a theme if we had one.
    // I'll skip importing custom theme json for simplicity unless requested.
    // Actually, let's just minimal styling via survey-core css which is imported.

    // Apply a basic theme to match the site if possible, but default is fine.
    survey.applyTheme(themeJson);

    survey.onComplete.add((sender) => {
        onComplete(sender.data);
    });

    return <Survey model={survey} />;
}
