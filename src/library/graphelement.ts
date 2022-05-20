import { Color } from "./color";
import { BBox } from "./gridview";
import { Point } from "./point";

type VertexData = 
{
    id : number,
    pos? : Point,
    radius? : number,
    color? : Color
};

export class GraphVertex 
{
    id : number;
    pos : Point;
    radius : number;
    box : BBox;
    color : Color;

    constructor({id, pos = Point.Zero, radius = 0, color = Color.RandomColor()} : VertexData)
    {
        this.id = id;
        this.pos = pos;
        this.radius = radius;
        this.color = color;

        this.box = new BBox({p: Point.Subtract(pos, {x: radius/2, y: radius/2}), w: 2 * radius, h: 2 * radius});
    }
}

export class GraphEdge
{
    a : GraphVertex;
    b : GraphVertex;
    box : BBox;

    constructor(a : GraphVertex, b : GraphVertex)
    {
        this.a = a;
        this.b = b;

        let boxPosition : Point = {x: Math.min(a.pos.x, b.pos.x), y: Math.min(a.pos.y, b.pos.y)};
        let boxWidth : number = Math.max(a.pos.x - boxPosition.x, b.pos.x - boxPosition.x);
        let boxHeight : number = Math.max(a.pos.y - boxPosition.y, b.pos.y - boxPosition.y);

        this.box = new BBox({p: boxPosition, w: boxWidth, h: boxHeight});
    }
}