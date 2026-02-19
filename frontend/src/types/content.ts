
export interface BaseBlock {
    type: string;
    _sourceFile?: string;
    _sourceLine?: number;
}

export interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
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
    align?: string;
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
    span?: number;
    order?: number;
}

export interface MediaItem {
    type: 'lottie' | 'image' | 'video' | 'youtube';
    lottie?: string;
    image?: string;
    video?: string;
    url?: string;
    mobileVideo?: string;
    poster?: string;
    mobilePoster?: string;
    alt?: string;
}

export interface FeatureItem {
    title: string;
    subtitle?: string;
    icon?: string;
    content: string;
    media?: MediaItem;
    span?: number;
    buttons?: CTAButton[];
    sub_items?: {
        title: string;
        content: string;
        icon?: string;
        buttons?: CTAButton[];
    }[];
}

export interface VideoItem {
    title: string;
    content: string;
    media: MediaItem;
    span?: number;
    duration?: string;
}

export type ListItem = FaqItem | FeatureItem | VideoItem;


// Basic layout types
export type LayoutMethod = 'vertical' | 'grid_cards' | 'bento_grid' | 'card_deck_swiper' | 'masonry_grid' | 'carousel';

export interface LayoutConfig {
    // Carousel options
    loop?: boolean;
    align?: 'start' | 'center';
    highlight_active?: boolean;
    limit?: number;
    append_more?: boolean;

    // Potential future options
    // columns?: number;
    // gap?: number;
    [key: string]: any;
}

export interface ResponsiveLayout {
    method: LayoutMethod;
    config?: LayoutConfig;

    // Optional overrides for specific breakpoints
    // In Design A, we support separating desktop and mobile completely if needed
    desktop?: {
        method: LayoutMethod;
        config?: LayoutConfig;
    };
    mobile?: {
        method: LayoutMethod;
        config?: LayoutConfig;
    };
}

export interface ListBlock extends BaseBlock {
    type: 'list_block';

    // New structured layout property (Design A)
    layout?: LayoutMethod | ResponsiveLayout;

    // Deprecated properties removed
    // layout_method?: LayoutMethod;
    // mobile_layout_method?: LayoutMethod;
    // layout_config?: LayoutConfig;

    item_type: 'faq_item' | 'feature_item' | 'video_item';
    items?: ListItem[];
    faq_ids?: string[];
    title?: string;
    direction?: string;
    buttons?: CTAButton[];
    mobile_scroll?: boolean;
    variant?: string;
}

export interface Question {
    id: string;
    text: string;
    reason?: string;
    benefit?: string;
}

export interface Category {
    id: string;
    title: string;
    questions: Question[];
    feedback?: {
        high: string;
        general: string;
    };
    advice?: {
        high: string;
        low: string;
    };
}

export interface QuestionnaireResult {
    minScore: number;
    maxScore: number;
    level: string;
    title: string;
    description: string;
    color?: string;
    radar_chart?: {
        label: string;
    };
    future_prediction?: string;
    expert_advice?: {
        title: string;
        content: string;
    }[];
}

export interface QuestionnaireData {
    id: string;
    slug?: string;
    title: string;
    description: string;
    scale: { value: number; label: string }[];
    categories: Category[];
    results: QuestionnaireResult[];
    meta?: {
        social_proof?: string;
        social_proof_text?: string;
    };
}

export interface CurriculumBlock extends BaseBlock {
    type: 'curriculum_block';
}

export interface QuestionnaireBlock extends BaseBlock {
    type: 'questionnaire_block';
    questionnaire_id: string;
}

export interface MemberBlock extends BaseBlock {
    type: 'member_block';
    members: string[];
}

export interface CardItem extends BaseBlock {
    type: 'card_item';
    title: string;
    subtitle?: string;
    icon?: string;
    media?: MediaItem;
    content: string;
}

export interface CompactCardItem extends BaseBlock {
    type: 'compact_card_item';
    title: string;
    subtitle?: string;
    content?: string;
}

export interface VisitProcessBlock extends BaseBlock {
    type: 'visit_process_block';
}

export interface VisitScheduleBlock extends BaseBlock {
    type: 'visit_schedule_block';
}

export interface TimelineItem {
    type?: 'header';
    title: string;
    year?: string;
    subtitle?: string;
    content?: string;
    detail?: string;
    icon?: string;
    image?: string;
    background_image?: string;
    color?: string;
}

export interface TimelineBlock extends BaseBlock {
    type: 'timeline_block';
    items: TimelineItem[];
    show_progress_text?: boolean;
}

export interface CTABlock extends BaseBlock {
    type: 'cta_block';
    buttons: CTAButton[];
    align?: 'left' | 'center' | 'right';
}

export interface MermaidBlock extends BaseBlock {
    type: 'mermaid_block';
    chart: string;
    caption?: string;
}

export interface ChartItem {
    name: string;
    value: number;
}

export interface PieChartBlock extends BaseBlock {
    type: 'pie_chart_block';
    title?: string;
    data: ChartItem[];
    unit?: string;
}

export interface RadarChartDataset {
    label: string;
    data: number[];
}

export interface RadarChartBlock extends BaseBlock {
    type: 'radar_chart_block';
    title?: string;
    labels: string[];
    datasets: RadarChartDataset[];
}

export interface BarChartDataset {
    label: string;
    data: number[];
}

export interface BarChartBlock extends BaseBlock {
    type: 'bar_chart_block';
    title?: string;
    labels: string[];
    datasets: BarChartDataset[];
    horizontal?: boolean;
    unit?: string;
}

export interface BreathingIntroBlock extends BaseBlock {
    type: 'breathing_intro_block';
}

export interface ScheduleListBlock extends BaseBlock {
    type: 'schedule_list_block';
    items: ScheduleItem[];
    title?: string;
}

export interface ComparisonItem {
    text: string;
    icon?: string;
    description?: string;
}

export interface ComparisonSide {
    label: string;
    items: ComparisonItem[];
    badge?: string;
}

export interface ComparisonBlock extends BaseBlock {
    type: 'comparison_block';
    left: ComparisonSide;
    right: ComparisonSide;
    image?: string;
}

export type Block = TextBlock | ScheduleBlock | ListBlock | CurriculumBlock | QuestionnaireBlock | MemberBlock | CardItem | CompactCardItem | VisitProcessBlock | VisitScheduleBlock | TimelineBlock | CTABlock | MermaidBlock | PieChartBlock | RadarChartBlock | BarChartBlock | BreathingIntroBlock | ScheduleListBlock | ComparisonBlock;

export interface Divider {
    type: 'wave' | 'curve';
    position: 'top' | 'bottom';
    color?: string;
    flip?: boolean;
}

export interface Section {
    section_id?: string;
    blocks: Block[];
    layout?: string;
    divider?: Divider;
    overlay_color?: string;
    media_list?: MediaItem[];
    parallax_ratio?: number;
    full_height?: boolean;
    silk_background?: boolean;
    entry_animation?: boolean | { delay?: number; duration?: number };
    ignore_padding?: boolean;
    shader_gradient?: boolean;
}

export interface HeroMedia {
    type: 'image' | 'video';
    image?: string;
    video?: string;
    mobileVideo?: string;
    poster?: string;
    mobilePoster?: string;
}

export interface HeroData {
    title: string;
    subtitle: string;
    accent_text?: string;
    media_list?: HeroMedia[];
    layout?: string;
    divider?: Divider;
    overlay_color?: string;
    full_height?: boolean;
}

export interface Member {
    id: string;
    title: string;
    subtitle?: string;
    media?: MediaItem;
    hover_media?: MediaItem;
    content?: string;
    order?: number;
    [key: string]: any;
}

export interface PageContextValue {
    getMemberDetails: (title: string) => Member | undefined;
    setSelectedMember: (member: Member | null) => void;
    selectedMember: Member | null;
    faqList: FaqItem[];
    getImagePath: (path: string) => string;
    questionnaire?: QuestionnaireData;
}

export interface PageData {
    title: string;
    slug: string;
    hero: HeroData & { _sourceFile?: string; _sourceLine?: number; _sourceLines?: Record<string, number> };
    sections: (Section & { _sourceFile?: string; _sourceLine?: number })[];
    content?: string;
    faq?: FaqItem[];
    questionnaire?: QuestionnaireData;
    seo?: SEOData;
    _sourceFile?: string;
}

export interface NavigationItem {
    text: string;
    link: string;
}

export interface NavigationData {
    items: NavigationItem[];
}

export interface Course {
    id: string;
    slug: string;
    title: string;
    content?: string;
    [key: string]: any;
}

export interface SiteData {
    name: string;
    url: string;
    logo: string;
    description: string;
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    contact: {
        telephone: string;
        email: string;
    };
    socialLinks: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
    };
}
