<script lang="ts">
    import DisplayCanvas from "../DisplayCanvas.svelte";

    import type { Snapshot } from "../../stores/snapshot";
    import { simulation_inputs } from "../../stores/simulation_inputs";

    import SimulationContext from "../../library/simulation";
    import { onMount, onDestroy } from "svelte";

    export let display : DisplayCanvas;

    let context : SimulationContext = null;
    let frozenChanged = false;

    let stopFunction = null;
    let snapshot : Snapshot = null;

    function ConstructContext()
    {
        let frozen : number[] = [];

        if(frozenChanged)
        {
            const frozenString = $simulation_inputs.frozen;
            frozenChanged = false;
            frozenString.split(" ").every((v) => {
                const name = v.trim();
                if(name === "") return true;

                const isAlphabet = (c) => (c.charCodeAt(0) >= 'a'.charCodeAt(0) && c.charCodeAt(0) <= 'z'.charCodeAt(0)) || (c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'Z'.charCodeAt(0));
                if(!Array.from(name).every((c) => isAlphabet(c)))
                {
                    alert("Frozen Vertices must be inputted as a space-separated list of vertex names (alphabetical)");
                    return false;
                }

                const id = display.NameToId(name);
                if(id < 0 || id >= display.Get().verts.length)
                {
                    alert(`Vertex ${name} (to be frozen) does not exist.`);
                    return true;
                }

                frozen.push(id);
                return true;
            });
        }
        else
        {
            if(context !== null)
            {
                frozen = context.frozen;
            }
        }

        context = new SimulationContext($simulation_inputs.density, $simulation_inputs.spring, $simulation_inputs.grav, $simulation_inputs.steps, frozen);
    }

    function StopSimulation(restore = true)
    {
        stopFunction();
        if(restore) display.Load(snapshot);
        stopFunction = null;
        snapshot = null;
        display.SetDrawable(true);
    }

    onMount(() => {
        frozenChanged = true;
        ConstructContext();
    });

    onDestroy(() => {
        if(stopFunction !== null)
        {
            StopSimulation();
        }
    })

    export function InvalidateOnClear()
    {
        if(stopFunction !== null) StopSimulation(false);
    }

    function ContextChanged()
    {
        if(stopFunction !== null && snapshot != null)
        {
            StopSimulation();
        }

        ConstructContext();
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
            StopSimulation();
        }
    }
</script>

<div id = "settings">
    <div>Radial Density: <input bind:value = {$simulation_inputs.density} on:change = {ContextChanged} type = "number" min = {0.05} max = {50} step = {0.1} /></div>
    <div>Spring Constant: <input bind:value = {$simulation_inputs.spring} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {0} max = {2} step = {0.1} /> {$simulation_inputs.spring}</div>
    <div>Gravity Scale: <input bind:value = {$simulation_inputs.grav} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {0} max = {2} step = {0.1} /> {$simulation_inputs.grav}</div>
    <div>Steps per Second: <input bind:value = {$simulation_inputs.steps} on:mousedown|stopPropagation on:change = {ContextChanged} type = "range" min = {1} max = {120} step = {1} /> {$simulation_inputs.steps}</div>
    <div>Frozen Vertices (space-separated):</div>
    <textarea on:change = {() => {frozenChanged = true; ContextChanged();} } bind:value = {$simulation_inputs.frozen} rows = 3 wrap = off on:mousedown|stopPropagation = {() => {}}></textarea>
</div>
<div id = "controls">
    <button on:click|stopPropagation = {TogglePlayState}>{stopFunction == null ? "Start" : "Stop"}</button>
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

    textarea
    {
        width: 100%;
    }

    #controls
    {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #settings>div
    {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
</style>