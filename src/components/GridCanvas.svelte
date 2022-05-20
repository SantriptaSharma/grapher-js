<script lang="ts">
    import { onMount } from "svelte";
    import { spring, tweened, type Spring, type Tweened } from "svelte/motion";

    import { GridView } from "../library/gridview";
    import { DrawAxisLine, ClearCanvas } from "../library/drawing";
    import { Color } from "../library/color";
    import { ClampValue } from "../library/helpers";
    import { Point } from "../library/point";

    import { viewport } from "../stores/viewport";
    import { type MouseState, mouseState } from "../stores/mouse";

    let canvasElement : HTMLCanvasElement;
    let canvasContext : CanvasRenderingContext2D;

    let localViewport : GridView;
    let springyZoom : Spring<number>;
    let zoomMovement : Tweened<Point>;
    let currentSpringTargetScale : number;

    let localMouseState : MouseState = {leftPressed: false, wasLeftPressed: false, rightPressed: false, wasRightPressed: false,  middlePressed: false, wasMiddlePressed: false, mousePos: {x: 0, y: 0}, lastMousePos: {x: 0, y: 0}};
    let lineColor : Color = new Color("#4e4e4e8c");
    let sublineColor : Color = new Color("#4e4e4e66");

    function DrawGrid()
    {
        ClearCanvas(canvasContext);

        // Vertical Lines (starting at the first whole number x unit outside the viewport)
        let curX = Math.floor(localViewport.pos.x);
        let endX = Math.ceil(localViewport.pos.x + localViewport.w);

        while(curX < endX)
        {
            let {x: xHere, y: yHere} = localViewport.UnitToPixel({x: curX, y: 0});
            
            if(xHere >= 0)
                DrawAxisLine({ctx: canvasContext, width: curX == 0 ? 3 : 1, x: xHere, color: lineColor});

            // Inner Vertical Lines
            if(1/localViewport.scale >= 80) // If there are less than 80 pixels in each unit, subdividing them is unnecessary 
            {
                let inX = curX + 0.1;
                
                while (inX < curX + 1)
                {
                    let {x: inXHere, y: inYHere} = localViewport.UnitToPixel({x: inX, y: 0});

                    if(inXHere)
                        DrawAxisLine({ctx: canvasContext, width: 0.5, x: inXHere, color: sublineColor});
                    
                    inX += 0.1;
                }
            }

            curX += 1;
        }

        // Horizontal Lines (starting at the first whole number y unit within the viewport)
        let curY = Math.floor(localViewport.pos.y);
        let endY = Math.ceil(localViewport.pos.y + localViewport.h);

        while(curY < endY)
        {
            let {x: xHere, y: yHere} = localViewport.UnitToPixel({x: 0, y: curY});
            
            DrawAxisLine({ctx: canvasContext, width: curY == 0 ? 3 : 1, y: yHere, color: lineColor});

            // Inner Horizontal Lines
            if(1/localViewport.scale >= 80) // If there are less than 80 pixels in each unit, subdividing them is unnecessary 
            {
                let inY = curY + 0.1;
                
                while (inY < curY + 1)
                {
                    let {x: inXHere, y: inYHere} = localViewport.UnitToPixel({x: 0, y: inY});

                    DrawAxisLine({ctx: canvasContext, width: 0.5, y: inYHere, color: sublineColor});                    
                    inY += 0.1;
                }
            }

            curY += 1;
        }
    }

    function UpdateCanvasSize()
    {
        localViewport.wp = canvasElement.width = window.innerWidth;
        localViewport.hp = canvasElement.height = window.innerHeight;
        localViewport.GetUnitSize();
        viewport.set(localViewport);
        DrawGrid();
    }

    const cursorTable = ["crosshair", "grabbing", "unset"]

    export function OnMouseDown(event : MouseEvent)
    {
        if(event.button === 0)
        {
            localMouseState.wasLeftPressed = localMouseState.leftPressed;
            localMouseState.leftPressed = true;
        }
        else if(event.button === 2)
        {
            localMouseState.wasRightPressed = localMouseState.rightPressed;
            localMouseState.rightPressed = true;
        }
        else
        {
            localMouseState.wasMiddlePressed = localMouseState.middlePressed;
            localMouseState.middlePressed = true;
        }

        document.body.style.cursor = cursorTable[event.button];

        mouseState.set(localMouseState);
    }

    export function OnMouseUp(event : MouseEvent)
    {
        if(event.button === 0)
        {
            localMouseState.wasLeftPressed = localMouseState.leftPressed;
            localMouseState.leftPressed = false;
        }
        else if(event.button === 2)
        {
            localMouseState.wasRightPressed = localMouseState.rightPressed;
            localMouseState.rightPressed = false;
        }
        else
        {
            localMouseState.wasMiddlePressed = localMouseState.middlePressed;
            localMouseState.middlePressed = false;
        }

        if(document.body.style.cursor === cursorTable[event.button])
            document.body.style.cursor = "unset";
        
        mouseState.set(localMouseState);
    }

    export function OnMouseMove(event : MouseEvent)
    {
        let oldPosition = localMouseState.mousePos;
        let newPosition = {x: event.x, y: event.y};

        let delta = Point.Subtract(newPosition, oldPosition);
        delta = Point.Scale(delta, localViewport.scale);

        if(localMouseState.middlePressed)
        {
            localViewport.Translate(Point.Scale(delta, -1));
            
            DrawGrid();
            
            viewport.set(localViewport)
        }

        localMouseState.lastMousePos = localMouseState.mousePos;
        localMouseState.mousePos = newPosition;

        mouseState.set(localMouseState);
    }

    export function OnWheelEvent(event : WheelEvent)
    {
        if(localMouseState.middlePressed) return;    

        let targetVal : number;
        
        let rate = 0.002;
        if($springyZoom >= 0.01)
            rate *= 2;

        if($springyZoom <= 0.005)
            rate /= 2;

        if(Math.sign(event.deltaY) === -1)
            targetVal = $springyZoom - rate;
        else
            targetVal = $springyZoom + rate;

        targetVal = ClampValue(targetVal, 0.001, 0.015)
        
        let centerPos = {x: localViewport.pos.x + localViewport.w/2, y: localViewport.pos.y + localViewport.h/2};
        let targetPos = centerPos;
        let mouseInUnits = localViewport.PixelToUnit(localMouseState.mousePos);
        let distanceFromCenter = Point.Distance(centerPos, mouseInUnits);
        let targetDirection = Point.Scale(Point.Subtract(mouseInUnits, centerPos), 1/distanceFromCenter);
        let distanceToMove = Math.min(distanceFromCenter, localViewport.scale * 100) * event.deltaY > 0 ? -0.3 : 0.5;

        targetPos = Point.Add(targetPos, Point.Scale(targetDirection, distanceToMove));

        zoomMovement.set(targetPos);
        springyZoom.set(targetVal);
        currentSpringTargetScale = targetVal;
    }

    onMount(() =>{
        canvasContext = canvasElement.getContext("2d");

        localViewport = new GridView(canvasContext.canvas.width, canvasContext.canvas.height)
        UpdateCanvasSize();
        localViewport.Translate(Point.Scale({x: localViewport.w, y: localViewport.h}, -1/2));
        viewport.set(localViewport);
        DrawGrid();
        
        springyZoom = spring(localViewport.scale, {stiffness: 0.4, damping: 0.8, precision: 0.000005});
        currentSpringTargetScale = localViewport.scale;
        zoomMovement = tweened(localViewport.pos, { duration: 50});

        window.addEventListener("resize", () => {
            UpdateCanvasSize();
        });

        function zoomAnimatorCallback(time : number)
        {
            if(localViewport.scale != currentSpringTargetScale)
            {
                localViewport.scale = $springyZoom;
                localViewport.GetUnitSize();

                let target = Point.Subtract($zoomMovement, {x: localViewport.w/2, y: localViewport.h/2})
                let deltaPosition = Point.Subtract(target, localViewport.pos);      
                localViewport.Translate(deltaPosition);

                viewport.set(localViewport);
                DrawGrid();
            }

            requestAnimationFrame(zoomAnimatorCallback);
        }

        requestAnimationFrame(zoomAnimatorCallback);
    });
</script>

<canvas bind:this = {canvasElement} on:wheel|preventDefault = {OnWheelEvent}
on:mousedown|preventDefault = {OnMouseDown} on:mouseup|preventDefault = {OnMouseUp} on:mousemove|preventDefault = {OnMouseMove} 
on:contextmenu|preventDefault|stopPropagation />

<style>
    canvas
    {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
    }   
</style>