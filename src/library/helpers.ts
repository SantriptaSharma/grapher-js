export function ClampValue(v : number, min : number, max : number) : number
{
    return Math.min(max, Math.max(min, v));
}