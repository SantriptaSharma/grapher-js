import { writable, type Writable } from "svelte/store";
import type { Point } from "../library/point";

export type MouseState = 
{
    leftPressed : boolean;
    rightPressed : boolean;
    middlePressed : boolean;
    mousePos : Point
}

export const mouseState : Writable<MouseState> = writable({leftPressed: false, rightPressed: false, middlePressed: false, mousePos: {x: 0, y: 0}});