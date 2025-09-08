import { useState } from "react";
import { SignOutButton } from "../SignOutButton";
import { OrganizerDashboard } from "./OrganizerDashboard";
import { AttendeeDashboard } from "./AttendeeDashboard";
import { ProfilePage } from "./ProfilePage";
import { NotificationsPage } from "./NotificationsPage";

interface User {
  _id: string;
  name?: string;
  email?: string;
  profile: {
    role: "organizer" | "attendee";
    organizationName?: string;
    bio?: string;
    interests?: string[];
    contactInfo?: string;
  };
}

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const isOrganizer = user.profile.role === "organizer";

  const navigation = isOrganizer
    ? [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "events", label: "My Events", icon: "📅" },
        { id: "rsvps", label: "RSVPs", icon: "✅" },
        { id: "notifications", label: "Notifications", icon: "🔔" },
        { id: "profile", label: "Profile", icon: "👤" },
      ]
    : [
        { id: "dashboard", label: "Home", icon: "🏠" },
        { id: "browse", label: "Browse Events", icon: "🔍" },
        { id: "my-events", label: "My Events", icon: "📅" },
        { id: "notifications", label: "Notifications", icon: "🔔" },
        { id: "profile", label: "Profile", icon: "👤" },
      ];

  const renderContent = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage user={user} />;
      case "notifications":
        return <NotificationsPage />;
      default:
        return isOrganizer ? (
          <OrganizerDashboard currentPage={currentPage} />
        ) : (
          <AttendeeDashboard currentPage={currentPage} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EventHub</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {isOrganizer ? "Organizer" : "Attendee"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.name || user.email}!
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      currentPage === item.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
