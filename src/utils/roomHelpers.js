import { nanoid } from "nanoid";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Generate a short room code (6 characters, easy to share)
export const generateRoomCode = () => nanoid(6).toUpperCase();

// Create a new room
export const createRoom = async (roomData, creatorName) => {
  const roomCode = generateRoomCode();
  const roomRef = doc(db, "rooms", roomCode);

  await setDoc(roomRef, {
    name: roomData.name,
    creatorName: creatorName,
    startTime: `${roomData.timeRange[0]}:00`,
    endTime: `${roomData.timeRange[1]}:00`,
    days: roomData.selectedDays,
    timeSlotDuration: roomData.timeSlotDuration,
    createdAt: new Date().toISOString(),
  });

  return roomCode;
};

// Get room data
export const getRoom = async (roomCode) => {
  const roomRef = doc(db, "rooms", roomCode);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    return { id: roomSnap.id, ...roomSnap.data() };
  }
  return null;
};

// Subscribe to room updates (real-time)
export const subscribeToRoom = (roomCode, callback) => {
  const roomRef = doc(db, "rooms", roomCode);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// Add participant to room
export const addParticipant = async (roomCode, participantData) => {
  const participantsRef = collection(db, "rooms", roomCode, "participants");

  const docRef = await addDoc(participantsRef, {
    name: participantData.name,
    busySlots: participantData.busySlots || [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    joinedAt: new Date().toISOString(),
  });

  return docRef.id;
};

// Subscribe to participants (real-time)
export const subscribeToParticipants = (roomCode, callback) => {
  const participantsRef = collection(db, "rooms", roomCode, "participants");
  return onSnapshot(participantsRef, (snapshot) => {
    const participants = [];
    snapshot.forEach((doc) => {
      participants.push({ id: doc.id, ...doc.data() });
    });
    callback(participants);
  });
};

// Update participant's busy slots
export const updateParticipantBusySlots = async (
  roomCode,
  participantId,
  busySlots
) => {
  const participantRef = doc(
    db,
    "rooms",
    roomCode,
    "participants",
    participantId
  );
  await setDoc(participantRef, { busySlots }, { merge: true });
};
