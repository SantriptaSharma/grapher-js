import { claim_text } from "svelte/internal";
import { Color } from "./color"
import type { BBox, GridView } from "./gridview";
import type { Point } from "./point";

// This would probably be better as a class that takes shared ownership of the ctx and the viewport, but oh well

export function ClearCanvas(ctx : CanvasRenderingContext2D, color? : Color) : void
{
    if(color === undefined)
    {
        color = new Color("FFFFFF00");
    }

    ctx.fillStyle = color.ToString();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

type AxisLineParams = 
{
    ctx : CanvasRenderingContext2D,
    width? : number,
    x? : number,
    y? : number,
    color? : Color
};

export function DrawAxisLine({ctx, width = 5.0, x, y, color} : AxisLineParams) : void
{
    if(color === undefined)
    {
        color = new Color("000000");
    }
    ctx.strokeStyle = color.ToString();
    ctx.lineWidth = width;

    if (x !== undefined)
    {   
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
        ctx.closePath();
    }
    else if (y !== undefined)
    {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }
}

type CircleParams = {
    ctx : CanvasRenderingContext2D,
    radius: number,
    pos : Point,
    col? : Color
}

export function DrawCircle({ctx, radius, pos, col = Color.RandomColor()} : CircleParams)
{
    ctx.fillStyle = col.ToString();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

export function DrawText(ctx : CanvasRenderingContext2D, pos : Point, text : string, color : Color, height : number)
{
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${height}px Segoe UI`
    ctx.fillStyle = color.ToString();
    ctx.fillText(text, pos.x, pos.y);
}

export function DebugDrawBBox(ctx : CanvasRenderingContext2D, bbox : BBox, viewport : GridView)
{
    let pos = viewport.UnitToPixel(bbox.p);
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#ff122388";
    ctx.strokeRect(pos.x, pos.y, bbox.w / viewport.scale, bbox.h / viewport.scale);
}

type LineParams =
{
    ctx : CanvasRenderingContext2D,
    p1 : Point,
    p2 : Point,
    width? : number,
    color? : Color
}

export function DrawLine({ctx, p1, p2, width = 8, color = Color.FromRGBA(0.2, 0.2, 0.2, 1)} : LineParams)
{
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = color.ToString();
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
}