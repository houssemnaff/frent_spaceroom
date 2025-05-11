import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";

export const MeetingHeader = ({ courseName, isOwner, onOpenCreate, onOpenInstant }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div>
      <h2 className="text-3xl font-bold">Réunions</h2>
      <p className="text-gray-500 mt-1">Gérez les réunions virtuelles pour {courseName}</p>
    </div>
    {isOwner && (
      <div className="flex gap-2">
        <Button
          onClick={onOpenInstant}
          className="flex items-center gap-2"
          variant="secondary"
          size="lg"
        >
          <Video className="h-4 w-4" />
          Réunion instantanée
        </Button>
        <Button
          onClick={onOpenCreate}
          className="flex items-center gap-2"
          size="lg"
        >
          <Calendar className="h-4 w-4" />
          Planifier une réunion
        </Button>
      </div>
    )}
  </div>
);