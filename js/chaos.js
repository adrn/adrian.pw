function leapfrog_step(potential, x, y, vx, vy, dt) {
    var ai = potential.acceleration_at(x, y);

    var new_x = x + vx*dt + 0.5*ai[0]*dt*dt,
        new_y = y + vy*dt + 0.5*ai[1]*dt*dt;

    var new_ai = potential.acceleration_at(new_x, new_y);

    var new_vx = vx + 0.5*(ai[0] + new_ai[0])*dt,
        new_vy = vy + 0.5*(ai[1] + new_ai[1])*dt;

    return [new_x, new_y, new_vx, new_vy];
}

function HenonHeilesPotential(x0, y0) {
    this.x0 = x0;
    this.y0 = y0;

    this.acceleration_at = function(xx, yy) {

        var x = xx-this.x0,
            y = yy-this.y0;

        var xdotdot = -2*x*y - x,
            ydotdot = -x*x + y*y - y;

        return [xdotdot, ydotdot];
    }
}

function ChaosOrbit(canvas, potential, pixel_scale) {
    /* pixel_scale = pix/kpc */
    this.canvas = canvas;
    this.origin = [this.canvas.width / 2., this.canvas.height / 2.];
    this.pixel_scale = pixel_scale;
    this.potential = potential;
    this.cross_color = "#31a354";
    this.orbits = new Array();

    this.update = function(dt) {
        if (dt == undefined) {
            dt = 1.
        }

        for (var ii=0; ii < this.orbits.length; ii++) {
            this.orbits[ii].update(this.potential, dt);
        }
    }

    this.draw = function(context) {
        // Add a point at the origin
        // context.lineWidth = 2;
        // context.beginPath();
        // context.moveTo(this.origin[0], this.origin[1]-5.*this.pixel_scale);
        // context.lineTo(this.origin[0], this.origin[1]+5.*this.pixel_scale);
        // context.moveTo(this.origin[0]-5.*this.pixel_scale, this.origin[1]);
        // context.lineTo(this.origin[0]+5.*this.pixel_scale, this.origin[1]);
        // context.strokeStyle = this.cross_color;
        // context.stroke();

        for (var ii=0; ii < this.orbits.length; ii++) {
            this.orbits[ii].draw(context, this.pixel_scale);
        }
    }
}

function Orbit(initial_position, initial_velocity, color, alpha) {
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

    this.position = initial_position;
    this.velocity = initial_velocity;

    this.draw = function(context, pixel_scale) {
        /* Draw all stars to the given context */

        context.globalAlpha = this.alpha;
        var x = this.position[0]*pixel_scale,
            y = this.position[1]*pixel_scale;

        context.beginPath();
        context.fillStyle = this.color;
        //context.fillRect(x,y,pixel_scale,pixel_scale);
        context.arc(x, y, 1, 0, Math.PI*2,true);
        context.closePath();
        context.fill();
        context.restore()
    }

    this.update = function(potential, dt) {
        var new_pos_vel = leapfrog_step(potential, this.position[0], this.position[1],
                                        this.velocity[0], this.velocity[1], dt);

        this.position = [new_pos_vel[0], new_pos_vel[1]];
        this.velocity = [new_pos_vel[2], new_pos_vel[3]];
    }
}

function wipe_context(context) {
    /* Clear a canvas context. */
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function draw_chaos(context, dt) {
    /* Draw the current positions of the stars, then update the positions
        by the specified dt.
    */
    //wipe_context(chaosContext);
    orbitSimulation.draw(context);
    orbitSimulation.update(dt);
}

var chaosInterval;
function startChaos(context, dt) {
    /* Start the simulation. */
    stopChaos();
    chaosInterval = setInterval(function() { draw_chaos(context, dt); }, 1);
}

function stopChaos() {
    /* Stop the simulation. */
    window.clearInterval(chaosInterval);
}