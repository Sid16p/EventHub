import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [role, setRole] = useState<"organizer" | "attendee" | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createProfile = useMutation(api.users.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile({
        role: role as "organizer" | "attendee",
        organizationName: organizationName || undefined,
        bio: bio || undefined,
        interests: interests ? interests.split(",").map(i => i.trim()) : undefined,
        contactInfo: contactInfo || undefined,
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to:
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={role === "organizer"}
                  onChange={(e) => setRole(e.target.value as "organizer")}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Organize Events</div>
                  <div className="text-sm text-gray-600">Create and manage events for others to attend</div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="attendee"
                  checked={role === "attendee"}
                  onChange={(e) => setRole(e.target.value as "attendee")}
                  className="mr-3 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Attend Events</div>
                  <div className="text-sm text-gray-600">Discover and join exciting events in your area</div>
                </div>
              </label>
            </div>
          </div>

          {/* Organization Name (for organizers) */}
          {role === "organizer" && (
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name (Optional)
              </label>
              <input
                type="text"
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your company or organization"
              />
            </div>
          )}

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Interests (for attendees) */}
          {role === "attendee" && (
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Interests (Optional)
              </label>
              <input
                type="text"
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Music, Sports, Technology (comma-separated)"
              />
            </div>
          )}

          {/* Contact Info */}
          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Info (Optional)
            </label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number or additional contact info"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !role}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating Profile..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
