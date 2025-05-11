import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video, Users, Clock, Play, MoreVertical } from "lucide-react";

const MeetingListItem = ({
  meeting,
  isLive,
  isSoonAvailable,
  isPast,
  onJoin,
  onEdit,
  onDelete,
  onSetRecording,
  isOwner,
  formatDate,
  formatTime,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(meeting);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(meeting);
  };

  return (
    <li className="p-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center h-12 w-12 bg-blue-50 rounded-full">
            <Video className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg truncate">{meeting.title}</h3>
              {isLive && <Badge className="bg-red-500">En direct</Badge>}
              {isSoonAvailable && <Badge className="bg-amber-500">Bientôt disponible</Badge>}
              {meeting.recordingAvailable && <Badge className="bg-green-500">Enregistrement disponible</Badge>}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(meeting.startTime)} • {formatTime(meeting.startTime)} ({meeting.duration} min)
            </div>
            {meeting.description && (
              <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center text-gray-500 text-sm">
                <Users className="h-4 w-4 mr-1" />
                {meeting.participants?.length || 0} participants
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {meeting.duration} minutes
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {isPast ? (
            <>
              {isOwner && !meeting.recordingAvailable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetRecording(meeting)}
                  className="hidden sm:flex"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Marquer comme enregistré
                </Button>
              )}
              {meeting.recordingAvailable && (
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Play className="h-4 w-4 mr-2" />
                  Voir l'enregistrement
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => onJoin(meeting)}
              disabled={!isLive && !isSoonAvailable && !meeting.isInstant}
              className={`${
                isLive || meeting.isInstant ? "bg-red-500 hover:bg-red-600" : ""
              }`}
            >
              <Video className="h-4 w-4 mr-2" />
              {isLive || meeting.isInstant ? "Rejoindre" : "Accéder"}
            </Button>
          )}
          {isOwner && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </li>
  );
};

export default MeetingListItem;