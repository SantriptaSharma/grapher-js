import { GraphEdge, GraphVertex } from "./graphelement";
import { ClampValue } from "./helpers";
import { Point } from "./point";

export default class SimulationContext
{
    radiusDensity : number;
    springConstant : number;
    gravity : number;
    stepsPerSecond : number;

    particles : Particle[];
    springs : Spring[];

    onStep : (positions : Point[]) => void = undefined;
    toStop : boolean = false;

    constructor(density : number, springConstant : number, gravity : number, rate : number)
    {
        this.radiusDensity = density;
        this.springConstant = springConstant;
        this.gravity = gravity;
        this.stepsPerSecond = rate;

        this.particles = [];
        this.springs = [];
    }

    Step(ref : SimulationContext)
    {
        if(ref.toStop)
        {
            ref.toStop = false;
            return;
        }

        ref.springs.forEach((v) => v.Step());
        ref.particles.forEach((v) => v.Step());

        if(ref.onStep !== undefined) ref.onStep(ref.particles.map((p) => p.pos));
        
        setTimeout(() => ref.Step(ref), (1/ref.stepsPerSecond) * 1000);
    }

    Start(onStep : (positions : Point[]) => void, graph : {verts: GraphVertex[], edges : GraphEdge[]}) : () => void
    {
        this.onStep = onStep;

        graph.verts.forEach((vert) => {
            this.particles.push(new Particle(this, vert.pos, vert.radius));
        });

        const getIndicesForEdge = (edge : GraphEdge) => ({a: edge.a.id, b: edge.b.id});

        graph.edges.forEach((edge) => {
            const indices = getIndicesForEdge(edge);
            this.springs.push(new Spring(this, indices.a, indices.b, Point.Distance(edge.a.pos, edge.b.pos)));
        });

        setTimeout(() => {this.Step(this)}, (1/this.stepsPerSecond) * 1000);

        return () => {
            this.toStop = true
            this.particles = [];
            this.springs = [];
            this.onStep = undefined;
        };
    }
}

class Particle
{
    context : SimulationContext;
    pos : Point;
    mass : number;
    radius : number;
    velocity : Point;

    constructor(context : SimulationContext, pos : Point, radius : number)
    {
        this.context = context;
        this.pos = pos;
        this.radius = radius;
        this.mass = context.radiusDensity * radius;
        this.velocity = Point.Zero;
    }

    AddForce(force : Point)
    {
        this.velocity = Point.Add(this.velocity, Point.Scale(Point.Scale(force, 1/this.mass), 1/this.context.stepsPerSecond));
    }

    Step()
    {
        const grav = Point.Scale(new Point({x: 0, y: 1}), this.context.gravity * this.mass);
        this.AddForce(grav)
        this.pos = Point.Add(this.pos, Point.Scale(this.velocity, 1/this.context.stepsPerSecond));

        this.pos.x = ClampValue(this.pos.x, -15 + this.radius, 15 - this.radius);
        this.pos.y = ClampValue(this.pos.y, -15 + this.radius, 15 - this.radius);
    }
}

class Spring
{
    context : SimulationContext;
    a : number;
    b : number;
    initial_length : number;

    constructor(context : SimulationContext, a : number, b : number, length : number)
    {
        this.context = context;
        this.a = a;
        this.b = b;
        this.initial_length = length;
    }

    Step()
    {
        const a = this.context.particles[this.a];
        const b = this.context.particles[this.b];
        const currentLength = Point.Distance(a.pos, b.pos);

        const displacement = Math.abs(currentLength - this.initial_length);
        if(displacement > 0.002)
        {
            const magnitude = this.context.springConstant * displacement;
            const aToB = Point.Normalise(Point.Subtract(b.pos, a.pos));
            a.AddForce(Point.Scale(aToB, magnitude));
            b.AddForce(Point.Scale(aToB, -magnitude));
        }
    }
}