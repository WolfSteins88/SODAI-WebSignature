// Click events also cover synthesized touch activation. Do not add a dblclick
// handler: the second click owns the double action and cancels the first timer.
export function createLogoGesture(single: () => void, double: () => void, clock = {
  set: (callback: () => void, delay: number) => setTimeout(callback, delay),
  clear: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {if(timer !== undefined) clock.clear(timer);timer = undefined;}
  return {cancel, click() {
    if(timer !== undefined) {cancel();double();return;}
    timer = clock.set(() => {timer = undefined;single();},300);
  }};
}
