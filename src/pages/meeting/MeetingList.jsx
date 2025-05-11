import React from "react";
import MeetingListItem from "./MeetingListItem";

const MeetingList = ({
  meetings,
  isOwner,
  onJoin,
  onEdit,
  onDelete,
  onSetRecording,
  isPast = false,
  isMeetingLive,
  isMeetingSoonAvailable,
  formatDate,
  formatTime
}) => {
  return (
    <ul className="divide-y divide-gray-100">
      {meetings.map((meeting) => (
        <MeetingListItem
          key={meeting._id}
          meeting={meeting}
          isLive={isPast ? false : isMeetingLive && isMeetingLive(meeting)}
          isSoonAvailable={isPast ? false : isMeetingSoonAvailable && isMeetingSoonAvailable(meeting)}
          isPast={isPast}
          onJoin={onJoin ? () => onJoin(meeting) : undefined}
          onEdit={() => onEdit(meeting)}
          onDelete={() => onDelete(meeting)}
          onSetRecording={onSetRecording ? () => onSetRecording(meeting) : undefined}
          isOwner={isOwner}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      ))}
    </ul>
  );
};

export default MeetingList;