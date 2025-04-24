import React from "react";

export interface IRoute {
  id: string;
  path: string;
  name: string;
  component: React.ComponentType<React.PropsWithChildren<object>>;
}
