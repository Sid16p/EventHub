import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { CreateEventModal } from "./CreateEventModal";
import { EventCard } from "./EventCard";

interface OrganizerDashboardProps {
  currentPage: string;
}

export function OrganizerDashboard({ currentPage }: OrganizerDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const myEvents = useQuery(api.events.getMyEvents);
  const eventRSVPs = useQuery(
    api.rsvps.getEventRSVPs,
    selectedEventId ? { eventId: selectedEventId as any } : "skip"
  );

  const deleteEvent = useMutation(api.events.deleteEvent);

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteEvent({ eventId: eventId as any });
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  if (currentPage === "dashboard") {
    const upcomingEvents = myEvents?.filter(event => event.date > Date.now()) || [];
    const totalRSVPs = 0; // This would need to be calculated from all events

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </button>
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
                <p className="text-sm font-medium text-gray-600">Total Events</p>
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
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total RSVPs</p>
                <p className="text-2xl font-bold text-gray-900">{totalRSVPs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="p-6">
            {myEvents && myEvents.length > 0 ? (
              <div className="grid gap-6">
                {myEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isOrganizer={true}
                    onDelete={() => handleDeleteEvent(event._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-4">Create your first event to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <CreateEventModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    );
  }

  if (currentPage === "events") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </button>
        </div>

        {myEvents && myEvents.length > 0 ? (
          <div className="grid gap-6">
            {myEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isOrganizer={true}
                onDelete={() => handleDeleteEvent(event._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </div>
        )}

        {showCreateModal && (
          <CreateEventModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    );
  }

  if (currentPage === "rsvps") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">RSVP Management</h1>

        {myEvents && myEvents.length > 0 ? (
          <div className="space-y-6">
            {myEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEventId(selectedEventId === event._id ? null : event._id)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedEventId === event._id ? "Hide RSVPs" : "View RSVPs"}
                    </button>
                  </div>
                </div>

                {selectedEventId === event._id && eventRSVPs && (
                  <div className="p-6">
                    {eventRSVPs.length > 0 ? (
                      <div className="space-y-4">
                        {eventRSVPs.map((rsvp) => (
                          <div key={rsvp._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{rsvp.user.name}</p>
                              <p className="text-sm text-gray-600">{rsvp.user.email}</p>
                              {rsvp.notes && (
                                <p className="text-sm text-gray-600 mt-1">Note: {rsvp.notes}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              rsvp.status === "yes" 
                                ? "bg-green-100 text-green-800"
                                : rsvp.status === "no"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {rsvp.status === "yes" ? "Attending" : rsvp.status === "no" ? "Not Attending" : "Maybe"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No RSVPs yet</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No events to manage RSVPs for</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
