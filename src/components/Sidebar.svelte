<script type="ts">
    import { createEventDispatcher } from 'svelte';

    import GridCanvas from "./GridCanvas.svelte";
    import DisplayCanvas from "./DisplayCanvas.svelte";
    import { GraphVertex } from "../library/graphelement";
    import { Color } from "../library/color";
    
    import FaTrash from 'svelte-icons/fa/FaTrash.svelte';

	export let gridCanvas : GridCanvas;
    export let display : DisplayCanvas;
    export let selected : GraphVertex;
    let open : boolean = true;
    let colorInput : HTMLInputElement;
    let color : string = "#000000";

    const helpDispatcher = createEventDispatcher();

    function OnColorChange()
	{
		color = colorInput.value;
		let targetColor = new Color(colorInput.value);
		display.ColorSelected(targetColor);
	}

    $: if(selected !== null)
	{
		color = selected.color.ToString().slice(0, 7);
		open = true;
	}
</script>

<aside style:left = {open ? 0 : null} on:mousedown|preventDefault = {e => gridCanvas.OnMouseDown(e)} on:mouseup = {e => gridCanvas.OnMouseUp(e)} 
	on:mousemove = {e => gridCanvas.OnMouseMove(e)} on:contextmenu|preventDefault>
	<div id = "sidebar-toggle" on:click = {() => {open = !open}}></div>
	{#if selected !== null}
		<h2>Vertex {display.IdToName(selected.id)}</h2>
		<div id = "recolor">Recolor: <input type = "color" bind:this = {colorInput} on:change = {OnColorChange} id = "color-picker" value = {color}/></div>
		<button on:click = {() => {display.DeleteSelected();}} id = "delete-button">Delete <div id = "delete-icon"><FaTrash /></div></button>
	{:else}
		<h2>Graph Options</h2>
	{/if}
	<button id = "help-button" on:click = {() => {helpDispatcher("help")}}>Help</button>
</aside>

<style>
    	aside
	{
		width: 20vw;
		height: 60vh;
		z-index: 50;
		box-sizing: border-box;

		border-radius: 0 20px 20px 0;
		background-color: #e4e4e49c;
		backdrop-filter: blur(6px);
		box-shadow: #3c3c6d4b 2px 2px 8px;
		position: absolute;
		left: -20vw;
		top: 10vh;
		transition: left 0.12s ease-in;

		padding: 10px 12px;
		display: flex;
		gap: 8px;
		flex-direction: column;
		align-items: flex-start;
	}

	button
	{
		padding: 12px;
		border-radius: 8px;
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

	#help-button
	{
		position: absolute;
		bottom: 30px;
		gap: 2px;
	}

    #color-picker
	{
		padding: unset;
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