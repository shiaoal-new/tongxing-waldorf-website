import MediaRenderer from "./mediaRenderer";
import React from "react";
import Container from "./container";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import ActionButtons from "./actionButtons";

// export function Benefits(props) {
//   const { data } = props;

//   // Media data normalization
//   const mediaData = data.media || (data.lottie ? { type: 'lottie', url: data.lottie } : (data.image ? { type: 'image', image: data.image } : null));

//   return (
//     <div className="flex flex-col mb-20">
//       <div className="w-full mb-8">
//         <h3 className="mt-3 text-brand-text dark:text-brand-bg">
//           {data.title}
//         </h3>

//         <p className="py-4 text-lg text-brand-taupe lg:text-xl xl:text-xl dark:text-brand-taupe">
//           {data.desc}
//         </p>
//       </div>

//       <ScrollableGrid
//         items={data.bullets || []}
//         renderItem={(item, index) => (
//           <Benefit title={item.title} icon={item.icon} buttons={item.buttons}>
//             {item.desc}
//           </Benefit>
//         )}
//         buttons={data.buttons}
//         columns={3}
//       />
//     </div>
//   );
// }

export default function Benefit(props) {
  return (
    <>
      <div className="benefit-container flex flex-col mt-8 ">
        <div className="benefit-icon-container flex items-center justify-center flex-shrink-0 mb-3 w-16 h-16 mx-auto">
          <Icon icon={props.icon} className="w-7 h-7 text-primary-50" />
        </div>
        <div className="flex-grow text-center lg:text-left">
          <h4 className="text-brand-text dark:text-brand-bg">
            {props.title}
          </h4>
          <p className="mt-1 text-brand-taupe dark:text-brand-taupe">
            {props.children}
          </p>
          {props.buttons && props.buttons.length > 0 && (
            <div className="flex justify-center lg:justify-start">
              <ActionButtons buttons={props.buttons} align="left" className="mt-3" size="sm" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}


