type PointObject = {
    x : number,
    y : number
};

export class Point
{
    x : number
    y : number

    constructor({x, y} : PointObject)
    {
        this.x = x;
        this.y = y;
    }


    static Zero : Point = {x: 0, y: 0};

    static Add(a : Point, b : Point) : Point
    {
        return new Point({x: a.x + b.x, y: a.y + b.y});
    }

    // It doesn't really make sense to "scale" a point, but for these purposes, it's treated like a vector, and scaling multiplies the distance of the point from the origin by the scalar, without changing its direction from the origin
    static Scale(a : Point, b : number) : Point
    {
        return new Point({x: a.x * b, y: a.y * b});
    }

    static Normalise(a : Point) : Point
    {
        return Point.Scale(a, 1/Point.Distance(Point.Zero, a));
    }

    static OnUnitCircle(deg : number) : Point
    {
        let rad = deg * (Math.PI / 180)
        return new Point({x: Math.sin(rad), y: Math.cos(rad)});
    }

    static Subtract(a : Point, b : Point) : Point
    {
        return this.Add(a, this.Scale(b, -1));
    }

    static Distance(a : Point, b : Point) : number
    {
        return Math.sqrt(Math.pow((a.x-b.x), 2) + Math.pow((a.y-b.y), 2));
    }
}