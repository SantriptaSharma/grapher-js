import { GraphEdge, GraphVertex } from "./graphelement";
import { Point } from "./point";

export function ClampValue(v : number, min : number, max : number) : number
{
    return Math.min(max, Math.max(min, v));
}

export function ImportPlacer(matrix : boolean[][], sortedDegrees : {ind : number, d : number}[]) : GraphVertex[]
{
    const MAX_PER_DEPTH_INIT = 8;

    let size = matrix.length;
    let verts : GraphVertex[] = new Array(size);
    
    let currentDepth = 1;

    verts[sortedDegrees[0].ind] = new GraphVertex({id: sortedDegrees[0].ind, radius: 0.5, pos: Point.Zero})
    sortedDegrees.shift();

    while(sortedDegrees.length > 0)
    {
        let maxPerDepth = MAX_PER_DEPTH_INIT + 2 * (currentDepth-1);
        let toPlace = ClampValue(sortedDegrees.length, 1, maxPerDepth);
        let degreeGap = 360/toPlace;
        let currentAngle = currentDepth % 2 == 0 ? (180/maxPerDepth) : 0;

        for(let i = 0; i < toPlace; i++)
        {
            let thisVert = sortedDegrees.shift();
            let position = Point.Scale(Point.OnUnitCircle(currentAngle), currentDepth * 1.5);
            verts[thisVert.ind] = new GraphVertex({id: thisVert.ind, radius: 0.42, pos: position });

            currentAngle = (currentAngle + degreeGap) % 360;
        }

        currentDepth += 1;
    }

    return verts;
}