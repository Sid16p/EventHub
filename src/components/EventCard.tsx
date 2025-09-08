import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { RSVPModal } from "./RSVPModal";

interface EventCardProps {
  event: any;
  isOrganizer: boolean;
  onDelete?: () => void;
  showRSVPStatus?: boolean;
}

export function EventCard({ event, isOrganizer, onDelete, showRSVPStatus }: EventCardProps) {
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  
  const userRSVP = useQuery(
    api.rsvps.getUserRSVP,
    !isOrganizer ? { eventId: event._id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRSVPStatusColor = (status: string) => {
    switch (status) {
      case "yes":
        return "bg-green-100 text-green-800";
      case "no":
        return "bg-red-100 text-red-800";
      case "maybe":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRSVPStatusText = (status: string) => {
    switch (status) {
      case "yes":
        return "Attending";
      case "no":
        return "Not Attending";
      case "maybe":
        return "Maybe";
      default:
        return "No Response";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-3">{event.description}</p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.date)}
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {event.category}
              </div>

              {event.organizer && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {event.organizer.organizationName || event.organizer.name}
                </div>
              )}
            </div>
          </div>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-24 h-24 object-cover rounded-lg ml-4"
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {showRSVPStatus && userRSVP && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRSVPStatusColor(userRSVP.status)}`}>
                {getRSVPStatusText(userRSVP.status)}
              </span>
            )}
            
            {event.rsvpCounts && (
              <div className="text-sm text-gray-600">
                {event.rsvpCounts.yes} attending • {event.rsvpCounts.maybe} maybe
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {isOrganizer ? (
              <>
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowRSVPModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {userRSVP ? "Update RSVP" : "RSVP"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showRSVPModal && (
        <RSVPModal
          event={event}
          currentRSVP={userRSVP}
          onClose={() => setShowRSVPModal(false)}
        />
      )}
    </div>
  );
}
