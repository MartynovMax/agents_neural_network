/* eslint-disable */
import planck from 'planck-js/dist/planck-with-testbed.js'
import World from './World'
import Food from './Food'
import Agent from './Agent'
import Generation from '@/NeuroEvolution/Generation'

// import planck from './testbed.js'
// import Konva from 'konva'
// import planck from 'planck-js'

const pl = planck
const Vec2 = pl.Vec2

const AGENTS = []
// var AGENTS_NUMBER = 50;
// var AGENTS_NUMBER = 10;
var AGENTS_NUMBER = 1;
// var FOOD_NUMBER = 0;
var FOOD_NUMBER = 50;


// in sec
const generationPeriod = 20;
let generation = new Generation(AGENTS_NUMBER);
let settled = false;


export default function () {
  planck.testbed('Tumbler', init)
}



function startLoop () {
  // var i = 0

  function loop () {
    const step = 10


    // generation.species.forEach((creature, index) => {
    //   let txt = '';
    //   if (creature.parents.length !== 0)
    //     txt = `${creature.id} \t\t\t ${creature.parents[0].id} (${creature.parents[0].score.toFixed(0)}) \t\t\t ${creature.parents[1].id}(${creature.parents[1].score.toFixed(0)})`;
    //   else
    //     txt = `${creature.id} \t\t\t ------ \t\t\t ------`

    //   console.log(txt);
    // })


    for (let agent of generation.species) {
      // console.log('agent: ', agent)
      // const v = agent.getLinearVelocity()
      // console.log('v: ', v)
      // const data = getAgentData(agent)
      // const x = data.x + pl.Math.random(-step, step)
      // const y = data.y + pl.Math.random(-step, step)


      agent.applyAngularForce(pl.Math.random(-step/5, step/5))
      agent.applyForce(pl.Math.random(-step, step))
      const food = agent.getNearFood()
      console.log('food: ', food)

      // console.log('agent: ', agent.m_linearVelocity)

      // i++
    }

    window.requestAnimationFrame(loop)
  }

  window.requestAnimationFrame(loop)
}



function init (testbed) {
  testbed.hz = 40;

  const world = new World()

  const worldWidth = world.width
  const worldHeight = world.height

  const agentWidth = Agent.prototype.width
  const agentHeight = Agent.prototype.height

  for (let i = 0; i < AGENTS_NUMBER; i++) {
    const agent = new Agent({
      id: i,
      world,
      // position: {
      //   x: pl.Math.random(-worldWidth + agentWidth, worldWidth - agentWidth),
      //   y: pl.Math.random(-worldHeight + agentHeight, worldHeight - agentHeight),
      // },
      angle: _toRadians(pl.Math.random(0, 360)),
      position: {
        x: 0,
        y: 0,
      },
      // angle: 0
    })

    const food = agent.getNearFood()
    console.log('food: ', food)

    generation.addSpecies(agent);
  }

  for (let i = 0; i < FOOD_NUMBER; i++) {
    new Food({
      world,
      position: {
        x: pl.Math.random(-worldWidth + agentWidth, worldWidth - agentWidth),
        y: pl.Math.random(-worldHeight + agentHeight, worldHeight - agentHeight),
      },
      angle: _toRadians(pl.Math.random(0, 360))
    })
  }

  startLoop();


  // setTimeout(() => {
  //   generation.evolve();
  // }, 500)

	// Restart Generation after 5 seconds
	// setInterval(() => {
	// 	generation.evolve();
	// 	console.log(generation.avg_score);
	// 	settled = false;
	// }, generationPeriod * 1000);


  return world.$body
}
