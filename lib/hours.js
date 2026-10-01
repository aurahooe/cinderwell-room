const STOCK = [
  { title: "The kettle remembers the last person who left", dek: "On rooms that keep a temperature after we go.", body: "A kitchen holds heat the way a coat holds a shoulder. You come back an hour later and the air is still slightly occupied. Cinderwell is built on that idea: that a place can keep a trace without making a monument of it." },
  { title: "How to walk home without collecting the day", dek: "A small method for emptying the pockets of the mind.", body: "Name three things you will not bring through the door. Then name one thing you will. The well only stays clear if someone decides what goes in." },
  { title: "A map drawn from the smell of rain on brick", dek: "Cities teach themselves through weather.", body: "There is a corner in every town that smells like wet clay after a short storm. This hour asks you to keep that corner, not the postcard." },
  { title: "Letters that were never posted and still arrived", dek: "On drafts that change the sender first.", body: "Some notes are written so the hand can finish a thought the mouth refused. Marking one public is agreeing the sentence can live without you standing next to it." },
  { title: "The hour between shifts at the print shop", dek: "Ink under the nail, quiet in the press room.", body: "When the machines stop they keep a hum in the floorboards. Cinderwell borrows that interval: not the finished page, the pause that makes the next one possible." },
  { title: "What the river does with names", dek: "Currents are better archivists than plaques.", body: "Throw a name in and it comes back rounded, usable. That is the hope of a public wall. Not permanence. Wear." },
  { title: "A chair left at a slight angle", dek: "Evidence that someone meant to return.", body: "Staged rooms face the camera. Lived rooms face the last conversation. This hour faces the last conversation." },
  { title: "On keeping a modest fire", dek: "Enough heat for tea, not enough for spectacle.", body: "Cinderwell is named for the small leftover glow, not the blaze. Add a note, take one away, let the hour turn." },
  { title: "The discipline of arriving five minutes early", dek: "And sitting without filling the gap.", body: "Sit in the draft. See what the room does when you stop offering it your face." },
  { title: "When the streetlights come on mid-sentence", dek: "Evenings that interrupt you kindly.", body: "There is a particular orange that makes every window look like a short story. Finish the sentence. Then start a different one." },
  { title: "The archive of almost", dek: "Drafts, unsent, unsaid, still warm.", body: "Your desk holds the almosts. The public wall holds what you are willing to let cool in other people's hands." },
  { title: "A window that only opens from the inside", dek: "On choosing the weather you admit.", body: "Public is a latch, not a flood. You open it. You can close it." },
  { title: "The sound a library makes at four", dek: "Not silence. Occupied hush.", body: "Chairs, pages, a radiator. If this site ever feels like a launch event, something has gone wrong." },
  { title: "Night buses and other honest rooms", dek: "Where no one is performing a destination.", body: "Come for the hour. Leave when it turns." },
  { title: "Repair as a public act", dek: "Mending in view, without a speech about mending.", body: "Leave the stitch visible. People trust work that shows it has been handled." },
  { title: "After the shop bell, before the greeting", dek: "A second that belongs to no one.", body: "Use it. Notice the floor. Then say hello like a person, not a script." }
];

export function hourKey(d = new Date()) {
  const x = new Date(d);
  x.setMinutes(0, 0, 0);
  return x.toISOString();
}

export function editionFor(d = new Date()) {
  const key = hourKey(d);
  const idx = Math.floor(new Date(key).getTime() / 3600000) % STOCK.length;
  return { hour_key: key, ...STOCK[idx] };
}

export function msUntilNextHour(d = new Date()) {
  const n = new Date(d);
  n.setMinutes(60, 0, 0);
  return n.getTime() - d.getTime();
}
