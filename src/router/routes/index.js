// @packages
import { lazy } from "react";

// @constants
const TemplateTitle = "%s - TeamClass Ops Dashboard";
const DefaultRoute = "/pipeline";

// @routes
const Routes = [
  {
    path: "/calendar",
    component: lazy(() => import("../../views/Calendar"))
  },
  {
    path: "/bookings",
    component: lazy(() => import("../../views/BookingStage"))
  },
  {
    path: "/pipeline",
    component: lazy(() => import("../../views/FunnelBookings"))
  },
  {
    appLayout: true,
    className: "chat-application",
    component: lazy(() => import("../../views/Chat")),
    path: "/chat"
  },
  {
    path: "/all-bookings",
    component: lazy(() => import("../../views/AllBookings"))
  },
  {
    path: "/booking/:id",
    component: lazy(() => import("../../views/BookingId"))
  },
  {
    path: "/general-inquiries",
    component: lazy(() => import("../../views/GeneralInquiries"))
  },
  {
    path: "/large-events",
    component: lazy(() => import("../../views/LargeEvents"))
  },
  {
    path: "/discount-codes",
    component: lazy(() => import("../../views/DiscountCodes"))
  },
  {
    path: "/listing-prices",
    component: lazy(() => import("../../views/ListingPrices"))
  },
  {
    path: "/late-requests",
    component: lazy(() => import("../../views/LateRequests"))
  },
  {
    path: "/instructors",
    component: lazy(() => import("../../views/Instructors"))
  },
  {
    path: "/coordinators",
    component: lazy(() => import("../../views/Coordinators"))
  },
  {
    path: "/distributors",
    component: lazy(() => import("../../views/Distributors"))
  },
  {
    path: "/reviews",
    component: lazy(() => import("../../views/Reviews"))
  },
  {
    path: "/login",
    component: lazy(() => import("../../views/Login")),
    layout: "BlankLayout",
    meta: {
      authRoute: true
    }
  },
  {
    path: "/error",
    component: lazy(() => import("../../views/Error")),
    layout: "BlankLayout"
  },
  {
    path: "/email-log",
    component: lazy(() => import("../../views/EmailLog"))
  },
  {
    path: "/system-status",
    component: lazy(() => import("../../views/SystemStatus"))
  }
];

export { DefaultRoute, TemplateTitle, Routes };
