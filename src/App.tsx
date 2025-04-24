import { createBrowserRouter, RouterProvider } from "react-router";
import { publicRoutes } from "./routes";

const routerConfig = publicRoutes.map((route) => ({
  path: route.path,
  element: <route.component />,
}));

const router = createBrowserRouter(routerConfig);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
