<script lang="ts">
    import { onMount } from "svelte";

    import { Point } from "../library/point";
    import type { BBox, GridView } from "../library/gridview";
    import { Color } from "../library/color";
    import { ClearCanvas, DebugDrawBBox, DrawCircle } from "../library/drawing";
    import { GraphVertex, type GraphEdge } from "../library/graphelement";

    import { viewport } from "../stores/viewport";
    import { mouseState, type MouseState } from "../stores/mouse";

    let canvasElement : HTMLCanvasElement;
    let canvasContext : CanvasRenderingContext2D; 

    let graphVertices : GraphVertex[] = [new GraphVertex({id: 0, pos: {x: -1, y: 3}, radius: 1, color: new Color("8cc63f88")}), new GraphVertex({id: 0, pos: {x: 3, y: -2}, radius: 0.3, color: new Color("880088")})];
    let graphEdges : GraphEdge[] = [];

    function DrawCanvas()
    {
        ClearCanvas(canvasContext);
        
        let viewBox : BBox = $viewport.ToBox();
        DebugDrawBBox(canvasContext, viewBox, $viewport);

        graphVertices.forEach((val) => {
            if(val.box.Intersects(viewBox))
            {
                let screenPos = $viewport.UnitToPixel(val.pos);
                let screenRadius = val.radius / $viewport.scale;
                DrawCircle({ctx: canvasContext, radius: screenRadius, pos: screenPos, col: val.color});
                DebugDrawBBox(canvasContext, val.box, $viewport);
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