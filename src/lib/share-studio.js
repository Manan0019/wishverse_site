/* Wishverse Share Studio — offline QR encoding & print-quality invitation. */
import {QRCode, QRErrorCorrectLevel} from './qr-vendor.js';
import {sanitizeWish,makeShareUrl} from './share.js';
import {getTheme} from '../data/themes.js';
import {greetingFor} from '../data/i18n.js';

export const PRACTICAL_QR_LIMIT = 1700;
export function getShareText(wish){
  const w=sanitizeWish(wish);
  return `${w.to}, ${w.from} made you a special ${getTheme(w.theme).name} wish. Unwrap it here:`;
}
export function shareLinks(wish) {
  const link=makeShareUrl(wish), msg=`${getShareText(wish)}\n${link}`;
  return {
    link,
    whatsapp:`https://wa.me/?text=${encodeURIComponent(msg)}`,
    telegram:`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(getShareText(wish))}`,
    email:`mailto:?subject=${encodeURIComponent('A personal Wishverse greeting for you')}&body=${encodeURIComponent(msg)}`
  };
}
export function qrForUrl(url){
  if(typeof url!=='string'||url.length>PRACTICAL_QR_LIMIT) throw new Error('This greeting link is too long for a reliable printable QR code. Shorten your message to make a QR invitation.');
  // The greeting is base64url, so the full link consists only of ASCII bytes.
  const qr=new QRCode(0,QRErrorCorrectLevel.L);qr.addData(url);qr.make();return qr;
}
export function drawQR(ctx,qr,x,y,size){
  const count=qr.getModuleCount(),quiet=4;
  const moduleSize=Math.floor(size/(count+quiet*2));
  if(moduleSize<3) throw new Error('QR canvas is too small');
  const real=moduleSize*(count+quiet*2),left=x+(size-real)/2,top=y+(size-real)/2;
  ctx.fillStyle='#fff';ctx.fillRect(x,y,size,size);
  ctx.fillStyle='#101323';
  for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))ctx.fillRect(left+(c+quiet)*moduleSize,top+(r+quiet)*moduleSize,moduleSize,moduleSize);
}
export function makeQRCanvas(url,size=600){
  const qr=qrForUrl(url);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  drawQR(canvas.getContext('2d'),qr,0,0,size);
  return canvas;
}
export async function downloadSharePoster(wish,url){
  const w=sanitizeWish(wish), theme=getTheme(w.theme),qr=qrForUrl(url);
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=2000;
  const c=canvas.getContext('2d');
  const gradient=c.createLinearGradient(0,0,1600,2000);gradient.addColorStop(0,theme.colors[0]);gradient.addColorStop(.52,theme.colors[1]);gradient.addColorStop(1,'#121020');
  c.fillStyle=gradient;c.fillRect(0,0,1600,2000);
  c.strokeStyle='#ffffff66';c.lineWidth=3;c.strokeRect(65,65,1470,1870);
  c.textAlign='center';c.fillStyle='#fff';c.font='700 32px sans-serif';c.fillText('W I S H V E R S E  ✦',800,180);
  c.fillStyle='#fff0da';c.font='italic 100px Georgia,serif';c.fillText('A wish just for you.',800,360,1380);
  c.font='700 49px sans-serif';c.fillStyle='#fff';c.fillText(w.to,800,470,1300);
  c.font='600 32px sans-serif';c.fillText(greetingFor(w.theme,w.lang),800,560,1360);
  c.fillStyle='#ffffffdb';c.font='28px sans-serif';c.fillText(`A little surprise from ${w.from}`,800,650,1320);
  const scanSize=1000,scanX=300,scanY=730;
  c.fillStyle='#fff';c.beginPath();c.roundRect(scanX-24,scanY-24,scanSize+48,scanSize+48,32);c.fill();
  drawQR(c,qr,scanX,scanY,scanSize);
  c.fillStyle='#fff';c.font='700 30px sans-serif';c.fillText('SCAN TO UNWRAP YOUR GREETING',800,1830);
  c.fillStyle='#ffffffc9';c.font='25px sans-serif';c.fillText('No app download needed · A little magic, sent with love',800,1890);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob) throw new Error('Could not export QR invitation');
  const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=`wishverse-qr-${w.theme}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000);
}
