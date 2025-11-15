const ParticipantModal = ({ participants, currentParticipantId, onClose }) => {
  // Group participants by name and mark which one is "you"
  const uniqueParticipants = participants.reduce((acc, participant) => {
    const existing = acc.find((p) => p.name === participant.name);
    if (existing) {
      // If this is the current user's ID, mark it as "you"
      if (participant.id === currentParticipantId) {
        existing.isYou = true;
      }
    } else {
      acc.push({
        name: participant.name,
        isYou: participant.id === currentParticipantId,
      });
    }
    return acc;
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Participants</h3>
        <div className="space-y-2">
          {uniqueParticipants.map((participant, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-gray-100 rounded text-center"
            >
              {participant.name}
              {participant.isYou && " (you)"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;
