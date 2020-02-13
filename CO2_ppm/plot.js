const X = [];
const Y = [];
const Z = [];
const DIMENSION = 100;

const startYear = 1850;
const endYear = 2019;
const years = [];
const ppmList = [];
const yearMap = {};

const baseColor = 'rgb(110, 247, 234)';
const currentColor = 'rgb(249, 247, 69)';

const basePointTrace = makePointTrace(
	[], // x
	[], // y
	[], // z
	2,  // size
	baseColor, // color
	0, // width
	1, //opacity
);
const currentPointTrace = makePointTrace(
	[], // x
	[], // y
	[], // z
	2,  // size
	currentColor, // color
	0, // width
	1, //opacity
);

const baseLineTrace = makeLineTrace(
	[], // x
	[], // y
	baseColor, // color
	2, // width
	1, //opacity
);

const currentLineTrace = makeLineTrace(
	[], // x
	[], // y
	currentColor, // color
	2, // width
	1, //opacity
);

const boundsTrace = {
  type: 'scatter3d',
  mode: 'lines',
  hoverinfo: 'none',
  x: [0,   0,   0,   0, 0, 100, 100,   0, 100, 100,   0, 100, 100,   0, 100, 100],
  y: [0,   0, 100, 100, 0,   0, 100, 100, 100, 100, 100, 100,   0,   0,   0,   0],
  z: [0, 100, 100,   0, 0,   0,   0,   0,   0, 100, 100, 100, 100, 100, 100,   0],
  opacity: 0.5,
  line: {
    width: 3,
    color: '#FFF',
  }
}

function processData() {
	// Generate base line data.
	let currYear = Object.keys(CO2_PPM)[0];
	while (currYear <= startYear) {
		if (currYear in CO2_PPM) {
			baseLineTrace.x.push(currYear);
			baseLineTrace.y.push(CO2_PPM[currYear]);
		}
		currYear++;
	}

	const generatePoints = (numPoints, maxInt) => 
		Array.from(
			{length: numPoints},
			() => Math.floor(Math.random() * maxInt));

	// Generate base PPM point cloud.
	const basePPM = CO2_PPM[startYear];
	basePointTrace.x = generatePoints(basePPM, DIMENSION);
	basePointTrace.y = generatePoints(basePPM, DIMENSION);
	basePointTrace.z = generatePoints(basePPM, DIMENSION);

	// Generate rest PPM point cloud.
	const endPPM = CO2_PPM[endYear];
	X.push(...generatePoints(endPPM - basePPM, DIMENSION));
	Y.push(...generatePoints(endPPM - basePPM, DIMENSION));
	Z.push(...generatePoints(endPPM - basePPM, DIMENSION));

	// Map a given year to a year in the data.
	// This handles gaps in the data.
	let i = 0;
	currYear = startYear;
	let prevYear = startYear;
	while(currYear <= endYear) {
		years.push(currYear);
		prevYear = currYear in CO2_PPM ? currYear : prevYear;
		yearMap[currYear] = prevYear;
		ppmList[i] = CO2_PPM[prevYear];
		currYear++;
		i++;
	}
}

function makePointTrace(x, y, z, size, color, width, opacity) {
	return {
		x, y, z,
		mode: 'markers',
		hoverinfo: 'none',
		marker: {
			color,
			size,
			symbol: 'circle',
			line: {
				color,
				width,
			},
			opacity
		},
		type: 'scatter3d',
	}
}

function makeLineTrace(x, y, color, width, opacity) {
	return {
	  x,
	  y,
	  line: {
	    color,
	    width,
	    opacity,
	  },
	  mode: 'lines',
	  hoverinfo: 'all',
	}
}

function visualize() {
	const data = [
		boundsTrace,
		basePointTrace,
		currentPointTrace,
		baseLineTrace,
		currentLineTrace,
	];
	const layout = {
		paper_bgcolor: '#000',
		plot_bgcolor: '#000',
		showlegend: false,
		hovermode: true,
		margin: {
			l: 50,
			r: 50,
			b: 50,
			t: 50,
		  },
		scene: {
			xaxis: {
				title: '',
				autorange: true,
				showgrid: false,
				zeroline: false,
				showline: false,
				autotick: true,
				ticks: '',
				showticklabels: false
			},
			yaxis: {
				title: '',
				autorange: true,
				showgrid: false,
				zeroline: false,
				showline: false,
				autotick: true,
				ticks: '',
				showticklabels: false
			},
			zaxis: {
				  title: '',
				  autorange: true,
				  showgrid: false,
				  zeroline: false,
				  showline: false,
				  autotick: true,
				  ticks: '',
				  showticklabels: false
			},
			camera: {
		      eye: {
		      	x: 0.69,
		      	y: 1.68,
		      	z: 0.13
		      },
		    },
    	},
    	xaxis: {
			title: 'Year',
			color: '#FFF',
			showgrid: false,
			autorange: false,
			range: [
				1800,
				2020
			],
		},

		yaxis: {
			title: 'CO2 PPM',
			color: '#FFF',
			showgrid: false,
			autorange: false,
			range: [
				Math.floor(CO2_PPM[1800]) - 1,
				Math.ceil(CO2_PPM[endYear]) + 1,
			],
		},
	};
	const config = {responsive: true};
	Plotly.newPlot('plot', data, layout, config);
}

function debounce(callback, wait, immediate = false) {
  let timeout = null 
  
  return function() {
    const callNow = immediate && !timeout
    const next = () => callback.apply(this, arguments)
    
    clearTimeout(timeout)
    timeout = setTimeout(next, wait)

    if (callNow) {
      next()
    }
  }
}

const update = debounce((selectedYear) => {
	// Preserve rotation
	document.querySelector('#plot');
	const eye = plot.layout['scene'].camera.eye;
	

	const year = yearMap[selectedYear];

	// Update the PPM points.
	const diffPPM = Math.floor(CO2_PPM[year] - CO2_PPM[startYear]);
	currentPointTrace.x = X.slice(0, Math.max(diffPPM, 0));
	currentPointTrace.y = Y.slice(0, Math.max(diffPPM, 0));
	currentPointTrace.z = Z.slice(0, Math.max(diffPPM, 0));

	// Update the line plot.
	const yearIndex = years.indexOf(year)
	currentLineTrace.x = years.slice(0, Math.max(yearIndex, 1));
	currentLineTrace.y = ppmList.slice(0, Math.max(yearIndex, 1));
	Plotly.redraw('plot');

	document.querySelector('.year').innerText = selectedYear;
	document.querySelector('.ppm').innerText = Math.floor(CO2_PPM[year]) + ' ppm';
}, 1);

let animationId = null;
let buffer = 100;
function setAnimation(playing) {
	const slider = document.querySelector('.year-slider');
	cancelAnimationFrame(animationId);
	buffer = 0;
	if (playing) {
		const animate = () => {
			let val = slider.value;
			const min = slider.min;
			const max = slider.max;
			val++;
			if (val > max && buffer >= 0) {
				buffer--;
			} else {
				buffer = 100;
				val = val > max ? min : val;
				slider.value = val;
				slider.dispatchEvent(new Event('input', {
				    bubbles: true,
				    cancelable: true,
				}));
			}
			animationId = requestAnimationFrame(animate);
		}
		animationId = requestAnimationFrame(animate);
	}
}

function initialize() {
	const playButton = document.querySelector('.play-pause');
	playButton.addEventListener('change', (event) => {
	  setAnimation(playButton.checked);
	});

	setAnimation(playButton.checked);
	const slider = document.querySelector('.year-slider');
	slider.setAttribute('min', startYear);
	slider.setAttribute('max', endYear);
	slider.setAttribute('value', startYear);
	slider.addEventListener('input', (event) => {
	  update(event.target.value);
	});
	processData();
	visualize();
	update(startYear);
	window.addEventListener('orientationchange', () => {
		Plotly.redraw('plot');
	});
}

window.onload = initialize;