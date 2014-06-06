// var kms_to_kpcmyr = 0.0010227121650537077;

function gaussian(mean, std) {
  if (mean === undefined || std === undefined) {
    throw "Gaussian random needs 2 arguments (mean, standard deviation)";
  }
  return randByBoxMullerTransform() * std + mean;
}

// Box Muller
var useVal1 = true;
function randByBoxMullerTransform() {
  var alpha = Math.random(),
      beta = Math.random(),
      ret;

  if (useVal1 = !useVal1) {
    ret = Math.sqrt(-2 * Math.log(alpha)) * Math.sin(2 * Math.PI * beta);
  } else {
    ret = Math.sqrt(-2 * Math.log(alpha)) * Math.cos(2 * Math.PI * beta);
  }
  return ret;
}

function leapfrog_step(potential, x, y, vx, vy, dt) {
    var ai = potential.acceleration_at(x, y);

    var new_x = x + vx*dt + 0.5*ai[0]*dt*dt,
        new_y = y + vy*dt + 0.5*ai[1]*dt*dt;

    var new_ai = potential.acceleration_at(new_x, new_y);

    var new_vx = vx + 0.5*(ai[0] + new_ai[0])*dt,
        new_vy = vy + 0.5*(ai[1] + new_ai[1])*dt;

    return [new_x, new_y, new_vx, new_vy];
}

function LogarithmicPotential(x0, y0, qz, vc) {
    this.qz = qz;
    this.vc = vc;

    this.x0 = x0;
    this.y0 = y0;

    this.acceleration_at = function(xx, yy) {

        var x = xx-this.x0,
            y = yy-this.y0;

        fac = this.vc*this.vc / (x*x + y*y/(this.qz*this.qz));

        var xdotdot = fac * x,
            ydotdot = fac * y / (this.qz*this.qz);

        return [-xdotdot, -ydotdot];
    }
}

function StreamSimulation(canvas, potential, pixel_scale) {
    /* pixel_scale = pix/kpc */
    this.canvas = canvas;
    this.galaxies = new Array();
    this.origin = [this.canvas.width / 2., this.canvas.height / 2.];
    this.pixel_scale = pixel_scale;
    this.potential = potential;
    this.cross_color = "#31a354";

    this.update = function(dt) {
        if (dt == undefined) {
            dt = 1.
        }

        for (var ii=0; ii < this.galaxies.length; ii++) {
            this.galaxies[ii].update(this.potential, dt);
        }

    }

    this.draw = function(context) {
        // Add a point at the origin
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.origin[0], this.origin[1]-5.*this.pixel_scale);
        context.lineTo(this.origin[0], this.origin[1]+5.*this.pixel_scale);
        context.moveTo(this.origin[0]-5.*this.pixel_scale, this.origin[1]);
        context.lineTo(this.origin[0]+5.*this.pixel_scale, this.origin[1]);
        context.strokeStyle = this.cross_color;
        context.stroke();

        for (var ii=0; ii < this.galaxies.length; ii++) {
            this.galaxies[ii].draw(context, this.pixel_scale);
        }
    }

    this.clear = function() {
        this.galaxies = new Array();
    }
}

function GaussianGalaxy(position, velocity, r_scale, v_scale, N, color, alpha) {
    if ((position == undefined) || (velocity == undefined)) {
        throw new Error("A galaxy must be created with a position and velocity");
    }

    if (color == undefined) {
        this.color = "#FECC5C";
    } else {
        this.color = color;
    }

    if (alpha == undefined) {
        this.alpha = 0.5;
    } else {
        this.alpha = alpha;
    }

    this.position = position;
    this.velocity = velocity;
    this.stars = new Array();
    this.sfr = 0;

    this.add_star = function() {
        var star_x = gaussian(this.position[0], r_scale),
            star_y = gaussian(this.position[1], r_scale);

        var star_vx = gaussian(this.velocity[0], v_scale),
            star_vy = gaussian(this.velocity[1], v_scale);

        this.stars.push([star_x, star_y, star_vx, star_vy]);
    }

    this.draw = function(context, pixel_scale) {
        /* Draw all stars to the given context */

        context.globalAlpha = this.alpha;
        for (var ii=0; ii < this.stars.length; ii++) {
            var x = this.stars[ii][0]*pixel_scale,
                y = this.stars[ii][1]*pixel_scale;

            context.beginPath();
            context.fillStyle = this.color;
            //context.fillRect(x,y,pixel_scale,pixel_scale);
            context.arc(x, y, 1, 0, Math.PI*2,true);
            context.closePath();
            context.fill();
        }
        context.restore()
    }

    this.update = function(potential, dt) {
        if (this.sfr >= 1) {
            for (var ii=0; ii<this.sfr; ii++) {
                this.add_star();
            }
        } else if (this.sfr > 0) {
            if (Math.random() <= this.sfr) {
                this.add_star();
            }
        }

        for (var kk=0; kk < this.stars.length; kk++) {
            var star = this.stars[kk];

            var x = star[0],
                y = star[1],
                vx = star[2],
                vy = star[3];

            this.stars[kk] = leapfrog_step(potential, x, y, vx, vy, dt);
        }

        var new_pos_vel = leapfrog_step(potential, this.position[0], this.position[1],
                                        this.velocity[0], this.velocity[1], dt);

        this.position = [new_pos_vel[0], new_pos_vel[1]];
        this.velocity = [new_pos_vel[2], new_pos_vel[3]];

    }

    for (var ii=0; ii < N; ii++) {
        this.add_star();
    }
}

function wipe_context(context) {
    /* Clear a canvas context. */
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function draw_update(dt) {
    /* Draw the current positions of the stars, then update the positions
        by the specified dt.
    */
    wipe_context(context);
    simulation.draw(context);
    simulation.update(dt);
}

var interval;
function start() {
    /* Start the simulation. */
    stop();
    interval = setInterval(draw_update, Math.pow(10, 1.));
}

function stop() {
    /* Stop the simulation. */
    window.clearInterval(interval);
}