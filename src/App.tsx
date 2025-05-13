import { Link } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";

export default function App() {
  return (

      <div className="p-4">
        <ul className="mt-4 space-y-2">
          <li>
            <Link to="/bisect">Bisect</Link>
          </li>
          <li>
            <Link to="/greedy">Greedy</Link>
          </li>
          <li>
            <Link to="/dp">Dynamic Programming</Link>
          </li>
        </ul>
      </div>

  );
}
