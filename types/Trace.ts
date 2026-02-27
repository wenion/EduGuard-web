export type Trace = {
  type: string;
  source?: string;
  target: {
    tag: string | null;
    id: string | null;
    class: string | null;
    text: string | null;
  };
  additional: Record<string, any>;
  pageWidth?: number | null;
  pageHeight?: number | null;
  scrollX?: number | null;
  scrollY?: number | null;
  eventX?: number | null;
  eventY?: number | null;
};
