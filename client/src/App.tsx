import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useQuickRTC, QuickRTCVideo } from "quickrtc-react-client";
import type { LocalStream, RemoteStream } from "quickrtc-react-client";

function App() {
  const socket = useMemo(() => io("https://localhost:3000"), []);
  // Step 1: Initialize QuickRTC hook
  const { rtc, join, produce, leave } = useQuickRTC({ socket });

  const [joined, setJoined] = useState(false);
  const [conferenceId, setConferenceId] = useState("demo-room");
  const [participantName, setParticipantName] = useState("");
  const [localStreams, setLocalStreams] = useState<LocalStream[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  // Step 2: Subscribe to QuickRTC events
  useEffect(() => {
    if (!rtc) return;

    rtc.on("newParticipant", ({ streams }) => {
      setRemoteStreams((prev) => [...prev, ...streams]);
    });

    rtc.on("streamAdded", (stream) => {
      setRemoteStreams((prev) => [...prev, stream]);
    });

    rtc.on("streamRemoved", ({ streamId }) => {
      setRemoteStreams((prev) => prev.filter((s) => s.id !== streamId));
    });

    rtc.on("participantLeft", ({ participantId }) => {
      setRemoteStreams((prev) =>
        prev.filter((s) => s.participantId !== participantId)
      );
    });
  }, [rtc]);

  const handleJoin = async () => {
    // Step 3: Join conference and produce streams
    console.log("handle join");
    await join({ conferenceId, participantName });
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const streams = await produce(stream.getTracks());
    setLocalStreams(streams);
    setJoined(true);
  };

  const handleLeave = async () => {
    // Step 4: Leave conference and cleanup
    await leave();
    setJoined(false);
    setLocalStreams([]);
    setRemoteStreams([]);
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4">
        <h1 className="text-3xl font-bold">QuickRTC Demo</h1>
        <input
          type="text"
          placeholder="Conference ID"
          value={conferenceId}
          onChange={(e) => setConferenceId(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 w-64"
        />
        <input
          type="text"
          placeholder="Your Name"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 w-64"
        />
        <button
          onClick={handleJoin}
          disabled={!conferenceId || !participantName}
          className="px-8 py-3 text-lg bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4">
      <div className="flex flex-wrap gap-4 justify-center">
        {localStreams.map((s) => (
          <QuickRTCVideo
            key={s.id}
            stream={s.stream}
            muted
            mirror
            className="w-80 h-60 rounded-lg"
          />
        ))}
        {remoteStreams.map((s) => (
          <QuickRTCVideo
            key={s.id}
            stream={s.stream}
            className="w-80 h-60 rounded-lg"
          />
        ))}
      </div>
      <button
        onClick={handleLeave}
        className="px-8 py-3 text-lg bg-red-500 rounded-lg hover:bg-red-600"
      >
        Leave
      </button>
    </div>
  );
}

export default App;
