import React from "react";
import Container from "./container";
import ActionButtons from "./actionButtons";

export default function Cta() {
  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between w-full max-w-4xl gap-5 mx-auto text-white bg-primary-600 px-7 py-7 lg:px-12 lg:py-12 lg:flex-nowrap rounded-xl">
        <div className="flex-grow text-center lg:text-left">
          <h2 className="text-2xl font-medium lg:text-3xl">
            誠摯邀請您
          </h2>
          <p className="mt-2 font-medium text-white text-opacity-90 lg:text-xl">
            歡迎預約參觀，親身感受同心華德福的教育場域。
          </p>
        </div>
        <div className="flex-shrink-0 w-full text-center lg:w-auto">
          <ActionButtons buttons={[{ text: "預約參觀", link: "/visit", style: "btn-white" }]} />
        </div>
      </div>
    </Container>
  );
}
