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

var streamSimulation;
function make_stream(canvas) {
    // Display parameters
    var pixScale = 2.5,
        alpha = 0.2,
        dt = 1.,
        context = canvas.getContext('2d'),
        interval;

    // Galaxy parameters
    var nGalaxies = 4,
        nStarsPerGalaxy = 250,
        rScale = 0.025,
        vScale = 0.025,
        g, x, y, vx, vy;

    // has to go after context definition!?!
    canvas.width = $(".canvas-container").width();
    canvas.height = $(".canvas-container").height();

    // put the origin at the center of the canvas
    var x0 = canvas.width / 2. / pixScale,
        y0 = canvas.height / 2. / pixScale;

    // define the potential
    var potential = new AxisymLogPotential([x0, y0], vc=1., q=0.8, rc=0.);

    // create the simulation
    streamSimulation = new StreamSimulation(context, potential, pixScale, dt);

    // make galaxies
    var colors = ["#eeeeee", "#f4a582", "#92c5de", "#a6d96a"];
    // TODO: choose orbits based on energy and Lz?
    for (var i=0; i < nGalaxies; i++) {
        x = 2*Math.random() - 1.;
        y = 2*Math.random() - 1.;
        vx = (2*Math.random() - 1.)/2.;
        vy = (2*Math.random() - 1.)/2.;

        g = new GaussianGalaxy([x0+50*x,y0+50*y], [vx, vy], rScale, vScale,
                                nStarsPerGalaxy, colors[parseInt(i%colors.length)],
                                alpha);
        streamSimulation.clusters.push(g);
    }

    context.globalAlpha = alpha;
    streamSimulation.draw();

    $("#startStream").click(function() {
        interval = setInterval(streamDrawUpdate, 5);
    });
    $("#stopStream").click(function() {
        clearInterval(interval);
    });
}