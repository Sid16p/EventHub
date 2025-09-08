import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface RSVPModalProps {
  event: any;
  currentRSVP?: any;
  onClose: () => void;
}

export function RSVPModal({ event, currentRSVP, onClose }: RSVPModalProps) {
  const [status, setStatus] = useState<"yes" | "no" | "maybe">(currentRSVP?.status || "yes");
  const [notes, setNotes] = useState(currentRSVP?.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  const createOrUpdateRSVP = useMutation(api.rsvps.createOrUpdateRSVP);
  const deleteRSVP = useMutation(api.rsvps.deleteRSVP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createOrUpdateRSVP({
        eventId: event._id,
        status,
        notes: notes || undefined,
      });
      
      toast.success(`RSVP ${currentRSVP ? "updated" : "submitted"} successfully!`);
      onClose();
    } catch (error) {
      toast.error("Failed to submit RSVP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRSVP) return;
    
    setIsLoading(true);
    try {
      await deleteRSVP({ eventId: event._id });
      toast.success("RSVP removed successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to remove RSVP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {currentRSVP ? "Update RSVP" : "RSVP to Event"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Will you attend this event?
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="yes"
                    checked={status === "yes"}
                    onChange={(e) => setStatus(e.target.value as "yes")}
                    className="mr-3 text-green-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Yes, I'll be there</div>
                    <div className="text-sm text-gray-600">I'm definitely attending</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="maybe"
                    checked={status === "maybe"}
                    onChange={(e) => setStatus(e.target.value as "maybe")}
                    className="mr-3 text-yellow-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Maybe</div>
                    <div className="text-sm text-gray-600">I might attend</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="no"
                    checked={status === "no"}
                    onChange={(e) => setStatus(e.target.value as "no")}
                    className="mr-3 text-red-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">No, I can't make it</div>
                    <div className="text-sm text-gray-600">I won't be attending</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional comments or questions..."
              />
            </div>

            <div className="flex justify-between pt-4">
              {currentRSVP && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Remove RSVP
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Submitting..." : currentRSVP ? "Update RSVP" : "Submit RSVP"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
