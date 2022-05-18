import { Color } from "./color"

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