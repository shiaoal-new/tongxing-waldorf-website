export type MenuState = {
    visible: boolean;
    x: number;
    y: number;
    ymlSrc: string | null;
    tsxSrc: string | null;
    element: HTMLElement | null;
    tsxElement: HTMLElement | null;
    deltaX: number;
    deltaY: number;
};

export type NoteData = {
    text: string;
    id: string;
    rx?: number; // ratio X relative to bounding rect (0-1)
    ry?: number; // ratio Y relative to bounding rect (0-1)
};

export type NotePosition = {
    x: number;
    y: number;
    text: string;
    ymlSrc: string;
};
