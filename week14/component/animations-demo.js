import { TimeLine } from "./animations";
let tl = new TimeLine();

tl.start();

tl.add(new Animation(document.querySelector('#el').style, "transform", 0, 500, 2000, 0, null, v => `translateX(${v}px)` ));
document.querySelector('#el2').style.transition = 'transform ease-in 2s';
document.querySelector('#el2').style.transform = 'translapx)';

document.querySelector("#pause-btn").addEventListener("click", () => tl.pause());
document.querySelector("#resume-btn").addEventListener("click", () => tl.resume());
