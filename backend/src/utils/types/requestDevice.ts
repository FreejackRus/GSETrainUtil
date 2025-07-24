export type TRequestDevice = {
  id?: number;
  name: string;
  status: string;
  count: number;
};

export type TRequestUser = {
  id?: number;
  login: string;
  password: string;
  role: string;
};
