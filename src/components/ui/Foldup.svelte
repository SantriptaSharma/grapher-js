<script lang="ts">
import { slide } from "svelte/transition";
import { cubicInOut } from "svelte/easing";
import FaCaretDown from "svelte-icons/fa/FaCaretDown.svelte";
import FaCaretUp from "svelte-icons/fa/FaCaretUp.svelte";

export let title : string;
export let open : boolean = false;
</script>

<div class = "container">
    <h3 style:cursor = "pointer" on:click = {() => open = !open}>{title} <div id = "fold-icon">
        {#if open}
        <FaCaretUp />
        {:else}
        <FaCaretDown />
        {/if}
    </div></h3>
    {#if open}
    <div class = "content" transition:slide|local = {{duration: 240, easing: cubicInOut}}>
        <slot></slot>
    </div>
    {/if}
</div>

<style>
.container
{
    width: 100%;
}

h3
{
    position: relative;
    width: 100%;
    margin: 0;
}

.content 
{
    margin-top: 8px;
}

#fold-icon
{
    width: 22px;
    position: absolute;
    right: 0;
    bottom: -13px;
}
</style>