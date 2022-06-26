
export function playSound(context, buffer, time, volume, loop = false) {              
    var source = context.createBufferSource();   // creates a sound source
    source.buffer = buffer;                     // tell the source which sound to play
    //source.connect(context.destination);          // connect the source to the context's destination (the speakers)
    var gainNode = context.createGain();          // Create a gain node
    source.connect(gainNode);                     // Connect the source to the gain node
    gainNode.connect(context.destination);        // Connect the gain node to the destination
    gainNode.gain.value = volume;                  // Set the volume
    source.loop = loop;
    source.start(time);                           // play the source at the deisred time 0=now
    
    console.log("CNT:", context, "BUFFER:", buffer);
    return source;
  }
  