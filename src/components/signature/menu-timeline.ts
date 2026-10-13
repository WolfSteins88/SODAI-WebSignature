import {gsap} from "gsap";
import {handleRevealTimeline} from './handle-choreography';

// One choreography shared by the handle and navigation-panel logo Home exit.
export function menuTimeline(host: HTMLElement, closedRailColor: string, reference: boolean, callbacks: gsap.TimelineVars = {}) {
  const overlay = host.querySelector<HTMLElement>(".sg-menu")!;
  const handle = host.querySelector<HTMLElement>(".sg-menu-button")!;
  return handleRevealTimeline({mask:overlay,photo:overlay.querySelector('.sg-menu-image .std-photo'),
    content:overlay.querySelector('.sg-menu-content'),
    labels:Array.from(overlay.querySelectorAll('.sg-menu-heading,.sg-menu nav>div,.sg-menu-secondary,.sg-menu-contact,.sg-menu-legal')),
    rail:host.querySelector('.sg-rail'),railFrom:closedRailColor,railTo:reference?'#a62a23':'var(--sg-red)',handle,callbacks});
}
