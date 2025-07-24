export type TDevice = {
  id: number;
  count: number;
  name: string;
  status: string;
};

export type TResponse = {
  data: TDevice[];
};
