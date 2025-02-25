import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayouts from "@/layouts/public-layouts";
import HomePage from "@/routes/home";
import AuthenticationLayout from "@/layouts/auth-layout";
import SignInPage from "./routes/sign-in";
import SignUpPage from "./routes/sign-up";
import ProtectRoutes from "./layouts/protected-routes";
import MainLayouts from "./layouts/main-layout";
import Generate from "./components/generate";
import Dashboard from "./routes/dashboard";
import CreateEditPage from "./routes/create-edit-page";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PublicLayouts içinde HomePage render edilsin */}
        <Route element={<PublicLayouts />}>
          <Route index element={<HomePage />} />
        </Route>

        {/*Authentication layout */}
        <Route element={<AuthenticationLayout />}>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
        </Route>

        {/* Protected routes*/}
        <Route
          element={
            <ProtectRoutes>
              <MainLayouts />
            </ProtectRoutes>
          }
        >
          {/* add all the protected routes*/}
          <Route element={<Generate />} path="/generate">
            <Route index element={<Dashboard />} />
            <Route path=":interviewId" element={<CreateEditPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
