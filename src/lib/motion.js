/** Motion Studio: shareable creative controls with safe fallbacks for older links. */
export const MOTION_PRESETS = [
  {id:'serene', label:'Serene', detail:'Slow, editorial glow', icon:'◌'},
  {id:'cinematic', label:'Cinematic', detail:'Depth, shimmer & stardust', icon:'✦'},
  {id:'celebrate', label:'Celebrate', detail:'Confetti, bold joyful energy', icon:'✳'}
];
export const GIFT_SEALS = [
  {id:'star', label:'Starlit', icon:'✦'},
  {id:'heart', label:'Love', icon:'♥'},
  {id:'flower', label:'Bloom', icon:'✿'},
  {id:'moon', label:'Moon', icon:'☾'}
];
export const safeMotion = (id) => MOTION_PRESETS.some(x => x.id===id) ? id : 'cinematic';
export const safeSeal = (id) => GIFT_SEALS.some(x => x.id===id) ? id : 'star';
export const sealSymbol = (id) => GIFT_SEALS.find(x=>x.id===id)?.icon || '✦';
