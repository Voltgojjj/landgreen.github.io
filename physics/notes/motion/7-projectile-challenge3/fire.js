challenge();

function challenge(){
//set up canvas
var canvasID = "canvas"
var canvas = document.getElementById(canvasID);
var ctx = canvas.getContext("2d");

// module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();


var scale = 1;

 var settings = {
  ballRadius: 6,
  x: 0,
  y: 0,
  Vx: (17+Math.round(Math.random()*30)),
  Vy: (14+Math.round(Math.random()*90)),
  distance: 300,//200 + Math.round(Math.random()*400)
  height: Math.round(50+ Math.random()*canvas.height*0.5),
}
//write the random values to html
document.getElementById("height").innerHTML = (settings.height/scale).toFixed(1);
document.getElementById("Vx").innerHTML = (settings.Vx).toFixed(1);
document.getElementById("Vy").innerHTML = (settings.Vy).toFixed(1);

//dat GUI setup
var gui = new dat.GUI();
//gui.close();

settings.fire = function() {
  spawnMass(settings.x, settings.y, settings.Vx, settings.Vy, settings.ballRadius);
};
gui.add(settings, 'fire');
//remove all non-static bodies
settings.clear = function() {
  World.clear(engine.world, true);
  mass = [];
};
gui.add(settings, 'clear');
//gui.add(settings, 'Vx', 0, 200).step(1);
var controller = gui.add(settings, 'distance', 0, canvas.width).step(1);
controller.onChange(function(value) {
  Matter.Body.setPosition(wall, {
    x: settings.distance,
    y: canvas.height
  });
});

//setup ball
var mass = [];
//fire at the start
settings.fire();
function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
  //spawn mass
    var i = mass.length
    mass.push();
    //Bodies.polygon(x, y, sides, radius, [options])
    mass[i] = Bodies.polygon(xIn * scale, canvas.height - (yIn+radius)*scale, Math.ceil(2+Math.random()*6)  ,radius * scale, {
      friction: 0.6,
      frictionStatic: 0.1,
      frictionAir: 0,
      restitution: 0.5,
    });

    Matter.Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    Matter.Body.setAngularVelocity(mass[i], (Math.random()-0.5)*0.07);
    World.add(engine.world, mass[i]);
  }

//build walls
var wall = Bodies.rectangle(settings.distance, canvas.height, 20, settings.height*2, {
  isStatic: true,
});
World.add(engine.world, wall);


//add walls flush with the edges of the canvas
var offset = 25;
World.add(engine.world, [
  // Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // }),
  Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, { //bottom
    isStatic: true,
    friction: 1,
    frictionStatic: 1,
  }),
  // Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //right
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // }),
  //  Bodies.rectangle(-offset-1, canvas.height*0.5, 50, canvas.height * 2 + 2 * offset, {  //left
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // })
]);

// run the engine
Engine.run(engine);

//adjust gravity to fit simulation
engine.world.gravity.scale = 0.000001 * scale;
engine.world.gravity.y = 9.8;

//render
(function render() {
  var bodies = Composite.allBodies(engine.world);
  window.requestAnimationFrame(render);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
  }
  ctx.fillStyle = '#0cc';
  ctx.fill();
  //ctx.lineWidth = 1;
  //ctx.strokeStyle = '#000000';
  //ctx.stroke();

  //draw angle indicator
  // ctx.beginPath();
  // for (var k = 0, length = mass.length; k<length; k++){
  //   ctx.moveTo(mass[k].position.x,mass[k].position.y);
  //   ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
  // }
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = '#555';
  // ctx.stroke();

})();
}
