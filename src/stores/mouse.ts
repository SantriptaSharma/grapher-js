import { writable, type Writable } from "svelte/store";
import type { Point } from "../library/point";

export type MouseState = 
{
    leftPressed : boolean;
    wasLeftPressed : boolean;
    rightPressed : boolean;
    wasRightPressed : boolean;
    middlePressed : boolean;
    wasMiddlePressed : boolean;
    mousePos : Point
    lastMousePos : Point;
}

export const mouseState : Writable<MouseState> = writable({leftPressed: false, wasLeftPressed: false, rightPressed: false, wasRightPressed: false,  middlePressed: false, wasMiddlePressed: false, mousePos: {x: 0, y: 0}, lastMousePos: {x: 0, y: 0}});