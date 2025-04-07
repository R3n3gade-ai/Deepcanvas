import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";

const Login = lazy(() => import("./pages/Login"));

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SomethingWentWrongPage = lazy(
  () => import("./pages/SomethingWentWrongPage"),
);

export const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: (
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      ),
    },
    ...userRoutes,
    {
      path: "*",
      element: (
        <SuspenseWrapper>
          <NotFoundPage />
        </SuspenseWrapper>
      ),
      errorElement: (
        <SuspenseWrapper>
          <SomethingWentWrongPage />
        </SuspenseWrapper>
      ),
    },
  ]
);