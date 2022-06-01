<script type="ts">
    import { createEventDispatcher } from 'svelte';

    import GridCanvas from "./GridCanvas.svelte";
    import DisplayCanvas from "./DisplayCanvas.svelte";
	import Foldup from './ui/Foldup.svelte';
	import SnapshotDisplay from './ui/SnapshotDisplay.svelte';
    import { GraphVertex } from "../library/graphelement";
    import { Color } from "../library/color";
	import { Point } from '../library/point';
	import { ClampValue } from '../library/helpers';
    
    import FaTrash from 'svelte-icons/fa/FaTrash.svelte';
	import { snapshots, type Snapshot } from '../stores/snapshot';

	export let gridCanvas : GridCanvas;
    export let display : DisplayCanvas;
    export let selected : GraphVertex;
    let open : boolean = true;
    let colorInput : HTMLInputElement;
	let xInput : HTMLInputElement, yInput : HTMLInputElement;
	let radiusInput :HTMLInputElement;
    let color : string = "#000000";
	let radius : number = 0; 
	let position : Point = Point.Zero;
	let snapName : string = "";
	let foldups : boolean[] = [false, false, false, false];

    const helpDispatcher = createEventDispatcher();

    function OnColorChange()
	{
		if(selected === null) return;

		color = colorInput.value;
		let targetColor = new Color(colorInput.value);
		selected.color = targetColor;
		display.Dirty();
	}

	function OnPositionChange()
	{
		if(selected === null) return;

		let xAsFloat = parseFloat(xInput.value);
		let yAsFloat = parseFloat(yInput.value);

		if(xAsFloat === NaN || yAsFloat === NaN) return;

		xAsFloat = ClampValue(xAsFloat, -15, 15);
		yAsFloat = ClampValue(yAsFloat, -15, 15);

		position = {x: xAsFloat, y: yAsFloat};

		selected.pos = position;
		selected.RecalculateExtents();
		display.Dirty();
	}

	function OnRadiusChange()
	{
		if(selected === null) return;
		
		let radiusAsFloat = parseFloat(radiusInput.value);
		
		if(radiusAsFloat === NaN) return;

		radiusAsFloat = ClampValue(radiusAsFloat, 0.12, 12);
		radius = radiusAsFloat;
		selected.radius = radius;
		selected.RecalculateExtents();
		display.Dirty();
	}

	function FoldoutToggled(ev : any)
	{
		let ind = ev.detail;
		if(typeof ind !== "number") return;

		if(ind === undefined) return;
		
		foldups[ind] = !foldups[ind];
	}

    $: if(selected !== null)
	{
		color = selected.color.ToString().slice(0, 7);
		position = selected.pos;
		radius = selected.radius;
		open = true;
	}
</script>

<aside style:left = {open ? 0 : null} on:mousedown = {e => gridCanvas.OnMouseDown(e)} on:mouseup = {e => gridCanvas.OnMouseUp(e)} 
	on:mousemove = {e => gridCanvas.OnMouseMove(e)} on:contextmenu|preventDefault>
	<div id = "sidebar-toggle" on:click = {() => {open = !open}}></div>
	{#if selected !== null}
		<h2>Vertex {display.IdToName(selected.id)}</h2>
		<div id = "position">
			Position: (<input type = "number" size = 4 min = -15 max = 15 step = 0.1 value = {position.x.toPrecision(5)} bind:this = {xInput} on:change|trusted = {OnPositionChange} />, <input type = "number" size = 4 min = -15 max = 15 step = 0.1 value = {position.y.toPrecision(5)} bind:this = {yInput} on:change|trusted = {OnPositionChange} />)
		</div>
		<div id = "radius">
			Radius: <input type = "number" size = 4 min = 0.12 max = 12 step = 0.05 value = {radius.toPrecision(3)} bind:this = {radiusInput} on:change|trusted = {OnRadiusChange}/>
		</div>
		<div id = "recolor">Color:&nbsp;<input type = "color" bind:this = {colorInput} on:change = {OnColorChange} id = "color-picker" value = {color}/></div>
		<button on:click = {() => {display.DeleteSelected();}} id = "delete-button">Delete <div id = "delete-icon"><FaTrash /></div></button>
	{:else}
		<h2>Graph Options</h2>
		<div id = "scroll-view">
			<Foldup title = "Import & Export" on:toggle = {FoldoutToggled} open = {foldups[0]} index = {0}>
				WIP
			</Foldup>
			<Foldup title = "Mathematics" on:toggle = {FoldoutToggled} open = {foldups[1]} index = {1}>
				WIP
			</Foldup>
			<Foldup title = "Simulation" on:toggle = {FoldoutToggled} open = {foldups[2]} index = {2}>
				WIP
			</Foldup>
			<Foldup title = "Snapshots" on:toggle = {FoldoutToggled} open = {foldups[3]} index = {3}>
				<div id = "adder">
					<input type = "text" size = 30 placeholder = "Snap name" bind:value = {snapName} />
					<button on:click = {() => display.Save(snapName)}>Save</button>
				</div>
				{#each $snapshots as snap, i (snap.id)}
					<SnapshotDisplay name = {snap.name} index = {i} {display} />
				{/each}
			</Foldup>
		</div>
	{/if}
	<div id = "static-buttons">
		<button on:click = {() => {helpDispatcher("help")}}>Help</button>
		<button on:click = {() => {display.Clear()}}>Clear</button>
	</div>
</aside>

<style>
	aside
	{
		width: 384px;
		height: 60vh;
		z-index: 50;
		box-sizing: border-box;

		border-radius: 0 20px 20px 0;
		background-color: #e4e4e49c;
		backdrop-filter: blur(6px);
		box-shadow: #3c3c6d4b 2px 2px 8px;
		position: absolute;
		left: -384px;
		top: 10vh;
		transition: left 0.12s ease-in;

		padding: 10px 12px;
		display: flex;
		gap: 8px;
		flex-direction: column;
		align-items: flex-start;
	}

	#static-buttons *, #delete-button
	{
		padding: 8px 12px;
		border-radius: 6px;
		border: none;
		align-self: center;

		font-size: large;

		display: flex;
		flex-direction: row;
		gap: 8px;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition-duration: 0.1s;
	}

	#static-buttons *:hover
	{
		background-color: aliceblue;
	}

	#static-buttons *:active
	{
		background-color: #cfcfcf;
	}

	#recolor
	{
		display: flex;
	}

	#delete-icon
	{
		width: 24px;
		height: 24px;
		display: inline-block;
		color: red;
		overflow: hidden;
	}

	#static-buttons
	{
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: 30px;
		gap: 12px;
	}

    #color-picker
	{
		padding: 1px;
	}

	#scroll-view
	{
		width: 100%;
		height: 70%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
	}

	#sidebar-toggle
	{
		width: 40px;
		height: 40px;
		border-radius: 50%;
		
		position: absolute;
		right: 0;
		bottom: 5vh;
		transform: translate(50%, -50%);
	
		cursor: pointer;
		
		background-color: #7e7e9c;
	}
</style>