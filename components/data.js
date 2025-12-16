import {
  HeartIcon,
  HandIcon,
  AcademicCapIcon,
  SparklesIcon,
  SunIcon,
  UserGroupIcon,
  ChatAlt2Icon,
} from "@heroicons/react/outline";

import benefitOneImg from "../public/img/benefit-one.png";
import benefitTwoImg from "../public/img/benefit-two.png";
import benefitThreeImg from "../public/img/cooperation.webp";
const benefitOne = {
  title: "順應發展的體驗式學習",
  desc: "同心華德福的課程設計並非單純的知識灌輸，而是緊密扣合孩子不同年齡的發展需求",
  image: benefitOneImg,
  bullets: [
    {
      title: "中低年級的情感工作",
      desc: "對於中低年級（一到四年級），教學重點放在情感面和意願面的工作，避免過早要求孩子進行抽象的「頭部上的思考」。",
      icon: <HeartIcon />,
    },
    {
      title: "肢體經驗的學習",
      desc: "學習主要透過肢體經驗和行動來進行，讓孩子在大量實踐中累積感受，並將這些感受凝結成回憶儲存於大腦。這種教育模式透過藝術性的引導，將人性的細膩面與道德觀融入課程中。",
      icon: <HandIcon />,
    },
    {
      title: "高年級",
      desc: "孩子們在親身經歷世界後，即便在高年級面對抽象的學術內容，也能夠很快地產生情感連結與共鳴。這種緩慢且長遠的學習路徑，能讓孩子長出品位、美感以及清楚了解自己的能力，這些都是未來世代更為需要的核心素質",
      icon: <AcademicCapIcon />,
    },
  ],
};

const benefitTwo = {
  title: "健康與自然的物質環境滋養",
  desc: "華德福教育深信外在的物質世界會滋養孩子的內在氛圍，因此對孩子的飲食和生活環境投入極大的心力",
  image: benefitTwoImg,
  bullets: [
    {
      title: "食材選擇",
      desc: "學校在食材選擇上極為謹慎，優先採用實行生機互動農法（BD 農法）或小農提供的天然無毒食材，特別是在米飯和蔬果方面",
      icon: <SparklesIcon />,
    },
    {
      title: "食農教育",
      desc: "學校積極開展食農教育與校園綠手作，讓孩子與土地產生連結。家長們甚至會在週末參與客家親子農耕，實踐永續環保的農作方式。這種從源頭把關的飲食與環境，為孩子提供了身心靈健康發展的堅實基礎",
      icon: <SunIcon />,
    },

  ],
};

const benefitThree = {
  title: "強大且互助的「村莊」社群",
  desc: "在現代小家庭孤立的社會結構下，同心華德福提供了「一個村子來共同養育一個孩子」的強大社群支持",
  image: benefitThreeImg,
  bullets: [
    {
      title: "親師生三元合作",
      desc: "親師生工作關係非常密切。老師不僅在教學上投入，也花費大量時間與家長建立信任與溝通。家長之間也形成強大的橫向聯繫，不僅踴躍參與校務（如午餐小組、環境美化），甚至在課後互相支援，提供從放電、晚餐到洗澡的「一條龍服務」。這種充足的安全感與支持，讓孩子能踏出穩固的步伐。",
      icon: <UserGroupIcon />,
    },
    {
      title: "學習面對與處理衝突",
      desc: "當孩子在人際互動中出現衝突時，老師會引導他們學習如何表達感受、傾聽對方，並為自己的行為負起責任，甚至要求道歉的品質。",
      icon: <ChatAlt2Icon />,
    },
  ],
};


const videoData = [
  {
    url: "https://youtu.be/oermgcwIkC8",
    title: "同心華德福教育8分鐘精華",
    description: "您是否也在找尋教育孩子的不同路徑？您想改變嗎？您願意更勇敢的面對父母的角色嗎？您知道是因為孩子，我們才有機會成為更好的大人嗎？ 邀請您，成為同心的夥伴！",
  },
  {
    url: "https://youtu.be/atLmqSjhnxs",
    title: "與孩子的黃金線",
    description: "小學階段的老師與孩子間會有一條親密又隱形的黃金線，支持著孩子從事有感的活動，由內在長出自己的樣子，這條線溫暖孩子的心、協調身體的韻律，然後才進入學習，一步一步慢慢地走。沒有速成的知識和技法，對在一旁陪伴的家長來說，可能是享受也可能是煎熬，但請相信那牽著孩子的黃金線，對孩子來說，經由自身努力收成的那一刻，是最踏實、最難忘的。",
  },
  {
    url: "https://youtu.be/-kLpchWvdh4",
    title: "中學的自我革命",
    description: "中學是開始更進入探索自我的年紀，我們該如何引導他認識自己、挑戰自己？讓他明白，「這就是對我自己的一場革命！」我們又如何陪伴他投入社會，在參與中摸索自我的定位，變成一個有溫度、能永遠「繼續前進的那個我」？這些答案，在華德福中學教育的辦學過程中；點點滴滴，期待與您分享與相遇。",
  },
];

export { benefitOne, benefitTwo, benefitThree, videoData };
