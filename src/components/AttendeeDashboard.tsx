import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EventCard } from "./EventCard";
import { EventBrowser } from "./EventBrowser";

interface AttendeeDashboardProps {
  currentPage: string;
}

export function AttendeeDashboard({ currentPage }: AttendeeDashboardProps) {
  const myEvents = useQuery(api.events.getMyEvents);
  const allEvents = useQuery(api.events.listEvents, {});

  if (currentPage === "dashboard") {
    const upcomingEvents = allEvents?.filter(event => event.date > Date.now()).slice(0, 6) || [];
    const myUpcomingEvents = myEvents?.filter(event => event.date > Date.now()) || [];

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Discover amazing events happening around you</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Events</p>
                <p className="text-2xl font-bold text-gray-900">{myEvents?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{myUpcomingEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Events</p>
                <p className="text-2xl font-bold text-gray-900">{allEvents?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Events */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isOrganizer={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600">Check back later for new events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "browse") {
    return <EventBrowser />;
  }

  if (currentPage === "my-events") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>

        {myEvents && myEvents.length > 0 ? (
          <div className="grid gap-6">
            {myEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isOrganizer={false}
                showRSVPStatus={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">Browse events to find something interesting</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
