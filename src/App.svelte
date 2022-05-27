<script lang="ts">
	import DisplayCanvas from "./components/DisplayCanvas.svelte";
	import GridCanvas from "./components/GridCanvas.svelte";
	import { GraphVertex } from "./library/graphelement";
	import { Color } from "./library/color";

	import FaTrash from 'svelte-icons/fa/FaTrash.svelte';

	let isSidebarOpen = true;
	let gridCanvas : GridCanvas;
	let display : DisplayCanvas;
	let selected : GraphVertex = null;
	let colorInput : HTMLInputElement;
	let color : string = "#000000";

	function OnColorChange()
	{
		color = colorInput.value;
		let targetColor = new Color(colorInput.value);
		display.ColorSelected(targetColor);
	}

	$: if(selected !== null)
	{
		color = selected.color.ToString().slice(0, 7);
		isSidebarOpen = true;
	}
</script>

<aside style:left = {isSidebarOpen ? 0 : null} on:wheel|preventDefault = {(e) => {gridCanvas.OnWheelEvent(e)}} 
	on:mousedown|preventDefault= {(e) => {gridCanvas.OnMouseDown(e)}} on:mouseup|preventDefault = {(e) => {gridCanvas.OnMouseUp(e)}} 
	on:mousemove|preventDefault = {(e) => {gridCanvas.OnMouseMove(e)}} on:contextmenu|preventDefault|stopPropagation>
	<div id = "sidebar-toggle" on:click = {() => {isSidebarOpen = !isSidebarOpen}}></div>
	{#if selected !== null}
		<h2>Vertex {display.IdToName(selected.id)}</h2>
		<span>Recolor: <input type = "color" bind:this = {colorInput} on:change = {OnColorChange} id = "color-picker" value = {color}/></span>
		<button on:click = {() => {display.DeleteSelected();}} id = "delete-button"><FaTrash /></button>
	{:else}
		<h2>Graph Options</h2>
	{/if}
</aside>
<main>
	<GridCanvas bind:this = {gridCanvas} />
	<DisplayCanvas bind:this = {display} bind:selectedVert = {selected} />
</main>

<style>
	:global(body)
	{
		padding: 0;
		overflow: hidden;
		background-color: #e0e0e0;
	}
	
	main
	{
		width: 100vw;
		height: 100vh;
	}

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

	#delete-button
	{
		padding: 12px;
		border-radius: 8px;
		border: none;
		width: 64px;
		height: 64px;
		align-self: center;
		color: red;

		cursor: pointer;
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