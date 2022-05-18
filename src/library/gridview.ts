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
    p : Point = {x: 0, y: 0};
    w : number = 0.0;
    h : number = 0.0;

    constructor(initList : BoxObject)
    {
        Object.assign(this, initList);
    }

    Intersects(other : BBox) : boolean
    {
        const offset = Point.Subtract(other.p, this.p);

        const dx = offset.x;
        const overlapDepthX = (this.w/2 + other.w/2) - Math.abs(dx);

        const dy = offset.y;
        const overlapDepthY = (this.h/2 + other.h/2) - Math.abs(dy);
        
        return overlapDepthX > 0 && overlapDepthY > 0;
    }

    IntersectsView(view : GridView) : boolean
    {
        return this.Intersects(view.ToBox());
    }
}