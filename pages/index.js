import Hero from "../components/hero";
import SectionTitle from "../components/sectionTitle";
import { videoData } from "../components/data";
import Video from "../components/video";
import Benefits from "../components/benefits";
import Cta from "../components/cta";
import Faq from "../components/faq";
import { getAllFaculty } from "../lib/faculty";
import { getAllFaq } from "../lib/faq";
import { getAllBenefits } from "../lib/benefits";
import { getAllPages } from "../lib/pages";
import Layout from "../components/layout";

export default function Home({ facultyList, faqList, benefitsList, pages }) {
  return (
    <Layout pages={pages}>
      <Hero />
      <SectionTitle
        direction="left"
        pretitle="教育特色"
        title="為什麼要選擇同心華德福">
        選擇同心華德福教育，是為孩子選擇了一條以身心靈全面發展為核心，順應生命節奏、重視內在意志培養的教育路徑，旨在幫助他們在充滿挑戰的現代社會中，長成健康、獨立且擁有堅實自我認知的個體。
      </SectionTitle>
      {benefitsList.map((benefit, index) => (
        <Benefits
          key={benefit.id}
          imgPos={index % 2 === 1 ? "right" : "left"}
          data={benefit}
        />
      ))}
      <SectionTitle
        direction="right"
        pretitle="深入了解華德福"
        title="同心影音專區">
        透過影像紀錄，帶您一窺同心華德福的教育現場，感受親師生之間真實的互動與成長點滴。
        從幼兒教育到中學發展，讓我們一起探索孩子的生命歷程。
      </SectionTitle>
      <Video />
      {/* <SectionTitle
        pretitle="Testimonials"
        title="Here's what our customers said">
        Testimonails is a great way to increase the brand trust and awareness.
        Use this section to highlight your popular customers.
      </SectionTitle>
      <Testimonials /> */}
      {/* <SectionTitle pretitle="我們的團隊" title="教職員名單">
        認識我們專業且充滿熱忱的教職員團隊,他們致力於為孩子提供最優質的華德福教育。
      </SectionTitle>
      <Faculty facultyList={facultyList} /> */}
      <SectionTitle pretitle="FAQ" title="常見問答" direction="left">
        這裡彙整了家長們最常詢問的問題，希望能協助您更深入了解同心華德福的教育理念與入學相關資訊。
      </SectionTitle>
      <Faq faqList={faqList} />
      <Cta />
    </Layout>
  );
}

export async function getStaticProps() {
  const facultyList = getAllFaculty();
  const faqList = getAllFaq();
  const benefitsList = getAllBenefits();
  const pages = getAllPages();
  return {
    props: {
      facultyList,
      faqList,
      benefitsList,
      pages,
    },
  };
}
