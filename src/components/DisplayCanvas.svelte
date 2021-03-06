<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";

    import { Point } from "../library/point";
    import type { BBox, GridView } from "../library/gridview";
    import { Color } from "../library/color";
    import { ClearCanvas, DebugDrawBBox, DrawCircle, DrawLine, DrawText } from "../library/drawing";
    import { GraphEdge, GraphVertex } from "../library/graphelement";

    import { viewport } from "../stores/viewport";
    import { mouseState, type MouseState } from "../stores/mouse";
    import { snapshots, type Snapshot } from "../stores/snapshot";

    export let selectedVert : GraphVertex = null;
    export let canDraw : boolean = true;
    
    let graphVertices : GraphVertex[] = [];
    let graphEdges : GraphEdge[] = [];
    let canvasElement : HTMLCanvasElement;
    let canvasContext : CanvasRenderingContext2D; 

    let drawBuffer : Point[] = [];
    const dispatch = createEventDispatcher();

    export function IdToName(id : number) : string
    {
        id = id + 1;
        let name = []
        while(id > 0)
        {
            let char = String.fromCharCode(65 + ((id-1) % 26));
            name.push(char);
            id = Math.floor((id - 1) / 26);
        }

        let text = name.reverse().join("");
        return text;
    }

    export function NameToId(name : string) : number
    {
        name = name.toUpperCase();

        let place = 1
        let id = 0;
        for(let i = name.length - 1; i >= 0; i--)
        {
            let digit = name.charCodeAt(i) - "A".charCodeAt(0) + (i !== name.length - 1 ? 1 : 0);
            id += place * digit;
            place *= 26;
        }

        return id;
    }

    export function SetDrawable(drawable : boolean)
    {
        canDraw = drawable;
    }
    
    function DrawCanvas()
    {
        ClearCanvas(canvasContext);
        
        let viewBox : BBox = $viewport.ToBox();
        const markedColor = new Color("#8cc63f");

        graphEdges.forEach((edge) => {
            if(true)
            {
                let screenPosA = $viewport.UnitToPixel(edge.a.pos);
                let screenPosB = $viewport.UnitToPixel(edge.b.pos);
                DrawLine({ctx: canvasContext, p1: screenPosA, p2: screenPosB, color: edge.marked ? markedColor : undefined});
            }
        });

        graphVertices.forEach((vert) => {
            if(true)
            {
                let screenPos = $viewport.UnitToPixel(vert.pos);
                let screenRadius = vert.radius / $viewport.scale;
                
                let text = IdToName(vert.id);
                let textColor = Color.FromRGBA(1 - vert.color.r, 1 - vert.color.g, 1 - vert.color.b, 1.0);
                DrawCircle({ctx: canvasContext, radius: screenRadius, pos: screenPos, col: vert.color});
                DrawText(canvasContext, {x: screenPos.x, y: screenPos.y}, text, textColor, screenRadius*1.1);

                if(vert === selectedVert)
                    DebugDrawBBox(canvasContext, vert.box, $viewport);
            }
        });
    }

    function MouseDrawing(oldPosition : Point, newPosition : Point)
    {
        const drawWidthPixel = 5;
        const drawColor = Color.FromRGBA(0.1, 0.1, 0.1, 1);

        if(!canDraw)
        {
            document.body.style.cursor = "not-allowed";
            return;
        }

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
        if(!canDraw)
        {
            document.body.style.cursor = "unset";
            return;
        }
        
        // Do analysis on the drawing
        let viewBox = $viewport.ToBox();
        let visibleVertices = graphVertices.filter(val => val.box.Intersects(viewBox));

        if(drawBuffer.length === 0) return;
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
            dispatch("changed");
            drawBuffer = [];
            DrawCanvas();
            return;
        }
        else if (edgeIndex !== -1)
        {
            graphEdges.splice(edgeIndex, 1);
            dispatch("changed");
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

        if(radius < 0.12)
        {
            drawBuffer = [];
            DrawCanvas();
            return;
        }

        let nVert = new GraphVertex({id: graphVertices.length, pos: center, radius: radius, color: Color.RandomColor()});

        let hasSpace = graphVertices.every((v) => !nVert.box.Intersects(v.box));

        if(hasSpace && start === null && end === null)
        {
            graphVertices.push(nVert);
            dispatch("changed");
        }

        drawBuffer = [];
        DrawCanvas();
    }

    export function DeleteSelected()
    {
        if(selectedVert === null) return;

        let removedId = selectedVert.id;

        graphVertices.splice(removedId, 1);

        graphEdges = graphEdges.filter((val) => {
            return val.a.id !== removedId && val.b.id !== removedId;
        });

        for(let i = removedId; i < graphVertices.length; i++)
        {
            graphVertices[i].id = i;
        }

        selectedVert = null;
        dispatch("changed");

        DrawCanvas();
    }

    export function ColorSelected(col : Color)
    {
        if(selectedVert === null) return;

        selectedVert.color = col;

        DrawCanvas();
    }

    export function Set(verts? : GraphVertex[], edges? : GraphEdge[], toDispatch : boolean = true)
    {
        if(verts) graphVertices = verts;
        if(edges) graphEdges = edges;
        if(toDispatch) dispatch("changed");

        DrawCanvas();
    }

    export function SetPositions(positions : Point[])
    {
        positions.forEach((v, i) => {if(graphVertices[i] !== undefined) graphVertices[i].pos = v});

        DrawCanvas();
    }

    export function Get() : {verts: GraphVertex[], edges: GraphEdge[]}
    {
        return {verts: graphVertices, edges: graphEdges};
    }

    export function GetMatrix() : boolean[][]
    {
        let matrix : boolean[][] = new Array(graphVertices.length);

        for(let i = 0; i < matrix.length; i++)
		{
			let inner : boolean[] = new Array(graphVertices.length);
			matrix[i] = inner.fill(false);
		}

		graphEdges.every(e => {
			matrix[e.b.id][e.a.id] = matrix[e.a.id][e.b.id] = true;
			return true;
		});

        return matrix;
    }

    export function Dirty()
    {
        DrawCanvas();
    }

    export function Deselect()
    {
        selectedVert = null;
    }

    export function Clear(sendCleared : boolean = true)
    {
        Deselect();
        graphVertices = [];
        graphEdges = [];
        drawBuffer = [];
        dispatch("changed");
        if(sendCleared) dispatch("cleared");

        DrawCanvas();
    }

    export function Load(snap : Snapshot)
    {
        Clear(false);

        graphVertices = snap.verts.map(({id, pos, radius, color}) => new GraphVertex({id, pos, radius, color: Color.FromRGBA(color.r, color.g, color.b, 1.0)}));
        graphEdges = snap.edges.map(({a, b}) => new GraphEdge(graphVertices[a], graphVertices[b]));
        dispatch("changed");

        DrawCanvas();
    }

    export function Save(name : string, save : boolean = true)
    {
        if(name == null || name.trim() === "")
        {
            name = new Date().toUTCString();
        }

        let snap : Snapshot = {
            name,
            id: $snapshots.length,
            verts: graphVertices.map(({id, pos, radius, color}) => new GraphVertex({id, pos, radius, color})),
            edges: graphEdges.map(({a, b}) => ({a: a.id, b: b.id}))
        };

        if(save) snapshots.add(snap);
        return snap;
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

            if(!val.wasRightPressed && val.rightPressed)
            {
                val.wasRightPressed = true;
                let screenPos = $viewport.PixelToUnit(val.mousePos);

                let hit : boolean = false;

                graphVertices.some((val) => {
                    if(val.box.Inside(screenPos) && val !== selectedVert)
                    {
                        selectedVert = val;
                        hit = true;
                        return true;
                    }
                });

                if(!hit) Deselect();

                DrawCanvas();
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