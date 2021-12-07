import message from './module';

console.log('Hello world');

const el = document.createElement('h1');

el.innerText = message;

document.body.appendChild(el);

import lanes from './road-lanes.png';

const img = document.createElement('img');
img.src = lanes
document.body.appendChild(img);

console.log(lanes);