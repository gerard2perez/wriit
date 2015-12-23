export default function tooltip(element){
	let container = document.createElement('span');
	let triangle = document.createElement('canvas');
	let text = document.createElement('span');
	
	//element.appendChild(container);
	container.appendChild(triangle);
	container.appendChild(text);
	
	container.classList.add('tooltip');
	
	triangle.width=14;
	triangle.height=8;
	triangle=triangle.getContext('2d');
	triangle.beginPath();
	triangle.moveTo(0,8);
	triangle.lineTo(7,0);
	triangle.lineTo(14,8);
	triangle.closePath();
	
	triangle.fillStyle = '#000000';
  	triangle.fill();
	
	text.innerHTML = element.attributes.tooltip;
	element.attributes.tooltip=null;
	element.addEventListener('mouseenter',function(){
		container.style.top = element.offsetTop+element.offsetWidth+5+'px';
		container.style.left = element.offsetLeft+'px';
		document.querySelector('body').appendChild(container);
	});
	element.addEventListener('mouseleave',function(){
		document.querySelector('body').removeChild(container);
	});
}