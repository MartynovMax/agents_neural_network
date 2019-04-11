/* eslint-disable */
import Generation from '@/NeuroEvolution/Generation'
import NeuralNetwork from '@/NeuroEvolution/NeuralNetwork'
import World from './World';
import Agent from './Agent';
import Food from './Food';


// const AGENTS_NUMBER = 10;
// const FOODS_NUMBER = 30;

// const AGENTS_NUMBER = 5;
// const FOODS_NUMBER = 20;

const AGENTS_NUMBER = 5;
const FOODS_NUMBER = 100;

// in sec
const generationPeriod = 20;
let generation = new Generation(AGENTS_NUMBER);
let settled = false;



export default function () {
  init()
}


function init () {
  const world = new World();

  const worldWidth = world.width
  const worldHeight = world.height

  const PADDING = 60

  for (let i = 0; i < FOODS_NUMBER; i++) {
    new Food({
      world,
      position: {
        x: _randomInteger(PADDING, worldWidth - PADDING),
        y: _randomInteger(PADDING, worldHeight - PADDING),
      },
      // position: {
      //   x: worldWidth/2,
      //   y: worldHeight/2,
      // },
      // position: {
      //   x: worldWidth/2 + 20,
      //   y: worldHeight/2 - 20,
      // }
    })
  }

  // const brain = new NeuralNetwork(3, 100, 2)

  for (let i = 0; i < AGENTS_NUMBER; i++) {
    const agent = new Agent({
      world,
      // brain,
      position: {
        x: _randomInteger(PADDING, worldWidth - PADDING),
        y: _randomInteger(PADDING, worldHeight - PADDING),
      },
      // position: {
      //   x: worldWidth/2,
      //   y: worldHeight/2,
      // },
      angle: _toRadians(_randomInteger(0, 360)),
      // angle: _toRadians(180),
      // angle: 0,
    })

    generation.addSpecies(agent);
  }


  startLoop(world);
}




function startLoop (world) {
  function loop () {
    const step = 0.2

    // generation.species.forEach((creature, index) => {
    //   let txt = '';
    //   if (creature.parents.length !== 0)
    //     txt = `${creature.id} \t\t\t ${creature.parents[0].id} (${creature.parents[0].score.toFixed(0)}) \t\t\t ${creature.parents[1].id}(${creature.parents[1].score.toFixed(0)})`;
    //   else
    //     txt = `${creature.id} \t\t\t ------ \t\t\t ------`

    //   console.log(txt);
    // })


    for (let agent of generation.species) {
      // agent.applyAngularForce(_randomFloat(-step * 0.5, step * 0.5))
      // agent.applyForce(step / 100)
      agent.update()
    }

    window.requestAnimationFrame(loop)
  }


  window.requestAnimationFrame(loop)



  // Restart Generation after 5 seconds
	// setInterval(() => {
	// 	generation.evolve()
	// 	settled = false
	// }, generationPeriod * 1000)
}
