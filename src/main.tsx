import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Bisect from "./Bisect";
import Greedy from "./Greedy";
import DPLayoutVisualizer from "./DP";
import './index.css';
import './valkyrie-light.css';
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/bisect",
    element: <Bisect />,
  },
  {
    path: "/greedy",
    element: <Greedy />,
  },{
    path: "/dp",
    element: <DPLayoutVisualizer />,
  }
]);

createRoot(document.getElementById("root") as HTMLElement).render(<RouterProvider router={router} />);


