import Image from "next/image";
import React from "react";
import Container from "./container";

import userOneImg from "../public/img/user1.jpg";
import userTwoImg from "../public/img/user2.jpg";
import userThreeImg from "../public/img/user3.jpg";

export default function Testimonials() {
  return (
    <Container className="mb-section">
      <div className="grid gap-component lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
        <div className="lg:col-span-2 xl:col-auto">
          <div className="flex flex-col justify-between w-full h-full bg-brand-bg px-10 rounded-2xl py-10 dark:bg-trueGray-800 border border-brand-taupe/10">
            <p className="text-2xl leading-normal ">
              Share a real <Mark>testimonial</Mark>
              that hits some of your benefits from one of your popular customer.
            </p>

            <Avatar
              image={userOneImg}
              name="Sarah Steiner"
              title="VP Sales at Google"
            />
          </div>
        </div>
        <div className="">
          <div className="flex flex-col justify-between w-full h-full bg-brand-bg px-10 rounded-2xl py-10 dark:bg-trueGray-800 border border-brand-taupe/10">
            <p className="text-2xl leading-normal ">
              Make sure you only pick the <Mark>right sentence</Mark>
              to keep it short and simple.
            </p>

            <Avatar
              image={userTwoImg}
              name="Dylan Ambrose"
              title="Lead marketer at Netflix"
            />
          </div>
        </div>
        <div className="">
          <div className="flex flex-col justify-between w-full h-full bg-brand-bg px-10 rounded-2xl py-10 dark:bg-trueGray-800 border border-brand-taupe/10">
            <p className="text-2xl leading-normal ">
              This is an <Mark>awesome</Mark> landing page template I've seen. I
              would use this for anything.
            </p>

            <Avatar
              image={userThreeImg}
              name="Gabrielle Winn"
              title="Co-founder of Acme Inc"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

function Avatar(props) {
  return (
    <div className="flex items-center mt-8 space-x-3">
      <div className="flex-shrink-0 overflow-hidden rounded-full w-14 h-14">
        <Image
          src={props.image}
          width="40"
          height="40"
          alt="Avatar"
          placeholder="blur"
        />
      </div>
      <div>
        <div className="text-lg font-medium">{props.name}</div>
        <div className="text-brand-taupe dark:text-brand-taupe">{props.title}</div>
      </div>
    </div>
  );
}

function Mark(props) {
  return (
    <>
      {" "}
      <mark className="text-primary-800 bg-primary-100 rounded-md ring-primary-100 ring-4 dark:ring-primary-900 dark:bg-primary-900 dark:text-brand-accent/40">
        {props.children}
      </mark>{" "}
    </>
  );
}
