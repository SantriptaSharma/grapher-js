<script lang="ts">
    import DisplayCanvas from "../DisplayCanvas.svelte";

    import type { Snapshot } from "../../stores/snapshot";
    import { simulation_inputs } from "../../stores/simulation_inputs";

    import SimulationContext from "../../library/simulation";
    import { onMount } from "svelte";

    export let display : DisplayCanvas;

    let context : SimulationContext;

    let stopFunction = null;
    let snapshot : Snapshot = null;

    onMount(() => {
        context = new SimulationContext($simulation_inputs.density, $simulation_inputs.spring, $simulation_inputs.grav, $simulation_inputs.steps);
    });

    export function InvalidateOnClear()
    {
        if(stopFunction !== null)
        {
            stopFunction();
            stopFunction = null;
            snapshot = null;
            display.SetDrawable(true);
        }
    }

    function ContextChanged()
    {
        if(stopFunction !== null && snapshot != null)
        {
            stopFunction();
            display.Load(snapshot);
            stopFunction = null;
            snapshot = null;
            display.SetDrawable(true);
        }

        context = new SimulationContext($simulation_inputs.density, $simulation_inputs.spring, $simulation_inputs.grav, $simulation_inputs.steps);
    }

    function TogglePlayState()
    {
        if(stopFunction == null)
        {
            snapshot = display.Save("simu", false);
            display.SetDrawable(false);
            stopFunction = context.Start(display.SetPositions, display.Get());
        }
        else
        {
            stopFunction();
            display.Load(snapshot);
            stopFunction = null;
            snapshot = null;
            display.SetDrawable(true);
        }
    }
</script>

<div id = "settings">
    <div>Radial Density: <input bind:value = {$simulation_inputs.density} on:change = {ContextChanged} type = "number" min = {0.05} max = {50} step = {0.1} /></div>
    <div>Spring Constant: <input bind:value = {$simulation_inputs.spring} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {0} max = {2} step = {0.1} /> {$simulation_inputs.spring}</div>
    <div>Gravity Scale: <input bind:value = {$simulation_inputs.grav} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {0} max = {2} step = {0.1} /> {$simulation_inputs.grav}</div>
    <div>Steps per Second: <input bind:value = {$simulation_inputs.steps} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {1} max = {120} step = {1} /> {$simulation_inputs.steps}</div>
</div>
<div id = "controls">
    <button on:click = {TogglePlayState}>{stopFunction == null ? "Start" : "Stop"}</button>
</div>

<style>
    input
    {
        position: relative;
        top: 5px;
    }

    input[type = "range"]
    {
        padding: 0;
    }

    #settings>div
    {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
</style>