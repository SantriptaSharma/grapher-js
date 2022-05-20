<script lang="ts">
	import DisplayCanvas from "./components/DisplayCanvas.svelte";
	import GridCanvas from "./components/GridCanvas.svelte";

	let isSidebarOpen = false;

	let gridCanvas : GridCanvas;
</script>

<aside style:left = {isSidebarOpen ? 0 : null} on:wheel|preventDefault = {(e) => {gridCanvas.OnWheelEvent(e)}} 
	on:mousedown|preventDefault= {(e) => {gridCanvas.OnMouseDown(e)}} on:mouseup|preventDefault = {(e) => {gridCanvas.OnMouseUp(e)}} 
	on:mousemove|preventDefault = {(e) => {gridCanvas.OnMouseMove(e)}} on:contextmenu|preventDefault|stopPropagation>
	<div id = "sidebar-toggle" on:click = {() => {isSidebarOpen = !isSidebarOpen}}></div>
</aside>
<main>
	<GridCanvas bind:this = {gridCanvas} />
	<DisplayCanvas />
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

		border-radius: 0 20px 20px 0;
		background-color: #e4e4e49c;
		backdrop-filter: blur(6px);
		box-shadow: #3c3c6d4b 2px 2px 8px;
		position: absolute;
		left: -20vw;
		top: 10vh;
		transition: left 0.12s ease-in;
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