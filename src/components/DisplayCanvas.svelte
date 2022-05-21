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

    let graphVertices : GraphVertex[] = [new GraphVertex({id: 0, pos: {x: -1, y: 3}, radius: 1, color: Color.RandomColor()}), new GraphVertex({id: 1, pos: {x: 3, y: -2}, radius: 0.3, color: Color.RandomColor()})];
    let graphEdges : GraphEdge[] = [new GraphEdge(graphVertices[0], graphVertices[1])];

    function DrawCanvas()
    {
        ClearCanvas(canvasContext);
        
        let viewBox : BBox = $viewport.ToBox();

        graphEdges.forEach((edge) => {
            if(edge.box.Intersects(viewBox))
            {
                let screenPosA = $viewport.UnitToPixel(edge.a.pos);
                let screenPosB = $viewport.UnitToPixel(edge.b.pos);
                console.log(screenPosA,screenPosB);
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

    onMount(() => {
        canvasContext = canvasElement.getContext("2d");

        mouseState.subscribe((val : MouseState) => {

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