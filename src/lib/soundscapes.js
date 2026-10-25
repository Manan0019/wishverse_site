export const SOUNDSCAPES = [
  {id:'silent',label:'Quiet magic',caption:'Silence, with room to feel'},
  {id:'starlight',label:'Starlight',caption:'Soft crystal chimes'},
  {id:'warmth',label:'Golden warmth',caption:'Warm bell harmonies'},
  {id:'midnight',label:'Midnight glow',caption:'A sparkling mini fanfare'}
];

const MELODIES = {
  starlight:[[523.25,0],[659.25,.18],[783.99,.39],[1046.5,.65]],
  warmth:[[392,0],[493.88,.24],[587.33,.5],[783.99,.83]],
  midnight:[[392,0],[523.25,.15],[659.25,.3],[783.99,.45],[1046.5,.7]]
};

export function safeSoundscape(id) {return SOUNDSCAPES.some(x=>x.id===id)?id:'silent';}

export function playSoundscape(context, name) {
  const notes=MELODIES[safeSoundscape(name)];
  if (!notes || !context) return;
  const t=context.currentTime;
  for(const [freq,offset] of notes){
    const osc=context.createOscillator();
    const gain=context.createGain();
    osc.type='sine'; osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,t+offset);
    gain.gain.exponentialRampToValueAtTime(.065,t+offset+.03);
    gain.gain.exponentialRampToValueAtTime(.0001,t+offset+1.2);
    osc.connect(gain);gain.connect(context.destination);
    osc.start(t+offset);osc.stop(t+offset+1.22);
  }
}
