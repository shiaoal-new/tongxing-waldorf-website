
export interface BaseBlock {
    type: string;
}

export interface CTAButton {
    text: string;
    link: string;
    style?: string;
}

export interface TextBlock extends BaseBlock {
    type: 'text_block';
    title?: string;
    subtitle?: string;
    content?: string;
    buttons?: CTAButton[];
}

export interface ScheduleItem {
    time: string;
    title: string;
    content: string;
    type: 'in' | 'out';
}

export interface ScheduleBlock extends BaseBlock {
    type: 'schedule_block';
    low: ScheduleItem[];
    high: ScheduleItem[];
}

export interface FaqItem {
    title: string;
    id: string;
    subtitle?: string;
    content: string;
}

export interface MediaItem {
    type: 'lottie' | 'image' | 'video';
    lottie?: string;
    image?: string;
    video?: string;
}

export interface BenefitItem {
    title: string;
    subtitle?: string;
    icon?: string;
    content: string;
    media?: MediaItem;
}

export type ListItem = FaqItem | BenefitItem;

export interface ListBlock extends BaseBlock {
    type: 'list_block';
    layout_method: 'vertical' | 'grid_cards';
    item_type: 'faq_item' | 'benefit_item';
    items: ListItem[];
}

export interface CurriculumBlock extends BaseBlock {
    type: 'curriculum_block';
}

export type Block = TextBlock | ScheduleBlock | ListBlock | CurriculumBlock;

export interface Section {
    section_id: string;
    blocks: Block[];
    layout?: string;
}

export interface HeroMedia {
    type: 'image' | 'video';
    image?: string;
    video?: string;
}

export interface HeroData {
    title: string;
    subtitle: string;
    content: string;
    accent_text?: string;
    media_list?: HeroMedia[];
    layout?: string;
}

export interface PageData {
    title: string;
    slug: string;
    hero: HeroData;
    sections: Section[];
    content?: string; // Optional top-level content seen in curriculum-development.yml
}
