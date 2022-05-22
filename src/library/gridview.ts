import { ClampValue } from "./helpers";
import { Point } from "./point";

/** A Viewport Into an Infinite 2D Plane */
export class GridView
{
    pos : Point = {x: 0, y: 0};
    boundary : number = 15;
    w : number = 0.0;
    h : number = 0.0;
    
    /** The width of the viewport in canvas pixels */
    wp : number = 1920.0;

    /** The height of the viewport in canvas pixels */
    hp : number = 1080.0;

    /** Units Per Pixel */
    scale : number = 0.005; 

    Translate(p : Point) : void
    {
        this.pos = Point.Add(this.pos, p);

        this.pos.x = ClampValue(this.pos.x, -this.boundary, this.boundary - this.w);
        this.pos.y = ClampValue(this.pos.y, -this.boundary, this.boundary - this.h);
    }

    UnitToPixel(p : Point) : Point
    {
        let unitOffset = Point.Subtract(p, this.pos);

        return Point.Scale(unitOffset, 1/this.scale);
    }

    PixelToUnit(p : Point) : Point
    {
        let asUnits = Point.Scale(p, this.scale);

        return Point.Add(this.pos, asUnits);
    }

    GetUnitSize() : void
    {
        this.w = this.scale * this.wp;
        this.h = this.scale * this.hp;
    }

    ToBox() : BBox
    {
        return new BBox({p: this.pos, w: this.w, h: this.h});
    }

    constructor(wp : number, hp : number)
    {
        this.wp = wp;
        this.hp = hp;
        this.GetUnitSize();
    }
}


type BoxObject = {
    p : Point
    w : number
    h : number
};

/** An Axis-Aligned Bounding Box */
export class BBox
{
    p : Point = Point.Zero;
    w : number = 0.0;
    h : number = 0.0;

    constructor(initList : BoxObject)
    {
        Object.assign(this, initList);
    }

    Inside(p : Point) : boolean
    {
        return (p.x >= this.p.x && p.x <= this.p.x + this.w) && (p.y >= this.p.y && p.y <= this.p.y + this.h);
    }

    Intersects(other : BBox) : boolean
    {
        return other.Inside(this.p) || other.Inside(Point.Add(this.p, {x: this.w, y: 0})) || other.Inside(Point.Add(this.p, {x: this.w, y: this.h})) || other.Inside(Point.Add(this.p, {x: 0, y: this.h})) || other.Inside(Point.Add(this.p, {x: this.w/2, y: this.h/2})) || this.Inside(other.p) || this.Inside(Point.Add(other.p, {x: other.w, y: 0})) || this.Inside(Point.Add(other.p, {x: other.w, y: other.h})) || this.Inside(Point.Add(other.p, {x: 0, y: other.h})) || this.Inside(Point.Add(other.p, {x: other.w/2, y: other.h/2})); 
    }

    Expanded(delta : number) : BBox
    {
        return new BBox({p: Point.Subtract(this.p, {x: delta/4, y: delta/4}), w: this.w + delta/2, h: this.h + delta/2});
    }
}