/*
    Code for making simple visualizations of tidal streams
*/
function StreamSimulation(context, potential, pixelScale, dt) {
    this.context = context;
    this.potential = potential;
    this.pixelScale = pixelScale;
    this.dt = dt;
    this.interval = undefined;

    // clusters of stars
    this.clusters = new Array();

    this.integrator = new LeapfrogIntegrator(this.potential);

    this.update = function() {
        /*
            Update all of the positions of the stars in each cluster.
        */
        var star_ws, new_star_ws;
        for (var i=0; i < this.clusters.length; i++) {
            star_ws = this.clusters[i].star_ws;
            this.clusters[i].star_ws = this.integrator.step(0., star_ws, this.dt);
        }
    }

    this.draw = function() {
        /*
            Draw all of the stars in each cluster.
        */
        for (var ii=0; ii < this.clusters.length; ii++) {
            this.clusters[ii].draw(this.context, this.pixelScale);
        }
    }

    this.clear = function() {
        this.clusters = new Array();
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
    this.star_ws = new Array();
    this.sfr = 0;

    this.add_star = function() {
        var star_x = gaussian(this.position[0], r_scale),
            star_y = gaussian(this.position[1], r_scale);

        var star_vx = gaussian(this.velocity[0], v_scale),
            star_vy = gaussian(this.velocity[1], v_scale);

        this.star_ws.push([star_x, star_y, star_vx, star_vy]);
    }

    this.draw = function(context, pixel_scale) {
        /* Draw all stars to the given context */

        context.globalAlpha = this.alpha;
        for (var ii=0; ii < this.star_ws.length; ii++) {
            var x = this.star_ws[ii][0]*pixel_scale,
                y = this.star_ws[ii][1]*pixel_scale;

            context.beginPath();
            context.fillStyle = this.color;
            //context.fillRect(x,y,pixel_scale,pixel_scale);
            context.arc(x, y, 1, 0, Math.PI*2,true);
            context.closePath();
            context.fill();
        }
        context.restore()
    }

    for (var ii=0; ii < N; ii++) {
        this.add_star();
    }
}

// Can't go inside simulation object
function streamDrawUpdate() {
    canvas = streamSimulation.context.canvas;
    streamSimulation.context.clearRect(0, 0, canvas.width, canvas.height);
    streamSimulation.draw();
    streamSimulation.update();
}