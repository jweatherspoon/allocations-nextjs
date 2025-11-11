export enum ChipStatus {
  INFO = 0,
  SUCCESS = 1,
  WARNING = 2,
  ERROR = 3,
}

export type RenderedChipStatus = {
  id: string;
  label: string;
  status: ChipStatus;
};
