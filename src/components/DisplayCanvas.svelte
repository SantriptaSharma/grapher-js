<script lang="ts">
    import { onMount } from "svelte";

    import { Point } from "../library/point";
    import type { BBox, GridView } from "../library/gridview";
    import { Color } from "../library/color";
    import { ClearCanvas, DebugDrawBBox, DrawCircle, DrawLine, DrawText } from "../library/drawing";
    import { GraphEdge, GraphVertex } from "../library/graphelement";

    import { viewport } from "../stores/viewport";
    import { mouseState, type MouseState } from "../stores/mouse";

    let canvasElement : HTMLCanvasElement;
    let canvasContext : CanvasRenderingContext2D; 

    let graphVertices : GraphVertex[] = [];
    let graphEdges : GraphEdge[] = [];

    let drawBuffer : Point[] = [];

    function DrawCanvas()
    {
        ClearCanvas(canvasContext);
        
        let viewBox : BBox = $viewport.ToBox();

        graphEdges.forEach((edge) => {
            if(edge.box.Intersects(viewBox))
            {
                let screenPosA = $viewport.UnitToPixel(edge.a.pos);
                let screenPosB = $viewport.UnitToPixel(edge.b.pos);
                DrawLine({ctx: canvasContext, p1: screenPosA, p2: screenPosB});
            }
        });

        graphVertices.forEach((vert) => {
            if(vert.box.Intersects(viewBox))
            {
                let screenPos = $viewport.UnitToPixel(vert.pos);
                let screenRadius = vert.radius / $viewport.scale;
                
                let id = vert.id + 1;
                let name = []
                while(id > 0)
                {
                    let char = String.fromCharCode(65 + ((id-1) % 26));
                    name.push(char);
                    id = Math.floor((id - 1) / 26);
                }
                
                let text = name.reverse().join("");
                let textColor = Color.FromRGBA(1 - vert.color.r, 1 - vert.color.g, 1 - vert.color.b, 1.0);
                DrawCircle({ctx: canvasContext, radius: screenRadius, pos: screenPos, col: vert.color});
                DrawText(canvasContext, {x: screenPos.x, y: screenPos.y}, text, textColor, screenRadius / 1.5);
            }
        });
    }

    function MouseDrawing(oldPosition : Point, newPosition : Point)
    {
        const drawWidthPixel = 5;
        const drawColor = Color.FromRGBA(0.1, 0.1, 0.1, 1);

        if(drawBuffer.length === 0)
        {
            drawBuffer = [newPosition];
            DrawCircle({ctx: canvasContext, radius: drawWidthPixel/2, pos: newPosition, col: drawColor});
        }
        else
        {
            drawBuffer.push(newPosition);
            DrawLine({ctx: canvasContext, p1: oldPosition, p2: newPosition, width: drawWidthPixel, color: drawColor})
        }
    }

    function DoneDrawing()
    {
        // Do analysis on the drawing
        let viewBox = $viewport.ToBox();
        let visibleVertices = graphVertices.filter(val => val.box.Intersects(viewBox));

        let startPointInUnits = $viewport.PixelToUnit(drawBuffer[0]);
        let start = null;
        let endPointInUnits = $viewport.PixelToUnit(drawBuffer[drawBuffer.length - 1]);
        let end = null;

        visibleVertices.forEach((vert) => {
            if(vert.box.Inside(startPointInUnits))
                start = vert;

            if(vert.box.Inside(endPointInUnits))
                end = vert;    
        });

        let edgeIndex = graphEdges.findIndex(val => (val.a === start && val.b === end) || (val.b === start && val.a === end));

        if(start !== end && start !== null && end !== null && edgeIndex === -1)
        {
            graphEdges.push(new GraphEdge(start, end));
            drawBuffer = [];
            DrawCanvas();
            return;
        }
        else if (edgeIndex !== -1)
        {
            graphEdges.splice(edgeIndex, 1);
            drawBuffer = [];
            DrawCanvas();
            return;
        }

        let center = Point.Scale(drawBuffer.reduce((prev, cur) => Point.Add(prev, cur)), 1/drawBuffer.length);
        let circumference : number = drawBuffer.reduce<number>((prev, cur, ind, arr) => {
            if(ind === 0)
            {
                return 0;
            }
            else
            {
                return prev + Point.Distance(arr[ind-1], arr[ind]);
            }
        }, 0);
        
        circumference = circumference * $viewport.scale;
        center = $viewport.PixelToUnit(center);

        let radius = circumference / (2 * Math.PI)

        if(radius < 0.2)
        {
            drawBuffer = [];
            DrawCanvas();
            return;
        }

        let nVert = new GraphVertex({id: graphVertices.length, pos: center, radius: radius, color: Color.RandomColor()});

        let hasSpace = graphVertices.every((v) => !nVert.box.Intersects(v.box));

        if(hasSpace && start === null && end === null)
            graphVertices.push(nVert);

        drawBuffer = [];
        DrawCanvas();
    }

    onMount(() => {
        canvasContext = canvasElement.getContext("2d");

        mouseState.subscribe((val : MouseState) => {
            if(val.mousePos != val.lastMousePos && val.leftPressed)
            {
                MouseDrawing(val.lastMousePos, val.mousePos);
            }
            
            if(val.wasLeftPressed && !val.leftPressed)
            {
                let ms = val;
                ms.wasLeftPressed = false;
                mouseState.set(ms);
                DoneDrawing();
            }
        });

        viewport.subscribe((val : GridView) => {
            canvasElement.width = val.wp;
            canvasElement.height = val.hp;
            
            DrawCanvas();
        });
    });
</script>

<canvas bind:this = {canvasElement} />

<style>
    canvas
    {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        pointer-events: none;
    }
</style>