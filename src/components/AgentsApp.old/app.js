/* eslint-disable */
// import planck from 'planck-js/dist/planck-with-testbed.js'
// import World from './World'
// import Food from './Food'
// import Agent from './Agent'
// import Generation from '@/NeuroEvolution/Generation'
import Matter from 'matter-js'
import World from './World';

// console.log('window.createCanvas: ', createCanvas)

export default function () {
  // window.createCanvas = createCanvas
  init()
}


function init () {
  // setup()

  const world = new World();

  // create two boxes and a ground
  // var boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
  // var boxB = Matter.Bodies.rectangle(450, 50, 80, 80);

  var boxA = Matter.Bodies.rectangle(400, 200, 8, 8);
  var boxB = Matter.Bodies.rectangle(450, 50, 8, 8);

  // add all of the bodies to the world
  Matter.World.add(world.engine.world, [boxA, boxB]);


  // const worldWidth = world.width
  // const worldHeight = world.height

  // const agentWidth = Agent.prototype.width
  // const agentHeight = Agent.prototype.height

  // for (let i = 0; i < AGENTS_NUMBER; i++) {
  //   const agent = new Agent({
  //     id: i,
  //     world,
  //     // position: {
  //     //   x: pl.Math.random(-worldWidth + agentWidth, worldWidth - agentWidth),
  //     //   y: pl.Math.random(-worldHeight + agentHeight, worldHeight - agentHeight),
  //     // },
  //     angle: _toRadians(pl.Math.random(0, 360)),
  //     // angle: _toRadians(180),
  //     // angle: 0,
  //     position: {
  //       x: 0,
  //       y: 0,
  //     }
  //   })

  //   // const food = agent.getNearFood()
  //   // console.log('food: ', food)

  //   generation.addSpecies(agent);
  // }
}



// // module aliases
// var Engine = Matter.Engine,
//     Render = Matter.Render,
//     World = Matter.World,
//     Bodies = Matter.Bodies,
//     Composite = Matter.Composite;

// // create an engine
// var engine = Engine.create();

// // create a renderer
// var render = Render.create({
//   element: document.body,
//   engine: engine,
//   options: {
//     width: 800,
//     height: 600,
//     pixelRatio: 1,
//     background: '#fafafa',
//     wireframeBackground: '#222',
//     hasBounds: false,
//     enabled: true,
//     wireframes: true,
//     showSleeping: true,
//     showDebug: false,
//     showBroadphase: false,
//     showBounds: false,
//     showVelocity: false,
//     showCollisions: false,
//     showSeparations: false,
//     showAxes: false,
//     showPositions: false,
//     showAngleIndicator: false,
//     showIds: false,
//     showShadows: false,
//     showVertexNumbers: false,
//     showConvexHulls: false,
//     showInternalEdges: false,
//     showMousePosition: false
// }
// });

// // create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(450, 50, 80, 80);

// // add all of the bodies to the world
// World.add(engine.world, [boxA, boxB]);


// World.add(engine.world, [
//   // walls
//   Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
//   Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
//   Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
//   Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
// ]);

// // run the engine
// Engine.run(engine);

// // run the renderer
// Render.run(render);


// var canvas = document.createElement('canvas'),
//     context = canvas.getContext('2d');

// canvas.width = 800;
// canvas.height = 600;

// document.body.appendChild(canvas);

// (function render() {
//   var bodies = Composite.allBodies(engine.world);

//   window.requestAnimationFrame(render);

//   context.fillStyle = '#fff';
//   context.fillRect(0, 0, canvas.width, canvas.height);

//   context.beginPath();

//   for (var i = 0; i < bodies.length; i += 1) {
//     var vertices = bodies[i].vertices;

//     context.moveTo(vertices[0].x, vertices[0].y);

//     for (var j = 1; j < vertices.length; j += 1) {
//       context.lineTo(vertices[j].x, vertices[j].y);
//     }

//     context.lineTo(vertices[0].x, vertices[0].y);
//   }

//   context.lineWidth = 1;
//   context.strokeStyle = '#999';
//   context.stroke();
// })();
