import React from "react";
import { useCurrentUser } from "app";
import { ActivityLog } from "../utils/activityTracking";

export interface ActivityTimelineProps {
  activities: ActivityLog[];
  limit?: number;
  loading?: boolean;
  onFilterChange?: (filter: string) => void;
  showFilters?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

export function ActivityTimeline({
  activities,
  limit = 5,
  loading = false,
  onFilterChange,
  showFilters = false,
  showLoadMore = false,
  onLoadMore,
}: ActivityTimelineProps) {
  const { user } = useCurrentUser();
  const displayActivities = activities.slice(0, limit);

  // Get activity type color
  const getTypeColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "create":
        return "bg-green-500";
      case "update":
        return "bg-blue-500";
      case "delete":
        return "bg-red-500";
      case "view":
        return "bg-gray-500";
      default:
        return "bg-purple-500";
    }
  };

  // Format a relative time string (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return "just now";

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;

      const months = Math.floor(days / 30);
      if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;

      const years = Math.floor(months / 12);
      return `${years} ${years === 1 ? "year" : "years"} ago`;
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return "unknown time";
    }
  };

  // Generate a descriptive message for the activity
  const getActivityMessage = (activity: ActivityLog) => {
    const actionVerb = {
      create: "created",
      update: "updated",
      delete: "deleted",
      view: "viewed",
    }[activity.type];

    return `${actionVerb} a ${activity.collectionName} record`;
  };

  // Get initials for the avatar
  const getUserInitials = (name: string) => {
    if (!name || name === "Unknown User") return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("");
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-pulse h-12 rounded-md bg-gray-200 w-full mb-4"></div>
        <div className="animate-pulse h-12 rounded-md bg-gray-200 w-full mb-4"></div>
        <div className="animate-pulse h-12 rounded-md bg-gray-200 w-full"></div>
      </div>
    );
  }

  if (displayActivities.length === 0) {
    return <div className="text-center py-4 text-gray-500">No activities found</div>;
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-2 pb-2 mb-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => onFilterChange?.("")}
            className="text-xs whitespace-nowrap px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            All
          </button>
          <button
            onClick={() => onFilterChange?.("create")}
            className="text-xs whitespace-nowrap px-2 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200"
          >
            Created
          </button>
          <button
            onClick={() => onFilterChange?.("update")}
            className="text-xs whitespace-nowrap px-2 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Updated
          </button>
          <button
            onClick={() => onFilterChange?.("delete")}
            className="text-xs whitespace-nowrap px-2 py-1 rounded-full bg-red-100 text-red-800 hover:bg-red-200"
          >
            Deleted
          </button>
        </div>
      )}

      <div className="border-l-2 border-gray-200 ml-2 pl-6 space-y-6">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="relative">
            {/* Timeline dot */}
            <div
              className={`absolute -left-9 w-4 h-4 rounded-full ${getTypeColor(
                activity.type
              )}`}
            ></div>

            {/* Activity content */}
            <div className="mb-1 flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 flex-shrink-0">
                    {getUserInitials(activity.userName)}
                  </div>
                  <div>
                    <div className="font-medium">{activity.userName}</div>
                    <div className="text-sm text-gray-500">
                      {getActivityMessage(activity)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {getRelativeTime(activity.timestamp)}
              </div>
            </div>

            {/* Activity details if they exist */}
            {activity.details && Object.keys(activity.details).length > 0 && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                <div className="font-medium text-xs text-gray-500 mb-1">Details:</div>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <li key={key} className="text-xs">
                      <span className="font-medium">{key}:</span>{" "}
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {showLoadMore && displayActivities.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
