import React, { useState } from "react";

const VolumeButton = ({ player }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    player.setMuted(newMutedState); // Set Shaka player mute state
    setIsMuted(newMutedState);
  };
 
  return (
    <button onClick={toggleMute} aria-label="Mute/Unmute">
      <img
        src={
          isMuted
            ? "/assets/images/volumeButton.svg"
            : "<>"
        }
        alt={isMuted ? "Unmute" : "Mute"}
        width="24"
        height="24"
      />
    </button>
  );
  
};

export default VolumeButton;
